let dataSubtasks = [];
let nextStatus = "To do"


/**
 * This function adds a keydown event listener to the subtask input element to add new subtasks on Enter key press.
 */
function handleSubtaskInput() {
    const subtaskInput = document.getElementById('input-subtask');
    const twoImgBox = document.getElementById('input-subtask-two-img-box');

    subtaskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addNewSubtask();
        }
    });

    if (!subtaskInput || !twoImgBox) {
        console.error("Elemente nicht gefunden");
        return;
    }

    createEventListerersSubtaskInput(subtaskInput, twoImgBox);
}


/**
 * Adds event listeners for handling interactions with the subtask input field.
 * 
 * - A `click` listener ensures the subtask input loses focus and resets the visibility of the images 
 *   when the user clicks outside the input group.
 * - A `blur` listener changes the border color of the provided `twoImgBox` when the input field loses focus.
 * 
 * @param {HTMLElement} subtaskInput - The input element for subtasks.
 * @param {HTMLElement} twoImgBox - The element whose border color will be changed on input blur.
 */
function createEventListerersSubtaskInput(subtaskInput, twoImgBox) {
    const inputGroupSubtask = document.getElementById('input-group-subtask');

    document.addEventListener('click', (event) => {
        if (!inputGroupSubtask.contains(event.target)) {
            changeVisibleImages(false);
        } else {
            subtaskInput.focus();
        }
    });

    subtaskInput.addEventListener("blur", () => {
        changeBorderColor(twoImgBox);
    });
}


/**
 * This function resets all input fields in the addTask form.
 */
function emptyAddTaskInputs() {
    document.getElementById("inputTitle").value = '';
    document.getElementById("textareaDescription").value = '';
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(el => el.checked = false)
    document.getElementById('dropAssignedTo').value = '';
    document.getElementById('inputDate').value = '';
    document.getElementById('inputCategory').value = '';
    selectPriority('medium');
    document.getElementById("input-subtask").value = [];
    dataSubtasks = [];
    refreshChoosenContactCircles()
    renderNewSubtasks();
}


/**
 * Creates the "Assigned To" dropdown menu.
 */
async function createAssignedToDropdown(preSelectedContacts = []) {
    const dropdown = document.getElementById("dropdown-assignedTo");
    const contacts = await getContactsAsArray();
    dropdown.innerHTML = "";

    contacts.forEach(contact => {
        const isChecked = preSelectedContacts.includes(contact.id) ? "checked" : "";
        const contactItem = document.createElement("div");
        contactItem.id = addPrefixAndSuffix(contact.id, 'item_');
        contactItem.className = "contact-item";
        contactItem.innerHTML = `
            ${contact.name}
            <input type="checkbox" id="${addPrefixAndSuffix(contact.id, 'checkbox_')}" ${isChecked}>
        `;
        contactItem.onclick = () => selectContact(contact.id);
        addAssignedToCheckboxEvent(contactItem, contact);
        dropdown.appendChild(contactItem);
    });
}


/**
 * This function creates a contact item in the 'Assigned to' dropdown.
 * 
 * @param {HTMLElement} dropdown - The dropdown element to append the contact item to.
 * @param {Object} contact - The contact data to display in the dropdown.
 */
function createAssignedToContactItem(dropdown, contact) {
    const contactItem = document.createElement("div");

    contactItem.id = addPrefixAndSuffix(contact.id, 'item_');
    contactItem.className = "contact-item";
    contactItem.innerHTML = `
        ${contact.name}
        <input type="checkbox" id="${addPrefixAndSuffix(contact.id, 'checkbox_')}">
    `;

    contactItem.onclick = async () => selectContact(contact.id);
    addAssignedToCheckboxEvent(contactItem, contact);
    dropdown.appendChild(contactItem);
}


/**
 * This function allows selecting a contact's checkbox in the "assignedTo" dropdown by clicking on the contact (not necessary to click specifically on the checkbox).
 * 
 * @param {string} id - The unique ID of the contact.
 */
async function selectContact(id) {
    const input = document.getElementById("dropAssignedTo");
    const checkbox = document.getElementById(addPrefixAndSuffix(id, 'checkbox_'));

    checkbox.checked = !checkbox.checked;

    if (!(input.value === '' || input.value === 'An ')) {
        input.value = '';
        input.focus();
    }

    await refreshChoosenContactCircles();
}


/**
 * This function adds the event for updating the selected contact's checkbox in the 'Assigned to' dropdown.
 * 
 * @param {HTMLElement} contactItem - The contact item element.
 * @param {Object} contact - The contact data.
 */
function addAssignedToCheckboxEvent(contactItem, contact) {
    const checkbox = contactItem.querySelector(`#${addPrefixAndSuffix(contact.id, 'checkbox_')}`);
    checkbox.onclick = (event) => {
        event.stopPropagation();
        refreshChoosenContactCircles();
    };
}


/**
 * Retrieves the list of assigned contacts for a task from the assignedTo dropdown.
 * 
 * This function finds all checked checkboxes within the "assignedTo" dropdown,
 * extracts their IDs, and returns them as an array of strings.
 * 
 * @returns {string[]} An array of contact IDs representing the individuals assigned to the task.
 */
function readAssignedTo() {
    const dropdown = document.getElementById("dropdown-assignedTo");
    const assignedToCheckboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
    const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => stripPrefixAndSuffix(checkbox.id, 'checkbox_'));
    return assignedTo;
}


/**
 * Filters the contacts based on the user input in the "Assigned To" dropdown
 * and updates the dropdown menu accordingly.
 * 
 * - Retrieves contacts from the database.
 * - Matches contacts whose names contain the input text.
 * - Shows only matching contacts in the dropdown.
 * 
 * @returns {Promise<void>} - The function modifies the DOM and does not return a value.
 */
async function filterContacts() {
    let contacts = await getContactsAsArray();
    let input = document.getElementById("dropAssignedTo").value.toLowerCase();

    if (input.includes('an ')) {
        input = input.substring(input.lastIndexOf("an ") + 3);
    }

    const filteredContacts = input ? contacts.filter(contact => contact.name.toLowerCase().includes(input)) : contacts;
    const filteredNames = new Set(filteredContacts.map(contact => contact.name));

    toggleDropdown('assignedTo', 'd-block', filteredContacts.length > 0);

    contacts.forEach(contact => {
        const item = document.getElementById(addPrefixAndSuffix(contact.id, 'item_'));
        item.classList.toggle("d-none", !filteredNames.has(contact.name));
    });
}


/**
 * Refreshes the list of selected contact circles by reading the assigned contacts and updating the UI.
 * 
 * This function retrieves the checked contacts from the "assignedTo" dropdown, 
 * clears the current display of selected contacts, and then adds the circles 
 * for each selected contact. After the update, it also calls a function to 
 * store the last entered string in the input field.
 * 
 * @async
 */
async function refreshChoosenContactCircles(preSelectedContacts = []) {
    let checkedContacts = preSelectedContacts.length > 0 ? preSelectedContacts : readAssignedTo();
    const choosenContactsContainer = document.getElementById('assignedTo-choosen-contacts');

    choosenContactsContainer.innerHTML = '';

    let maxVisibleContacts = 4; 
    let hiddenContactsCount = checkedContacts.length - maxVisibleContacts;

    for (let i = 0; i < Math.min(checkedContacts.length, maxVisibleContacts); i++) {
        choosenContactsContainer.innerHTML += await createNameCircleWithRemove(checkedContacts[i]);
    }

    if (hiddenContactsCount > 0) {
        choosenContactsContainer.innerHTML += `
            <div class="name-circle extra-contacts">+${hiddenContactsCount}</div>
        `;
    }
}


/**
 * Creates a contact name circle with a remove option and returns the HTML as a string.
 * 
 * This function fetches contact details from the `getContacts` function, 
 * generates a circle with the contact's initials and color, and adds a click 
 * handler for selecting or removing the contact. The contact's ID is used to 
 * dynamically set the ID and event handler for the HTML element.
 * 
 * @async
 * @param {string} id - The unique identifier of the contact to be displayed in the circle.
 * @returns {Promise<string>} A promise that resolves to a string containing the HTML for the name circle.
 */
async function createNameCircleWithRemove(id) {
    const contacts = await getContacts();
    const initials = returnInitialsOfName(contacts[id].name);
    const color = contacts[id].color.replace('#', '').toLowerCase();

    let HTML = createNameCircle(initials, color);

    const divId = addPrefixAndSuffix(id, 'nameCircle-');
    const onclickFunction = `selectContact('${id}')`;

    HTML = HTML.replace('<div class="', `<div id="${divId}" onclick="${onclickFunction}" class="pointer `);

    return HTML;
}


/**
 * Toggles the visibility of a dropdown menu and updates related UI elements.
 *
 * @param {string} whichDropdown - The identifier of the dropdown to toggle.
 * @param {string} [displayMode='d-block'] - The CSS class used to display the dropdown.
 * @param {boolean|string} [shallVisible=''] - Determines the visibility: `true` (show), `false` (hide), `''` (toggle).
 */
function toggleDropdown(whichDropdown, displayMode = 'd-block', shallVisible = '') {
    const input = document.getElementById(`input-group-dropdown-${whichDropdown}`)
    const dropdown = document.getElementById(`dropdown-${whichDropdown}`);
    const inputDummy = document.getElementById(`input-dummy-${whichDropdown}`);
    const arrowDown = document.getElementById(`input-${whichDropdown}-arrow-down`);
    const arrowUp = document.getElementById(`input-${whichDropdown}-arrow-up`);
    const toggle = shallVisible === '' ? null : shallVisible;

    toggleDisplayNone(dropdown, displayMode, toggle);
    toggleDisplayNone(inputDummy, 'd-block', toggle);
    toggleDisplayNone(arrowDown, displayMode, toggle === null ? null : !toggle);
    toggleDisplayNone(arrowUp, displayMode, toggle);

    if (shallVisible === '') {
        input.classList.toggle('active-dropdown-input');
    } else {
        input.classList.toggle('active-dropdown-input', shallVisible);
    }
}


/**
 * This function allows selecting and changing the priority of the task by clicking the priority button.
 * 
 * @param {string} priority - The name of the selected priority (e.g., 'urgent', 'medium', 'low').
 */
function selectPriority(priority) {
    let allPriorities = ['urgent', 'medium', 'low']

    for (let i = 0; i < allPriorities.length; i++) {
        const singlePriority = allPriorities[i];
        const element = document.getElementById(singlePriority);

        element.classList.remove(`btn-selected`);
        element.classList.remove(`btn-selected-${singlePriority}`);
        document.getElementById(`img-${singlePriority}`).src = `assets/img/addTask/prio-${singlePriority}.svg`
    }

    document.getElementById(priority).classList.add("btn-selected");
    document.getElementById(priority).classList.add(`btn-selected-${priority}`);
    document.getElementById(`img-${priority}`).src = `assets/img/addTask/prio-${priority}-white.svg`
}


/**
 * This function sets the chosen category in the category input field and closes the category dropdown menu.
 * 
 * @param {string} category - The category to be set in the input field.
 * @param {HTMLElement} element - The dropdown element to be hidden.
 */
function selectCategory(category, element) {
    document.getElementById('inputCategory').value = category;
    const inputDummy = document.getElementById('input-dummy-category');
    toggleDisplayNone(element);
    toggleDisplayNone(inputDummy, 'd-block', false);
}


