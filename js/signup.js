/**
 * Handles the user registration process.
 */
async function signUp() {
    const [email, password, confirmPassword, agreeTerms] = getInputValues();

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

        await registerNewUser(email, password);
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
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
async function registerNewUser(email, password) {
    const newUser = { email, password, contacts: [] };
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
    const url = isSuccess ? "login.html?registered=true" : "login.html?error=emailExists";
    window.location.href = url;
}

/**
 * Retrieves and processes form input values.
 * @returns {Array} - Array of processed input values.
 */
function getInputValues() {
    return ["email", "password", "confirmPassword", "agreeTerms"].map(id =>
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
        "name", "email", "password", "confirmPassword", "agreeTerms"
    ].map(id =>
        document.getElementById(id).type === "checkbox"
            ? document.getElementById(id).checked
            : document.getElementById(id).value.trim()
    );

    const isFormValid = name && email && password && confirmPassword && agreeTerms;
    document.getElementById("registerButton").disabled = !isFormValid;
}

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    const errorElement = document.getElementById("errorDisplay");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove("d-none");
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
    if (password !== confirmPassword) return "Passwords do not match.";
    return "An unknown validation error occurred.";
}
