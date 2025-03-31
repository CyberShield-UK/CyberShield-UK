import remediationService from './remediation.js';

class Dashboard {
    constructor() {
        this.currentTier = null;
        this.filters = {
            status: 'all',
            priority: 'all',
            search: ''
        };
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Status filter
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.updateRemediationList();
        });

        // Priority filter
        document.getElementById('priority-filter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.updateRemediationList();
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.updateRemediationList();
        });

        // Initialize remediation service observer
        remediationService.addObserver(this.updateDashboard.bind(this));
    }

    async initialize(tier) {
        this.currentTier = tier;
        document.getElementById('current-tier').textContent = `Tier ${tier}`;
        
        // Show/hide tier-specific features
        this.updateTierFeatures();
        
        // Initialize remediation service
        await remediationService.initialize(tier);
    }

    updateTierFeatures() {
        // Hide all tier features
        document.querySelectorAll('.tier-features').forEach(feature => {
            feature.style.display = 'none';
        });

        // Show features for current tier
        const tierFeatures = document.getElementById(`tier-${this.currentTier}-features`);
        if (tierFeatures) {
            tierFeatures.style.display = 'block';
        }
    }

    updateDashboard(items) {
        // Update statistics
        this.updateStatistics(items);
        
        // Update remediation list
        this.updateRemediationList();
    }

    updateStatistics(items) {
        // Update total items
        document.getElementById('total-items').textContent = items.length;
        
        // Update completed items
        const completedItems = items.filter(item => item.status === 'Completed').length;
        document.getElementById('completed-items').textContent = completedItems;
        
        // Update in-progress items
        const inProgressItems = items.filter(item => item.status === 'In Progress').length;
        document.getElementById('in-progress-items').textContent = inProgressItems;
        
        // Update critical items
        const criticalItems = items.filter(item => item.priority === 'Critical').length;
        document.getElementById('critical-items').textContent = criticalItems;
    }

    updateRemediationList() {
        const remediationList = document.querySelector('.remediation-list');
        const items = remediationService.remediationItems;
        
        // Apply filters
        let filteredItems = items;
        
        if (this.filters.status !== 'all') {
            filteredItems = filteredItems.filter(item => item.status === this.filters.status);
        }
        
        if (this.filters.priority !== 'all') {
            filteredItems = filteredItems.filter(item => item.priority === this.filters.priority);
        }
        
        if (this.filters.search) {
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(this.filters.search) ||
                item.description.toLowerCase().includes(this.filters.search)
            );
        }

        // Generate HTML for filtered items
        remediationList.innerHTML = filteredItems.map(item => this.createItemCard(item)).join('');
    }

    createItemCard(item) {
        const statusClass = item.status.toLowerCase().replace(' ', '-');
        const priorityClass = item.priority.toLowerCase();
        
        return `
            <div class="remediation-item ${statusClass} ${priorityClass}">
                <div class="item-header">
                    <h3>${item.title}</h3>
                    <span class="priority-badge">${item.priority}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span class="status">${item.status}</span>
                    <span class="complexity">Complexity: ${item.complexity}</span>
                    <span class="estimated-time">Est. ${item.estimated_effort_hours}h</span>
                </div>
                <div class="item-actions">
                    ${this.getTierSpecificActions(item)}
                </div>
            </div>
        `;
    }

    getTierSpecificActions(item) {
        switch (this.currentTier) {
            case '1':
                return `
                    <button class="btn-view-guide" onclick="viewGuide('${item.id}')">
                        <i class="fas fa-book"></i> View Guide
                    </button>
                    <button class="btn-request-support" onclick="requestSupport('${item.id}')">
                        <i class="fas fa-envelope"></i> Request Support
                    </button>
                `;
            case '2':
                return `
                    <button class="btn-schedule-session" onclick="scheduleSession('${item.id}')">
                        <i class="fas fa-video"></i> Schedule Session
                    </button>
                    <button class="btn-contact-specialist" onclick="contactSpecialist('${item.id}')">
                        <i class="fas fa-user-tie"></i> Contact Specialist
                    </button>
                `;
            case '3':
                return `
                    <button class="btn-start-remediation" onclick="startRemediation('${item.id}')">
                        <i class="fas fa-cogs"></i> Start Remediation
                    </button>
                    <button class="btn-request-verification" onclick="requestVerification('${item.id}')">
                        <i class="fas fa-check-circle"></i> Request Verification
                    </button>
                `;
            case '4':
                return `
                    <button class="btn-start-remediation" onclick="startRemediation('${item.id}')">
                        <i class="fas fa-cogs"></i> Start Remediation
                    </button>
                    <button class="btn-request-architect" onclick="requestArchitect('${item.id}')">
                        <i class="fas fa-archway"></i> Request Architect Review
                    </button>
                `;
            default:
                return '';
        }
    }
}

// Initialize dashboard
const dashboard = new Dashboard();

// Initialize with Tier 1 by default (can be changed based on user's subscription)
dashboard.initialize('1');

// Export functions for button click handlers
window.viewGuide = (itemId) => {
    // Implementation for viewing remediation guide
    console.log('Viewing guide for item:', itemId);
};

window.requestSupport = (itemId) => {
    // Implementation for requesting support
    console.log('Requesting support for item:', itemId);
};

window.scheduleSession = (itemId) => {
    // Implementation for scheduling remote session
    console.log('Scheduling session for item:', itemId);
};

window.contactSpecialist = (itemId) => {
    // Implementation for contacting specialist
    console.log('Contacting specialist for item:', itemId);
};

window.startRemediation = (itemId) => {
    // Implementation for starting remediation
    console.log('Starting remediation for item:', itemId);
};

window.requestVerification = (itemId) => {
    // Implementation for requesting verification
    console.log('Requesting verification for item:', itemId);
};

window.requestArchitect = (itemId) => {
    // Implementation for requesting architect review
    console.log('Requesting architect review for item:', itemId);
}; 