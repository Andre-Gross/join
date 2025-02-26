let currentTasks = [];
let toastMessageNoResult = '<span>no result</span>';

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status) {
    const containerMapping = {
      todo: "todo-container",
      inprogress: "progress-container",
      feedback: "feedback-container",
      done: "done-container",
    };

    const targetContainerId = containerMapping[status];
    if (targetContainerId) {
      const targetElement = document.getElementById(targetContainerId);
      if (targetElement) {
        setTimeout(() => {
          window.scrollTo({
            top: targetElement.offsetTop - 200,
            behavior: "smooth", 
          });
        }, 200);
      }
    }
  }
});


/**
 * Filters and displays tasks based on the user's search input.
 * 
 * If the input length is at least 3 characters, it filters tasks by title and description.
 * If no matches are found, a toast message is displayed and the board is cleared.
 * If the input is empty, the board is re-rendered.
 * 
 * @async
 * @function filterAndShowTask
 */
async function filterAndShowTask() {
  let filterWord = document.getElementById("idSearch").value;

  if (filterWord.length >= 3) {
    let tasksAsArray = await getTasksAsArray();
    let filterWordLow = filterWord.toLowerCase();

    let currentTitles = tasksAsArray.filter((task) =>
      task.title.toLowerCase().includes(filterWordLow)
    );
    let currentDescriptions = tasksAsArray.filter((task) =>
      task.description.toLowerCase().includes(filterWordLow)
    );

    let descriptionIds = new Set(currentDescriptions.map((task) => task.id));
    currentTitles = currentTitles.filter((task) => !descriptionIds.has(task.id));

    currentTasks = {};
    for (let task of currentTitles) {
      currentTasks[task.id] = task;
    }
    for (let task of currentDescriptions) {
      currentTasks[task.id] = task;
    }

    if (Object.keys(currentTasks).length === 0) {
      showToast(toastMessageNoResult, "middle", 1000);
      clearTasksFromBoard();
    } else {
      await renderBodySearch();
    }
  } else if (filterWord.length === 0) {
    boardRender();
  }
}



/**
 * Clears all tasks from the board by emptying the content of each task container.
 * 
 * The function targets the containers for "To Do", "In Progress", "Feedback", and "Done" tasks.
 * 
 * @function clearTasksFromBoard
 */
function clearTasksFromBoard() {
  ["todo-container", "progress-container", "feedback-container", "done-container"].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });
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
 * Loads tasks and contacts from the Firebase database and renders them into the appropriate board sections.
 * 
 * Fetches tasks and contacts asynchronously, clears existing task containers, 
 * and dynamically creates and appends task elements with category labels, progress bars, 
 * assigned contacts, and priority indicators.
 * 
 * @async
 * @function loadTasks
 * @throws {Error} Throws an error if fetching tasks or contacts fails.
 */
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
      const contactsHTML = renderAssignedContacts(task.assignedTo, contactsData);

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


/**
 * Returns the corresponding CSS class for a given priority level.
 * 
 * If the priority level is not found, an empty string is returned.
 * 
 * @function getPriorityClass
 * @param {string} priority - The priority level ("urgent", "medium", "low").
 * @returns {string} - The corresponding CSS class name or an empty string if the priority is not recognized.
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
 * Truncates a description to a specified maximum length and appends an ellipsis if it exceeds the limit.
 * 
 * If the description is null or undefined, an empty string is returned.
 * 
 * @function truncateDescription
 * @param {string} description - The text to be truncated.
 * @param {number} [maxLength=50] - The maximum allowed length before truncation.
 * @returns {string} - The truncated description with an ellipsis if it exceeds the limit.
 */
function truncateDescription(description, maxLength = 50) {
  if (!description) return "";
  return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
}



/**
 * Renders the body search by clearing task containers, fetching contact data, and rendering filtered tasks.
 * @async
 * @function renderBodySearch
 * @returns {Promise<void>} 
 */
async function renderBodySearch() {
  clearTaskContainers();
  const contactsData = await fetchContactsData();
  renderFilteredTasks(contactsData);
}

/**
 * Clears all task containers to prepare for rendering new tasks.
 * @function clearTaskContainers
 */
function clearTaskContainers() {
  ["todo-container", "progress-container", "feedback-container", "done-container"].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });
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

  taskElement.innerHTML = `
    <div class="task-header">
      ${categoryHTML}
      <div class="dropdown-button-task d-none" onclick="toggleTaskDropdown(event)">
            <img src="./assets/img/board/dropdown_close.svg" alt="dropdown">
            <div id="dropdownMenuTask" class="d-menu dm-hidden">
            <p onclick="moveTaskToCategory(event, '${taskId}', 'To do')">To Do</p>
            <p onclick="moveTaskToCategory(event, '${taskId}', 'In progress')">In Progress</p>
            <p onclick="moveTaskToCategory(event, '${taskId}', 'Await feedback')">Await Feedback</p>
            <p onclick="moveTaskToCategory(event, '${taskId}', 'Done')">Done</p>
                </div>
          </div>
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


/**
 * Initializes the board once the DOM content is fully loaded.
 * 
 * Calls `loadTasks` to fetch and render tasks from the database.
 * Calls `scrollToTaskSection` to automatically scroll to a specific task section if applicable.
 * 
 * @event DOMContentLoaded
 * @async
 * @listens document#DOMContentLoaded
 */
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


/**
 * Adjusts the height of each board section to be one task longer than the number of tasks,
 * except on screens below 1373px, where the original behavior is applied.
 */
function adjustBoardSectionHeight() {
  const sections = document.querySelectorAll('.board-section');
  const isLargeScreen = window.innerWidth >= 1373;

  sections.forEach(section => {
      const tasks = section.querySelectorAll('.task').length;
      const tasksContainer = section.querySelector('.tasks-container');
      if (isLargeScreen) {
          const taskHeight = 260;
          const minHeight = (tasks + 1) * taskHeight;
          tasksContainer.style.minHeight = `${minHeight}px`;
      } else {
          tasksContainer.style.minHeight = '';
      }
  });
}


/**
* Initializes the height adjustment and observes changes in the DOM and window resizing.
*/
document.addEventListener("DOMContentLoaded", () => {
  adjustBoardSectionHeight();
  window.addEventListener("resize", adjustBoardSectionHeight);
  const observer = new MutationObserver(adjustBoardSectionHeight);
  observer.observe(document.querySelector('.container-fluid'), {
      childList: true,
      subtree: true,
  });
});


/**
 * Displays the "Move To" dropdown menu for a task and closes other open menus.
 *
 * @param {Event} event - The event object triggered by the user interaction.
 */
function toggleTaskDropdown(event) {
  event.stopPropagation();

  const taskCard = event.target.closest(".task");
  const dropdownMenu = taskCard.querySelector(".d-menu");

  if (!dropdownMenu) return;

  document.querySelectorAll(".d-menu").forEach(menu => {
      if (menu !== dropdownMenu) {
          menu.classList.add("dm-hidden");
      }
  });

  dropdownMenu.classList.toggle("dm-hidden");
  dropdownMenu.addEventListener("click", (e) => e.stopPropagation());
}

/**
* Closes all dropdown menus when clicking outside.
*/
document.addEventListener("click", () => {
  document.querySelectorAll(".d-menu").forEach(menu => {
      menu.classList.add("dm-hidden");
  });
});

/**
* Ensures that `openModal()` is not called when the dropdown button is clicked.
*/
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".task").forEach(taskElement => {
      taskElement.addEventListener("click", (event) => {
          if (!event.target.closest('.dropdown-button-task')) {
              openModal(taskElement.id);
          }
      });
  });
});


/**
 * Moves a task to a new category and updates its status.
 * 
 * @param {Event} event - The triggered event.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new category/status.
 */
function moveTaskToCategory(event, taskId, newStatus) {
  event.stopPropagation();
  const taskCard = document.getElementById(taskId);
  if (!taskCard) return;
  
  const newContainer = document.getElementById(getContainerIdByStatus(newStatus));
  if (!newContainer) return;
  
  newContainer.appendChild(taskCard);
  updateTaskStatus(taskId, newStatus);
  sortTasksByPriority(newContainer);
}
