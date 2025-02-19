let dataSubtasks = [];
let nextStatus = "To do"


/**
 * This function initializes the form, including the subtask input listener and dropdown listeners.
 */
function loadFormFunctions() {
    handleSubtaskInput();
    createAssignedToDropdown();
    setupDropdownListeners();
}


/**
 * This function enables or disables the send button based on the content of the required inputs.
 */
function enableDisableSendButton() {
    const title = document.getElementById("inputTitle").value.trim();
    const dueDate = document.getElementById('inputDate').value;
    const category = document.getElementById("inputCategory").value;
    const sendButton = document.getElementById("sendButton")

    if (checkAllInputsHasContent(title, dueDate, category)) {
        sendButton.disabled = false;
    } else {
        sendButton.disabled = true;
    }
}


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
 * This function adds click event listeners to close the dropdown menus when clicking outside.
 */
function setupDropdownListeners() {
    const dropdownMenues = ['assignedTo', 'category'];

    for (let i = 0; i < dropdownMenues.length; i++) {
        const singleDropdown = dropdownMenues[i];
        document.addEventListener('click', (event) => {
            const dropdown = document.getElementById(`dropdown-${singleDropdown}`);
            const inputGroup = document.getElementById(`input-group-dropdown-${singleDropdown}`);

            if (dropdown) {
                if (!dropdown.contains(event.target) && !inputGroup.contains(event.target)) {
                    toggleDropdown(`${singleDropdown}`, 'd-block', false);
                }
            }
        });
    }
}


/**
 * Collects task form data, validates required fields, and submits the task to the database.
 * Shows a success toast and redirects to the board upon completion.
 *
 * @param {string} [method='post'] - The HTTP method to use (`post` to create, `put` to update).
 * @param {string} [id=''] - The task ID (required for `put` requests).
 */
async function submitTaskForm(method = 'post', id = '') {
    const getValue = (id) => document.getElementById(id).value.trim();
    const title = getValue("inputTitle");
    const description = getValue("textareaDescription");
    const dueDate = getValue("inputDate");
    const category = getValue("inputCategory");
    const priority = document.querySelector('.btn-selected')?.id;
    const assignedTo = readAssignedTo();

    toggleAllFormFooterButtons(false);

    const data = await prepareDataToSend(title, description, dueDate, priority, category, assignedTo);
    method === 'put' ? await putTaskToDatabase(id, data) : await postTaskToDatabase(data);

    nextStatus = 'To do';
    handleEndingOfTaskForm();
}


/**
 * Toggles the enabled state of all buttons in the form footer.
 * 
 * @param {boolean} shallEnabled - If `true`, enables all buttons; if `false`, disables them.
 *                                 Default is `true`.
 */
function toggleAllFormFooterButtons(shallEnabled = true) {
    const buttons = document.getElementById("form-footer").querySelectorAll("button")

    buttons.forEach(button => {
        button.disabled = !shallEnabled;
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
 * Checks if all required input fields contain values.
 * 
 * @param {string} title - The title of the task.
 * @param {string} dueDate - The due date as a string.
 * @param {string} category - The category of the task.
 * @returns {boolean} - Returns `true` if all fields have values, otherwise `false`.
 */
function checkAllInputsHasContent(title, dueDate, category) {
    return !(title === '' || dueDate === '' || category === '');
}


/**
 * Handles the ending process of the task form.
 * - After a delay of 2 seconds, it redirects to `board.html` if the current page is not the board.
 * - If the user is already on `board.html`, it closes the modal instead.
 */
function handleEndingOfTaskForm() {
    setTimeout(async () => {
        if (!window.location.href.includes("/board.html")) {
            window.location.href = `./board.html`;
        } else {
            closeModalCard();
        }
    }, 2000);
}


/**
 * Toggles the visibility of a "required field" warning text.
 * 
 * @param {string} field - The name of the input field (e.g., "Title", "Date", "Category").
 */
function changeTextRequired(field) {
    const input = document.getElementById(`input${upperCaseFirstLetter(field.toLowerCase())}`);
    const text = document.getElementById(`text-required-input-${field.toLowerCase()}`);

    toggleDisplayNone(text, "d-block", input.value === '');
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
    for (let contactId of checkedContacts) {
        choosenContactsContainer.innerHTML += await createNameCircleWithRemove(contactId);
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
 * Prepares the task data for sending to the database.
 * 
 * @param {string} dataTitle - The title of the task.
 * @param {string} dataDescription - The description of the task.
 * @param {string} dataDueDate - The due date in string format (e.g., "YYYY-MM-DD").
 * @param {string} dataPriority - The priority of the task (e.g., "high", "medium", "low").
 * @param {string} dataCategory - The category of the task (e.g., "Technical Task" or "User Story").
 * @param {Array} dataAssignedTo - An array of assigned persons.
 * @returns {object} - An object containing all task data.
 */
function prepareDataToSend(dataTitle, dataDescription, dataDueDate, dataPriority, dataCategory, dataAssignedTo) {
    const data = {
        title: dataTitle,
        description: dataDescription,
        finishedUntil: dataDueDate,
        priority: dataPriority,
        assignedTo: dataAssignedTo,
        category: dataCategory,
        subtasks: dataSubtasks,
        status: nextStatus,
    };
    return data;
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


/**
 * Updates the global nextStatus variable.
 *
 * This function sets the value of the global variable `nextStatus`, which determines
 * the default status for new tasks when they are created or updated.
 *
 * @param {string} status - The new status to assign to `nextStatus`.
 */
function putNextStatus(status) {
    nextStatus = status;
}