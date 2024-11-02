let contactsInitialized = false;


async function filterContacts() {
    const input = document.getElementById("navAssignedTo").value.toLowerCase();
    const dropdown = document.getElementById("contactDropdown");
    let contacts = await loadContacts();

    const filteredContacts = input ? contacts.filter(contact => contact.name.toLowerCase().includes(input)) : contacts;

    if (filteredContacts.length > 0) {
        showContactsDropdown(); // Dropdown anzeigen
        for (i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const item = document.getElementById(`item_${contact.name.replace(/\s+/g, '_')}`)
            item.classList.add("d-none");

            for (y = 0; y < filteredContacts.length; y++) {
                if (filteredContacts[y].name == contact.name) {
                    item.classList.remove("d-none");
                    break;
                }
            }
        }
    } else {
        hideContactsDropdown(); // Dropdown ausblenden, wenn keine Kontakte übrig sind
    }
}


function selectContact(contact) {
    let checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`)
    checkbox.checked = !checkbox.checked;
}


async function createContactsDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    let contacts = await loadContacts();

    dropdown.innerHTML = "";

    contacts.forEach(contact => {
        const contactItem = document.createElement("div");
        const checkboxId = `checkbox_${contact.name.replace(/\s+/g, '_')}`;

        contactItem.id = `item_${contact.name.replace(/\s+/g, '_')}`;
        contactItem.className = "contact-item";
        contactItem.innerHTML = `
            ${contact.name}
            <input type="checkbox" id="checkbox_${contact.name.replace(/\s+/g, '_')}">
        `;

        contactItem.onclick = () => selectContact(contact);

        const checkbox = contactItem.querySelector(`#${checkboxId}`);
        checkbox.onclick = (event) => {
            // Verhindere das Auslösen des onclick-Handlers des contactItem
            event.stopPropagation();
        };

        dropdown.appendChild(contactItem);
    });

    contactsInitialized = true; // Setze das Flag auf true, nachdem die Kontakte initialisiert wurden
}

// Funktion zur Anzeige des Dropdown-Menüs
async function showContactsDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    const arrowDown = document.getElementById("arrowDown");
    const arrowUp = document.getElementById("arrowUp");

    if (!contactsInitialized) {
        await createContactsDropdown(); // Erstelle das Dropdown, wenn es noch nicht initialisiert wurde
    }

    dropdown.classList.remove("d-none"); // Zeige das Dropdown an
    arrowDown.classList.add("d-none");
    arrowUp.classList.remove("d-none");
}


function hideContactsDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    const arrowDown = document.getElementById("arrowDown");
    const arrowUp = document.getElementById("arrowUp");

    dropdown.classList.add("d-none"); // Blende das Dropdown aus
    arrowDown.classList.remove("d-none"); // Zeige den nach unten zeigenden Pfeil
    arrowUp.classList.add("d-none"); // Verstecke den nach oben zeigenden Pfeil
}


function selectPriority(priority) {
    // Entferne die aktive Klasse von allen Schaltflächen
    document.getElementById("urgent").classList.remove("btn-selected");
    document.getElementById("medium").classList.remove("btn-selected");
    document.getElementById("low").classList.remove("btn-selected");

    // Füge die aktive Klasse zur ausgewählten Schaltfläche hinzu
    document.getElementById(priority).classList.add("btn-selected");
}

// Funktion, um den aktuellen Prioritätswert zu erhalten
function getSelectedPriority() {
    if (document.getElementById("urgent").classList.contains("btn-selected")) return "urgent";
    if (document.getElementById("medium").classList.contains("btn-selected")) return "medium";
    if (document.getElementById("low").classList.contains("btn-selected")) return "low";
    return null; // Wenn keine Schaltfläche ausgewählt ist
}


async function submitTaskForm(boardId) {
    // Hole alle Eingabefelder
    const title = document.getElementById("inputTitle").value.trim();
    const description = document.getElementById("textareaDescription").value.trim();
    const dueDate = document.getElementById('inputDate').value;
    const priority = document.querySelector('.btn-selected')?.id;

    // Checkboxen für "assignedTo" auslesen
    const assignedTo = readAssignedTo();

    // Überprüfe, ob alle Felder ausgefüllt sind
    if (checkAllInputsHasContent(title, description, dueDate, priority, assignedTo)) {
        // Datenstruktur für das Posten in die Datenbank vorbereiten
        const data = {
            title: title,
            description: description,
            finishedUntil: dueDate,
            priority: priority,
            assignedTo: assignedTo // Hier die IDs der zugewiesenen Kontakte hinzufügen
        };
        // Anfrage zum Posten der Daten in die Datenbank
        await postTaskToDatabase(boardId, data);

        emptyAddTaskInputs();
    }
}


function readAssignedTo() {
    const assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => checkbox.id); // IDs der ausgewählten Checkboxen
    return assignedTo;
}


function checkAllInputsHasContent(title, description, dueDate, priority, assignedTo) {
    if (title == '' || description == '' || dueDate == '' || priority == '' || assignedTo.length == 0) {
        alert("Bitte fülle alle Felder aus.");
        return false;
    } else {
        return true
    }
}


function emptyAddTaskInputs() {
    const title = document.getElementById("iTitle").value = '';
    const description = document.getElementById("taDescription").value = '';
    const dueDate = document.getElementById('iDate').value = '';
    const priority = document.querySelector('.btn-selected')?.classList.remove('btn-selected');
}