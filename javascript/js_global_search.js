document.getElementById("global_search").addEventListener("keyup", searchCanti);

async function searchCanti(event, page) {
    const input = document.getElementById("global_search").value.toLowerCase().trim();

    // Salva l'input nella memoria locale
    localStorage.setItem("searchInput", input);

    let jsonFile = "";
    let linkRisultati = "";

    if (event.key === "Enter" || event.type === "click") {
        if (input.includes("salmo")) {
            // Determina il percorso del file JSON e il link ai risultati in base alla pagina
            if (page === "index" || page === "celebrazioni") {
                jsonFile = "db/salmi/elenco_salmi.json";
                linkRisultati = "nav-bar/risultati.html";
            } else if (page === "anno") {
                jsonFile = "../../db/salmi/elenco_salmi.json";
                linkRisultati = "../risultati.html";
            } else {
                jsonFile = "../db/salmi/elenco_salmi.json";
                linkRisultati = "risultati.html";
            }

            try {
                const response = await fetch(jsonFile);
                const data = await response.json();
                const salmi = data.salmi;

                const words = input.split(" ");
                const filters = { number: null, romanNumber: null, year: null, season: null };

                // Analizza l'input per numero arabo, numero romano, anno e tempo liturgico
                words.forEach(word => {
                    if (/^\d+$/.test(word)) {
                        filters.number = word; // Numero arabo
                    } else if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx|xxi|xxii|xxiii|xxiv|xxv|xxvi|xxvii|xxviii|xxix|xxx|xxxi|xxxii|xxxiii)$/i.test(word)) {
                        filters.romanNumber = word.toLowerCase(); // Numero romano
                    } else if (["a", "b", "c"].includes(word)) {
                        filters.year = word.toUpperCase(); // Anno
                    } else if (["ordinario", "quaresima", "pasqua", "avvento"].includes(word)) {
                        filters.season = word; // Tempo liturgico
                    }
                });

                // Filtra i salmi in base ai criteri
                const results = salmi.filter(salmo => {
                    const matchesTitle = salmo.titolo.toLowerCase().includes("salmo");
                    const matchesNumber = filters.number ? salmo.numero_arabo === filters.number : true;
                    const matchesRomanNumber = filters.romanNumber ? salmo.numero_romano === filters.romanNumber : true;
                    const matchesYear = filters.year ? salmo.anno === filters.year : true;
                    const matchesSeason = filters.season ? salmo.titolo.toLowerCase().includes(filters.season) : true;

                    return matchesTitle && matchesNumber && matchesRomanNumber && matchesYear && matchesSeason;
                });

                // Salva i risultati in localStorage
                localStorage.setItem("searchResults", JSON.stringify(results));
                localStorage.setItem("tipologia", "salmo");

                // Reindirizza alla pagina dei risultati
                window.location.href = linkRisultati;
            } catch (error) {
                console.error("Errore nel caricamento del file JSON:", error);
            }
        } else if (input.includes("messa") || input.includes("celebrazione") || input.includes("domenica") || input.includes("solennità")) {
            const jsonPaths = {
                "ordinario": "db/tempi_liturgici/tempo_ordinario/*.json",
                "avvento": "db/tempi_liturgici/avvento/*.json",
                "quaresima": "db/tempi_liturgici/quaresima/*.json"
            };

            let arabicNumbers = input.match(/\b(\d+)\b/g); // Trova i numeri arabi nell'input
            let numeriRomani = input.match(/\b([ivxlc]+)\b/gi); // Trova i numeri romani nell'input

            let found = false; // Variabile per controllare se è stato trovato un percorso

            // Variabile per l'anno
            let anno = '';

            // Controlla l'input per trovare il tempo liturgico e l'anno
            for (const [key, value] of Object.entries(jsonPaths)) {
                if (input.includes(key)) {
                    jsonFile = (page === "index" || page === "celebrazioni") ? value
                        : (page === "anno") ? "../../" + value
                            : "../" + value;

                    found = true;
                    break;
                }
            }

            // Verifica se l'input contiene l'anno (a, b, c)
            const match = input.match(/\b([abc])\b/); // Trova l'anno
            if (match) {
                anno = match[1].toLowerCase(); // Prendi l'anno trovato
            }

            let results = []; // o un altro valore iniziale appropriato

            if (found && anno) {
                jsonFile = jsonFile.replace('*.json', `celebrazioni_anno_${anno}.json`);
                results = await cerca(jsonFile, arabicNumbers, numeriRomani, anno); // Costruisci il percorso JSON completo
            } else if (!anno) {
                // Se non abbiamo trovato il valore anno itera su tutti i file
                const jsonFile_a = jsonFile.replace('*.json', `celebrazioni_anno_a.json`);
                results = results.concat(await cerca(jsonFile_a, arabicNumbers, numeriRomani, 'a'));
                const jsonFile_b = jsonFile.replace('*.json', `celebrazioni_anno_b.json`);
                results = results.concat(await cerca(jsonFile_b, arabicNumbers, numeriRomani, 'b'));
                const jsonFile_c = jsonFile.replace('*.json', `celebrazioni_anno_c.json`);
                results = results.concat(await cerca(jsonFile_c, arabicNumbers, numeriRomani, 'c'));
            }

            // Imposta il link dei risultati
            linkRisultati = (page === "index" || page === "celebrazioni") ? "nav-bar/risultati.html"
                : (page === "anno") ? "../risultati.html"
                    : "risultati.html";

            // Stampa i risultati
            if (results.length > 0) {
                localStorage.setItem("searchResults", JSON.stringify(results));
                localStorage.setItem("tipologia", "messa");

                // Reindirizza alla pagina dei risultati
                window.location.href = linkRisultati;
            } else {
                document.getElementById("resultsContainer").innerHTML = "<div>Nessun risultato trovato</div>"
                console.log("Nessun risultato trovato.");
            }
        } else if (input.includes("novena")) { // cerca in celebrazioni fisse
            if (page === "index" || page === "celebrazioni") {
                jsonFile = "db/tempi_liturgici/celebrazioni_fisse.json";
                linkRisultati = "nav-bar/risultati.html";
            } else if (page === "anno") {
                jsonFile = "../../db/tempi_liturgici/celebrazioni_fisse.json";
                linkRisultati = "../risultati.html";
            } else {
                jsonFile = "../db/tempi_liturgici/celebrazioni_fisse.json";
                linkRisultati = "risultati.html";
            }

            let arabicNumbers = input.match(/\b(\d+)\b/g); // Trova i numeri arabi nell'input
            let numeriRomani = input.match(/\b([ivxlc]+)\b/gi); // Trova i numeri romani nell'input

            let anno = '';

            // Verifica se l'input contiene l'anno (a, b, c)
            const match = input.match(/\b([abc])\b/); // Trova l'anno
            if (match) {
                anno = match[1].toLowerCase(); // Prendi l'anno trovato
            }

            let results = []; // o un altro valore iniziale appropriato


            if (anno) {
                results = await cerca(jsonFile, arabicNumbers, numeriRomani, anno); // Costruisci il percorso JSON completo
            } else if (!anno) {
                // Se non abbiamo trovato il valore anno itera su tutti i file
                results = results.concat(await cerca(jsonFile, arabicNumbers, numeriRomani, 'a'));
                results = results.concat(await cerca(jsonFile, arabicNumbers, numeriRomani, 'b'));
                results = results.concat(await cerca(jsonFile, arabicNumbers, numeriRomani, 'c'));
            }

            // Imposta il link dei risultati
            linkRisultati = (page === "index" || page === "celebrazioni") ? "nav-bar/risultati.html"
                : (page === "anno") ? "../risultati.html"
                    : "risultati.html";

            // Stampa i risultati
            if (results.length > 0) {
                localStorage.setItem("searchResults", JSON.stringify(results));
                localStorage.setItem("tipologia", "messa");

                // Reindirizza alla pagina dei risultati
                window.location.href = linkRisultati;
            } else {
                document.getElementById("resultsContainer").innerHTML = "<div>Nessun risultato trovato</div>"
                console.log("Nessun risultato trovato.");
            }

        } else { // cerca un canto
            if (page === "index" || page === "celebrazioni") {
                jsonFile = "db/canti.json";
                linkRisultati = "nav-bar/risultati.html";
            } else if (page === "anno") {
                jsonFile = "../../db/canti.json";
                linkRisultati = "../risultati.html";
            } else {
                jsonFile = "../db/canti.json";
                linkRisultati = "risultati.html";
            }

            const results = []

            try {
                const response = await fetch(jsonFile);
                const data = await response.json();

                data.canti.forEach(item => {
                    if (input.toLowerCase() === item.titolo.toLowerCase()) {
                        results.push(item)
                    }
                });
            } catch (error) {
                console.error('Errore nel fetching dei dati: ', error)
            }

            localStorage.setItem("searchResults", JSON.stringify(results));
            localStorage.setItem("tipologia", "canto");

            // Reindirizza alla pagina dei risultati
            window.location.href = linkRisultati;
        }
    }
}

async function cerca(jsonFile, arabicNumbers, numeriRomani, anno) {
    const results = []; // Lista per raccogliere i risultati

    if (jsonFile) {
        try {
            const response = await fetch(jsonFile);
            const data = await response.json();
            const numeroDomenica = arabicNumbers ? parseInt(arabicNumbers[0]) : numeriRomani ? convertRomanToInt(numeriRomani[0]) : null;

            data.celebrazioni.forEach(item => {
                // Verifica se il titolo o il numero corrispondono ai criteri di ricerca
                if (item.numero_giorno) {
                    if (item.numero_giorno === numeroDomenica && item.anno.toLowerCase() === anno) {
                        results.push(item);
                    }
                } else {
                    if (item.numero === numeroDomenica && item.anno.toLowerCase() === anno) {
                        results.push(item);
                    }
                }
            });
        } catch (error) {
            console.error('Errore nel fetching dei dati:', error);
        }
    } else {
        console.log("Nessun file JSON specificato per la ricerca.");
    }

    return results;
}

function convertRomanToInt(roman) {
    const romanNumerals = {
        'i': 1,
        'v': 5,
        'x': 10,
    };

    let total = 0;
    let prevValue = 0;

    for (let char of roman) {
        const currentValue = romanNumerals[char.toLowerCase()];
        if (currentValue > prevValue) {
            total += currentValue - 2 * prevValue; // Sottrai il valore precedente se necessario
        } else {
            total += currentValue;
        }
        prevValue = currentValue;
    }

    return total;
}

async function suggestions(event, page) {
    const query = document.getElementById("global_search").value.toLowerCase().trim();
    let results = [];

    const filePaths = {
        salmo: {
            "index": "db/salmi/elenco_salmi.json",
            "celebrazioni": "db/salmi/elenco_salmi.json",
            "anno": "../../db/salmi/elenco_salmi.json",
            "default": "../db/salmi/elenco_salmi.json"
        },
        domenica: {
            "index": [
                "db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_a.json",
                "db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_b.json",
                "db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_c.json"
            ],
            "celebrazioni": [
                "db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_a.json",
                "db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_b.json",
                "db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_c.json"
            ],
            "anno": [
                "../../db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_a.json",
                "../../db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_b.json",
                "../../db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_c.json"
            ],
            "default": [
                "../db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_a.json",
                "../db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_b.json",
                "../db/tempi_liturgici/tempo_ordinario/celebrazioni_anno_c.json"
            ]
        },
        canti: {
            "index": "db/canti.json",
            "celebrazioni": "db/canti.json",
            "anno": "../../db/canti.json",
            "default": "../db/canti.json"
        }
    };

    if (query.includes("salmo")) {
        const jsonFile = filePaths.salmo[page] || filePaths.salmo["default"];
        results = await fetchJsonFile(jsonFile);
    } else if (query.includes("domenica") || query.includes("ordinario")) {
        const jsonFiles = filePaths.domenica[page] || filePaths.domenica["default"];
        for (const jsonFile of jsonFiles) {
            results = results.concat(await fetchJsonFile(jsonFile));
        }
    } else {
        const jsonFile = filePaths.canti[page] || filePaths.canti["default"];
        results = await fetchJsonFile(jsonFile);
    }

    if (results.length != 0) {
        console.log(results);
    }
    aggiornaSuggerimenti(results, page);
}

async function fetchJsonFile(jsonFile) {
    let results = [];

    if (jsonFile.includes("celebrazioni")) {
        try {
            const response = await fetch(jsonFile);
            const data = await response.json();

            // Itera sugli oggetti nel JSON
            data.celebrazioni.forEach(item => {
                results.push(item.title)
            });
        } catch (error) {
            console.error('Errore nel fetching dei dati:', error);
        }
    } else if (jsonFile.includes("elenco_salmi")) {
        try {
            const response = await fetch(jsonFile);
            const data = await response.json();

            // Itera sugli oggetti nel JSON
            data.salmi.forEach(item => {
                results.push(item.titolo)
            });
        } catch (error) {
            console.error('Errore nel fetching dei dati:', error);
        }
    } else {
        try {
            const response = await fetch(jsonFile);
            const data = await response.json();

            // Itera sugli oggetti nel JSON
            data.canti.forEach(item => {
                results.push(item.titolo)
            });
        } catch (error) {
            console.error('Errore nel fetching dei dati:', error);
        }
    }

    return results;
}

function aggiornaSuggerimenti(termine, page) {
    const query = document.getElementById("global_search").value.toLowerCase().trim();

    // Se il campo di input è vuoto, nascondi i suggerimenti e termina
    if (query === '') {
        document.getElementById('suggestions').style.display = 'none';
        return;
    }

    const suggerimenti = termine.filter(t => t.toLowerCase().startsWith(query)); // Filtra i termini

    const lista = document.getElementById('suggestions');
    lista.innerHTML = ''; // Svuota i suggerimenti precedenti

    // Mostra il contenitore se ci sono suggerimenti
    lista.style.display = suggerimenti.length > 0 ? 'block' : 'none';

    if (suggerimenti.length === 0) {
        const elemento = document.createElement('div');
        elemento.textContent = 'Nessun suggerimento';
        elemento.className = 'suggestion-item';
        lista.appendChild(elemento);
    } else {
        suggerimenti.forEach(termine => {
            const elemento = document.createElement('div');
            elemento.textContent = termine;
            elemento.className = 'suggestion-item';
            elemento.addEventListener('click', (event) => {
                // Imposta il valore dell'input al termine selezionato
                document.getElementById('global_search').value = termine;

                // Richiama la funzione di ricerca con il termine selezionato
                searchCanti(event, page);

                // Nascondi i suggerimenti dopo il clic
                lista.innerHTML = '';
                lista.style.display = 'none';
            });
            lista.appendChild(elemento);
        });
    }
}
