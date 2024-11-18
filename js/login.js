/**
 * Logs in the user based on email and password.
 * If the credentials are correct, the user ID is stored as `loggedInUser` in session storage,
 * and the user is redirected to 'summary.html'.
 * 
 * If the login fails due to incorrect credentials or a fetch error, an appropriate error message is displayed.
 *
 * @function logIn
 * @returns {void} Displays a success message on successful login or an error message for incorrect credentials.
 */
function logIn() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch(`${BASE_URL}users.json`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(users => {
            const userKey = Object.keys(users).find(key => {
                const user = users[key];
                return user?.login?.email === email && user?.login?.password === password;
            });

            if (userKey) {
                // Store the user ID in session storage
                sessionStorage.setItem('loggedInUser', userKey);

                // Redirect to the summary page
                window.location.href = 'summary.html';
            } else {
                alert("Incorrect email or password.");
            }
        })
        .catch(error => console.error("Login error:", error));
}

/**
 * Allows guest access without requiring registration.
 * The user is immediately redirected to 'summary.html' with a guest user ID.
 * 
 * This function simulates guest access and stores a special guest ID in session storage.
 *
 * @function guestLogIn
 * @returns {void} Redirects to 'summary.html' with a guest ID.
 */
function guestLogIn() {
    // Store a guest user ID in session storage
    sessionStorage.setItem('loggedInUser', 'guest');

    // Redirect to the summary page with a guest ID
    window.location.href = 'summary.html?userId=guest';
}
