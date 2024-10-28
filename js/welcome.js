/**
 * Initialisiert die Begrüßungsanzeige und zeigt den Benutzernamen oder "Gast" an,
 * basierend auf den im `localStorage` gespeicherten Daten.
 * Die Begrüßung variiert je nach Tageszeit.
 * 
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Zeigt den Benutzernamen und eine entsprechende Begrüßung basierend
     * auf der aktuellen Tageszeit an. Wenn kein Benutzername verfügbar ist,
     * wird der Name aus der E-Mail-Adresse abgeleitet oder als "Gast" angezeigt.
     * 
     * @function displayUserName
     * @returns {void} Zeigt die Begrüßung und den Benutzernamen an.
     */
    function displayUserName() {
        const userData = localStorage.getItem('user');
        let name = 'Gast';

        if (userData) {
            const user = JSON.parse(userData);
            name = user.name;

            if (!name) {
                // Falls kein Name vorhanden, wird der Name aus der E-Mail abgeleitet
                const email = user.login.email;
                name = email.substring(0, email.indexOf('@'));
                // Erster Buchstabe des Namens wird großgeschrieben
                name = name.charAt(0).toUpperCase() + name.slice(1);
            }
        }

        // Ermittelt die aktuelle Uhrzeit
        const now = new Date();
        const hour = now.getHours();

        // Festlegung der Begrüßung basierend auf der Tageszeit
        let greeting = '';
        if (hour >= 6 && hour < 9) {
            greeting = 'Moin';
        } else if (hour >= 9 && hour < 12) {
            greeting = 'Guten Morgen';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Guten Tag';
        } else if (hour >= 17 && hour < 22) {
            greeting = 'Guten Abend';
        } else {
            greeting = 'Gute Nacht';
        }

        // Begrüßung und Name auf der Webseite anzeigen
        document.getElementById('greeting').textContent = greeting;
        document.getElementById('userName').textContent = name;
    }

    displayUserName();

    // Startet die Fade-Out-Animation nach 3 Sekunden
    setTimeout(() => {
        document.body.classList.add('fade-out');
    }, 1500); // Startet den Fade-Out nach 1,5  Sekunden

    // Weiterleitung nach Abschluss der Animation
    document.body.addEventListener('animationend', () => {
        window.location.href = 'summary.html';
    });
});