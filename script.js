function removeInvalidBorder(element) {
    element.classList.remove("invalid-border");
}


function addInvalidBorder(element) {
    if (element.value == '') {
        element.classList.add("invalid-border");
    }
}