/**
 * Initialisiert die Begrüßungsanzeige und zeigt den Benutzernamen basierend
 * auf der in Firebase gespeicherten Benutzer-ID an, die als URL-Parameter übergeben wurde.
 * Die Begrüßung wird je nach aktueller Tageszeit dynamisch angepasst und angezeigt.
 * 
 * Diese Funktion wird ausgeführt, sobald das `DOMContentLoaded`-Ereignis ausgelöst wird,
 * d.h., wenn die HTML-Struktur vollständig geladen ist.
 * 
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Extrahiert den URL-Parameter.
     * Diese Funktion wird verwendet, um spezifische Parameter wie die Benutzer-ID
     * aus der URL abzurufen, um dann personalisierte Informationen anzuzeigen.
     * 
     * @function getQueryParam
     * @param {string} name - Der Name des URL-Parameters, der abgerufen werden soll.
     * @returns {string|null} Der Wert des URL-Parameters oder `null`, wenn er nicht vorhanden ist.
     */
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    /**
     * Zeigt den Benutzernamen und eine entsprechende Begrüßung basierend
     * auf der aktuellen Tageszeit an.
     * 
     * Ablauf:
     * - Ruft die Benutzer-ID aus der URL ab und verwendet sie, um den Benutzernamen
     *   aus Firebase zu laden.
     * - Bestimmt die Begrüßung basierend auf der aktuellen Uhrzeit.
     * - Zeigt den Benutzernamen und die Begrüßung im HTML-Dokument an.
     * 
     * Fehler oder fehlende Daten führen dazu, dass der Benutzer als "Gast" begrüßt wird.
     * 
     * @async
     * @function displayUserName
     * @returns {void} Zeigt die Begrüßung und den Benutzernamen auf der Seite an.
     */
    async function displayUserName() {
        const userId = getQueryParam('userId');
        let name = 'Gast';

        if (userId) {
            try {
                const response = await fetch(
                    `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
                );
                const user = await response.json();

                // Benutzername abrufen, falls vorhanden
                if (user && user.login && user.login.name) {
                    name = user.login.name;
                }
            } catch (error) {
                console.error("Fehler beim Abrufen des Benutzernamens:", error);
            }
        }

        // Begrüßung basierend auf der Tageszeit
        const now = new Date();
        const hour = now.getHours();
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
        document.getElementById('userName').textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }

    displayUserName();

    // Startet die Fade-Out-Animation nach 1,5 Sekunden
    setTimeout(() => {
        document.body.classList.add('fade-out');
    }, 1500);

    // Weiterleitung zur 'summary.html' nach Abschluss der Animation
    document.body.addEventListener('animationend', () => {
        window.location.href = 'summary.html';
    });
});
