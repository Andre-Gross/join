document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

/**
 * Prüft, ob der Benutzer eingeloggt ist. Falls nicht, wird er zur Login-Seite weitergeleitet.
 * Ausnahme: Wenn der Benutzer als "Guest" eingeloggt ist, bleibt er auf der Seite.
 */
function checkAuth() {
    const loggedInUserId = localStorage.getItem("loggedInUserId"); // Holen der Benutzer-ID

    if (!loggedInUserId || loggedInUserId === "null" || loggedInUserId === "undefined") {
        window.location.href = "index.html";
        return;
    }

    if (loggedInUserId.toLowerCase() === "guest") {
        return; // Falls der Nutzer als "Guest" eingeloggt ist, bleibt er auf der Seite
    }

    // Falls kein gültiger Benutzer gefunden wurde, zur Login-Seite weiterleiten
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        window.location.href = "index.html";
    }
}



