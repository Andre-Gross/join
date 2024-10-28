/**
 * Loggt den Benutzer basierend auf E-Mail und Passwort ein.
 * Die Funktion überprüft die eingegebenen Anmeldedaten, sucht nach dem Benutzer
 * in der Firebase-Datenbank und leitet bei erfolgreichem Login zur
 * 'summary.html'-Seite weiter. Wenn das Kontrollkästchen "Angemeldet bleiben"
 * aktiviert ist, wird der Benutzer im `localStorage` gespeichert.
 *
 * @function logIn
 * @returns {void} Zeigt eine Erfolgsmeldung bei erfolgreichem Login oder eine Fehlermeldung bei falschen Anmeldedaten.
 */
function logIn() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;


    fetch('https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users.json')
    .then(response => response.json())
    .then(users => {

        let userFound = false;
        for (let key in users) {
            if (users[key] && users[key].login.email === email && users[key].login.password === password) {
                userFound = true;
            
                if (rememberMe) {
                    localStorage.setItem('user', JSON.stringify(users[key]));
                }

                 window.location.href = 'welcome.html';
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
 * Der Benutzer wird sofort zur 'summary.html'-Seite weitergeleitet.
 *
 * @function guestLogIn
 * @returns {void} Zeigt eine Nachricht an, dass der Gastzugang erfolgreich ist, und leitet zur 'summary.html'-Seite weiter.
 */
function guestLogIn() {
    alert("Als Gast eingeloggt!");
    window.location.href = 'welcome.html';
}
