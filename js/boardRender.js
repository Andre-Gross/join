async function boardRender() {
  const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  try {
    // Fetch Tasks from Firebase
    const response = await fetch(firebaseUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const tasksData = await response.json();

    if (!tasksData || Object.keys(tasksData).length === 0) {
      console.log("No tasks found.");
      return;
    }

    // Clear all task containers
    ["todo-container", "progress-container", "feedback-container", "done-container"].forEach(
      (containerId) => {
        document.getElementById(containerId).innerHTML = "";
      }
    );

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

      // Kategorie-Label
      const categoryClass = task.category
        ? `bc-category-label-${task.category.replace(/\s+/g, "").toLowerCase()}`
        : "bc-category-label-unknown";
      const categoryHTML = `
        <div class="category-label ${categoryClass}">
          ${task.category || "No category"}
        </div>`;

      // Subtasks HTML
      const subtasksHTML = renderSubtasksHTML(taskId, task.subtasks || []);

      // Priority Image
      const priorityImage = priorityLabelHTML(task.priority);

      // Render Assigned Contacts
      const contactsHTML = renderTaskContacts(task.assignedTo || []);

      // Task HTML
      taskElement.innerHTML = `
        <div class="task-header">
          ${categoryHTML}
        </div>
        <h4 class="task-title">${task.title}</h4>
        <p class="task-description">${task.description}</p>
        <div class="task-subtasks">${subtasksHTML}</div>
        <footer class="task-footer d-flex justify-content-between align-items-center">
          <div class="assigned-contacts d-flex">
            ${contactsHTML} <!-- Dynamische Kontakte -->
          </div>
          <div class="task-priority">
            ${priorityImage}
          </div>
        </footer>
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


function renderTaskContacts(assignedTo = []) {
  if (!assignedTo || assignedTo.length === 0) return "";

  const maxContacts = 3; // Maximal 3 Kontakte anzeigen
  return assignedTo
    .slice(0, maxContacts) // Nimm die ersten 3 Kontakte
    .map((contactName) => {
      const shortName = contactName
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join(""); // Kürzel z. B. "Max Mustermann" -> "MM"

      return `
        <div class="contact-circle" style="background-color: #9327FF;">
          <span>${shortName}</span>
        </div>
      `;
    })
    .join(""); // HTML zusammenfügen
}


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


function getContainerIdByStatus(status) {
  const statusContainers = {
    "To do": "todo-container",
    "In progress": "progress-container",
    "Await feedback": "feedback-container",
    Done: "done-container",
  };
  return statusContainers[status] || null;
}


function getPriorityClass(priority) {
  const priorityClasses = {
    urgent: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };
  return priorityClasses[priority] || "";
}


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

  console.log(`Progress für Task ${taskId} aktualisiert: ${progressPercentage}%`);
}


function renderSubtasksHTML(taskId, subtasks) {
  let HTML = "";
  if (!subtasks || subtasks.length === 0) {
    return HTML;
  }

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


async function openModal(id) {
  let tasksAsArray = await getTasksAsArray();
  const singleTaskID = tasksAsArray.findIndex(x => x.id == id);
  const singleTask = tasksAsArray[singleTaskID];
  const keys = ['category', 'title', 'description', 'finishedUntil'];

  renderModal(singleTask, keys);
  renderDate(singleTask)

  document.getElementById('modalCard-category-value').classList.add(`bc-category-label-${singleTask.category.replace(/\s/g, '').toLowerCase()}`);
  renderPriority(singleTask.priority);
  renderSubtasks(singleTask.id, singleTask.subtasks)

  document.getElementById('modalCard-delete-button').onclick = function () { deleteTaskOfModalCard(id) };
  document.getElementById('modal-card-edit-button').onclick =  function () { changeToEditMode(id) };
  document.getElementById('modal-card-edit-button').onclick =  function () { changeToEditMode(id), putNextStatus(singleTask.status) };

  toggleDisplayModal();
}


function renderModal(singleTask, allKeys) {
  for (let i = 0; i < allKeys.length; i++) {
      const element = document.getElementById(`modalCard-${allKeys[i]}-value`);
      element.innerHTML = singleTask[allKeys[i]];
  }
}


function renderDate(singleTask) {
  let date = singleTask['finishedUntil'];
  document.getElementById((`modalCard-finishedUntil-value`)).innerHTML = formatDate(date);
}


function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}


function renderPriority(priority) {
  let priorityLabel = document.getElementById('modalCard-priority-value');
  priorityLabel.innerHTML = priorityLabelHTML(priority)
}


function priorityLabelHTML(priority) {
  let HTML = `
  <span>${capitalizeFirstLetter(priority)}<span>
  <img src="assets/img/general/prio-${priority}.png" alt="">
  `;
  return HTML
}

function renderSubtasks(taskId, subtasks) {
  let modalSubtasksValue = document.getElementById('modalCard-subtasks-value');
  modalSubtasksValue.innerHTML = renderSubtasksHTML(taskId, subtasks)
}


// function renderSubtasksInModal(taskId, subtasks) {
//  const subtasksContainer = document.getElementById("modalCard-subtasks-value");


function renderSubtasksHTML(taskId, subtasks) {
  let HTML = '';
  if (!subtasks || subtasks.length === 0) {
      return HTML;
  }

  for (let i = 0; i < subtasks.length; i++) {
      const singleSubtask = subtasks[i];
      HTML += `
          <div class="d-flex align-items-center">
              <label class="custom-checkbox d-flex align-items-center" onclick="changeCheckbox('${taskId}', ${i})">
                  <input id="checkbox-subtask${i}" type="checkbox" ${singleSubtask.isChecked ? 'checked' : ''}>
                  <span class="checkbox-image"></span>
              </label>
              <p>${singleSubtask.subtask}</p>
          </div>
      `;
  }

  return HTML;
}


async function deleteTaskOfModalCard(id){
  deleteTaskInDatabase(id);
  toggleDisplayModal()
}


function toggleDisplayModal() {
  toggleDisplayNone(document.getElementById('board'));
  toggleDisplayNone(document.getElementById('modalCard'), 'd-flex');
}


async function deleteTaskOfModalCard(id) {
  await deleteTaskInDatabase(id),
  toggleDisplayModal();
  await boardRender()
}


function readAllKeys(object, without = '') {
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


function changeCheckbox(taskId, id) {
  const checkbox = document.getElementById(`checkbox-subtask${id}`);
  checkbox.checked = !checkbox.checked;
  console.log('Checked state:', checkbox.checked);

  putNewCheckedToSubtask(taskId, id, checkbox.checked);
}