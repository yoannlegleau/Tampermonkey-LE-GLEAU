// ==UserScript==
// @name         dowload-link rapide
// @namespace    http://tampermonkey.net/
// @version      2024-03-15
// @description  try to take over the world!
// @author       You
// @match        https://dl-protect.link/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

function clickButton() {
    console.log("clickButton fonction");
    const subButton = document.getElementById("subButton")
    if (subButton === null) {
        clickLink();
    }

    if(subButton && subButton.textContent === "Continuer") {
        console.log("clickButton");
        subButton.click();
        clickLink();
    }else {
        console.log("clickButton setTimeout");
        setTimeout(clickButton, 200);
    }
}

function clickLink() {
//  récupaire la balise a qui a comptenue dans la balise div qui a la class col-md-12 urls text-center
    const links = document.querySelectorAll(".col-md-12.urls.text-center a");
    if (links.length > 0) {
        console.log("clickLink");
        links[0].click();
        //fermer la page apres 2s
        setTimeout(function() {
            window.close();
        }, 3000);
        throw new Error("Stop script");
    }else {
        console.log("clickLink setTimeout" + links.toString());
        setTimeout(clickLink, 200);
    }
}


(function() {
    'use strict';

    console.log("dl-protect.link.js");
    // Your code here...

    clickButton();

})();
