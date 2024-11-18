let BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';
let loggedInUser = '';


/**
 * This function returns the loggedInUser from the database.
 * 
 * @returns {string} - the value of the loggedInUser in the database 
 */
async function getLoggedInUser() {
    let response = await fetch(BASE_URL + 'users/.json');
    let responseAsJSON = await response.json();
    return responseAsJSON['loggedInUser'];
}


/*
 * This function set value if the loggedInUser of the database in the global variable if loggedInUser.
 * 
 */
async function setLoggedInUser() {
    loggedInUser = await getLoggedInUser();
}


setLoggedInUser();


/**
 * This function set who is the loggedInUser to the Database
 * 
 * @param {string} user - the user who shall be the new loggedInUser
 */
async function putLoggedInUser(user) {
    fetch(BASE_URL + '/users/loggedInUser.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
}


/**
 * This function returns the contacts of the user as JSON
 * 
 * @returns {JSON} - This object includes all datas of all contacts of the user.
 */
async function getContacts() {
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
 * This function return the status of the next task.
 * 
 * @returns {string} - This string contains the staus of the next task
 */
async function getNextStatus() {
    let response = await fetch(BASE_URL + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON['nextStatus'];
}


/**
 * This string put the staus of the next task to the database
 * 
 * @param {string} status - This string contains the status of the next task. Th standart value is "To do"
 */
async function putNextStatus(status = 'To do') {
    fetch(BASE_URL + '/nextStatus.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
    })
        .then(response => response.json())
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


async function deleteTaskInDatabase(id){
    try {
        tryDeleteTaskInDatabase(id);
    } catch (error) {
        console.error("Fehler beim Löschen der Aufgabe:", error);
        alert("Beim Löschen der Aufgabe ist ein Fehler aufgetreten.");
    }
}


async function tryDeleteTaskInDatabase(id) {
    const response = await fetch(BASE_URL + `tasks/` + id + `.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!response.ok) {
        throw new Error(`Fehler: ${response.status} ${response.statusText}`);
    }
    alert("Aufgabe erfolgreich gelöscht.");
}


async function getIdOfTask(i) {
    let tasks = await getTasks();
    let idsOfTasks = Object.keys(tasks);
    return toString(idsOfTasks[i]);
}


