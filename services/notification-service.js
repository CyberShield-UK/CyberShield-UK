const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const { logger } = require('../utils/logger');

class NotificationService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });

        // Initialize email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendAssessmentComplete(clientId, assessmentId) {
        try {
            // Get client and assessment details
            const client = await this.getClientDetails(clientId);
            const assessment = await this.getAssessmentDetails(assessmentId);

            // Prepare email content
            const emailContent = this.generateAssessmentEmail(client, assessment);

            // Send email
            await this.sendEmail({
                to: client.email,
                subject: `Security Assessment Complete - ${client.company_name}`,
                html: emailContent
            });

            // Log notification
            await this.logNotification(clientId, 'assessment_complete', assessmentId);

            return true;
        } catch (error) {
            logger.error('Error sending assessment completion notification:', error);
            throw error;
        }
    }

    async sendCriticalAlert(clientId, vulnerabilities) {
        try {
            // Get client details
            const client = await this.getClientDetails(clientId);

            // Prepare critical alert content
            const alertContent = this.generateCriticalAlertEmail(client, vulnerabilities);

            // Send immediate email
            await this.sendEmail({
                to: client.email,
                subject: '🚨 CRITICAL SECURITY ALERT',
                html: alertContent
            });

            // Send SMS if phone number is available
            if (client.phone) {
                await this.sendSMS(client.phone, this.generateCriticalAlertSMS(vulnerabilities));
            }

            // Log notification
            await this.logNotification(clientId, 'critical_alert', null, vulnerabilities);

            return true;
        } catch (error) {
            logger.error('Error sending critical alert:', error);
            throw error;
        }
    }

    async sendRemediationUpdate(clientId, taskId) {
        try {
            // Get client and task details
            const client = await this.getClientDetails(clientId);
            const task = await this.getTaskDetails(taskId);

            // Prepare update content
            const updateContent = this.generateRemediationUpdateEmail(client, task);

            // Send email
            await this.sendEmail({
                to: client.email,
                subject: `Remediation Update - ${client.company_name}`,
                html: updateContent
            });

            // Log notification
            await this.logNotification(clientId, 'remediation_update', taskId);

            return true;
        } catch (error) {
            logger.error('Error sending remediation update:', error);
            throw error;
        }
    }

    async sendMonthlyReport(clientId, reportId) {
        try {
            // Get client and report details
            const client = await this.getClientDetails(clientId);
            const report = await this.getReportDetails(reportId);

            // Prepare report content
            const reportContent = this.generateMonthlyReportEmail(client, report);

            // Send email with PDF attachment
            await this.sendEmail({
                to: client.email,
                subject: `Monthly Security Report - ${client.company_name}`,
                html: reportContent,
                attachments: [{
                    filename: `security_report_${report.month}.pdf`,
                    path: report.pdf_path
                }]
            });

            // Log notification
            await this.logNotification(clientId, 'monthly_report', reportId);

            return true;
        } catch (error) {
            logger.error('Error sending monthly report:', error);
            throw error;
        }
    }

    async getClientDetails(clientId) {
        const result = await this.pool.query(
            `SELECT * FROM clients WHERE id = $1`,
            [clientId]
        );
        return result.rows[0];
    }

    async getAssessmentDetails(assessmentId) {
        const result = await this.pool.query(
            `SELECT a.*, 
                    COUNT(v.id) as vulnerability_count,
                    COUNT(CASE WHEN v.severity = 'critical' THEN 1 END) as critical_count
             FROM assessments a
             LEFT JOIN vulnerabilities v ON a.id = v.assessment_id
             WHERE a.id = $1
             GROUP BY a.id`,
            [assessmentId]
        );
        return result.rows[0];
    }

    async getTaskDetails(taskId) {
        const result = await this.pool.query(
            `SELECT t.*, v.title as vulnerability_title, v.severity
             FROM remediation_tasks t
             JOIN vulnerabilities v ON t.vulnerability_id = v.id
             WHERE t.id = $1`,
            [taskId]
        );
        return result.rows[0];
    }

    async getReportDetails(reportId) {
        const result = await this.pool.query(
            `SELECT * FROM reports WHERE id = $1`,
            [reportId]
        );
        return result.rows[0];
    }

    async sendEmail({ to, subject, html, attachments = [] }) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject,
            html,
            attachments
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendSMS(phone, message) {
        // Implement SMS sending logic using a service like Twilio
        // This is a placeholder for the actual implementation
        logger.info(`Sending SMS to ${phone}: ${message}`);
    }

    async logNotification(clientId, type, referenceId, details = null) {
        await this.pool.query(
            `INSERT INTO notifications 
             (client_id, type, reference_id, details, created_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
            [clientId, type, referenceId, details ? JSON.stringify(details) : null]
        );
    }

    generateAssessmentEmail(client, assessment) {
        return `
            <h2>Security Assessment Complete</h2>
            <p>Dear ${client.contact_name},</p>
            <p>We have completed the security assessment for ${client.company_name}.</p>
            <h3>Assessment Summary:</h3>
            <ul>
                <li>Total Vulnerabilities: ${assessment.vulnerability_count}</li>
                <li>Critical Issues: ${assessment.critical_count}</li>
                <li>Completion Date: ${new Date(assessment.end_date).toLocaleDateString()}</li>
            </ul>
            <p>Please log in to your dashboard to view the detailed report and recommended actions.</p>
            <p>Best regards,<br>CyberShield UK Team</p>
        `;
    }

    generateCriticalAlertEmail(client, vulnerabilities) {
        return `
            <h2>🚨 CRITICAL SECURITY ALERT</h2>
            <p>Dear ${client.contact_name},</p>
            <p>We have detected critical security vulnerabilities in your systems that require immediate attention.</p>
            <h3>Critical Issues Found:</h3>
            <ul>
                ${vulnerabilities.map(vuln => `
                    <li>${vuln.title} (Severity: ${vuln.severity})</li>
                `).join('')}
            </ul>
            <p>Our security team has been notified and will begin addressing these issues immediately.</p>
            <p>Please log in to your dashboard for more details and recommended actions.</p>
            <p>Best regards,<br>CyberShield UK Team</p>
        `;
    }

    generateCriticalAlertSMS(vulnerabilities) {
        return `CRITICAL ALERT: ${vulnerabilities.length} critical vulnerabilities detected. Check your dashboard for details.`;
    }

    generateRemediationUpdateEmail(client, task) {
        return `
            <h2>Remediation Update</h2>
            <p>Dear ${client.contact_name},</p>
            <p>We have an update regarding the remediation of a security vulnerability.</p>
            <h3>Task Details:</h3>
            <ul>
                <li>Vulnerability: ${task.vulnerability_title}</li>
                <li>Severity: ${task.severity}</li>
                <li>Status: ${task.status}</li>
                <li>Due Date: ${new Date(task.due_date).toLocaleDateString()}</li>
            </ul>
            <p>Please log in to your dashboard for more details.</p>
            <p>Best regards,<br>CyberShield UK Team</p>
        `;
    }

    generateMonthlyReportEmail(client, report) {
        return `
            <h2>Monthly Security Report</h2>
            <p>Dear ${client.contact_name},</p>
            <p>Please find attached your monthly security report for ${client.company_name}.</p>
            <p>The report includes:</p>
            <ul>
                <li>Security assessment results</li>
                <li>Vulnerability trends</li>
                <li>Compliance status</li>
                <li>Recommended actions</li>
            </ul>
            <p>Please review the attached PDF report for detailed information.</p>
            <p>Best regards,<br>CyberShield UK Team</p>
        `;
    }
}

// Initialize the notification service
const notificationService = new NotificationService();

module.exports = { notificationService }; 