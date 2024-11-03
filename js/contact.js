
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
    <img id="idImgAddContact"src="assets/img/person_add.png" alt=""></div>
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
            <img alt="x" onclick="contactMain()">
            <h1>Add contact</h1>
            <h3>Tasks are better with a team!</h3>
            <div id="blueline"><div>
        </div>
        <img>
        <div>
            <div>
                <input type="text" name="name" placeholder="Name">
                <input type="email" name="email" placeholder="Email">
                <input type="number" name="phone" placeholder="Phone">
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
        <h1>Contacts</h1><img alt="return" onclick="contactMain()">
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
                <img alt="editContact" onclick="EditContactBtn()">
            </div>
    </div>
    `
}


function EditContactBtn() {
    let EditContactBtn = document.getElementById("idEditDeleteBtn");
    EditContactBtn.innerHTML += getEditContactBtn();
}


function getEditContactBtn() {
    return `
    <div>
        <div>
            <img alt="pencil">
            <p>Edit</p>
        </div>
        <div>
            <img alt="bin">
            <p>Delete</p>
        </div>
    </div>
    `
}


function submitAddContact(){
    console.log("Submit new Contact in Progress");
}


function notifSucess(){
    return `
    <div>Contact successfully created</div>
    `
}
