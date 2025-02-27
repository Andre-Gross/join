const toastMessage = "The entered date is invalid or in the past.";
/**
 * This function initializes the form, including the subtask input listener and dropdown listeners.
 */
function loadFormFunctions() {
    handleSubtaskInput();
    createAssignedToDropdown();
    setupDropdownListeners();
}


/**
 * This function enables or disables the send button based on the content of the required inputs.
 */
function enableDisableSendButton() {
    const title = document.getElementById("inputTitle").value.trim();
    const dueDate = document.getElementById('inputDate').value;
    const category = document.getElementById("inputCategory").value;
    const sendButton = document.getElementById("sendButton")

    if (checkAllInputsHasContent(title, dueDate, category)) {
        sendButton.disabled = false;
    } else {
        sendButton.disabled = true;
    }
}


/**
 * This function adds click event listeners to close the dropdown menus when clicking outside.
 */
function setupDropdownListeners() {
    const dropdownMenues = ['assignedTo', 'category'];

    for (let i = 0; i < dropdownMenues.length; i++) {
        const singleDropdown = dropdownMenues[i];
        document.addEventListener('click', (event) => {
            const dropdown = document.getElementById(`dropdown-${singleDropdown}`);
            const inputGroup = document.getElementById(`input-group-dropdown-${singleDropdown}`);

            if (dropdown) {
                if (!dropdown.contains(event.target) && !inputGroup.contains(event.target)) {
                    toggleDropdown(`${singleDropdown}`, 'd-block', false);
                }
            }
        });
    }
}


/**
 * Toggles the enabled state of all buttons in the form footer.
 * 
 * @param {boolean} shallEnabled - If `true`, enables all buttons; if `false`, disables them.
 *                                 Default is `true`.
 */
function toggleAllFormFooterButtons(shallEnabled = true) {
    const buttons = document.getElementById("form-footer").querySelectorAll("button")

    buttons.forEach(button => {
        button.disabled = !shallEnabled;
    });
}


/**
 * Handles the ending process of the task form.
 * - After a delay of 2 seconds, it redirects to `board.html` if the current page is not the board.
 * - If the user is already on `board.html`, it closes the modal instead.
 */
function handleEndingOfTaskForm() {
    setTimeout(async () => {
        if (!window.location.href.includes("/board.html")) {
            window.location.href = `./board.html`;
        } else {
            closeModalCard();
        }
    }, 2000);
}


/**
 * Checks if all required input fields contain values.
 * 
 * @param {string} title - The title of the task.
 * @param {string} dueDate - The due date as a string.
 * @param {string} category - The category of the task.
 * @returns {boolean} - Returns `true` if all fields have values, otherwise `false`.
 */
function checkAllInputsHasContent(title, dueDate, category) {
    return !(title === '' || dueDate === '' || category === '');
}


/**
 * Toggles the visibility of a "required field" warning text.
 * 
 * @param {string} field - The name of the input field (e.g., "Title", "Date", "Category").
 */
function changeTextRequired(field) {
    const input = document.getElementById(`input${upperCaseFirstLetter(field.toLowerCase())}`);
    const text = document.getElementById(`text-required-input-${field.toLowerCase()}`);

    toggleDisplayNone(text, "d-block", input.value === '');
}

/**
 * Limits and formats the date input to ensure it's in the "YYYY-MM-DD" format.
 *
 * @function
 * @param {HTMLInputElement} inputElement - The input field for the date.
 * @description Restricts the input to a date format of "YYYY-MM-DD" by removing non-digit characters and adjusting the value accordingly.
 */
function limitDateInput(inputElement) {
    let value = inputElement.value;

    if (value.length > 10) {
    value = value.replace(/\D/g, '');

        let year = value.slice(0, 4);
        let month = value.slice(5, 7);
        let day = value.slice(7, 9);

        inputElement.value = `${year}-${month || ''}-${day || ''}`;
    } else {
        return;
    }
}


/**
 * Validates if the due date is in the correct format and not in the past.
 * 
 * @param {string} dueDate - The due date in string format (YYYY-MM-DD).
 * @returns {boolean} - Returns `true` if the date is valid, otherwise `false`.
 */
function isValidDueDate(dueDate) {
    if (!dueDate) return false; // Kein Datum eingegeben

    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setzt die Zeit auf 00:00:00 für einen fairen Vergleich

    return dueDateObj >= today; // Datum darf nicht in der Vergangenheit liegen
}


/**
 * Collects task form data, validates required fields, and submits the task to the database.
 * Shows a success toast and redirects to the board upon completion.
 *
 * @param {string} [method='post'] - The HTTP method to use (`post` to create, `put` to update).
 * @param {string} [id=''] - The task ID (required for `put` requests).
 */
async function submitTaskForm(method = 'post', id = '') {
    const getValue = (id) => document.getElementById(id).value.trim();
    const title = getValue("inputTitle");
    const description = getValue("textareaDescription");
    const dueDate = getValue("inputDate");
    const category = getValue("inputCategory");
    const priority = document.querySelector('.btn-selected')?.id;
    const assignedTo = readAssignedTo();

    const toastMessage = "The entered date is invalid or in the past."; 

    if (!isValidDueDate(dueDate)) {
        showToast(toastMessage); 
        return;
    }

    toggleAllFormFooterButtons(false);

    const data = await prepareDataToSend(title, description, dueDate, priority, category, assignedTo);
    method === 'put' ? await putTaskToDatabase(id, data) : await postTaskToDatabase(data);

    nextStatus = 'To do';
    handleEndingOfTaskForm();
    boardRender();
}

/**
 * Prepares the task data for sending to the database.
 * 
 * @param {string} dataTitle - The title of the task.
 * @param {string} dataDescription - The description of the task.
 * @param {string} dataDueDate - The due date in string format (e.g., "YYYY-MM-DD").
 * @param {string} dataPriority - The priority of the task (e.g., "high", "medium", "low").
 * @param {string} dataCategory - The category of the task (e.g., "Technical Task" or "User Story").
 * @param {Array} dataAssignedTo - An array of assigned persons.
 * @returns {object} - An object containing all task data.
 */
function prepareDataToSend(dataTitle, dataDescription, dataDueDate, dataPriority, dataCategory, dataAssignedTo) {
    const data = {
        title: dataTitle,
        description: dataDescription,
        finishedUntil: dataDueDate,
        priority: dataPriority,
        assignedTo: dataAssignedTo,
        category: dataCategory,
        subtasks: dataSubtasks,
        status: nextStatus,
    };
    return data;
}


/**
 * Updates the global nextStatus variable.
 *
 * This function sets the value of the global variable `nextStatus`, which determines
 * the default status for new tasks when they are created or updated.
 *
 * @param {string} status - The new status to assign to `nextStatus`.
 */
function putNextStatus(status) {
    nextStatus = status;
}