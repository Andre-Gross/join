/**
 * Registers a new user by validating the provided inputs
 * (name, email, password, confirm password, and terms agreement)
 * and sending the data to a Firebase database.
 * 
 * Steps performed:
 * - Checks if the terms and conditions are accepted.
 * - Validates if the password and confirm password match.
 * - Verifies if the email already exists in the database.
 * - Sends the data to Firebase and creates a new user object with an empty contacts array and login data.
 * 
 * Displays an appropriate message if the inputs are invalid or the email already exists.
 * Redirects the user to the login page after successful registration.
 * 
 * @async
 * @function signUp
 * @returns {void} Shows a success message on successful registration or an error message for invalid inputs.
 */
async function signUp() {
  const [name, email, password, confirmPassword, agreeTerms] = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "agreeTerms"
  ].map(id => document.getElementById(id).type === "checkbox" 
                ? document.getElementById(id).checked 
                : document.getElementById(id).value.trim());

  if (!agreeTerms) {
      alert("Please agree to the terms and conditions.");
      return;
  }

  if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
  }

  try {
      const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users.json");
      const users = await response.json();

      const emailExists = Object.values(users || {}).some(
          user => user?.login?.email === email
      );

      if (emailExists) {
          alert("This email address is already registered.");
          window.location.href = 'login.html';
          return;
      }

      await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              contacts: [],
              login: { email, name, password }
          })
      });

      alert("Your registration was successful!");
      window.location.href = 'login.html';
  } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred. Please try again.");
  }
}

/**
* Validates the registration form and enables the register button
* only if all fields are filled and the terms checkbox is checked.
* 
* @function checkFormValidity
* @returns {void} Toggles the disabled state of the register button.
*/
function checkFormValidity() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const agreeTerms = document.getElementById("agreeTerms").checked;

  const isFormValid = name && email && password && confirmPassword && agreeTerms;
  document.getElementById("registerButton").disabled = !isFormValid;
}
