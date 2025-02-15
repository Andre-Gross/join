/**
 * Opens the "Add Task" modal, renders the task form, and initializes form functionality.
 */
function openAddTaskInBoard(status = nextStatus) {
    const modalAddTask = document.getElementById('modalAddTask');
    const container = document.getElementById('modalAddTask-template-container');
    const modalBackground = document.getElementById('modalCard-background');
    nextStatus = status;

    renderTaskForm(container);
    toggleDisplayNone(modalBackground, 'd-block', true);
    modalAddTask.classList.add('xMiddle');
    loadFormFunctions();
}


/**
 * Opens a modal displaying details of a specific task.
 * 
 * @param {string} id - The ID of the task to display.
 * @returns {Promise<void>} Resolves when the modal is fully rendered.
 * 
 * Fetches the task from the database, renders its details inside the modal, 
 * and sets up event listeners for editing or deleting the task.
 */
async function openModal(id) {
    const tasksAsArray = await getTasksAsArray();

    if (!Array.isArray(tasksAsArray)) {
        console.error("Fehler: Konnte Aufgabenliste nicht abrufen.");
        return;
    }

    const singleTask = tasksAsArray.find((task) => task.id === id);

    if (!singleTask) {
        console.error(`Task mit ID ${id} nicht gefunden.`);
        return;
    }

    nextStatus = singleTask.status;
    renderFullModalCard(singleTask)
    setupModalEventListeners(id, singleTask);
    toggleDisplayModal(true);
}


function renderFullModalCard(singleTask) {
    renderCategoryLabel(singleTask.category);
    renderModalParts(singleTask);
    renderDate(singleTask);
    renderPriority(singleTask.priority);
    if (singleTask.assignedTo !== undefined) {
        renderAssignedToInModal(singleTask.assignedTo);
    }
    renderSubtasksInModal(singleTask.id, singleTask.subtasks);
}


/**
 * Adds a CSS class to the category label in the modal.
 * The class name is generated dynamically based on the category name.
 * 
 * @param {string} category - The name of the category.
 */
function renderCategoryLabel(category) {
    const possibleCategories = ["Technical Task", "User Story"]

    possibleCategories.forEach((singlePossibleCategory) =>
        document
            .getElementById("modalCard-category-value")
            .classList.add(
                `bc-category-label-${singlePossibleCategory
                    .replace(/\s/g, "")
                    .toLowerCase()}`
            ));

    if (!category) return;

    document
        .getElementById("modalCard-category-value")
        .classList.add(
            `bc-category-label-${category
                .replace(/\s/g, "")
                .toLowerCase()}`
        );
}


/**
 * Populates the modal with task details.
 * Updates the modal fields for category, title, description, and due date.
 * 
 * @param {Object} singleTask - The task object containing task details.
 * @param {string} singleTask.category - The category of the task.
 * @param {string} singleTask.title - The title of the task.
 * @param {string} singleTask.description - The description of the task.
 * @param {string} singleTask.finishedUntil - The due date of the task.
 */
function renderModalParts(singleTask) {
    const allKeys = ["category", "title", "description", "finishedUntil"];
    allKeys.forEach((key) => {
        const element = document.getElementById(`modalCard-${key}-value`);
        element.innerHTML = singleTask[key];
    });
}


/**
 * Renders the task's due date in the modal.
 * 
 * @param {Object} singleTask - The task object containing task details.
 * @param {string} singleTask.finishedUntil - The due date in "YYYY-MM-DD" format.
 */
function renderDate(singleTask) {
    if (!singleTask?.finishedUntil) return;

    document.getElementById(`modalCard-finishedUntil-value`).innerHTML =
        formatDate(singleTask.finishedUntil);
}


/**
 * Formats a date string in the format "YYYY-MM-DD" to "DD/MM/YYYY".
 * @param {string} date - The date string in "YYYY-MM-DD" format.
 * @returns {string} - The formatted date string in "DD/MM/YYYY" format.
 */
function formatDate(date) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Invalid Date";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}


/**
 * Renders the priority label in the modal.
 * Displays the priority in uppercase along with an icon.
 * 
 * @param {string} priority - The priority level ("high", "medium", "low").
 */
function renderPriority(priority) {
    if (!priority) return;

    const priorityLabel = document.getElementById("modalCard-priority-value");
    priorityLabel.innerHTML = /*HTML*/`
      <div id="priority-label" class="d-flex">
        <p>${upperCaseFirstLetter(priority)}</p>
        ${priorityLabelHTML(priority)}
      </div>`;
}


/**
 * Renders the list of assigned contacts in the modal.
 * For each contact, it creates a label with their name and a corresponding circle icon.
 * @param {Array<string>} assignedTo - Array of contact names assigned to the task.
 */
async function renderAssignedToInModal(assignedToIds) {
    const container = document.getElementById('assignedTo-name-labels-container');
    container.innerHTML = '';

    const assignedContacts = await Promise.all(assignedToIds.map(async (singleId) => {
        const circle = await createNameCircleWithId(singleId);
        const contact = await getContacts();
        const name = contact[singleId].name;
        return { name, circle };
    }));

    const fragment = document.createDocumentFragment();

    assignedContacts.forEach(({ name, circle }) => {
        const div = document.createElement('div');
        div.classList.add("assignedTo-name-label", "d-flex", "align-items-center", "gap-16p");
        div.innerHTML = `${circle}<p>${name}</p>`;
        fragment.appendChild(div);
    });

    container.appendChild(fragment);
}


/**
 * Renders the list of subtasks in the modal.
 * @param {string} taskId - The ID of the task for which subtasks are being displayed.
 * @param {Array<Object>} subtasks - Array of subtasks associated with the task, each containing a `subtask` string and `isChecked` boolean.
 */
function renderSubtasksInModal(taskId, subtasks) {
    const subtasksContainer = document.getElementById("modalCard-subtasks-value");
    subtasksContainer.innerHTML = "";
    const anythingToDo = areThereSubtasks(subtasks)

    toggleDisplayNone(subtasksContainer, 'd-flex', anythingToDo);

    if (!anythingToDo) {
        return;
    }

    const fragment = createSubtasksFragment(taskId, subtasks);

    subtasksContainer.appendChild(fragment);
}


/**
 * Checks if there are subtasks to render.
 * @param {Array<Object>} subtasks - Array of subtasks.
 * @returns {boolean} - Returns `true` if subtasks exist, otherwise `false`.
 */
function areThereSubtasks(subtasks) {
    return subtasks && subtasks.length > 0;
}


/**
 * Creates a document fragment containing all subtask elements.
 * @param {string} taskId - The ID of the task.
 * @param {Array<Object>} subtasks - Array of subtasks.
 * @returns {DocumentFragment} - A fragment containing all subtask elements.
 */
function createSubtasksFragment(taskId, subtasks) {
    const fragment = document.createDocumentFragment();

    subtasks.forEach((subtask, index) => {
        const subtaskItem = createSubtaskElement(taskId, subtask, index, subtasks);
        fragment.appendChild(subtaskItem);
    });

    return fragment;
}


/**
 * Creates a single subtask element including a checkbox and label.
 * @param {string} taskId - The ID of the task.
 * @param {Object} subtask - A single subtask object containing `subtask` (string) and `isChecked` (boolean).
 * @param {number} index - The index of the subtask.
 * @param {Array<Object>} subtasks - The full list of subtasks.
 * @returns {HTMLDivElement} - The subtask element.
 */
function createSubtaskElement(taskId, subtask, index, subtasks) {
    const subtaskItem = document.createElement("div");
    subtaskItem.classList.add("d-flex", "align-items-center", "gap-2");

    const checkbox = createSubtaskCheckbox(taskId, subtask, index, subtasks);
    const label = createSubtaskLabel(checkbox.id, subtask.subtask);

    subtaskItem.append(checkbox, label);
    return subtaskItem;
}


/**
 * Creates a checkbox for a subtask.
 * @param {string} taskId - The ID of the task.
 * @param {Object} subtask - The subtask object.
 * @param {number} index - The index of the subtask.
 * @param {Array<Object>} subtasks - The full list of subtasks.
 * @returns {HTMLInputElement} - The created checkbox element.
 */
function createSubtaskCheckbox(taskId, subtask, index, subtasks) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = subtask.isChecked;
    checkbox.id = `modal-subtask-${taskId}-${index}`;

    checkbox.addEventListener("change", async () => {
        subtask.isChecked = checkbox.checked;
        await saveSubtaskChange(taskId, subtasks);
        updateProgressBar(taskId, subtasks);
    });

    return checkbox;
}


/**
 * Creates a label for a subtask.
 * @param {string} checkboxId - The ID of the associated checkbox.
 * @param {string} subtaskText - The text of the subtask.
 * @returns {HTMLLabelElement} - The created label element.
 */
function createSubtaskLabel(checkboxId, subtaskText) {
    const label = document.createElement("label");
    label.setAttribute("for", checkboxId);
    label.textContent = subtaskText;
    return label;
}


/**
 * Sets up event listeners for the modal's delete and edit buttons.
 *
 * @param {string} id - The ID of the task.
 * @param {Object} singleTask - The task object.
 */
function setupModalEventListeners(id, singleTask) {
    let deleteButton = document.getElementById('modalCard-delete-button');
    let editButton = document.getElementById('modalCard-edit-button');

    deleteButton = removeAllEventListeners(deleteButton);
    editButton = removeAllEventListeners(editButton);

    deleteButton.addEventListener('click', () => deleteTaskOfModalCard(id));
    editButton.addEventListener('click', () => changeToEditMode(id, singleTask.status));
}


/**
 * Removes all event listeners from a given element by replacing it with a clone.
 *
 * @param {HTMLElement} element - The element from which to remove all event listeners.
 * @returns {HTMLElement} - The new cloned element without event listeners.
 */
function removeAllEventListeners(element) {
    const newElement = element.cloneNode(true);
    element.replaceWith(newElement);
    return newElement;
}


/**
 * Saves changes made to the subtasks of a task in the Firebase database.
 *
 * @param {string} taskId - The ID of the task whose subtasks are being updated.
 * @param {Array<Object>} subtasks - The updated subtasks array, each containing a `subtask` string and an `isChecked` boolean.
 * @returns {Promise<boolean>} - Resolves to `true` if the update was successful, otherwise `false`.
 */
async function saveSubtaskChange(taskId, subtasks) {
    if (!taskId || !Array.isArray(subtasks)) {
        console.error("Ungültige Parameter für saveSubtaskChange");
        return false;
    }

    const firebaseUrl = `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;

    try {
        const response = await fetch(firebaseUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ subtasks }),
        });

        return response.ok;
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Subtasks:", error);
        return false;
    }
}


/**
 * Toggles the visibility of the modal while controlling body scrolling.
 * @param {boolean|string} shallVisible - Determines visibility: true (show), false (hide), or '' (toggle).
 */
function toggleDisplayModal(shallVisible = '') {
    const card = document.getElementById("modalCard");
    const background = document.getElementById("modalCard-background");

    toggleDisplayNone(background, "d-block", shallVisible);
    toggleDisplayNone(card, "d-flex", shallVisible);
    toggleScrolling(document.body, !shallVisible);
}


/**
 * Toggles or explicitly sets scrolling behavior on an element.
 * @param {HTMLElement} element - The element to modify.
 * @param {boolean|null} allowScrolling - If true, enables scrolling; if false, disables scrolling; if null, toggles.
 */
function toggleScrolling(element, allowScrolling = null) {
    if (allowScrolling === null) {
        element.classList.toggle('no-scroll');
    } else {
        element.classList.toggle('no-scroll', !allowScrolling);
    }
}


/**
 * Sets up the modal to edit an existing task by populating the form fields with the task's current data.
 * @param {string} id - The ID of the task to edit.
 */
async function changeToEditMode(id) {
    const tasksAsArray = await getTasksAsArray();
    const singleTaskID = tasksAsArray.findIndex((task) => task.id == id);

    if (singleTaskID === -1) {
        console.error("Task not found");
        return;
    }

    const singleTask = tasksAsArray[singleTaskID];

    const templateContainer = document.getElementById('modalCard-edit-mode-template-container');
    const sendButton = document.getElementById('sendButton');

    renderTaskForm(templateContainer, 'put', id);

    assignTaskDataToForm(singleTask);

    toggleEditMode(true);
    adjustFirstLineLayoutForEditMode();

    sendButton.onclick = function () {
        submitTaskForm("put", id);
        return false;
    };
}


/**
 * Assigns task data to the respective form fields.
 * @param {Object} task - The task to assign data from.
 */
function assignTaskDataToForm(task) {
    const title = document.getElementById("inputTitle");
    const description = document.getElementById("textareaDescription");
    const dueDate = document.getElementById("inputDate");
    const category = document.getElementById("inputCategory");

    title.value = task.title || '';
    description.value = task.description || '';
    dueDate.value = task.finishedUntil || '';
    selectPriority(task.priority);
    category.value = task.category;
    dataSubtasks = task.subtasks;

    if (dataSubtasks) {
        renderNewSubtasks();
    }
}


/**
 * Adjusts the layout of the first line in the modal for the edit mode.
 */
function adjustFirstLineLayoutForEditMode() {
    const modalCardFirstLine = document.getElementById("modalCard-first-line");
    modalCardFirstLine.classList.remove("justify-content-between");
    modalCardFirstLine.classList.add("justify-content-end");
}


/**
 * Closes the modal card and resets the state depending on the modal type.
 * Clears the content of the modal if it's the "Add Task" modal or resets the "Edit Mode" modal.
 */
function closeModalCard() {
    const modalBackground = document.getElementById("modalCard-background");
    const modalCardEditModeContainer = document.getElementById('modalCard-edit-mode-template-container');
    const modalAddTask = document.getElementById('modalAddTask');
    const modalAddTaskContainer = document.getElementById('modalAddTask-template-container');

    if (modalAddTaskContainer.innerHTML !== '') {
        modalAddTask.classList.remove('xMiddle');
        toggleDisplayNone(modalBackground, 'd-block', false);
        setTimeout(() => {
            modalAddTaskContainer.innerHTML = '';
        }, 500)
    } else {
        modalCardEditModeContainer.innerHTML = '';
        toggleEditMode(false);
        toggleDisplayModal(false);
    }

    adjustFirstLineLayoutToDefault()

    nextStatus = 'To do';
}


/**
 * Adjusts the layout of the first line in the modal to its default state.
 * This removes the 'justify-content-end' class and adds the 'justify-content-between' class
 * to ensure that the layout is aligned as intended for the default view.
 */
function adjustFirstLineLayoutToDefault() {
    document
        .getElementById("modalCard-first-line")
        .classList.remove("justify-content-end");
    document
        .getElementById("modalCard-first-line")
        .classList.add("justify-content-between");
}


/**
 * Toggles the visibility of the edit mode in the modal.
 * Based on the provided parameter, it shows or hides the edit-related content.
 * @param {boolean} shallVisible - Whether the edit mode should be visible (true) or not (false).
 */
function toggleEditMode(shallVisible = '') {
    toggleDisplayNone(document.getElementById("modalCard-no-edit-mode"), 'd-block', !shallVisible);
    toggleDisplayNone(document.getElementById("modalCard-edit-mode"), 'd-block', shallVisible);
    toggleDisplayNone(document.getElementById("modalCard-category-value"), 'd-block', !shallVisible);
}