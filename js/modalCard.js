/**
 * Opens the "Add Task" modal, renders the task form, and initializes form functionality.
 */
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
 * Opens a modal with details for a specific task.
 * @param {string} id - The ID of the task to display in the modal.
 * 
 * Fetches the task from the database, renders its details inside the modal, and sets up
 * event listeners for editing or deleting the task. It also updates the UI with task-related
 * information such as category, priority, and assigned contacts.
 */
async function openModal(id) {
    const tasksAsArray = await getTasksAsArray();
    const singleTask = tasksAsArray.find((task) => task.id === id);

    if (!singleTask) {
        console.error(`Task mit ID ${id} nicht gefunden.`);
        return;
    }

    const keys = ["category", "title", "description", "finishedUntil"];
    renderModal(singleTask, keys);
    renderDate(singleTask);

    document
        .getElementById("modalCard-category-value")
        .classList.add(
            `bc-category-label-${singleTask.category
                .replace(/\s/g, "")
                .toLowerCase()}`
        );
    renderPriority(singleTask.priority);
    renderAssignedToInModal(singleTask.assignedTo);

    renderSubtasksInModal(singleTask.id, singleTask.subtasks);
    document.getElementById('modalCard-delete-button').onclick = function () { deleteTaskOfModalCard(id) };
    document.getElementById('modal-card-edit-button').onclick = function () { changeToEditMode(id), nextStatus = singleTask.status };

    toggleDisplayModal(true);
}


/**
 * Renders task details inside the modal by populating the relevant fields.
 * @param {Object} singleTask - The task object containing task details.
 * @param {Array<string>} allKeys - The list of keys to be displayed in the modal.
 * 
 * Loops through the provided keys and updates the corresponding elements in the modal with the task's data.
 */
function renderModal(singleTask, allKeys) {
    for (let i = 0; i < allKeys.length; i++) {
        const element = document.getElementById(`modalCard-${allKeys[i]}-value`);
        element.innerHTML = singleTask[allKeys[i]];
    }
}


/**
 * Renders the task's "finishedUntil" date in the modal.
 * @param {Object} singleTask - The task object containing task details.
 * 
 * Retrieves the "finishedUntil" date from the task and displays it in the modal by formatting the date.
 */
function renderDate(singleTask) {
    let date = singleTask["finishedUntil"];
    document.getElementById(`modalCard-finishedUntil-value`).innerHTML =
        formatDate(date);
}


/**
 * Formats a date string in the format "YYYY-MM-DD" to "DD/MM/YYYY".
 * @param {string} date - The date string in "YYYY-MM-DD" format.
 * @returns {string} - The formatted date string in "DD/MM/YYYY" format.
 */
function formatDate(date) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}


/**
 * Renders the priority label in the modal.
 * Displays the priority in uppercase followed by the corresponding priority icon.
 * @param {string} priority - The priority level of the task (e.g., "high", "medium", "low").
 */
function renderPriority(priority) {
    let priorityLabel = document.getElementById("modalCard-priority-value");
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
async function renderAssignedToInModal(assignedTo) {
    const container = document.getElementById('assignedTo-name-labels-container')

    container.innerHTML = '';

    for (let i = 0; i < assignedTo.length; i++) {
        const singleContact = assignedTo[i];
        const id = await getIdOfContactWithName(singleContact);
        container.innerHTML += /*HTML*/`
        <div class="assignedTo-name-label d-flex align-items-center gap-16p">
          ${await createNameCirlceWithId(id)}
          <p>${singleContact}</p>
        </div>
      `
    }
}


/**
 * Renders the list of subtasks in the modal for a given task.
 * Displays a checkbox for each subtask and updates the task's progress when checked/unchecked.
 * @param {string} taskId - The ID of the task for which subtasks are being displayed.
 * @param {Array<Object>} subtasks - Array of subtasks associated with the task, each containing a `subtask` string and `isChecked` boolean.
 */
function renderSubtasksInModal(taskId, subtasks) {
    const subtasksContainer = document.getElementById("modalCard-subtasks-value");


    subtasksContainer.innerHTML = "";
    subtasksContainer.style.display = "none";
    subtasksContainer.style.display = "none";

    if (!subtasks || subtasks.length === 0) {
        return;
    }

    subtasksContainer.style.display = "flex";

    subtasks.forEach((subtask, index) => {
        const subtaskItem = document.createElement("div");
        subtaskItem.classList.add("d-flex", "align-items-center", "gap-2");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = subtask.isChecked;
        checkbox.id = `modal-subtask-${taskId}-${index}`;

        const label = document.createElement("label");
        label.setAttribute("for", `modal-subtask-${taskId}-${index}`);
        label.textContent = subtask.subtask;

        checkbox.addEventListener("change", async () => {
            subtask.isChecked = checkbox.checked;

            await saveSubtaskChange(taskId, subtasks);

            updateProgressBar(taskId, subtasks);
        });

        subtaskItem.appendChild(checkbox);
        subtaskItem.appendChild(label);
        subtasksContainer.appendChild(subtaskItem);
    });
}


/**
 * Saves changes made to the subtasks of a task in the Firebase database.
 * This updates the subtasks' completion status and any changes to the subtask details.
 * @param {string} taskId - The ID of the task whose subtasks are being updated.
 * @param {Array<Object>} subtasks - The updated subtasks array, each containing a `subtask` string and an `isChecked` boolean.
 */
async function saveSubtaskChange(taskId, subtasks) {
    const firebaseUrl = `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;

    try {
        await fetch(firebaseUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ subtasks }),
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Subtasks:", error);
    }
}


function toggleDisplayModal(shallVisible = '') {
    const body = document.body;
    const card = document.getElementById("modalCard");
    const background = document.getElementById("modalCard-background");

    toggleDisplayNone(background, "d-block", shallVisible);
    toggleDisplayNone(card, "d-flex", shallVisible);

    provideScrollingofElement(body)
}


function provideScrollingofElement(element, provideScrolling = '') {
    if (provideScrolling === '') {
        if (element.classList.contains("no-scroll")) {
            element.classList.remove('no-scroll');
        } else {
            element.classList.add('no-scroll');
        }
    } else if (!provideScrolling) {
        element.classList.remove('no-scroll');
    } else if (provideScrolling) {
        element.classList.add('no-scroll');
    }
}


async function changeToEditMode(id) {
    let tasksAsArray = await getTasksAsArray();
    const singleTaskID = tasksAsArray.findIndex((x) => x.id == id);
    const singleTask = tasksAsArray[singleTaskID];

    const modalCardEditMode = document.getElementById('modalCard-edit-mode-template-container');
    renderTaskForm(modalCardEditMode);

    const title = document.getElementById("inputTitle");
    const description = document.getElementById("textareaDescription");
    const dueDate = document.getElementById("inputDate");
    const category = document.getElementById("inputCategory");


    title.value = singleTask.title;
    description.value = singleTask.description;
    dueDate.value = singleTask.finishedUntil;
    selectPriority(singleTask.priority);
    priority = singleTask.priority;
    category.value = singleTask.category;
    dataSubtasks = singleTask.subtasks;

    if (dataSubtasks) {
        renderNewSubtasks();
    }

    toggleEditMode(true);

    document
        .getElementById("modalCard-first-line")
        .classList.remove("justify-content-between");
    document
        .getElementById("modalCard-first-line")
        .classList.add("justify-content-end");
    loadFormFunctions();

    modalCardEditMode.querySelector("form").onsubmit = function () {
        submitTaskForm("put", id);
        return false;
    };
}


function closeModalCard() {
    const modalBackground = document.getElementById("modalCard-background");
    const modalCardEditModeContainer = document.getElementById('modalCard-edit-mode-template-container');
    const modalAddTask = document.getElementById('modalAddTask');
    const modalAddTaskContainer = document.getElementById('modalAddTask-template-container');

    if (!(modalAddTaskContainer.innerHTML === '')) {
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
    nextStatus = 'To do';
}


function toggleEditMode(shallVisible = '') {
    toggleDisplayNone(document.getElementById("modalCard-no-edit-mode"), 'd-block', !shallVisible);
    toggleDisplayNone(document.getElementById("modalCard-edit-mode"), 'd-block', shallVisible);
    toggleDisplayNone(document.getElementById("modalCard-category-value"), 'd-block', !shallVisible);
}