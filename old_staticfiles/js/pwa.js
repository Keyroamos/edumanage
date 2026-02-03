// PWA functionality
class SchoolMSApp {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineOfflineHandling();
        this.setupBeforeInstallPrompt();
        this.setupAppInstalled();
    }

    // Register service worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/static/js/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Setup install prompt
    setupInstallPrompt() {
        const installButton = document.getElementById('install-app');
        if (installButton) {
            installButton.addEventListener('click', () => {
                this.promptInstall();
            });
        }
    }

    // Setup beforeinstallprompt event
    setupBeforeInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
    }

    // Setup app installed event
    setupAppInstalled() {
        window.addEventListener('appinstalled', (e) => {
            console.log('App was installed');
            this.hideInstallButton();
            this.showInstallSuccessMessage();
        });
    }

    // Show install button
    showInstallButton() {
        const installSection = document.getElementById('pwa-install-section');
        if (installSection) {
            installSection.style.display = 'block';
            installSection.classList.add('animate__animated', 'animate__fadeIn');
        }
    }

    // Hide install button
    hideInstallButton() {
        const installSection = document.getElementById('pwa-install-section');
        if (installSection) {
            installSection.style.display = 'none';
        }
    }

    // Prompt for installation
    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    // Setup online/offline handling
    setupOnlineOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showOnlineMessage();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineMessage();
        });
    }

    // Show online message
    showOnlineMessage() {
        this.showToast('You are back online!', 'success');
    }

    // Show offline message
    showOfflineMessage() {
        this.showToast('You are offline. Some features may be limited.', 'warning');
    }

    // Show update notification
    showUpdateNotification() {
        if (confirm('A new version is available. Would you like to update?')) {
            window.location.reload();
        }
    }

    // Show install success message
    showInstallSuccessMessage() {
        this.showToast('App installed successfully!', 'success');
    }

    // Sync offline data
    async syncOfflineData() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                await navigator.serviceWorker.ready;
                await navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_OFFLINE_DATA'
                });
            } catch (error) {
                console.error('Error syncing offline data:', error);
            }
        }
    }

    // Show toast message
    showToast(message, type = 'info') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                text: message,
                icon: type,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        } else {
            // Fallback to simple alert
            alert(message);
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showToast('Notifications enabled!', 'success');
            }
            return permission;
        }
        return 'denied';
    }

    // Send test notification
    sendTestNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('School Management System', {
                body: 'This is a test notification',
                icon: '/static/favicon/android-chrome-192x192.png'
            });
        }
    }

    // Get app info
    getAppInfo() {
        return {
            isInstalled: window.matchMedia('(display-mode: standalone)').matches,
            isOnline: this.isOnline,
            hasServiceWorker: 'serviceWorker' in navigator,
            hasNotifications: 'Notification' in window,
            notificationPermission: 'Notification' in window ? Notification.permission : 'denied'
        };
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.schoolMSApp = new SchoolMSApp();
    
    // Add PWA info to console
    console.log('School Management System PWA Info:', window.schoolMSApp.getAppInfo());
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
            console.log('Syncing offline data...');
            // Handle offline data sync here
        }
    });
} 