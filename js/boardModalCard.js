/**
 * Opens the "Add Task" modal, renders the task form, and initializes form functionality.
 */
function openAddTaskInBoard(status = nextStatus) {
  const modalAddTask = document.getElementById("modalAddTask");
  const container = document.getElementById("modalAddTask-template-container");
  const modalBackground = document.getElementById("modalCard-background");
  nextStatus = status;

  renderTaskForm(container);
  toggleDisplayNone(modalBackground, "d-block", true);
  modalAddTask.classList.add("xMiddle");
  loadFormFunctions();
}

/**
 * Adds a CSS class to the category label in the modal.
 * The class name is generated dynamically based on the category name.
 *
 * @param {string} category - The name of the category.
 */
function renderCategoryLabel(category) {
  const possibleCategories = ["Technical Task", "User Story"];

  possibleCategories.forEach((singlePossibleCategory) =>
    document
      .getElementById("modalCard-category-value")
      .classList.add(
        `bc-category-label-${singlePossibleCategory
          .replace(/\s/g, "")
          .toLowerCase()}`
      )
  );

  if (!category) return;

  document
    .getElementById("modalCard-category-value")
    .classList.add(
      `bc-category-label-${category.replace(/\s/g, "").toLowerCase()}`
    );
}

/**
 * Populates the modal with task details.
 * Updates the modal fields for category, title, description, and due date.
 *
 * @param {Object} singleTask - The task object containing task details.
 * @param {string} singleTask.category - The category of the task.
 * @param {string} singleTask.title - The title of the task.
 * @param {string} singleTask.description - The description of the task.
 * @param {string} singleTask.finishedUntil - The due date of the task.
 */
function renderModalParts(singleTask) {
  const allKeys = ["category", "title", "description", "finishedUntil"];
  allKeys.forEach((key) => {
    const element = document.getElementById(`modalCard-${key}-value`);
    element.innerHTML = singleTask[key];
  });
}

/**
 * Renders the task's due date in the modal.
 *
 * @param {Object} singleTask - The task object containing task details.
 * @param {string} singleTask.finishedUntil - The due date in "YYYY-MM-DD" format.
 */
function renderDate(singleTask) {
  if (!singleTask?.finishedUntil) return;

  document.getElementById(`modalCard-finishedUntil-value`).innerHTML =
    formatDate(singleTask.finishedUntil);
}

/**
 * Formats a date string in the format "YYYY-MM-DD" to "DD/MM/YYYY".
 * @param {string} date - The date string in "YYYY-MM-DD" format.
 * @returns {string} - The formatted date string in "DD/MM/YYYY" format.
 */
function formatDate(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Invalid Date";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Renders the priority label in the modal.
 * Displays the priority in uppercase along with an icon.
 *
 * @param {string} priority - The priority level ("high", "medium", "low").
 */
function renderPriority(priority) {
  if (!priority) return;

  const priorityLabel = document.getElementById("modalCard-priority-value");
  priorityLabel.innerHTML = /*HTML*/ `
      <div id="priority-label" class="d-flex">
        <p>${upperCaseFirstLetter(priority)}</p>
        ${priorityLabelHTML(priority)}
      </div>`;
}

/**
 * Renders the list of assigned contacts in the modal.
 * For each contact, it creates a label with their name and a corresponding circle icon.
 * @param {Array<string>} assignedTo - Array of contact names assigned to the task.
 */
async function renderAssignedToInModal(assignedToIds) {
  const container = document.getElementById('assignedTo-name-labels-container');
  const contactsData = await getContacts();

  container.innerHTML = '';

  assignedToIds.forEach((contactId) => {
      let contact = contactsData[contactId];
      if (!contact) return;

      let contactElement = document.createElement("div");
      contactElement.classList.add("assignedTo-name-label", "d-flex", "align-items-center", "gap-16px");
      contactElement.innerHTML = `
          ${renderTaskContacts([contactId], contactsData)}
          <p>${contact.name}</p>
      `;

      container.appendChild(contactElement);
  });
}


/**
 * Renders the list of subtasks in the modal.
 * @param {string} taskId - The ID of the task for which subtasks are being displayed.
 * @param {Array<Object>} subtasks - Array of subtasks associated with the task, each containing a `subtask` string and `isChecked` boolean.
 */
function renderSubtasksInModal(taskId, subtasks) {
  const subtasksContainer = document.getElementById("modalCard-subtasks-value");
  subtasksContainer.innerHTML = "";
  const anythingToDo = areThereSubtasks(subtasks);

  toggleDisplayNone(subtasksContainer, "d-flex", anythingToDo);

  if (!anythingToDo) {
    return;
  }

  const fragment = createSubtasksFragment(taskId, subtasks);

  subtasksContainer.appendChild(fragment);
}

/**
 * Checks if there are subtasks to render.
 * @param {Array<Object>} subtasks - Array of subtasks.
 * @returns {boolean} - Returns `true` if subtasks exist, otherwise `false`.
 */
function areThereSubtasks(subtasks) {
  return subtasks && subtasks.length > 0;
}

/**
 * Creates a document fragment containing all subtask elements.
 * @param {string} taskId - The ID of the task.
 * @param {Array<Object>} subtasks - Array of subtasks.
 * @returns {DocumentFragment} - A fragment containing all subtask elements.
 */
function createSubtasksFragment(taskId, subtasks) {
  const fragment = document.createDocumentFragment();

  subtasks.forEach((subtask, index) => {
    const subtaskItem = createSubtaskElement(taskId, subtask, index, subtasks);
    fragment.appendChild(subtaskItem);
  });

  return fragment;
}

/**
 * Creates a single subtask element including a checkbox and label.
 * @param {string} taskId - The ID of the task.
 * @param {Object} subtask - A single subtask object containing `subtask` (string) and `isChecked` (boolean).
 * @param {number} index - The index of the subtask.
 * @param {Array<Object>} subtasks - The full list of subtasks.
 * @returns {HTMLDivElement} - The subtask element.
 */
function createSubtaskElement(taskId, subtask, index, subtasks) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("d-flex", "align-items-center", "gap-2");

  const checkbox = createSubtaskCheckbox(taskId, subtask, index, subtasks);
  const label = createSubtaskLabel(checkbox.id, subtask.subtask);

  subtaskItem.append(checkbox, label);
  return subtaskItem;
}

/**
 * Creates a checkbox for a subtask.
 * @param {string} taskId - The ID of the task.
 * @param {Object} subtask - The subtask object.
 * @param {number} index - The index of the subtask.
 * @param {Array<Object>} subtasks - The full list of subtasks.
 * @returns {HTMLInputElement} - The created checkbox element.
 */
function createSubtaskCheckbox(taskId, subtask, index, subtasks) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = subtask.isChecked;
  checkbox.id = `modal-subtask-${taskId}-${index}`;

  checkbox.addEventListener("change", async () => {
    subtask.isChecked = checkbox.checked;
    await saveSubtaskChange(taskId, subtasks);
    updateProgressBar(taskId, subtasks);
  });

  return checkbox;
}

/**
 * Creates a label for a subtask.
 * @param {string} checkboxId - The ID of the associated checkbox.
 * @param {string} subtaskText - The text of the subtask.
 * @returns {HTMLLabelElement} - The created label element.
 */
function createSubtaskLabel(checkboxId, subtaskText) {
  const label = document.createElement("label");
  label.setAttribute("for", checkboxId);
  label.textContent = subtaskText;
  return label;
}

/**
 * Adjusts the layout of the first line in the modal to its default state.
 * This removes the 'justify-content-end' class and adds the 'justify-content-between' class
 * to ensure that the layout is aligned as intended for the default view.
 */
function adjustFirstLineLayoutToDefault() {
  document
    .getElementById("modalCard-first-line")
    .classList.remove("justify-content-end");
  document
    .getElementById("modalCard-first-line")
    .classList.add("justify-content-between");
}

/**
 * Toggles the visibility of the edit mode in the modal.
 * Based on the provided parameter, it shows or hides the edit-related content.
 * @param {boolean} shallVisible - Whether the edit mode should be visible (true) or not (false).
 */
function toggleEditMode(shallVisible = "") {
  toggleDisplayNone(
    document.getElementById("modalCard-no-edit-mode"),
    "d-block",
    !shallVisible
  );
  toggleDisplayNone(
    document.getElementById("modalCard-edit-mode"),
    "d-block",
    shallVisible
  );
  toggleDisplayNone(
    document.getElementById("modalCard-category-value"),
    "d-block",
    !shallVisible
  );
}
