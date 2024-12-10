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
        const user = findUser(users, email, password);

        if (!user) {
            displayError("Invalid email or password.");
            return;
        }

        saveLoggedInUser(user);
        redirectToSummary();
    } catch {
        displayError("An error occurred during login. Please try again.");
    }
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
 * Fetches all existing users from the database.
 * @returns {Promise<Object>} - A promise resolving to the users object.
 */
async function fetchUsers() {
    const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
    return response.json();
}

/**
 * Finds a user in the database by email and password.
 * @param {Object} users - The existing users object.
 * @param {string} email - The email to find.
 * @param {string} password - The password to match.
 * @returns {Object|null} - The matched user or null if not found.
 */
function findUser(users, email, password) {
    return Object.values(users || {}).find(
        user => user?.email === email && user?.password === password
    ) || null;
}

/**
 * Saves the logged-in user's information in the session storage.
 * @param {Object} user - The user object to save.
 */
function saveLoggedInUser(user) {
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
    const errorElement = document.getElementById("errorDisplay");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove("d-none");
    }
}

