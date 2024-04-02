// ==UserScript==
// @name         auto phone number
// @namespace    http://tampermonkey.net/
// @version      2024-03-14
// @description  try to take over the world!
// @author       You
// @match        https://app.traderepublic.com/login
// @icon         https://www.google.com/s2/favicons?sz=64&domain=traderepublic.com
// @grant        none
// ==/UserScript==

function changeMDP() {
    'use strict';

    console.log('auto phone number');

    const phoneNumber = document.querySelector('.phoneNumberInput__number');

    if (phoneNumber){
        console.log('phoneNumber');

        //entrer le numéro de téléphone au clavier manuellement
        phoneNumber.value = '610137997';
        //
        // Déclenchement de l'événement 'input' pour simuler une saisie
        let inputEvent = new Event('input', { bubbles: true });
        phoneNumber.dispatchEvent(inputEvent);
        //
        // // Déclenchement de l'événement 'change' pour simuler un changement
        // let changeEvent = new Event('change', { bubbles: true });
        // phoneNumber.dispatchEvent(changeEvent);
        //
        // // Déclenchement de l'événement 'blur' pour simuler le fait de sortir de l'élément
        // let blurEvent = new Event('blur', { bubbles: true });
        // phoneNumber.dispatchEvent(blurEvent);
    } else {
        setTimeout(changeMDP,100)
    }

    const areaCode = document.querySelector('.dropdownList__openButton ');

    if (areaCode){
        areaCode.click();
        // rechercher france dans la liste l'id areaCode-+33
        document.getElementById('areaCode-+33').click();


    }else {
        setTimeout(changeMDP,100)
    }

    document.querySelector('.loginPhoneNumber__action').click();
    document.querySelector('.buttonPrimary').click();




    // Your code here...
};

(function() {
    'use strict';

// // Configuration de l'observateur de mutations
//     const observerConfig = {
//         attributes: true, // Surveiller les changements d'attributs des éléments
//         childList: true,  // Surveiller les modifications de la structure des enfants
//         subtree: true     // Surveiller tous les descendants de l'élément cible
//     };
//
// // Création de l'observateur de mutations avec la fonction de rappel
//     const observer = new MutationObserver(onChangePage);
//
// // Démarrage de l'observation des mutations sur le corps de la page (vous pouvez changer le sélecteur selon vos besoins)
//     observer.observe(document.body, observerConfig);

    changeMDP();
})();
