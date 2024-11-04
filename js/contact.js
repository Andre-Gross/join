
let user = 1;
let names = [];
let emails = [];
let phones = [];


async function contactMain() {
  names = [];
  emails = [];
  phones = [];
  await getContacts();
  let contactMain = document.getElementById("idContactMain");
  contactMain.innerHTML = "";
  for (let i = 0; i < names.length; i++) {
    contactMain.innerHTML += getContactMain(i);
  }
    contactMain.innerHTML += getAddContactBtn();
}


async function getContacts() {
    let contactsResponse = await getData(`users/${user}/contacts.json`);
    let contactArray = contactsResponse;
  
    for (let index = 0; index < contactArray.length; index++) {
      names.push(contactArray[index].name);
      emails.push(contactArray[index].email); 
      phones.push(contactArray[index].phone);
    }
    await sortContacts();
  }


async function getData(path = "") {
    let response = await fetch(BASE_URL + path);
    return (responseToJson = await response.json());
}


function getContactMain(i) {
    return `
    <div id="idNameMailshort" onclick="openContact(${i})">
        <div id="idShortName">
            <p id="idShortAlph">MM</p>
        </div>
        <div id="idNameMail">
            <p id="idName">${names[i]}</p>
            <p id="idMail">${emails[i]}</p>
        </div>
    </div>
    `
}


function getAddContactBtn() {
    return `
    <div id="idAddContact" onclick="addContact()">
    <img id="idImgAddContact" src="assets/img/svg/person_add.svg" alt=""></div>
    `
}


function addContact() {
    let addContact = document.getElementById("idContactMain");
    addContact.innerHTML += getaddContact();
}


function getaddContact() {
    return `
    <div>
        <div>
            <img src="assets/img/svg/close.svg" alt="x" onclick="contactMain()">
            <h1>Add contact</h1>
            <h3>Tasks are better with a team!</h3>
            <div id="blueline"><div>
        </div>
        <img>
        <div>
            <div>
                <input type="text" name="name" placeholder="Name">
                <input type="email" name="email" placeholder="Email">
                <input type="Tel" name="phone" placeholder="Phone">
            </div>
            <div onclick="submitAddContact()">
                <p>Create Contact</p>
                <img alt="check">
            </div>
        </div>
    </div>
    `
}


async function sortContacts() {
    let contacts = names.map((name, index) => ({
        name,
        email: emails[index],
        phone: phones[index]
    }));
    
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    
    names = contacts.map(contact => contact.name);
    emails = contacts.map(contact => contact.email);
    phones = contacts.map(contact => contact.phone);
}


function openContact(i) {
    let openContact = document.getElementById("idContactMain");
    openContact.innerHTML = "";
    openContact.innerHTML += getContactView(i);
}


function getContactView(i){
    return `
    <div>
        <h1>Contacts</h1> <img src="assets/img/svg/arrow-left-line.svg" alt="return" onclick="contactMain()">
        <h3>Better with a team</h3>
        <div id="idblueLine"></div>
            <div id="idShortName">
                <p id="idShortAlph">MM</p>
            </div>
            <h1>${names[i]}</h1>
            <h3>Contact Information</h3>
            <h3>Email<h3>
            <p id="idMail">${emails[i]}</p>
            <h3>Phone<h3>
            <p>${phones[i]}</p>
            <div id="idEditDeleteBtn">
                <img src="assets/img/svg/more_vert.svg" alt="editContact" onclick="editContactBtn(${i})">
            </div>
    </div>
    `
}


function editContactBtn(i) {
    let editContactBtn = document.getElementById("idEditDeleteBtn");
    editContactBtn.innerHTML += getEditContactBtn(i);
}


function getEditContactBtn(i) {
    return `
    <div>
        <div onclick="editContact(${i})">
            <img alt="pencil">
            <p>Edit</p>
        </div>
        <div onclick="deleteContact()">
            <img alt="bin">
            <p>Delete</p>
        </div>
    </div>
    `
}


function editContact(i) {
    let editContact = document.getElementById("idContactMain");
    editContact.innerHTML += getEditContact(i);
}


function getEditContact(i) {
    return `
    <div>
        <h1>Edit contact</h1><img alt="return" onclick="contactMain()">
        <div id="idblueLine"></div>
            <div id="idShortName">
                <p id="idShortAlph">MM</p>
            </div>
            <div>
                <input value="${names[i]}" type="text" name="name" placeholder="Name">
                <input value="${emails[i]}" type="email" name="email" placeholder="Email">
                <input value="${phones[i]}" type="Tel" name="phone" placeholder="Phone">
            </div>
            <h1>${names[i]}</h1>
            <h3>Contact Information</h3>
            <h3>Email<h3>
            <p id="idMail">${emails[i]}</p>
            <h3>Phone<h3>
            <p>${phones[i]}</p>
            <div id="idDeleteBtn" onclick="deleteContact()">
            <p>Delete</p>
            </div>
            <div id="idSaveBtn" onclick="saveContact()">
                <p>Save</p>
                <img alt="saveContact" >
            </div>
    </div>
    `
}


function submitAddContact(){
    console.log("Submit new Contact in Progress");
}


function notifSucess(){
    return `
    <div>
    <p>Contact successfully created</p>
    </div>
    `
}


function deleteContact(){
    console.log("Delete Contact in Progress");
}


function saveContact(){
    console.log("Save Contact in Progress");
}