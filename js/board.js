let currentTasks = [];

// This function searchs for the Task name
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

    await renderBodySearch();
  } else if (filterWord.length === 0) {
    location.reload();
  }
}

async function renderBodySearch() {
  [
    "todo-container",
    "progress-container",
    "feedback-container",
    "done-container",
  ].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });

  Object.entries(currentTasks).forEach(([taskId, task]) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.id = taskId;
    taskElement.setAttribute("onclick", `openModal('${taskId}')`);
    taskElement.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <p>Due by: ${task.finishedUntil}</p>
                <p><strong>Priority:</strong> <span class="${getPriorityClass(
                  task.priority
                )}">${task.priority}</span></p>
            `;
    const containerId = getContainerIdByStatus(task.status);
    if (containerId)
      document.getElementById(containerId).appendChild(taskElement);
  });
}


// Andres Funktionen
async function changeToEditMode(id) {
  let tasksAsArray = await getTasksAsArray();
  const singleTaskID = tasksAsArray.findIndex(x => x.id == id);
  const singleTask = tasksAsArray[singleTaskID];
  const keys = ['category', 'title', 'description', 'finishedUntil'];

  const title = document.getElementById("inputTitle");
  const description = document.getElementById("textareaDescription");
  const dueDate = document.getElementById('inputDate');
  const priority = document.querySelector('.btn-selected')?.id;
  const category = document.getElementById("inputCategory");

  title.value = singleTask.title;
  description.value = singleTask.description;
  dueDate.value = singleTask.finishedUntil;
  // priority = singleTask.priority;
  category.value = singleTask.category;
  dataSubtasks = singleTask.subtasks;

  renderNewSubtasks()

  toggleDisplayNone(document.getElementById('modalCard-no-edit-mode'));
  toggleDisplayNone(document.getElementById('modalCard-edit-mode'));
  toggleDisplayNone(document.getElementById('modalCard-category-value'));
  document.getElementById('modalCard-first-line').classList.remove('justify-content-between');
  document.getElementById('modalCard-first-line').classList.add('justify-content-end');
  loadFormFunctions()
}
