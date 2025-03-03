// Configura Firebase (inserisci le tue credenziali)
const firebaseConfig = {
    apiKey: "AIzaSyA7P7Ln_7uyn48w8xIbyostg-HjbpYkRTg",
    authDomain: "luganogestione.firebaseapp.com",
    projectId: "luganogestione",
    storageBucket: "luganogestione.firebasestorage.app",
    messagingSenderId: "688116369162",
    appId: "1:688116369162:web:e3ab9df0147d3216fb1cf3",
    measurementId: "G-78CKG3S2NC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.getElementById("nuovoConto").addEventListener("click", function () {
    document.getElementById("modal").style.display = "block";
});

document.getElementById("chiudiModal").addEventListener("click", function () {
    document.getElementById("modal").style.display = "none";
});

document.getElementById("confermaConto").addEventListener("click", function () {
    const nome = document.getElementById("nomeConto").value.trim();
    if (nome) {
        const nuovoConto = db.ref("conti").push();
        nuovoConto.set({ nome: nome, saldo: 0 });
        document.getElementById("modal").style.display = "none";
        document.getElementById("nomeConto").value = "";
    }
});

// Funzione per aggiornare la lista dei conti
db.ref("conti").on("value", (snapshot) => {
    const contiList = document.getElementById("contiList");
    contiList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const conto = childSnapshot.val();
        const contoID = childSnapshot.key;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${conto.nome}</td>
            <td>${conto.saldo.toFixed(2)}</td>
            <td>
                <button class="add" data-id="${contoID}">Aggiungi</button>
                <button class="withdraw" data-id="${contoID}">Preleva</button>
            </td>
        `;
        contiList.appendChild(row);
    });

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
