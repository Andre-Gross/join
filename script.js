function addInvalidBorder(element) {
    if (element.value == '') {
        element.classList.add("invalid-border");
    }
}


function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


function checkContentOfArray(key, arrayToCheck) {
    for (i = 0; i < arrayToCheck.length; i++) {
        const checkValue = arrayToCheck[i];
        if (key == checkValue) {
            return true;
        } if (i == arrayToCheck.length - 1) {
            return false;
        }
    }
}



function clearValue(element) {
    element.value = '';
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
        .filter(word => word.trim().length > 0)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
    return initials.length > 2 ? initials.substring(0, 2) : initials;
}

/**
 * Navigates the user to the previous page in the browser history.
 */
function goBack() {
    window.history.back();
}


function removeInvalidBorder(element) {
    element.classList.remove("invalid-border");
}


function toggleDisplayNone(element, displayMode = 'd-block', shallVisible = '') {
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

