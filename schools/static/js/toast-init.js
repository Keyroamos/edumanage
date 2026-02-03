document.addEventListener('DOMContentLoaded', function() {
    // Initialize all toasts
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer) {
        const toasts = toastContainer.querySelectorAll('.toast');
        toasts.forEach(toastEl => {
            const toast = new bootstrap.Toast(toastEl, {
                animation: true,
                autohide: true,
                delay: 4000
            });
            toast.show();
        });
    }
}); 