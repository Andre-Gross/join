/**
 * Globale Variable zur Speicherung der Benutzer-ID des aktuell eingeloggenen Benutzers.
 * Sie wird während des Login-Prozesses gesetzt und ermöglicht der Anwendung,
 * auf die spezifischen Daten des Benutzers zuzugreifen.
 * 
 * @type {string|null}
 */
let loggedInUser = null;

/**
 * Loggt den Benutzer basierend auf E-Mail und Passwort ein.
 * Wenn die Anmeldedaten korrekt sind, wird die Benutzer-ID als `loggedInUser` gespeichert
 * und der Benutzer wird zur 'welcome.html'-Seite weitergeleitet, wobei die Benutzer-ID als URL-Parameter übergeben wird.
 * 
 * Bei inkorrekten Anmeldedaten oder einem Fehler im Abruf wird eine entsprechende Fehlermeldung angezeigt.
 *
 * @function logIn
 * @returns {void} Zeigt eine Erfolgsmeldung bei erfolgreichem Login oder eine Fehlermeldung bei falschen Anmeldedaten.
 */
function logIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users.json')
        .then(response => response.json())
        .then(users => {
            let userFound = false;
            for (let key in users) {
                const user = users[key];
                if (user && user.login && user.login.email === email && user.login.password === password) {
                    userFound = true;

                    // Benutzer-ID speichern
                    loggedInUser = key;
                    console.log("Eingeloggte Benutzer-ID:", loggedInUser);

                    window.location.href = `welcome.html?userId=${encodeURIComponent(loggedInUser)}`;
                    break;
                }
            }
            if (!userFound) {
                alert("Falsche E-Mail oder Passwort.");
            }
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der Benutzerdaten:", error);
            alert("Fehler beim Login. Bitte versuche es erneut.");
        });
}

/**
 * Ermöglicht den Gastzugang, ohne dass eine Registrierung erforderlich ist.
 * Der Benutzer wird sofort zur 'welcome.html'-Seite weitergeleitet, jedoch ohne spezifische Benutzer-ID.
 * Diese Funktion simuliert einen Gastzugang, bei dem keine Daten im `loggedInUser` gespeichert werden.
 *
 * @function guestLogIn
 * @returns {void} Zeigt eine Nachricht an, dass der Gastzugang erfolgreich ist, und leitet zur 'welcome.html'-Seite weiter.
 */
function guestLogIn() {
    alert("Als Gast eingeloggt!");
    window.location.href = 'welcome.html';
}
