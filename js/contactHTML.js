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