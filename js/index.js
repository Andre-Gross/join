let isSubmitting = false;
let failedAttempts = {};

document.addEventListener("DOMContentLoaded", () => {
  let hasLoadedBefore = localStorage.getItem("hasLoadedBefore");

  if (!hasLoadedBefore) {
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 100);

    setTimeout(() => {
      document.getElementById("loginCard").style.display = "block";
    }, 1600);

    localStorage.setItem("hasLoadedBefore", "true");
  } else {
    document.body.classList.add("loaded");
    document.getElementById("loginCard").style.display = "block";
  }

  let loginForm = document.querySelector("#loginCard form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    logIn();
  });

  let signupForm = document.querySelector("#signupCard form");
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    signUp();
  });

  document
    .querySelector('button[onclick="guestLogIn();"]')
    .addEventListener("click", guestLogIn);

  let signupInputs = signupForm.querySelectorAll("input");
  signupInputs.forEach((input) => {
    input.addEventListener("input", checkFormValidity);
  });
});

/**
 * Fetches all existing users from the database.
 * @returns {Promise<Object>} - A promise resolving to the users object.
 */
async function fetchUsers() {
  let response = await fetch(
    "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json"
  );
  return response.json();
}

/**
 * Hashes a password using SHA-256.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - The hashed password as a hex string.
 */
async function hashPassword(password) {
  let encoder = new TextEncoder();
  let data = encoder.encode(password);
  let hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Clears all input fields in the signup form when switching views.
 */
function clearSignupInputs() {
  document.querySelectorAll("#signupCard input").forEach((input) => {
    if (input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  document.querySelectorAll("#signupCard .password-toggle").forEach((icon) => {
    icon.style.display = "none";
  });

  document
    .querySelectorAll("#signupCard input[type='password']")
    .forEach((input) => {
      input.classList.remove("has-icon");
    });
}

/**
 * Orchestrates the view switching between the login and sign-up forms.
 * Disables transitions, fades out the current view, toggles the display of cards,
 * updates the switch UI, and then fades in the new view.
 */
function switchView() {
  const loginCard = document.getElementById("loginCard");
  const signupCard = document.getElementById("signupCard");

  disableTransitions(loginCard, signupCard);
  setElementsOpacity([loginCard, signupCard], "0");

  setTimeout(() => {
    if (isElementVisible(loginCard)) {
      toggleToSignup(loginCard, signupCard);
    } else {
      toggleToLogin(loginCard, signupCard);
    }
    setElementsOpacity([loginCard, signupCard], "1");
  }, 50);
}

/**
 * Disables CSS transitions for the given elements.
 * @param {...HTMLElement} elements - Elements for which transitions will be disabled.
 */
function disableTransitions(...elements) {
  elements.forEach(el => {
    el.style.transition = "none";
  });
}

/**
 * Sets the opacity for an array of elements.
 * @param {HTMLElement[]} elements - The elements to update.
 * @param {string} opacity - The opacity value to set (e.g., "0" or "1").
 */
function setElementsOpacity(elements, opacity) {
  elements.forEach(el => {
    el.style.opacity = opacity;
  });
}

/**
 * Checks if the given element is currently visible based on its display property.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} - True if the element is visible, false otherwise.
 */
function isElementVisible(element) {
  return element.style.display !== "none";
}

/**
 * Switches from the login view to the sign-up view.
 * Hides the login card, shows the sign-up card, updates the switch UI, and clears sign-up inputs.
 * @param {HTMLElement} loginCard - The login card element.
 * @param {HTMLElement} signupCard - The sign-up card element.
 */
function toggleToSignup(loginCard, signupCard) {
  loginCard.style.display = "none";
  signupCard.style.display = "block";
  updateSwitchUI("Log in", "Already a Join user?");
  clearSignupInputs();
}

/**
 * Switches from the sign-up view to the login view.
 * Hides the sign-up card, shows the login card, and updates the switch UI.
 * @param {HTMLElement} loginCard - The login card element.
 * @param {HTMLElement} signupCard - The sign-up card element.
 */
function toggleToLogin(loginCard, signupCard) {
  signupCard.style.display = "none";
  loginCard.style.display = "block";
  updateSwitchUI("Sign up", "Not a Join user?");
}

/**
 * Updates the text content of the switch button and the accompanying switch text element.
 * @param {string} buttonText - The text to set for the switch button.
 * @param {string} switchTextContent - The text to set for the switch text element.
 */
function updateSwitchUI(buttonText, switchTextContent) {
  const switchButton = document.getElementById("switchButton");
  const switchText = document.getElementById("switchText");
  switchButton.textContent = buttonText;
  switchText.textContent = switchTextContent;
}


/**
 * Retrieves and processes the value of an input field by its ID.
 * @param {string} id - The ID of the input field.
 * @returns {string} - The trimmed value of the input field.
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}


document.addEventListener("DOMContentLoaded", () => {
  const passwordFields = document.querySelectorAll(".password-container input");
  passwordFields.forEach((input) => {
    const icon = input.nextElementSibling;
    input.value = ""; // Passwortfelder leeren
    input.addEventListener("input", () => updatePasswordIcon(input, icon));
    icon.addEventListener("click", () => togglePasswordVisibility(input, icon));
  });
});

function updatePasswordIcon(input, icon) {
  if (!input.value) {
    input.classList.remove("has-icon");
    icon.style.display = "none";
  } else {
    input.classList.add("has-icon");
    icon.style.display = "inline";
    icon.src = "../assets/img/logIn-signUp/visibility-off.svg";
  }
}

function togglePasswordVisibility(input, icon) {
  if (!input.value) return;
  input.type = input.type === "password" ? "text" : "password";
  icon.src = input.type === "password"
    ? "../assets/img/logIn-signUp/visibility-off.svg"
    : "../assets/img/logIn-signUp/visibility-on.svg";
}

/**
 * Logs in as a guest user.
 */
async function guestLogIn() {
  try {
    saveLoggedInUser({ id: "guest", name: "Guest" });
    sessionStorage.setItem("loggedInUserId", "Guest");
    redirectToSummary(true);
  } catch {
    displayError(
      "An error occurred during guest login. Please try again later."
    );
  }
}

/**
 * Adds a user to the contacts list.
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 */
async function addUserToContacts(name, email) {
  let assignedColor = getRandomColor();

  try {
    await postContactToDatabase(name, email, "", assignedColor);
  } catch (error) {
    console.error("Error adding contact:", error);
  }
}

/**
 * Generates a unique ID.
 * @returns {string} - A unique ID.
 */
// function generateUniqueId() {
//   return "_" + Math.random().toString(36).substr(2, 9);
// }

function clearFormInputs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const inputs = container.querySelectorAll("input");
  inputs.forEach((input) => {
    if (input.type === "checkbox" || input.type === "radio") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });
}

function clearAllForms() {
  ["loginCard", "signupCard", "passwordResetCard"].forEach(clearFormInputs);
}

document.addEventListener("DOMContentLoaded", clearAllForms);

/**
 * Displays the login error message by removing the 'd-none' class.
 */
function displayPasswordErrorDiv() {
  document.getElementById("text-error-password").classList.remove("d-none");
}

/**
 * Hides the login error message by adding the 'd-none' class.
 */
function hidePasswordError() {
  document.getElementById("text-error-password").classList.add("d-none");
}

/**
 * Displays the sign-up error message by removing the 'd-none' class.
 */
function displaySignUpPasswordError() {
  document
    .getElementById("text-error-password-signUp")
    .classList.remove("d-none");
}

/**
 * Hides the sign-up error message by adding the 'd-none' class.
 */
function hideSignUpPasswordError() {
  document.getElementById("text-error-password-signUp").classList.add("d-none");
}

/**
 * Displays the reset password error message by removing the 'd-none' class.
 */
function displayResetPasswordError() {
  document
    .getElementById("text-error-password-resetPassword")
    .classList.remove("d-none");
}

/**
 * Hides the reset password error message by adding the 'd-none' class.
 */
function hideResetPasswordError() {
  document
    .getElementById("text-error-password-resetPassword")
    .classList.add("d-none");
}


/**
 * Attaches input event listeners to email and password fields to hide error messages on user input.
 * @function addInputEventListeners
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("email").addEventListener("input", hidePasswordError);
  document.getElementById("password").addEventListener("input", hidePasswordError);
  document.getElementById("signUpEmail").addEventListener("input", hideSignUpPasswordError);
  document.getElementById("confirmPassword").addEventListener("input", hideSignUpPasswordError);
  document.getElementById("resetEmail").addEventListener("input", hideResetPasswordError);
  document.getElementById("confirmResetPassword").addEventListener("input", hideResetPasswordError);
});
