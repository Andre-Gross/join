document.addEventListener('DOMContentLoaded', async () => {
    await includeHTML();

    // Benutzerinformationen aus dem sessionStorage abrufen
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let email = null;
    let password = null;

    if (loggedInUser) {
        // Extrahiere die E-Mail und das Passwort aus den gespeicherten Daten
        const user = JSON.parse(loggedInUser);
        email = user.email;
        password = user.password;
    } else {
        console.warn("No valid user data found in sessionStorage.");
    }

    // Hier kannst du die E-Mail und das Passwort verwenden
    console.log("Email:", email);
    console.log("Password:", password);

    async function displayUserName() {
        let name = 'Guest';

        // Wenn die E-Mail existiert, kannst du versuchen, den Benutzernamen zu laden
        if (email) {
            try {
                const response = await fetch(
                    `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const users = await response.json();

                // Finde den Benutzer mit der gespeicherten E-Mail und dem Passwort
                const user = Object.values(users || {}).find(
                    user => user?.email === email && user?.password === password
                );

                if (user && user?.login?.name) {
                    name = user.login.name;
                    sessionStorage.setItem('loggedInUserName', name);
                } else {
                    console.warn("No name found for this user in the database.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }

        const greeting = getGreetingMessage();
        document.getElementById('greeting').textContent = greeting;
        document.getElementById('userName').textContent = capitalize(name);
    }

    function getGreetingMessage() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 9) return 'Moin,';
        if (hour >= 9 && hour < 12) return 'Good Morning,';
        if (hour >= 12 && hour < 17) return 'Good Afternoon,';
        if (hour >= 17 && hour < 22) return 'Good Evening,';
        return 'Good Night,';
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    await displayUserName();

    setTimeout(() => {
        document.querySelector('.welcome-container').classList.add('fade-out');
    }, 1000);

    document.querySelector('.welcome-container').addEventListener('transitionend', () => {
        document.querySelector('.welcome-container').classList.add('hidden');
        document.querySelector('.main').classList.add('visible');
    });
});
