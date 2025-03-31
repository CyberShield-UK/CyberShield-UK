class Router {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/about': 'about.html',
            '/services': 'features.html',
            '/contact': 'contact.html',
            '/pricing': 'pricing.html',
            '/dashboard': 'dashboard.html',
            '/onboarding': 'onboarding.html',
            '/remediation': 'remediation-dashboard.html',
            '/login': 'login.html'
        };
        
        this.init();
    }

    init() {
        // Handle initial load
        window.addEventListener('load', () => this.handleRoute());

        // Handle navigation
        window.addEventListener('popstate', () => this.handleRoute());

        // Handle link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="/"]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }

    async handleRoute() {
        const path = window.location.pathname;
        const page = this.routes[path] || '404.html';
        
        try {
            const response = await fetch(page);
            if (!response.ok) throw new Error('Page not found');
            
            const content = await response.text();
            document.body.innerHTML = content;
            
            // Reinitialize scripts
            this.initializeScripts();
        } catch (error) {
            console.error('Error loading page:', error);
            window.location.href = '/404.html';
        }
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    initializeScripts() {
        // Re-initialize any necessary scripts
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        }
        if (typeof initializeOnboarding === 'function') {
            initializeOnboarding();
        }
        if (typeof initializeRemediation === 'function') {
            initializeRemediation();
        }
    }
}

// Initialize router
const router = new Router();

// Export for use in other files
window.router = router; 