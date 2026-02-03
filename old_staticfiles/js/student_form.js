document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        if (!form.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
        }
        form.classList.add('was-validated');
    });

    // Photo preview
    const photoInput = document.getElementById('id_photo');
    const photoPreview = document.querySelector('.profile-placeholder');
    
    photoInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'rounded-circle';
                img.style = 'width: 120px; height: 120px; object-fit: cover;';
                photoPreview.parentNode.replaceChild(img, photoPreview);
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Age validation based on grade
    const dobInput = document.querySelector('[name="date_of_birth"]');
    const gradeSelect = document.querySelector('[name="grade"]');
    
    function validateAge() {
        const dob = new Date(dobInput.value);
        const age = (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365);
        // Add grade-specific age validation logic
    }

    dobInput.addEventListener('change', validateAge);
    gradeSelect.addEventListener('change', validateAge);
}); 