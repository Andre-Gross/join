// boardHTML.js

function getMobileBoardHeader() {
    return `
        <div class="top-row">
            <div class="title">
                <h1 class="m-2 w-100">Board</h1>
            </div>
            <div class="AddTaskBtn" onclick="openAddTaskInBoard()">
                <p class="AddTaskBtnText">Add task</p>
                <img src="./assets/img/board/plus-button-white.svg" alt="plus">
            </div>
        </div>
        <div class="searchBar">
            <input class="search-container mt-3" id="idSearch" type="text" class="form-control"
                placeholder="Find Task" oninput="filterAndShowTask()">
        </div>
    `;
}


function getDesktopBoardHeader() {
    return `
        <div class="title">
            <h1 class="m-2 w-100">Board</h1>
        </div>
        <div class="AddTaskBtn" onclick="openAddTaskInBoard()">
            <p class="AddTaskBtnText">Add task</p>
            <img src="./assets/img/board/plus-button-white.svg" alt="plus">
        </div>
        <div class="searchBar">
            <input class="search-container mt-3" id="idSearch" type="text" class="form-control"
                placeholder="Find Task" oninput="filterAndShowTask()">
        </div>
    `;
}


function getTaskHTMLTemplate(categoryClass, task, taskId, assignedContactsHTML) {
    return `
        <div class="task-header">
            <div class="category-label ${categoryClass}">${task.category || "No category"}</div>
        </div>
        <h4 class="task-title">${task.title}</h4>
        <p class="task-description">${task.description}</p>
        <div class="task-subtasks">${renderSubtasksHTML(taskId, task.subtasks || [])}</div>
        <div class="task-footer d-flex justify-content-between align-items-center">
            <div class="assigned-contacts d-flex">
                ${assignedContactsHTML}
            </div>
            <div class="task-priority">
                ${priorityLabelHTML(task.priority)}
            </div>
        </div>
    `;
}


function getTaskElementHTML(taskId, task, categoryHTML, subtasksHTML, priorityImage, contactsHTML) {
    return `
      <div class="task-header">
        ${categoryHTML}
        <div class="dropdown-button-task d-none" onclick="toggleTaskDropdown(event)">
              <img src="./assets/img/board/dropdown_close.svg" alt="dropdown">
              <div id="dropdownMenuTask" class="d-menu dm-hidden">
                  <p onclick="moveTaskToCategory(event, '${taskId}', 'To do')">To Do</p>
                  <p onclick="moveTaskToCategory(event, '${taskId}', 'In progress')">In Progress</p>
                  <p onclick="moveTaskToCategory(event, '${taskId}', 'Await feedback')">Await Feedback</p>
                  <p onclick="moveTaskToCategory(event, '${taskId}', 'Done')">Done</p>
              </div>
        </div>
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
}
