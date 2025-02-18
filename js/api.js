const BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';


const toastMessagePostTask = '<span>Task added to board</span><img src="assets/img/general/board.svg" alt="board">'
const toastMessageEditTask = '<span>Task successfully edited</span>';
const toastMessageDeleteTask = '<span>Task successfully deleted</span>';
const toastMessageCreateTask = '<span>Task successfully created</span>';


/**
 * Fetches the user's contacts and returns them as a JSON object.
 * 
 * @returns {Promise<Object>} A promise resolving to the contacts data.
 * @throws {Error} If the request fails or returns a non-OK response.
 */
async function getContacts() {
    try {
        const response = await fetch(`${BASE_URL}users/contacts.json`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        throw error;
    }
}


/**
 * Fetches all contacts and returns them as an array.
 * 
 * @returns {Promise<Array<{id: string, color: string, email: string, name: string, phone: string}>>} 
 * A promise resolving to an array of contact objects.
 */
async function getContactsAsArray() {
    const contactsData = await getContacts();

    return Object.entries(contactsData).map(([id, contact]) => ({
        id,
        color: contact.color,
        email: contact.email,
        name: contact.name,
        phone: contact.phone
    }));
}


/**
 * Fetches all tasks from the database and returns them as an object.
 * 
 * @async
 * @function getTasks
 * @returns {Promise<Object<string, { title: string, category: string, description: string, finishedUntil: string, priority: string, assignedTo: string[], subtasks: any[], status: string }>>}
 * A promise resolving to an object where the keys are task IDs, and the values are task objects.
 * @throws {Error} If the request fails or returns a non-OK response.
 */
async function getTasks() {
    try {
        const response = await fetch(`${BASE_URL}tasks/.json`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        throw error;
    }
}


/**
 * Fetches tasks from the database and converts them into an array of objects.
 *
 * @async
 * @function getTasksAsArray
 * @returns {Promise<Array<{ id: string, title: string, category: string, description: string, finishedUntil: string, priority: string, assignedTo: string[], subtasks: any[], status: string }>>}
 * A promise resolving to an array of task objects, each containing an ID and relevant task details.
 */
async function getTasksAsArray() {
    const tasksData = await getTasks();

    return Object.entries(tasksData).map(([id, task]) => ({
        id,
        title: task.title,
        category: task.category,
        description: task.description,
        finishedUntil: task.finishedUntil,
        priority: task.priority,
        assignedTo: task.assignedTo,
        subtasks: task.subtasks,
        status: task.status
    }));
}


/**
 * Posts a new contact to the database.
 * This function handles the error when the contact cannot be saved.
 *
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 * @throws {Error} If the contact cannot be saved.
 */
async function postContactToDatabase(name, mail, phone, color) {
    try {
        await tryPostContactToDatabase(name, mail, phone, color);
    } catch (error) {
        console.error("Error saving the contact", error);
        alert("An error occurred while saving the contact.");
    }
}


/**
 * Tries to post a new contact to the database.
 * Throws an error if the request fails.
 *
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 * @throws {Error} If the HTTP request fails (e.g., non-OK response status).
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
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    showToast(toastMessageEditTask);
}


/**
 * Posts the task data to the database. If the request fails, it catches the error and displays an alert.
 * 
 * @async
 * @function postTaskToDatabase
 * @param {object} data - The data of the task to be posted.
 * @throws {Error} If the task cannot be saved due to an HTTP error.
 */
async function postTaskToDatabase(data) {
    try {
        await tryPostTaskToDatabase(data);
    } catch (error) {
        console.error("Error saving the task:", error);
        alert("An error occurred while saving the task.");
    }
}


/**
 * Attempts to post the data of a new task to the database.
 * If the request is successful, a success alert is shown. 
 * If an error occurs, an error message is thrown.
 * 
 * @async
 * @function tryPostTaskToDatabase
 * @param {object} data - The data of the task to be posted.
 * @throws {Error} If the HTTP request fails (e.g., non-OK status response).
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
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    showToast(toastMessagePostTask);
}


/**
 * Saves or updates a contact in the database.
 * 
 * @async
 * @function putContactToDatabase
 * @param {string} contactId - The ID of the contact to be saved or updated.
 * @param {Object} data - The data of the contact to be saved.
 * @returns {Promise<void>} - Does not return a value but processes any errors.
 * @throws {Error} - Throws an error if the request fails, and shows an alert.
 */
async function putContactToDatabase(contactId, data) {
    try {
        await tryPutContactToDatabase(contactId, data);
    } catch (error) {
        console.error('Error saving contact:', error);
        alert('An error occurred while saving the contact.');
    }
}


/**
 * Tries to save or update a contact in the database.
 * 
 * @async
 * @function tryPutContactToDatabase
 * @param {string} contactId - The ID of the contact to be saved or updated.
 * @param {Object} data - The contact data to be posted.
 * @returns {Promise<void>} - Resolves if the contact is saved, otherwise throws an error.
 * @throws {Error} - Throws an error if the HTTP request fails (e.g., non-OK status response).
 */
async function tryPutContactToDatabase(contactId, data) {
    const response = await fetch(BASE_URL + `/users/contacts/${contactId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }
}


/**
 * Saves or updates a task in the database.
 * 
 * @async
 * @function putTaskToDatabase
 * @param {string} taskId - The ID of the task to be saved or updated.
 * @param {Object} data - The data of the task to be saved.
 * @returns {Promise<void>} - Does not return a value, but processes any errors.
 * @throws {Error} - Throws an error if the request fails, and shows an alert.
 */
async function putTaskToDatabase(taskId, data) {
    try {
        await tryPutTaskToDatabase(taskId, data);
    } catch (error) {
        console.error("Error saving the task:", error);
        alert("An error occurred while saving the task.");
    }
}


/**
 * Tries to save or update a task in the database. 
 * If the request fails, it throws an error.
 * If successful, a success message is shown.
 * 
 * @async
 * @function tryPutTaskToDatabase
 * @param {string} taskId - The ID of the task to be saved or updated.
 * @param {object} data - The task data to be posted.
 * @returns {Promise<void>} - Resolves if the task is saved, otherwise throws an error.
 * @throws {Error} - Throws an error if the HTTP request fails (e.g., non-OK status response).
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
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    showToast(toastMessageEditTask);
}


/**
 * Updates the status of a subtask in the database.
 * 
 * @async
 * @function putNewCheckedToSubtask
 * @param {string} taskId - The ID of the parent task.
 * @param {string} subtaskId - The ID of the subtask.
 * @param {boolean} isChecked - The new status of the subtask (true = completed, false = not completed).
 * @returns {Promise<void>} - Does not return a value but sends an update request.
 * @throws {Error} - Throws an error if the request fails.
 */
async function putNewCheckedToSubtask(taskId, subtaskId, isChecked) {
    try {
        const response = await fetch(BASE_URL + `/tasks/${taskId}/subtasks/${subtaskId}/isChecked.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(isChecked)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating subtask status:', error);
        throw error; // Rethrow the error for further handling
    }
}



/**
 * Deletes a task from the database and handles any errors.
 * 
 * This function calls `tryDeleteTaskInDatabase` to delete a task with the given ID. If an error occurs,
 * it will be caught and an appropriate error message will be displayed in the browser.
 * 
 * @async
 * @function
 * @param {string} id - The ID of the task to be deleted.
 * @throws {Error} If an error occurs during the deletion of the task, it will be caught and displayed in an alert.
 */
async function deleteTaskInDatabase(id) {
    try {
        await tryDeleteTaskInDatabase(id);
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("An error occurred while deleting the task.");
    }
}



/**
 * Deletes a task from the database via an HTTP DELETE request.
 * 
 * This function sends a DELETE request to the database to delete a task with the given ID. If the request 
 * is successful, a toast message will be shown. If an error occurs, an exception will be thrown.
 * 
 * @async
 * @function
 * @param {string} id - The ID of the task to be deleted.
 * @throws {Error} If the request fails, an error will be thrown with the status code and message.
 */
async function tryDeleteTaskInDatabase(id) {
    const response = await fetch(BASE_URL + `tasks/` + id + `.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    showToast(toastMessageDeleteTask);
}



/**
 * Deletes a contact from the database.
 * 
 * This function attempts to perform a delete operation on a contact by calling `tryDeleteContactInDatabase`.
 * If an error occurs, it will be caught and an appropriate error message will be displayed in the browser.
 * 
 * @async
 * @function
 * @param {string} contactId - The ID of the contact to be deleted.
 * @throws {Error} If an error occurs during the deletion of the contact, it will be caught and displayed in an alert.
 */
async function deleteContactInDatabase(contactId) {
    try {
        await tryDeleteContactInDatabase(contactId);
    } catch (error) {
        console.error("Error deleting contact:", error);
        alert("An error occurred while deleting the contact.");
    }
}



/**
 * Deletes a contact from the database via an HTTP DELETE request.
 * 
 * This function sends a DELETE request to the database to delete a contact with the given ID. If the request 
 * is successful, a confirmation message will be displayed. If an error occurs, an exception will be thrown.
 * 
 * @async
 * @function
 * @param {string} contactId - The ID of the contact to be deleted.
 * @throws {Error} If the request fails, an error will be thrown with the status code and message.
 */
async function tryDeleteContactInDatabase(contactId) {
    const response = await fetch(BASE_URL + `/users/contacts/${contactId}.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    alert("Contact successfully deleted.");
}