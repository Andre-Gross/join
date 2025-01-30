let names = [];
let emails = [];
let phones = [];
let colors = [];
let shortNames = [];
let ids = [];

let toastMessageAddContact ='<span>Contact successfully created</span>';
let toastMessageEditContact ='<span>Contact successfully edited</span>';
let toastMessageDeleteContact ='<span>Contact successfully deleted</span>';
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

/**
 * Main function to load and display contacts.
 */
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

  let currentLetter = "";

  for (let i = 0; i < names.length; i++) {
    let firstLetter = names[i][0].toUpperCase(); 

    if (firstLetter !== currentLetter) {
      contactMain.innerHTML += `
        <h2>${firstLetter}</h2>
        <div id="idGreyLine"></div>
      `;
      currentLetter = firstLetter;
    }

    contactMain.innerHTML += getContactMain(i);
  }

  contactMain.innerHTML += getAddContactBtn();
}


/**
 * Loads contacts from the database and initializes arrays.
 */
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


/**
 * Generates HTML for a contact entry.
 * @param {number} i - Index of the contact.
 * @returns {string} - HTML string for the contact entry.
 */
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
 * Generates HTML for the "Add Contact" button.
 * @returns {string} - HTML string for the "Add Contact" button.
 */
function getAddContactBtn() {
  return `
    <div id="idAddContactBtn" onclick="addContact()">
    <img id="idImgAddContact" src="assets/img/contacts/person-add.svg" alt=""></div>
    `;
}


/**
 * Displays the "Add Contact" form.
 */
function addContact() {
  let addContact = document.getElementById("idContactMain");
  addContact.innerHTML += getAddContact();
}


/**
 * Generates HTML for the "Add Contact" form.
 * @returns {string} - HTML string for the "Add Contact" form.
 */
function getAddContact() {
  return `
<div id="idAddContact">
    <img id="idXBtn" src="assets/img/contacts/close.svg" alt="x" onclick="closeAddContact()">
    <img id="idLogoCard" src="./assets/img/general/join-logo.svg" alt="logo">
    <div id="headTitle">
    <h1 id="idH1Title">Add contact</h1>
    <h3>Tasks are better with a team!</h3>
    <div id="blueLine"></div>
    </div>
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


/**
 * Displays the "Add Contact" form.
 */
function addContact() {
  let addContact = document.getElementById("idContactMain");
  addContact.innerHTML += getAddContact();

  document.getElementById("overlay").classList.add("show");

  setTimeout(() => {
      document.getElementById("idAddContact").classList.add("show");
  }, 10);
}


/**
 * Closes the "Add Contact" form.
 */
function closeAddContact() {
  let addContactElement = document.getElementById("idAddContact");
  if (addContactElement) {
      addContactElement.remove();
  }
  document.getElementById("overlay").classList.remove("show"); // Overlay ausblenden
}


/**
 * Sorts contacts alphabetically by name.
 */
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


/**
 * Opens the contact view for a specific contact.
 * @param {number} i - Index of the contact.
 */
function openContact(i) {
  let openContact = document.getElementById("idContactMain");

  if (window.innerWidth < 1100) {
    openContact.innerHTML = "";
    openContact.innerHTML += getContactView(i);
  } else {
    let existingView = document.getElementById("idViewContactCard");
    if (existingView) {
      existingView.remove(); 
    }

    let contactViewContainer = document.createElement("div");
    contactViewContainer.id = "idViewContactCard";
    contactViewContainer.innerHTML = getContactView(i);
    document.body.appendChild(contactViewContainer);
  }
}


/**
* Generates HTML for the contact view.
* @param {number} i - Index of the contact.
* @returns {string} - HTML string for the contact view.
*/
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


/**
 * Generates HTML for the edit and delete buttons.
 * @param {number} i - Index of the contact.
 * @returns {string} - HTML string for the edit and delete buttons.
 */
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


/**
 * Opens the edit contact form for a specific contact.
 * @param {number} i - Index of the contact.
 */
function editContact(i) {
  const existingEditModal = document.getElementById("idEditContact");
  if (existingEditModal) {
      existingEditModal.remove();
  }

  let editContactModal = document.createElement("div");
  editContactModal.id = "idEditContact";
  editContactModal.innerHTML = getEditContact(i);
  document.body.appendChild(editContactModal);

  document.getElementById("overlay").classList.add("show");

  setTimeout(() => {
      editContactModal.classList.add("show");
  }, 10);
}


/**
 * Generates HTML for the edit contact form.
 * @param {number} i - Index of the contact.
 * @returns {string} - HTML string for the edit contact form.
 */
function getEditContact(i) {
  return `
<img id="idXBtn" src="assets/img/contacts/close.svg" alt="close" onclick="closeEditContact()">
<img id="idLogoCard" src="./assets/img/general/join-logo.svg" alt="logo">
<div id="headTitle">
    <h1 id="idH1Title">Edit Contact</h1>
    <div id="blueLine"></div>
</div>
<div id="idShortName-2" style="background-color: ${colors[i]}">
    <p id="idShortAlph" class="editShortAlph">${shortNames[i]}</p>
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
  `;
}


/**
 * Closes the edit contact form.
 */
function closeEditContact() {
  const editContactModal = document.getElementById("idEditContact");
  if (editContactModal) {
      editContactModal.remove();
  }
  document.getElementById("overlay").classList.remove("show"); // Overlay ausblenden
}


/**
 * Closes both the add and edit contact forms.
 */
function closeOverlay() {
  closeAddContact();
  closeEditContact();
}


/**
 * Submits the new contact to the database.
 */
function submitAddContact() {
  let name = document.getElementById("idNameAddContact").value;
  let mail = document.getElementById("idMailAddContact").value;
  let phone = document.getElementById("idPhoneAddContact").value;
  let color = getRandomColor();

  postContactToDatabase(name, mail, phone, color);

  showToast(toastMessageAddContact, 'middle', 1000);

  setTimeout(() => {
    window.location.reload();
  }, 1000);
}


/**
 * Deletes a contact from the database.
 * @param {number} i - Index of the contact.
 */
async function deleteContact(i) {
  let id = ids[i];
  await deleteContactInDatabase(id);

  showToast(toastMessageDeleteContact, 'middle', 1000);

  setTimeout(() => {
    window.location.reload();
  }, 1000);
}


/**
* Saves the edited contact to the database.
* @param {number} i - Index of the contact.
*/
function saveEditContact(i) {
  let name = document.getElementById("idNameEditContact").value;
  let mail = document.getElementById("idMailEditContact").value;
  let phone = document.getElementById("idPhoneEditContact").value;
  let color = colors[i];
  let id = ids[i];
  putContactInDatabase(name, mail, phone, color, id);
  showToast(toastMessageEditContact, 'middle', 1000);
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}


/**
 * Generates short names (initials) for all contacts.
 */
async function shortName() {
  shortNames = names.map((name) => getInitialsFromName(name));
}


/**
 * Posts a new contact to the database.
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 */
async function postContactToDatabase(name, mail, phone, color) {
  try {
    tryPostContactToDatabase(name, mail, phone, color);
  } catch (error) {
    console.error("Fehler beim Speichern des Kontaktes", error);
    alert("Beim Speichern des Kontaktes ist ein Fehler aufgetreten.");
  }
}


/**
 * Tries to post a new contact to the database.
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 * @throws Will throw an error if the request fails.
 */
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
}


/**
 * Gets a random color from the predefined list.
 * @returns {string} - A random color.
 */
function getRandomColor() {
  let randomIndex = Math.floor(Math.random() * COLORS.length);
  return COLORS[randomIndex];
}

/**
 * Deletes a contact from the database.
 * @param {string} id - ID of the contact.
 */
async function deleteContactInDatabase(id) {
  try {
    tryDeleteContactInDatabase(id);
  } catch (error) {
    console.error("Fehler beim Löschen des Kontaktes:", error);
    alert("Beim Löschen des Kontaktes ist ein Fehler aufgetreten.");
  }
}


/**
 * Tries to delete a contact from the database.
 * @param {string} id - ID of the contact.
 * @throws Will throw an error if the request fails.
 */
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

}


/**
 * Updates a contact in the database.
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 * @param {string} id - ID of the contact.
 */
async function putContactInDatabase(name, mail, phone, color, id) {
  try {
    tryPutContactInDatabase(name, mail, phone, color, id);
  } catch (error) {
    console.error("Fehler beim Bearbeiten des Kontaktes:", error);
    alert("Beim Bearbeiten des Kontaktes ist ein Fehler aufgetreten.");
  }
}


/**
 * Tries to update a contact in the database.
 * @param {string} name - Name of the contact.
 * @param {string} mail - Email of the contact.
 * @param {string} phone - Phone number of the contact.
 * @param {string} color - Color associated with the contact.
 * @param {string} id - ID of the contact.
 * @throws Will throw an error if the request fails.
 */
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
}


/**
 * Toggles the visibility of contact buttons based on input values.
 */
function toggleContactButtons() {
  const name = document.getElementById("idNameAddContact").value.trim();
  const mail = document.getElementById("idMailAddContact").value.trim();
  const phone = document.getElementById("idPhoneAddContact").value.trim();

  const deleteBtn = document.getElementById("idDeleteAddContact");
  const saveBtn = document.getElementById("idSaveAddContact");
  const submitBtn = document.getElementById("idSubmitAddContact");
  const cancelBtn = document.getElementById("idCancelAddContact");

  if (name && mail && phone) {
    deleteBtn.style.display = "block";
    saveBtn.style.display = "block";

    submitBtn.style.display = "none";
    cancelBtn.style.display = "none";
  } else {
    deleteBtn.style.display = "none";
    saveBtn.style.display = "none";

    submitBtn.style.display = "block";
    cancelBtn.style.display = "block";
  }
}


/**
 * Initiates a phone call to the given phone number.
 * @param {string} phoneNumber - Phone number to call.
 */
function callPhoneNumber(phoneNumber) {
  window.location.href = `tel:${phoneNumber}`;
}


/**
 * Opens the default email client with the given email address.
 * @param {string} email - Email address to send to.
 */
function openEmailClient(email) {
  window.location.href = `mailto:${email}`;
}


/**
 * Adds a 'selected' class to the clicked contact entry.
 */
document.addEventListener('click', (event) => {
  if (event.target.closest('.NameMailShort')) {
    document.querySelectorAll('.NameMailShort.selected').forEach((el) => {
      el.classList.remove('selected');
    });
    event.target.closest('.NameMailShort').classList.add('selected');
  }
});


/**
* Toggles the visibility of the dropdown menu for a specific contact.
* @param {number} index - Index of the contact.
*/
function toggleDropdownMenu(index) {
  const dropdown = document.getElementById(`dropdownMenu-${index}`);
  if (dropdown.classList.contains('dm-hidden')) {
      dropdown.classList.remove('dm-hidden');
  } else {
      dropdown.classList.add('dm-hidden');
  }
}
