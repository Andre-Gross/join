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

    // Fetch user ID from `sessionStorage` and display initials
    const userId = sessionStorage.getItem('loggedInUser');
    if (userId) {
        displayUserInitials(userId);
    } else {
        console.warn("No user ID found. Defaulting to 'G' for Guest.");
        const profileIcon = document.getElementById('profile-icon-container');
        if (profileIcon) {
            profileIcon.innerHTML = `<div class="profile-icon-circle">G</div>`;
        }
    }
}

/**
 * Fetches the user's name using their ID and displays their initials in the profile icon container.
 * If no name is found or an error occurs, defaults to "G" for Guest.
 * 
 * @function displayUserInitials
 * @param {string} userId - The ID of the logged-in user.
 * @returns {void} Updates the profile icon with the user's initials.
 */
function displayUserInitials() {
    const profileIcon = document.getElementById('profile-icon-container');

    if (!profileIcon) {
        return;
    }

    // Benutzerdaten aus dem sessionStorage abrufen
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let name = "Guest";

    if (loggedInUser) {
        try {
            const user = JSON.parse(loggedInUser);
            if (user?.login?.name) {
                name = user.login.name;
            }
        } catch (error) {
            console.error("Error parsing loggedInUser from sessionStorage:", error);
        }
    }

    const initials = getInitialsFromName(name);
    profileIcon.innerHTML = `<div class="profile-icon-circle">${initials}</div>`;
}

/**
 * Hilfsfunktion, um die Initialen aus einem Namen zu extrahieren.
 *
 * @param {string} name - Der vollständige Name des Benutzers.
 * @returns {string} Die Initialen (z. B. "JD" für "John Doe").
 */
function getInitialsFromName(name) {
    if (!name) return "G"; // Standardwert für "Guest"
    const words = name.split(" ");
    const initials = words.map(word => word.charAt(0).toUpperCase()).join("");
    return initials.length > 2 ? initials.substring(0, 2) : initials;
}


// Dynamically add favicon to the document
const link = document.createElement('link');
link.rel = 'icon';
link.href = './assets/favicon/fav.ico';
link.type = 'image/x-icon';
document.head.appendChild(link);

// Call `includeHTML` to start the inclusion process
includeHTML();
