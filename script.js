const participants = ["Christa","Ruben","Mustafa","Theo","Cordula","Neli"];
const adminName = "Mustafa";
let currentUser = "";
let tableData = {};

function loginUser() {
  const input = document.getElementById("userName").value.trim();
  const name = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();

  if (!participants.includes(name)) {
    document.getElementById("msg").textContent = "Name nicht in der Liste!";
    return;
  }

  currentUser = name;
  document.getElementById("msg").textContent = "";
  document.getElementById("login").style.display = "none";
  document.getElementById("tableContainer").style.display = "block";

  renderTable();
}

// Berechnet nächsten Mittwoch ab heute
function getNextWednesday(date = new Date()) {
  const nextWed = new Date(date);
  nextWed.setDate(date.getDate() + ((3 - date.getDay() + 7) % 7 || 7));
  return nextWed;
}

function renderTable() {
  const tbody = document.querySelector("#voteTable tbody");
  tbody.innerHTML = "";
  tableData = {};

  let date = getNextWednesday();

  for (let i = 0; i < 52; i++) { // für 52 Wochen
    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    const dateStr = date.toISOString().split("T")[0];
    tdDate.textContent = dateStr;
    tr.appendChild(tdDate);

    tableData[dateStr] = {};

    participants.forEach(p => {
      const td = document.createElement("td");
      const select = document.createElement("select");
      ["", "Ja", "Nein", "Vielleicht"].forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        select.appendChild(opt);
      });

      // Jeder kann nur seine Spalte bearbeiten, Admin darf alles
      if(currentUser !== adminName && p !== currentUser) select.disabled = true;

      select.addEventListener("change", () => {
        tableData[dateStr][p] = select.value;
      });

      // Alte Werte aus Firebase laden
      firebase.database().ref(`votes/${dateStr}/${p}`).once("value").then(snapshot => {
        if(snapshot.exists()){
          select.value = snapshot.val();
          tableData[dateStr][p] = snapshot.val();
        }
      });

      td.appendChild(select);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
    date.setDate(date.getDate() + 7);
  }
}

// Speichert alle Änderungen in Firebase
function saveAll() {
  for(let date in tableData){
    for(let p in tableData[date]){
      firebase.database().ref(`votes/${date}/${p}`).set(tableData[date][p]);
    }
  }
  alert("Alle Änderungen wurden gespeichert!");
}
