/**
 * Waits until the DOM is fully loaded and then checks the user's authentication.
 *
 * @event DOMContentLoaded
 * @function checkAuth
 */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});


/**
 * Checks if the user is logged in. If not, redirects to the login page.
 * Exception: If the user is logged in as "guest", they remain on the page.
 */
function checkAuth() {
    let loggedInUser = sessionStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        window.location.href = "index.html";
        return;
    }

    try {
        const user = JSON.parse(loggedInUser);

        if (user.id && user.id.toLowerCase() === "guest") {
            return;
        }
    } catch (error) {
        window.location.href = "index.html";
    }
}
