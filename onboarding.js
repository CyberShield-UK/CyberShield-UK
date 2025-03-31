// Onboarding Process Management
class OnboardingProcess {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {
            businessInfo: {},
            digitalAssets: [],
            consultation: {}
        };
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Business Info Form
        document.getElementById('business-info-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBusinessInfo();
            this.nextStep();
        });

        // Digital Assets Form
        document.getElementById('website-url').addEventListener('change', (e) => {
            this.formData.digitalAssets = [];
            this.updateAssetList();
        });

        // Consultation Form
        document.querySelector('.consultation-scheduling').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConsultationInfo();
            this.completeOnboarding();
        });

        // Navigation Buttons
        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', () => this.previousStep());
        });

        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
    }

    saveBusinessInfo() {
        this.formData.businessInfo = {
            companyName: document.getElementById('company-name').value,
            industry: document.getElementById('industry').value,
            companySize: document.getElementById('company-size').value,
            primaryContact: document.getElementById('primary-contact').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
    }

    async scanWebsite() {
        const url = document.getElementById('website-url').value;
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch('/api/scan-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error('Failed to scan website');
            
            const assets = await response.json();
            this.formData.digitalAssets = assets;
            this.updateAssetList();
        } catch (error) {
            this.showError('Failed to scan website. Please try again.');
            console.error('Scan error:', error);
        } finally {
            this.hideLoading();
        }
    }

    updateAssetList() {
        const assetGrid = document.querySelector('.asset-grid');
        assetGrid.innerHTML = this.formData.digitalAssets.map(asset => `
            <div class="asset-card">
                <i class="fas ${this.getAssetIcon(asset.type)}"></i>
                <h4>${asset.name}</h4>
                <p>${asset.type}</p>
                <span class="asset-status ${asset.status}">${asset.status}</span>
            </div>
        `).join('');
    }

    getAssetIcon(type) {
        const icons = {
            website: 'fa-globe',
            subdomain: 'fa-sitemap',
            cloud: 'fa-cloud',
            server: 'fa-server',
            database: 'fa-database'
        };
        return icons[type] || 'fa-question-circle';
    }

    saveConsultationInfo() {
        this.formData.consultation = {
            preferredDate: document.getElementById('preferred-date').value,
            preferredTime: document.getElementById('preferred-time').value,
            securityConcerns: document.getElementById('security-concerns').value,
            complianceRequirements: Array.from(document.querySelectorAll('input[name="compliance"]:checked'))
                .map(checkbox => checkbox.value)
        };
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === this.currentStep);
            step.classList.toggle('completed', stepNum < this.currentStep);
        });

        // Update step panels
        document.querySelectorAll('.step-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `step-${this.currentStep}`);
        });
    }

    async completeOnboarding() {
        try {
            this.showLoading();
            const response = await fetch('/api/complete-onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData)
            });

            if (!response.ok) throw new Error('Failed to complete onboarding');
            
            const result = await response.json();
            this.showSuccess('Onboarding completed successfully!');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
        } catch (error) {
            this.showError('Failed to complete onboarding. Please try again.');
            console.error('Onboarding error:', error);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('loading');
        });
    }

    hideLoading() {
        document.querySelectorAll('button').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('loading');
        });
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
    }
}

// Initialize the onboarding process
const onboarding = new OnboardingProcess();

// Export for use in other files
export default onboarding; 