let contactsInitialized = false;


/**
 * This function prepare the information of the addTask-form and post it to the database.
 * 
 * @param {string} boardId - That includes the ID of the board, where the datas should be post.
 */
async function submitTaskForm(boardId) {
    const title = document.getElementById("inputTitle").value.trim();
    const description = document.getElementById("textareaDescription").value.trim();
    const dueDate = document.getElementById('inputDate').value;
    const priority = document.querySelector('.btn-selected')?.id;

    const assignedTo = readAssignedTo();

    if (checkAllInputsHasContent(title, description, dueDate, priority, assignedTo)) {
        const data = {
            title: title,
            description: description,
            finishedUntil: dueDate,
            priority: priority,
            assignedTo: assignedTo 
        };
        await postTaskToDatabase(boardId, data);

        emptyAddTaskInputs();
    }
}


/**
 * That function read the information, for which contact the task is assigned to.
 * 
 * @returns {string} - The person(s), which are assigned to to do the task.
 */
function readAssignedTo() {
    const assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => checkbox.id);
    return assignedTo;
}


/**
 * This function, check if all inputs of the addTask-form includes content.
 * 
 * @param {string} title - Title of the task
 * @param {string} description - description of the task
 * @param {Date} dueDate - Date, until the task should be finished
 * @param {string} priority - Priority, how important the task is
 * @param {Array} assignedTo - The person(s), who are assigned to do the task
 * @returns {boolean} - Giv the feedback if all inputs contain informations. 
 */
function checkAllInputsHasContent(title, description, dueDate, priority, assignedTo) {
    if (title == '' || description == '' || dueDate == '' || priority == '' || assignedTo.length == 0) {
        alert("Bitte fülle alle Felder aus.");
        return false;
    } else {
        return true
    }
}


/**
 * This function reset the form of addTask
 */
function emptyAddTaskInputs() {
    document.getElementById("iTitle").value = '';
    document.getElementById("taDescription").value = '';
    document.getElementById('iDate').value = '';
    document.querySelector('.btn-selected')?.classList.remove('btn-selected');
    document.document.getElementById('medium').classList.add('btn-selected');
}


/**
 * This function filter your contacts with the input of addTasks and show the result in a dropdown menu.
 * 
 */
async function filterContacts() {
    const input = document.getElementById("navAssignedTo").value.toLowerCase();
    const dropdown = document.getElementById("contactDropdown");
    let contacts = await getContactsAsArray();

    const filteredContacts = input ? contacts.filter(contact => contact.name.toLowerCase().includes(input)) : contacts;

    if (filteredContacts.length > 0) {
        showAssignedToDropdown();
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const item = document.getElementById(`item_${contact.name.replace(/\s+/g, '_')}`);
            item.classList.add("d-none");

            for (let y = 0; y < filteredContacts.length; y++) {
                if (filteredContacts[y].name === contact.name) {
                    item.classList.remove("d-none");
                    break;
                }
            }
        }
    } else {
        hideAssignedToDropdown();
    }
}


/**
 * This function returns the contacts of the loggedInUser as Array
 * 
 * @returns {Array} - This array contains the contacts of the loggedInUser
 */
async function getContactsAsArray() {
    let contacts = await getContacts();
    if (Array.isArray(contacts)) {
    } else {
        contacts = Object.values(contacts);
    }
    return contacts
}


/**
 * This function returns the name of the contacts of the aktive user as array.
 * 
 * @returns {Array} - This array contains the names of the contacts of the active user.
 */
async function getNamesOfContacts() {
    let contacts = await getContactsAsArray();
    let namesOfContacts = [];
    for (let i=0; i<contacts.length; i++) {
        const name = contacts[i].name;
        namesOfContacts.push(name);
        console.log(name)
    }
    return namesOfContacts;
}


/**
 * This function show the assignedTo-Dropdown-Menu.
 * 
 */
async function showAssignedToDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    const arrowDown = document.getElementById("arrowDown");
    const arrowUp = document.getElementById("arrowUp");

    if (!contactsInitialized) {
        await createAssignedToDropdown(); // Erstelle das Dropdown, wenn es noch nicht initialisiert wurde
    }

    dropdown.classList.remove("d-none"); // Zeige das Dropdown an
    arrowDown.classList.add("d-none");
    arrowUp.classList.remove("d-none");
}


/**
 * This function hide the assignedTo-Dropdown-Menu.
 */
function hideAssignedToDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    const arrowDown = document.getElementById("arrowDown");
    const arrowUp = document.getElementById("arrowUp");

    dropdown.classList.add("d-none"); // Blende das Dropdown aus
    arrowDown.classList.remove("d-none"); // Zeige den nach unten zeigenden Pfeil
    arrowUp.classList.add("d-none"); // Verstecke den nach oben zeigenden Pfeil
}


/**
 * This function create the assignedTo-Dropdown-Menu, if is not already initialized.
 */
async function createAssignedToDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    let contacts = await getContactsAsArray();

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

        dropdown.appendChild(contactItem);
    });

    contactsInitialized = true; // Setze das Flag auf true, nachdem die Kontakte initialisiert wurden
}


/**
 * This function allow to select the checkbox of an contact in the assingedTo-Dropdown-Menu by clicking on the contact (not necessary to click specificly on the checkbox)
 * 
 *  @param {object} contact - This object includes the information of a single contact.
 */
function selectContact(contact) {
    let checkbox = document.getElementById(`checkbox_${contact.name.replace(/\s+/g, '_')}`)
    checkbox.checked = !checkbox.checked;

    checkbox.onclick = (event) => {
        event.stopPropagation();
    };
}


/**
 * This function allow to select and change the priority-button.
 * 
 * @param {string} priority - That includes the name of the selected priority.
 */
function selectPriority(priority) {
    document.getElementById("urgent").classList.remove("btn-selected");
    document.getElementById("medium").classList.remove("btn-selected");
    document.getElementById("low").classList.remove("btn-selected");

    document.getElementById(priority).classList.add("btn-selected");
}


/**
 * That function return the priority of the choosen button.
 * 
 * @returns {string} - the priority of the choosen button
 */
function getSelectedPriority() {
    if (document.getElementById("urgent").classList.contains("btn-selected")) return "urgent";
    if (document.getElementById("medium").classList.contains("btn-selected")) return "medium";
    if (document.getElementById("low").classList.contains("btn-selected")) return "low";
}


