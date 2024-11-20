function calcolaPasqua(anno) {
    const a = anno % 19;
    const b = Math.floor(anno / 100);
    const c = anno % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mese = Math.floor((h + l - 7 * m + 114) / 31); // 3 = marzo, 4 = aprile
    const giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anno, mese - 1, giorno); // Mese è 0-indexed in JS
}

function tipologia_anno(anno, data) {
    const domeniche_avvento = calcolaDomenicheAvvento(anno);
    const primaDomenicaAvvento = domeniche_avvento[0];

    if (anno % 3 === 2) {
        if (data < primaDomenicaAvvento) {
            return "B";
        } else {
            return "C";
        }
    } else if (anno % 3 === 0) {
        if (data < primaDomenicaAvvento) {
            return "C";
        } else {
            return "A";
        }
    } else {
        if (data < primaDomenicaAvvento) {
            return "A";
        } else {
            return "B";
        }
    }
}

function calcolaDomenicheAvvento(anno) {
    const natale = new Date(anno, 11, 25); // 25 dicembre
    const quartaDomenicaAvvento = new Date(natale);
    quartaDomenicaAvvento.setDate(natale.getDate() - (natale.getDay() + 1)); // Domenica precedente Natale

    const terzaDomenicaAvvento = new Date(quartaDomenicaAvvento);
    terzaDomenicaAvvento.setDate(quartaDomenicaAvvento.getDate() - 6);
    const secondaDomenicaAvvento = new Date(quartaDomenicaAvvento);
    secondaDomenicaAvvento.setDate(quartaDomenicaAvvento.getDate() - 13);
    const primaDomenicaAvvento = new Date(quartaDomenicaAvvento);
    primaDomenicaAvvento.setDate(quartaDomenicaAvvento.getDate() - 20);

    return [
        primaDomenicaAvvento,
        secondaDomenicaAvvento,
        terzaDomenicaAvvento,
        quartaDomenicaAvvento
    ];
}

function calcolaQuaresima(anno) {
    const pasqua = calcolaPasqua(anno);
    const mercolediCeneri = new Date(pasqua);
    mercolediCeneri.setDate(pasqua.getDate() - 46); // 46 giorni prima della Pasqua

    const inizioQuaresima = mercolediCeneri;
    const fineQuaresima = new Date(pasqua);
    fineQuaresima.setDate(pasqua.getDate() - 7); // Domenica delle Palme

    return { inizioQuaresima, fineQuaresima };
}

function prossima_domenica(data) {
    const giorniFinoADomenica = 7 - data.getDay();
    const prossimaDomenica = new Date(data);
    prossimaDomenica.setDate(data.getDate() + giorniFinoADomenica);
    return prossimaDomenica;
}

function isBisestile(anno) {
    return (anno % 4 === 0 && anno % 100 !== 0) || (anno % 400 === 0);
}

function calcolaTempoOrdinario(anno) {
    const pasqua = calcolaPasqua(anno);
    const mercolediCeneri = new Date(pasqua);
    mercolediCeneri.setDate(pasqua.getDate() - 46); // 46 giorni prima della Pasqua

    const epifania = new Date(anno, 0, 6); // 6 gennaio
    let battesimoDelSignore;
    if (epifania.getDay() === 0) { // Se l'Epifania è di domenica
        battesimoDelSignore = new Date(epifania);
        battesimoDelSignore.setDate(epifania.getDate() + 1); // Il lunedì successivo
    } else {
        battesimoDelSignore = prossima_domenica(epifania); // Domenica successiva
    }

    const pentecoste = new Date(pasqua);
    pentecoste.setDate(pasqua.getDate() + 49); // 50 giorni dopo la Pasqua

    const cristoRe = prossima_domenica(new Date(anno, 10, 20)); // Circa fine novembre

    // Prima parte del Tempo Ordinario
    const inizioTempoOrdinario1 = new Date(battesimoDelSignore);
    inizioTempoOrdinario1.setDate(battesimoDelSignore.getDate() + 1);
    const fineTempoOrdinario1 = new Date(mercolediCeneri);
    fineTempoOrdinario1.setDate(mercolediCeneri.getDate() - 1);

    // Seconda parte del Tempo Ordinario
    const inizioTempoOrdinario2 = new Date(pentecoste);
    inizioTempoOrdinario2.setDate(pentecoste.getDate() + 1);
    const fineTempoOrdinario2 = cristoRe;

    return {
        primaParte: { inizio: inizioTempoOrdinario1, fine: fineTempoOrdinario1 },
        secondaParte: { inizio: inizioTempoOrdinario2, fine: fineTempoOrdinario2 }
    };
}

function calcolaDomenicheTempoOrdinario(anno) {
    const tempoOrdinario = calcolaTempoOrdinario(anno);
    const domeniche = [];
    let inizio = tempoOrdinario.primaParte.inizio;

    // Aggiungi tutte le domeniche della prima parte del Tempo Ordinario
    while (inizio <= tempoOrdinario.primaParte.fine) {
        domeniche.push(new Date(inizio)); // Aggiungi una copia della data
        inizio.setDate(inizio.getDate() + 7);
    }

    inizio = tempoOrdinario.secondaParte.inizio;

    // Aggiungi tutte le domeniche della seconda parte del Tempo Ordinario
    while (inizio <= tempoOrdinario.secondaParte.fine) {
        domeniche.push(new Date(inizio)); // Aggiungi una copia della data
        inizio.setDate(inizio.getDate() + 7);
    }

    // Aggiusta le date delle domeniche se è un anno bisestile
    if (isBisestile(anno)) {
        for (let i = 0; i < domeniche.length; i++) {
            const dataDomenica = domeniche[i];
            if (dataDomenica.getMonth() > 1) { // Se è dopo febbraio
                dataDomenica.setDate(dataDomenica.getDate() - 1); // Sottrai un giorno
            }
        }
    }

    return domeniche;
}

function calcolaDomenicaCorrente() {
    const oggi = new Date();
    const giorniFinoADomenica = (7 - oggi.getDay()) % 7; // Giorni fino alla prossima domenica
    const domenicaCorrente = new Date(oggi);
    domenicaCorrente.setDate(oggi.getDate() + giorniFinoADomenica); // Aggiungi giorni fino alla domenica
    return domenicaCorrente;
}

function calcolaDomenicheQuaresima(anno) {
    const quaresima = calcolaQuaresima(anno);
    const primaDomenicaQuaresima = prossima_domenica(quaresima.inizioQuaresima);

    // Array per memorizzare le cinque domeniche di Quaresima
    const domenicheQuaresima = [primaDomenicaQuaresima];

    // Calcola le altre domeniche di Quaresima
    for (let i = 1; i < 5; i++) {
        const domenica = new Date(primaDomenicaQuaresima);
        domenica.setDate(primaDomenicaQuaresima.getDate() + (i * 7)); // Aggiunge 7 giorni per ogni domenica
        domenicheQuaresima.push(domenica);
    }

    return domenicheQuaresima;
}

function calcolaFestivita(anno) {
    const pasqua = calcolaPasqua(anno);
    const domenicheAvvento = calcolaDomenicheAvvento(anno);
    const quaresima = calcolaQuaresima(anno);
    const domenicheTempoOrdinario = calcolaDomenicheTempoOrdinario(anno);
    const domenicheQuaresima = calcolaDomenicheQuaresima(anno)

    const festivita = [];

    domenicheQuaresima.forEach((domenica, index) => {
        festivita.push({ anno: tipologia_anno(anno, domenica), tipologia: "quaresima", numero: `${index + 1}`, data: domenica });
    });

    // Aggiungi Avvento
    domenicheAvvento.forEach((domenica, index) => {
        festivita.push({ anno: tipologia_anno(anno, domenica), tipologia: "avvento", numero: `${index + 1}`, data: domenica });
    });

    // Novena Immacolata
    // Calcolo della data del 29 novembre
    const dataInizioNovena = new Date(anno, 10, 29); // 29 novembre

    // Aggiungi i giorni della Novena dell'Immacolata
    // metto sempre ordinario per semplicità di implementazione
    // perché altrimenti dovrei fare un file json a parte per la novena
    // invece ho messo la novena nelle celebrazioni del tempo ordinario
    // il colore della navbar tanto viene stabilito nel json
    for (let i = 0; i < 9; i++) {
        const dataNovena = new Date(dataInizioNovena);
        dataNovena.setDate(dataNovena.getDate() + i);

        const tipologia_tempo = dataNovena < domenicheAvvento[0] ? "ordinario" : "avvento";

        festivita.push({
            anno: tipologia_anno(anno, dataNovena),
            tipologia: `${tipologia_tempo}`,
            numero: `Novena Immacolata - Giorno ${i + 1}`,
            data: dataNovena
        });
    }

    const dataSanti = new Date(anno, 10, 1);
    festivita.push({ anno: tipologia_anno(anno, dataSanti), tipologia: "ordinario", numero: 'Solennità di tutti i Santi', data: dataSanti });

    const cristoRe = new Date(domenicheAvvento[0]);
    cristoRe.setDate(domenicheAvvento[0].getDate() - 7); // Sottrai 3 giorni
    festivita.push({ anno: tipologia_anno(anno, cristoRe), tipologia: "ordinario", numero: 'Solennità di Cristo Re', data: cristoRe });

    // Aggiungi inizio e fine Quaresima
    festivita.push({ anno: tipologia_anno(anno, quaresima.inizioQuaresima), tipologia: "quaresima", numero: 'Mercoledì delle Ceneri', data: quaresima.inizioQuaresima });
    festivita.push({ anno: tipologia_anno(anno, quaresima.fineQuaresima), tipologia: "quaresima", numero: 'Domenica delle Palme', data: quaresima.fineQuaresima });

    // Aggiungi domeniche del Tempo Ordinario
    domenicheTempoOrdinario.forEach((domenica, index) => {
        festivita.push({ anno: tipologia_anno(anno, domenica), tipologia: "ordinario", numero: `${index + 1}`, data: domenica });
    });

    festivita.push({ anno: tipologia_anno(anno, new Date(anno, 11, 24)), tipologia: "natale", numero: "Vigilia di Natale", data: new Date(anno, 11, 24) })
    festivita.push({ anno: tipologia_anno(anno, new Date(anno, 11, 25)), tipologia: "natale", numero: "Natale", data: new Date(anno, 11, 25) })
    festivita.push({ anno: tipologia_anno(anno, new Date(anno, 11, 26)), tipologia: "natale", numero: "Santo Stefano", data: new Date(anno, 11, 26) })
    festivita.push({ anno: tipologia_anno(anno, new Date(anno + 1, 0, 1)), tipologia: "natale", numero: "Maria Santissima Madre di Dio", data: new Date(anno + 1, 0, 1) })
    festivita.push({ anno: tipologia_anno(anno, new Date(anno + 1, 0, 6)), tipologia: "natale", numero: "Epifania", data: new Date(anno + 1, 0, 6) })


    // Aggiungi Pasqua
    const giovediSanto = new Date(pasqua);
    giovediSanto.setDate(pasqua.getDate() - 3); // Sottrai 3 giorni

    const venerdiSanto = new Date(pasqua);
    venerdiSanto.setDate(pasqua.getDate() - 2); // Sottrai 2 giorni

    const sabatoSanto = new Date(pasqua);
    sabatoSanto.setDate(pasqua.getDate() - 1); // Sottrai 1 giorni

    festivita.push({ anno: tipologia_anno(anno, giovediSanto), tipologia: "pasqua", numero: 'Giovedì Santo', data: giovediSanto });
    festivita.push({ anno: tipologia_anno(anno, venerdiSanto), tipologia: "pasqua", numero: 'Venerdì Santo', data: venerdiSanto });
    festivita.push({ anno: tipologia_anno(anno, sabatoSanto), tipologia: "pasqua", numero: 'Sabato Santo', data: sabatoSanto });
    festivita.push({ anno: tipologia_anno(anno, pasqua), tipologia: "pasqua", numero: 'Pasqua', data: pasqua });

    festivita.sort((a, b) => a.data - b.data);

    return festivita;
}

const oggi = new Date();
oggi.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
const festivita = calcolaFestivita(oggi.getFullYear());
const prox_festivita = festivita.find(f => new Date(f.data) >= oggi);

function avvia_index() {
    localStorage.setItem("theme-navbar", prox_festivita.tipologia)
    setNavbarColor(prox_festivita.tipologia)

    setDarkTheme()

    const prox_celebrazioni = [];

    for (const festivitaItem of festivita) {
        if (festivitaItem.data >= oggi) {
            console.log(festivitaItem);
            prox_celebrazioni.push(festivitaItem);
            if (prox_celebrazioni.length === 8) {
                break;
            }
        }
    }

    //setNavbarColor(prox_celebrazioni[0].tipologia)

    for (const festa of prox_celebrazioni) {
        inserisci_elemento_lista(festa.numero, festa.anno, festa.tipologia);
    }
}

function setDarkTheme() {
    window.onload = function () {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
}

function setNavBarTheme() {
    window.onload = function () {
        const savedTheme = localStorage.getItem('theme-navbar');
        navbar.style.backgroundColor = savedTheme;
    }
}

function inserisci_elemento_lista(numero, anno, tipologia) {
    const ul = document.querySelector('.prossime-celebrazioni-div ul');
    const li = document.createElement('li');

    if (numero.includes("Novena Immacolata")) {
        console.log(numero);
        li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=${tipologia}">${numero} - anno: ${anno}</a>`;
    }
    if (tipologia === "ordinario" && !numero.includes("Novena Immacolata")) {
        if (numero === "Solennità di Cristo Re") {
            li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=ordinario">${numero} - anno: ${anno}</a>`;
        } else if (numero === "Solennità di tutti i Santi") {
            li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=ordinario">${numero} - anno: ${anno}</a>`;
        } else {
            li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=ordinario">${convertiInRomano(numero)} domenica tempo ordinario - anno: ${anno}</a>`;
        }
    } else if (tipologia === "avvento" && !numero.includes("Novena Immacolata")) {
        li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=avvento">${convertiInRomano(numero)} domenica tempo d'avvento - anno: ${anno}</a>`;
    } else if (tipologia === "natale") {
        li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=natale">${numero}</a>`;
    } else if (numero === "Mercoledì delle Ceneri") {
        li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=ceneri">${numero}</a>`;
    } else if (tipologia === "quaresima") {
        li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=quaresima">${convertiInRomano(numero)} domenica tempo di quaresima - anno: ${anno}</a>`;
    } else if (tipologia === "pasqua") {
        li.innerHTML = `<a href="celebrazioni.html?numero=${numero}&anno=${anno}&festivita=pasqua">${numero}</a>`;
    }
    ul.appendChild(li);
}


function setNavbarColor(tipologia, page) {
    const navbar = document.getElementById('myNavbar');
    if (page === "risultati") {
        const table = document.querySelector('#resultsTable thead tr');
        switch (tipologia) {
            case "ordinario":
                table.style.backgroundColor = '#2a9a5c'; // Verde
                break;
            case "avvento":
                table.style.backgroundColor = '#8A2BE2'; // Viola
                break;
            case "quaresima":
                table.style.backgroundColor = '#8A2BE2'; // Viola
                break;
        }

    }
    switch (tipologia) {
        case "ordinario":
            navbar.style.backgroundColor = '#2a9a5c'; // Verde
            break;
        case "avvento":
            navbar.style.backgroundColor = '#8A2BE2'; // Viola
            break;
        case "quaresima":
            navbar.style.backgroundColor = '#8A2BE2'; // Viola
            break;
    }
}

function toggleMenu() {
    const navbar = document.getElementById('myNavbar');
    navbar.classList.toggle('active');
}

function convertiInRomano(numero) {
    if (numero < 1 || numero > 33) return "Numero non valido";

    const numeriRomani = [
        ["I", "IV", "V", "IX"],
        ["X", "XL", "L", "XC"],
        ["C", "CD", "D", "CM"]
    ];

    let romano = "";
    let cifra = 0;

    while (numero > 0) {
        const n = numero % 10;
        if (n !== 0) {
            if (n <= 3) {
                romano = numeriRomani[cifra][0].repeat(n) + romano;
            } else if (n === 4) {
                romano = numeriRomani[cifra][1] + romano;
            } else if (n <= 8) {
                romano = numeriRomani[cifra][2] + numeriRomani[cifra][0].repeat(n - 5) + romano;
            } else if (n === 9) {
                romano = numeriRomani[cifra][3] + romano;
            }
        }
        numero = Math.floor(numero / 10);
        cifra++;
    }

    return romano;
}