// Add any JavaScript functionality for the teacher list page here
document.addEventListener('DOMContentLoaded', function() {
    // Handle search form
    const searchForm = document.querySelector('form');
    const searchInput = document.querySelector('input[name="search"]');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            if (searchInput.value.trim() === '') {
                searchInput.value = '';
            }
        });
    }

    // Handle grade and subject filters
    const gradeSelect = document.querySelector('select[name="grade"]');
    const subjectSelect = document.querySelector('select[name="subject"]');

    function handleFilterChange() {
        searchForm.submit();
    }

    if (gradeSelect) {
        gradeSelect.addEventListener('change', handleFilterChange);
    }

    if (subjectSelect) {
        subjectSelect.addEventListener('change', handleFilterChange);
    }
}); 