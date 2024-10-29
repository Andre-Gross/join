// Navbar dynamisch in jede Seite einfügen und aktivieren
document.addEventListener('DOMContentLoaded', function() {
    // Container für die Navbar
    const navbarContainer = document.createElement('div');
    navbarContainer.id = 'navbar-container';
    document.body.appendChild(navbarContainer);

    // Lade template.html und füge die Navbar ein
    fetch('template.html')
        .then(response => response.text())
        .then(html => {
            navbarContainer.innerHTML = html;

            // Setze das aktive Item basierend auf dem Seitenname
            const pageName = document.body.getAttribute('data-page');
            setActiveNavItem(pageName);
        });

    // Definiere die Funktion zum Setzen des aktiven Nav-Items
    window.setActiveNavItem = function(pageName) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };
});
