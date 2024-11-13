let BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';
let loggedInUser = '';


async function getLoggedInUser() {
    let response = await fetch(BASE_URL + 'users/.json');
    let responseAsJSON = await response.json();
    loggedInUser = responseAsJSON['loggedInUser'];
}


async function putLoggedInUser(user) {
    fetch(BASE_URL + '/users/loggedInUser.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })
        .then(response => response.json())
        .then(data => console.log('Profil erfolgreich aktualisiert:', data))
        .catch(error => console.error('Fehler beim Aktualisieren des Profils:', error));
}


/**
 * This function returns the datas of all tasks. 
 * 
 * @returns {object} - This object includes the datas of all tasks.
 */
async function getTasks() {
    let response = await fetch(BASE_URL + 'tasks/.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


/**
 * This function returns the contacts of the user as JSON
 * 
 * @returns {JSON} - This object includes all datas of all contacts of the user.
 */
async function getContacts() {
    await getLoggedInUser();
    let response = await fetch(BASE_URL + 'users/' + loggedInUser + '/contacts' + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


/**
 * This function post the datas of a new contact with another function. If the response is an error, it catch it.
 * 
 * @param {object} data - Datas of the new contact.
 * @param {string} user - ID of the user, who should get the datas of the new contact. The standart user is the aktive user.
 */
async function postContactToDatabase(data, user = loggedInUser) {
    try {
        tryPostContactToDatabase(data, user);
    } catch (error) {
        console.error("Fehler beim Speichern des Kontaktes:", error);
        alert("Beim Speichern des Kontaktes ist ein Fehler aufgetreten.");
    }
}


/**
 * This function post the datas of a new contact. If there is an error, it give an response. Otherwise it give an positve alert.
 * 
 * @param {object} data - Datas of the new contact.
 * @param {string} user - ID of the user, who should get the datas of the new contact.   
 */
async function tryPostContactToDatabase(data, user) {
    const response = await fetch(BASE_URL + `users/${user}/contacts.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    alert("Kontakt erfolgreich hinzugefügt.");
}


/**
 * This function post the datas of task to the database with another function. If the response is an erro, it catch it.
 * 
 * @param {object} data - Datas of the task.
 */
async function postTaskToDatabase(data) {
    try {
        tryPostTaskToDatabase(data);
    } catch (error) {
        console.error("Fehler beim Speichern der Aufgabe:", error);
        alert("Beim Speichern der Aufgabe ist ein Fehler aufgetreten.");
    }
}


/**
 * This function post the datas of a new task. If there is an error, it give an response. Otherwise it give an positve alert.
 * 
 * @param {object} data - datas of the task
 */
async function tryPostTaskToDatabase(data) {
    const response = await fetch(BASE_URL + `tasks.json`, {
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


