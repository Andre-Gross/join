let isSubmitting = false;
let toastMessageSignUp = '<span>You Signed Up successfully</span>';
let failedAttempts = {};

document.addEventListener('DOMContentLoaded', () => {
    const hasLoadedBefore = localStorage.getItem('hasLoadedBefore');

    if (!hasLoadedBefore) {
        setTimeout(() => document.body.classList.add('loaded'), 100);
        setTimeout(() => document.getElementById('loginCard').style.display = 'block', 1600);
        localStorage.setItem('hasLoadedBefore', 'true');
    } else {
        document.body.classList.add('loaded');
        document.getElementById('loginCard').style.display = 'block';
    }

    document.querySelector('#loginCard form').addEventListener('submit', e => {
        e.preventDefault();
        logIn();
    });

    document.querySelector('#signupCard form').addEventListener('submit', e => {
        e.preventDefault();
        signUp();
    });

    document.querySelector('button[onclick="guestLogIn();"]').addEventListener('click', guestLogIn);

    document.querySelectorAll(".password-container input").forEach(input => {
        input.value = "";
        const icon = input.nextElementSibling;
        input.addEventListener("input", () => updatePasswordIcon(input, icon));
        icon.addEventListener("click", () => togglePasswordVisibility(input, icon));
    });
});

/**
 * Clears all input fields in the signup form when switching views.
 */
function clearSignupInputs() {
    document.querySelectorAll("#signupCard input").forEach(input => {
        if (input.type === "checkbox") {
            input.checked = false; // Checkboxen abwählen
        } else {
            input.value = ""; // Alle anderen Felder leeren
        }
    });

    // Falls ein Icon sichtbar ist, verberge es
    document.querySelectorAll("#signupCard .password-toggle").forEach(icon => {
        icon.style.display = "none";
    });

    // Stelle sicher, dass das lock.svg als Hintergrundbild erscheint
    document.querySelectorAll("#signupCard input[type='password']").forEach(input => {
        input.classList.remove("has-icon"); // Setzt das Hintergrundbild zurück
    });
}

/**
 * Switches between login and signup view.
 */
function switchView() {
    const loginCard = document.getElementById("loginCard");
    const signupCard = document.getElementById("signupCard");
    const switchButton = document.getElementById("switchButton");
    const switchText = document.getElementById("switchText");

    [loginCard, signupCard].forEach(card => card.style.transition = 'none');
    
    loginCard.style.opacity = '0';
    signupCard.style.opacity = '0';

    setTimeout(() => {
        const isLoginVisible = loginCard.style.display !== 'none';
        loginCard.style.display = isLoginVisible ? 'none' : 'block';
        signupCard.style.display = isLoginVisible ? 'block' : 'none';

        switchButton.textContent = isLoginVisible ? 'Log in' : 'Sign up';
        switchText.textContent = isLoginVisible ? 'Already a Join user?' : 'Not a Join user?';

        if (isLoginVisible) clearSignupInputs();

        [signupCard, loginCard].forEach(card => card.style.opacity = '1');
    }, 50);
}

/**
 * Handles the user login process.
 */
async function logIn() {
    const email = getInputValue("email");
    const password = getInputValue("password");

    if (!email || !password) return displayError("Please enter both email and password.");

    try {
        const users = await fetchUsers();
        const user = findUserByEmail(users, email);

        if (!user) return displayError("You are not registered. Please sign up to continue.");

        if (user.password !== password) return handleFailedAttempt(email);

        resetFailedAttempts(email);
        await saveLoggedInUser(user);
        redirectToSummary();
    } catch {
        displayError("An error occurred during login. Please try again.");
    }
}

/**
 * Handles the user registration process.
 */
async function signUp() {
    if (isSubmitting) return;
    isSubmitting = true;

    const [name, email, password, confirmPassword, agreeTerms] = getInputValues();
    
    if (!agreeTerms || password !== confirmPassword) {
        isSubmitting = false;
        return displayError(getValidationErrorMessage(agreeTerms, password, confirmPassword));
    }

    try {
        const users = await fetchUsers();
        if (isEmailAlreadyRegistered(users, email)) return redirectToLogin();

        await registerNewUser(name, email, password);
        await addUserToContacts(name, email);

        showToast(toastMessageSignUp, 'middle', 1000);
        setTimeout(() => redirectToLogin(true), 1000);
    } catch {
        displayError("An error occurred during registration. Please try again.");
    } finally {
        isSubmitting = false;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const passwordFields = document.querySelectorAll(".password-container input");

    // Setzt alle Passwort-Felder auf leer beim Laden
    passwordFields.forEach(input => input.value = "");

    // Event-Listener für Icon-Update und Passwort-Anzeige-Umschaltung
    passwordFields.forEach(input => {
        const icon = input.nextElementSibling; // Das zugehörige Icon
        input.addEventListener("input", () => updatePasswordIcon(input, icon));
        icon.addEventListener("click", () => togglePasswordVisibility(input, icon));
    });
});

/**
 * Updates the visibility icon when text is entered or removed.
 *
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The visibility icon.
 */
function updatePasswordIcon(input, icon) {
    if (!input.value) {
        input.classList.remove("has-icon"); // Zeigt das `background-image`
        icon.style.display = "none"; // Versteckt das `<img>`-Icon
    } else {
        input.classList.add("has-icon"); // Entfernt das `background-image`
        icon.style.display = "inline"; // Zeigt das `<img>`-Icon
        icon.src = "../assets/img/logIn-signUp/visibility-off.svg"; // Zeigt das Auge mit Strich
    }
}

/**
 * Toggles the password visibility and updates the icon.
 *
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The clicked eye icon.
 */
function togglePasswordVisibility(input, icon) {
    if (!input.value) return; // Falls das Feld leer ist, nichts tun

    if (input.type === "password") {
        input.type = "text";
        icon.src = "../assets/img/logIn-signUp/visibility-on.svg"; // Auge offen
    } else {
        input.type = "password";
        icon.src = "../assets/img/logIn-signUp/visibility-off.svg"; // Auge geschlossen
    }
}


async function addUserToContacts(name, email) {
    const assignedColor = getRandomColor();

    try {
        await postContactToDatabase(name, email, "", assignedColor);
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Kontakts:", error);
    }
}


function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Handles failed login attempts.
 */
function handleFailedAttempt(email) {
    failedAttempts[email] = (failedAttempts[email] || 0) + 1;

    if (failedAttempts[email] >= 3) {
        displayError("Too many failed attempts. Please reset your password.");
    } else {
        displayError("Incorrect password. Please try again.");
    }
}

/**
 * Resets the failed login attempts.
 */
function resetFailedAttempts(email) {
    delete failedAttempts[email];
}

/**
 * Displays an error message.
 */
function displayError(message) {
    showToast(`<span>${message}</span>`, 'middle', 2000);
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
        sessionStorage.setItem("loggedInUserId", "Guest"); // Speichert die Gast-ID für Auth-Check
        redirectToSummary(true);
    } catch {
        displayError("An error occurred during guest login. Please try again later.");
    }
}


/**
 * Fetches all existing users from the database.
 */
async function fetchUsers() {
    const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
    return response.json();
}

/**
 * Finds a user in the database by email.
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
 */
async function saveLoggedInUser(user) {
    user.password = await hashPassword(user.password);
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
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
 */
function isEmailAlreadyRegistered(users, email) {
    return Object.values(users || {}).some(user => user?.email === email);
}

/**
 * Registers a new user.
 */
async function registerNewUser(name, email, password) {
    await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, contacts: [] })
    });
}

/**
 * Redirects the user to the login page.
 * @param {boolean} [isSuccess] - Whether the registration was successful.
 */
function redirectToLogin(isSuccess = false) {
    const url = isSuccess ? "index.html?registered=true" : "index.html?error=emailExists";
    window.location.href = url;
}

/**
 * Retrieves and processes input values.
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

