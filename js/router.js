class Router {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/services': 'services.html',
            '/about': 'about.html',
            '/contact': 'contact.html',
            '/onboarding': 'onboarding.html',
            '/remediation-dashboard': 'remediation-dashboard.html'
        };
        
        this.repoName = '/CyberShield-UK'; // Updated to match the actual repository name
        
        // Handle navigation
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle initial load
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname.replace(this.repoName, '');
        const targetFile = this.routes[path] || 'index.html';
        
        // Update active link in navigation
        this.updateActiveLink(path);
        
        // Load content
        this.loadContent(targetFile);
    }

    updateActiveLink(path) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });
    }

    loadContent(file) {
        fetch(file)
            .then(response => response.text())
            .then(html => {
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.innerHTML = html;
                }
                
                // Reinitialize any necessary scripts
                if (typeof initializeApp === 'function') {
                    initializeApp();
                }
            })
            .catch(error => {
                console.error('Error loading page:', error);
                this.showError();
            });
    }

    showError() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="${this.repoName}/" class="btn">Return to Home</a>
                </div>
            `;
        }
    }

    navigate(path) {
        const fullPath = this.repoName + path;
        window.history.pushState({}, '', fullPath);
        this.handleRoute();
    }
}

// Initialize router
const router = new Router();

// Export for use in other files
window.router = router; 