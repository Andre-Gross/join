window.resetPassword = resetPassword;
let toastMessageReset = '<span>Password reset successfully</span>';

document.addEventListener("DOMContentLoaded", () => {
  let forgotPasswordLink = document.getElementById("forgotPassword");
  let backToLoginLink = document.getElementById("backToLogin");
  let passwordResetForm = document.querySelector("#passwordResetCard form");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      openPasswordReset();
    });
  }

  if (backToLoginLink) {
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchToLogin();
    });
  }

  if (passwordResetForm) {
    passwordResetForm.addEventListener("submit", submitResetPassword);
  }
});

/**
 * Opens the password reset view by hiding the login card and displaying the password reset card.
 */
function openPasswordReset() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("passwordResetCard").style.display = "block";
  document.getElementById("switchExtras").style.display = "none", "important";
}

/**
 * Switches back to the login view by hiding the password reset card and displaying the login card.
 */
function switchToLogin() {
  document.getElementById("passwordResetCard").style.display = "none";
  document.getElementById("loginCard").style.display = "block";
  document.getElementById("switchExtras").style.display = "flex";
}

/**
 * Handles the submission of the password reset form.
 * @param {Event} e - The form submission event.
 */
async function submitResetPassword(e) {
  e.preventDefault();
  let email = document.getElementById("resetEmail").value.trim();
  let newPassword = document.getElementById("resetPassword").value.trim();
  let confirmPassword = document.getElementById("confirmResetPassword").value.trim();
  if (!email || !newPassword || !confirmPassword) return showToast("Please fill in all fields", "error");
  if (newPassword !== confirmPassword) return showToast("Passwords do not match", "error");
  await resetPassword(email, newPassword);
}

/**
 * Resets the password for a user with the given email.
 * @param {string} email - The email of the user.
 * @param {string} newPassword - The new password to set.
 */
async function resetPassword(email, newPassword) {
  let response = await fetch(`${BASE_URL}/users/logins.json`);
  if (!response.ok) return showToast("Error fetching data", "error");
  let users = await response.json();
  let userKey = Object.keys(users).find(key => users[key].email.toLowerCase() === email.toLowerCase());
  if (!userKey) return showToast("Email not found", "error");
  await updatePassword(userKey, newPassword);
}

/**
 * Updates the password for a user in the database.
 * @param {string} userKey - The key of the user in the database.
 * @param {string} newPassword - The new password to set.
 */
async function updatePassword(userKey, newPassword) {
  await fetch(`${BASE_URL}/users/logins/${userKey}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword })
  });
  showToast(toastMessageReset, "middle", 1000);
  setTimeout(switchToLogin, 2000);
}