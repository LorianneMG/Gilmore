const form = document.querySelector('.php-email-form');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('I have been submitted')
    let thisForm = this

    let action = thisForm.getAttribute('action');

    let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

    if (!action) {
        displayError('The form action property is not set!', error, loading)
        return;
    }

    const loading = document.querySelector('.loading')
    loading.classList.add('d-block');
    const error = document.querySelector('.error-message')
    error.classList.remove('d-block');
    const sent = document.querySelector('.sent-message')
    sent.classList.remove('d-block');

    let formData = new FormData(thisForm);

    if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
            grecaptcha.ready(function () {
                try {
                    grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                        .then(token => {
                            formData.set('recaptcha-response', token);
                            php_email_form_submit(thisForm, action, formData);
                        })
                } catch (errorMessage) {
                    displayError(errorMessage, error, loading)
                }
            });
        } else {

            displayError('The reCaptcha javascript API url is not loaded!', error, loading)
        }
    } else {
        // if successful go here
        php_email_form_submit(thisForm, action, formData, loading, error);
    }

})


function php_email_form_submit(thisForm, action, formData, loading, error) {


    fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
        .then(response => {

            if (response.ok) {  // if successful go here
                return response.text()
            } else {
                throw new Error(`${response.status} ${response.statusText} ${response.url}`);
            }
        })
        .then(data => {
            thisForm.querySelector('.loading').classList.remove('d-block');

            if (data.trim() == 'OK' || data.search('ok') != -1) {  // if successful go here
                thisForm.querySelector('.sent-message').classList.add('d-block');
                thisForm.reset();
            } else {
                throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action);
            }
        })
        .catch((errorMessage) => {
            displayError(errorMessage, error, loading);
        });
}


function displayError(errorMessage, error, loading) {
    loading.classList.remove('d-block');
    error.innerHTML = errorMessage;
    error.classList.add('d-block');
}