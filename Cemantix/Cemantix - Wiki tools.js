// ==UserScript==
// @name         cemantix wiki tool
// @namespace    http://tampermonkey.net/
// @version      2024-04-02
// @description  try to take over the world!
// @author       You
// @match        https://cemantix.certitudes.org/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=certitudes.org
// @grant        none
// ==/UserScript==

function pageMots() {

    var toolsDiv = document.getElementById("tools");
    if(toolsDiv){
        return
    }

    var divsAside = document.querySelectorAll("aside");

// Créer un nouvel élément div
    var divSummary = document.createElement("div");

    // Ajouter la classe "summary" à l'élément div
    divSummary.classList.add("summary");

    // Créer un élément de titre h2 pour le titre "tool"
    var titreTool = document.createElement("h2");
    titreTool.textContent = "tool";

    // Ajouter l'élément de titre à l'élément div
    divSummary.appendChild(titreTool);

    // Ajouter l'élément div au document (à la fin du body par exemple)
    document.body.appendChild(divSummary);

    // Retourner l'élément div créé si vous souhaitez l'utiliser ailleurs dans votre code
    return divSummary;


}


function onChangePage() {
    var element = document.getElementById("cemantix");
    if (element && element.classList.contains("active")) {
        console.log('Page changed, Mots :\n' + document.location.href);
        pageMots()
    } else {
        console.log('Page changed, Wiki :\n' + document.location.href);
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