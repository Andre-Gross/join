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

    loginCard.style.opacity = '0';
    signupCard.style.opacity = '0';

    setTimeout(() => {
        if (loginCard.style.display !== 'none') {
            loginCard.style.display = 'none';
            signupCard.style.display = 'block';
            switchButton.textContent = 'Log in';
            switchText.textContent = 'Already a Join user?';
        } else {
            loginCard.style.display = 'block';
            signupCard.style.display = 'none';
            switchButton.textContent = 'Sign up';
            switchText.textContent = 'Not a Join user?';
        }
        showActiveForm();
    }, 500);
}
