let currentTasks = [];
let toastMessageNoResult ='<span>Keine Ergebnisse gefunden</span>';

/**
 * Filtert und zeigt Aufgaben basierend auf einem Suchbegriff an, der in ein Suchfeld eingegeben wird.
 *
 * - Liest den Suchbegriff aus dem Eingabefeld mit der ID `idSearch`.
 * - Wenn der Suchbegriff mindestens 3 Zeichen enthält, wird nach Aufgaben gefiltert, deren Titel oder Beschreibung den Begriff enthalten.
 * - Aufgaben, die im Titel oder in der Beschreibung übereinstimmen, werden in einem Set von `currentTasks` hinzugefügt.
 * - Falls keine Ergebnisse gefunden werden, wird eine Benachrichtigung (Toast) angezeigt.
 * - Wenn das Suchfeld leer ist, wird die Seite neu geladen, um die ursprüngliche Ansicht wiederherzustellen.
 * - Ruft nach der Filterung die Funktion `renderBodySearch()` auf, um die gefilterten Aufgaben anzuzeigen.
 *
 * @async
 * @function filterAndShowTask
 * @returns {Promise<void>} - Ein Promise, das angibt, ob die Aufgaben erfolgreich gefiltert und angezeigt wurden.
 * @throws {Error} - Wird ausgelöst, wenn beim Abrufen der Aufgaben oder beim Filtern ein Fehler auftritt.
 */
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

/**
 * Rendert die zugewiesenen Kontakte für eine Aufgabe als visuelle Darstellung.
 *
 * - Nimmt eine Liste von zugewiesenen Kontakten (`assignedTo`) und sucht die entsprechenden Kontaktdaten in der `contacts`-Datenbank.
 * - Zeigt maximal 3 zugewiesene Kontakte an. Falls weniger als 3 zugewiesene Kontakte existieren, werden leere Kreise mit transparenter Hintergrundfarbe gerendert.
 * - Für jeden Kontakt wird ein Kreis mit den Initialen des Kontakts angezeigt. Der Hintergrund des Kreises entspricht der Farbe des Kontakts (falls vorhanden).
 * - Falls kein Kontakt gefunden wird, wird ein Standardkreis mit grauer Farbe angezeigt.
 *
 * @function renderAssignedContacts
 * @param {Array<string>} assignedTo - Ein Array von Namen der zugewiesenen Kontakte.
 * @param {Object} contacts - Ein Objekt mit den Kontaktdaten, wobei der Name als Schlüssel und die Farbe als Wert enthalten ist.
 * @returns {string} - Ein HTML-String, der die visuelle Darstellung der zugewiesenen Kontakte enthält.
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
 * Lädt Aufgaben und Kontaktdaten asynchron aus der Firebase-Datenbank und zeigt sie auf der Seite an.
 *
 * - Ruft die Aufgaben- und Kontaktdaten von der Firebase-Datenbank ab.
 * - Löscht den Inhalt der Container für jede Aufgabenstatuskategorie (To Do, In Progress, Feedback, Done).
 * - Erstellt für jede Aufgabe ein `div`-Element, das die Kategorie, den Titel, die Beschreibung, den Fortschritt der Subtasks,
 *   zugewiesene Kontakte und die Priorität enthält.
 * - Füge die Aufgabe dem richtigen Container basierend auf ihrem Status hinzu.
 * - Aktiviert Drag-and-Drop-Funktionalität für die Aufgaben.
 * - Zeigt eine Fehlermeldung an, wenn beim Abrufen der Daten ein Fehler auftritt.
 *
 * @async
 * @function loadTasks
 * @returns {Promise<void>} - Ein Promise, das anzeigt, ob die Aufgaben erfolgreich geladen und angezeigt wurden.
 * @throws {Error} - Wird ausgelöst, wenn ein Fehler beim Abrufen der Daten oder beim Rendern der Aufgaben auftritt.
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


/**
 * Gibt die CSS-Klasse für die Priorität einer Aufgabe zurück.
 *
 * - Die Funktion ordnet bestimmten Prioritätswerten CSS-Klassen zu:
 *   - "urgent" → "priority-high"
 *   - "medium" → "priority-medium"
 *   - "low" → "priority-low"
 * - Gibt eine leere Zeichenkette zurück, wenn der Prioritätswert keinen gültigen Eintrag hat.
 *
 * @function getPriorityClass
 * @param {string} priority - Der Prioritätswert der Aufgabe (z. B. "urgent", "medium", "low").
 * @returns {string} - Die zugehörige CSS-Klasse für die Priorität.
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
 * Gibt die Container-ID basierend auf dem Status einer Aufgabe zurück.
 *
 * - Die Funktion ordnet bestimmte Statuswerten Container-IDs zu: 
 *   - "To do" → "todo-container"
 *   - "In progress" → "progress-container"
 *   - "Await feedback" → "feedback-container"
 *   - "Done" → "done-container"
 * - Gibt `null` zurück, wenn der Status keinen gültigen Container zugeordnet hat.
 *
 * @function getContainerIdByStatus
 * @param {string} status - Der Status der Aufgabe (z. B. "To do", "In progress", "Done").
 * @returns {string|null} - Die ID des zugehörigen Containers oder `null`, wenn kein Container gefunden wurde.
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
 * Ruft die Kontaktdaten von der Firebase-Datenbank ab.
 *
 * - Lädt die Kontaktdaten von der URL `https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users/contacts.json`.
 * - Wenn der Abruf fehlschlägt, wird ein Fehler ausgelöst.
 *
 * @async
 * @function fetchContactsData
 * @returns {Promise<Object>} - Ein Promise, das die abgerufenen Kontaktdaten als JSON-Objekt enthält.
 * @throws {Error} - Wird ausgelöst, wenn der Abruf der Kontaktdaten fehlschlägt.
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
 * Kürzt eine Beschreibung auf eine maximale Länge und fügt "..." hinzu, wenn sie zu lang ist.
 *
 * - Wenn die Beschreibung länger als die angegebene `maxLength` ist, wird sie abgeschnitten und mit "..." versehen.
 * - Wenn die Beschreibung kürzer oder gleich der maximalen Länge ist, wird sie unverändert zurückgegeben.
 *
 * @function truncateDescription
 * @param {string} description - Die Beschreibung, die gekürzt werden soll.
 * @param {number} [maxLength=50] - Die maximale Länge der Beschreibung. Standardwert ist 50.
 * @returns {string} - Die gekürzte Beschreibung oder die ursprüngliche, wenn sie kürzer als die maximale Länge ist.
 */
function truncateDescription(description, maxLength = 50) {
  if (!description) return "";
  return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
}


/**
 * Leert den Inhalt der Container für verschiedene Aufgabenkategorien.
 *
 * - Diese Funktion iteriert über die Container-IDs für "todo", "progress", "feedback" und "done" und setzt deren innerHTML auf einen leeren String.
 *
 * @async
 * @function renderBodySearch
 * @returns {void}
 */
async function renderBodySearch() {
["todo-container", "progress-container", "feedback-container", "done-container"].forEach((containerId) => {
  document.getElementById(containerId).innerHTML = "";
});


/**
 * Ruft die Kontaktdaten asynchron ab und speichert sie in der Variable `contactsData`.
 *
 * - Die Daten werden durch einen Aufruf der Funktion `fetchContactsData` geladen.
 *
 * @async
 * @function fetchContactsData
 * @returns {Promise<Object>} - Ein Promise, das die abgerufenen Kontaktdaten als Objekt enthält.
 */
const contactsData = await fetchContactsData();


/**
 * Erstellt für jede Aufgabe ein HTML-Element und fügt es dem Container basierend auf dem Status der Aufgabe hinzu.
 *
 * - Jede Aufgabe wird als `div` mit verschiedenen Details wie Kategorie, Titel, Beschreibung, Subtasks, Priorität und zugewiesene Kontakte dargestellt.
 * - Das `taskElement` ist draggable und öffnet ein Modal beim Klicken auf die Aufgabe.
 * - Das erstellte `taskElement` wird in den entsprechenden Container eingefügt.
 *
 * @function renderTasks
 * @param {Object} currentTasks - Ein Objekt, das alle Aufgaben mit ihren Details enthält.
 * @param {Object} contactsData - Ein Objekt mit den Kontaktdaten der zugewiesenen Nutzer.
 * @returns {void}
 */
Object.entries(currentTasks).forEach(([taskId, task]) => {
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


/**
 * Gibt das HTML für das Prioritätslabel einer Aufgabe zurück, basierend auf der Priorität.
 *
 * - Verwendet eine Bildquelle, die den Prioritätswert in der Bilddatei widerspiegelt.
 *
 * @function priorityLabelHTML
 * @param {string} priority - Der Prioritätswert der Aufgabe (z.B. "high", "medium", "low").
 * @returns {string} - Das HTML-Markup für das Prioritätslabel als `<img>`-Tag.
 */
function priorityLabelHTML(priority) {
  return `<img src="assets/img/general/prio-${priority}.svg" alt="${priority}">`;
}

/**
 * Wechselt in den Bearbeitungsmodus für eine Aufgabe und füllt das Formular mit den aktuellen Aufgabendaten.
 *
 * - Lädt die Aufgaben, sucht die Aufgabe anhand der ID und füllt die Eingabefelder im Formular.
 * - Zeigt den Bearbeitungsmodus an und passt die Layout-Elemente an.
 * - Setzt die Formularübermittlung auf die Funktion zum Aktualisieren der Aufgabe.
 *
 * @async
 * @function changeToEditMode
 * @param {string} id - Die ID der Aufgabe, die in den Bearbeitungsmodus versetzt werden soll.
 */
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


/**
 * Schaltet zwischen Bearbeitungsmodus und Normalmodus für die Modalkarten-Anzeige um.
 *
 * - Wenn `shallVisible` wahr ist, wird der Bearbeitungsmodus angezeigt.
 * - Andernfalls wird der Nicht-Bearbeitungsmodus angezeigt.
 *
 * @param {boolean|string} [shallVisible=''] - Bestimmt, ob der Bearbeitungsmodus angezeigt werden soll.
 * @function toggleEditMode
 */
function toggleEditMode(shallVisible = '') {
  toggleDisplayNone(document.getElementById("modalCard-no-edit-mode"), 'd-block', !shallVisible);
  toggleDisplayNone(document.getElementById("modalCard-edit-mode"), 'd-block', shallVisible);
  toggleDisplayNone(document.getElementById("modalCard-category-value"), 'd-block', !shallVisible);
}


/**
 * Wartet, bis das DOM vollständig geladen ist, lädt die Aufgaben und scrollt zur entsprechenden Sektion.
 *
 * - Ruft die Funktion `loadTasks` auf, um Aufgaben zu laden.
 * - Scrollt anschließend zur Sektion, die durch den "status"-Parameter in der URL bestimmt wird.
 *
 * @event DOMContentLoaded
 * @async
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks(); 
  scrollToTaskSection(); 
});


/**
 * Scrollt zu einer bestimmten Aufgaben-Sektion basierend auf dem "status"-Parameter in der URL.
 *
 * - Unterstützte Statuswerte: "todo", "inprogress", "feedback", "done", "urgent".
 * - Der Status "urgent" wird zur "todo"-Sektion weitergeleitet.
 * - Falls kein gültiger Status vorhanden ist, wird nichts unternommen.
 *
 * @function scrollToTaskSection
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
 * Wartet, bis das DOM vollständig geladen ist, und fügt Ereignislistener für Hover- und Klick-Interaktionen mit Aufgaben hinzu.
 *
 * - Beim Überfahren einer Aufgabe mit der Maus wird sie als aktive Aufgabe markiert.
 * - Beim Klicken außerhalb einer Aufgabe wird die Markierung entfernt.
 *
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  const taskContainers = document.querySelectorAll(".tasks-container");

  taskContainers.forEach(container => {
      container.addEventListener("mouseover", (event) => {
          if (event.target.classList.contains("task")) {
              removeActiveTask(); 
              event.target.classList.add("active-task"); 
          }
      });
  });

  document.addEventListener("click", (event) => {
      if (!event.target.classList.contains("task")) {
          removeActiveTask();
      }
  });

  function removeActiveTask() {
      document.querySelectorAll(".task").forEach(task => task.classList.remove("active-task"));
  }
});

