document.addEventListener('DOMContentLoaded', function() {
    const assessmentForm = document.getElementById('assessmentForm');
    const assessmentModal = document.getElementById('assessmentModal');
    const modal = new bootstrap.Modal(assessmentModal);

    assessmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modal.hide();
                window.location.href = data.redirect_url;
            } else {
                // Handle validation errors
                Object.keys(data.errors).forEach(key => {
                    const input = document.querySelector(`[name="${key}"]`);
                    if (input) {
                        input.classList.add('is-invalid');
                        const feedback = document.createElement('div');
                        feedback.className = 'invalid-feedback';
                        feedback.textContent = data.errors[key][0];
                        input.parentNode.appendChild(feedback);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Clear validation errors when modal is hidden
    assessmentModal.addEventListener('hidden.bs.modal', function () {
        assessmentForm.reset();
        assessmentForm.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
        });
        assessmentForm.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.remove();
        });
    });
}); 