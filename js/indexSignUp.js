let toastMessageSignUp = '<span>You Signed Up successfully</span>';


document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector("#signupCard form");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      signUp();
    });
  }
});

/**
 * Handles the user registration process.
 */
async function signUp() {
  if (isSubmitting) return; 
  isSubmitting = true;
  const [name, email, password, confirmPassword, agreeTerms] = getInputValues();

  if (!agreeTerms || password !== confirmPassword) {
    displayError(
      getValidationErrorMessage(agreeTerms, password, confirmPassword)
    );
    return;
  }

  try {
    const users = await fetchUsers();
    if (isEmailAlreadyRegistered(users, email)) {
      redirectToLogin();
      isSubmitting = false;
      return;
    }
    await registerNewUser(name, email, password);
    await addUserToContacts(name, email);

    isSubmitting = false;
    showToast(toastMessageSignUp, "middle", 1000);
    setTimeout(() => {
      redirectToLogin(true);
    }, 1000);
  } catch {
    isSubmitting = false;
    displayError("An error occurred during registration. Please try again.");
  }
}

/**
 * Registers a new user in the database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
async function registerNewUser(name, email, password) {
  const newUser = { name, email, password, contacts: [] };
  await fetch(
    "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }
  );
}

/**
 * Checks if the given email is already registered.
 * @param {Object} users - The existing users object.
 * @param {string} email - The email to check.
 * @returns {boolean} - True if the email is already registered, otherwise false.
 */
function isEmailAlreadyRegistered(users, email) {
  return Object.values(users || {}).some((user) => user?.email === email);
}

/**
 * Redirects the user to the login page.
 * @param {boolean} [isSuccess] - Whether the registration was successful.
 */
function redirectToLogin(isSuccess = false) {
  const url = isSuccess
    ? "index.html?registered=true"
    : "index.html?error=emailExists";
  window.location.href = url;
}

/**
 * Retrieves and processes form input values.
 * @returns {Array} - Array of processed input values.
 */
function getInputValues() {
  return [
    "name",
    "signUpEmail",
    "signUpPassword",
    "confirmPassword",
    "agreeTerms",
  ].map((id) =>
    document.getElementById(id).type === "checkbox"
      ? document.getElementById(id).checked
      : document.getElementById(id).value.trim()
  );
}

/**
 * Validates the registration form inputs and updates the register button state.
 */
function checkFormValidity() {
  const [name, email, password, confirmPassword, agreeTerms] = [
    "name",
    "signUpEmail",
    "signUpPassword",
    "confirmPassword",
    "agreeTerms",
  ].map((id) =>
    document.getElementById(id).type === "checkbox"
      ? document.getElementById(id).checked
      : document.getElementById(id).value.trim()
  );
  const isFormValid =
    name && email && password && confirmPassword && agreeTerms;
  document.getElementById("registerButton").disabled = !isFormValid;
}

/**
 * Determines the validation error message.
 * @param {boolean} agreeTerms - Whether the terms were agreed to.
 * @param {string} password - The entered password.
 * @param {string} confirmPassword - The confirmed password.
 * @returns {string} - The appropriate error message.
 */
function getValidationErrorMessage(agreeTerms, password, confirmPassword) {
  if (!agreeTerms) return "Please agree to the terms and conditions.";
  if (password !== confirmPassword) return "Password do not match.";
  return "An unknown validation error occurred.";
}


/**
 * Displays an error message as a toast notification.
 *
 * @param {string} message - The error message to display.
 */
function displayError(message) {
  showToast(`<span>${message}</span>`, "middle", 2000);
}