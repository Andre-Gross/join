let names = [];
let emails = [];
let phones = [];
let colors = [];
let shortNames = [];
let ids = [];

let toastMessageAddContact ='<span>Contact successfully created</span>';
let toastMessageEditContact ='<span>Contact successfully edited</span>';
let toastMessageDeleteContact ='<span>Contact successfully deleted</span>';

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
    if (!contactsArray[index].name) continue; // Überspringt fehlerhafte Einträge
    emails.push(contactsArray[index].email || "");
    names.push(contactsArray[index].name);
    phones.push(contactsArray[index].phone || "");
    colors.push(contactsArray[index].color || "#ccc");
  }

  await sortContacts();
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
  document.getElementById("overlay").classList.remove("show"); 
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
    contactMain();
    document.getElementById("overlay").classList.remove("show"); 
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

