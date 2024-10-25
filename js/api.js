let BASE_URL = 'https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/';
let loggedInUser = '1';


async function loadData() {
    let response = await fetch(BASE_URL + '.json');
    let responseAsJSON = await response.json();
    return responseAsJSON;
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


