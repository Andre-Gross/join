let draggedTask = null;
let placeholder = null;

function initializeDragAndDrop() {
  attachDragEvents();
  document.querySelectorAll(".tasks-container").forEach(sortTasksByPriority);
}

function attachDragEvents() {
  const board = document.getElementById("board");
  board.addEventListener("dragstart", handleDragStart);
  board.addEventListener("dragend", handleDragEnd);
  board.addEventListener("dragover", handleDragOver);
  board.addEventListener("drop", handleDrop);
}

function handleDragStart(e) {
  draggedTask = e.target.closest(".task");
  if (!draggedTask) return;
  draggedTask.style.transform = "rotate(3deg) scale(1.05)";
  draggedTask.classList.add("dragging");
  placeholder = createPlaceholder(draggedTask);
}

function handleDragEnd() {
  if (draggedTask) {
    draggedTask.style.transform = "";
    draggedTask.classList.remove("dragging");
  }
  if (placeholder) placeholder.remove();
  draggedTask = null;
  placeholder = null;
}

function handleDragOver(e) {
  e.preventDefault();
  const container = e.target.closest(".tasks-container");
  if (!container) return;
  positionTaskInContainer(container, e.clientY);
}

function handleDrop(e) {
  e.preventDefault();
  if (!draggedTask) return;
  const container = e.target.closest(".tasks-container");
  if (!container) return;
  updateTaskStatusAndSort(container);
}

function updateTaskStatusAndSort(container) {
  const newStatus = getStatusFromContainerId(container.id);
  const taskId = draggedTask.id;
  container.replaceChild(draggedTask, placeholder);
  placeholder.remove();
  placeholder = null;
  updateTaskStatus(taskId, newStatus);
  sortTasksByPriority(container);
}

function positionTaskInContainer(container, y) {
  const afterElement = getDragAfterElement(container, y);
  if (!placeholder) return;
  container.querySelectorAll(".placeholder").forEach(el => el.remove());
  afterElement == null ? container.appendChild(placeholder) : container.insertBefore(placeholder, afterElement);
}

function createPlaceholder(task) {
  const placeholder = document.createElement("div");
  placeholder.classList.add("placeholder");
  placeholder.style.width = `${task.offsetWidth}px`;
  placeholder.style.height = `${task.offsetHeight}px`;
  placeholder.style.border = "2px dashed gray";
  return placeholder;
}

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

function getStatusFromContainerId(containerId) {
  return {
    "todo-container": "To do",
    "progress-container": "In progress",
    "feedback-container": "Await feedback",
    "done-container": "Done",
  }[containerId] || null;
}

document.addEventListener("DOMContentLoaded", initializeDragAndDrop);
