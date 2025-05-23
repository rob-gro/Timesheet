document.addEventListener('DOMContentLoaded', function () {
    console.log('JS loaded');
    const token = document.querySelector('meta[name="_csrf"]').content;
    const header = document.querySelector('meta[name="_csrf_header"]').content;
    const filterForm = document.getElementById('filterForm');
    const fromYear = document.getElementById('fromYear');
    const fromMonth = document.getElementById('fromMonth');
    const toYear = document.getElementById('toYear');
    const toMonth = document.getElementById('toMonth');
    const dateRangeError = document.getElementById('dateRangeError');

    function validateDateRange() {
        if (!fromYear.value || !fromMonth.value || !toYear.value || !toMonth.value) {
            return true;
        }

        const fromDate = new Date(fromYear.value, fromMonth.value - 1);
        const toDate = new Date(toYear.value, toMonth.value - 1);

        const monthDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12
            + toDate.getMonth() - fromDate.getMonth();

        if (monthDiff < 0) {
            dateRangeError.textContent = 'End date cannot be earlier than start date';
            return false;
        }
        return true;
    }

    function updateDateRangeValidation() {
        const isValid = validateDateRange();
        dateRangeError.style.display = isValid ? 'none' : 'block';
        return isValid;
    }

    [fromYear, fromMonth, toYear, toMonth].forEach(element => {
        element.addEventListener('change', updateDateRangeValidation);
    });

    filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateDateRange()) {
            return;
        }

        const formData = new FormData(this);
        const params = new URLSearchParams();

        for (let [key, value] of formData.entries()) {
            if (value) {
                params.append(key, value);
            }
        }
        params.set('page', 0);
        window.location.href = '/invoices/archive?' + params.toString();
    });

    window.sortTable = function (column, direction) {
        const currentUrl = new URL(window.location.href);

        const params = {
            clientId: currentUrl.searchParams.get('clientId'),
            fromYear: currentUrl.searchParams.get('fromYear'),
            fromMonth: currentUrl.searchParams.get('fromMonth'),
            toYear: currentUrl.searchParams.get('toYear'),
            toMonth: currentUrl.searchParams.get('toMonth'),
            size: currentUrl.searchParams.get('size') || '10',
            page: '0',
            sortBy: column,
            sortDir: direction
        };

        const newUrl = new URL('/invoices/archive', window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value) newUrl.searchParams.set(key, value);
        });

        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.classList.remove('active');
        });

        const activeIcon = document.querySelector(
            `.sort-icon[data-column="${column}"][data-direction="${direction}"]`
        );
        if (activeIcon) {
            activeIcon.classList.add('active');
        }

        window.location.href = newUrl.toString();
    };
    window.deleteInvoice = function (id) {
        Swal.fire({
            title: 'Delete Invoice?',
            text: 'Are you sure you want to delete this invoice?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Delete associated timesheets?',
                    text: 'Do you also want to delete the timesheets associated with this invoice?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then((innerResult) => {
                    const deleteTimesheets = innerResult.isConfirmed;

                    console.log(`Trying to delete invoice ${id}`);
                    const url = `/api/v1/invoices/${id}/delete?deleteTimesheets=${deleteTimesheets}&detachFromClient=${deleteTimesheets}`;
                    console.log(`Request URL: ${url}`);

                    Swal.fire({
                        title: 'Deleting...',
                        text: 'Please wait while the invoice is being deleted',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            [header]: token
                        }
                    })
                        .then(response => {
                            console.log(`Response status: ${response.status}`);

                            if (response.ok) {
                                Swal.fire({
                                    title: 'Success!',
                                    text: 'Invoice has been deleted.',
                                    icon: 'success'
                                }).then(() => {
                                    location.reload();
                                });
                            } else {
                                return response.text().then(text => {
                                    throw new Error(text || `Server returned ${response.status}`);
                                });
                            }
                        })
                        .catch(error => {
                            console.error(`Error: ${error.message}`);
                            Swal.fire({
                                title: 'Error!',
                                text: `Failed to delete invoice: ${error.message}`,
                                icon: 'error'
                            });
                        });
                });
            }
        });
    };

    const currentUrl = new URL(window.location.href);
    const sortBy = currentUrl.searchParams.get('sortBy');
    const sortDir = currentUrl.searchParams.get('sortDir');

    if (sortBy && sortDir) {
        const activeIcon = document.querySelector(
            `.sort-icon[data-column="${sortBy}"][data-direction="${sortDir}"]`
        );
        if (activeIcon) {
            activeIcon.classList.add('active');
        }
    }
});
