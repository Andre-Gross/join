/**
 * Filters and displays tasks based on the user's search input.
 * 
 * If the input length is at least 3 characters, it filters tasks by title and description.
 * If no matches are found, a toast message is displayed and the board is cleared.
 * If the input is empty, the board is re-rendered.
 * 
 * @async
 * @function filterAndShowTask
 */
async function filterAndShowTask() {
    let filterWord = document.getElementById("idSearch").value;
  
    if (filterWord.length >= 3) {
      let tasksAsArray = await getTasksAsArray();
      let filterWordLow = filterWord.toLowerCase();
  
      let currentTitles = tasksAsArray.filter((task) =>
        task.title.toLowerCase().includes(filterWordLow)
      );
      let currentDescriptions = tasksAsArray.filter((task) =>
        task.description.toLowerCase().includes(filterWordLow)
      );
  
      let descriptionIds = new Set(currentDescriptions.map((task) => task.id));
      currentTitles = currentTitles.filter((task) => !descriptionIds.has(task.id));
  
      currentTasks = {};
      for (let task of currentTitles) {
        currentTasks[task.id] = task;
      }
      for (let task of currentDescriptions) {
        currentTasks[task.id] = task;
      }
  
      if (Object.keys(currentTasks).length === 0) {
        showToast(toastMessageNoResult, "middle", 1000);
        clearTasksFromBoard();
      } else {
        await renderBodySearch();
      }
    } else if (filterWord.length === 0) {
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