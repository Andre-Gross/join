/**
 * Event listener for the DOMContentLoaded event.
 * - Includes external HTML content.
 * - Initializes user data (e.g., session, preferences).
 * - Displays the logged-in user's name or greets as a guest.
 * - Fades out the welcome message after loading.
 * - Initializes the summary section of the page.
 *
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", async () => {
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
  let loggedInUser = sessionStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    displayError("No valid user data found in sessionStorage.");
    return;
  }

  let user = JSON.parse(loggedInUser);
  sessionStorage.setItem("loggedInUserEmail", user.email || "");
  sessionStorage.setItem("loggedInUserPassword", user.password || "");
  sessionStorage.setItem("loggedInUserId", user.name || "");
}

/**
 * Displays the user's name based on the stored session data.
 * - Checks if a logged-in user is available from session storage.
 * - Fetches the user's name from the database if logged in.
 * - If no name is found, displays an error or greets as a guest.
 * - Updates the UI with an appropriate greeting message for the user.
 *
 * @returns {void}
 */
async function displayUserName() {
  let name = "Guest";
  let email = sessionStorage.getItem("loggedInUserEmail");
  let password = sessionStorage.getItem("loggedInUserPassword");

  if (email) {
    let userName = await fetchUserName(email, password);
    if (userName) {
      name = userName;
      sessionStorage.setItem("loggedInUserName", name);
    } else {
      displayError("No name found for this user in the database.");
    }
  }

  if (name === "Guest") {
    greetGuest();
  } else {
    let greeting = getGreetingMessage();
    updateGreetingUI(greeting, name);
  }
}

/**
 * Displays a greeting message without a name for guests.
 */
function greetGuest() {
  let greeting = getGreetingMessage();
  if (greeting.endsWith(",")) {
    greeting = greeting.slice(0, -1);
  }
  updateGreetingUI(greeting, "");
}

/**
 * Updates the greeting UI with a message and optionally a name.
 *
 * @param {string} greeting - The greeting message.
 * @param {string} name - The user's name (empty string for guests).
 */
function updateGreetingUI(greeting, name) {
  let greetingElement = document.getElementById("greeting");
  let userNameElement = document.getElementById("userName");

  if (greetingElement) greetingElement.textContent = greeting;
  if (userNameElement)
    userNameElement.textContent = name ? capitalize(name) : "";
}

/**
 * Fetches the user's name from the database based on the provided email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<string|null>} - Returns the user's name if found, or null if not found or an error occurs.
 */
async function fetchUserName(email, password) {
  try {
    let response = await fetch(
      "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json"
    );
    if (!response.ok) return null;

    let users = await response.json();
    let user = Object.values(users || {}).find((u) => u?.email === email);
    return user?.name || null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    displayError("Error fetching user data.");
    return null;
  }
}

/**
 * Returns a greeting message based on the current time of day.
 *
 * @returns {string} - A greeting message appropriate for the current time (e.g., "Good Morning,", "Good Evening,").
 */
function getGreetingMessage() {
  let hour = parseInt(new Date().getHours(), 10);

  if (hour >= 3 && hour < 6) return "Good Early Morning,";
  if (hour >= 6 && hour < 12) return "Good Morning,";
  if (hour >= 12 && hour < 17) return "Good Afternoon,";
  if (hour >= 17 && hour < 22) return "Good Evening,";
  return "Good Night,";
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} - The input string with the first letter capitalized.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Fades out the welcome message and shows the main content of the page.
 * The welcome message will only fade out if it has not been shown before and the screen width is smaller than 1150px.
 * Uses sessionStorage to track whether the animation has been shown.
 */
function fadeOutWelcomeMessage() {
  let welcomeContainer = document.querySelector(".welcome-container");
  let mainContent = document.getElementById("main-content");

  mainContent.classList.add("hidden");

  let animationShown = sessionStorage.getItem("greetingAnimationShown");

  if (!animationShown && welcomeContainer && window.innerWidth < 1150) {
    setTimeout(() => {
      welcomeContainer.classList.add("fade-out");
      welcomeContainer.addEventListener(
        "transitionend",
        () => {
          welcomeContainer.classList.add("hidden");
          mainContent.classList.remove("hidden");
          mainContent.classList.add("visible");

          sessionStorage.setItem("greetingAnimationShown", "true");
        },
        { once: true }
      );
    }, 500);
  } else {
    welcomeContainer?.classList.add("hidden");
    mainContent?.classList.remove("hidden");
    mainContent?.classList.add("visible");
  }
}

/**
 * Adds an event listener that triggers the `fadeOutWelcomeMessage` function once the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", fadeOutWelcomeMessage);

/**
 * Handles window resize events to adjust the visibility of the welcome message and main content.
 * - On large screens (>=1000px), both the welcome message and main content are visible.
 * - On smaller screens, the welcome message is hidden if the greeting animation has already been shown.
 */
function handleResize() {
  let isLargeScreen = window.innerWidth >= 1000;
  let welcomeContainer = document.querySelector(".welcome-container");
  let mainContent = document.getElementById("main-content");

  if (isLargeScreen) {
    if (welcomeContainer) welcomeContainer.classList.remove("hidden");
    if (mainContent) mainContent.classList.remove("hidden");
  } else {
    let animationShown = sessionStorage.getItem("greetingAnimationShown");
    if (animationShown) {
      if (welcomeContainer) welcomeContainer.classList.add("hidden");
    }
  }
}

/**
 * Adds an event listener that triggers the `handleResize` function when the window is resized.
 */
window.addEventListener("resize", handleResize);

/**
 * Adds an event listener to trigger the `handleResize` function once the DOM content has loaded.
 */
document.addEventListener("DOMContentLoaded", handleResize);

/**
 * Fetches and calculates the summary of tasks from Firebase.
 *
 * @async
 * @function initializeSummary
 * @returns {Promise<void>} Resolves when the summary is successfully updated or logs an error if something goes wrong.
 */
async function initializeSummary() {
  let firebaseUrl =
    "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  try {
    let response = await fetch(firebaseUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    let tasks = await response.json();
    if (!tasks) {
      updateSummaryElements(0, 0, 0, 0, 0);
      return;
    }

    let { todo, inProgress, feedback, done } =
      calculateTaskStatusCounts(tasks);
    let total = todo + inProgress + feedback + done;

    updateSummaryElements(todo, done, inProgress, feedback, total);
    updateUrgentDeadline(tasks);
  } catch (error) {
    console.error("Error loading summary:", error);
    displayError("An error occurred while loading the summary.");
  }
}

/**
 * Calculates the number of tasks for each status.
 *
 * @function calculateTaskStatusCounts
 * @param {Object} tasks - The tasks object from Firebase.
 * @returns {Object} An object containing counts for each task status.
 */
function calculateTaskStatusCounts(tasks) {
  let todo = 0,
    inProgress = 0,
    feedback = 0,
    done = 0;

  for (let taskId in tasks) {
    let task = tasks[taskId];
    if (task.status === "To do") todo++;
    if (task.status === "In progress") inProgress++;
    if (task.status === "Await feedback") feedback++;
    if (task.status === "Done") done++;
  }

  return { todo, inProgress, feedback, done };
}

/**
 * Updates the summary UI with the calculated task counts.
 *
 * @function updateSummaryElements
 * @param {number} todo - Count of "To do" tasks.
 * @param {number} done - Count of "Done" tasks.
 * @param {number} inProgress - Count of "In progress" tasks.
 * @param {number} feedback - Count of "Await feedback" tasks.
 * @param {number} total - Total count of tasks.
 */
function updateSummaryElements(todo, done, inProgress, feedback, total) {
  setElementText("#todo-count", todo);
  setElementText("#done-count", done);
  setElementText("#in-progress-tasks", inProgress);
  setElementText("#feedback-tasks", feedback);
  setElementText("#total-tasks", total);
}

/**
 * Formats a date string into a readable, long format (e.g., "January 1, 2025").
 *
 * @function formatDateToLongFormat
 * @param {string} dateString - The date string to be formatted.
 * @returns {string} The formatted date string.
 */
function formatDateToLongFormat(dateString) {
  if (!dateString) return "Invalid date";

  let date = new Date(dateString);
  if (isNaN(date)) return "Invalid date";

  let options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Updates the urgent deadline UI with the next upcoming urgent task.
 *
 * @function updateUrgentDeadline
 * @param {Object} tasks - The tasks object from Firebase.
 */
function updateUrgentDeadline(tasks) {
  let urgentTasks = Object.values(tasks).filter(
    (t) => t.priority === "urgent"
  );
  let urgentCount = urgentTasks.length;

  setElementText("#urgent-count", urgentCount);

  if (urgentCount === 0) {
    setElementText("#urgent-deadline", "No Deadline");
  } else {
    urgentTasks.sort(
      (a, b) => new Date(a.finishedUntil) - new Date(b.finishedUntil)
    );
    let earliest = urgentTasks[0];
    let formatted = formatDateToLongFormat(earliest.finishedUntil);
    setElementText("#urgent-deadline", formatted);
  }
}

/**
 * Sets the text content of an element selected by the given selector.
 *
 * @function setElementText
 * @param {string} selector - The CSS selector for the element.
 * @param {string} value - The text value to set.
 */
function setElementText(selector, value) {
  let element = document.querySelector(selector);
  if (element) element.textContent = value;
}

/**
 * Displays an error message in the UI.
 *
 * @function displayError
 * @param {string} message - The error message to display.
 */
function displayError(message) {
  let errorElement = document.getElementById("errorDisplay");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("d-none");
    setTimeout(() => {
      errorElement.classList.add("d-none");
    }, 5000);
  }
}

/**
 * Initializes the summary functionality once the document content is fully loaded.
 *
 * @event DOMContentLoaded
 * @listens document#DOMContentLoaded
 * @description Calls the `initializeSummary` function to set up the summary after the page's content is loaded.
 */
document.addEventListener("DOMContentLoaded", initializeSummary);
