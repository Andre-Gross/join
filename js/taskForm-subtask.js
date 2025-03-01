/**
 * This function adds a new subtask to the list if it meets the length criteria.
 * It also alerts the user if the subtask is too short or too long.
 */
function addNewSubtask() {
    const input = document.getElementById('input-subtask');

    if (input.value.length === 0) {
        return;
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
 * @returns {string} - The HTML string representing the subtask.
 */
function renderNewSubtasksHTML(i, singleSubtask) {
    return getSubtaskHTML(i, singleSubtask);
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