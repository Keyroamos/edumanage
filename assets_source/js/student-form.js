// Form validation and progress tracking
document.addEventListener('DOMContentLoaded', function() {
    const formSections = document.querySelectorAll('.card');
    const progressBar = document.getElementById('formProgress');
    const steps = document.querySelectorAll('.step');
    
    // Photo handling functions
    function handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must not exceed 2MB');
                event.target.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const photoPreview = document.getElementById('photoPreview');
                const photoPlaceholder = document.getElementById('photoPlaceholder');
                
                if (photoPreview) {
                    photoPreview.src = e.target.result;
                    photoPreview.classList.remove('d-none');
                }
                if (photoPlaceholder) {
                    photoPlaceholder.classList.add('d-none');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function handlePhotoRemoval() {
        const photoInput = document.getElementById('id_photo');
        const photoPreview = document.getElementById('photoPreview');
        const photoPlaceholder = document.getElementById('photoPlaceholder');
        
        if (photoInput) photoInput.value = '';
        if (photoPreview) {
            photoPreview.src = '';
            photoPreview.classList.add('d-none');
        }
        if (photoPlaceholder) {
            photoPlaceholder.classList.remove('d-none');
        }

        // Add hidden input for photo removal
        const removePhotoInput = document.createElement('input');
        removePhotoInput.type = 'hidden';
        removePhotoInput.name = 'remove_photo';
        removePhotoInput.value = 'true';
        photoInput.parentNode.appendChild(removePhotoInput);
    }

    function updateProgress() {
        const totalFields = document.querySelectorAll('input:required, select:required').length;
        const filledFields = document.querySelectorAll('input:required:valid, select:required:valid').length;
        const progress = (filledFields / totalFields) * 100;
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update steps
        steps.forEach((step, index) => {
            const stepIcon = step.querySelector('.step-icon');
            if (progress >= (index + 1) * (100 / 3)) {
                stepIcon.classList.remove('bg-light', 'text-muted');
                stepIcon.classList.add('bg-primary', 'text-white');
                step.classList.add('active');
            } else {
                stepIcon.classList.add('bg-light', 'text-muted');
                stepIcon.classList.remove('bg-primary', 'text-white');
                step.classList.remove('active');
            }
        });
    }

    // Initialize photo handling
    const photoInput = document.getElementById('id_photo');
    const removePhotoBtn = document.getElementById('removePhoto');
    
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', handlePhotoRemoval);
    }

    // Form validation
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(form);
            
            // Clear previous errors
            form.querySelectorAll('.is-invalid').forEach(field => {
                field.classList.remove('is-invalid');
            });
            form.querySelectorAll('.invalid-feedback').forEach(feedback => {
                feedback.textContent = '';
            });
            
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Show success toast
                    const toast = new bootstrap.Toast(document.querySelector('.toast'));
                    document.querySelector('.toast-header').classList.add('bg-success');
                    document.querySelector('.toast-body').textContent = data.message;
                    toast.show();
                    
                    // Wait for toast to show before redirecting
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 1000);
                } else {
                    // Show error toast
                    const toast = new bootstrap.Toast(document.querySelector('.toast'));
                    document.querySelector('.toast-header').classList.add('bg-danger');
                    document.querySelector('.toast-body').textContent = 'Please correct the errors below.';
                    toast.show();
                    
                    // Handle validation errors
                    Object.keys(data.errors).forEach(field => {
                        const input = form.querySelector(`[name="${field}"]`);
                        if (input) {
                            input.classList.add('is-invalid');
                            const feedbackDiv = input.parentElement.querySelector('.invalid-feedback') || 
                                createFeedbackDiv(input.parentElement);
                            feedbackDiv.textContent = data.errors[field].join(', ');
                            
                            // Scroll to first error
                            if (field === Object.keys(data.errors)[0]) {
                                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                input.focus();
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Show error toast
                const toast = new bootstrap.Toast(document.querySelector('.toast'));
                document.querySelector('.toast-header').classList.add('bg-danger');
                document.querySelector('.toast-body').textContent = 'An error occurred. Please try again.';
                toast.show();
            });
        });
    }

    // Helper function to create feedback div if it doesn't exist
    function createFeedbackDiv(parent) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        parent.appendChild(feedbackDiv);
        return feedbackDiv;
    }

    // Initialize progress
    updateProgress();
    
    // Add input listeners for progress updates
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', updateProgress);
        input.addEventListener('keyup', updateProgress);
    });

    // Real-time validation feedback
    document.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else if (this.hasAttribute('required')) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    });
}); 