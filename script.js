const COLORS = [
  "#FF7A00",
  "#9327FF",
  "#FF745E",
  "#FFC700",
  "#FFE62B",
  "#FF5EB3",
  "#00BEE8",
  "#FFA45E",
  "#0038FF",
  "#FF4546",
  "#6E52FF",
  "#1FD7C1",
  "#FC71FF",
  "#C3FE2B",
  "#FFBB2B",
];


/**
 * Adds a prefix and a suffix to a given string and formats it.
 * 
 * This function takes a string, removes any extra whitespace, replaces spaces
 * with underscores, and then adds the specified prefix and suffix.
 *
 * @param {string} string - The string to which the prefix and suffix will be added.
 * @param {string} [prefix=''] - The prefix to add (default is empty string).
 * @param {string} [suffix=''] - The suffix to add (default is empty string).
 * @returns {string} The modified string with the prefix and suffix added.
 */
function addPrefixAndSuffix(string, prefix = '', suffix = '') {
  return prefix + string.trim().replace(/\s+/g, '_') + suffix;
}


/**
 * Capitalizes the first letter of a given string or value.
 * @param {string} val - The input string or value to process.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


/**
 * Changes the border color of an element by adding/removing CSS classes.
 * @param {HTMLElement} element - The element whose border color should be changed.
 * @param {string} [borderColorClass=""] - The CSS class for the new border color.
 */
function changeBorderColor(element, borderColorClass = "") {
  element.classList.remove("border-color-onfocus", "border-color-invalid");

  if (!(borderColorClass === "")) {
    element.classList.add(borderColorClass);
  }
}


/**
 * Sets the border color of an element to indicate validity.
 * @param {HTMLInputElement} element - The input element to validate.
 */
function changeToRightBorderColor(element) {
  if (element.value == "") {
    changeBorderColor(element, "border-color-invalid");
  } else {
    changeBorderColor(element);
  }
}


/**
 * Checks if a given key exists in an array.
 * @param {*} key - The key to search for.
 * @param {Array} arrayToCheck - The array to search in.
 * @returns {boolean} True if the key exists, otherwise false.
 */
function checkContentOfArray(key, arrayToCheck) {
  for (i = 0; i < arrayToCheck.length; i++) {
    const checkValue = arrayToCheck[i];
    if (key == checkValue) {
      return true;
    }
    if (i == arrayToCheck.length - 1) {
      return false;
    }
  }
}


/**
 * Clears the value of an input element.
 * @param {HTMLInputElement} element - The input element to clear.
 */
function clearValue(element) {
  element.value = "";
}


/**
 * Creates an HTML string for a name circle with initials and background color.
 * @param {string} initials - The initials to display inside the circle.
 * @param {string} color - The background color (CSS class name).
 * @returns {string} The generated HTML string.
 */
function createNameCircle(initials, color) {
  let HTML = /*HTML*/ `
            <div class="name-circle border border-2 border-white rounded-circle d-flex bg-${color} text-light">
                <span>${initials.toUpperCase()}</span>
            </div>
        `;
  return HTML;
}


/**
 * Renders HTML for displaying assigned contacts.
 *
 * @param {Array} assignedTo - An array of contact IDs or names assigned to the task.
 * @param {Object} contactsData - An object mapping contact IDs to their details (name, color, etc.).
 * @returns {string} Returns HTML string with circles representing assigned contacts.
 */
function renderTaskContacts(assignedTo = [], contactsData = {}) {
  if (!isValidArray(assignedTo)) return "";
  return assignedTo
    .map((contactIdOrName) => {
      let contact = contactsData[contactIdOrName];
      if (!contact) {
        contact = Object.values(contactsData).find((c) => c.name === contactIdOrName);
      }
      if (!contact) {
        return ``;
    }
          const shortName = contact.name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("");
      const backgroundColor = contact.color || "#ccc";
      return `
        <div class="contact-circle" style="background-color: ${backgroundColor};">
          <span>${shortName}</span>
        </div>
      `;
    })
    .join("");
}


/**
 * This function focuses on the given HTML element.
 * 
 * @param {HTMLElement} element - The element to be focused.
 */
function focusElement(element) {
  element.focus();
}


/**
 * Creates an HTML string for displaying a contact.
 * 
 * @param {number} i - The index of the contact in the arrays.
 * @returns {string} HTML markup for the contact element.
 */
function getContactMain(i) {
  return `
      <div id="idNameMailshort" class="NameMailShort" onclick="openContact(${i})">
          <div id="idShortName" style="background-color:${colors[i]}">
              <p id="idShortAlph">${shortNames[i]}</p>
          </div>
          <div id="idNameMail">
              <p id="idName">${names[i]}</p>
              <p id="idMail">${emails[i]}</p>
          </div>
      </div>
      `;
}

/**
 * Finds the ID of a contact by their name.
 * 
 * @async
 * @param {string} name - The name of the contact to search for.
 * @returns {Promise<number|undefined>} The contact ID if found, otherwise undefined.
 */
async function getIdOfContactWithName(name) {
  const contacts = await getContactsAsArray();

  for (let i = 0; i < contacts.length; i++) {
    const singleContact = contacts[i];
    const checkedName = singleContact.name;

    if (checkedName === name) {
      const id = singleContact.id;
      return id;
    }
  }
}



/**
 * Extracts initials from a user's name.
 *
 * @param {string} name - The full name of the user.
 * @returns {string} The initials (e.g., "JD" for "John Doe").
 */
function getInitialsFromName(name) {
  if (!name) return "G"; // Default for "Guest"
  const words = name.split(" ");
  const initials = words
    .filter((word) => word.trim().length > 0)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return initials.length > 2 ? initials.substring(0, 2) : initials;
}


/**
 * Navigates the user to the previous page in the browser history.
 */
function goBack() {
  window.history.back();
}


/**
 * Returns a random color from the COLORS array.
 * 
 * @returns {string} A random color from the COLORS array.
 */
function getRandomColor() {
  let randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex];
}



/**
 * Extracts the initials from a given name.
 * @param {string} name - The full name (e.g., "John Doe").
 * @returns {string} The initials (e.g., "JD").
 */
function returnInitialsOfName(name) {
  const splitName = name.split(" ");
  let initials = "";

  for (let i = 0; i < splitName.length; i++) {
    const letter = splitName[i].charAt(0).toUpperCase();
    initials += letter;
  }
  return initials;
}


/**
 * Displays a toast message on the screen with customizable text, position, and animations.
 *
 * @param {string} message - The content of the toast message to display.
 * @param {string} [height='middle'] - Vertical position of the toast on the screen. Possible values: "yMiddle" (center) or "yLow" (lower area of the display).
 * @param {number} [visibleTime=3000] - Duration (in milliseconds) the toast message remains visible. If set to 0, the toast will stay on the screen indefinitely.
 * @param {boolean} [shallSlideIn=true] - Whether the toast should slide into the screen. If false, the toast will appear instantly.
 * @param {string} [fromWhere='bottom'] - Direction from which the toast should slide in. Only relevant if `shallSlideIn` is true. Possible values: "bottom" or "right".
 * @param {boolean} [shallSlideOut=true] - Whether the toast should slide out of the screen. If false, the toast will disappear instantly. Only relevant if `visibleTime` > 0.
 */
function showToast(
  message,
  height = "middle",
  visibleTime = 1500,
  shallSlideIn = true,
  fromWhere = "bottom",
  shallSlideOut = true
) {
  const toast = document.getElementById("toast-container");

  prepareToastStartPosition(toast, shallSlideIn, height, fromWhere);
  toast.innerHTML = message;

  setTimeout(() => {
    callToast(toast, height, (shallSlideIn = true), fromWhere);
    toastLeaveDisplay(toast, visibleTime, height, fromWhere, shallSlideOut);
  }, 0);
}


/**
 * Configures the initial position of the toast element before it appears on the screen.
 *
 * @param {HTMLElement} toast - The toast element to be displayed.
 * @param {boolean} shallSlideIn - Whether the toast should slide into the screen.
 * @param {string} height - The vertical position of the toast. Possible values: "yMiddle", "yLow".
 * @param {string} fromWhere - The direction from which the toast should slide in. Possible values: "bottom", "right".
 */
function prepareToastStartPosition(toast, shallSlideIn, height, fromWhere) {
  toast.classList = "";
  if (shallSlideIn) {
    toast.classList.add(fromWhere);
    if (fromWhere === "bottom") {
      toast.classList.add("xMiddle");
    } else if (fromWhere === "right") {
      toast.classList.add("y" + upperCaseFirstLetter(height));
    }
  }
}


/**
 * Handles the appearance of the toast element by either sliding it in or making it appear instantly.
 *
 * @param {HTMLElement} toast - The toast element to be displayed.
 * @param {string} height - The vertical position of the toast. Possible values: "yMiddle", "yLow".
 * @param {boolean} [shallSlideIn=true] - Whether the toast should slide into the screen.
 * @param {string} fromWhere - The direction from which the toast should slide in. Only relevant if `shallSlideIn` is true.
 */
function callToast(toast, height, shallSlideIn = true, fromWhere) {
  toast.classList.remove("d-none")
  if (shallSlideIn) {
    toastSlideIn(toast, height, fromWhere);
  } else {
    toastAppear();
  }
}


/**
 * Removes specified prefixes and suffixes from a given string.
 * 
 * This function takes a string and removes the specified prefix and suffix
 * if they exist in the string.
 *
 * @param {string} string - The string from which the prefix and suffix will be removed.
 * @param {string} [prefix=''] - The prefix to remove (default is empty string).
 * @param {string} [suffix=''] - The suffix to remove (default is empty string).
 * @returns {string} The modified string with the prefix and suffix removed.
 */
function stripPrefixAndSuffix(string, prefix = '', suffix = '') {
  return string.replace(prefix, '').replace(suffix, '');
}


/**
 * Animates the toast element to slide into the screen from the specified direction.
 *
 * @param {HTMLElement} toast - The toast element to be displayed.
 * @param {string} height - The vertical position of the toast. Possible values: "yMiddle", "yLow".
 * @param {string} fromWhere - The direction from which the toast slides in. Possible values: "bottom", "right".
 */
function toastSlideIn(toast, height, fromWhere) {
  toast.classList.add(fromWhere);
  if (fromWhere === "bottom") {
    toast.classList.add("xMiddle");
    toast.classList.add("y" + upperCaseFirstLetter(height));
  } else if (fromWhere === "right") {
    toast.classList.add("y" + upperCaseFirstLetter(height));
    toast.classList.add("xMiddle");
  }
}


/**
 * Makes the toast element appear instantly at the specified position.
 *
 * @param {string} height - The vertical position of the toast. Possible values: "yMiddle", "yLow".
 */
function toastAppear(height) {
  toast.classList.add("y" + upperCaseFirstLetter(height));
  toast.classList.add("xMiddle");
}

/**
 * Handles the disappearance of the toast element after a specified duration.
 *
 * @param {HTMLElement} toast - The toast element to be removed from the screen.
 * @param {number} visibleTime - The duration (in milliseconds) for which the toast remains visible. If 0, the toast will stay on the screen indefinitely.
 * @param {string} height - The vertical position of the toast. Possible values: "yMiddle", "yLow".
 * @param {string} fromWhere - The direction from which the toast was displayed. Possible values: "bottom", "right".
 * @param {boolean} shallSlideOut - Whether the toast should slide out of the screen. If false, the toast will disappear instantly.
 */
function toastLeaveDisplay(
  toast,
  visibleTime,
  height,
  fromWhere,
  shallSlideOut
) {
  if (visibleTime > 0) {
    if (shallSlideOut) {
      setTimeout(() => {
        if (fromWhere === "bottom") {
          toast.classList.remove("y" + upperCaseFirstLetter(height));
        } else if (fromWhere === "right") {
          toast.classList.remove("xMiddle");
        }
      }, visibleTime);
    } else {
      setTimeout(() => {
        toast.classList.add("d-none");
      }, visibleTime);
    }
  }
}


/**
 * Toggles the display of an element based on the specified mode.
 * @param {HTMLElement} element - The DOM element to toggle.
 * @param {string} displayMode - The CSS class to apply when visible (default: "d-block").
 * @param {boolean|string} shallVisible - Whether the element should be visible or hidden, or toggle state if undefined.
 */
function toggleDisplayNone(
  element,
  displayMode = "d-block",
  shallVisible = ""
) {
  let eleClass = element.classList;
  if (shallVisible === true) {
    eleClass.remove("d-none");
    eleClass.add(displayMode);
  } else if (shallVisible === false) {
    eleClass.remove(displayMode);
    eleClass.add("d-none");
  } else {
    if (eleClass.contains("d-none")) {
      eleClass.remove("d-none");
      eleClass.add(displayMode);
    } else {
      eleClass.remove(displayMode);
      eleClass.add("d-none");
    }
  }
}


/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string.
 * @returns {string} The string with the first letter capitalized.
 */
function upperCaseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}


function validateEmailField(input) {
  const email = input.value.trim();
  const domainRegex = /@.+\.[a-z]{2,}$/i;
  if (!email.includes('@') || !domainRegex.test(email)) {
    changeBorderColor(input, 'border-color-invalid');
    return false;
  }
  input.style.borderColor = '';
  return true;
}


function validatePhoneField(input) {
  const phone = input.value.trim();
  const phoneRegex = /^(\+?[0-9]{1,3})?[-. ]?(\(?\d{1,4}\)?)?[-. ]?\d{1,4}[-. ]?\d{1,4}[-. ]?\d{1,9}$/;
  
  if (!phoneRegex.test(phone)) {
    changeBorderColor(input, 'border-color-invalid');
    return false;
  }
  
  input.style.borderColor = '';
  return true;
}

