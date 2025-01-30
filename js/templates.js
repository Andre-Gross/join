/**
 * Dynamically includes HTML content into elements with the `w3-include-html` attribute.
 * After inclusion, it fetches the user ID from `sessionStorage` and displays the user's initials.
 * If no user ID is found, it defaults to displaying "G" for Guest.
 * 
 * @async
 * @function includeHTML
 * @returns {Promise<void>} Resolves after all HTML content is included and the profile icon is updated.
 */
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
    updateUserInitials();
    
    setupDropdown();
}

/**
 * Updates the profile icon with the user's initials or defaults to "G" for Guest.
 */
function updateUserInitials() {
    const profileIcon = document.querySelector('.profile-icon-circle');

    if (!profileIcon) return;

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let name = "Guest";

    if (loggedInUser) {
        try {
            const user = JSON.parse(loggedInUser);
            if (user?.name) {
                name = user.name;
            }
        } catch (error) {
            console.error("Error parsing loggedInUser from sessionStorage:", error);
        }
    }

    const initials = getInitialsFromName(name);
    profileIcon.textContent = initials;
}

/**
 * Sets up the dropdown functionality for the profile icon.
 */
function setupDropdown() {
    const profileIconContainer = document.getElementById('profile-icon-container');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!profileIconContainer || !dropdownMenu) return;

    profileIconContainer.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('dm-hidden');
    });

    document.addEventListener('click', (event) => {
        if (!profileIconContainer.contains(event.target)) {
            dropdownMenu.classList.add('dm-hidden');
        }
    });
}

/**
 * Highlights the current navigation item based on the page URL.
 */
function highlightActiveNavItem() {
    const currentPage = getCurrentPage();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Extracts the current page name from the URL.
 * 
 * @returns {string} The current page name without file extension.
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    return fileName.replace('.html', '');
}

(function addFavicon() {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = './assets/favicon/fav.ico';
    link.type = 'image/x-icon';
    document.head.appendChild(link);
})();

document.addEventListener('DOMContentLoaded', async () => {
    await includeHTML();          
    highlightActiveNavItem();     
});


/**
 * Logs out the current user by removing their information from sessionStorage.
 * After clearing the session data, it redirects the user to the 'index.html' page.
 */
function logOut() {
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUserEmail');
    sessionStorage.removeItem('loggedInUserId');
    sessionStorage.removeItem('loggedInUserName');
    sessionStorage.removeItem('loggedInUserPassword');

    setTimeout(() => {
        window.location.href = 'index.html'; 
    }, 50); 
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logOut);
    }
});

