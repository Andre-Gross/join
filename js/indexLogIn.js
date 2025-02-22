/**
 * Orchestrates the login process by retrieving inputs, authenticating the user,
 * and processing a successful login.
 */
async function logIn() {
  hidePasswordError();
  const { email, password } = getLoginInputs();
  if (!email || !password) {
    displayPasswordErrorDiv();
    return;
  }
  try {
    const user = await authenticateUser(email, password);
    processSuccessfulLogin(user);
  } catch (error) {
    displayPasswordErrorDiv();
  }
}

/**
 * Retrieves the login input values.
 * @returns {{email: string, password: string}} The email and password from the input fields.
 */
function getLoginInputs() {
  const email = getInputValue("email");
  const password = getInputValue("password");
  return { email, password };
}

/**
 * Authenticates the user credentials.
 * Fetches the users, finds the matching user by email,
 * and verifies that the password is correct.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The authenticated user object.
 * @throws Will throw an error if the user is not found or the password is invalid.
 */
async function authenticateUser(email, password) {
  const users = await fetchUsers();
  const user = findUserByEmail(users, email);
  if (!user) {
    displayPasswordErrorDiv();
    throw new Error("User not found");
  }
  if (user.password !== password) {
    handleFailedAttempt(email);
    throw new Error("Invalid password");
  }
  return user;
}

/**
 * Processes a successful login.
 * Resets the failed login attempts, hides error messages,
 * saves the logged-in user, and redirects to the summary page.
 * @param {Object} user - The authenticated user object.
 */
function processSuccessfulLogin(user) {
  resetFailedAttempts(user.email);
  hidePasswordError();
  saveLoggedInUser(user);
  redirectToSummary();
}


/**
 * Finds a user in the database by email.
 * @param {Object} users - The existing users object.
 * @param {string} email - The email to find.
 * @returns {Object|null} - The matched user or null if not found.
 */
function findUserByEmail(users, email) {
  return (
    Object.values(users || {}).find((user) => user?.email === email) || null
  );
}

/**
 * Handles failed login attempts and shows a reset password option after 3 tries.
 * @param {string} email - The user's email address.
 */
function handleFailedAttempt(email) {
  failedAttempts[email] = (failedAttempts[email] || 0) + 1;

  displayPasswordErrorDiv();

  if (failedAttempts[email] >= 3) {
    showResetPasswordOption(email);
  }
}

/**
 * Resets the failed login attempts for a user.
 * @param {string} email - The user's email address.
 */
function resetFailedAttempts(email) {
  delete failedAttempts[email];
}

/**
 * Saves the logged-in user's information in the session storage.
 * The password is hashed before saving.
 * @param {Object} user - The user object to save.
 */
async function saveLoggedInUser(user) {
  let hashedPassword = await hashPassword(user.password);
  let userToSave = { ...user, password: hashedPassword };
  sessionStorage.setItem("loggedInUser", JSON.stringify(userToSave));
}

/**
 * Redirects the user to the summary page.
 * @param {boolean} [isGuest=false] - Whether the login is for a guest user.
 */
function redirectToSummary(isGuest = false) {
  let url = isGuest ? "summary.html?userId=guest" : "summary.html";
  window.location.href = url;
}
