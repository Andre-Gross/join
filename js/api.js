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


async function submitTaskForm(boardId) {
    // Hole alle Eingabefelder
    const title = document.getElementById("iTitle").value.trim();
    const description = document.getElementById("taDescription").value.trim();
    const dueDate = document.querySelector('input[type="date"]').value;
    const priority = document.querySelector('.btn.selected')?.id;

    // Checkboxen für "assignedTo" auslesen
    const assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => checkbox.id); // IDs der ausgewählten Checkboxen

    // Überprüfe, ob alle Felder ausgefüllt sind
    // if (!title || !description || !dueDate || !priority || assignedTo.length === 0) {
    //     alert("Bitte fülle alle Felder aus.");
    //     return;
    // }

    // Datenstruktur für das Posten in die Datenbank vorbereiten
    const data = {
        title: title,
        description: description,
        finishedUntil: dueDate,
        priority: priority,
        assignedTo: assignedTo // Hier die IDs der zugewiesenen Kontakte hinzufügen
    };

    // Anfrage zum Posten der Daten in die Datenbank
    try {
        const response = await fetch(BASE_URL + `boards/${boardId}/tasks.json`, {
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
    } catch (error) {
        console.error("Fehler beim Speichern der Aufgabe:", error);
        alert("Beim Speichern der Aufgabe ist ein Fehler aufgetreten.");
    }
}