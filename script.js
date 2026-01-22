const participants = ["Christa", "Ruben", "Mustafa", "Theo", "Cordula", "Neli"];
const adminName = "Mustafa";
const adminPassword = "admin123";
let isAdmin = false;

// localStorage key
const STORAGE_KEY = "weeklyVotes";

// Admin Login
function loginAdmin() {
  const pass = document.getElementById("adminPass").value;
  if(pass === adminPassword) {
    isAdmin = true;
    document.getElementById("loginMsg").textContent = "Admin eingeloggt!";
    renderTable();
  } else {
    document.getElementById("loginMsg").textContent = "Falsches Passwort!";
  }
}

// Berechne nächsten Mittwoch
function getNextWednesday(date = new Date()) {
  const nextWed = new Date(date);
  nextWed.setDate(date.getDate() + ((3 - date.getDay() + 7) % 7 || 7));
  return nextWed.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Lade Daten
function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if(data) return JSON.parse(data);
  return {};
}

// Speichern
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(voteData));
}

// Benutzername (für Demo, kann man ändern)
function getCurrentUser() {
  if(isAdmin) return adminName;
  let user = prompt("Bitte deinen Namen eingeben:");
  if(participants.includes(user) && user !== adminName) return user;
  alert("Unbekannter Benutzer!");
  return "";
}

// Tabelle rendern
function renderTable() {
  const tbody = document.querySelector("#voteTable tbody");
  tbody.innerHTML = "";

  // Sicherstellen, dass Daten geladen sind
  voteData = loadData();

  // nächste 52 Mittwoche erzeugen
  const today = new Date();
  for(let i=0; i<52; i++){
    const date = getNextWednesday(new Date(today.getTime() + i*7*24*60*60*1000));
    if(!voteData[date]){
      voteData[date] = {};
      participants.forEach(p => voteData[date][p] = "");
    }
  }

  Object.keys(voteData).sort().forEach(date => {
    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    tdDate.textContent = date;
    tr.appendChild(tdDate);

    participants.forEach(p => {
      const td = document.createElement("td");
      const select = document.createElement("select");

      // Nur Admin oder eigener Benutzer darf bearbeiten
      select.disabled = (!isAdmin && p === adminName ? true : !isAdmin ? false : false);

      ["", "Ja", "Nein", "Vielleicht"].forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        select.appendChild(opt);
      });

      select.value = voteData[date][p];
      select.addEventListener("change", e => {
        voteData[date][p] = e.target.value;
        saveData();
      });

      td.appendChild(select);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// Initialisierung
let voteData = loadData();
renderTable();
