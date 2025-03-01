/**
 * Gets the search term from the search input field.
 * 
 * @function getSearchTerm
 * @returns {string} The search term entered by the user
 */
function getSearchTerm() {
  return document.getElementById("idSearch").value;
}

/**
 * Filters tasks based on a search term.
 * 
 * @async
 * @function filterTasks
 * @param {string} searchTerm - The term to filter tasks by
 * @returns {Object} Object containing filtered tasks
 */
async function filterTasks(searchTerm) {
  let tasksAsArray = await getTasksAsArray();
  let searchTermLow = searchTerm.toLowerCase();

  let titleMatches = tasksAsArray.filter((task) =>
    task.title.toLowerCase().includes(searchTermLow)
  );

  let descriptionMatches = tasksAsArray.filter((task) =>
    task.description.toLowerCase().includes(searchTermLow)
  );

  return { titleMatches, descriptionMatches };
}

/**
 * Combines filtered tasks from titles and descriptions, avoiding duplicates.
 * 
 * @function combineTasks
 * @param {Array} titleMatches - Tasks that match by title
 * @param {Array} descriptionMatches - Tasks that match by description
 * @returns {Object} Combined tasks with no duplicates
 */
function combineTasks(titleMatches, descriptionMatches) {
  let descriptionIds = new Set(descriptionMatches.map((task) => task.id));
  let uniqueTitleMatches = titleMatches.filter((task) => !descriptionIds.has(task.id));

  let combined = {};
  for (let task of uniqueTitleMatches) {
    combined[task.id] = task;
  }
  for (let task of descriptionMatches) {
    combined[task.id] = task;
  }

  return combined;
}

/**
 * Handles the search results by either showing a toast message, clearing the board,
 * or rendering the filtered tasks.
 * 
 * @async
 * @function handleSearchResults
 * @param {Object} filteredTasks - The tasks that match the search criteria
 */
async function handleSearchResults(filteredTasks) {
  if (Object.keys(filteredTasks).length === 0) {
    showToast(toastMessageNoResult, "middle", 1000);
    clearTasksFromBoard();
  } else {
    currentTasks = filteredTasks;
    await renderBodySearch();
  }
}

/**
 * Main function that orchestrates the filtering and displaying of tasks.
 * 
 * @async
 * @function filterAndShowTask
 */
async function filterAndShowTask() {
  let searchTerm = getSearchTerm();

  if (searchTerm.length >= 3) {
    const { titleMatches, descriptionMatches } = await filterTasks(searchTerm);
    const combinedResults = combineTasks(titleMatches, descriptionMatches);
    await handleSearchResults(combinedResults);
  } else if (searchTerm.length === 0) {
    boardRender();
  }
}


/**
* Clears all tasks from the board by emptying the content of each task container.
* 
* The function targets the containers for "To Do", "In Progress", "Feedback", and "Done" tasks.
* 
* @function clearTasksFromBoard
*/
function clearTasksFromBoard() {
  ["todo-container", "progress-container", "feedback-container", "done-container"].forEach((containerId) => {
    document.getElementById(containerId).innerHTML = "";
  });
}


/**
* Truncates a description to a specified maximum length and appends an ellipsis if it exceeds the limit.
* 
* If the description is null or undefined, an empty string is returned.
* 
* @function truncateDescription
* @param {string} description - The text to be truncated.
* @param {number} [maxLength=50] - The maximum allowed length before truncation.
* @returns {string} - The truncated description with an ellipsis if it exceeds the limit.
*/
function truncateDescription(description, maxLength = 50) {
  if (!description) return "";
  return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
}