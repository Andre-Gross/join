/**
 * Wartet, bis das DOM vollständig geladen ist, und überprüft dann die Authentifizierung des Benutzers.
 *
 * @event DOMContentLoaded
 * @function checkAuth
 */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});


/**
 * Prüft, ob der Benutzer eingeloggt ist. Falls nicht, wird er zur Login-Seite weitergeleitet.
 * Ausnahme: Wenn der Benutzer als "guest" eingeloggt ist, bleibt er auf der Seite.
 */
function checkAuth() {
    let loggedInUser = sessionStorage.getItem("loggedInUser"); // NUR sessionStorage nutzen

    console.log("checkAuth - loggedInUser Inhalt:", loggedInUser); // Debugging-Ausgabe

    if (!loggedInUser) {
        console.log("Kein Nutzer eingeloggt → Weiterleitung zur Login-Seite");
        window.location.href = "index.html";
        return;
    }

    try {
        const user = JSON.parse(loggedInUser);
        console.log("Eingeloggter Benutzer:", user);

        // Falls Gast, keine Weiterleitung
        if (user.id && user.id.toLowerCase() === "guest") {
            console.log("Gast-Login erkannt → Keine Weiterleitung");
            return;
        }
    } catch (error) {
        console.error("Fehler beim Parsen von loggedInUser:", error);
        window.location.href = "index.html";
    }
}
