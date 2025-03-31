// Assessment Service Management
class AssessmentService {
    constructor() {
        this.currentAssessment = null;
        this.assessmentHistory = [];
        this.observers = new Set();
        this.scanningInterval = null;
    }

    // Initialize assessment for a client
    async initializeAssessment(clientId) {
        try {
            const response = await fetch(`/api/assessments/${clientId}`);
            if (!response.ok) throw new Error('Failed to initialize assessment');
            
            this.currentAssessment = await response.json();
            this.startContinuousMonitoring();
            this.notifyObservers();
            return this.currentAssessment;
        } catch (error) {
            console.error('Error initializing assessment:', error);
            this.handleError(error);
            throw error;
        }
    }

    // Start continuous monitoring
    startContinuousMonitoring() {
        if (this.scanningInterval) {
            clearInterval(this.scanningInterval);
        }

        // Run initial scan
        this.runAssessment();

        // Set up continuous monitoring (every 24 hours)
        this.scanningInterval = setInterval(() => {
            this.runAssessment();
        }, 24 * 60 * 60 * 1000);
    }

    // Run assessment scan
    async runAssessment() {
        try {
            const response = await fetch('/api/assessments/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: this.currentAssessment.clientId,
                    assets: this.currentAssessment.assets
                })
            });

            if (!response.ok) throw new Error('Failed to run assessment');
            
            const scanResults = await response.json();
            this.updateAssessmentResults(scanResults);
            this.checkForCriticalVulnerabilities(scanResults);
            this.notifyObservers();
        } catch (error) {
            console.error('Error running assessment:', error);
            this.handleError(error);
        }
    }

    // Update assessment results
    updateAssessmentResults(scanResults) {
        if (!this.currentAssessment) return;

        this.currentAssessment.lastScan = new Date().toISOString();
        this.currentAssessment.results = scanResults;
        this.currentAssessment.status = this.calculateAssessmentStatus(scanResults);
        
        // Add to history
        this.assessmentHistory.push({
            timestamp: new Date().toISOString(),
            results: scanResults,
            status: this.currentAssessment.status
        });

        // Keep only last 30 days of history
        if (this.assessmentHistory.length > 30) {
            this.assessmentHistory.shift();
        }
    }

    // Calculate overall assessment status
    calculateAssessmentStatus(results) {
        const criticalCount = results.vulnerabilities.filter(v => v.severity === 'Critical').length;
        const highCount = results.vulnerabilities.filter(v => v.severity === 'High').length;
        const mediumCount = results.vulnerabilities.filter(v => v.severity === 'Medium').length;
        const lowCount = results.vulnerabilities.filter(v => v.severity === 'Low').length;

        if (criticalCount > 0) return 'Critical';
        if (highCount > 0) return 'High';
        if (mediumCount > 0) return 'Medium';
        if (lowCount > 0) return 'Low';
        return 'Secure';
    }

    // Check for critical vulnerabilities
    async checkForCriticalVulnerabilities(results) {
        const criticalVulns = results.vulnerabilities.filter(v => v.severity === 'Critical');
        
        if (criticalVulns.length > 0) {
            await this.sendCriticalAlert(criticalVulns);
        }
    }

    // Send critical vulnerability alert
    async sendCriticalAlert(vulnerabilities) {
        try {
            const response = await fetch('/api/alerts/critical', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: this.currentAssessment.clientId,
                    vulnerabilities,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to send critical alert');
        } catch (error) {
            console.error('Error sending critical alert:', error);
            this.handleError(error);
        }
    }

    // Generate assessment report
    async generateReport(type = 'monthly') {
        try {
            const response = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: this.currentAssessment.clientId,
                    type,
                    assessmentData: this.currentAssessment,
                    history: this.assessmentHistory
                })
            });

            if (!response.ok) throw new Error('Failed to generate report');
            
            const report = await response.json();
            return report;
        } catch (error) {
            console.error('Error generating report:', error);
            this.handleError(error);
            throw error;
        }
    }

    // Get assessment history
    getAssessmentHistory() {
        return this.assessmentHistory;
    }

    // Get current assessment status
    getCurrentStatus() {
        return this.currentAssessment?.status || 'Unknown';
    }

    // Get vulnerability statistics
    getVulnerabilityStats() {
        if (!this.currentAssessment?.results) return null;

        const results = this.currentAssessment.results;
        return {
            total: results.vulnerabilities.length,
            critical: results.vulnerabilities.filter(v => v.severity === 'Critical').length,
            high: results.vulnerabilities.filter(v => v.severity === 'High').length,
            medium: results.vulnerabilities.filter(v => v.severity === 'Medium').length,
            low: results.vulnerabilities.filter(v => v.severity === 'Low').length
        };
    }

    // Add observer for state changes
    addObserver(observer) {
        this.observers.add(observer);
    }

    // Remove observer
    removeObserver(observer) {
        this.observers.delete(observer);
    }

    // Notify all observers of state changes
    notifyObservers() {
        this.observers.forEach(observer => observer(this.currentAssessment));
    }

    // Handle errors
    handleError(error) {
        console.error('Assessment service error:', error);
        // Implement error handling based on severity and type
        // This could include logging, notifications, and automatic recovery attempts
    }

    // Clean up resources
    cleanup() {
        if (this.scanningInterval) {
            clearInterval(this.scanningInterval);
            this.scanningInterval = null;
        }
    }
}

// Initialize the assessment service
const assessmentService = new AssessmentService();

// Export for use in other files
export default assessmentService; 