const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { scanService } = require('../services/scan-service');

// Initialize database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Get all assessments for a client
router.get('/client/:clientId', authenticateToken, async (req, res) => {
    try {
        const { clientId } = req.params;
        const result = await pool.query(
            `SELECT a.*, 
                    COUNT(v.id) as vulnerability_count,
                    COUNT(CASE WHEN v.severity = 'critical' THEN 1 END) as critical_count
             FROM assessments a
             LEFT JOIN vulnerabilities v ON a.id = v.assessment_id
             WHERE a.client_id = $1
             GROUP BY a.id
             ORDER BY a.created_at DESC`,
            [clientId]
        );
        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get assessment details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT a.*, 
                    c.company_name,
                    c.contact_name,
                    c.email as client_email
             FROM assessments a
             JOIN clients c ON a.client_id = c.id
             WHERE a.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        const assessment = result.rows[0];
        
        // Get vulnerabilities for this assessment
        const vulnerabilities = await pool.query(
            `SELECT v.*, da.asset_name, da.asset_type
             FROM vulnerabilities v
             JOIN digital_assets da ON v.asset_id = da.id
             WHERE v.assessment_id = $1
             ORDER BY 
                CASE v.severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END`,
            [id]
        );

        assessment.vulnerabilities = vulnerabilities.rows;
        res.json(assessment);
    } catch (error) {
        logger.error('Error fetching assessment details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new assessment
router.post('/', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { clientId, scanType } = req.body;
        
        // Create assessment record
        const assessmentResult = await client.query(
            `INSERT INTO assessments (client_id, status, scan_type, start_date)
             VALUES ($1, 'in_progress', $2, CURRENT_TIMESTAMP)
             RETURNING id`,
            [clientId, scanType]
        );
        
        const assessmentId = assessmentResult.rows[0].id;
        
        // Start the scan
        const scanResult = await scanService.startScan(clientId, scanType);
        
        // Update assessment with scan results
        await client.query(
            `UPDATE assessments 
             SET status = 'completed',
                 end_date = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [assessmentId]
        );
        
        // Insert vulnerabilities
        for (const vuln of scanResult.vulnerabilities) {
            await client.query(
                `INSERT INTO vulnerabilities 
                 (assessment_id, asset_id, title, description, severity, remediation_steps)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [assessmentId, vuln.assetId, vuln.title, vuln.description, 
                 vuln.severity, vuln.remediationSteps]
            );
        }
        
        await client.query('COMMIT');
        
        // Send notification to client
        await notificationService.sendAssessmentComplete(clientId, assessmentId);
        
        res.status(201).json({ 
            message: 'Assessment completed successfully',
            assessmentId 
        });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating assessment:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// Update assessment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await pool.query(
            `UPDATE assessments 
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error updating assessment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete assessment
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            `DELETE FROM assessments 
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json({ message: 'Assessment deleted successfully' });
    } catch (error) {
        logger.error('Error deleting assessment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 