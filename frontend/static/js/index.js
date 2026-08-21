// Dealing with forms
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.form');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            const method = (form.getAttribute('method') || 'POST').toUpperCase();
            if (method === 'GET') {
                return; // Let standard GET search/filter forms submit normally
            }
            e.preventDefault();

            const formData = new FormData(form);
            const formId = form.id;
            const errorContainer = document.querySelector(`#errorContainer[form_id="${formId}"]`);
            const errorList = errorContainer ? errorContainer.querySelector('#errorList') : document.querySelector('#errorList');
            const submitBtn = form.querySelector('[type="submit"]');
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';

            if (errorList) {
                errorList.innerHTML = '';
            }

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    ${originalBtnContent}
`;
            }

            const csrfInput = form.querySelector('[name=csrfmiddlewaretoken]') || document.querySelector('[name=csrfmiddlewaretoken]');
            let csrfToken = csrfInput ? csrfInput.value : '';
            if (!csrfToken) {
                const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
                if (match) csrfToken = match[1];
            }

            const headers = {
                'X-Requested-With': 'XMLHttpRequest'
            };
            if (csrfToken) {
                headers['X-CSRFToken'] = csrfToken;
            }

            try {
                const response = await fetch(form.action, {
                    method: form.method || 'POST',
                    body: formData,
                    headers: headers
                });

                const data = await response.json();

                if (data.success) {
                    form.reset();
                    if (window.Swal && data.message) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès !',
                            text: data.message,
                            confirmButtonText: 'OK',
                            customClass: {
                                popup: 'swal2-popup',
                                confirmButton: 'btn neonCyan'
                            },
                            buttonsStyling: false
                        });
                    }
                    if (data.message) {
                        const li = document.createElement('li');
                        li.className = 'alert alert-success d-flex align-items-center mb-2 animate-fadeIn';
                        li.innerHTML = `<i class="fas fa-check-circle me-2 flex-shrink-0"></i><span>${data.message}</span>`;
                        if (errorList) errorList.appendChild(li);
                    }
                    if (data.redirect_url) {
                        setTimeout(() => {
                            window.location.href = data.redirect_url;
                        }, 2500);
                    } else {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnContent;
                    }
                } else {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;

                    if (data.errors) {
                        if (window.Swal) {
                            const errMsg = Array.isArray(data.errors)
                                ? data.errors.join('<br>')
                                : (typeof data.errors === 'object' ? Object.values(data.errors).flat().join('<br>') : String(data.errors));
                            Swal.fire({
                                icon: 'error',
                                title: 'Erreur',
                                html: errMsg,
                                confirmButtonText: 'OK',
                                customClass: {
                                    popup: 'swal2-popup',
                                    confirmButton: 'btn neonCyan'
                                },
                                buttonsStyling: false
                            });
                        }
                        if (errorList) {
                            const renderMsg = (msg, cls = 'alert-danger') => {
                                const li = document.createElement('li');
                                li.className = `alert ${cls} d-flex align-items-center mb-2 animate-fadeIn`;
                                li.innerHTML = `<i class="fas fa-exclamation-circle me-2 flex-shrink-0"></i><span>${msg}</span>`;
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
                }
            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;

                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Une erreur inattendue est survenue. Veuillez réessayer.',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'swal2-popup',
                            confirmButton: 'btn neonCyan'
                        },
                        buttonsStyling: false
                    });
                }
                if (errorList) {
                    const li = document.createElement('li');
                    li.className = 'alert alert-danger d-flex align-items-center mb-2 animate-fadeIn';
                    li.innerHTML = '<i class="fas fa-times-circle me-2 flex-shrink-0"></i><span>An unexpected error occurred. Please try again.</span>';
                    errorList.appendChild(li);
                }
            }    console.error('Form submission error:', error);
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

