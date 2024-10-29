

const BASE_URL = "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users";

let user = 1;
let names = [];
let emails = [];
let phones = [];


async function contactMain() {
  await getContacts();
  let contactMain = document.getElementById("idContactMain");
  contactMain.innerHTML = "";
  for (let i = 0; i < names.length; i++) {
  contactMain.innerHTML += getContactMain(i);}
  contactMain.innerHTML += getAddContactBtn();
}


async function getContacts() {
    let contactsResponse = await getData(`/${user}/contacts.json`);
    let contactArray = contactsResponse;
  
    for (let index = 0; index < contactArray.length; index++) {
      names.push(contactArray[index].name);
      emails.push(contactArray[index].email); 
      phones.push(contactArray[index].phone);
    }
  }


async function getData(path = "") {
    let response = await fetch(BASE_URL + path);
    return (responseToJson = await response.json());
}


function getContactMain(i) {
  return `
<div id="idContactAlph">
<h4>${names[i]}</h4>
<h5>${emails[i]}</h5>
</div>`;
}

function getAddContactBtn() {
    return `
    <div id="idAddContact" onclick="addContact()">
    <img id="idImgAddContact"src="assets/img/person_add.png" alt=""></div>
    `
}


function addContact(){
    console.log("function addContact in Progress");
}
