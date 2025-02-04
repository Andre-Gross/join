let contactsInitialized = false;
let dataSubtasks = [];
let lastStringOfInput = '';
let nextStatus = "To Do"

const possibleStatuses = ['To do', 'In progress', 'Await feedback', 'Done'];
const dropdownMenues = ['assignedTo', 'category']
const toastMessage = '<span>Task added to board</span><img src="assets/img/general/board.svg" alt="board">'


/**
 * That function read the information, for which contact the task is assigned to.
 * 
 * @returns {string} - The person(s), which are assigned to to do the task.
 */
function readAssignedTo() {
    const dropdown = document.getElementById("dropdown-assignedTo");
    const assignedToCheckboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
    const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => transformIdToString(checkbox.id, 'checkbox_'));
    return assignedTo;
}


async function refreshChoosenContactCircles() {
    let checkedContacts = readAssignedTo();
    const choosenContactsContainer = document.getElementById('assignedTo-choosen-contacts')

    choosenContactsContainer.innerHTML = '';
    for (let i = 0; i < checkedContacts.length; i++) {
        const singleContact = checkedContacts[i];
        choosenContactsContainer.innerHTML += await createNameCirlceWithRemove(singleContact)
    }
    updateLastStringOfInput();
}


async function createNameCirlceWithRemove(id) {
    const contacts = await getContacts();
    const initials = returnInitialsOfName(contacts[id].name);
    const color = contacts[id].color.replace('#', '').toLowerCase();

    let HTML = createNameCirlce(initials, color);

    const divId = `transformStringToId(${id}, 'nameCircle-')`;
    const onclickFunction = `selectContact('${id}')`;

    HTML = HTML.replace('<div', `<div id="${divId}" onclick="${onclickFunction}"`);

    return HTML;
}


function updateLastStringOfInput() {
    lastStringOfInput = document.getElementById("dropAssignedTo").value;
}


function transformIdToString(string, part1 = '', part2 = '') {
    string = string.replace(part1, '').replace(part2, '');
    return string;
}


function transformStringToId(string, partBeforeString = '', partAfterString = '') {
    return (partBeforeString + string.trim().replace(/\s+/g, '_') + partAfterString);
}


function toggleDropdown(whichDropdown, displayMode = 'd-block', shallVisible = '') {
    const input = document.getElementById(`input-group-dropdown-${whichDropdown}`)
    const dropdown = document.getElementById(`dropdown-${whichDropdown}`);
    const inputDummy = document.getElementById(`input-dummy-${whichDropdown}`);
    const arrowDown = document.getElementById(`input-${whichDropdown}-arrow-down`);
    const arrowUp = document.getElementById(`input-${whichDropdown}-arrow-up`);


    if (shallVisible === '') {
        toggleDisplayNone(dropdown, displayMode);
        toggleDisplayNone(inputDummy, 'd-block')
        toggleDisplayNone(arrowDown, displayMode);
        toggleDisplayNone(arrowUp, displayMode);
    } else {
        toggleDisplayNone(dropdown, displayMode, shallVisible);
        toggleDisplayNone(inputDummy, 'd-block', shallVisible)
        toggleDisplayNone(arrowDown, displayMode, !shallVisible);
        toggleDisplayNone(arrowUp, displayMode, shallVisible);
    }

    if (shallVisible === '') {
        if (input.classList.contains('active-dropdown-input')) {
            input.classList.remove('active-dropdown-input');
        } else {
            input.classList.add('active-dropdown-input');
        }
    } else if (shallVisible) {
        input.classList.add('active-dropdown-input');
    } else {
        input.classList.remove('active-dropdown-input');
    }


}


function addTaskFromBoard() {
    const modalAddTask = document.getElementById('modalAddTask');
    const container = document.getElementById('modalAddTask-template-container');
    const modalBackground = document.getElementById('modalCard-background');

    renderTaskForm(container);
    toggleDisplayNone(modalBackground, 'd-block', true);
    modalAddTask.classList.add('xMiddle');
    loadFormFunctions();
}



/**
 * This function prepare the information of the addTask-form with another function and post it to the database.
 * 
 * @param {string} boardId - That includes the ID of the board, where the datas should be post.
 */
async function submitTaskForm(method = 'post', id = '') {
    const title = document.getElementById("inputTitle").value.trim();
    const description = document.getElementById("textareaDescription").value.trim();
    const dueDate = document.getElementById('inputDate').value;
    const priority = document.querySelector('.btn-selected')?.id;
    const category = document.getElementById("inputCategory").value;

    const assignedTo = readAssignedTo();

    if (checkAllInputsHasContent(title, dueDate, category)) {
        const data = await prepareDataToSend(title, description, dueDate, priority, category, assignedTo)
        if (method === 'put') {
            await putTaskToDatabase(id, data);
        } else {
            await postTaskToDatabase(data);
        }
        showToast(toastMessage, 'middle', 0);
        setTimeout(async () => {
            nextStatus = 'To do';
            const allTasks = await getTasksAsArray();
            for (let i = allTasks.length - 1; i > 0; i--) {
                const singleTask = allTasks[i];
                if (singleTask.title === title && singleTask.description === description) {
                    window.location.href = `./board.html`;
                    break;
                }
            }
        }, 3000);
    } else {
        alert('Please fill all required fields');
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
function checkAllInputsHasContent(title, dueDate, category) {
    if (title == '' || dueDate == '' || category == '') {
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


function changeTextRequired(field) {
    const input = document.getElementById(`input${upperCaseFirstLetter(field.toLowerCase())}`);
    const text = document.getElementById(`text-required-input-${field.toLowerCase()}`);

    if (input.value === '') {
        toggleDisplayNone(text, "d-block", true);
    } else {
        toggleDisplayNone(text, "d-block", false);
    }
}


/**
 * This function filter your contacts with the input of addTasks and show the result in a dropdown menu.
 * 
 */
async function filterContacts() {
    let contacts = await getContactsAsArray();
    let input = document.getElementById("dropAssignedTo").value.toLowerCase();
    // if (input.includes(", ")) {
    //     input = input.substring(input.lastIndexOf(", ") + 1);
    // } else if (input.includes('an ')) {
    if (input.includes('an ')) {
        input = input.substring(input.lastIndexOf("an ") + 3);
    }

    const filteredContacts = input ? contacts.filter(contact => contact.name.toLowerCase().includes(input)) : contacts;

    if (filteredContacts.length > 0) {
        toggleDropdown('assignedTo', 'd-block', true);
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const item = document.getElementById(transformStringToId(contact.id, 'item_'));
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


function savePrefixInAssingedTo() {
    const input = document.getElementById("dropAssignedTo");
    const prefix = 'An '

    if (!(input.value.includes(prefix))) {
        if (input.value.length < 3) {
            input.value = prefix;
            updateLastStringOfInput()
        } else if (lastStringOfInput.includes(prefix)) {
            input.value = lastStringOfInput()
        }
    } else {
        updateLastStringOfInput();
    }
}


function emptyAssignedTo() {
    const input = document.getElementById("dropAssignedTo");

    if (input.value.length <= 3) {
        input.value = '';
    }
}


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

    contactItem.id = transformStringToId(contact.id, 'item_');
    contactItem.className = "contact-item";
    contactItem.innerHTML = `
        ${contact.name}
        <input type="checkbox" id="${transformStringToId(contact.id, 'checkbox_')}">
    `;

    contactItem.onclick = async () => selectContact(contact.id);
    const checkbox = contactItem.querySelector(`#${transformStringToId(contact.id, 'checkbox_')}`)
    checkbox.onclick = (event) => {
        event.stopPropagation();
        refreshChoosenContactCircles()
    };
    dropdown.appendChild(contactItem);
}


/**
 * This function allow to select the checkbox of an contact in the assingedTo-Dropdown-Menu by clicking on the contact (not necessary to click specificly on the checkbox)
 * 
 *  @param {object} contact - This object includes the information of a single contact.
 */
async function selectContact(id) {
    const input = document.getElementById("dropAssignedTo")
    const checkbox = document.getElementById(transformStringToId(id, 'checkbox_',))

    checkbox.checked = !checkbox.checked;

    if (!(input.value === '' || input.value === 'An ')) {
        input.value = '';
        input.focus();
    }
    await refreshChoosenContactCircles()
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
 * This function set the choosen category in the category input field and close the category dropdown menu.
 * 
 * @param {string} category - set the category of the next task as value in the input field
 * @param {element} element - the element what should be hide
 */
function selectCategory(category, element) {
    document.getElementById('inputCategory').value = category;
    const inputDummy = document.getElementById('input-dummy-category');
    toggleDisplayNone(element);
    toggleDisplayNone(inputDummy, 'd-block', false);
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
    const listContainer = document.getElementById('list-subtasks-container')
    const list = document.getElementById('list-subtasks')
    if (dataSubtasks.length > 0) {
        toggleDisplayNone(listContainer, 'd-block', true);
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
    } else {
        toggleDisplayNone(listContainer, 'd-block', false);
    }
}


function toggleEditModeSubtask(id) {
    const element = document.getElementById(`input-current-subtask${id}`);

    toggleDisplayNone(document.getElementById(`list-item-box-current-subtask${id}`), 'd-flex');
    toggleDisplayNone(document.getElementById(`input-box-current-subtask${id}`), 'd-flex');
    element.value = dataSubtasks[id].subtask;

    element.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            editSubtask(id)
        };
    });
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
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(el => el.checked = false)
    document.getElementById('dropAssignedTo').value = '';
    document.getElementById('inputDate').value = '';
    document.getElementById('inputCategory').value = '';
    selectPriority('medium');
    document.getElementById("input-subtask").value = [];
    dataSubtasks = [];
    renderNewSubtasks();
}


function loadFormFunctions() {
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

            if (dropdown) {
                if (!dropdown.contains(event.target) && !inputGroup.contains(event.target)) {
                    toggleDropdown(`${singleDropdown}`, 'd-block', false);
                }
            }
        });
    }
}


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


// Zu Testzwecken

async function fillForm(id = '-OCPZc1JZydVpwJpUKbh') {
    let tasksAsArray = await getTasksAsArray();
    const singleTaskID = tasksAsArray.findIndex(x => x.id == id);

    const title = document.getElementById("inputTitle");
    const description = document.getElementById("textareaDescription");
    const dueDate = document.getElementById('inputDate');
    const category = document.getElementById("inputCategory");

    title.value = singleTask.title;
    description.value = singleTask.description;
    dueDate.value = singleTask.finishedUntil;
    selectPriority(singleTask.priority)
    priority = singleTask.priority;
    category.value = singleTask.category;
    dataSubtasks = singleTask.subtasks;

    if (dataSubtasks) {
        renderNewSubtasks();
    }
}