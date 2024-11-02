// ==UserScript==
// @name         ZT autoDl
// @namespace    http://tampermonkey.net/
// @version      2024-03-07
// @description  try to take over the world!
// @author       You
// @include      *://*.zone-telechargement.*/*
// @include      *://zone-telechargement.*/*
// @match        https://zone-telechargement.*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zone-telechargement.nl
// @grant        none
// ==/UserScript==

const DL_WEBSITE = "1fichier";

const qualitesPreference = [
    "(VOSTFR)",
    "(VOSTFR HD)",
    "(VF)",
    "(VF HD)",
    "(MULTI 4K UHD)",
    "------------",
    "TS",
    "TS MD",
    "TS/MD",
    "CAM",
    "R5 MD",
    "R6 MD",
    "DVDSCREEN",
    "HDRIP MD",
    "BDRiP",
    "BRRIP",
    "BDRip XviD",
    "BDRIP/MKV",
    "DVDRIP MD",
    "WEBRIP",
    "DVDRIP",
    "Dvdrip XviD",
    "HDRIP",
    "WEB-DL",
    "BDRIP",
    "HDLIGHT 720p",
    "WEBRIP 720p",
    "WEB-DL 720p",
    "BLU-RAY 720p",
    "HDTV 1080p",
    "HDLIGHT 1080p",
    "WEBRIP 1080p",
    "WEBRIP 4K",
    "WEB-DL 1080p",
    "BLU-RAY 1080p",
    "BLU-RAY 3D",
    "Blu-Ray 3D",
    "4K LIGHT",
    "WEB-DL 4K",
    "BLURAY 4K",
    "BLURAY REMUX 4K"
];

//hashmap des nom mal orthographié
const malOrthographie = {
    "JustWatch": "Zone Telechargement",
    "D Simpsons": "Les Simpson",
    "Ore dake Level Up na Ken": "Solo Leveling",
}

function onChangePage() {

    const url = window.location.href;
    console.log("Page détectée : "+ url);
    if (url.includes("search=")) {
        console.log("Page de recherche détectée.");
        betterSearch()
    }else if (url.includes("&id=")) {
        console.log("Page de détail détectée.");
        betterDetail()
    }
}

function nettoyerChaine(chaine) {
    // Supprimer les espaces et convertir en minuscules
    return chaine.replace(/[.,\/#!$%^&*;:{}='\-_`~()]/g, '').replace(/\s/g, '').toLowerCase();
}

function disableAutoClick() {
    // Désactivation de l'option autoClick
    const params = new URLSearchParams(window.location.search);
    params.delete('autoClick');
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
}


class Result {

    item;
    title;
    quality = 0;
    season = 0;


    constructor(title, qualityStr, season, item) {
        this.title = title;
        this.season = season;
        this.item = item;

        if (qualitesPreference.includes(qualityStr)) {
            this.quality = qualitesPreference.indexOf(qualityStr);
        } else {
            console.warn("Qualité non reconnue : " + qualityStr);
        }
    }


    titleMatch(search) {
        if (malOrthographie[search]) {
            search = malOrthographie[search];
        }
        return nettoyerChaine(this.title).includes(nettoyerChaine(search));
    }

    hilite() {
        this.item.style.border = '2px solid #ffc107'; // Ajouter une bordure jaune brillante
        this.item.style.boxShadow = '0 0 10px #ffc107'; // Ajouter une ombre jaune brillante
    }

    click() {
        const link = this.item.querySelector('.cover_infos_title a');

        // Récupérer les informations des paramètres de requête actuels
        const params = new URLSearchParams(window.location.search);
        const saison = params.get('saison');
        const episode = params.get('episode');

        // Désactiver autoClick
        disableAutoClick();

        // Transmettre les informations de saison et épisode à la page suivante si elles existent
        if (saison) {
            link.href += '&saison=' + saison;
        }
        if (episode) {
            link.href += '&episode=' + episode;
        }
        link.href += '&autoClick=true';

        // Effectuer le clic
        link.click();
    }


}

function getResults() {
    const resultItems = document.querySelectorAll('.cover_global');
    const results = [];
    resultItems.forEach(item => {
        let title = item.querySelector('.cover_infos_title a').textContent;
        let season = 0;
        if (title.includes("Saison")) {
            season = title.match(/Saison (\d+)/)[1];
            title = title.replace(/ -Saison \d+/, "").trim();
        }

        const qualityStr = item.querySelector('.detail_release span:first-child').textContent.trim()


        results.push(new Result(title, qualityStr, season, item));
    });
    return results;
}

function betterSearch() {
    //recuperer l'imput de recherche
    const input = document.querySelector('.s_field');
    //recuperer la vrai valeur de recherche
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const searchType = params.get('p');
    let saison = params.get('saison');

    console.log("Page de recherche détectée:"
        + "\n\tinput: " + input.value
        + "\n\tsearch: " + search
        + "\n\tsType: " + params.get('st')
        + "\n\tyear: " + params.get('year')
        + "\n\tsaison: " + saison
        + "\n\tepisode: " + params.get('episode')
        + "\n\tautoClick: " + params.get('autoClick')
    );

    if (input && search && input.value !== search) {
        //TODO: verifier si la recherche est la meme car elle peut etre tronquée
        input.value = search;
    }

    let results = getResults();

    console.log("results: ", results);

    results = results.filter(result => result.quality > 1)

    //Verifier si la donee des resultats est vide et que le stype est manga
    if (results.length === 0 && params.get('st') === 'mangas') {
        window.location.href = window.location.href.replace(/&?p=mangas/, '') + "&p=series&autoClick=true";
    }

    //filter les resultats
    results = results.filter(result => result.titleMatch(search))

    results.forEach(result => result.hilite());


    if (saison !== null) {
        results = results.filter(result => result.season === saison)
    }

    results.sort((a, b) => b.quality - a.quality);

    const autoClickParam = params.get('autoClick');



    if (autoClickParam && results.length >= 1) {
        if (saison === null && searchType === 'films') {
            results[0].click();
        }
        else if (saison !== null) {
            results[0].click();
        }
    }


    console.log("results: ", results);

}

function betterDetail() {
    // idée : verifier l'année de sortie
    // idée : verifier si il y a une meilleur qualité

    const params = new URLSearchParams(window.location.search);
    const episodeNumber = params.get('episode');
    const searchType = params.get('p');
    console.log("searchType: " + searchType);

    const links = getLinksAfterTestDiv();
    const filteredLinks = [];

    links.forEach(link => {
        if (episodeNumber) {
            if (link.textContent.includes('Episode ' + episodeNumber)) {
                filteredLinks.push(link.href);
            }
        }else if (searchType === 'film') {
            filteredLinks.push(link.href);
        }
    });


    if (filteredLinks.length > 0 && params.get('autoClick')) {
        disableAutoClick();
        console.log(filteredLinks)
        // Rediriger vers le premier lien
        window.location.href = filteredLinks[0];
        console.log("Lien du meilleur résultat :", filteredLinks[0]);

    }
}

function getLinksAfterTestDiv() {
    // Sélectionner tous les éléments <div> contenant le texte "test"
    let links = [];
    let specificDiv = Array.from(document.querySelectorAll('div[style="font-weight: bold; color: rgb(0, 0, 0); --darkreader-inline-color: #f4f2ee;"][data-darkreader-inline-color=""]'))
        .find(div => div.textContent.includes(DL_WEBSITE));

    console.log("Div spécifique trouvé : ", specificDiv);
    let sibling = specificDiv.parentElement.nextElementSibling;
            while (sibling) {
                console.log("Element suivant : ", sibling);
                if (sibling.tagName === 'B') {
                    // Récupérer tous les <a> à l'intérieur de cet <b>
                    let aTags = sibling.querySelectorAll('a');
                    aTags.forEach(a => links.push(a));
                }
                sibling = sibling.nextElementSibling;
            }

    return links;
}

(function() {
    'use strict';

// Configuration de l'observateur de mutations
    const observerConfig = {
        attributes: true, // Surveiller les changements d'attributs des éléments
        childList: true, // Surveiller les modifications de la structure des enfants
        subtree: true // Surveiller tous les descendants de l'élément cible
    };

// Création de l'observateur de mutations avec la fonction de rappel
    const observer = new MutationObserver(onChangePage);

// Démarrage de l'observation des mutations sur le corps de la page (vous pouvez changer le sélecteur selon vos besoins)
    observer.observe(document.body, observerConfig);
    onChangePage();
})();
