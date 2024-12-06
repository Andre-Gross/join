async function logIn() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/logins.json");
        const users = await response.json();

        
        const user = Object.values(users || {}).find(
            user => user?.email === email && user?.password === password
        );

        if (!user) {
            alert("Invalid email or password.");
            return;
        }
                
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));

        
        window.location.href = 'summary.html'; 
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
    }
}


async function guestLogIn() {
    try {
        
        await putLoggedInUser('guest');

        
        window.location.href = 'summary.html?userId=guest';
    } catch (error) {
        console.error("Fehler beim Gast-Login:", error);
        alert("Ein Fehler ist aufgetreten. Versuche es später noch einmal.");
    }
}
