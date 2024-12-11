document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    setTimeout(() => {
        document.getElementById('loginCard').style.display = 'block';
    }, 1600);

    // Event-Listener für Login-Formular
    const loginForm = document.querySelector('#loginCard form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        logIn();
    });

    // Event-Listener für Signup-Formular
    const signupForm = document.querySelector('#signupCard form');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signUp();
    });

    // Event-Listener für Gast-Login
    const guestLoginButton = document.querySelector('button[onclick="guestLogIn();"]');
    guestLoginButton.addEventListener('click', guestLogIn);

    // Event-Listener für Formularvalidierung
    const signupInputs = signupForm.querySelectorAll('input');
    signupInputs.forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });
});

function switchView() {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const switchButton = document.getElementById('switchButton');
    const switchText = document.getElementById('switchText');

    // Set opacity to 0 for transition
    loginCard.style.opacity = '0';
    signupCard.style.opacity = '0';

    setTimeout(() => {
        if (loginCard.style.display !== 'none') {
            loginCard.style.display = 'none';
            signupCard.style.display = 'block';
            switchButton.textContent = 'Log in';
            switchText.textContent = 'Already a Join user?';
        } else {
            signupCard.style.display = 'none';
            loginCard.style.display = 'block';
            switchButton.textContent = 'Sign up';
            switchText.textContent = 'Not a Join user?';
        }

        // Allow fade-in transition after display is set
        setTimeout(() => {
            if (signupCard.style.display === 'block') {
                signupCard.style.opacity = '1';
            } else {
                loginCard.style.opacity = '1';
            }
        }, 50);
    }, 500);
}

