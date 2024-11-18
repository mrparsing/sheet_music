function carica_canti() {
    fetch('../db/canti.json')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('list');
            const groupedCanti = groupCantiByLetter(data.canti);

            Object.keys(groupedCanti).forEach(letter => {
                const letterHeader = document.createElement('div');
                letterHeader.textContent = letter;
                letterHeader.className = 'letter-header';
                letterHeader.setAttribute('data-letter', letter);
                list.appendChild(letterHeader);

                groupedCanti[letter].forEach(canto => {
                    const li = document.createElement('li');
                    li.onclick = toggleDetails;
                    li.setAttribute('data-letter', letter);
                    li.setAttribute('data-author', canto.autore);
                    li.setAttribute('data-type', canto.tipologia);
                    li.setAttribute('data-tempo', canto.tempo);

                    const span = document.createElement('span');
                    span.textContent = canto.titolo;
                    li.appendChild(span);

                    const detailsDiv = document.createElement('div');
                    detailsDiv.className = 'canto-details';
                    detailsDiv.style.display = 'none';
                    detailsDiv.innerHTML = `<strong>Autore:</strong> ${canto.autore} | <strong>Tipologia:</strong> ${canto.tipologia} | <strong>Tempo:</strong> ${canto.tempo}`;

                    const linksDiv = document.createElement('div');
                    linksDiv.className = 'link-buttons'; // Classe per il layout flessibile

                    const ascoltaLink = document.createElement('a');
                    ascoltaLink.href = canto.ascolta;
                    ascoltaLink.className = 'link-button';
                    ascoltaLink.textContent = 'Ascolta';
                    linksDiv.appendChild(ascoltaLink);

                    const scaricaLink = document.createElement('a');
                    scaricaLink.href = canto.download_link;
                    scaricaLink.className = 'link-button';
                    scaricaLink.textContent = 'Scarica';
                    linksDiv.appendChild(scaricaLink);

                    const testoLink = document.createElement('a');
                    testoLink.href = `testo_canti.html?titolo=${encodeURIComponent(canto.titolo)}`;
                    testoLink.className = 'testo-button';
                    testoLink.textContent = 'Testo';

                    linksDiv.appendChild(testoLink);

                    detailsDiv.appendChild(linksDiv); // Aggiungi il div dei link al div dei dettagli
                    li.appendChild(detailsDiv);

                    list.appendChild(li);
                });
            });
        })
        .catch(error => console.error('Errore nel caricamento del file JSON:', error));
}
document.addEventListener('DOMContentLoaded', function () {
    carica_canti()
});

function toggleDetails(event) {
    const details = event.currentTarget.querySelector('.canto-details');
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
}

function groupCantiByLetter(canti) {
    const grouped = {};
    canti.sort((a, b) => a.titolo.localeCompare(b.titolo));

    canti.forEach(canto => {
        const firstLetter = canto.titolo.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(canto);
    });

    return grouped;
}

function filter_search_bar() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const list = document.getElementById('list');
    const items = list.getElementsByTagName('li');
    const headers = document.getElementsByClassName('letter-header');

    let letterFound = {}; // Oggetto per tenere traccia delle lettere con risultati

    // Nascondere o mostrare i canti in base alla ricerca
    for (let i = 0; i < items.length; i++) {
        const span = items[i].getElementsByTagName('span')[0];
        const txtValue = span.textContent || span.innerText;
        const cantoLetter = items[i].getAttribute('data-letter');

        if (txtValue.toUpperCase().indexOf(input) > -1) {
            items[i].style.display = '';  // Mostra i canti che corrispondono alla ricerca
            letterFound[cantoLetter] = true;  // Segna la lettera come trovata
        } else {
            items[i].style.display = 'none';  // Nascondi i canti che non corrispondono
        }
    }

    // Mostrare solo le lettere che hanno risultati
    for (let j = 0; j < headers.length; j++) {
        const letter = headers[j].getAttribute('data-letter');
        if (letterFound[letter]) {
            headers[j].style.display = '';  // Mostra la lettera se c'è un risultato
        } else {
            headers[j].style.display = 'none';  // Nascondi la lettera se non ci sono risultati
        }
    }
}

function filter_search_bar_2() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const authorValue = document.getElementById('authorInput').value.toLowerCase();
    const typeValue = document.getElementById('typeSelect').value;
    const tempoValue = document.getElementById('tempoSelect').value;

    const list = document.getElementById('list');
    const items = list.getElementsByTagName('li');

    // Nascondi tutte le lettere prima di filtrare
    const headers = document.getElementsByClassName('letter-header');
    for (let j = 0; j < headers.length; j++) {
        headers[j].style.display = 'none';
    }

    // Filtra e mostra i canti corrispondenti
    for (let i = 0; i < items.length; i++) {
        const canto = items[i];
        const cantoText = canto.querySelector('span').textContent.toLowerCase();
        const cantoAuthors = canto.getAttribute('data-author') ? canto.getAttribute('data-author').toLowerCase() : '';
        const cantoType = canto.getAttribute('data-type') || '';
        const cantoTempo = canto.getAttribute('data-tempo') || '';

        const matchSearch = cantoText.includes(searchValue);

        // Allow partial matching for authors
        const matchAuthor = !authorValue || cantoAuthors.split(',').some(author => author.trim().includes(authorValue));

        // Check if the selected type matches any of the types in the cantoType
        const matchType = !typeValue || cantoType.split(',').map(type => type.trim()).includes(typeValue);
        const matchTempo = !tempoValue || cantoTempo === tempoValue;

        if (matchSearch && matchAuthor && matchType && matchTempo) {
            canto.style.display = ''; // Mostra l'elemento

            // Mostra anche la lettera corrispondente (intestazione)
            const letter = canto.getAttribute('data-letter');
            const header = document.querySelector(`.letter-header[data-letter="${letter}"]`);
            if (header) {
                header.style.display = '';
            }
        } else {
            canto.style.display = 'none'; // Nascondi l'elemento
        }
    }
}


function resetFilters() {
    // Resetta il campo autore
    document.getElementById('authorInput').value = '';

    // Resetta i selettori
    document.getElementById('typeSelect').value = '';
    document.getElementById('tempoSelect').value = '';

    // Esegui il filtro per aggiornare la lista
    filter_search_bar_2();
}
