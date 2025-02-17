/**
 * Handles the user login process.
 */
async function logIn() {
  hidePasswordError();

  let email = getInputValue("email");
  let password = getInputValue("password");

  if (!email || !password) {
    displayPasswordErrorDiv();
    return;
  }

  try {
    let users = await fetchUsers();
    let user = findUserByEmail(users, email);
    if (!user) {
      displayPasswordErrorDiv();
      return;
    }
    if (user.password !== password) {
      handleFailedAttempt(email);
      return;
    }

    resetFailedAttempts(email);
    hidePasswordError();
    saveLoggedInUser(user);
    redirectToSummary();
  } catch {
    displayPasswordErrorDiv();
  }
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
