let isSubmitting = false;
let toastMessageSignUp = '<span>You Signed Up successfully</span>';

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    const hasLoadedBefore = localStorage.getItem('hasLoadedBefore');

    if (!hasLoadedBefore) {
        setTimeout(() => document.body.classList.add('loaded'), 100);
        setTimeout(() => document.getElementById('loginCard').style.display = 'block', 1600);
        localStorage.setItem('hasLoadedBefore', 'true');
    } else {
        document.body.classList.add('loaded');
        document.getElementById('loginCard').style.display = 'block';
    }
}

function setupEventListeners() {
    const loginForm = document.querySelector('#loginCard form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        logIn();
    });

    const signupForm = document.querySelector('#signupCard form');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signUp();
    });

    document.querySelector('button[onclick="guestLogIn();"]').addEventListener('click', guestLogIn);

    const signupInputs = signupForm.querySelectorAll('input');
    signupInputs.forEach(input => input.addEventListener('input', checkFormValidity));
}

function clearSignupInputs() {
    document.querySelectorAll("#signupCard input").forEach(input => {
        if (input.type === "checkbox") {
            input.checked = false;
        } else {
            input.value = "";
        }
    });

    document.querySelectorAll("#signupCard .password-toggle").forEach(icon => icon.style.display = "none");
    document.querySelectorAll("#signupCard input[type='password']").forEach(input => input.classList.remove("has-icon"));
}

function switchView() {
    const loginCard = document.getElementById("loginCard");
    const signupCard = document.getElementById("signupCard");
    const switchButton = document.getElementById("switchButton");
    const switchText = document.getElementById("switchText");

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
            clearSignupInputs();
        } else {
            signupCard.style.display = 'none';
            loginCard.style.display = 'block';
            switchButton.textContent = 'Sign up';
            switchText.textContent = 'Not a Join user?';
        }

        signupCard.style.opacity = '1';
        loginCard.style.opacity = '1';
    }, 50);
}

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
            displayNotRegisteredError();
            return;
        }

        if (user.password !== password) {
            handleFailedAttempt(email);
            return;
        }

        resetFailedAttempts(email);
        saveLoggedInUser(user);
        redirectToSummary();
    } catch {
        displayError("An error occurred during login. Please try again.");
    }
}

async function signUp() {
    if (isSubmitting) return;
    isSubmitting = true;
    const [name, email, password, confirmPassword, agreeTerms] = getInputValues();

    if (!agreeTerms || password !== confirmPassword) {
        displayError(getValidationErrorMessage(agreeTerms, password, confirmPassword));
        return;
    }

    try {
        const users = await fetchUsers();
        if (isEmailAlreadyRegistered(users, email)) {
            redirectToLogin();
            isSubmitting = false;
            return;
        }
        await registerNewUser(name, email, password);
        await addUserToContacts(name, email);

        isSubmitting = false;
        showToast(toastMessageSignUp, 'middle', 1000);
        setTimeout(() => redirectToLogin(true), 1000);
    } catch {
        isSubmitting = false;
        displayError("An error occurred during registration. Please try again.");
    }
}

function updatePasswordIcon(input, icon) {
    if (!input.value) {
        input.classList.remove("has-icon");
        icon.style.display = "none";
    } else {
        input.classList.add("has-icon");
        icon.style.display = "inline";
        icon.src = "../assets/img/logIn-signUp/visibility-off.svg";
    }
}

function togglePasswordVisibility(input, icon) {
    if (!input.value) return;

    if (input.type === "password") {
        input.type = "text";
        icon.src = "../assets/img/logIn-signUp/visibility-on.svg";
    } else {
        input.type = "password";
        icon.src = "../assets/img/logIn-signUp/visibility-off.svg";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializePage();
    setupEventListeners();

    // Passwort-Felder und Event-Listener für Sichtbarkeit
    const passwordFields = document.querySelectorAll(".password-container input");

    passwordFields.forEach(input => {
        const icon = input.nextElementSibling; // Das zugehörige Icon
        input.addEventListener("input", () => updatePasswordIcon(input, icon));
        icon.addEventListener("click", () => togglePasswordVisibility(input, icon));
    });
});

async function addUserToContacts(name, email) {
    const assignedColor = getRandomColor();

    try {
        await postContactToDatabase(name, email, "", assignedColor);
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Kontakts:", error);
    }
}

function handleFailedAttempt(email) {
    failedAttempts[email] = (failedAttempts[email] || 0) + 1;

    if (failedAttempts[email] >= 3) {
        displayError("Too many failed attempts. Please reset your password.");
        showResetPasswordOption(email);
    } else {
        displayError("Incorrect password. Please try again.");
    }
}

function resetFailedAttempts(email) {
    delete failedAttempts[email];
}

function displayNotRegisteredError() {
    displayError("You are not registered. Please sign up to continue.");
}

async function guestLogIn() {
    try {
        saveLoggedInUser({ id: "guest", name: "Guest" });
        sessionStorage.setItem("loggedInUserId", "Guest");
        redirectToSummary(true);
    } catch {
        displayError("An error occurred during guest login. Please try again later.");
    }
}

async function fetchUsers() {
    const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
    return response.json();
}

function findUserByEmail(users, email) {
    return Object.values(users || {}).find(user => user?.email === email) || null;
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function saveLoggedInUser(user) {
    const hashedPassword = await hashPassword(user.password);
    const userToSave = { ...user, password: hashedPassword };
    sessionStorage.setItem("loggedInUser", JSON.stringify(userToSave));
}

function redirectToSummary(isGuest = false) {
    const url = isGuest ? "summary.html?userId=guest" : "summary.html";
    window.location.href = url;
}

function isEmailAlreadyRegistered(users, email) {
    return Object.values(users || {}).some(user => user?.email === email);
}

async function registerNewUser(name, email, password) {
    const newUser = { name, email, password, contacts: [] };
    await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
    });
}

function redirectToLogin(isSuccess = false) {
    const url = isSuccess ? "index.html?registered=true" : "index.html?error=emailExists";
    window.location.href = url;
}

function getInputValues() {
    return ["name", "signUpEmail", "signUpPassword", "confirmPassword", "agreeTerms"].map(id =>
        document.getElementById(id).type === "checkbox"
            ? document.getElementById(id).checked
            : document.getElementById(id).value.trim()
    );
}

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

function getInputValue(id) {
    return document.getElementById(id).value.trim();
}

function displayError(message) {
    showToast(`<span>${message}</span>`, 'middle', 2000);
}

function getValidationErrorMessage(agreeTerms, password, confirmPassword) {
    if (!agreeTerms) return "Please agree to the terms and conditions.";
    if (password !== confirmPassword) return "Password do not match.";
    return "An unknown validation error occurred.";
}