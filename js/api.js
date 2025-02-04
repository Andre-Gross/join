const BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';

let toastMessageEditTask ='<span>Task successfully edited</span>';
let toastMessageDeleteTask='<span>Task successfully deleted</span>';
let toastMessageCreateTask ='<span>Task successfully created</span>';

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


/**
 * Ruft Aufgaben aus der Datenbank ab und konvertiert sie in ein Array von Objekten.
 *
 * @async
 * @function getTasksAsArray
 * @returns {Promise<Array<Object>>} - Ein Array mit Aufgabenobjekten, die jeweils eine ID und relevante Aufgabendetails enthalten.
 */
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
}


/**
 * Posts a new contact to the database.
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 */
async function postContactToDatabase(name, mail, phone, color) {
    try {
      tryPostContactToDatabase(name, mail, phone, color);
    } catch (error) {
      console.error("Fehler beim Speichern des Kontaktes", error);
      alert("Beim Speichern des Kontaktes ist ein Fehler aufgetreten.");
    }
  }
  
  
  /**
   * Tries to post a new contact to the database.
   * @param {string} name - Name of the contact.
   * @param {string} mail - Email of the contact.
   * @param {string} phone - Phone number of the contact.
   * @param {string} color - Color associated with the contact.
   * @throws Will throw an error if the request fails.
   */
  async function tryPostContactToDatabase(name, mail, phone, color) {
    let response = await fetch(BASE_URL + `users/contacts.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        color: color,
        email: mail,
        name: name,
        phone: phone,
      }),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
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


/**
 * Speichert eine Aufgabe in der Datenbank oder aktualisiert sie.
 *
 * @async
 * @function putTaskToDatabase
 * @param {string} taskId - Die ID der Aufgabe, die gespeichert oder aktualisiert werden soll.
 * @param {Object} data - Die zu speichernden Aufgabendaten.
 * @returns {Promise<void>} - Gibt keinen Wert zurück, verarbeitet aber Fehler.
 * @throws {Error} - Zeigt eine Fehlermeldung in der Konsole und einen Alert bei einem Fehler.
 */
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
    showToast(toastMessageEditTask, 'middle', 1000);
}


/**
 * Aktualisiert den Status einer Teilaufgabe in der Datenbank.
 *
 * @async
 * @function putNewCheckedToSubtask
 * @param {string} taskId - Die ID der übergeordneten Aufgabe.
 * @param {string} subtaskId - Die ID der Teilaufgabe.
 * @param {boolean} isChecked - Der neue Status der Teilaufgabe (true = erledigt, false = nicht erledigt).
 * @returns {Promise<void>} - Gibt keinen Wert zurück, sendet aber eine Anfrage zur Aktualisierung.
 */
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


/**
 * Speichert eine Aufgabe in der Datenbank für einen bestimmten Kontakt.
 *
 * @async
 * @function putContactToDatabase
 * @param {string} contactId - Die ID des Kontakts, dem die Aufgabe zugeordnet wird.
 * @param {Object} data - Die Daten der Aufgabe, die gespeichert werden sollen.
 * @returns {Promise<void>} - Gibt keinen Wert zurück, aber verarbeitet Fehler.
 * @throws {Error} - Zeigt eine Fehlermeldung in der Konsole und einen Alert bei einem Fehler.
 */
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
    showToast(toastMessageCreateTask, 'middle', 1000);
}


/**
 * Löscht eine Aufgabe aus der Datenbank und behandelt Fehler.
 * 
 * Diese Funktion ruft die `tryDeleteTaskInDatabase`-Funktion auf, um eine Aufgabe mit der
 * gegebenen ID zu löschen. Tritt ein Fehler auf, wird dieser abgefangen und eine entsprechende
 * Fehlermeldung im Browser angezeigt.
 * 
 * @async
 * @function
 * @param {string} id - Die ID der Aufgabe, die gelöscht werden soll.
 * @throws {Error} Wenn beim Löschen der Aufgabe ein Fehler auftritt, wird dieser im Catch-Block behandelt.
 */
async function deleteTaskInDatabase(id){
    try {
        await tryDeleteTaskInDatabase(id);
    } catch (error) {
        console.error("Fehler beim Löschen der Aufgabe:", error);
        alert("Beim Löschen der Aufgabe ist ein Fehler aufgetreten.");
    }
}


/**
 * Löscht eine Aufgabe aus der Datenbank über eine HTTP DELETE-Anfrage.
 * 
 * Diese Funktion sendet eine DELETE-Anfrage an die Datenbank, um eine Aufgabe mit der gegebenen
 * ID zu löschen. Wenn die Anfrage erfolgreich ist, wird eine Toast-Nachricht angezeigt. 
 * Im Falle eines Fehlers wird eine Ausnahme geworfen.
 * 
 * @async
 * @function
 * @param {string} id - Die ID der Aufgabe, die gelöscht werden soll.
 * @throws {Error} Wenn die Anfrage nicht erfolgreich ist, wird ein Fehler mit Statuscode und Nachricht geworfen.
 */
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
    showToast(toastMessageDeleteTask, 'middle', 1000);
}


/**
 * Löscht einen Kontakt aus der Datenbank.
 * 
 * Diese Funktion versucht, eine Löschoperation für einen Kontakt durchzuführen, indem sie die
 * `tryPutTaskToDatabase`-Methode aufruft. Tritt ein Fehler auf, wird dieser abgefangen und eine
 * Fehlermeldung im Browser angezeigt.
 * 
 * @async
 * @function
 * @param {string} contactId - Die ID des Kontakts, der gelöscht werden soll.
 * @throws {Error} Wenn ein Fehler beim Löschen der Aufgabe auftritt, wird dieser im Catch-Block behandelt.
 */
async function deleteContactInDatabase(contactId) {
    try {
        await tryPutTaskToDatabase(contactId);
    } catch (error) {
        console.error("Fehler beim Löschen der Aufgabe:", error);
        alert("Beim Löschen des Kontaktes ist ein Fehler aufgetreten.");
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
    alert("Kontakt erfolgreich gelöscht.");
}

