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
    renderFullModalCard(singleTask);
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
 * Toggles the visibility of the modal while controlling body scrolling.
 * @param {boolean|string} shallVisible - Determines visibility: true (show), false (hide), or '' (toggle).
 */
function toggleDisplayModal(shallVisible = "") {
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
      element.classList.toggle("no-scroll");
    } else {
      element.classList.toggle("no-scroll", !allowScrolling);
    }
  }

/**
 * Sets up the modal to edit an existing task by populating the form fields with the task's current data.
 * @param {string} id - The ID of the task to edit.
 */
async function changeToEditMode(id) {
    const tasksAsArray = await getTasksAsArray();
    const singleTask = tasksAsArray.find((task) => task.id === id);
  
    const templateContainer = document.getElementById(
      "modalCard-edit-mode-template-container"
    );
    renderTaskForm(templateContainer, "put", id);
  
    assignTaskDataToForm(singleTask);
    toggleEditMode(true);
    adjustFirstLineLayoutForEditMode();
  
    loadFormFunctions();
  
    await createAssignedToDropdown(singleTask.assignedTo);
    await refreshChoosenContactCircles(singleTask.assignedTo);
  
    const sendButton = document.getElementById("sendButton");
    sendButton.onclick = () => {
      submitTaskForm("put", id);
      return false;
    };
  
    document.querySelectorAll(".required-star").forEach((element) => {
      element.classList.add("d-none");
    });
  
    enableDisableSendButton();
  }

/**
 * Sets up event listeners for the modal's delete and edit buttons.
 *
 * @param {string} id - The ID of the task.
 * @param {Object} singleTask - The task object.
 */
function setupModalEventListeners(id, singleTask) {
    let deleteButton = document.getElementById("modalCard-delete-button");
    let editButton = document.getElementById("modalCard-edit-button");
  
    deleteButton = removeAllEventListeners(deleteButton);
    editButton = removeAllEventListeners(editButton);
  
    deleteButton.addEventListener("click", () => deleteTaskOfModalCard(id));
    editButton.addEventListener("click", () =>
      changeToEditMode(id, singleTask.status)
    );
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
 * Closes the modal card and resets the state depending on the modal type.
 * Clears the content of the modal if it's the "Add Task" modal or resets the "Edit Mode" modal.
 */
function closeModalCard() {
    const modalBackground = document.getElementById("modalCard-background");
    const modalCardEditModeContainer = document.getElementById(
      "modalCard-edit-mode-template-container"
    );
    const modalAddTask = document.getElementById("modalAddTask");
    const modalAddTaskContainer = document.getElementById(
      "modalAddTask-template-container"
    );
  
    if (modalAddTaskContainer.innerHTML !== "") {
      modalAddTask.classList.remove("xMiddle");
      toggleDisplayNone(modalBackground, "d-block", false);
      setTimeout(() => {
        modalAddTaskContainer.innerHTML = "";
      }, 500);
    } else {
      modalCardEditModeContainer.innerHTML = "";
      toggleEditMode(false);
      toggleDisplayModal(false);
    }
  
    adjustFirstLineLayoutToDefault();
  
    nextStatus = "To do";
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
 * Assigns task data to the respective form fields.
 * @param {Object} task - The task to assign data from.
 */
function assignTaskDataToForm(task) {
    const title = document.getElementById("inputTitle");
    const description = document.getElementById("textareaDescription");
    const dueDate = document.getElementById("inputDate");
    const category = document.getElementById("inputCategory");
  
    title.value = task.title || "";
    description.value = task.description || "";
    dueDate.value = task.finishedUntil || "";
    selectPriority(task.priority);
    category.value = task.category;
  
    if (task.subtasks) {
    dataSubtasks = task.subtasks;
      renderNewSubtasks();
    }
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