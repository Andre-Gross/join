let toastMessageSignUp = "<span>You Signed Up successfully</span>";
let toastMessageEmailAlreadyRegistered =
  "<span>Email already registered. Please try again.</span>";

document.addEventListener("DOMContentLoaded", () => {
  let signupForm = document.querySelector("#signupCard form");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      signUp();
    });
  }
});

/**
 * Initiates the user registration process by validating form data,
 * ensuring the email is not already registered, registering the new user,
 * adding the user to contacts, and displaying a success message with redirection.
 */
async function signUp() {
  if (isSubmitting) return;
  isSubmitting = true;

  let { name, email, password, confirmPassword, agreeTerms } =
    getSignUpInputs();

  hideSignUpPasswordError();

  if (!validateSignUpForm(agreeTerms, password, confirmPassword)) {
    isSubmitting = false;
    return;
  }

  try {
    await ensureEmailNotRegistered(email);
    await registerUser(name, email, password);
    await addUserToContacts(name, email);
    showSuccessAndRedirect();
  } catch {
  } finally {
    isSubmitting = false;
  }
}

/**
 * Retrieves the sign-up form input values.
 * @returns {{name: string, email: string, password: string, confirmPassword: string, agreeTerms: boolean}}
 */
function getSignUpInputs() {
  let [name, email, password, confirmPassword, agreeTerms] = [
    "name",
    "signUpEmail",
    "signUpPassword",
    "confirmPassword",
    "agreeTerms",
  ].map((id) => {
    let element = document.getElementById(id);
    return element.type === "checkbox" ? element.checked : element.value.trim();
  });
  return { name, email, password, confirmPassword, agreeTerms };
}

/**
 * Validates the sign-up form data.
 * Checks if the user agreed to the terms and if the password matches the confirmation.
 * @param {boolean} agreeTerms - Whether the user agreed to the terms.
 * @param {string} password - The entered password.
 * @param {string} confirmPassword - The confirmation of the password.
 * @returns {boolean} True if validation passes, false otherwise.
 */
function validateSignUpForm(agreeTerms, password, confirmPassword) {
  if (!agreeTerms) {
    displayError("Please agree to the terms and conditions.");
    return false;
  }
  if (password !== confirmPassword) {
    displaySignUpPasswordError();
    return false;
  }
  return true;
}

/**
 * Ensures that the provided email is not already registered.
 * Fetches the list of users and checks for an existing registration.
 * @param {string} email - The email to check.
 * @returns {Promise<void>}
 * @throws Will throw an error if the email is already registered.
 */
async function ensureEmailNotRegistered(email) {
  let users = await fetchUsers();
  if (isEmailAlreadyRegistered(users, email)) {
    showToast(toastMessageEmailAlreadyRegistered, "middle", 2000);
    throw new Error("Email already registered. Please try again.");
  }
}

/**
 * Registers a new user in the database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<void>}
 */
async function registerUser(name, email, password) {
  await registerNewUser(name, email, password);
}

/**
 * Displays a success message and redirects to the login page after a short delay.
 */
function showSuccessAndRedirect() {
  showToast(toastMessageSignUp, "middle", 1000);
  setTimeout(() => {
    redirectToLogin(true);
  }, 1000);
}

/**
 * Registers a new user in the database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
async function registerNewUser(name, email, password) {
  let newUser = { name, email, password, contacts: [] };
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
  let url = isSuccess
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
  let name = document.getElementById("name").value.trim();
  let emailInput = document.getElementById("signUpEmail");
  let email = emailInput.value.trim();
  let password = document.getElementById("signUpPassword").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let agreeTerms = document.getElementById("agreeTerms").checked;
  let isEmailValid = email === "" ? true : validateEmailField(emailInput);
  let isFormValid =
    name && isEmailValid && password && confirmPassword && agreeTerms;
  document.getElementById("registerButton").disabled = !isFormValid;
}

function validateEmailOnBlur() {
  let emailInput = document.getElementById("signUpEmail");
  let emailErrorSpan = document.getElementById(
    "text-error-password-signUp-email"
  );

  if (emailInput.value.trim() !== "" && !validateEmailField(emailInput)) {
    emailErrorSpan.classList.remove("d-none");
  } else {
    emailErrorSpan.classList.add("d-none");
  }

  checkFormValidity();
}
