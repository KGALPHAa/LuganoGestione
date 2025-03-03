// Configura Firebase (inserisci le tue credenziali)
const firebaseConfig = {
    apiKey: "TUO_API_KEY",
    authDomain: "TUO_AUTH_DOMAIN",
    databaseURL: "TUO_DATABASE_URL",
    projectId: "TUO_PROJECT_ID",
    storageBucket: "TUO_STORAGE_BUCKET",
    messagingSenderId: "TUO_MESSAGING_SENDER_ID",
    appId: "TUO_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Mostra la modale per creare un nuovo conto
document.getElementById("nuovoConto").addEventListener("click", function () {
    document.getElementById("modal").style.display = "block";
});

// Chiudi la modale
document.getElementById("chiudiModal").addEventListener("click", function () {
    document.getElementById("modal").style.display = "none";
});

// Aggiungi un nuovo conto
document.getElementById("confermaConto").addEventListener("click", function () {
    const nome = document.getElementById("nomeConto").value.trim();
    if (nome) {
        const nuovoConto = db.ref("conti").push();
        nuovoConto.set({ nome: nome, saldo: 0 });
        document.getElementById("modal").style.display = "none";
        document.getElementById("nomeConto").value = "";
    }
});

// Aggiorna la lista dei conti in tempo reale
db.ref("conti").on("value", (snapshot) => {
    const contiList = document.getElementById("contiList");
    contiList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const conto = childSnapshot.val();
        const contoID = childSnapshot.key;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${conto.nome}</td>
            <td>€ ${conto.saldo.toFixed(2)}</td>
            <td>
                <button class="add" data-id="${contoID}">Aggiungi</button>
                <button class="withdraw" data-id="${contoID}">Preleva</button>
            </td>
        `;
        contiList.appendChild(row);
    });

    // Aggiunta saldo
    document.querySelectorAll(".add").forEach((button) => {
        button.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            let importo = prompt("Inserisci importo da aggiungere (€):");
            if (importo) {
                importo = parseFloat(importo);
                if (!isNaN(importo) && importo > 0) {
                    db.ref("conti/" + id).once("value", (snapshot) => {
                        let nuovoSaldo = snapshot.val().saldo + importo;
                        db.ref("conti/" + id).update({ saldo: nuovoSaldo });
                    });
                }
            }
        });
    });

    // Prelievo saldo
    document.querySelectorAll(".withdraw").forEach((button) => {
        button.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            let importo = prompt("Inserisci importo da prelevare (€):");
            if (importo) {
                importo = parseFloat(importo);
                if (!isNaN(importo) && importo > 0) {
                    db.ref("conti/" + id).once("value", (snapshot) => {
                        let nuovoSaldo = snapshot.val().saldo - importo;
                        if (nuovoSaldo >= 0) {
                            db.ref("conti/" + id).update({ saldo: nuovoSaldo });
                        } else {
                            alert("Saldo insufficiente!");
                        }
                    });
                }
            }
        });
    });
});
