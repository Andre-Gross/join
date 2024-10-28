let BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';
let loggedInUser = '2';

async function loadData() {
    let response = await fetch(BASE_URL + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


async function loadContacts() {
    let response = await fetch(BASE_URL + 'users/' + loggedInUser + '/contacts' + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}