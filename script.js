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

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function changeBorderColor(element, borderColorClass = "") {
  element.classList.remove("border-color-onfocus");
  element.classList.remove("border-color-invalid");

  if (!(borderColorClass === "")) {
    element.classList.add(borderColorClass);
  }
}

function changeToRightBorderColor(element) {
  if (element.value == "") {
    changeBorderColor(element, "border-color-invalid");
  } else {
    changeBorderColor(element);
  }
}

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

function clearValue(element) {
  element.value = "";
}

function createNameCirlce(initials, color) {
  let HTML = /*HTML*/ `
            <div class="name-circle border border-2 border-white rounded-circle d-flex bg-${color} text-light">
                <span>${initials.toUpperCase()}</span>
            </div>
        `;
  return HTML;
}

async function createNameCirlceWithId(id) {
  const contacts = await getContacts();
  const initials = returnInitialsOfName(contacts[id].name);
  const color = contacts[id].color.replace("#", "").toLowerCase();

  return createNameCirlce(initials, color);
}

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

function getRandomColor() {
  let randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex];
}

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
  visibleTime = 3000,
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
  if (shallSlideIn) {
    toastSlideIn(toast, height, fromWhere);
  } else {
    toastAppear();
  }
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

function upperCaseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
