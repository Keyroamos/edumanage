// Initialize toasts
document.addEventListener('DOMContentLoaded', function() {
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

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 