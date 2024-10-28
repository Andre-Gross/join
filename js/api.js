let BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';

async function loadData() {
    let response = await fetch(BASE_URL + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
}


// Funktion zum Laden eines Benutzers basierend auf der ID -->> NUR ZUM TESTEN!
// kann bei Bedarf gelöscht werden
async function loadUserData(userId) {
    let response = await fetch(`${BASE_URL}users/${userId}.json`);
    let userData = await response.json();
    return userData;
}


// async function loadData() {
//     let response = await fetch(BASE_URL + '.json');
//     let responseAsJSON = await response.json();
//     if (!responseAsJSON.users['1'].login.locked) {
//        return responseAsJSON.users['1'].login.locked; 
//     } else {
//         alert('Bitte loggen sie sich ein');
//     }
// }


