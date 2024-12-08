let names = [];
let emails = [];
let phones = [];
let shortNames = [];

async function contactMain() {
  names = [];
  emails = [];
  phones = [];
  await loadContacts();
  let contactMain = document.getElementById("idContactMain");
  contactMain.innerHTML = "";

  for (let i = 0; i < names.length; i++) {
    contactMain.innerHTML += getContactMain(i);
  }
  contactMain.innerHTML += getAddContactBtn();
}

async function loadContacts() {
  let loadContacts = await getContacts();
  let contactsArray = Object.values(loadContacts);

  for (let index = 0; index < contactsArray.length; index++) {
    emails.push(contactsArray[index].email);
    names.push(contactsArray[index].name);
    phones.push(contactsArray[index].phone);
  }
  await sortContacts();
  await shortName();
}

function getContactMain(i) {
  return `
    <div id="idNameMailshort" onclick="openContact(${i})">
        <div id="idShortName">
            <p id="idShortAlph">${shortNames[i]}</p>
        </div>
        <div id="idNameMail">
            <p id="idName">${names[i]}</p>
            <p id="idMail">${emails[i]}</p>
        </div>
    </div>
    `;
}

function getAddContactBtn() {
  return `
    <div id="idAddContactBtn" onclick="addContact()">
    <img id="idImgAddContact" src="assets/img/contacts/person-add.svg" alt=""></div>
    `;
}

function addContact() {
  let addContact = document.getElementById("idContactMain");
  addContact.innerHTML += getAddContact();
}

function getAddContact() {
  return `
        <div id="idAddContact">
            <img src="assets/img/general/Vector.svg" alt="x" onclick="contactMain()">
            <h1>Add contact</h1>
            <h3>Tasks are better with a team!</h3>
            <div id="blueLine"><div>
        </div>
        <img src="assets/img/contacts/person.svg">
        <div>
            <div>
                <input id="idname" type="text" name="name" placeholder="Name">
                <input id="idmail" type="email" name="email" placeholder="Email">
                <input id="phone" type="tel" pattern="[0-9]*" name="phone" placeholder="Phone">
            </div>
            <div id="idsubmitAddContact" onclick="submitAddContact()">
                <p>Create Contact</p>
                <img src="assets/img/contacts/check.svg" alt="check">
            </div>
        </div>
    `;
}

async function sortContacts() {
  let contacts = names.map((name, index) => ({
    name,
    email: emails[index],
    phone: phones[index],
  }));

  contacts.sort((a, b) => a.name.localeCompare(b.name));

  names = contacts.map((contact) => contact.name);
  emails = contacts.map((contact) => contact.email);
  phones = contacts.map((contact) => contact.phone);
}

function openContact(i) {
  let openContact = document.getElementById("idContactMain");
  openContact.innerHTML = "";
  openContact.innerHTML += getContactView(i);
}

function getContactView(i) {
  return `
        <div id="idheadContactView">
        <h1 id="idh1Contacts">Contacts</h1> 
        <img id="idVector" src="assets/img/general/Vector.svg" alt="return" onclick="contactMain()">
        </div>
        <h3 id="idTitle">Better with a team</h3>
        <div id="idBlueLine"></div>
            <div id="idShortName">
                <p id="idShortAlph">${shortNames[i]}</p>
            </div>
            <h1>${names[i]}</h1>
            <h3>Contact Information</h3>
            <h3>Email</h3>
            <p id="idMail">${emails[i]}</p>
            <h3>Phone</h3>
            <p>${phones[i]}</p>
            <div id="idEditDeleteBtn">
                <img src="assets/img/contacts/more_vert.svg" alt="editContact" onclick="editContactBtn(${i})">
            </div>
    `;
}

function editContactBtn(i) {
  let editContactBtn = document.getElementById("idEditDeleteBtn");
  editContactBtn.innerHTML += getEditContactBtn(i);
}

function getEditContactBtn(i) {
  return `
    <div>
        <div onclick="editContact(${i})">
            <img src="assets/img/contacts/pen.svg" alt="pencil">
            <p>Edit</p>
        </div>
        <div onclick="deleteContact()">
            <img src="assets/img/contacts/bin.svg" alt="bin">
            <p>Delete</p>
        </div>
    </div>
    `;
}

function editContact(i) {
  let editContact = document.getElementById("idContactMain");
  editContact.innerHTML += getEditContact(i);
}

function getEditContact(i) {
  return `
    <div>
        <h1>Edit contact</h1><img src="assets/img/contacts/close.svg" alt="return" onclick="contactMain()">
        <div id="idBlueLine"></div>
            <div id="idShortName">
                <p id="idShortAlph">${shortNames[i]}</p>
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
                <img src="assets/img/contacts/check.svg" alt="saveContact" >
            </div>
    </div>
    `;
}

function submitAddContact() {
  let name = document.getElementById("idname").value; 
  let mail = document.getElementById("idmail").value; 
  let phone = document.getElementById("idphone").value; 

  console.log(name);
  console.log("Submit new Contact in Progress");
}

function notifSucess() {
  return `
    <div>
    <p>Contact successfully created</p>
    </div>
    `;
}

function deleteContact() {
  console.log("Delete Contact in Progress");
}

function saveContact() {
  console.log("Save Contact in Progress");
}

async function shortName() {
  shortNames = names.map(name => {
    let parts = name.split(" "); 
    let firstInitial = parts[0][0].toUpperCase();
    let lastInitial = parts[1] ? parts[1][0].toUpperCase() : ""; 
    return firstInitial + lastInitial; 
  });
}