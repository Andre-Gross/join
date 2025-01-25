const BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';


/**
 * This function returns the contacts of the user as JSON
 * 
 * @returns {JSON} - This object includes all datas of all contacts of the user.
 */
async function getContacts() {
    let response = await fetch(BASE_URL + 'users/' + '/contacts' + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


/**
 * This function returns the contacts of the loggedInUser as Array
 * 
 * @returns {Array} - This array contains the contacts of the loggedInUser
 */
async function getContactsAsArray() {
    let contactsAsArray = [];
    const contactsData =  await getContacts();
    for (const KEY in contactsData) {
        const singleContact = contactsData[KEY];
        const contact = {
            id: KEY,
            color: singleContact.color,
            email: singleContact.email,
            name: singleContact.name,
            phone: singleContact.phone
        };
        contactsAsArray.push(contact);
    }
    return contactsAsArray;
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


async function getTasksAsArray() {
    let tasksAsArray = [];
    let tasksData = await getTasks();
    for (const KEY in tasksData) {
        const singleTask = tasksData[KEY];
        const task = {
            id: KEY,
            category: singleTask.category,
            title: singleTask.title,
            description: singleTask.description,
            finishedUntil: singleTask.finishedUntil,
            priority: singleTask.priority,
            assignedTo: singleTask.assignedTo,
            subtasks: singleTask.subtasks,
            status: singleTask.status
        };
        tasksAsArray.push(task);
    }
    return tasksAsArray;
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
 * This function post the datas of a new contact with another function. If the response is an error, it catch it.
 * 
 * @param {object} data - Datas of the new contact.
 * @param {string} user - ID of the user, who should get the datas of the new contact. The standart user is the aktive user.
 */
async function postContactToDatabase(data) {
    try {
        await tryPostContactToDatabase(data);
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
async function tryPostContactToDatabase(data) {
    const response = await fetch(BASE_URL + `users/contacts.json`, {
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
        await tryPostTaskToDatabase(data);
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
}


async function putTaskToDatabase(taskId, data) {
    try {
        await tryPutTaskToDatabase(taskId, data);
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
async function tryPutTaskToDatabase(taskId, data) {
    const response = await fetch(BASE_URL + `tasks/${taskId}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    alert("Aufgabe erfolgreich bearbeitet.");
}


/**
 * This string put the staus of the next task to the database
 * 
 * @param {string} status - This string contains the status of the next task. Th standart value is "To do"
 */
async function putNextStatus(status = 'To do') {
    await fetch(BASE_URL + '/nextStatus.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
    })
        .then(response => response.json())
}


async function putNewCheckedToSubtask(taskId, subtaskId, isChecked) {
    await fetch(BASE_URL + `/tasks/${taskId}/subtasks/${subtaskId}/isChecked.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(isChecked)
    })
        .then(response => response.json())
}


async function putContactToDatabase(contactId, data) {
    try {
        await tryPutTaskToDatabase(contactId, data);
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
async function tryPutContactToDatabase(contactId, data) {
    const response = await fetch(BASE_URL + `/users/contacts/${contactId}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    alert("Aufgabe erfolgreich bearbeitet.");
}


async function deleteTaskInDatabase(id){
    try {
        await tryDeleteTaskInDatabase(id);
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


async function deleteContactInDatabase(contactId) {
    try {
        await tryPutTaskToDatabase(contactId);
    } catch (error) {
        console.error("Fehler beim Löschen der Aufgabe:", error);
        alert("Beim Löschen der Aufgabe ist ein Fehler aufgetreten.");
    }
}


/**
 * This function post the datas of a new task. If there is an error, it give an response. Otherwise it give an positve alert.
 * 
 * @param {object} data - datas of the task
 */
async function tryDeleteContactInDatabase(contactId) {
    const response = await fetch(BASE_URL + `/users/contacts/${contactId}.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    alert("Aufgabe erfolgreich bearbeitet.");
}

