document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); 
});

/**
 * Prüft, ob der Benutzer eingeloggt ist. Falls nicht, wird er zur Login-Seite weitergeleitet.
 */
function checkAuth() {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        window.location.href = "index.html";
    }
}
