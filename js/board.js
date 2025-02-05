let currentTasks = [];
let toastMessageNoResult = '<span>Keine Ergebnisse gefunden</span>';


async function filterAndShowTask() {
  let filterWord = document.getElementById("idSearch").value;

  if (filterWord.length >= 3) {
    let tasksAsArray = await getTasksAsArray();
    let filterWordLow = filterWord.toLowerCase();
    let currentTitles = tasksAsArray.filter((title) =>
      title.title.toLowerCase().includes(filterWordLow)
    );
    let currentDescriptions = tasksAsArray.filter((description) =>
      description.description.toLowerCase().includes(filterWordLow)
    );
    let descriptionIds = new Set(currentDescriptions.map((task) => task.id));
    currentTitles = currentTitles.filter(
      (task) => !descriptionIds.has(task.id)
    );

    for (let task of currentTitles) {
      if (!currentTasks[task.id]) {
        currentTasks[task.id] = task;
      }
    }

    for (let task of currentDescriptions) {
      if (!currentTasks[task.id]) {
        currentTasks[task.id] = task;
      }
    }
    if (currentTitles.length === 0 && currentDescriptions.length === 0) {
      showToast(toastMessageNoResult, 'middle', 1000);
      setTimeout(1000);
    }

    await renderBodySearch();
  } else if (filterWord.length === 0) {
    location.reload();
  }
}

function renderAssignedContacts(assignedTo, contacts) {
  const contactEntries = Object.values(contacts);

  const limitedContacts =
    assignedTo && assignedTo.length > 0 ? assignedTo.slice(0, 3) : ["", "", ""];

  return `
    <div class="assigned-contacts">
      ${limitedContacts
      .map((name) => {
        if (!name) {
          return `
              <div class="contact-circle" style="background-color: transparent; ">
              </div>
            `;
        }

        const contact = contactEntries.find((c) => c.name === name);

        const color = contact ? contact.color : "#ccc";

        const nameParts = (contact ? contact.name : name).split(" ");
        const shortName =
          nameParts.length > 1
            ? `${nameParts[0][0].toUpperCase()}${nameParts[1][0].toUpperCase()}`
            : nameParts[0][0].toUpperCase();

        return `
            <div class="contact-circle" style="background-color: ${color}">
              ${shortName}
            </div>
          `;
      })
      .join("")}
    </div>
  `;
}

async function loadTasks() {
  const firebaseUrl =
    "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app";

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

    if (!tasksData) {
      return;
    }

    [
      "todo-container",
      "progress-container",
      "feedback-container",
      "done-container",
    ].forEach((containerId) => {
      document.getElementById(containerId).innerHTML = "";
    });

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

      let progressHTML = "";
      if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(
          (subtask) => subtask.isChecked
        ).length;
        const totalSubtasks = task.subtasks.length;
        const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

        progressHTML = `
          <div class="subtasks-progress-container d-flex align-items-center">
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
            </div>
            <div class="subtasks-count">${completedSubtasks}/${totalSubtasks} Subtasks</div>
          </div>
        `;
      }

      const priorityImage = priorityLabelHTML(task.priority);

      const contactsHTML = renderAssignedContacts(
        task.assignedTo,
        contactsData
      );

      taskElement.innerHTML = `
        <div class="task-header">
          ${categoryHTML}
        </div>
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        ${progressHTML}
        <div class="task-footer">
          ${contactsHTML}
          <div class="task-priority">${priorityImage}</div>
        </div>
      `;

      document.getElementById(containerId).appendChild(taskElement);
    });

    initializeDragAndDrop();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

function getPriorityClass(priority) {
  const priorityClasses = {
    urgent: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };
  return priorityClasses[priority] || "";
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

async function fetchContactsData() {
  const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app";
  const response = await fetch(`${firebaseUrl}/users/contacts.json`);

  if (!response.ok) {
    throw new Error("Error fetching contacts data");
  }

  return await response.json();
}

function truncateDescription(description, maxLength = 50) {
  if (!description) return "";
  return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
}

async function renderBodySearch() {
  ["todo-container", "progress-container", "feedback-container", "done-container"].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });

  const contactsData = await fetchContactsData();

  Object.entries(currentTasks).forEach(([taskId, task]) => {
    const containerId = getContainerIdByStatus(task.status);
    if (!containerId) return;

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


  const subtasksHTML = renderSubtasksHTML(taskId, task.subtasks || []);

  const priorityImage = priorityLabelHTML(task.priority);
  const contactsHTML = renderTaskContacts(task.assignedTo || [], contactsData);

   taskElement.innerHTML = `

    <div class="task-header">
      ${categoryHTML}
    </div>
    <h4 class="task-title">${task.title}</h4>
    <p class="task-description">${truncateDescription(task.description)}</p>
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
    },500)
  } else {
    modalCardEditModeContainer.innerHTML = '';
    toggleEditMode(false);
    toggleDisplayModal(false);
  }
  putNextStatus()
}


function toggleEditMode(shallVisible = '') {
  toggleDisplayNone(document.getElementById("modalCard-no-edit-mode"), 'd-block', !shallVisible);
  toggleDisplayNone(document.getElementById("modalCard-edit-mode"), 'd-block', shallVisible);
  toggleDisplayNone(document.getElementById("modalCard-category-value"), 'd-block', !shallVisible);
}


document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks();
  scrollToTaskSection();
});

/**
 * Scrolls to the task section based on the "status" parameter in the URL.
 */
function scrollToTaskSection() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (!status) return;

  const containerMapping = {
    todo: "todo-container",
    inprogress: "progress-container",
    feedback: "feedback-container",
    done: "done-container",
    urgent: "todo-container",
  };

  const targetContainerId = containerMapping[status];
  if (targetContainerId) {
    const targetElement = document.getElementById(targetContainerId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      console.log(`Scrolled to section: ${status}`);
    }
  }
}