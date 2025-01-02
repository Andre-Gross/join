async function boardRender() {
  const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  try {
    // Fetch Tasks from Firebase
    const response = await fetch(firebaseUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const tasksData = await response.json();

    if (!tasksData) {
      console.log("No tasks found.");
      return;
    }

    // Clear all task containers
    [
      "todo-container",
      "progress-container",
      "feedback-container",
      "done-container",
    ].forEach((containerId) => {
      document.getElementById(containerId).innerHTML = "";
    });

    // Render Tasks
    Object.entries(tasksData).forEach(([taskId, task]) => {
      const containerId = getContainerIdByStatus(task.status);
      if (!containerId) return;

      // Create Task Element
      const taskElement = document.createElement("div");
      taskElement.classList.add("task");
      taskElement.id = taskId;
      taskElement.setAttribute("draggable", "true");
      taskElement.setAttribute("onclick", `openModal('${taskId}')`);

      // Subtasks HTML
      const subtasksHTML = renderSubtasksHTML(taskId, task.subtasks || []);

      // Task HTML
      taskElement.innerHTML = `
        <div class="task-header">
          <span class="category-label ${task.category
            .replace(/\s+/g, "-")
            .toLowerCase()}">
              ${task.category || "No category"}
          </span>
        </div>
        <h4 class="task-title">${task.title}</h4>
        <p class="task-description">${task.description}</p>
        <div class="task-subtasks">${subtasksHTML}</div>
        <div class="task-footer d-flex justify-content-between align-items-center">
          <div class="assigned-to">${(task.assignedTo || []).join(", ")}</div>
          <div class="priority ${getPriorityClass(task.priority)}">
            <img src="assets/img/general/prio-${task.priority}.png" alt="${task.priority}">
          </div>
        </div>
      `;

      // Append Task to Container
      document.getElementById(containerId).appendChild(taskElement);
    });

    console.log("Tasks rendered successfully.");
    initializeDragAndDrop();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

/**
 * Drag-and-Drop Initialization
 */
function initializeDragAndDrop() {
  const tasks = document.querySelectorAll(".task");
  const containers = document.querySelectorAll(".tasks-container");

  // Dragging Events
  tasks.forEach((task) => {
    task.addEventListener("dragstart", () => {
      task.classList.add("dragging");
    });
    task.addEventListener("dragend", () => {
      task.classList.remove("dragging");
    });
  });

  // Dragover Events
  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggingTask = document.querySelector(".dragging");
      if (!draggingTask) return;

      if (afterElement == null) {
        container.appendChild(draggingTask);
      } else {
        container.insertBefore(draggingTask, afterElement);
      }
    });

    container.addEventListener("drop", async (e) => {
      const draggingTask = document.querySelector(".dragging");
      if (!draggingTask) return;

      const newStatus = getStatusFromContainerId(container.id);
      const taskId = draggingTask.id;

      await updateTaskStatus(taskId, newStatus);
      boardRender();
    });
  });
}

/**
 * Get Container ID by Task Status
 */
function getContainerIdByStatus(status) {
  const statusContainers = {
    "To do": "todo-container",
    "In progress": "progress-container",
    "Await feedback": "feedback-container",
    Done: "done-container",
  };
  return statusContainers[status] || null;
}

/**
 * Get Priority Class
 */
function getPriorityClass(priority) {
  const priorityClasses = {
    urgent: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };
  return priorityClasses[priority] || "";
}

/**
 * Updates the task status in Firebase.
 *
 * @async
 * @function updateTaskStatus
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status of the task.
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
    console.log(`Task ${taskId} updated to status: ${newStatus}`);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
  }
}

/**
 * Calculates the element after which the dragging task should be dropped.
 *
 * @function getDragAfterElement
 * @param {HTMLElement} container - The container where the task is being dragged.
 * @param {number} y - The vertical mouse position.
 * @returns {HTMLElement|null} The element after which the dragging task should be placed, or null.
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
/**
 * Converts container IDs back to task statuses.
 *
 * @function getStatusFromContainerId
 * @param {string} containerId - The container ID (e.g., "todo-container").
 * @returns {string|null} The task status or null if the container ID is not recognized.
 */
function getStatusFromContainerId(containerId) {
  const statusMapping = {
    "todo-container": "To do",
    "progress-container": "In progress",
    "feedback-container": "Await feedback",
    "done-container": "Done",
  };
  return statusMapping[containerId] || null;
}

function renderSubtasksHTML(taskId, subtasks) {
  let HTML = "";
  if (!subtasks || subtasks.length === 0) {
    return HTML;
  }

  // Berechnung des Fortschritts
  const completedSubtasks = subtasks.filter(subtask => subtask.isChecked).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

  HTML += `
    <div class="subtasks-progress-container d-flex align-items-center">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
      </div>
      <div class="subtasks-count">${completedSubtasks}/${totalSubtasks} Subtasks</div>
    </div>
  `;

  return HTML;
}

async function deleteTaskOfModalCard(id) {
  deleteTaskInDatabase(id);
  toggleDisplayModal();
}

function toggleDisplayModal() {
  toggleDisplayNone(document.getElementById("board"));
  toggleDisplayNone(document.getElementById("modalCard"), "d-flex");
}

async function deleteTaskOfModalCard(id) {
  await deleteTaskInDatabase(id), toggleDisplayModal();
  await boardRender();
}

function readAllKeys(object, without = "") {
  const allKeys = [];
  for (let i = 0; i < Object.keys(object).length; i++) {
    const key = Object.keys(object)[i];
    if (checkContentOfArray(key, without)) {
      continue;
    } else {
      allKeys.push(key);
    }
  }
  return allKeys;
}



// Ab hier beginnt der Modal-Card-Code
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

  // Subtasks in der Modal-Card rendern
  renderSubtasksInModal(singleTask.id, singleTask.subtasks);

  toggleDisplayModal();
}


function renderModal(singleTask, allKeys) {
  for (let i = 0; i < allKeys.length; i++) {
    const element = document.getElementById(`modalCard-${allKeys[i]}-value`);
    element.innerHTML = singleTask[allKeys[i]];
  }
}

function renderDate(singleTask) {
  let date = singleTask["finishedUntil"];
  document.getElementById(`modalCard-finishedUntil-value`).innerHTML =
    formatDate(date);
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function renderPriority(priority) {
  let priorityLabel = document.getElementById("modalCard-priority-value");
  priorityLabel.innerHTML = priorityLabelHTML(priority);
}

function priorityLabelHTML(priority) {
  let HTML = `
    <span>${capitalizeFirstLetter(priority)}<span>
    <img src="assets/img/general/prio-${priority}.png" alt="">
    `;
  return HTML;
}


function renderSubtasksInModal(taskId, subtasks) {
  const subtasksContainer = document.getElementById("modalCard-subtasks-value");

  // Container leeren und standardmäßig verstecken
  subtasksContainer.innerHTML = "";
  subtasksContainer.style.display = "none"; // Explizit verstecken

  // Wenn keine Subtasks existieren, Abbrechen
  if (!subtasks || subtasks.length === 0) {
    return; // Keine Subtasks -> Container bleibt versteckt
  }

  // Wenn Subtasks existieren, Container sichtbar machen
  subtasksContainer.style.display = "flex"; // Explizit anzeigen

  // Subtasks hinzufügen
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

    subtaskItem.appendChild(checkbox);
    subtaskItem.appendChild(label);
    subtasksContainer.appendChild(subtaskItem);
  });
}


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
    console.log(`Subtasks für Task ${taskId} erfolgreich aktualisiert.`);
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Subtasks:", error);
  }
}

