async function logIn() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
        const users = await response.json();

        // Suche nach einem Benutzer, der der eingegebenen E-Mail und Passwort entspricht
        const user = Object.values(users || {}).find(
            user => user?.email === email && user?.password === password
        );

        if (!user) {
            alert("Invalid email or password.");
            return;
        }

        // Erfolgreiches Login
        alert("Login successful!");
        
        // Die Benutzer-ID oder andere Details im lokalen Speicher speichern, falls nötig
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // Weiterleitung zur gewünschten Seite nach erfolgreichem Login (z.B. Dashboard)
        window.location.href = 'summary.html'; // Beispiel: Weiterleitung zum Dashboard
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
    }
}


async function guestLogIn() {
    try {
        // Gast-User-ID in der Datenbank setzen (sicherstellen, dass diese Funktion existiert)
        await putLoggedInUser('guest');

        // Weiterleiten zur Übersicht
        window.location.href = 'summary.html?userId=guest';
    } catch (error) {
        console.error("Fehler beim Gast-Login:", error);
        alert("Ein Fehler ist aufgetreten. Versuche es später noch einmal.");
    }
}
