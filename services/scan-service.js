const { Pool } = require('pg');
const { logger } = require('../utils/logger');
const { aiService } = require('./ai-service');
const { notificationService } = require('./notification-service');

class ScanService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async startScan(clientId, scanType) {
        try {
            // Get client's digital assets
            const assets = await this.getClientAssets(clientId);
            
            // Initialize scan results
            const scanResults = {
                vulnerabilities: [],
                scanStartTime: new Date(),
                scanEndTime: null
            };

            // Perform different types of scans based on scanType
            switch (scanType) {
                case 'vulnerability':
                    await this.performVulnerabilityScan(assets, scanResults);
                    break;
                case 'compliance':
                    await this.performComplianceScan(assets, scanResults);
                    break;
                case 'penetration':
                    await this.performPenetrationTest(assets, scanResults);
                    break;
                default:
                    throw new Error(`Unsupported scan type: ${scanType}`);
            }

            // Update scan end time
            scanResults.scanEndTime = new Date();

            // Analyze results using AI
            await this.analyzeScanResults(scanResults);

            // Check for critical vulnerabilities
            const criticalVulns = this.findCriticalVulnerabilities(scanResults.vulnerabilities);
            if (criticalVulns.length > 0) {
                await this.handleCriticalVulnerabilities(clientId, criticalVulns);
            }

            return scanResults;
        } catch (error) {
            logger.error('Error during scan:', error);
            throw error;
        }
    }

    async getClientAssets(clientId) {
        const result = await this.pool.query(
            `SELECT * FROM digital_assets 
             WHERE client_id = $1 AND status = 'active'`,
            [clientId]
        );
        return result.rows;
    }

    async performVulnerabilityScan(assets, scanResults) {
        for (const asset of assets) {
            try {
                // Perform basic security checks
                const vulns = await this.checkAssetSecurity(asset);
                scanResults.vulnerabilities.push(...vulns);

                // Perform port scanning
                const portVulns = await this.performPortScan(asset);
                scanResults.vulnerabilities.push(...portVulns);

                // Check for common vulnerabilities
                const commonVulns = await this.checkCommonVulnerabilities(asset);
                scanResults.vulnerabilities.push(...commonVulns);
            } catch (error) {
                logger.error(`Error scanning asset ${asset.id}:`, error);
            }
        }
    }

    async performComplianceScan(assets, scanResults) {
        for (const asset of assets) {
            try {
                // Check GDPR compliance
                const gdprVulns = await this.checkGDPRCompliance(asset);
                scanResults.vulnerabilities.push(...gdprVulns);

                // Check PCI DSS compliance
                const pciVulns = await this.checkPCICompliance(asset);
                scanResults.vulnerabilities.push(...pciVulns);

                // Check other compliance standards
                const otherVulns = await this.checkOtherCompliance(asset);
                scanResults.vulnerabilities.push(...otherVulns);
            } catch (error) {
                logger.error(`Error performing compliance scan for asset ${asset.id}:`, error);
            }
        }
    }

    async performPenetrationTest(assets, scanResults) {
        for (const asset of assets) {
            try {
                // Perform network penetration testing
                const networkVulns = await this.performNetworkPenTest(asset);
                scanResults.vulnerabilities.push(...networkVulns);

                // Perform web application penetration testing
                const webVulns = await this.performWebAppPenTest(asset);
                scanResults.vulnerabilities.push(...webVulns);

                // Perform social engineering tests
                const socialVulns = await this.performSocialEngineeringTest(asset);
                scanResults.vulnerabilities.push(...socialVulns);
            } catch (error) {
                logger.error(`Error performing penetration test for asset ${asset.id}:`, error);
            }
        }
    }

    async checkAssetSecurity(asset) {
        // Implement basic security checks
        const vulnerabilities = [];
        
        // Check SSL/TLS configuration
        const sslVulns = await this.checkSSLConfiguration(asset);
        vulnerabilities.push(...sslVulns);

        // Check security headers
        const headerVulns = await this.checkSecurityHeaders(asset);
        vulnerabilities.push(...headerVulns);

        // Check for outdated software
        const softwareVulns = await this.checkSoftwareVersions(asset);
        vulnerabilities.push(...softwareVulns);

        return vulnerabilities;
    }

    async performPortScan(asset) {
        // Implement port scanning logic
        const vulnerabilities = [];
        
        // Scan common ports
        const openPorts = await this.scanCommonPorts(asset);
        
        // Check for vulnerable services
        for (const port of openPorts) {
            const vulns = await this.checkPortVulnerabilities(asset, port);
            vulnerabilities.push(...vulns);
        }

        return vulnerabilities;
    }

    async checkCommonVulnerabilities(asset) {
        // Implement common vulnerability checks
        const vulnerabilities = [];
        
        // Check for SQL injection vulnerabilities
        const sqlVulns = await this.checkSQLInjection(asset);
        vulnerabilities.push(...sqlVulns);

        // Check for XSS vulnerabilities
        const xssVulns = await this.checkXSS(asset);
        vulnerabilities.push(...xssVulns);

        // Check for CSRF vulnerabilities
        const csrfVulns = await this.checkCSRF(asset);
        vulnerabilities.push(...csrfVulns);

        return vulnerabilities;
    }

    async analyzeScanResults(scanResults) {
        try {
            // Use AI service to analyze vulnerabilities
            const analysis = await aiService.analyzeVulnerabilities(scanResults.vulnerabilities);
            
            // Update vulnerability descriptions with AI insights
            for (const vuln of scanResults.vulnerabilities) {
                const aiInsights = analysis.find(a => a.vulnerabilityId === vuln.id);
                if (aiInsights) {
                    vuln.aiAnalysis = aiInsights.analysis;
                    vuln.recommendedActions = aiInsights.recommendations;
                }
            }
        } catch (error) {
            logger.error('Error analyzing scan results:', error);
        }
    }

    findCriticalVulnerabilities(vulnerabilities) {
        return vulnerabilities.filter(vuln => 
            vuln.severity === 'critical' || 
            (vuln.severity === 'high' && vuln.exploitability === 'easy')
        );
    }

    async handleCriticalVulnerabilities(clientId, vulnerabilities) {
        try {
            // Send immediate notification
            await notificationService.sendCriticalAlert(clientId, vulnerabilities);

            // Create emergency remediation tasks
            for (const vuln of vulnerabilities) {
                await this.createEmergencyTask(clientId, vuln);
            }
        } catch (error) {
            logger.error('Error handling critical vulnerabilities:', error);
        }
    }

    async createEmergencyTask(clientId, vulnerability) {
        const result = await this.pool.query(
            `INSERT INTO remediation_tasks 
             (vulnerability_id, assigned_to, status, priority, due_date)
             VALUES ($1, $2, 'pending', 'high', CURRENT_TIMESTAMP + INTERVAL '24 hours')
             RETURNING *`,
            [vulnerability.id, vulnerability.assignedTo]
        );
        return result.rows[0];
    }
}

// Initialize the scan service
const scanService = new ScanService();

module.exports = { scanService }; 