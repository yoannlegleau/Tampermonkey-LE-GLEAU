// ==UserScript==
// @name         Justwatsh x ZT
// @namespace    http://tampermonkey.net/
// @version      2024-03-07
// @description  try to take over the world!
// @author       You
// @match        https://www.justwatch.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=justwatch.com
// @grant        none
// ==/UserScript==

// Domaines

const ztDomain = 'monster';
const torrent9Domain = 'ing';

const ztIcon = `https://www.zone-telechargement.${ztDomain}/favicon.ico`;
const torrent9Icon = `https://asamsa.fr/templates/cz/images/favicon.ico`;

const trueSeries = [
    "Les Simpson",
    "Star Wars Rebels",
    "Star Wars : The Acolyte",
    "Star Wars : The Bad Batch",
    "Star Wars : The Clone Wars",
    "Star Wars : Clone Wars",
    "The Last of Us",
    "The Walking Dead",
    "Le Seigneur des anneaux : Les Anneaux de pouvoir",
    "Resident Alien"
];

/**
 * Créer un lien vers le site Zone Téléchargement
 * @param fileName Nom du fichier
 * @param sType Type de recherche (films, series, mangas)
 * @param year Année de sortie
 * @param saison numeéro de la saison
 * @param episode numéro de l'épisode
 * @returns {string} URL de recherche
 */
function createLinkZT(fileName, sType, year = 0, saison = 0, episode = 0) {
    let url = `https://www.zone-telechargement.${ztDomain}/?`;
    fileName = fileName.replace('\'' , ' ')
        .replace('’' , ' ')
        .replace('  ' , ' ')
    url += `search=${fileName.replace(/ /g, '+').replace('&','et').substring(0, 32)}`;
    url += `&p=${sType}`;
    if (fileName.length > 32){
        url += "&fullname=" + fileName.replace(/ /g, '+').replace('&','et');}
    url += `&st=${sType}`;
    //if (year){
    //    url += `&year=${year}`;}
    if (saison){
        url += `&saison=${saison}`;}
    if (episode){
        url += `&episode=${episode}`;}
    url += '&autoClick=true';
    return url;
}

/**
 * Créer un lien vers le 9Torent
 * @param fileName Nom du fichier
 * @param sType Type de recherche (films, series, mangas)
 * @param year Année de sortie
 * @param saison numeéro de la saison
 * @param episode numéro de l'épisode
 * @returns {string} URL de recherche
 */
function createLink9T(fileName, sType, year = 0, saison = 0, episode = 0) {
    // https://www.torrent9.ing/recherche/Slow%20Horses%20S04E01
    // https://www.torrent9.ing/recherche/Slow+Horses+S04E01
    let url = `https://www.torrent9.${torrent9Domain}/recherche/`;
    url += `${fileName.replace('&','et')}`;

    //saion et episode sous la forme S04E01 (avec le formatage de 2 chiffres)
    if (saison){
        url += ` S${saison.toString().padStart(2, '0')}`;}
    if (episode){
        url += `E${episode.toString().padStart(2, '0')}`;}
    return url;
}

function filmPage() {
    const titleCards = document.querySelectorAll('.title-card');
    if (titleCards.length === 0) {
        setTimeout(onChangePage, 10);
        return;
    }

    // Parcourir chaque titleCard
    titleCards.forEach(function (titleCard) {
        if (!titleCard.querySelector('.zt_tutton')) {

            // Trouver la div de classe "title-card-basic__rating"
            const ratingDiv = titleCard.querySelector('.title-card-basic__rating');

            // Vérifier si la div "title-card-basic__rating" existe
            if (ratingDiv) {
                // Récupérer le nom du fichier (remplacer les espaces par des +)
                const fileName = titleCard.querySelector('.title-card-heading').textContent.trim().replace(/ +\(\d+\)$/, '');
                let fileYear = titleCard.querySelector('.title-card-heading').textContent.trim().match(/\((\d+)\)/);
                fileYear = fileYear ? fileYear[1] : 0;
                //console.log(fileYear);
                //console.log(fileName);

                // Créer un lien
                const link = document.createElement('a');
                link.href = createLinkZT(fileName, 'films', fileYear); // Remplacer avec l'URL souhaitée
                link.target = '_blank'; // Ouvrir le lien dans un nouvel onglet
                link.classList.add('zt_tutton');
                link.appendChild(ceatCardButton(ztIcon, 'Direct Download'));

                // Insérer le lien après la div "title-card-basic__rating"
                ratingDiv.parentNode.insertBefore(link, ratingDiv.nextSibling);

                // créer un lien vers le site 9Torrent
                const link9T = document.createElement('a');
                link9T.href = createLink9T(fileName, 'films', fileYear); // Remplacer avec l'URL souhaitée
                link9T.target = '_blank'; // Ouvrir le lien dans un nouvel onglet
                link9T.classList.add('t_tutton');
                link9T.appendChild(ceatCardButton(torrent9Icon, 'Torrent Download'));
                // Insérer le lien après la div "title-card-basic__rating"
                ratingDiv.parentNode.insertBefore(link9T, ratingDiv.nextSibling);

            }
        }
    });
}

function seriePage() {
    const titleCards = document.querySelectorAll('.list-grid__item');
    console.log("Nombre d'éléments dans la liste title-card : " + titleCards.length);
    if (titleCards.length === 0) {
        setTimeout(onChangePage, 10);
        return;
    }

    //

    // Parcourir chaque titleCard
    titleCards.forEach(function (titleCard) {

        // Trouver la div de classe "title-card-basic__rating"
        const ratingDiv = titleCard.querySelector('.title-card-show-episode__heading');

        // Vérifier si la div "title-card-basic__rating" existe
        if (ratingDiv) {
            // Récupérer le nom du fichier (remplacer les espaces par des +)
            const fileName = titleCard.querySelector('.title-card-show-episode__title-name').textContent.trim();//.replace(/ +\(\d+\)$/, '').replace(/ /g, '+');

            // Récupérer l'information sur la saison depuis la classe "title-card-heading"
            const seasonInfo = titleCard.querySelector('.title-card-heading').textContent.trim().match(/S(\d+) E(\d+)/);
            let season = 0;
            let episode = 0;
            if (seasonInfo && seasonInfo.length > 1) {
                season = seasonInfo[1];
                episode = seasonInfo[2];
            }

            // Créer un lien vers le site Zone Téléchargement
            const link = document.createElement('a');

            let defaultType = 'mangas';
            if (trueSeries.includes(fileName)) {
                defaultType = 'series';
            }

            link.href = createLinkZT(fileName, defaultType, 0, season, episode); // Remplacer avec l'URL souhaitée
            link.target = '_blank'; // Ouvrir le lien dans un nouvel onglet
            link.classList.add('zt_tutton');
            link.appendChild(ceatCardButton(ztIcon, 'Direct Download'));

            const oldlink = titleCard.querySelector('.zt_tutton');
            if (oldlink) {
                // Vérifier si le lien est différent
                if (titleCard.querySelector('.zt_tutton').href !== link.href) {
                    console.warn("Lien différent\n"+oldlink.href + "\n" + link.href);
                    // Supprimer le bouton existant
                    oldlink.remove();
                    // Ajouter le bouton
                    ratingDiv.parentNode.insertBefore(link, ratingDiv.nextSibling);
                }
            } else {
                // Insérer le lien après la div "title-card-basic__rating"
                console.log("Ajout du bouton");
                ratingDiv.parentNode.insertBefore(link, ratingDiv.nextSibling);
            }

            // créer un lien vers le site 9Torrent
            const link9T = document.createElement('a');

            let defaultType9T = 'mangas';
            if (trueSeries.includes(fileName)) {
                defaultType9T = 'series';
            }

            link9T.href = createLink9T(fileName, defaultType9T, 0, season, episode); // Remplacer avec l'URL souhaitée
            link9T.target = '_blank'; // Ouvrir le lien dans un nouvel onglet
            link9T.classList.add('t_tutton');
            link9T.appendChild(ceatCardButton(torrent9Icon, 'Torrent Download'));

            const oldlink9T = titleCard.querySelector('.t_tutton');
            if (oldlink9T) {
                // Vérifier si le lien est différent
                if (titleCard.querySelector('.t_tutton').href !== link9T.href) {
                    console.warn("Lien différent\n"+oldlink9T.href + "\n" + link9T.href);
                    // Supprimer le bouton existant
                    oldlink9T.remove();
                    // Ajouter le bouton
                    ratingDiv.parentNode.insertBefore(link9T, ratingDiv.nextSibling);
                }
            } else {
                // Insérer le lien après la div "title-card-basic__rating"
                console.log("Ajout du bouton");
                ratingDiv.parentNode.insertBefore(link9T, ratingDiv.nextSibling);
            }
        }
    });
}

function ceatCardButton(icon , text) {
    // Créer un bouton
    const button = document.createElement('button');
    button.classList.add('basic-button', 'secondary', 'md', 'w-full', 'rounded'); // Ajouter les classes au bouton

    // Créer une image pour l'icône du site
    const iconImg = document.createElement('img');
    iconImg.src = icon;
    iconImg.alt = '';
    iconImg.style.verticalAlign = 'middle';
    iconImg.style.marginRight = '4px';
    iconImg.style.width = '20px'; // Modifier la largeur de l'icône
    iconImg.style.height = '20px'; // Modifier la hauteur de l'icône

    // Ajouter l'icône et le texte du bouton
    button.appendChild(iconImg);
    button.appendChild(document.createTextNode(text));
    return button;
}


function contentPage() {

    if (document.querySelectorAll('.zt_tutton').length > 0) {
        return;
    }

    let fileName;
    let fileSaisonStr = "";

    // Récupérer le titre du film
    if (document.querySelector('.title-block h1 a')) {
        fileName = document.querySelector('.title-block h1 a').textContent.trim();
        fileSaisonStr = document.querySelector('.title-block h1').textContent.trim().replaceAll(fileName, "");
    } else
        fileName = document.querySelector('.title-block h1').textContent.trim().replace(/ +\(\d+\)$/, '');

    let fileYear = document.querySelector('.title-block span').textContent.trim().replace(/[()]/g, '');

    // faire varier le type de recherhe
    // ##.subheading
    let sType = 'films'; // filme par défau
    // verifier si c'est une series
    if (window.location.href.includes('/serie/')) {
        //console.log("Page de série détectée.");
        sType = 'series';
        // Vérifier si la série est un manga
        const paysDeProduction = document.querySelectorAll('.detail-infos__value');
        for (let i = 0; i < paysDeProduction.length; i++) {
            if (paysDeProduction[i].textContent.includes("Japon", "Animation") || paysDeProduction[i].textContent.includes("Animation")) {
                //console.log("La série semble être un anime. Traiter comme un manga.");
                sType = 'mangas';
                break;
            }
        }
    }

    // log tout les info
    console.log("Nom du fichier : " + fileName + "\n\tType de recherche : " + sType + "\n\tAnnée de sortie : " + fileYear + "\n\tSaison : " + fileSaisonStr);

    // Ajouter l'icône et le texte du bouton
    let button = ceatCardButton(ztIcon, 'Direct Download');
    let btntitle = ": " + fileName ;
    button.appendChild(document.createTextNode(btntitle + fileSaisonStr));
    button.style.marginTop = '10px';

    let saison = 0;
    const regexRom = /\b([IVXLCDM]+)\b/g;
    if (fileSaisonStr.match(regexRom)) {
        const list = fileSaisonStr.match(regexRom);
        console.log(list);
        saison = convertRomanToNumber(list[0]);
    }

    if (fileSaisonStr.toLowerCase().match(/saison (\d+)/)) {
        const list = fileSaisonStr.toLowerCase().match(/saison (\d+)/);
        saison = list[1];
    }
    if (fileSaisonStr.toLowerCase().match(/season (\d+)/)) {
        const list = fileSaisonStr.toLowerCase().match(/season (\d+)/);
        saison = list[1];
    }
    if (saison !== 0) {
        console.log("Saison : " + saison);
    }


    // Créer un lien
    let link = document.createElement('a');
    link.href = createLinkZT(fileName, sType, fileYear, saison); // Remplacer avec l'URL souhaitée
    link.target = '_blank'; // Ouvrir le lien dans un nouvel onglet
    link.classList.add('zt_tutton');
    link.appendChild(button);

    // Créer un lien vers le site 9Torrent
    let link9T = document.createElement('a');
    link9T.href = createLink9T(fileName, sType, fileYear, saison); // Remplacer avec l'URL souhaitée
    link9T.target = '_blank'; // Ouvrir le lien dans un nouvel onglet
    link9T.classList.add('t_tutton');
    let button9T = ceatCardButton(torrent9Icon, 'Torrent Download');
    button9T.appendChild(document.createTextNode(btntitle + fileSaisonStr));
    link9T.appendChild(button9T);


    // Trouver l'élément sous lequel nous allons insérer le bouton
    const insertionPoint = document.querySelector('.buybox__heading');
    if (!insertionPoint) {
        console.log("Impossible de trouver l'endroit où insérer le bouton de téléchargement.");
        return;
    }

    //verifier si le bouton existe et que le lien est difeérent
    const linkExist = document.querySelector('.zt_tutton');
    if (linkExist && linkExist.href !== link.href) {
        // Supprimer le bouton existant
        //linkExist.remove();
        //ajouter le nouveau bouton
        //insertionPoint.parentNode.insertBefore(link, insertionPoint.nextSibling);
    } else if (!linkExist) {
        insertionPoint.parentNode.insertBefore(link, insertionPoint.nextSibling);
    }

    //verifier si le bouton existe et que le lien est difeérent
    const linkExist9T = document.querySelector('.t_tutton');
    if (linkExist9T && linkExist9T.href !== link9T.href) {
        // Supprimer le bouton existant
        //linkExist9T.remove();
        //ajouter le nouveau bouton
        //insertionPoint.parentNode.insertBefore(link9T, insertionPoint.nextSibling);
    } else if (!linkExist9T) {
        insertionPoint.parentNode.insertBefore(link9T, insertionPoint.nextSibling);
    }
}

/**
 * Convertir un nombre romain en nombre arabe
 * @param roman Numéro romain à convertir
 * @returns {string} Numéro arabe
 */
function convertRomanToNumber(roman) {
    // Tableau pour stocker les valeurs des chiffres romains
    const romanNumerals = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };

    // Variable pour stocker le résultat
    let result = 0;

    // Parcourir la chaîne de caractères romaine de droite à gauche
    for (let i = roman.length - 1; i >= 0; i--) {
        // Récupérer la valeur du chiffre romain actuel
        let current = romanNumerals[roman[i]];

        // Si la valeur du chiffre précédent est inférieure à la valeur actuelle, soustrayez-la de la somme
        if (i < roman.length - 1 && romanNumerals[roman[i + 1]] > current) {
            result -= current;
        } else {
            // Sinon, ajoutez simplement la valeur à la somme
            result += current;
        }
    }

    // Renvoyer le résultat
    return result.toString();
}

function onChangePage() {
    const location = document.location.href;
    if (location.includes('my-lists')) {
        console.log('Page changed, Films :\n' + document.location.href);
        filmPage();
    } else if (location.includes('tv-show-tracking')) {
        console.log('Page changed, Series :\n' + document.location.href);
        seriePage();
    } else if (document.querySelector('.title-block h1')) {
        console.log('Page changed, content :\n' + document.location.href);
        contentPage();
    }
}


(function () {
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
})();
