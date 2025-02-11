/**
 * Handles the user login process.
 */
async function logIn() {
    const email = getInputValue("email");
    const password = getInputValue("password");
  
    if (!email || !password) {
      displayError("Please enter both email and password.");
      return;
    }
  
    try {
      const users = await fetchUsers();
      const user = findUserByEmail(users, email);
  
      if (!user) {
        displayNotRegisteredError(); // Benutzer nicht registriert
        return;
      }
  
      if (user.password !== password) {
        handleFailedAttempt(email); // Verarbeite fehlgeschlagene Versuche
        return;
      }
  
      resetFailedAttempts(email); // Zurücksetzen der fehlgeschlagenen Versuche
      saveLoggedInUser(user);
      redirectToSummary();
    } catch {
      displayError("An error occurred during login. Please try again.");
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
  
    if (failedAttempts[email] >= 3) {
      displayError("Too many failed attempts. Please reset your password.");
      showResetPasswordOption(email);
    } else {
      displayError("Incorrect password. Please try again.");
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
 * Displays an error message if the user is not registered.
 */
function displayNotRegisteredError() {
    displayError("You are not registered. Please sign up to continue.");
  }


  /**
 * Saves the logged-in user's information in the session storage.
 * The password is hashed before saving.
 * @param {Object} user - The user object to save.
 */
async function saveLoggedInUser(user) {
    const hashedPassword = await hashPassword(user.password);
    const userToSave = { ...user, password: hashedPassword }; // Passwort ersetzen
    sessionStorage.setItem("loggedInUser", JSON.stringify(userToSave));
  }


  /**
 * Redirects the user to the summary page.
 * @param {boolean} [isGuest=false] - Whether the login is for a guest user.
 */
function redirectToSummary(isGuest = false) {
    const url = isGuest ? "summary.html?userId=guest" : "summary.html";
    window.location.href = url;
  }


  