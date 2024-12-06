function removeInvalidBorder(element) {
    element.classList.remove("invalid-border");
}


function addInvalidBorder(element) {
    if (element.value == '') {
        element.classList.add("invalid-border");
    }
}


function toggleDisplayNoneBlock(element) {
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
}


function upperCaseFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}