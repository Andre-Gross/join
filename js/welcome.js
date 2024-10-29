document.addEventListener('DOMContentLoaded', () => {
    async function displayUserName() {
        const userId = sessionStorage.getItem('loggedInUser'); // Holt die User-ID aus `sessionStorage`
        console.log("Abgerufene Benutzer-ID:", userId); // Debug: Prüfen, ob die Benutzer-ID korrekt ist
        let name = 'Gast';

        if (userId && userId !== 'guest') { // Überprüfen, dass es sich nicht um einen Gastzugang handelt
            try {
                const response = await fetch(
                    `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
                );
                const user = await response.json();
                console.log("Benutzerdaten:", user); // Debug: Struktur der Benutzerdaten prüfen

                // Bevorzugt den Namen im `login`-Objekt
                if (user && user.login && user.login.name) {
                    name = user.login.name;
                    // Speichere den Namen in sessionStorage
                    sessionStorage.setItem('loggedInUserName', name);
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

    // Rufe die Funktion auf, um den Benutzernamen anzuzeigen
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
