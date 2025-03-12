/**
 * Adjusts the height of each board section to be one task longer than the number of tasks,
 * except on screens below 1373px, where the original behavior is applied.
 */
function adjustBoardSectionHeight() {
  const sections = document.querySelectorAll(".board-section");
  const isLargeScreen = window.innerWidth >= 1373;

  sections.forEach((section) => {
    const tasks = section.querySelectorAll(".task").length;
    const tasksContainer = section.querySelector(".tasks-container");
    if (isLargeScreen) {
      const taskHeight = 260;
      const minHeight = (tasks + 1) * taskHeight;
      tasksContainer.style.minHeight = `${minHeight}px`;
    } else {
      tasksContainer.style.minHeight = "";
    }
  });
}

/**
 * Displays the "Move To" dropdown menu for a task and closes other open menus.
 *
 * @param {Event} event - The event object triggered by the user interaction.
 */
function toggleTaskDropdown(event) {
  event.stopPropagation();

  const taskCard = event.target.closest(".task");
  const dropdownMenu = taskCard.querySelector(".d-menu");
  const dropdownCloseIcon = taskCard.querySelector("img[alt='dropdownClose']");
  const dropdownOpenIcon = taskCard.querySelector("img[alt='dropdownOpen']");

  if (!dropdownMenu) return;

  document.querySelectorAll(".d-menu").forEach((menu) => {
    if (menu !== dropdownMenu) {
      menu.classList.add("dm-hidden");
      const parentTask = menu.closest(".task");
      if (parentTask) {
        parentTask.querySelector("img[alt='dropdownClose']").style.display = "block";
        parentTask.querySelector("img[alt='dropdownOpen']").style.display = "none";
      }
    }
  });

  const isHidden = dropdownMenu.classList.toggle("dm-hidden");
  
  dropdownCloseIcon.style.display = isHidden ? "block" : "none";
  dropdownOpenIcon.style.display = isHidden ? "none" : "block";

  dropdownMenu.addEventListener("click", (e) => e.stopPropagation());
}


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
