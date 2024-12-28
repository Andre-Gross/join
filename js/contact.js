let names = [];
let emails = [];
let phones = [];
let colors = [];
let shortNames = [];
let ids = [];
const COLORS = ["#FF7A00", "#9327FF", "#FF745E", "#FFC700", "#FFE62B", "#FF5EB3", "#00BEE8", "#FFA45E", "#0038FF", "#FF4546", "#6E52FF", "#1FD7C1", "#FC71FF", "#C3FE2B", "#FFBB2B"];

async function contactMain() {
  names = [];
  emails = [];
  phones = [];
  colors = [];
  ids = [];
  await loadContacts();
  await shortName();
  
  let contactMain = document.getElementById("idContactMain");
  contactMain.innerHTML = "";

  let currentLetter = ""; // Verfolgt den aktuellen Buchstaben

  for (let i = 0; i < names.length; i++) {
    let firstLetter = names[i][0].toUpperCase(); // Erster Buchstabe des Namens

    if (firstLetter !== currentLetter) {
      // Füge Überschrift für den neuen Buchstaben hinzu
      contactMain.innerHTML += `
        <h2>${firstLetter}</h2>
        <div id="idGreyLine"></div>
      `;
      currentLetter = firstLetter;
    }

    // Füge den Kontakt hinzu
    contactMain.innerHTML += getContactMain(i);
  }

  contactMain.innerHTML += getAddContactBtn();
}

 
async function loadContacts() {
  let loadContacts = await getContacts();
  let contactsArray = Object.values(loadContacts);
  ids = Object.keys(loadContacts);

  for (let index = 0; index < contactsArray.length; index++) {
    emails.push(contactsArray[index].email);
    names.push(contactsArray[index].name);
    phones.push(contactsArray[index].phone);
    colors.push(contactsArray[index].color);
  }

  await sortContacts();
}


function getContactMain(i) {
  return `
    <div id="idNameMailshort" onclick="openContact(${i})">
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
        <div id="idPersonBackground">
            <img id="idPerson" src="assets/img/contacts/person.svg">
        </div>
        <div>
            <div>
                <input id="idNameAddContact" type="text" name="name" placeholder="Name">
                <input id="idMailAddContact" type="email" name="email" placeholder="Email">
                <input id="idPhoneAddContact" type="tel" pattern="[0-9]*" name="phone" placeholder="Phone">
            </div>
            <div id="idSubmitAddContact" onclick="submitAddContact()">
                <p id="idSubmit">Create Contact</p>
                <img id="idCheck" src="assets/img/contacts/check.svg" alt="check">
            </div>
        </div>
    `;
}


function addContact() {
  let addContact = document.getElementById("idContactMain");
  addContact.innerHTML += getAddContact();

  // Füge Animation hinzu
  setTimeout(() => {
    document.getElementById("idAddContact").classList.add("show");
  }, 10); // Timeout sorgt dafür, dass die Transition greift
}


async function sortContacts() {
  let contacts = names.map((name, index) => ({
    name,
    email: emails[index],
    phone: phones[index],
    color: colors[index],
    id: ids[index],
  }));

  contacts.sort((a, b) => a.name.localeCompare(b.name));

  names = contacts.map((contact) => contact.name);
  emails = contacts.map((contact) => contact.email);
  phones = contacts.map((contact) => contact.phone);
  colors = contacts.map((contact) => contact.color);
  ids = contacts.map((contact) => contact.id);
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
            <div id="idShortName" style="background-color:${colors[i]}">
                <p id="idShortAlph">${shortNames[i]}</p>
            </div>
            <h1>${names[i]}</h1>
            <h3>Contact Information</h3>
            <h3>Email</h3>
            <p id="idMail">${emails[i]}</p>
            <h3>Phone</h3>
            <p>${phones[i]}</p>
            <div id="idEditDeleteBtn" onclick="editContactBtn(${i})">
                <img src="assets/img/contacts/more_vert.svg" alt="editContact">
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
        <div onclick="deleteContact(${i})">
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
            <div id="idShortName" style="background-color:${colors[i]}">
                <p id="idShortAlph">${shortNames[i]}</p>
            </div>
            <div>
                <input id="idNameEditContact" value="${names[i]}" type="text" name="name" placeholder="Name">
                <input id="idMailEditContact" value="${emails[i]}" type="email" name="email" placeholder="Email">
                <input id="idPhoneEditContact" value="${phones[i]}" type="Tel" name="phone" placeholder="Phone">
            </div>
            <h1>${names[i]}</h1>
            <h3>Contact Information</h3>
            <h3>Email<h3>
            <p id="idMail">${emails[i]}</p>
            <h3>Phone<h3>
            <p>${phones[i]}</p>
            <div id="idDeleteBtn" onclick="deleteContact(${i})">
            <p>Delete</p>
            </div>
            <div id="idSaveEditBtn" onclick="saveEditContact(${i})">
                <p>Save</p>
                <img src="assets/img/contacts/check.svg" alt="saveEditContact" >
            </div>
    </div>
    `;
}

function submitAddContact() {
  let name = document.getElementById("idNameAddContact").value; 
  let mail = document.getElementById("idMailAddContact").value; 
  let phone = document.getElementById("idPhoneAddContact").value; 
  let color = getRandomColor();

postContactToDatabase(name, mail, phone, color);
}

function notifSucess() {
  console.log("Save Contact in Progress");
  return `
    <div>
    <p>Contact successfully created</p>
    </div>
    `;
}

async function deleteContact(i) {
  let id = ids[i];
  await deleteContactInDatabase(id);
}

function saveEditContact(i) {
  console.log("Save Contact in Progress");
  let name = document.getElementById("idNameEditContact").value; 
  let mail = document.getElementById("idMailEditContact").value; 
  let phone = document.getElementById("idPhoneEditContact").value;
  let color = colors[i]; 
  let id = ids[i];
  putContactInDatabase(name, mail, phone, color, id);
}

async function shortName() {
  shortNames = names.map(name => getInitialsFromName(name));
}


async function postContactToDatabase(name, mail, phone, color) {
  try {
      tryPostContactToDatabase(name, mail, phone, color);
  } catch (error) {
      console.error("Fehler beim Speichern des Kontaktes", error);
      alert("Beim Speichern des Kontaktes ist ein Fehler aufgetreten.");
  }
}

async function tryPostContactToDatabase(name, mail, phone, color) {
  let response = await fetch(BASE_URL + `users/contacts.json`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "color": color,
        "email": mail,
        "name": name,
        "phone": phone
      })
  });

  if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
  }
  alert("Kontakt erfolgreich hinzugefügt.");
}

function getAlphabet() {
  console.log("Save Contact in Progress");
  Alph = [ABCDEFGHIJKLMNOPQRSTUVWXYZ];
}

function getRandomColor() {
  let randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex];
}

async function deleteContactInDatabase(id){
  try {
      tryDeleteContactInDatabase(id);
  } catch (error) {
      console.error("Fehler beim Löschen des Kontaktes:", error);
      alert("Beim Löschen des Kontaktes ist ein Fehler aufgetreten.");
  }
}

async function tryDeleteContactInDatabase(id) {
  let response = await fetch(BASE_URL + `users/contacts/` + id + `.json`, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json"
      },
  });

  if (!response.ok) {
      throw new Error(`Fehler: ${response.status} ${response.statusText}`);
  }
  alert("Kontakt erfolgreich gelöscht.");
}

async function putContactInDatabase(name, mail, phone, color, id){
  try {
      tryPutContactInDatabase(name, mail, phone, color, id);
  } catch (error) {
      console.error("Fehler beim Bearbeiten des Kontaktes:", error);
      alert("Beim Bearbeiten des Kontaktes ist ein Fehler aufgetreten.");
  }
}

async function tryPutContactInDatabase(name, mail, phone, color, id) {
  let response = await fetch(BASE_URL + `users/contacts/` + id + `.json`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "color": color,
        "email": mail,
        "name": name,
        "phone": phone
      })
  });

  if (!response.ok) {
      throw new Error(`Fehler: ${response.status} ${response.statusText}`);
  }
  alert("Kontakt erfolgreich Bearbeitet.");
}