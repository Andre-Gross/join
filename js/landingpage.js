document.addEventListener('DOMContentLoaded', () => {
    const hasLoadedBefore = localStorage.getItem('hasLoadedBefore');

    if (!hasLoadedBefore) {
        // Erstes Laden: Animation wird ausgeführt
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);

        setTimeout(() => {
            document.getElementById('loginCard').style.display = 'block';
        }, 1600);

        localStorage.setItem('hasLoadedBefore', 'true'); // Speichern, dass geladen wurde
    } else {
        // Kein erstes Laden: Sofortige Anzeige ohne Animation
        document.body.classList.add('loaded'); // Hintergrund direkt anzeigen
        document.getElementById('loginCard').style.display = 'block';
    }

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

    // Wechsel ohne Verzögerung
    loginCard.style.transition = 'none';
    signupCard.style.transition = 'none';

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

        // Sofortiges Anzeigen der entsprechenden Karte
        signupCard.style.opacity = '1';
        loginCard.style.opacity = '1';
    }, 50);
}
