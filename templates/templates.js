async function includeHTML() {
    const includeElements = document.querySelectorAll('[w3-include-html]');
    for (const element of includeElements) {
        const file = element.getAttribute("w3-include-html");
        const response = await fetch(file);
        if (response.ok) {
            element.innerHTML = await response.text();
        } else {
            element.innerHTML = "Page not found.";
        }
    }

    // Benutzer-ID aus `sessionStorage` holen und Initialen anzeigen
    const userId = sessionStorage.getItem('loggedInUser');
    if (userId) {
        displayUserInitials(userId);
    } else {
        console.warn("Keine Benutzer-ID vorhanden, Standardwert 'Gast' wird angezeigt.");
        document.getElementById('profile-icon-container').innerHTML = `<div class="profile-icon-circle">G</div>`;
    }
}

function displayUserInitials(userId) {
    const profileIcon = document.getElementById('profile-icon-container');

    if (!profileIcon) {
        console.warn("Das Element 'profile-icon-container' wurde nicht gefunden.");
        return;
    }

    fetch(`${BASE_URL}users/${userId}.json`)
        .then(response => response.json())
        .then(user => {
            let name = "Gast";
            if (user && user.login && user.login.name) {
                name = user.login.name;
                // Speichere den Namen in `sessionStorage`
                sessionStorage.setItem('loggedInUserName', name);
            }

            const initials = getInitialsFromName(name);
            profileIcon.innerHTML = `<div class="profile-icon-circle">${initials}</div>`;
        })
        .catch(error => {
            console.error("Fehler beim Abrufen des Benutzernamens:", error);
            profileIcon.innerHTML = `<div class="profile-icon-circle">G</div>`;
        });
}


// Funktion zum Generieren der Initialen aus dem Namen
function getInitialsFromName(name) {
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    } else if (nameParts.length >= 2) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
    }
}

const link = document.createElement('link');
link.rel = 'icon';
link.href = './assets/favicon/fav.ico';
link.type = 'image/x-icon';
document.head.appendChild(link);


// Rufe `includeHTML` auf
includeHTML();
