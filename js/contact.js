let names = [];
let emails = [];
let phones = [];
let colors = [];
let shortNames = [];
let ids = [];
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
    <img id="idXBtn" src="assets/img/contacts/close.svg" alt="x" onclick="closeAddContact()">
    <h1 id="idH1Title">Add contact</h1>
    <h3>Tasks are better with a team!</h3>
    <div id="blueLine"></div>
        <div id="idPersonBackground">
            <img id="idPerson" src="assets/img/contacts/person.svg">
        </div>
        <div>
            <div id="idInput">
                <input id="idNameAddContact" type="text" name="name" placeholder="Name">
                <input id="idMailAddContact" type="email" name="email" placeholder="Email">
                <input id="idPhoneAddContact" type="tel" pattern="[0-9]*" name="phone" placeholder="Phone">
            </div>
            <div id="idContactBtns">
                <button id="idSubmitAddContact" class="btn btn-primary" onclick="submitAddContact()">
                    Create Contact
                    <img id="idCheck" src="assets/img/contacts/check.svg" alt="check">
                </button>
                <button id="idCancelAddContact" class="btn btn-outline-secondary" onclick="closeAddContact()">
                    Cancel
                    <img id="idXBtn" src="assets/img/contacts/close.svg" alt="x">
                </button>
            </div>
        </div>
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

function closeAddContact() {
  let addContactElement = document.getElementById("idAddContact");
  if (addContactElement) {
    addContactElement.remove();
  }
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

  if (window.innerWidth < 1100) {
    openContact.innerHTML = "";
    openContact.innerHTML += getContactView(i);
  } else {
    // Überprüfen, ob ein vorheriger contactViewContainer existiert
    let existingView = document.getElementById("idViewContactCard");
    if (existingView) {
      existingView.remove(); // Vorherige Ansicht entfernen
    }

    // Neues contactViewContainer erstellen und hinzufügen
    let contactViewContainer = document.createElement("div");
    contactViewContainer.id = "idViewContactCard";
    contactViewContainer.innerHTML = getContactView(i);
    document.body.appendChild(contactViewContainer);
  }
}

function getContactView(i) {
  return `
<div id="idViewContactCard">
    <div id="idHeadContactView">
        <h1 id="idh1Contacts">Contacts</h1>
        <img id="idVector" src="assets/img/general/Vector.svg" alt="return" onclick="contactMain()">
    </div>
    <h3 id="idTitle">Better with a team</h3>
    <div id="idBlueLine"></div>
    <div id="idContactName">
        <div id="idShortName" class="classShortName" style="background-color:${colors[i]}">
            <p id="idShortAlph" class="classShortAlph">${shortNames[i]}</p>
        </div>
        <h1 id="idH1Name">${names[i]}</h1>
    </div>
    <div id="idEditDeleteContainer">
        <div id="idSideBySide" onclick="editContact(${i})">
            <img src="assets/img/contacts/pen.svg" alt="pencil">
            <p>Edit</p>
        </div>
        <div id="idSideBySide" onclick="deleteContact(${i})">
            <img src="assets/img/contacts/bin.svg" alt="bin">
            <p>Delete</p>
        </div>
    </div>
    <div id="idContactInfoContainer">
        <h3 id="idH3Title">Contact Information</h3>
        <table>
            <tr>
                <th>Email</th>
            </tr>
            <tr>
                <td id="idMail">
                <a href="mailto:${emails[i]}">${emails[i]}</a>
            </td>
            </tr>
            <tr>
                <th>Phone</th>
            </tr>
            <tr>
                 <td id="idPhone">
                <a href="tel:${phones[i]}">${phones[i]}</a>
            </td>
            </tr>
        </table>
    </div>

<div id="idEditDeleteBtn" onclick="toggleDropdownMenu(${i})">
    <img id="idEditContactBtn" src="assets/img/contacts/3dots.svg" alt="editContact">
<div id="dropdownMenu-${i}" class="d-menu-2 dm-hidden">
    <div onclick="editContact(${i})">
        <img src="assets/img/contacts/pen.svg" alt="Edit" class="icon"> Edit
    </div>
    <div onclick="deleteContact(${i})">
        <img src="assets/img/contacts/bin.svg" alt="Delete" class="icon"> Delete
    </div>
</div>

</div>
   
</div>
    `;
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

  setTimeout(() => {
    document.getElementById("idEditContact").classList.add("show");
  }, 10);
}

function getEditContact(i) {
  return `
<div id="idEditContact">
    <img id="idXBtn" src="assets/img/contacts/close.svg" alt="close" onclick="contactMain()">
    <h1 id="idH1Title">Edit Contact</h1>
    <h3>Update your contact details</h3>
    <div id="blueLine"></div>
    <div id="idShortName-2" style="background-color: ${colors[i]}">
        <p id="idShortAlph">${shortNames[i]}</p>
    </div>
    <div>
        <div id="idInput">
            <input id="idNameEditContact" type="text" value="${names[i]}" name="name" placeholder="Name">
            <input id="idMailEditContact" type="email" value="${emails[i]}" name="email" placeholder="Email">
            <input id="idPhoneEditContact" type="tel" value="${phones[i]}" name="phone" placeholder="Phone">
        </div>
        <div id="idContactBtns">
            <button id="idDeleteBtn" class="btn btn-outline-secondary" onclick="deleteContact(${i})">
                Delete
            </button>
            <button id="idSaveEditBtn" class="btn btn-primary" onclick="saveEditContact(${i})">
                Save
                <img src="assets/img/contacts/check.svg" alt="save">
            </button>
        </div>
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
  shortNames = names.map((name) => getInitialsFromName(name));
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      color: color,
      email: mail,
      name: name,
      phone: phone,
    }),
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

async function deleteContactInDatabase(id) {
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
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Fehler: ${response.status} ${response.statusText}`);
  }
  alert("Kontakt erfolgreich gelöscht.");
}

async function putContactInDatabase(name, mail, phone, color, id) {
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      color: color,
      email: mail,
      name: name,
      phone: phone,
    }),
  });

  if (!response.ok) {
    throw new Error(`Fehler: ${response.status} ${response.statusText}`);
  }
  alert("Kontakt erfolgreich Bearbeitet.");
}

function toggleContactButtons() {
  // Werte der Eingabefelder abrufen und trimmen
  const name = document.getElementById("idNameAddContact").value.trim();
  const mail = document.getElementById("idMailAddContact").value.trim();
  const phone = document.getElementById("idPhoneAddContact").value.trim();

  // Buttons abrufen
  const deleteBtn = document.getElementById("idDeleteAddContact");
  const saveBtn = document.getElementById("idSaveAddContact");
  const submitBtn = document.getElementById("idSubmitAddContact");
  const cancelBtn = document.getElementById("idCancelAddContact");

  // Überprüfen, ob alle Felder ausgefüllt sind
  if (name && mail && phone) {
    // Delete- und Save-Button anzeigen
    deleteBtn.style.display = "block";
    saveBtn.style.display = "block";

    // Submit- und Cancel-Button ausblenden
    submitBtn.style.display = "none";
    cancelBtn.style.display = "none";
  } else {
    // Delete- und Save-Button ausblenden
    deleteBtn.style.display = "none";
    saveBtn.style.display = "none";

    // Submit- und Cancel-Button anzeigen
    submitBtn.style.display = "block";
    cancelBtn.style.display = "block";
  }
}

//von Kay hinzugefügt

function callPhoneNumber(phoneNumber) {
  window.location.href = `tel:${phoneNumber}`;
}

function openEmailClient(email) {
  window.location.href = `mailto:${email}`;
}

document.addEventListener('click', (event) => {
  // Überprüfen, ob das geklickte Element die Klasse 'NameMailShort' hat
  if (event.target.closest('.NameMailShort')) {
    // Alle vorhandenen ausgewählten Elemente zurücksetzen
    document.querySelectorAll('.NameMailShort.selected').forEach((el) => {
      el.classList.remove('selected');
    });

    // Das aktuelle Element als ausgewählt markieren
    event.target.closest('.NameMailShort').classList.add('selected');
  }
});

function toggleDropdownMenu(index) {
  const dropdown = document.getElementById(`dropdownMenu-${index}`);
  if (dropdown.classList.contains('dm-hidden')) {
      dropdown.classList.remove('dm-hidden');
  } else {
      dropdown.classList.add('dm-hidden');
  }
}
