// summary.js

/**
 * Initializes the summary page, displays a personalized greeting based on the user's ID,
 * and handles the transition from the welcome screen to the main content.
 *
 * @async
 * @function
 */
document.addEventListener('DOMContentLoaded', async () => {
    await includeHTML(); // Wait for templates to load

    const userId = sessionStorage.getItem('loggedInUser');
    console.log("Retrieved user ID:", userId);

    /**
     * Displays the user's name or a default guest name based on the stored user ID.
     * Fetches the user's data from Firebase if a valid user ID exists.
     * 
     * @async
     * @function displayUserName
     * @returns {void} Updates the greeting and username on the page.
     */
    async function displayUserName() {
        let name = 'Guest';

        if (userId && userId !== 'guest') {
            try {
                const response = await fetch(
                    `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
                );
                const user = await response.json();
                console.log("User data:", user);

                if (user?.login?.name) {
                    name = user.login.name;
                    sessionStorage.setItem('loggedInUserName', name);
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        }

        const greeting = getGreetingMessage();
        document.getElementById('greeting').textContent = greeting;
        document.getElementById('userName').textContent = capitalize(name);
    }

    /**
     * Generates a greeting message based on the current time of day.
     * 
     * @function getGreetingMessage
     * @returns {string} A time-based greeting (e.g., "Good Morning").
     */
    function getGreetingMessage() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 9) return 'Moin,';
        if (hour >= 9 && hour < 12) return 'Good Morning,';
        if (hour >= 12 && hour < 17) return 'Good Afternoon,';
        if (hour >= 17 && hour < 22) return 'Good Evening,';
        return 'Good Night,';
    }

    /**
     * Capitalizes the first letter of a string.
     * 
     * @function capitalize
     * @param {string} str - The string to capitalize.
     * @returns {string} The capitalized string.
     */
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Call the function to display the user's name
    displayUserName();

    // Start the fade-out animation after 1 second
    setTimeout(() => {
        document.querySelector('.welcome-container').classList.add('fade-out');
    }, 1000);

    // Handle the end of the fade-out animation
    document.querySelector('.welcome-container').addEventListener('transitionend', () => {
        document.querySelector('.welcome-container').classList.add('hidden'); // Hide the welcome container
        document.querySelector('.main').classList.add('visible'); // Show the main content
    });
});
