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

    // Gast-Login direkt gekoppelt
    document.querySelector('button[onclick="guestLogIn();"]').addEventListener('click', guestLogIn);

    // Event-Listener für Formularvalidierung
    const signupInputs = signupForm.querySelectorAll('input');
    signupInputs.forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });
});

let failedAttempts = {}; // Speichert fehlgeschlagene Login-Versuche

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

/**
 * Handles the user login process.
 */
async function logIn() {
    const email = getInputValue("email");
    const password = getInputValue("password");

    if (!email || !password) {
        displayError("Please enter both email and password.");
        return;
    }

    try {
        const users = await fetchUsers();
        const user = findUserByEmail(users, email);

        if (!user) {
            displayNotRegisteredError(); // Benutzer nicht registriert
            return;
        }

        if (user.password !== password) {
            handleFailedAttempt(email); // Verarbeite fehlgeschlagene Versuche
            return;
        }

        resetFailedAttempts(email); // Zurücksetzen der fehlgeschlagenen Versuche
        saveLoggedInUser(user);
        redirectToSummary();
    } catch {
        displayError("An error occurred during login. Please try again.");
    }
}

/**
 * Handles failed login attempts and shows a reset password option after 3 tries.
 * @param {string} email - The user's email address.
 */
function handleFailedAttempt(email) {
    failedAttempts[email] = (failedAttempts[email] || 0) + 1;

    if (failedAttempts[email] >= 3) {
        displayError("Too many failed attempts. Please reset your password.");
        showResetPasswordOption(email);
    } else {
        displayError("Incorrect password. Please try again.");
    }
}

/**
 * Resets the failed login attempts for a user.
 * @param {string} email - The user's email address.
 */
function resetFailedAttempts(email) {
    delete failedAttempts[email];
}

/**
 * Displays an error message if the user is not registered.
 */
function displayNotRegisteredError() {
    displayError("You are not registered. Please sign up to continue.");
}

/**
 * Logs in as a guest user.
 */
async function guestLogIn() {
    try {
        saveLoggedInUser({ id: "guest", name: "Guest" });
        redirectToSummary(true);
    } catch {
        displayError("An error occurred during guest login. Please try again later.");
    }
}

/**
 * Handles the user registration process.
 */
async function signUp() {
    const [name, email, password, confirmPassword, agreeTerms] = getInputValues();

    if (!agreeTerms || password !== confirmPassword) {
        displayError(getValidationErrorMessage(agreeTerms, password, confirmPassword));
        return;
    }

    try {
        const users = await fetchUsers();
        if (isEmailAlreadyRegistered(users, email)) {
            redirectToLogin();
            return;
        }

        await registerNewUser(name, email, password);
        redirectToLogin(true);
    } catch {
        displayError("An error occurred during registration. Please try again.");
    }
}

/**
 * Fetches all existing users from the database.
 * @returns {Promise<Object>} - A promise resolving to the users object.
 */
async function fetchUsers() {
    const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
    return response.json();
}

/**
 * Finds a user in the database by email.
 * @param {Object} users - The existing users object.
 * @param {string} email - The email to find.
 * @returns {Object|null} - The matched user or null if not found.
 */
function findUserByEmail(users, email) {
    return Object.values(users || {}).find(user => user?.email === email) || null;
}

/**
 * Hashes a password using SHA-256.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - The hashed password as a hex string.
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Saves the logged-in user's information in the session storage.
 * The password is hashed before saving.
 * @param {Object} user - The user object to save.
 */
async function saveLoggedInUser(user) {
    const hashedPassword = await hashPassword(user.password);
    const userToSave = { ...user, password: hashedPassword }; // Passwort ersetzen
    sessionStorage.setItem("loggedInUser", JSON.stringify(userToSave));
}

/**
 * Redirects the user to the summary page.
 * @param {boolean} [isGuest=false] - Whether the login is for a guest user.
 */
function redirectToSummary(isGuest = false) {
    const url = isGuest ? "summary.html?userId=guest" : "summary.html";
    window.location.href = url;
}

/**
 * Checks if the given email is already registered.
 * @param {Object} users - The existing users object.
 * @param {string} email - The email to check.
 * @returns {boolean} - True if the email is already registered, otherwise false.
 */
function isEmailAlreadyRegistered(users, email) {
    return Object.values(users || {}).some(user => user?.email === email);
}

/**
 * Registers a new user in the database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
async function registerNewUser(name, email, password) {
    const newUser = { name, email, password, contacts: [] };
    await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
    });
}

/**
 * Redirects the user to the login page.
 * @param {boolean} [isSuccess] - Whether the registration was successful.
 */
function redirectToLogin(isSuccess = false) {
    const url = isSuccess ? "landingpage.html?registered=true" : "landingpage.html?error=emailExists";
    window.location.href = url;
}

/**
 * Retrieves and processes form input values.
 * @returns {Array} - Array of processed input values.
 */
function getInputValues() {
    return ["name", "signUpEmail", "signUpPassword", "confirmPassword", "agreeTerms"].map(id =>
        document.getElementById(id).type === "checkbox"
            ? document.getElementById(id).checked
            : document.getElementById(id).value.trim()
    );
}

/**
 * Validates the registration form inputs and updates the register button state.
 */
function checkFormValidity() {
    const [name, email, password, confirmPassword, agreeTerms] = [
        "name", "signUpEmail", "signUpPassword", "confirmPassword", "agreeTerms"
    ].map(id =>
        document.getElementById(id).type === "checkbox"
            ? document.getElementById(id).checked
            : document.getElementById(id).value.trim()
    );
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
    console.log("Agree Terms:", agreeTerms);
    const isFormValid = name && email && password && confirmPassword && agreeTerms;
    document.getElementById("registerButton").disabled = !isFormValid;
}

/**
 * Retrieves and processes the value of an input field by its ID.
 * @param {string} id - The ID of the input field.
 * @returns {string} - The trimmed value of the input field.
 */
function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    const popup = document.getElementById('popupMessage');
    if (popup) {
        popup.textContent = message;
        popup.classList.remove('d-none');
        popup.classList.add('show');

        // Entfernt die Meldung nach 3 Sekunden
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.classList.add('d-none'), 300); // Wartet, bis die Animation vorbei ist
        }, 3000);
    }
}

/**
 * Determines the validation error message.
 * @param {boolean} agreeTerms - Whether the terms were agreed to.
 * @param {string} password - The entered password.
 * @param {string} confirmPassword - The confirmed password.
 * @returns {string} - The appropriate error message.
 */
function getValidationErrorMessage(agreeTerms, password, confirmPassword) {
    if (!agreeTerms) return "Please agree to the terms and conditions.";
    if (password !== confirmPassword) return "Password do not match.";
    return "An unknown validation error occurred.";
}
