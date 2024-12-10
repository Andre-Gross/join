function removeInvalidBorder(element) {
    element.classList.remove("invalid-border");
}


function addInvalidBorder(element) {
    if (element.value == '') {
        element.classList.add("invalid-border");
    }
}


function toggleDisplayNoneBlock(element) {


function clearValue(element) {
    element.value = '';
}
    let eleClass = element.classList;
    if (eleClass.contains("d-none")) {
        eleClass.remove("d-none");
        eleClass.add("d-block");
    } else {
        eleClass.remove("d-block");
        eleClass.add("d-none");
    }
}


function toggleDisplayNoneFlex(element) {
    let eleClass = element.classList;
    if (eleClass.contains("d-none")) {
        eleClass.remove("d-none");
        eleClass.add("d-flex");
    } else {
        eleClass.remove("d-flex");
        eleClass.add("d-none");
    }
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


function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
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