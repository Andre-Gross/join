/**
 * This function adds a new subtask to the list if it meets the length criteria.
 * It also alerts the user if the subtask is too short or too long.
 */
function addNewSubtask() {
    const minLength = 3;
    const maxLength = 20;
    const input = document.getElementById('input-subtask');

    if (input.value.length < minLength) {
        alert(`Der Subtask ist zu kurz. Bitte verwende mindestens ${minLength} Zeichen`)
    } else if (input.value.length > maxLength) {
        alert(`Der Subtask ist zu lang. Bitte begrenze dich auf ${maxLength}`)
    } else {
        const subtask = {
            'subtask': input.value,
            'isChecked': false,
        };
        dataSubtasks.push(subtask);
        input.value = '';
        renderNewSubtasks();
    }
}


/**
 * This function renders all the subtasks on the screen, updating the list of subtasks.
 * If there are no subtasks, it hides the container.
 */
function renderNewSubtasks() {
    const listContainer = document.getElementById('list-subtasks-container')
    if (dataSubtasks.length > 0) {
        toggleDisplayNone(listContainer, 'd-block', true);
        listContainer.innerHTML = '';
        for (let i = 0; i < dataSubtasks.length; i++) {
            const singleSubtask = dataSubtasks[i].subtask;
            listContainer.innerHTML += renderNewSubtasksHTML(i, singleSubtask);
        }
    } else {
        toggleDisplayNone(listContainer, 'd-block', false);
    }
}


/**
 * This function generates the HTML structure for a single subtask and returns the DOM element.
 * 
 * @param {number} i - The index of the subtask.
 * @param {string} singleSubtask - The text of the subtask.
 * @returns {Element} - The DOM element representing the subtask.
 */
function renderNewSubtasksHTML(i, singleSubtask) {
    let HTML = /*HTML*/`
        <div class="">
            <div id="list-item-box-current-subtask${i}" class="list-item-box d-flex justify-content-between">
                <p> &#x2022 ${singleSubtask}</p>
                <div class="two-img-box">
                    <img id="input-subtask-pen" src="assets/img/addTask/pen.svg" class="" onclick="toggleEditModeSubtask(${i})">
                    <img id="input-subtask-bin" src="assets/img/addTask/bin.svg" class="" onclick="removeSubtask(${i})">
                </div>
            </div>
            <div id="input-box-current-subtask${i}" class="input-box-current-subtask input-group w-100 d-none">
    <input id="input-current-subtask${i}" type="text" class="input-current-subtask border-none flex-grow-1">
    <div id="input-subtask-two-img-box" class="two-img-box d-flex">
        <div class="single-img-box pointer d-flex justify-content-center align-items-center">
            <img id="input-subtask-pen" src="assets/img/addTask/bin.svg" class="" onclick="toggleEditModeSubtask(${i})">
        </div>
        <div class="single-img-box pointer d-flex justify-content-center align-items-center">
            <img id="input-subtask-bin" src="assets/img/addTask/tick-dark.svg" class="" onclick="editSubtask(${i})">
        </div>
    </div>
</div>

        </div>
    `;

    return HTML;
}



/**
 * This function toggles the edit mode for a specific subtask by changing the visibility of input fields.
 * 
 * @param {number} id - The index of the subtask in the dataSubtasks array.
 */
function toggleEditModeSubtask(id) {
    const element = document.getElementById(`input-current-subtask${id}`);

    toggleDisplayNone(document.getElementById(`list-item-box-current-subtask${id}`), 'd-flex');
    toggleDisplayNone(document.getElementById(`input-box-current-subtask${id}`), 'd-flex');
    element.value = dataSubtasks[id].subtask;

    element.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            editSubtask(id)
        };
    });
}


/**
 * This function edits a subtask by saving the updated value and rendering the updated list.
 * 
 * @param {number} id - The index of the subtask in the dataSubtasks array.
 */
function editSubtask(id) {
    dataSubtasks[id].subtask = document.getElementById(`input-current-subtask${id}`).value;
    toggleEditModeSubtask(id);
    renderNewSubtasks();
}


/**
 * This function removes a subtask from the list.
 * 
 * @param {number} id - The index of the subtask to be removed in the dataSubtasks array.
 */
function removeSubtask(id) {
    dataSubtasks.splice(id, 1);
    renderNewSubtasks();
}


/**
 * Toggles the visibility of the subtask-related images.
 * Depending on the `changeToTwoImg` parameter, it switches between displaying the "+" button
 * or the two-image box for subtasks.
 *
 * @param {boolean} changeToTwoImg - Determines the visibility state:
 *                                    - `true` shows the two-image box and hides the "+" button.
 *                                    - `false` shows the "+" button and hides the two-image box.
 */
function changeVisibleImages(changeToTwoImg) {
    const plusImg = document.getElementById('input-subtask-plus-box');
    const twoImgBox = document.getElementById('input-subtask-two-img-box')

    if (plusImg && twoImgBox) {
        toggleDisplayNone(plusImg, 'd-flex', !changeToTwoImg);
        toggleDisplayNone(twoImgBox, 'd-flex', changeToTwoImg);
    }
}