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
    const links = document.querySelectorAll('.postinfo a[rel="external nofollow"]');
    if (links.length > 0) {
        console.log("clickLink");
        links[0].click();
        throw new Error("Stop script");
    }else {
        console.log("clickLink setTimeout");
        setTimeout(clickLink, 200);
    }

}


(function() {
    'use strict';

    console.log("dl-protect.link.js");
    // Your code here...

    clickButton();

})();
