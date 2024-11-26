async function includeHTML() {
    const includeElements = document.querySelectorAll('[w3-include-html]');
    
    for (const element of includeElements) {
        const file = element.getAttribute("w3-include-html");
        try {
            const response = await fetch(file);
            if (response.ok) {
                element.innerHTML = await response.text();
            } else {
                element.innerHTML = "Page not found.";
            }
        } catch (error) {
            console.error("Error loading file:", file, error);
            element.innerHTML = "Page not found.";
        }
    }

    const userId = sessionStorage.getItem('loggedInUser');
    if (userId) {
        displayUserInitials(userId);
    } else {
        console.warn("No user ID found. Defaulting to 'G' for Guest.");
        document.getElementById('profile-icon-container').innerHTML = `<div class="profile-icon-circle">G</div>`;
    }

    // Navigation initialisieren, nachdem Inhalte geladen wurden
    initializeNavigation();
}

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    // Aktuelle Seite anhand der URL ermitteln
    const currentPage = window.location.pathname.split("/").pop().split(".")[0]; // Holt den Dateinamen ohne `.html`

    // Setze die aktive Klasse basierend auf der aktuellen Seite
    navItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        // Event Listener, falls aktiv im laufenden Betrieb geändert werden soll
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}


// Dynamically add favicon to the document
const link = document.createElement('link');
link.rel = 'icon';
link.href = './assets/img/general/favicon.svg';
link.type = 'image/x-icon';
document.head.appendChild(link);

// Call `includeHTML` to start the inclusion process
includeHTML();
