document.addEventListener('DOMContentLoaded', function() {
    const allSubjectsCheckbox = document.getElementById('id_all_subjects');
    const subjectsSelect = document.getElementById('id_subjects');
    const gradeSelect = document.getElementById('id_grade');

    if (allSubjectsCheckbox && subjectsSelect) {
        // Function to toggle subjects select field
        function toggleSubjectsSelect() {
            subjectsSelect.disabled = allSubjectsCheckbox.checked;
            if (allSubjectsCheckbox.checked) {
                // Deselect all options when "All Subjects" is checked
                Array.from(subjectsSelect.options).forEach(option => {
                    option.selected = false;
                });
            }
        }

        // Initial state
        toggleSubjectsSelect();

        // Add event listener
        allSubjectsCheckbox.addEventListener('change', toggleSubjectsSelect);
    }

    // Grade-dependent subject filtering
    if (gradeSelect && subjectsSelect) {
        gradeSelect.addEventListener('change', function() {
            const gradeId = this.value;
            if (gradeId) {
                fetch(`/api/grades/${gradeId}/subjects/`)
                    .then(response => response.json())
                    .then(data => {
                        // Clear current options
                        subjectsSelect.innerHTML = '';
                        
                        // Add new options
                        data.subjects.forEach(subject => {
                            const option = new Option(subject.name, subject.id);
                            subjectsSelect.add(option);
                        });
                    })
                    .catch(error => console.error('Error:', error));
            }
        });
    }

    // User account toggle
    const accountCheckbox = document.querySelector('#id_create_user_account');
    const accountFields = document.querySelector('#account-fields');
    
    function toggleAccountFields() {
        if (accountCheckbox) {
            accountFields.style.display = accountCheckbox.checked ? 'flex' : 'none';
        }
    }
    
    if (accountCheckbox) {
        accountCheckbox.addEventListener('change', toggleAccountFields);
        toggleAccountFields(); // Initial state
    }

    // Form validation
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    }
}); 