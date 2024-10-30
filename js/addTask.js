let contactsInitialized = false;


async function filterContacts() {
    const input = document.getElementById("navAssignedTo").value.toLowerCase();
    const dropdown = document.getElementById("contactDropdown");
    let contacts = await loadContacts();

    dropdown.innerHTML = "";

    // Filtere Kontakte nur, wenn eine Eingabe vorhanden ist, ansonsten alle Kontakte anzeigen
    const filteredContacts = input ? contacts.filter(contact =>
        contact.name.toLowerCase().includes(input)
    ) : contacts;

    // Zeige Kontakte im Dropdown an, wenn gefilterte oder alle Kontakte vorhanden sind
    if (filteredContacts.length > 0) {
        showContactsDropdown(); // Dropdown anzeigen
        filteredContacts.forEach(contact => {
            const contactItem = document.createElement("div");
            contactItem.className = "contact-item";
            contactItem.innerHTML = `
                ${contact.name}
                <input type="checkbox" id="contact_${contact.name.replace(/\s+/g, '_')}">
            `;
            contactItem.onclick = () => selectContact(contact);
            dropdown.appendChild(contactItem);
        });
    } else {
        hideContactsDropdown(); // Dropdown ausblenden, wenn keine Kontakte übrig sind
    }
}


async function createContactsDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    let contacts = await loadContacts();

    dropdown.innerHTML = "";

    contacts.forEach(contact => {
        const contactItem = document.createElement("div");
        contactItem.className = "contact-item";
        contactItem.innerHTML = `
            <span>${contact.name}</span>
            <input type="checkbox" id="contact_${contact.name.replace(/\s+/g, '_')}">
        `;
        dropdown.appendChild(contactItem);
    });

    contactsInitialized = true; // Setze das Flag auf true, nachdem die Kontakte initialisiert wurden
}

// Funktion zur Anzeige des Dropdown-Menüs
async function showContactsDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    const arrowDown = document.getElementById("arrowDown");
    const arrowUp = document.getElementById("arrowUp");

    if (!contactsInitialized) {
        await createContactsDropdown(); // Erstelle das Dropdown, wenn es noch nicht initialisiert wurde
    }

    dropdown.classList.remove("d-none"); // Zeige das Dropdown an
    arrowDown.classList.add("d-none");
    arrowUp.classList.remove("d-none");
}


function hideContactsDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    const arrowDown = document.getElementById("arrowDown");
    const arrowUp = document.getElementById("arrowUp");

    dropdown.classList.add("d-none"); // Blende das Dropdown aus
    arrowDown.classList.remove("d-none"); // Zeige den nach unten zeigenden Pfeil
    arrowUp.classList.add("d-none"); // Verstecke den nach oben zeigenden Pfeil
}


function selectPriority(priority) {
    // Entferne die aktive Klasse von allen Schaltflächen
    document.getElementById("urgent").classList.remove("btn-selected");
    document.getElementById("medium").classList.remove("btn-selected");
    document.getElementById("low").classList.remove("btn-selected");

    // Füge die aktive Klasse zur ausgewählten Schaltfläche hinzu
    document.getElementById(priority).classList.add("btn-selected");
}

// Funktion, um den aktuellen Prioritätswert zu erhalten
function getSelectedPriority() {
    if (document.getElementById("urgent").classList.contains("btn-selected")) return "urgent";
    if (document.getElementById("medium").classList.contains("btn-selected")) return "medium";
    if (document.getElementById("low").classList.contains("btn-selected")) return "low";
    return null; // Wenn keine Schaltfläche ausgewählt ist
}