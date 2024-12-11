let contactsInitialized = false;
let dataSubtasks = [{
    'subtask': 'Subtask1',
    'isChecked': false,
}, {
    'subtask': 'Subtask2',
    'isChecked': false,
}];
let possibleStatuses = ['To do', 'In progress', 'Await Feedback', 'Done'];
let lastStringOfInput = '';
const dropdownMenues =['assignedTo', 'category']


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
 * That function read the information, for which contact the task is assigned to.
 * 
 * @returns {string} - The person(s), which are assigned to to do the task.
 */
function readAssignedTo() {
    const assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => transformCheckboxIdToName(checkbox.id));
    return assignedTo;
}


function refreshContactNamesInInput() {
    let checkedContacts = readAssignedTo();
    const dropAssignedTo = document.getElementById('dropAssignedTo')
    dropAssignedTo.value = `An `
    for (let i = 0; i < checkedContacts.length; i++) {
        const singleContact = checkedContacts[i];
        dropAssignedTo.value += `${singleContact}, `;
    }
    updateLastStringOfInput();
}


function updateLastStringOfInput() {
    lastStringOfInput = document.getElementById("dropAssignedTo").value;
}


function transformCheckboxIdToName(id) {
    id = id.replace('checkbox_', '');
    const seperatedNames = id.split("_");
    let name = '';
    for (let i = 0; i < seperatedNames.length; i++) {
        const singleName = upperCaseFirstLetter(seperatedNames[i]);
        if (i === seperatedNames.length - 1) {
            name += singleName;
        } else {
            name = singleName + ' ';
        }
    }
    return name
}


function transformNameToId(name, partBeforeName = '', partAfterName = '') {
    return (partBeforeName + name.trim().replace(/\s+/g, '_').toLowerCase() + partAfterName);
}


function toggleDropdown(whichDropdown, displayMode = 'd-block', shallVisible = '') {
    const dropdown = document.getElementById(`dropdown-${whichDropdown}`);
    const arrowDown = document.getElementById(`input-${whichDropdown}-arrow-down`);
    const arrowUp = document.getElementById(`input-${whichDropdown}-arrow-up`);

    toggleDisplayNone(dropdown, displayMode, shallVisible);
    toggleDisplayNone(arrowDown, displayMode, !shallVisible);
    toggleDisplayNone(arrowUp, displayMode , shallVisible);
}


/**
 * This function set the status of the next task and open the addTask.html
 * 
 * @param {string} status - the status of the next task 
 */
async function addTaskFromBoard(status = 'To do') {
    if (checkContentOfArray(status, possibleStatuses)) {
        await putNextStatus(status);
        document.location.href = "addTask.html";
    } else {
        let HTML = 'Bitte geben sie einen gültigen Status ein. Möglich sind ';
        for (let i = 0; i < possibleStatuses.length; i++) {
            const singlePossibleStatuses = possibleStatuses[i];
            HTML += `"` + singlePossibleStatuses + `"`;
            if (i == possibleStatuses.length - 1) {
                HTML += '.'
            } else if (i == possibleStatuses.length - 2) {
                HTML += ' oder '
            } else {
                HTML += ', '
            }
        }
        alert(HTML)
    }
}


/**
 * This function prepare the information of the addTask-form with another function and post it to the database.
 * 
 * @param {string} boardId - That includes the ID of the board, where the datas should be post.
 */
async function submitTaskForm() {
    const title = document.getElementById("inputTitle").value.trim();
    const description = document.getElementById("textareaDescription").value.trim();
    const dueDate = document.getElementById('inputDate').value;
    const priority = document.querySelector('.btn-selected')?.id;
    const category = document.getElementById("inputCategory").value;
    // const subtasks = document.getElementById("inputSubtasks").value;

    const assignedTo = readAssignedTo();

    if (checkAllInputsHasContent(title, description, dueDate, priority, category, assignedTo)) {
        const data = await prepareDataToSend(title, description, dueDate, priority, category, assignedTo)
        await postTaskToDatabase(data);
        emptyAddTaskInputs();
        putNextStatus();
    }
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
 * 
 * @param {string} dataTitle - contains the title of the task
 * @param {string} dataDescription contains the description of the task
 * @param {Date} dataDueDate - contains the date, when the task shall be finished
 * @param {string} dataPriority - contains the priority of the task
 * @param {string} dataCategory - contains if the task is a task is a "Technical Task" or a "User Story"
 * @param {Array} dataAssignedTo - contains the person(s) which the task is adressed 
 * @returns {object} - contains the all datas of the task
 */
async function prepareDataToSend(dataTitle, dataDescription, dataDueDate, dataPriority, dataCategory, dataAssignedTo) {
    const data = {
        title: dataTitle,
        description: dataDescription,
        finishedUntil: dataDueDate,
        priority: dataPriority,
        assignedTo: dataAssignedTo,
        category: dataCategory,
        subtasks: dataSubtasks,
        status: await getNextStatus(),
    };
    return data;
}


function addTextToInput(str = 'An ') {
    let input = document.getElementById('dropAssignedTo');
    if (input.value === "") {
        input.value = str;
    }
}


/**
 * This function filter your contacts with the input of addTasks and show the result in a dropdown menu.
 * 
 */
async function filterContacts() {
    let contacts = await getContactsAsArray();
    let input = document.getElementById("dropAssignedTo").value.toLowerCase();
    if (input.includes(", ")) {
        input = input.substring(input.lastIndexOf(", ") + 1);
    } else if (input.includes('an ')) {
        input = input.substring(input.lastIndexOf("an ") + 3);
    }

    const filteredContacts = input ? contacts.filter(contact => contact.name.toLowerCase().includes(input)) : contacts;

    if (filteredContacts.length > 0) {
        toggleDropdown('assignedTo', 'd-block', true);
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const item = document.getElementById(transformNameToId(contact.name, 'item_'));
            item.classList.add("d-none");

            for (let y = 0; y < filteredContacts.length; y++) {
                if (filteredContacts[y].name === contact.name) {
                    item.classList.remove("d-none");
                    break;
                }
            }
        }
    } else {
        toggleDropdown('assignedTo', 'd-block', false);
    }
}


async function deletePartInAssingedTo() {
    let input = document.getElementById("dropAssignedTo").value;
    if (input.length < lastStringOfInput.length) {
        const delChar = findDelChar(input);
        if ((input.substring(0, input.lastIndexOf(", ") + 2) == lastStringOfInput.substring(0, input.lastIndexOf(", ") + 2)) && (!isDeletededPartOfSeperator(delChar)) && input.includes("An ")) {
            updateLastStringOfInput();
        } else {
            if (isDeletededPartOfSeperator(delChar)) {
                deleteFromEndOfContact(input);
            } else if (input.includes(", ")) {
                deleteInmidOfContact(input);
            } else {
                document.getElementById("dropAssignedTo").value = "An ";
            }
        }
    } else {
        updateLastStringOfInput();
    }
}


function findDelChar(input) {
    let difference = patienceDiff(input.split(''), lastStringOfInput.split(''));
    for (i = 0; i < difference.lines.length; i++) {
        const positionOfCharacter = difference.lines[i].aIndex;
        if (positionOfCharacter === -1) {
            return difference.lines[i].line
        }
    }
}


function isDeletededPartOfSeperator(delChar) {
    let input = document.getElementById("dropAssignedTo").value;
    return (delChar == "," || (delChar == " " && input.slice(-1) == ","))
}


function deleteFromEndOfContact(input) {
    if (input.includes(", ")) {
        let removedInput = input.substring(input.lastIndexOf(", ") + 2);
        document.getElementById(transformNameToId(removedInput, 'checkbox_',)).checked = false;
        refreshContactNamesInInput()
    } else {
        let removedInput = input.substring(input.lastIndexOf("An ") + 3).replace(',', '');
        document.getElementById(transformNameToId(removedInput, 'checkbox_')).checked = false;
        document.getElementById("dropAssignedTo").value = 'An ';
    }
}


async function deleteInmidOfContact(input) {
    const allContacts = await getContactsAsArray();
    const inputPart1 = input.substring(0, input.lastIndexOf(", ") + 2);
    const inputPart2 = input.substring(input.lastIndexOf(", ") + 2);
    for (i = 0; i < allContacts.length - 1; i++) {
        const singleContactName = allContacts[i].name;
        const checkboxID = transformNameToId(singleContactName, 'checkbox_',);
        if (inputPart1.includes(singleContactName + ', ')) {
            document.getElementById(checkboxID).checked = true;
        } else {
            document.getElementById(checkboxID).checked = false;
        }
    }
    refreshContactNamesInInput();
    document.getElementById("dropAssignedTo").value += inputPart2;
}


// /**
//  * This function returns the name of the contacts of the aktive user as array.
//  * 
//  * @returns {Array} - This array contains the names of the contacts of the active user.
//  */
// async function getNamesOfContacts() {
//     let contacts = await getContactsAsArray();
//     let namesOfContacts = [];
//     for (let i = 0; i < contacts.length; i++) {
//         const name = contacts[i].name;
//         namesOfContacts.push(name);
//     }
//     return namesOfContacts;
// }


/**
 * This function create the assignedTo-Dropdown-Menu, if is not already initialized.
 */
async function createAssignedToDropdown() {
    const dropdown = document.getElementById("dropdown-assignedTo");
    const contacts = await getContactsAsArray();
    dropdown.innerHTML = "";
    contacts.forEach(contact => createAssignedToDropdownHTML(dropdown, contact));
    contactsInitialized = true;
}


function createAssignedToDropdownHTML(dropdown, contact) {
    const contactItem = document.createElement("div");

    contactItem.id = transformNameToId(contact.name, 'item_');
    contactItem.className = "contact-item";
    contactItem.innerHTML = `
        ${contact.name}
        <input type="checkbox" id="${transformNameToId(contact.name, 'checkbox_')}">
    `;

    contactItem.onclick = () => selectContact(contact);
    const checkbox = contactItem.querySelector(`#${transformNameToId(contact.name, 'checkbox_')}`)
    checkbox.onclick = (event) => {
        event.stopPropagation();
        refreshContactNamesInInput()
    };
    dropdown.appendChild(contactItem);
}


/**
 * This function allow to select the checkbox of an contact in the assingedTo-Dropdown-Menu by clicking on the contact (not necessary to click specificly on the checkbox)
 * 
 *  @param {object} contact - This object includes the information of a single contact.
 */
function selectContact(contact) {
    let checkbox = document.getElementById(transformNameToId(contact.name, 'checkbox_',))
    checkbox.checked = !checkbox.checked;
    refreshContactNamesInInput()
}


/**
 * This function allow to select and change the priority-button.
 * 
 * @param {string} priority - That includes the name of the selected priority.
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
 * That function return the priority of the choosen button.
 * 
 * @returns {string} - the priority of the choosen button
 */
// function getSelectedPriority() {
//     if (document.getElementById("urgent").classList.contains("btn-selected")) return "urgent";
//     if (document.getElementById("medium").classList.contains("btn-selected")) return "medium";
//     if (document.getElementById("low").classList.contains("btn-selected")) return "low";
// }


/**
 * This function set the choosen category in the category input field and close the category dropdown menu.
 * 
 * @param {string} category - set the category of the next task as value in the input field
 * @param {element} element - the element what should be hide
 */
function selectCategory(category, element) {
    document.getElementById('inputCategory').value = category;
    toggleDisplayNone(element);
}


function focusElement(element) {
    element.focus();
}


function changeVisibleImages() {
    const plusImg = document.getElementById('input-subtask-plus-box');
    const twoImgBox = document.getElementById('input-subtask-two-img-box')
    toggleDisplayNone(plusImg, 'd-flex');
    toggleDisplayNone(twoImgBox, 'd-flex');
}


function addNewSubtask() {
    const minLength = 3;
    const maxLength = 20;
    const input = document.getElementById('input-subtask');

    if (input.value.length < minLength) {
        alert(`Der Subtask ist zu kurz. Bitte verwende mindestens ${minLength} Zeichen`)
    } else if (input.value.length > maxLength) {
        alert(`Der Subtask ist zu lang. Bitte begrenze dich auf ${maxLength}`)
    } else {
        const subtask = {
            'subtask': input.value,
            'isChecked': false,
        };
        dataSubtasks.push(subtask);
        input.value = '';
        renderNewSubtasks();
    }
}


function renderNewSubtasks() {
    const list = document.getElementById('list-subtasks')
    list.innerHTML = '';
    for (let i = 0; i < dataSubtasks.length; i++) {
        const singleSubtask = dataSubtasks[i].subtask;
        list.innerHTML += /*HTML*/`
            <div>
                <div id="list-item-box-current-subtask${i}" class="d-flex justify-content-between">
                    <li id="" class="">
                        <p>${singleSubtask}</p>
                    </li>
                    <div class="two-img-box">
                        <img id="input-subtask-pen" src="assets/img/addTask/pen.svg" class="" onclick="toggleEditModeSubtask(${i})">
                        <img id="input-subtask-bin" src="assets/img/addTask/bin.svg" class="" onclick="removeSubtask(${i})">
                    </div>
                </div>
                <div id="input-box-current-subtask${i}" class="d-none justify-content-between">
                    <input id="input-current-subtask${i}" type="text" class="">
                    <div class="two-img-box">
                        <img id="input-subtask-pen" src="assets/img/addTask/cross.svg" class="" onclick="toggleEditModeSubtask(${i})">
                        <img id="input-subtask-bin" src="assets/img/addTask/tick-dark.svg" class="" onclick="editSubtask(${i})">
                    </div>
                </div>
            </div>
        `
    }
}


function toggleEditModeSubtask(id) {
    toggleDisplayNone(document.getElementById(`list-item-box-current-subtask${id}`), 'd-flex');
    toggleDisplayNone(document.getElementById(`input-box-current-subtask${id}`), 'd-flex');
    document.getElementById(`input-current-subtask${id}`).value = dataSubtasks[id].subtask;
}


function editSubtask(id) {
    dataSubtasks[id].subtask = document.getElementById(`input-current-subtask${id}`).value;
    toggleEditModeSubtask(id);
    renderNewSubtasks();
}


function removeSubtask(id) {
    dataSubtasks.splice(id, 1);
    renderNewSubtasks();
}


/**
 * This function reset the form of addTask
 */
function emptyAddTaskInputs() {
    document.getElementById("inputTitle").value = '';
    document.getElementById("textareaDescription").value = '';
    document.querySelectorAll('input[type="checkbox"]:checked').checked = false;
    document.getElementById('inputDate').value = '';
    document.getElementById('inputCategory').value = '';
    selectPriority('medium');
    document.getElementById("dropSubtasks").value = '';
    dataSubtasks = [];
}


document.addEventListener("DOMContentLoaded", () => {
    const subtaskInput = document.getElementById('input-subtask');

    subtaskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addNewSubtask();
        }
    });

    createAssignedToDropdown()

    for (let i = 0; i < dropdownMenues.length; i++) {
        const singleDropdown = dropdownMenues[i];
        document.addEventListener('click', (event) => {
            const dropdown = document.getElementById(`dropdown-${singleDropdown}`);
            const inputGroup = document.getElementById(`input-group-dropdown-${singleDropdown}`);
    
            if (!dropdown.contains(event.target) && !inputGroup.contains(event.target)) {
                toggleDropdown(`${singleDropdown}`, 'd-block', false);
            }
        });
    }
});