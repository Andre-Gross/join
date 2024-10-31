// summary.js
document.addEventListener('DOMContentLoaded', async () => {
    await includeHTML(); // Warten Sie, bis die Templates geladen sind

    // Benutzer-ID aus `sessionStorage` holen
    const userId = sessionStorage.getItem('loggedInUser');
    console.log("Abgerufene Benutzer-ID:", userId);

    // Ihre bestehende Funktion zur Anzeige des Benutzernamens
    async function displayUserName() {
        let name = 'Gast';

        if (userId && userId !== 'guest') {
            try {
                const response = await fetch(
                    `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
                );
                const user = await response.json();
                console.log("Benutzerdaten:", user);

                if (user && user.login && user.login.name) {
                    name = user.login.name;
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
            greeting = 'Moin,';
        } else if (hour >= 9 && hour < 12) {
            greeting = 'Guten Morgen,';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Guten Tag,';
        } else if (hour >= 17 && hour < 22) {
            greeting = 'Guten Abend,';
        } else {
            greeting = 'Gute Nacht,';
        }

        // Begrüßung und Name auf der Webseite anzeigen
        document.getElementById('greeting').textContent = greeting;
        document.getElementById('userName').textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Rufe die Funktion auf, um den Benutzernamen anzuzeigen
    displayUserName();

    // Startet die Fade-Out-Animation nach 1 Sekunde
    setTimeout(() => {
        document.querySelector('.welcome-container').classList.add('fade-out');
    }, 1000);

    // Nach Abschluss der Fade-Out-Animation
    document.querySelector('.welcome-container').addEventListener('transitionend', () => {
        document.querySelector('.welcome-container').classList.add('hidden'); // Begrüßungscontainer ausblenden
        document.querySelector('.main').classList.add('visible'); // Hauptinhalt anzeigen
    });
});
