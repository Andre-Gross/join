window.resetPassword = resetPassword;

document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordLink = document.getElementById("forgotPassword");
  const backToLoginLink = document.getElementById("backToLogin");
  const passwordResetForm = document.querySelector("#passwordResetCard form");

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

function openPasswordReset() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("passwordResetCard").style.display = "block";
  document.getElementById("switchExtras").style.display = "none", "important";
}

function switchToLogin() {
  document.getElementById("passwordResetCard").style.display = "none";
  document.getElementById("loginCard").style.display = "block";
  document.getElementById("switchExtras").style.display = "flex";
}


async function submitResetPassword(e) {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value.trim();
  const newPassword = document.getElementById("resetPassword").value.trim();
  const confirmPassword = document.getElementById("confirmResetPassword").value.trim();
  if (!email || !newPassword || !confirmPassword) return showToast("Alle Felder ausfüllen", "error");
  if (newPassword !== confirmPassword) return showToast("Passwörter stimmen nicht überein", "error");
  await resetPassword(email, newPassword);
}

async function resetPassword(email, newPassword) {
  let response = await fetch(`${BASE_URL}/users/logins.json`);
  if (!response.ok) return showToast("Fehler beim Abrufen der Daten", "error");
  let users = await response.json();
  let userKey = Object.keys(users).find(key => users[key].email.toLowerCase() === email.toLowerCase());
  if (!userKey) return showToast("E-Mail nicht gefunden", "error");
  await updatePassword(userKey, newPassword);
}

async function updatePassword(userKey, newPassword) {
  await fetch(`${BASE_URL}/users/logins/${userKey}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword })
  });
  showToast("Passwort erfolgreich geändert", "success");
  setTimeout(switchToLogin, 2000);
}

function showToast(message, type) {
  let toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
