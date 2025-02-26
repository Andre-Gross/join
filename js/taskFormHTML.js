const taskFormHTML = /*HTML*/`
    <form action="" class="w-100 d-flex">

        <div class="form-subcontainer">
            <div class="d-flex flex-column">
                <label for="inputTitle">Title<span class="required-star color-invalid">*</span></label>
                <div class="w-100 d-flex flex-column gap-1">
                    <input type="text" placeholder="Enter a title" required class="w-100" id="inputTitle"
                        onfocus="changeBorderColor(this, 'border-color-onfocus')" oninput="enableDisableSendButton()"
                        onblur="changeToRightBorderColor(this), changeTextRequired('title')">
                    <div class="h-0 d-flex flex-column">
                        <span id="text-required-input-title" class="text-required-input d-none color-invalid fs-12">
                            This field is required</span>
                    </div>
                </div>
            </div>

            <div class="d-flex flex-column gap-8">
                <label for="textareaDescription">Description</label>
                <textarea id="textareaDescription" placeholder="Enter a Description"></textarea>
            </div>

            <div class="d-flex flex-column gap-05">
                <label for="dropdown-container-assignedTo">Assigned to</label>
                <div id="dropdown-container-assignedTo" class="dropdown-container">
                    <div id="input-group-dropdown-assignedTo" class="input-group d-flex">
                        <input id="dropAssignedTo" type="text" class="border-end-0 flex-fill"
                            placeholder="Select contacts to assign"
                            onfocus="changeBorderColor(document.getElementById('dropAssignedTo-img'), 'border-color-onfocus'), filterContacts()"
                            oninput="filterContacts()"
                            onblur="changeBorderColor(document.getElementById('dropAssignedTo-img'))">
                        <div id="dropAssignedTo-img"
                            class="input-single-img-container d-flex justify-content-center align-items-center"
                            onclick="toggleDropdown('assignedTo', 'd-block')">
                            <img id="input-assignedTo-arrow-down" src="assets/img/addTask/arrow-down.svg" class="pointer">
                            <img id="input-assignedTo-arrow-up" src="assets/img/addTask/arrow-up.svg" class="d-none pointer">
                        </div>
                    </div>
                    <div id="input-dummy-assignedTo" class="input-dummy d-none"></div>
                    <div id="dropdown-assignedTo" class="dropdown d-none"></div>
                </div>
                <div id="assignedTo-choosen-contacts" class="w-100 d-flex justify-content-start align-items-center">
                </div>
            </div>
        </div>

        <div class="form-subcontainer">
            <div class="d-flex flex-column gap-05">
                <label for="inputDate">Due date<span class="required-star color-invalid">*</span></label>
                <input required id="inputDate" type="date" onfocus="changeBorderColor(this, 'border-color-onfocus')"
                    oninput="limitDateInput(this), enableDisableSendButton()" onblur="changeToRightBorderColor(this); changeTextRequired('date')">
                <div class="h-0 d-flex flex-column">
                    <span id="text-required-input-date" class="text-required-input d-none color-invalid fs-12">
                        This field is required</span>
                </div>
            </div>

            <div class="d-flex flex-column gap-05">
                <label for="priorityButtons">Prio</label>
                <div id="priorityButtons" class="prio-btn">
                    <button id="urgent" type="button" class="btn" onclick="selectPriority('urgent')">
                        Urgent <img id="img-urgent" src="assets/img/addTask/prio-urgent.svg" alt="Urgent">
                    </button>
                    <button id="medium" type="button" class="btn btn-selected btn-selected-medium"
                        onclick="selectPriority('medium')">
                        Medium <img id="img-medium" src="assets/img/addTask/prio-medium-white.svg" alt="Medium">
                    </button>
                    <button id="low" type="button" class="btn" onclick="selectPriority('low')">
                        Low <img id="img-low" src="assets/img/addTask/prio-low.svg" alt="Low">
                    </button>
                </div>
            </div>

            <div id="taskForm-category" class="d-flex flex-column gap-05">
                <label for="input-group-dropdown-category">Categorie<span class="color-invalid">*</span></label>
                <div id="dropdown-container-category" class="dropdown-container">
                    <div id="input-group-dropdown-category" class="input-group d-flex">
                        <input required readonly type="text" id="inputCategory"
                            class="input-color-standart-important-always border-end-0 flex-fill"
                            placeholder="Select task category" onclick="toggleDropdown('category', 'd-block', true)"
                            oninput="enableDisableSendButton()" onblur="changeTextRequired('category')">
                        <div id="input-group-dropdown-category-img"
                            class="input-single-img-container d-flex justify-content-center align-items-center"
                            onclick="toggleDropdown('category', 'd-block')">
                            <img id="input-category-arrow-down" src="assets/img/addTask/arrow-down.svg" class="pointer">
                            <img id="input-category-arrow-up" src="assets/img/addTask/arrow-up.svg" class="d-none pointer">
                        </div>
                    </div>
                    <div class="h-0 d-flex flex-column">
                        <span id="text-required-input-category" class="text-required-input d-none color-invalid fs-12">
                            This field is required</span>
                    </div>
                    <div id="dropdown-category" class="d-none dropdown" onclick="">
                        <div
                            onclick="selectCategory('Technical Task', document.getElementById('dropdown-category')); enableDisableSendButton(), changeTextRequired('category')">
                            Technical Task</div>
                        <div
                            onclick="selectCategory('User Story', document.getElementById('dropdown-category')); enableDisableSendButton(), changeTextRequired('category')">
                            User
                            Story
                        </div>
                    </div>
                    <div id="input-dummy-category" class="input-dummy d-none"></div>
                </div>
            </div>

            <div class="d-flex flex-column gap-05">
                <label for="input-subtask">Subtasks</label>
                <div class="w-100">
                    <div id="input-group-subtask" class="input-group w-100" onclick="">
                        <input id="input-subtask" type="text" class="border-end-0 flex-grow-1" placeholder="Add new subtask"
                            oninput=""
                            onfocus="changeVisibleImages(true), changeBorderColor(document.getElementById('input-subtask-two-img-box'), 'border-color-onfocus')"
                            onblur="">
                        <div id="input-subtask-plus-box"
                            class="input-single-img-container pointer d-flex justify-content-center align-items-center">
                            <img id="input-subtask-plus" src="assets/img/addTask/plus-dark.svg" class="">
                        </div>
                        <div id="input-subtask-two-img-box" class="input-single-img-container two-img-box d-none">
                            <div class="single-img-box pointer d-flex justify-content-center align-items-center">
                                <img id="input-subtask-pen" src="assets/img/addTask/cross.svg" class=""
                                    onclick="clearValue(document.getElementById('input-subtask'))">
                            </div>
                            <div class="single-img-box pointer d-flex justify-content-center align-items-center">
                                <img id="input-subtask-bin" src="assets/img/addTask/tick-dark.svg" class=""
                                    onclick="addNewSubtask()">
                            </div>
                        </div>
                    </div>
                    <div id="list-subtasks-container" class="d-none">
                    </div>
                </div>
            </div>
            <p id="required-text-mobile-mode" class="required-star required-text"><span class="color-invalid">*</span>This
                field is required</p>
        </div>
    `

const formFooterPost = /*HTML*/`
        <div id="form-footer" class="w-100 d-flex justify-content-end">
            <p id="required-text-desktop-mode" class="required-text"><span class="color-invalid">*</span>This
                field is required</p>
            <div class="main-btn-container d-flex justify-content-end">
                <button type="button" class="d-flex align-items-center btn-outline-secondary btn-form"
                    onclick="emptyAddTaskInputs()">
                    Clear
                    <div class="d-flex justify-content-center align-items-center bounding-box-button-icon">
                        <img src="./assets/img/general/cross.svg" alt="Clear">
                    </div>
                </button>
                <button id="sendButton" class="d-flex align-items-center btn-primary btn-form fw-bold"
                    onclick="submitTaskForm()" disabled>
                    Create Task
                    <div class="d-flex justify-content-center align-items-center bounding-box-button-icon">
                        <img src="./assets/img/general/tick.svg" alt="Create Task">
                    </div>
                </button>
            </div>
        </div>
    </form>
    `

const formFooterPut = /*HTML*/`
        <div id="form-footer" class="w-100 bg-white d-flex justify-content-end">
            <p id="required-text-desktop-mode" class="required-text"><span class="color-invalid">*</span>This
                field is required</p>
            <div class="main-btn-container d-flex justify-content-end">
                <button id="sendButton" class="d-flex align-items-center btn-primary btn-form fw-bold"
                    onclick="" disabled>
                    Ok
                    <div class="d-flex justify-content-center align-items-center bounding-box-button-icon">
                        <img src="./assets/img/general/tick.svg" alt="Ok">
                    </div>
                </button>
            </div>
        </div>
    </form>
    `


function renderTaskForm(element, method = "post", id) {
    element.innerHTML = taskFormHTML;

    if (method === "post") {
        element.innerHTML += formFooterPost;
    } else {
        element.innerHTML += formFooterPut;
    }

    const form = document.querySelector("form");
    const inputsToSubmit = ['inputTitle', 'inputDate']

    if (!form) {
        console.error("Form not found in template");
        return;
    }

    inputsToSubmit.forEach(inputId => {
        document.getElementById(inputId).addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                submitTaskForm(method, id);
            }
        });
    });
}