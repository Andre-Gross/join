async function signUp() {
    const [email, password, confirmPassword, agreeTerms] = [
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
        const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
        const users = await response.json();
  
        const emailExists = Object.values(users || {}).some(
            user => user?.email === email
        );
  
        if (emailExists) {
            alert("This email address is already registered.");
            window.location.href = 'login.html';
            return;
        }
  
        const newUser = {
            email: email,
            password: password,
            contacts: [] 
        };
  
        const newUserResponse = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });
  
        alert("Your registration was successful!");
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Registration error:", error);
        alert("An error occurred. Please try again.");
    }
  }
  
  
function checkFormValidity() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const agreeTerms = document.getElementById("agreeTerms").checked;

  const isFormValid = name && email && password && confirmPassword && agreeTerms;
  document.getElementById("registerButton").disabled = !isFormValid;
}
