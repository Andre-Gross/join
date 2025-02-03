async function boardRender() {
  const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app";

  try {
    const [tasksResponse, contactsResponse] = await Promise.all([
      fetch(`${firebaseUrl}/tasks.json`),
      fetch(`${firebaseUrl}/users/contacts.json`),
    ]);

    if (!tasksResponse.ok || !contactsResponse.ok) {
      throw new Error("Error fetching data");
    }

    const tasksData = await tasksResponse.json();
    const contactsData = await contactsResponse.json();

    if (!tasksData || Object.keys(tasksData).length === 0) {
      console.log("No tasks found.");
      return;
    }

    ["todo-container", "progress-container", "feedback-container", "done-container"].forEach(
      (containerId) => {
        document.getElementById(containerId).innerHTML = "";
      }
    );

    Object.entries(tasksData).forEach(([taskId, task]) => {
      const containerId = getContainerIdByStatus(task.status);
      if (!containerId) return;

      const taskElement = document.createElement("div");
      taskElement.classList.add("task");
      taskElement.id = taskId;
      taskElement.setAttribute("draggable", "true");
      taskElement.setAttribute("onclick", `openModal('${taskId}')`);

      const categoryClass = task.category
        ? `bc-category-label-${task.category.replace(/\s+/g, "").toLowerCase()}`
        : "bc-category-label-unknown";
      const categoryHTML = `
        <div class="category-label ${categoryClass}">
          ${task.category || "No category"}
        </div>`;

      const subtasksHTML = renderSubtasksHTML(taskId, task.subtasks || []);

      const priorityImage = priorityLabelHTML(task.priority);

      const contactsHTML = renderTaskContacts(task.assignedTo || [], contactsData);

      taskElement.innerHTML = `
        <div class="task-header">
          ${categoryHTML}
        </div>
        <h4 class="task-title">${task.title}</h4>
        <p class="task-description">${task.description}</p>
        <div class="task-subtasks">${subtasksHTML}</div>
        <footer class="task-footer d-flex justify-content-between align-items-center">
          <div class="assigned-contacts d-flex">
            ${contactsHTML}
          </div>
          <div class="task-priority">
            ${priorityImage}
          </div>
        </footer>
      `;

      document.getElementById(containerId).appendChild(taskElement);
    });

    initializeDragAndDrop();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}


function isValidArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}


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


function renderTaskContacts(assignedTo = [], contactsData = {}) {
  if (!isValidArray(assignedTo)) return "";


  return assignedTo
    .map((contactIdOrName) => {
      let contact = contactsData[contactIdOrName];

      if (!contact) {
        contact = Object.values(contactsData).find((c) => c.name === contactIdOrName);
      }

      if (!contact) {
        return `<div class="contact-circle" style="background-color: #ccc;"></div>`;
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


function getContainerIdByStatus(status) {
  const statusContainers = {
    "To do": "todo-container",
    "In progress": "progress-container",
    "Await feedback": "feedback-container",
    "Done": "done-container",
  };
  return statusContainers[status] || null;
}


function priorityLabelHTML(priority) {
  return `<img src="assets/img/general/prio-${priority}.svg" alt="${priority}">`;
}


document.addEventListener("DOMContentLoaded", async () => {
  await boardRender();
});

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

initializeDragAndDrop();
initializeTouchDrag();



function createPlaceholder(task) {
  const placeholder = document.createElement("div");
  placeholder.classList.add("placeholder");
  placeholder.style.width = `${task.offsetWidth}px`;
  placeholder.style.height = `${task.offsetHeight}px`;
  task.parentNode.insertBefore(placeholder, task.nextSibling);
  return placeholder;
}


function endDrag(draggedTask, placeholder) {
  if (draggedTask) {
    draggedTask.classList.remove("dragging");
    draggedTask.style.display = "block";
  }

  if (placeholder) {
    placeholder.remove();
  }
}


function resetAnimation(task) {
  task.style.animation = "none"
  task.offsetHeight
  task.style.animation = null
}


function handleDragOver(container, y, placeholder) {
  const afterElement = getDragAfterElement(container, y);
  if (!placeholder) return;

  if (afterElement == null) {
    container.appendChild(placeholder);
  } else {
    container.insertBefore(placeholder, afterElement);
  }
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
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
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

async function deleteTaskInDatabase(taskId) {
  const firebaseUrl = `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;

  try {
    await fetch(firebaseUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
  }
}


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
  priorityLabel.innerHTML = /*HTML*/`
    <div id="priority-label" class="d-flex">
      <p>${upperCaseFirstLetter(priority)}</p>
      ${priorityLabelHTML(priority)}
    </div>`;
}


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
