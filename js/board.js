document.addEventListener('DOMContentLoaded', function() {
    // Import tasks from addTask.js (assuming it exports tasks)
    let tasks = []; // This will be populated from addTask.js
    
    try {
        // Assuming addTask.js exports tasks in the correct format
        import('./addTask.js')
            .then(module => {
                tasks = module.tasks;
                renderTasks();
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
            });
    } catch (error) {
        console.error('Error importing tasks:', error);
    }

    function renderTasks() {
        const todoContainer = document.getElementById('todo-container');
        const progressContainer = document.getElementById('progress-container');
        const feedbackContainer = document.getElementById('feedback-container');
        const doneContainer = document.getElementById('done-container');

        // Clear containers
        todoContainer.innerHTML = '';
        progressContainer.innerHTML = '';
        feedbackContainer.innerHTML = '';
        doneContainer.innerHTML = '';

        // Sort tasks into appropriate containers
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            
            switch(task.status) {
                case 'todo':
                    todoContainer.appendChild(taskElement);
                    break;
                case 'progress':
                    progressContainer.appendChild(taskElement);
                    break;
                case 'feedback':
                    feedbackContainer.appendChild(taskElement);
                    break;
                case 'done':
                    doneContainer.appendChild(taskElement);
                    break;
            }
        });

        // Show "No tasks" message if container is empty
        if (todoContainer.children.length === 0) {
            todoContainer.innerHTML = '<div class="text-center text-muted">Keine Aufgaben zu erledigen</div>';
        }
        if (progressContainer.children.length === 0) {
            progressContainer.innerHTML = '<div class="text-center text-muted">Keine Aufgaben in Bearbeitung</div>';
        }
        if (feedbackContainer.children.length === 0) {
            progressContainer.innerHTML = '<div class="text-center text-muted">Keine Aufgaben warten auf Feedback</div>';
        }
        if (doneContainer.children.length === 0) {
            doneContainer.innerHTML = '<div class="text-center text-muted">Keine erledigten Aufgaben</div>';
        }
    }

    function createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-card';
        
        const badgeClass = task.type === 'user-story' ? 'user-story' : 'technical-task';
        const badgeText = task.type === 'user-story' ? 'Benutzergeschichte' : 'Technische Aufgabe';

        taskDiv.innerHTML = `
            <span class="badge ${badgeClass} mb-2">${badgeText}</span>
            <h3 class="h6 mb-2">${task.title}</h3>
            <p class="text-muted small mb-2">${task.description}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="subtasks small text-muted">
                    ${task.subtasks ? `${task.completedSubtasks}/${task.totalSubtasks} Teilaufgaben` : ''}
                </div>
                <div class="assignees">
                    ${task.assignees ? createAssigneesHTML(task.assignees) : ''}
                </div>
            </div>
        `;

        return taskDiv;
    }

    function createAssigneesHTML(assignees) {
        return assignees.map(assignee => 
            `<span class="badge rounded-pill bg-secondary">${assignee.initials}</span>`
        ).join('');
    }

    // Search functionality
    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const taskCards = document.querySelectorAll('.task-card');

        taskCards.forEach(card => {
            const taskText = card.textContent.toLowerCase();
            card.style.display = taskText.includes(searchTerm) ? 'block' : 'none';
        });
    });
});