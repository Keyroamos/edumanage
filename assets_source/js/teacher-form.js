document.addEventListener('DOMContentLoaded', function() {
    // Profile picture preview
    const profileInput = document.querySelector('input[type="file"]');
    const previewElement = document.getElementById('profile-preview');

    if (profileInput && previewElement) {
        profileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (previewElement.tagName === 'IMG') {
                        previewElement.src = e.target.result;
                    } else {
                        // Create new img element
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.id = 'profile-preview';
                        img.className = 'rounded-circle mb-3';
                        img.style = 'width: 150px; height: 150px; object-fit: cover;';
                        previewElement.parentNode.replaceChild(img, previewElement);
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const isClassTeacherCheckbox = document.querySelector('#id_is_class_teacher');
    const assignedClassSection = document.querySelector('#assignedClassSection');

    function toggleAssignedClass() {
        if (isClassTeacherCheckbox.checked) {
            assignedClassSection.style.display = 'block';
        } else {
            assignedClassSection.style.display = 'none';
        }
    }

    // Initial state
    toggleAssignedClass();

    // Listen for changes
    isClassTeacherCheckbox.addEventListener('change', toggleAssignedClass);
}); 