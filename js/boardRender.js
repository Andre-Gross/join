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
