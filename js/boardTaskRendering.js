/**
 * Fetches tasks and contacts data from Firebase.
 * 
 * @async
 * @function fetchTasksAndContacts
 * @returns {Object} Object containing tasks and contacts data
 */
async function fetchTasksAndContacts() {
  const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app";
  
  const [tasksResponse, contactsResponse] = await Promise.all([
    fetch(`${firebaseUrl}/tasks.json`),
    fetch(`${firebaseUrl}/users/contacts.json`),
  ]);
  
  if (!tasksResponse.ok || !contactsResponse.ok) {
    throw new Error("Error fetching data");
  }
  
  const tasksData = await tasksResponse.json();
  const contactsData = await contactsResponse.json();
  
  return { tasksData, contactsData };
}

/**
 * Clears all task containers.
 * 
 * @function clearTaskContainers
 */
function clearTaskContainers() {
  [
    "todo-container",
    "progress-container",
    "feedback-container",
    "done-container",
  ].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });
}

/**
 * Creates HTML for the category label.
 * 
 * @function createCategoryHTML
 * @param {Object} task - The task object
 * @returns {string} HTML string for the category
 */
function createCategoryHTML(task) {
  const categoryClass = task.category
    ? `bc-category-label-${task.category.replace(/\s+/g, "").toLowerCase()}`
    : "bc-category-label-unknown";
    
  return `
    <div class="category-label ${categoryClass}">
      ${task.category || "No category"}
    </div>`;
}

/**
 * Creates HTML for the progress bar.
 * 
 * @function createProgressHTML
 * @param {Object} task - The task object
 * @returns {string} HTML string for the progress bar
 */
function createProgressHTML(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";
  
  const completedSubtasks = task.subtasks.filter(subtask => subtask.isChecked).length;
  const totalSubtasks = task.subtasks.length;
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
 * Creates a task element.
 * 
 * @function createTaskElement
 * @param {string} taskId - The ID of the task
 * @param {Object} task - The task object
 * @param {Object} contactsData - The contacts data
 * @returns {HTMLElement} The created task element
 */
function createTaskElement(taskId, task, contactsData) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.id = taskId;
  taskElement.setAttribute("draggable", "true");
  taskElement.setAttribute("onclick", `openModal('${taskId}')`);
  
  const categoryHTML = createCategoryHTML(task);
  const progressHTML = createProgressHTML(task);
  const priorityImage = priorityLabelHTML(task.priority);
  const contactsHTML = renderAssignedContacts(task.assignedTo, contactsData);
  
  taskElement.innerHTML = createTaskHTML(task, categoryHTML, progressHTML, contactsHTML, priorityImage);
  
  return taskElement;
}

/**
 * Creates the inner HTML for a task element.
 * 
 * @function createTaskHTML
 * @param {Object} task - The task object
 * @param {string} categoryHTML - HTML for the category
 * @param {string} progressHTML - HTML for the progress bar
 * @param {string} contactsHTML - HTML for the assigned contacts
 * @param {string} priorityImage - HTML for the priority image
 * @returns {string} The inner HTML for the task element
 */
function createTaskHTML(task, categoryHTML, progressHTML, contactsHTML, priorityImage) {
  return `
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
}

/**
 * Adds task elements to their respective containers.
 * 
 * @function addTasksToContainers
 * @param {Object} tasksData - The tasks data
 * @param {Object} contactsData - The contacts data
 */
function addTasksToContainers(tasksData, contactsData) {
  Object.entries(tasksData).forEach(([taskId, task]) => {
    const containerId = getContainerIdByStatus(task.status);
    if (!containerId) return;
    
    const taskElement = createTaskElement(taskId, task, contactsData);
    document.getElementById(containerId).appendChild(taskElement);
  });
}

/**
 * Main function to load tasks from Firebase and display them.
 * 
 * @async
 * @function loadTasks
 */
async function loadTasks() {
  try {
    const { tasksData, contactsData } = await fetchTasksAndContacts();
    
    if (!tasksData) return;
    
    clearTaskContainers();
    addTasksToContainers(tasksData, contactsData);
    initializeDragAndDrop();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}


  /**
 * Fetches contact data from the Firebase database.
 * 
 * Retrieves the list of contacts stored in the Firebase database.
 * Throws an error if the request fails.
 * 
 * @async
 * @function fetchContactsData
 * @returns {Promise<Object>} - A promise that resolves to the contacts data.
 * @throws {Error} - Throws an error if fetching contacts data fails.
 */
async function fetchContactsData() {
    const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app";
    const response = await fetch(`${firebaseUrl}/users/contacts.json`);
  
    if (!response.ok) {
      throw new Error("Error fetching contacts data");
    }
  
    return await response.json();
  }


  /**
 * Returns the corresponding container ID for a given task status.
 * 
 * If the status is not recognized, `null` is returned.
 * 
 * @function getContainerIdByStatus
 * @param {string} status - The status of the task ("To do", "In progress", "Await feedback", "Done").
 * @returns {string|null} - The corresponding container ID or `null` if the status is not found.
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
 * Renders assigned contact initials inside colored circles.
 * 
 * Displays up to three assigned contacts. If no contacts are assigned, empty placeholders are shown.
 * Contacts are represented by the first initials of their names in colored circles.
 * 
 * @function renderAssignedContacts
 * @param {string[]} assignedTo - Array of assigned contact names.
 * @param {Object} contacts - Object containing contact details including names and colors.
 * @returns {string} - HTML string representing the assigned contacts section.
 */
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


  /**
 * Renders tasks filtered by their status and assigns them to the appropriate container.
 * @function renderFilteredTasks
 * @param {Object} contactsData - The contact data to be used for rendering assigned users.
 */
function renderFilteredTasks(contactsData) {
    Object.entries(currentTasks).forEach(([taskId, task]) => {
      const containerId = getContainerIdByStatus(task.status);
      if (!containerId) return;
  
      const taskElement = createTaskElement(taskId, task, contactsData);
      document.getElementById(containerId).appendChild(taskElement);
    });
  }


  /**
 * Creates a task element with all its properties, including category, description, subtasks, contacts, and priority.
 * @function createTaskElement
 * @param {string} taskId - The unique identifier of the task.
 * @param {Object} task - The task data including title, description, category, etc.
 * @param {Object} contactsData - The contact data used for assigned contacts.
 * @returns {HTMLElement} The created task element.
 */
  function createTaskElement(taskId, task, contactsData) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.id = taskId;
    taskElement.setAttribute("draggable", "true");
    taskElement.setAttribute("onclick", `openModal('${taskId}')`);

    const categoryHTML = createCategoryHTML(task.category);
    const subtasksHTML = renderSubtasksHTML(taskId, task.subtasks || []);
    const priorityImage = priorityLabelHTML(task.priority);
    const contactsHTML = renderTaskContacts(task.assignedTo || [], contactsData);

    taskElement.innerHTML = getTaskElementHTML(taskId, task, categoryHTML, subtasksHTML, priorityImage, contactsHTML);

    return taskElement;
}



  /**
 * Creates an HTML string for the category label of a task.
 * @function createCategoryHTML
 * @param {string} category - The category of the task.
 * @returns {string} The generated category HTML string.
 */
function createCategoryHTML(category) {
    const categoryClass = category
      ? `bc-category-label-${category.replace(/\s+/g, "").toLowerCase()}`
      : "bc-category-label-unknown";
    return `
      <div class="category-label ${categoryClass}">
        ${category || "No category"}
      </div>`;
  }


  /**
 * Generates an HTML string for a priority label icon.
 * 
 * The function returns an image element with a corresponding priority-based source.
 * The `priority` parameter is directly inserted into the image file path and the alt attribute.
 * 
 * @function priorityLabelHTML
 * @param {string} priority - The priority level (e.g., "urgent", "medium", "low").
 * @returns {string} - An HTML string representing the priority icon.
 */
function priorityLabelHTML(priority) {
    return `<img src="assets/img/general/prio-${priority}.svg" alt="${priority}">`;
  }