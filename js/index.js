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
 * Switches between login and signup view.
 */
function switchView() {
  let loginCard = document.getElementById("loginCard");
  let signupCard = document.getElementById("signupCard");
  let switchButton = document.getElementById("switchButton");
  let switchText = document.getElementById("switchText");

  loginCard.style.transition = "none";
  signupCard.style.transition = "none";

  loginCard.style.opacity = "0";
  signupCard.style.opacity = "0";

  setTimeout(() => {
    if (loginCard.style.display !== "none") {
      loginCard.style.display = "none";
      signupCard.style.display = "block";
      switchButton.textContent = "Log in";
      switchText.textContent = "Already a Join user?";
      clearSignupInputs();
    } else {
      signupCard.style.display = "none";
      loginCard.style.display = "block";
      switchButton.textContent = "Sign up";
      switchText.textContent = "Not a Join user?";
    }

    signupCard.style.opacity = "1";
    loginCard.style.opacity = "1";
  }, 50);
}

/**
 * Retrieves and processes the value of an input field by its ID.
 * @param {string} id - The ID of the input field.
 * @returns {string} - The trimmed value of the input field.
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Updates the visibility icon when text is entered or removed.
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The visibility icon.
 */
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

/**
 * Toggles the password visibility and updates the icon.
 * @param {HTMLInputElement} input - The password input field.
 * @param {HTMLImageElement} icon - The clicked eye icon.
 */
function togglePasswordVisibility(input, icon) {
  if (!input.value) return;

  if (input.type === "password") {
    input.type = "text";
    icon.src = "../assets/img/logIn-signUp/visibility-on.svg";
  } else {
    input.type = "password";
    icon.src = "../assets/img/logIn-signUp/visibility-off.svg";
  }
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
function generateUniqueId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

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
