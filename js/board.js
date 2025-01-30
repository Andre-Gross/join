let currentTasks = [];
let toastMessageNoResult ='<span>Keine Ergebnisse gefunden</span>';


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
  // Kontakte aus der Datenbank herausfiltern
  const contactEntries = Object.values(contacts);

  // Limitiere auf maximal 3 Kontakte oder füge Platzhalter hinzu
  const limitedContacts =
    assignedTo && assignedTo.length > 0 ? assignedTo.slice(0, 3) : ["", "", ""]; // Drei transparente Platzhalter-Kreise

  return `
    <div class="assigned-contacts">
      ${limitedContacts
      .map((name) => {
        if (!name) {
          // Platzhalter für leere Kontakte (transparenter Kreis)
          return `
              <div class="contact-circle" style="background-color: transparent; ">
              </div>
            `;
        }

        // Finde den Kontakt in den gespeicherten Daten
        const contact = contactEntries.find((c) => c.name === name);

        // Fallback für unbekannte Kontakte
        const color = contact ? contact.color : "#ccc";

        // Kürzel aus Vor- und Nachnamen generieren
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
    // Lade Tasks und Kontakte gleichzeitig
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
      console.log("No tasks found.");
      return;
    }

    // Lösche vorhandene Inhalte in den Containern
    [
      "todo-container",
      "progress-container",
      "feedback-container",
      "done-container",
    ].forEach((containerId) => {
      document.getElementById(containerId).innerHTML = "";
    });

    // Rendere Tasks basierend auf ihrem Status
    Object.entries(tasksData).forEach(([taskId, task]) => {
      const containerId = getContainerIdByStatus(task.status);
      if (!containerId) return;

      const taskElement = document.createElement("div");
      taskElement.classList.add("task");
      taskElement.id = taskId;
      taskElement.setAttribute("draggable", "true");
      taskElement.setAttribute("onclick", `openModal('${taskId}')`);

      // Kategorie-Label erstellen
      const categoryClass = task.category
        ? `bc-category-label-${task.category.replace(/\s+/g, "").toLowerCase()}`
        : "bc-category-label-unknown";
      const categoryHTML = `
        <div class="category-label ${categoryClass}">
          ${task.category || "No category"}
        </div>`;

      // Berechnung des Fortschritts der Subtasks
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

      // Prioritätsbild rendern
      const priorityImage = priorityLabelHTML(task.priority);

      // Kontakte rendern
      const contactsHTML = renderAssignedContacts(
        task.assignedTo,
        contactsData
      );

      // Aufgabe rendern
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

async function renderBodySearch() {
  // Leere die Container vor dem Rendern
  ["todo-container", "progress-container", "feedback-container", "done-container"].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });

  // Kontakte laden
  const contactsData = await fetchContactsData();

  // Verwende die Logik von boardRender, um konsistentes Rendering zu gewährleisten
  Object.entries(currentTasks).forEach(([taskId, task]) => {
    const containerId = getContainerIdByStatus(task.status);
    if (!containerId) return;

    // Erstelle Task-Element wie in boardRender
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

    // Subtasks-HTML
    const subtasksHTML = renderSubtasksHTML(taskId, task.subtasks || []);

    // Priorität-Bild
    const priorityImage = priorityLabelHTML(task.priority);

    // Kontakte rendern
    const contactsHTML = renderTaskContacts(task.assignedTo || [], contactsData);

    // Task-HTML
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

    // Task in den entsprechenden Container hinzufügen
    document.getElementById(containerId).appendChild(taskElement);
  });
}


function priorityLabelHTML(priority) {
  return `<img src="assets/img/general/prio-${priority}.svg" alt="${priority}">`;
}

// Andres Funktionen
async function changeToEditMode(id) {
  let tasksAsArray = await getTasksAsArray();
  const singleTaskID = tasksAsArray.findIndex((x) => x.id == id);
  const singleTask = tasksAsArray[singleTaskID];

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

  document.getElementById("modul-card-edit-mode-form").onsubmit = function () {
    submitTaskForm("put", id);
    return false;
  };
}


function toggleEditMode(shallVisible = '') {
  toggleDisplayNone(document.getElementById("modalCard-no-edit-mode"), 'd-block', !shallVisible);
  toggleDisplayNone(document.getElementById("modalCard-edit-mode"), 'd-block', shallVisible);
  toggleDisplayNone(document.getElementById("modalCard-category-value"), 'd-block', !shallVisible);
}


document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks(); // Tasks laden und rendern
  scrollToTaskSection(); // Scrollt zur gewünschten Sektion
});

/**
 * Scrolls to the task section based on the "status" parameter in the URL.
 */
function scrollToTaskSection() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status"); // Liest den ?status-Parameter aus der URL

  if (!status) return; // Falls kein Status vorhanden ist, abbrechen

  // Mapping der Status zu den Container-IDs
  const containerMapping = {
    todo: "todo-container",
    inprogress: "progress-container",
    feedback: "feedback-container",
    done: "done-container",
    urgent: "todo-container", // Optional: Urgent wird z.B. im To-Do-Container angezeigt
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
