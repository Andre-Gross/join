let currentTasks = [];
let toastMessageNoResult = '<span>no result</span>';

/**
 * Scrolls smoothly to a specific task status container based on the URL parameter.
 *
 * @event DOMContentLoaded
 * @listens document#DOMContentLoaded
 * @description Checks the URL for a "status" parameter and scrolls to the corresponding task container.
 * @throws {Error} Does not throw errors but silently fails if the element is not found.
 */
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



