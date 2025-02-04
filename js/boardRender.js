/**
 * Lädt und rendert das Board mit Aufgaben und Kontakten aus Firebase.
 */
async function boardRender() {
  try {
    const [tasksData, contactsData] = await fetchBoardData();
    if (!tasksData || Object.keys(tasksData).length === 0) return;
    clearTaskContainers();
    renderTasks(tasksData, contactsData);
    initializeDragAndDrop();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

/**
 * Ruft Aufgaben und Kontakte aus Firebase ab.
 * @returns {Promise<Array>} Array mit Aufgaben- und Kontaktdaten
 */
async function fetchBoardData() {
  const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app";
  const [tasksResponse, contactsResponse] = await Promise.all([
    fetch(`${firebaseUrl}/tasks.json`),
    fetch(`${firebaseUrl}/users/contacts.json`),
  ]);
  if (!tasksResponse.ok || !contactsResponse.ok) throw new Error("Error fetching data");
  return [await tasksResponse.json(), await contactsResponse.json()];
}

/**
 * Löscht den Inhalt der Aufgaben-Container.
 */
function clearTaskContainers() {
  ["todo-container", "progress-container", "feedback-container", "done-container"].forEach(
    (containerId) => (document.getElementById(containerId).innerHTML = "")
  );
}

/**
 * Rendert die Aufgaben im jeweiligen Container.
 * @param {Object} tasksData - Die geladenen Aufgaben
 * @param {Object} contactsData - Die geladenen Kontakte
 */
function renderTasks(tasksData, contactsData) {
  Object.entries(tasksData).forEach(([taskId, task]) => {
    const containerId = getContainerIdByStatus(task.status);
    if (!containerId) return;
    document.getElementById(containerId).appendChild(createTaskElement(taskId, task, contactsData));
  });
}

/**
 * Erstellt ein Task-Element.
 * @param {string} taskId - Die ID der Aufgabe
 * @param {Object} task - Die Aufgabendaten
 * @param {Object} contactsData - Die geladenen Kontakte
 * @returns {HTMLElement} Das erstellte Task-Element
 */
function createTaskElement(taskId, task, contactsData) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.id = taskId;
  taskElement.setAttribute("draggable", "true");
  taskElement.setAttribute("onclick", `openModal('${taskId}')`);
  taskElement.innerHTML = getTaskHTML(taskId, task, contactsData);
  return taskElement;
}

/**
 * Generiert das HTML für eine Aufgabe.
 * @param {string} taskId - Die ID der Aufgabe
 * @param {Object} task - Die Aufgabendaten
 * @param {Object} contactsData - Die geladenen Kontakte
 * @returns {string} Das HTML der Aufgabe
 */
function getTaskHTML(taskId, task, contactsData) {
  const categoryClass = task.category ? `bc-category-label-${task.category.replace(/\s+/g, "").toLowerCase()}` : "bc-category-label-unknown";
  return `
    <div class="task-header">
      <div class="category-label ${categoryClass}">${task.category || "No category"}</div>
    </div>
    <h4 class="task-title">${task.title}</h4>
    <p class="task-description">${task.description}</p>
    <div class="task-subtasks">${renderSubtasksHTML(taskId, task.subtasks || [])}</div>
    <footer class="task-footer d-flex justify-content-between align-items-center">
      <div class="assigned-contacts d-flex">
        ${renderTaskContacts(task.assignedTo || [], contactsData)}
      </div>
      <div class="task-priority">
        ${priorityLabelHTML(task.priority)}
      </div>
    </footer>
  `;
}


/**
 * Checks if the provided argument is a valid non-empty array.
 *
 * @param {any} arr - The value to check.
 * @returns {boolean} Returns `true` if the argument is a non-empty array, otherwise `false`.
 */
function isValidArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}


/**
 * Renders HTML for displaying subtasks progress.
 *
 * @param {string} taskId - The unique identifier for the task.
 * @param {Array} subtasks - An array of subtask objects to be rendered.
 * @returns {string} Returns HTML string displaying the subtasks' progress.
 */
function renderSubtasksHTML(taskId, subtasks) {
  if (!isValidArray(subtasks)) return "";

  const completedSubtasks = subtasks.filter((subtask) => subtask.isChecked).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

  return `
    <div class="subtasks-progress-container d-flex align-items-center">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
      </div>
      <div class="subtasks-count">${completedSubtasks}/${totalSubtasks} Subtasks</div>
    </div>
  `;
}


/**
 * Renders HTML for displaying assigned contacts.
 *
 * @param {Array} assignedTo - An array of contact IDs or names assigned to the task.
 * @param {Object} contactsData - An object mapping contact IDs to their details (name, color, etc.).
 * @returns {string} Returns HTML string with circles representing assigned contacts.
 */
function renderTaskContacts(assignedTo = [], contactsData = {}) {
  if (!isValidArray(assignedTo)) return "";


  return assignedTo
    .map((contactIdOrName) => {
      let contact = contactsData[contactIdOrName];

      if (!contact) {
        contact = Object.values(contactsData).find((c) => c.name === contactIdOrName);
      }

      if (!contact) {
        return `<div class="contact-circle" style="background-color: #00000000; border: none;"></div>`;
    }
    

      const shortName = contact.name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("");
      const backgroundColor = contact.color || "#ccc";

      return `
        <div class="contact-circle" style="background-color: ${backgroundColor};">
          <span>${shortName}</span>
        </div>
      `;
    })
    .join("");
}


/**
 * Retrieves the container ID based on the task status.
 *
 * @param {string} status - The status of the task (e.g., "To do", "In progress", etc.).
 * @returns {string|null} The ID of the corresponding container element, or null if no matching container is found.
 */
function getContainerIdByStatus(status) {
  const statusContainers = {
    "To do": "todo-container",
    "In progress": "progress-container",
    "Await feedback": "feedback-container",
    "Done": "done-container",
  };
  return statusContainers[status] || null;
}


/**
 * Generates HTML for the priority label based on the provided priority.
 *
 * @param {string} priority - The priority level of the task (e.g., "urgent", "medium", "low").
 * @returns {string} The HTML string for displaying the priority label image.
 */
function priorityLabelHTML(priority) {
  return `<img src="assets/img/general/prio-${priority}.svg" alt="${priority}">`;
}


/**
 * Event listener for when the DOM content is fully loaded.
 * It calls the `boardRender` function to load and render the tasks on the board.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await boardRender();
});


/**
 * Initializes drag-and-drop functionality for tasks on the board.
 * Allows users to drag tasks between different task containers.
 * 
 * - Adds event listeners to each task for drag start, drag end, mouse events.
 * - Adds event listeners to containers to handle drag over and drop actions.
 * - Updates the task's status based on its new container after being dropped.
 * - Creates a placeholder element for the dragged task to maintain the layout.
 */
function initializeDragAndDrop() {
  const tasks = document.querySelectorAll(".task")
  const containers = document.querySelectorAll(".tasks-container")
  let placeholder = null
  let draggedTask = null

  tasks.forEach((task) => {
    task.addEventListener("mousedown", () => {
      task.classList.add("wiggle")
    })

    task.addEventListener("mouseup", () => {
      task.classList.remove("wiggle")
    })

    task.addEventListener("dragstart", (e) => {
      draggedTask = task

      task.style.opacity = "1"
      task.classList.add("dragging")
      task.classList.remove("wiggle")

      placeholder = createPlaceholder(task)

      setTimeout(() => {
        task.style.display = "none"
      }, 0)

      resetAnimation(task)
    })

    task.addEventListener("dragend", () => {
      endDrag(draggedTask, placeholder)
      draggedTask = null
      placeholder = null
    })
  })

  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      handleDragOver(container, e.clientY, placeholder);
    });

    container.addEventListener("drop", async (e) => {
      if (!draggedTask || !placeholder) return;

      const newStatus = getStatusFromContainerId(container.id);
      const taskId = draggedTask.id;

      container.replaceChild(draggedTask, placeholder);

      placeholder.remove();
      placeholder = null;

      await updateTaskStatus(taskId, newStatus);
      boardRender();
    });
  });
}


/**
 * Initializes touch-based drag-and-drop functionality for tasks on the board.
 * Allows users to drag tasks using touch events on mobile or touch-enabled devices.
 * 
 * - Adds event listeners for touchstart, touchmove, and touchend on tasks.
 * - Creates a placeholder element while dragging to maintain the layout.
 * - Handles the touch move event to update the position of the dragged task.
 * - Replaces the placeholder with the dragged task when the drag ends.
 */
function initializeTouchDrag() {
  const tasks = document.querySelectorAll(".task");
  let draggedTask = null;
  let placeholder = null;

  tasks.forEach((task) => {
    task.addEventListener("touchstart", (e) => {
      draggedTask = e.target.closest(".task");
      if (!draggedTask) return;

      placeholder = createPlaceholder(draggedTask);
      draggedTask.parentNode.insertBefore(placeholder, draggedTask.nextSibling);
      draggedTask.classList.add("dragging");
    });

    task.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!draggedTask || !placeholder) return;

      const touch = e.touches[0];
      handleDragOver(draggedTask.parentNode, touch.clientY, placeholder);
    });

    task.addEventListener("touchend", () => {
      if (!draggedTask || !placeholder) return;

      placeholder.replaceWith(draggedTask);
      draggedTask.classList.remove("dragging");
      draggedTask = null;
      placeholder = null;
    });
  });
}


/**
 * Initializes both the desktop drag-and-drop and mobile touch drag functionality on the board.
 * This function enables users to drag tasks in the board interface, either with a mouse or a touch event.
 */
initializeDragAndDrop();
initializeTouchDrag();


/**
 * Creates a placeholder element that mimics the size of the dragged task.
 * This placeholder is used to show the space where the task will be dropped.
 *
 * @param {HTMLElement} task - The task being dragged.
 * @returns {HTMLElement} - The created placeholder element.
 */
function createPlaceholder(task) {
  const placeholder = document.createElement("div");
  placeholder.classList.add("placeholder");
  placeholder.style.width = `${task.offsetWidth}px`;
  placeholder.style.height = `${task.offsetHeight}px`;
  task.parentNode.insertBefore(placeholder, task.nextSibling);
  return placeholder;
}


/**
 * Ends the drag operation by removing the "dragging" class from the task 
 * and restoring its display, as well as removing the placeholder element.
 *
 * @param {HTMLElement} draggedTask - The task that was being dragged.
 * @param {HTMLElement} placeholder - The placeholder element that was used during the drag.
 */
function endDrag(draggedTask, placeholder) {
  if (draggedTask) {
    draggedTask.classList.remove("dragging");
    draggedTask.style.display = "block";
  }

  if (placeholder) {
    placeholder.remove();
  }
}





/**
 * Handles the drag over event by positioning the placeholder element based on
 * the mouse or touch position within the container.
 *
 * @param {HTMLElement} container - The container element that holds the tasks.
 * @param {number} y - The vertical position of the mouse or touch event.
 * @param {HTMLElement} placeholder - The placeholder element to be inserted or moved.
 */
function handleDragOver(container, y, placeholder) {
  const afterElement = getDragAfterElement(container, y);
  if (!placeholder) return;

  if (afterElement == null) {
    container.appendChild(placeholder);
  } else {
    container.insertBefore(placeholder, afterElement);
  }
}


/**
 * Determines the element that the dragged task will be placed after, based on
 * the vertical position of the drag event.
 *
 * @param {HTMLElement} container - The container element that holds the tasks.
 * @param {number} y - The vertical position of the mouse or touch event.
 * @returns {HTMLElement|null} - The element that the dragged task will be placed after, or null if it's at the end.
 */
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}


function getStatusFromContainerId(containerId) {
  const statusMapping = {
    "todo-container": "To do",
    "progress-container": "In progress",
    "feedback-container": "Await feedback",
    "done-container": "Done",
  };
  return statusMapping[containerId] || null;
}


/**
 * Updates the progress bar and subtask count for a task based on the completed subtasks.
 *
 * @param {string} taskId - The ID of the task whose progress needs to be updated.
 * @param {Array} subtasks - The list of subtasks associated with the task.
 * @returns {void}
 */
function updateProgressBar(taskId, subtasks) {
  const taskElement = document.getElementById(taskId);

  if (!taskElement) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }

  const completedSubtasks = subtasks.filter(subtask => subtask.isChecked).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = totalSubtasks > 0
    ? Math.round((completedSubtasks / totalSubtasks) * 100)
    : 0;

  const progressBarContainer = taskElement.querySelector(".progress-bar");
  const subtasksCount = taskElement.querySelector(".subtasks-count");

  if (progressBarContainer) {
    progressBarContainer.style.width = `${progressPercentage}%`;
  }

  if (subtasksCount) {
    subtasksCount.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
  }
}


/**
 * Updates the status of a specific task in the Firebase database.
 *
 * @param {string} taskId - The ID of the task whose status needs to be updated.
 * @param {string} newStatus - The new status to set for the task.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateTaskStatus(taskId, newStatus) {
  const firebaseUrl = `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;

  try {
    await fetch(firebaseUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
  }
}

// Andres Funktionen


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
  } else  if (provideScrolling){
    element.classList.add('no-scroll');
  }
}

async function deleteTaskOfModalCard(id) {
  try {
    await deleteTaskInDatabase(id);
    toggleDisplayModal();
    await boardRender();
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
  }
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
  document.getElementById('modal-card-edit-button').onclick = function () { changeToEditMode(id), putNextStatus(singleTask.status) };

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
