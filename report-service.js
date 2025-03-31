// Report Generation Service
class ReportService {
    constructor() {
        this.reportTemplates = {
            monthly: this.getMonthlyTemplate(),
            quarterly: this.getQuarterlyTemplate(),
            annual: this.getAnnualTemplate()
        };
    }

    // Generate report based on type
    async generateReport(type, data) {
        try {
            const template = this.reportTemplates[type];
            if (!template) throw new Error(`Invalid report type: ${type}`);

            const report = await this.processTemplate(template, data);
            const pdf = await this.generatePDF(report);
            return pdf;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    // Process template with data
    async processTemplate(template, data) {
        // Replace placeholders with actual data
        let processedTemplate = template;

        // Add executive summary
        processedTemplate = processedTemplate.replace(
            '{{executive_summary}}',
            this.generateExecutiveSummary(data)
        );

        // Add vulnerability statistics
        processedTemplate = processedTemplate.replace(
            '{{vulnerability_stats}}',
            this.generateVulnerabilityStats(data)
        );

        // Add trend analysis
        processedTemplate = processedTemplate.replace(
            '{{trend_analysis}}',
            this.generateTrendAnalysis(data)
        );

        // Add recommendations
        processedTemplate = processedTemplate.replace(
            '{{recommendations}}',
            this.generateRecommendations(data)
        );

        // Add compliance status
        processedTemplate = processedTemplate.replace(
            '{{compliance_status}}',
            this.generateComplianceStatus(data)
        );

        return processedTemplate;
    }

    // Generate executive summary
    generateExecutiveSummary(data) {
        const stats = data.vulnerabilityStats;
        const status = data.currentStatus;

        return `
            <h2>Executive Summary</h2>
            <p>This report provides an overview of your organization's security posture for the period ending ${new Date().toLocaleDateString()}.</p>
            
            <h3>Key Findings</h3>
            <ul>
                <li>Overall Security Status: <strong>${status}</strong></li>
                <li>Total Vulnerabilities: ${stats.total}</li>
                <li>Critical Issues: ${stats.critical}</li>
                <li>High Priority Issues: ${stats.high}</li>
            </ul>

            <h3>Risk Assessment</h3>
            <p>${this.generateRiskAssessment(stats)}</p>
        `;
    }

    // Generate vulnerability statistics
    generateVulnerabilityStats(data) {
        const stats = data.vulnerabilityStats;
        const history = data.assessmentHistory;

        return `
            <h2>Vulnerability Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card critical">
                    <h3>Critical</h3>
                    <p>${stats.critical}</p>
                </div>
                <div class="stat-card high">
                    <h3>High</h3>
                    <p>${stats.high}</p>
                </div>
                <div class="stat-card medium">
                    <h3>Medium</h3>
                    <p>${stats.medium}</p>
                </div>
                <div class="stat-card low">
                    <h3>Low</h3>
                    <p>${stats.low}</p>
                </div>
            </div>

            <h3>Vulnerability Distribution</h3>
            <div class="chart-container">
                ${this.generateVulnerabilityChart(stats)}
            </div>
        `;
    }

    // Generate trend analysis
    generateTrendAnalysis(data) {
        const history = data.assessmentHistory;
        
        return `
            <h2>Security Trend Analysis</h2>
            <div class="trend-chart">
                ${this.generateTrendChart(history)}
            </div>

            <h3>Key Trends</h3>
            <ul>
                ${this.analyzeTrends(history)}
            </ul>
        `;
    }

    // Generate recommendations
    generateRecommendations(data) {
        const vulnerabilities = data.currentAssessment.results.vulnerabilities;
        
        return `
            <h2>Security Recommendations</h2>
            <div class="recommendations">
                ${this.prioritizeRecommendations(vulnerabilities)}
            </div>

            <h3>Action Items</h3>
            <div class="action-items">
                ${this.generateActionItems(vulnerabilities)}
            </div>
        `;
    }

    // Generate compliance status
    generateComplianceStatus(data) {
        const compliance = data.complianceRequirements;
        
        return `
            <h2>Compliance Status</h2>
            <div class="compliance-grid">
                ${this.generateComplianceGrid(compliance)}
            </div>

            <h3>Compliance Recommendations</h3>
            <div class="compliance-recommendations">
                ${this.generateComplianceRecommendations(compliance)}
            </div>
        `;
    }

    // Generate PDF from HTML
    async generatePDF(html) {
        try {
            const response = await fetch('/api/reports/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html })
            });

            if (!response.ok) throw new Error('Failed to generate PDF');
            
            const pdf = await response.blob();
            return pdf;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    // Get monthly report template
    getMonthlyTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Monthly Security Report</title>
                <style>
                    /* Add PDF-friendly styles */
                </style>
            </head>
            <body>
                <header>
                    <h1>Monthly Security Report</h1>
                    <p>Generated on: {{date}}</p>
                </header>

                {{executive_summary}}
                {{vulnerability_stats}}
                {{recommendations}}
            </body>
            </html>
        `;
    }

    // Get quarterly report template
    getQuarterlyTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Quarterly Security Report</title>
                <style>
                    /* Add PDF-friendly styles */
                </style>
            </head>
            <body>
                <header>
                    <h1>Quarterly Security Report</h1>
                    <p>Generated on: {{date}}</p>
                </header>

                {{executive_summary}}
                {{vulnerability_stats}}
                {{trend_analysis}}
                {{recommendations}}
                {{compliance_status}}
            </body>
            </html>
        `;
    }

    // Get annual report template
    getAnnualTemplate() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Annual Security Report</title>
                <style>
                    /* Add PDF-friendly styles */
                </style>
            </head>
            <body>
                <header>
                    <h1>Annual Security Report</h1>
                    <p>Generated on: {{date}}</p>
                </header>

                {{executive_summary}}
                {{vulnerability_stats}}
                {{trend_analysis}}
                {{recommendations}}
                {{compliance_status}}
                
                <section class="long-term-planning">
                    <h2>Long-term Security Planning</h2>
                    {{long_term_planning}}
                </section>
            </body>
            </html>
        `;
    }

    // Helper methods for report generation
    generateRiskAssessment(stats) {
        if (stats.critical > 0) {
            return 'Your organization is currently at high risk due to critical vulnerabilities that require immediate attention.';
        } else if (stats.high > 0) {
            return 'Your organization has several high-priority issues that should be addressed promptly.';
        } else if (stats.medium > 0) {
            return 'Your organization has some medium-priority issues that should be addressed in the near future.';
        } else {
            return 'Your organization is maintaining a good security posture with no high or critical vulnerabilities.';
        }
    }

    generateVulnerabilityChart(stats) {
        // Implementation for generating vulnerability distribution chart
        return '<div class="chart">Chart implementation</div>';
    }

    generateTrendChart(history) {
        // Implementation for generating trend chart
        return '<div class="chart">Trend chart implementation</div>';
    }

    analyzeTrends(history) {
        // Implementation for analyzing security trends
        return '<li>Trend analysis implementation</li>';
    }

    prioritizeRecommendations(vulnerabilities) {
        // Implementation for prioritizing security recommendations
        return '<div class="recommendation">Recommendations implementation</div>';
    }

    generateActionItems(vulnerabilities) {
        // Implementation for generating action items
        return '<div class="action-item">Action items implementation</div>';
    }

    generateComplianceGrid(compliance) {
        // Implementation for generating compliance grid
        return '<div class="compliance-item">Compliance grid implementation</div>';
    }

    generateComplianceRecommendations(compliance) {
        // Implementation for generating compliance recommendations
        return '<div class="compliance-recommendation">Compliance recommendations implementation</div>';
    }
}

// Initialize the report service
const reportService = new ReportService();

// Export for use in other files
export default reportService; 