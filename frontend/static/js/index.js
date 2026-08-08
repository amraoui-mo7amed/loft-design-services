// Dealing with forms
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.form');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const formId = form.id;
            const errorContainer = document.querySelector(`#errorContainer[form_id="${formId}"]`);
            const errorList = errorContainer ? errorContainer.querySelector('#errorList') : document.querySelector('#errorList');
            const submitBtn = form.querySelector('[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;

            if (errorList) {
                errorList.innerHTML = '';
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    ${originalBtnContent}
`;

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                });

                const data = await response.json();

                if (data.success) {
                    if (data.message) {
                        const li = document.createElement('li');
                        li.textContent = data.message;
                        li.classList.add('alert', 'alert-success', 'mb-2');
                        if (errorList) errorList.appendChild(li);
                    }
                    if (data.redirect_url) {
                        setTimeout(() => {
                            window.location.href = data.redirect_url;
                        }, 3000);
                    } else {
                        // If no redirect, restore button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnContent;
                    }
                } else {
                    // Restore button on error
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;

                    if (data.errors && errorList) {
                        const renderMsg = (msg, cls = 'alert-warning') => {
                            const li = document.createElement('li');
                            li.textContent = msg;
                            li.classList.add('alert', 'alert-warning', 'mb-2');
                            errorList.appendChild(li);
                        };

                        if (Array.isArray(data.errors)) {
                            data.errors.forEach(renderMsg);
                        } else if (typeof data.errors === 'object') {
                            Object.values(data.errors)
                                .flat()
                                .forEach(m => renderMsg(m));
                        }
                    }
                }
            } catch (error) {
                // Restore button on network/unexpected error
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;

                if (errorList) {
                    const li = document.createElement('li');
                    li.textContent = 'An unexpected error occurred. Please try again.';
                    li.classList.add('alert', 'alert-danger', 'mb-2');
                    errorList.appendChild(li);
                }
                console.error('Form submission error:', error);
            }
        });
    });

    // Custom Select 
    function initCustomSelects(wrapper) {
        const wrappers = wrapper
            ? [wrapper]
            : document.querySelectorAll('.custom-select-wrapper');
        wrappers.forEach(w => {
            if (w._customSelectInitialized) return;
            w._customSelectInitialized = true;
            const display = w.querySelector('.custom-select-display');
            const list = w.querySelector('.custom-select-list');
            const hiddenInput = w.querySelector('input[type="hidden"]');

            display.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.custom-select-wrapper').forEach(otherWrapper => {
                    if (otherWrapper !== w) {
                        otherWrapper.querySelector('.custom-select-list').classList.remove('show');
                        otherWrapper.querySelector('.custom-select-display').classList.remove('active');
                        otherWrapper.classList.remove('active');
                    }
                });
                list.classList.toggle('show');
                display.classList.toggle('active');
                w.classList.toggle('active');
            });

            list.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedText = item.textContent;
                    hiddenInput.value = item.dataset.value;
                    list.classList.remove('show');
                    display.classList.remove('active');
                    w.classList.remove('active');

                    display.innerHTML = `
                        ${selectedText}
                        <span class="arrow">
                            <i class="fas fa-caret-down"></i>
                        </span>
                    `;
                    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

            document.addEventListener('click', (e) => {
                if (!w.contains(e.target)) {
                    list.classList.remove('show');
                    display.classList.remove('active');
                    w.classList.remove('active');
                }
            });
        });
    }
    window.initCustomSelects = initCustomSelects;
    initCustomSelects();

    // Custom File Input
    const fileInputs = document.querySelectorAll('.custom-file-real-input');

    fileInputs.forEach(input => {
        const container = input.closest('.file-input-container');

        container.addEventListener('click', () => {
            container.classList.add('active');
        });

        input.addEventListener('change', (e) => {
            const placeholder = container.querySelector('.file-placeholder');
            const fileNameDisplay = container.querySelector('.file-name');

            container.classList.remove('active');

            if (input.files && input.files.length > 0) {
                const fileName = input.files[0].name;
                placeholder.classList.add('d-none');
                fileNameDisplay.textContent = fileName;
                fileNameDisplay.classList.remove('d-none');
                container.classList.add('has-file');
            } else {
                placeholder.classList.remove('d-none');
                fileNameDisplay.classList.add('d-none');
                container.classList.remove('has-file');
            }
        });

        // Remove active class when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                container.classList.remove('active');
            }
        });
    });

});

