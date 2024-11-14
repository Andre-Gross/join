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
    if (eleClass.contains("d-none")){
        eleClass.remove("d-none");
        eleClass.add("d-block");
    } else {
        eleClass.remove("d-block");
        eleClass.add("d-none");
    }
}


function toggleDisplayNoneFlex(element) {
    let eleClass = element.classList;
    if (eleClass.contains("d-none")){
        eleClass.remove("d-none");
        eleClass.add("d-flex");
    } else {
        eleClass.remove("d-flex");
        eleClass.add("d-none");
    }
}