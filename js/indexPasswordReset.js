window.resetPassword = resetPassword;
let toastMessageReset = "<span>Password reset successfully</span>";

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
  document.getElementById("switchExtras").style.display = "none";

  document.getElementById("resetEmail").value = "";
  document.getElementById("resetPassword").value = "";
  document.getElementById("confirmResetPassword").value = "";
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
  hideResetPasswordError();

  let email = document.getElementById("resetEmail").value.trim();
  let newPassword = document.getElementById("resetPassword").value.trim();
  let confirmPassword = document
    .getElementById("confirmResetPassword")
    .value.trim();

  if (!email || !newPassword || !confirmPassword) {
    return showToast("Please fill in all fields", "error");
  }

  if (newPassword !== confirmPassword) {
    displayResetPasswordError();
    return;
  }

  await resetPassword(email, newPassword);
}

/**
 * Resets the user's password by updating it in the database.
 *
 * @param {string} email - The email address of the user.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<void>} A promise that resolves when the password has been updated.
 * @throws Will show an error toast if the password update fails.
 */
async function resetPassword(email, newPassword) {
  try {
    await updateUserPassword(email, newPassword);
    showToast(toastMessageReset, "middle", 2000);
    switchToLogin();
  } catch (error) {
    showToast(error.message, "error");
  }
}
