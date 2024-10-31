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

    fetch(`${BASE_URL}users.json`)
        .then(response => response.json())
        .then(users => {
            for (let key in users) {
                const user = users[key];
                if (user && user.login && user.login.email === email && user.login.password === password) {
                    // Speichere die Benutzer-ID in `sessionStorage`
                    sessionStorage.setItem('loggedInUser', key);
                    
                    // Weiterleitung zur gewünschten Seite
                    window.location.href = 'summary.html';
                    return;
                }
            }
            alert("Falsche E-Mail oder Passwort");
        })
        .catch(error => console.error("Fehler beim Login:", error));
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
    // Setzt eine spezielle Gast-Benutzer-ID in sessionStorage
    sessionStorage.setItem('loggedInUser', 'guest');
    
    window.location.href = 'summary.html?userId=guest'; // Leitet mit Gast-ID weiter
}
