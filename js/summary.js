document.addEventListener('DOMContentLoaded', async () => {
    await includeHTML();
    initializeUserData();
    await displayUserName();
    fadeOutWelcomeMessage();
    initializeSummary();
});

/**
 * Initializes user data from session storage.
 */
function initializeUserData() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        displayError("No valid user data found in sessionStorage.");
        return;
    }

    const user = JSON.parse(loggedInUser);
    sessionStorage.setItem('loggedInUserEmail', user.email || '');
    sessionStorage.setItem('loggedInUserPassword', user.password || '');
    sessionStorage.setItem('loggedInUserId', user.name || '');
}


async function displayUserName() {
    let name = 'Guest';
    const email = sessionStorage.getItem('loggedInUserEmail');
    const password = sessionStorage.getItem('loggedInUserPassword');

    if (email) {
        const userName = await fetchUserName(email, password);
        if (userName) {
            name = userName;
            sessionStorage.setItem('loggedInUserName', name);
        } else {
            displayError("No name found for this user in the database.");
        }
    }

    const greeting = getGreetingMessage();
    const greetingElement = document.getElementById('greeting');
    const userNameElement = document.getElementById('userName');
    if (greetingElement) greetingElement.textContent = greeting;
    if (userNameElement) userNameElement.textContent = capitalize(name);
}


async function fetchUserName(email, password) {
    try {
        const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
        if (!response.ok) return null;

        const users = await response.json();
        const user = Object.values(users || {}).find(u => u?.email === email && u?.password === password);
        return user?.name || null; // Korrektur: Direkt user.name verwenden
    } catch (error) {
        console.error("Error fetching user data:", error);
        displayError("Error fetching user data.");
        return null;
    }
}

function getGreetingMessage() {
    const hour = parseInt(new Date().getHours(), 10); // Stelle sicher, dass es eine Zahl ist
    console.log("Current Hour:", hour);

    if (hour >= 6 && hour < 9) return 'Moin,';
    if (hour >= 9 && hour < 12) return 'Good Morning,';
    if (hour >= 12 && hour < 17) return 'Good Afternoon,';
    if (hour >= 17 && hour < 22) return 'Good Evening,';
    return 'Good Night,';
}


function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function fadeOutWelcomeMessage() {
    setTimeout(() => {
        const welcomeContainer = document.querySelector('.welcome-container');
        const mainContent = document.getElementById('main-content');

        if (welcomeContainer) {
            welcomeContainer.classList.add('fade-out'); // Begrüßung ausblenden
            welcomeContainer.addEventListener('transitionend', () => {
                welcomeContainer.classList.add('hidden'); // Begrüßung verstecken
                mainContent.classList.remove('hidden'); // Hauptinhalt anzeigen
            });
        }
    }, 1000);
}



async function initializeSummary() {
    const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

    try {
        const response = await fetch(firebaseUrl);
        const tasks = await response.json();

        if (!tasks) {
            displayError("No tasks found.");
            return;
        }

        let todo = 0;
        let inProgress = 0;
        let feedback = 0;
        let done = 0;

        for (let taskId in tasks) {
            const task = tasks[taskId];
            if (task.status === "To do") todo++;
            if (task.status === "In progress") inProgress++;
            if (task.status === "Await feedback") feedback++;
            if (task.status === "Done") done++;
        }

        const total = todo + inProgress + feedback + done;
        updateSummaryElements(todo, done, inProgress, feedback, total);
        updateUrgentDeadline(tasks);
        

    } catch {
        displayError("An error occurred while loading the summary.");
    }
}


function updateUrgentDeadline(tasks) {
    const urgentTasks = Object.values(tasks).filter(t => t.priority === "urgent");
    if (urgentTasks.length === 0) {
        setElementText(".date", "No urgent tasks");
        return;
    }

    // Sortieren nach Datum
    urgentTasks.sort((a, b) => new Date(a.finishedUntil) - new Date(b.finishedUntil));
    const earliest = urgentTasks[0];

    const formatted = formatDateToLongFormat(earliest.finishedUntil);
    setElementText(".date", formatted);
}


function formatDateToLongFormat(dateStr) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const [year, month, day] = dateStr.split("-");
    const monthName = months[parseInt(month)-1];
    return `${monthName} ${parseInt(day)}, ${year}`;
}


function setElementText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}



function updateSummaryElements(todo, done, inProgress, feedback, total) {
    setElementText(".grid.grid-2 .metric-card:nth-child(1) .count", todo);
    setElementText(".grid.grid-2 .metric-card:nth-child(2) .count", done);
    setElementText(".grid.grid-3 .metric-card:nth-child(1) .count", total);        // Alle Tasks
    setElementText(".grid.grid-3 .metric-card:nth-child(2) .count", inProgress);
    setElementText(".grid.grid-3 .metric-card:nth-child(3) .count", feedback);

    makeTasksClickable();
}


function setElementText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}


function displayError(message) {
    const errorElement = document.getElementById("errorDisplay");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove("d-none");
    }
}

function makeTasksClickable() {
    const mapping = [
        { selector: ".grid.grid-2 .metric-card:nth-child(1)", status: "todo" },
        { selector: ".grid.grid-2 .metric-card:nth-child(2)", status: "done" },
        { selector: ".grid.grid-3 .metric-card:nth-child(1)", status: "board" },
        { selector: ".grid.grid-3 .metric-card:nth-child(2)", status: "inprogress" },
        { selector: ".grid.grid-3 .metric-card:nth-child(3)", status: "feedback" },
        { selector: ".urgent-card", status: "urgent" } // Hier fügst du Urgent hinzu
    ];

    mapping.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            element.style.cursor = "pointer";
            element.addEventListener("click", () => {
                window.location.href = `board.html?status=${item.status}`;
            });
        }
    });
}

