let draggedTask = null;
let placeholder = null;


/**
 * Initializes the drag and drop functionality by attaching event listeners and sorting tasks.
 * @function initializeDragAndDrop
 */
function initializeDragAndDrop() {
  attachDragEvents();
  document.querySelectorAll(".tasks-container").forEach(sortTasksByPriority);
}


/**
 * Attaches drag event listeners to the board.
 * @function attachDragEvents
 */
function attachDragEvents() {
  const board = document.getElementById("board");
  board.addEventListener("dragstart", handleDragStart);
  board.addEventListener("dragend", handleDragEnd);
  board.addEventListener("dragover", handleDragOver);
  board.addEventListener("drop", handleDrop);
}


/**
 * Handles the drag start event by adding visual effects and creating a placeholder.
 * @function handleDragStart
 * @param {DragEvent} e - The drag event.
 */
function handleDragStart(e) {
  draggedTask = e.target.closest(".task");
  if (!draggedTask) return;
  draggedTask.style.transform = "rotate(3deg) scale(1.05)";
  draggedTask.classList.add("dragging");
  placeholder = createPlaceholder(draggedTask);
}


/**
 * Handles the drag end event by removing visual effects and placeholders.
 * @function handleDragEnd
 */
function handleDragEnd() {
  if (draggedTask) {
    draggedTask.style.transform = "";
    draggedTask.classList.remove("dragging");
  }
  if (placeholder) placeholder.remove();
  draggedTask = null;
  placeholder = null;
}


/**
 * Handles the drag over event by determining the position of the dragged task within the container.
 * @function handleDragOver
 * @param {DragEvent} e - The drag event.
 */

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const container = e.target.closest(".tasks-container");
  if (!container) return;
  positionTaskInContainer(container, e.clientY);
}


/**
 * Handles the drop event by updating the task's status and sorting tasks.
 * @function handleDrop
 * @param {DragEvent} e - The drop event.
 */
function handleDrop(e) {
  e.preventDefault();
  if (!draggedTask) return;
  const container = e.target.closest(".tasks-container");
  if (!container) return;
  updateTaskStatusAndSort(container);
}


/**
 * Updates the task status and sorts tasks within the container after a drop.
 * @function updateTaskStatusAndSort
 * @param {HTMLElement} container - The container where the task was dropped.
 */
function updateTaskStatusAndSort(container) {
  const newStatus = getStatusFromContainerId(container.id);
  const taskId = draggedTask.id;
  container.replaceChild(draggedTask, placeholder);
  placeholder.remove();
  placeholder = null;
  updateTaskStatus(taskId, newStatus);
  sortTasksByPriority(container);
}


/**
 * Determines the position of a dragged task in the container.
 * @function positionTaskInContainer
 * @param {HTMLElement} container - The container where the task is being dragged.
 * @param {number} y - The vertical position of the mouse.
 */
function positionTaskInContainer(container, y) {
  const afterElement = getDragAfterElement(container, y);
  if (!placeholder) return;
  container.querySelectorAll(".placeholder").forEach(el => el.remove());
  afterElement == null ? container.appendChild(placeholder) : container.insertBefore(placeholder, afterElement);
}


/**
 * Creates a placeholder element to represent the dragged task's position.
 * @function createPlaceholder
 * @param {HTMLElement} task - The task element being dragged.
 * @returns {HTMLElement} The created placeholder element.
 */
function createPlaceholder(task) {
  const placeholder = document.createElement("div");
  placeholder.classList.add("placeholder");
  placeholder.style.width = `${task.offsetWidth}px`;
  placeholder.style.height = `${task.offsetHeight}px`;
  placeholder.style.border = "2px dashed gray";
  return placeholder;
}


/**
 * Finds the closest task element after the given position to determine drop placement.
 * @function getDragAfterElement
 * @param {HTMLElement} container - The container where the task is being dragged.
 * @param {number} y - The vertical position of the mouse.
 * @returns {HTMLElement|null} The closest task element or null.
 */
function getDragAfterElement(container, y) {
  return [...container.querySelectorAll(".task:not(.dragging)")].reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset: offset, element: child } : closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}


/**
 * Sorts tasks in a container based on their priority.
 * @function sortTasksByPriority
 * @param {HTMLElement} container - The container whose tasks need sorting.
 */
function sortTasksByPriority(container) {
  const tasks = [...container.querySelectorAll(".task")];
  const priorityOrder = { urgent: 3, medium: 2, low: 1 };
  tasks.sort((a, b) => {
    const priorityA = priorityOrder[a.querySelector(".task-priority img").alt] || 0;
    const priorityB = priorityOrder[b.querySelector(".task-priority img").alt] || 0;
    return priorityB - priorityA;
  });
  tasks.forEach(task => container.appendChild(task));
}


/**
 * Retrieves the status corresponding to a container ID.
 * @function getStatusFromContainerId
 * @param {string} containerId - The ID of the container.
 * @returns {string|null} The corresponding status or null.
 */
function getStatusFromContainerId(containerId) {
  return {
    "todo-container": "To do",
    "progress-container": "In progress",
    "feedback-container": "Await feedback",
    "done-container": "Done",
  }[containerId] || null;
}


/**
 * Initializes the drag and drop functionality when the document is fully loaded.
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", initializeDragAndDrop);


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