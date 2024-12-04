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
function displayUserInitials(userId) {
    const profileIcon = document.getElementById('profile-icon-container');

    if (!profileIcon) {
        return;
    }

    fetch(`${BASE_URL}users/${userId}.json`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(user => {
            let name = "Guest";
            if (user?.login?.name) {
                name = user.login.name;
                // Store the name in `sessionStorage`
                sessionStorage.setItem('loggedInUserName', name);
            }
            const initials = getInitialsFromName(name);
            profileIcon.innerHTML = `<div class="profile-icon-circle">${initials}</div>`;
        })
        .catch(error => {
            console.error("Error fetching user name:", error);
            profileIcon.innerHTML = `<div class="profile-icon-circle">G</div>`;
        });
}

/**
 * Generates initials from a given name.
 * - If the name has one word, returns the first letter in uppercase.
 * - If the name has multiple words, returns the first letter of the first two words in uppercase.
 * 
 * @function getInitialsFromName
 * @param {string} name - The name from which initials are generated.
 * @returns {string} The initials in uppercase.
 */
function getInitialsFromName(name) {
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    } else if (nameParts.length >= 2) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
    }
    return "";
}

// Dynamically add favicon to the document
const link = document.createElement('link');
link.rel = 'icon';
link.href = './assets/favicon/fav.ico';
link.type = 'image/x-icon';
document.head.appendChild(link);

// Call `includeHTML` to start the inclusion process
includeHTML();
