// Remediation Service Management
class RemediationService {
    constructor() {
        this.currentTier = null;
        this.remediationItems = [];
        this.observers = new Set();
    }

    // Initialize the service with a specific tier
    initialize(tier) {
        this.currentTier = tier;
        this.loadRemediationItems();
        this.notifyObservers();
    }

    // Load remediation items based on current tier
    async loadRemediationItems() {
        try {
            const response = await fetch(`/api/remediation-items?tier=${this.currentTier}`);
            if (!response.ok) throw new Error('Failed to load remediation items');
            this.remediationItems = await response.json();
            this.notifyObservers();
        } catch (error) {
            console.error('Error loading remediation items:', error);
            this.handleError(error);
        }
    }

    // Add a new remediation item
    async addRemediationItem(item) {
        try {
            const response = await fetch('/api/remediation-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            });
            if (!response.ok) throw new Error('Failed to add remediation item');
            const newItem = await response.json();
            this.remediationItems.push(newItem);
            this.notifyObservers();
            return newItem;
        } catch (error) {
            console.error('Error adding remediation item:', error);
            this.handleError(error);
            throw error;
        }
    }

    // Update remediation item status
    async updateItemStatus(itemId, status) {
        try {
            const response = await fetch(`/api/remediation-items/${itemId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Failed to update item status');
            const updatedItem = await response.json();
            this.updateItemInList(updatedItem);
            this.notifyObservers();
            return updatedItem;
        } catch (error) {
            console.error('Error updating item status:', error);
            this.handleError(error);
            throw error;
        }
    }

    // Update item in the local list
    updateItemInList(updatedItem) {
        const index = this.remediationItems.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            this.remediationItems[index] = updatedItem;
        }
    }

    // Get remediation items by status
    getItemsByStatus(status) {
        return this.remediationItems.filter(item => item.status === status);
    }

    // Get remediation items by priority
    getItemsByPriority(priority) {
        return this.remediationItems.filter(item => item.priority === priority);
    }

    // Get completion percentage
    getCompletionPercentage() {
        if (this.remediationItems.length === 0) return 0;
        const completedItems = this.remediationItems.filter(item => item.status === 'Completed').length;
        return (completedItems / this.remediationItems.length) * 100;
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
        this.observers.forEach(observer => observer(this.remediationItems));
    }

    // Handle errors based on service tier
    handleError(error) {
        switch (this.currentTier) {
            case 'Tier 1':
                // Log error and notify user
                console.error('Error in Tier 1:', error);
                this.showNotification('An error occurred. Please check the documentation for guidance.');
                break;
            case 'Tier 2':
                // Log error and notify support
                console.error('Error in Tier 2:', error);
                this.notifySupport(error);
                break;
            case 'Tier 3':
                // Log error and trigger automatic support
                console.error('Error in Tier 3:', error);
                this.triggerAutomaticSupport(error);
                break;
            case 'Tier 4':
                // Log error and trigger premium support
                console.error('Error in Tier 4:', error);
                this.triggerPremiumSupport(error);
                break;
        }
    }

    // Show notification to user
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Notify support team
    notifySupport(error) {
        // Implementation for Tier 2 support notification
        console.log('Notifying support team:', error);
    }

    // Trigger automatic support
    triggerAutomaticSupport(error) {
        // Implementation for Tier 3 automatic support
        console.log('Triggering automatic support:', error);
    }

    // Trigger premium support
    triggerPremiumSupport(error) {
        // Implementation for Tier 4 premium support
        console.log('Triggering premium support:', error);
    }
}

// Initialize the remediation service
const remediationService = new RemediationService();

// Export for use in other files
export default remediationService; 