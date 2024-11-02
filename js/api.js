let BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';
let loggedInUser = '2';


async function loadData() {
    let response = await fetch(BASE_URL + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


async function loadUserData(userId) {
    let response = await fetch(`${BASE_URL}users/${userId}.json`);
    let userData = await response.json();
    return userData;
}


async function loadContacts() {
    let response = await fetch(BASE_URL + 'users/' + loggedInUser + '/contacts' + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


async function postTaskToDatabase(boardId, data) {
    try {
        tryPostTaskToDatabase(boardId, data);
    } catch (error) {
        console.error("Fehler beim Speichern der Aufgabe:", error);
        alert("Beim Speichern der Aufgabe ist ein Fehler aufgetreten.");
    }
}


async function tryPostTaskToDatabase(boardId, data) {
    const response = await fetch(BASE_URL + `boards/${boardId}.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    alert("Aufgabe erfolgreich hinzugefügt.");
}