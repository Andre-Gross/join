/**
 * Fetches tasks from Firebase, clears existing containers, and renders tasks into their respective status containers.
 * 
 * @async
 * @function boardRender
 * @returns {Promise<void>} Resolves when tasks are successfully rendered or logs an error if something goes wrong.
 */
async function boardRender() {
    const firebaseUrl = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

    try {
        // Fetch data from Firebase
        const response = await fetch(firebaseUrl);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const tasksData = await response.json();
        if (!tasksData) {
            console.log("No tasks found.");
            return;
        }

        // Clear content of all containers
        ["todo-container", "progress-container", "feedback-container", "done-container"].forEach(containerId => {
            document.getElementById(containerId).innerHTML = '';
        });

        // Iterate tasks and add them to the correct container
        Object.entries(tasksData).forEach(([taskId, task]) => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");
            taskElement.id = taskId; // Sicherstellen, dass jeder Task eine ID hat
            taskElement.setAttribute("onclick", `openModal('${taskId}')`); // `onclick` hinzufügen
            taskElement.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <p>Due by: ${task.finishedUntil}</p>
                <p><strong>Priority:</strong> <span class="${getPriorityClass(task.priority)}">${task.priority}</span></p>
            `;
            const containerId = getContainerIdByStatus(task.status);
            if (containerId) document.getElementById(containerId).appendChild(taskElement);
        });

        console.log("Tasks rendered successfully.");
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}



function ensureTasksHaveOnClick(containerId) {
    const container = document.getElementById(containerId);

    // MutationObserver, um DOM-Änderungen zu überwachen
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // Überprüfen, ob das hinzugefügte Element ein HTML-Element ist
                if (node.nodeType === 1) {
                    // Eine eindeutige ID vergeben, falls keine existiert
                    const taskId = node.id || `task-${Date.now()}`;
                    node.id = taskId;

                    // `onclick`-Attribut mit der ID hinzufügen
                    node.setAttribute('onclick', `openModal('${taskId}')`);
                }
            });
        });
    });

    observer.observe(container, { childList: true });
}

// Funktion, die das Modal öffnet
function openModal(id) {
    alert(`Task ${id} geöffnet!`);
}

// Überwachung für alle Container aktivieren
['todo-container', 'progress-container', 'feedback-container', 'done-container'].forEach(ensureTasksHaveOnClick);



/**
 * Gets the CSS class name for the given priority level.
 * 
 * @function getPriorityClass
 * @param {string} priority - The priority level (e.g., "urgent", "medium", "low").
 * @returns {string} The CSS class name for the priority.
 */
function getPriorityClass(priority) {
    const priorityClasses = {
        urgent: "priority-high",
        medium: "priority-medium",
        low: "priority-low"
    };
    return priorityClasses[priority] || "";
}

/**
 * Gets the container ID for a given task status.
 * 
 * @function getContainerIdByStatus
 * @param {string} status - The task status (e.g., "To do", "In progress", "Await feedback", "Done").
 * @returns {string|null} The container ID or null if the status is not recognized.
 */
function getContainerIdByStatus(status) {
    const statusContainers = {
        "To do": "todo-container",
        "In progress": "progress-container",
        "Await feedback": "feedback-container",
        "Done": "done-container"
    };
    return statusContainers[status] || null;
}




// Ab hier beginnt der Modal-Card-Code

async function openModal(id) {
    let tasksAsArray = await getTasksAsArray();
    const singleTaskID = tasksAsArray.findIndex(x => x.id == id);
    const singleTask = tasksAsArray[singleTaskID];
    const keys = ['category', 'title', 'description', 'finishedUntil'];

    renderModal(singleTask, keys);
    renderDate(singleTask)

    document.getElementById('modalCard-category-value').classList.add(`bc-category-label-${singleTask.category.replace(/\s/g, '').toLowerCase()}`);
    renderPriority(singleTask.priority);
    renderSubtasks(singleTask.id, singleTask.subtasks)

    document.getElementById('modalCard-delete-button').onclick = function () { deleteTaskOfModalCard(id) };

    toggleDisplayModal();
}


function renderModal(singleTask, allKeys) {
    for (let i = 0; i < allKeys.length; i++) {
        const element = document.getElementById(`modalCard-${allKeys[i]}-value`);
        element.innerHTML = singleTask[allKeys[i]];
    }
}


function renderDate(singleTask) {
    let date = singleTask['finishedUntil'];
    document.getElementById((`modalCard-finishedUntil-value`)).innerHTML = formatDate(date);
}


function formatDate(date) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}


function renderPriority(priority) {
    let priorityLabel = document.getElementById('modalCard-priority-value');
    priorityLabel.innerHTML = priorityLabelHTML(priority)
}


function priorityLabelHTML(priority) {
    let HTML = `
    <span>${capitalizeFirstLetter(priority)}<span>
    <img src="assets/img/general/prio-${priority}.png" alt="">
    `;
    return HTML
}


function renderSubtasks(taskId, subtasks) {
    let modalSubtasksValue = document.getElementById('modalCard-subtasks-value');
    modalSubtasksValue.innerHTML = renderSubtasksHTML(taskId, subtasks)
}


function renderSubtasksHTML(taskId, subtasks) {
    let HTML = '';
    if (!subtasks || subtasks.length === 0) {
        return HTML;
    }

    for (let i = 0; i < subtasks.length; i++) {
        const singleSubtask = subtasks[i];
        HTML += `
            <div class="d-flex align-items-center">
                <label class="custom-checkbox d-flex align-items-center" onclick="changeCheckbox('${taskId}', ${i})">
                    <input id="checkbox-subtask${i}" type="checkbox" ${singleSubtask.isChecked ? 'checked' : ''}>
                    <span class="checkbox-image"></span>
                </label>
                <p>${singleSubtask.subtask}</p>
            </div>
        `;
    }

    return HTML;
}


async function deleteTaskOfModalCard(id){
    deleteTaskInDatabase(id);
    toggleDisplayModal()
}


function toggleDisplayModal() {
    toggleDisplayNone(document.getElementById('board'));
    toggleDisplayNone(document.getElementById('modalCard'), 'd-flex');
}


async function deleteTaskOfModalCard(id) {
    await deleteTaskInDatabase(id),
    toggleDisplayModal();
    await boardRender()
}


function readAllKeys(object, without = '') {
    const allKeys = [];
    for (let i = 0; i < Object.keys(object).length; i++) {
        const key = Object.keys(object)[i];
        if (checkContentOfArray(key, without)) {
            continue;
        } else {
            allKeys.push(key);
        }
    }
    return allKeys;
}


function changeCheckbox(taskId, id) {
    const checkbox = document.getElementById(`checkbox-subtask${id}`);
    checkbox.checked = !checkbox.checked;
    console.log('Checked state:', checkbox.checked);

    putNewCheckedToSubtask(taskId, id, checkbox.checked);
}


updateTaskSummary(tasksData);