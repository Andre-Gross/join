/**
 * Registriert einen neuen Benutzer, indem die eingegebenen Anmeldedaten
 * (Name, E-Mail, Passwort, Bestätigung des Passworts und Einwilligung in die AGB)
 * validiert und anschließend an eine Firebase-Datenbank gesendet werden.
 * 
 * Die Funktion führt folgende Schritte durch:
 * - Überprüft, ob die Allgemeinen Geschäftsbedingungen (AGB) akzeptiert wurden.
 * - Prüft, ob das eingegebene Passwort und die Bestätigung übereinstimmen.
 * - Verifiziert, ob die E-Mail bereits in der Datenbank existiert.
 * - Sendet die Daten an Firebase, falls die E-Mail noch nicht existiert,
 *   und erstellt ein neues Benutzerobjekt mit einem leeren Kontakt-Array und den Login-Daten.
 * 
 * Bei fehlerhaften Eingaben oder wenn die E-Mail bereits existiert, wird eine
 * entsprechende Warnmeldung angezeigt.
 *
 * @async
 * @function signUp
 * @returns {void} Zeigt eine Erfolgsmeldung bei erfolgreicher Registrierung oder eine Fehlermeldung bei fehlerhaften Eingaben.
 */
async function signUp() {
  const [name, email, password, confirmPassword, agreeTerms] = [
    "name",
    "email",
    "password",
    "confirmPassword",
    "agreeTerms",
  ].map(
    (id) =>
      document.getElementById(id).value || document.getElementById(id).checked
  );

  // Überprüfung, ob die AGB akzeptiert wurden
  if (!agreeTerms)
    return alert("Bitte stimme den Allgemeinen Geschäftsbedingungen zu.");

  // Überprüfung, ob das Passwort und die Passwortbestätigung übereinstimmen
  if (password !== confirmPassword)
    return alert("Die Passwörter stimmen nicht überein.");

  try {
    // Überprüfen, ob die E-Mail bereits existiert
    const response = await fetch(
      "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users.json"
    );
    const users = await response.json();

    // Prüfen, ob eine E-Mail bereits existiert
    const emailExists = Object.values(users || {}).some(
      (user) => user && user.login && user.login.email === email
    );

    if (emailExists) {
      return alert("Diese E-Mail-Adresse ist bereits registriert.");
    }

    // Wenn die E-Mail noch nicht existiert, Benutzer erstellen
    await fetch(
      "https://join-5b9f0-default-rtdb.europe-west1.firebasedatabase.app/users.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: [], // Leeres Array für Kontakte
          login: { email, name, password }, // Nur Login-Daten
        }),
      }
    );
    alert("Deine Registrierung war erfolgreich!");
  } catch (error) {
    alert("Du scheinst schon registriert zu sein, versuche dich bitte anzumelden.");
  }
}
