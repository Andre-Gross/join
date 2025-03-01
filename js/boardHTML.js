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
