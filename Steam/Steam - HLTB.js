// ==UserScript==
// @name         Steam - Intigrate HowLongToBeat
// @namespace    Threeskimo
// @author       Threeskimo
// @version      1.06
// @description  Adds a button that shows the completion time for the "Main Story" and links to HowLongToBeat.
// @icon         https://store.steampowered.com/favicon.ico
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @match        https://store.steampowered.com/app/*
// @grant        GM_xmlhttpRequest
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/451899/Steam%20-%20Intigrate%20HowLongToBeat.user.js
// @updateURL https://update.greasyfork.org/scripts/451899/Steam%20-%20Intigrate%20HowLongToBeat.meta.js
// ==/UserScript==

// Changelog //////////////////////////////////////////////////////////////////////////////////
// 1.06 : - `pageTotal` no longer is null when no game is found, it returns 0 instead. Updated script to handle this change.
// 1.05 : - Updated to show "--" instead of "HLTB" on button when the GameName is found, but no data exists. (Will still show "HLTB" on the button if the game is not found at all.)
// 1.04 : - Added mobile integration (with loader).
// 1.03 : - Updated script to pull more accurate data by verifying game_name when possible.
// 1.02 : - HLTB updated to JSON responses. Updated script to account for this change.
// 1.01 : - Added "origin" and "referer" to GM_xmlhttpRequest headers as HLTB requires now.
// 1.0  : - Release.
///////////////////////////////////////////////////////////////////////////////////////////////

//Setup loaders for mobile and desktop
$("#appHeaderGridContainer").append('<style type="text/css">@keyframes ldio-www0qkokjy{0%,25%{transform:translate(6px,0) scale(0)}50%{transform:translate(6px,0) scale(1)}75%{transform:translate(40px,0) scale(1)}100%{transform:translate(74px,0) scale(1)}}@keyframes ldio-www0qkokjy-r{0%{transform:translate(74px,0) scale(1) :}100%{transform:translate(74px,0) scale(0)}}@keyframes ldio-www0qkokjy-c{0%,100%{background:#0051a2}25%{background:#89bff8}50%{background:#408ee0}75%{background:#1b75be}}.ldio-www0qkokjy div{position:absolute;width:20px;height:20px;border-radius:50%;transform:translate(40px,0) scale(1);background:#0051a2;animation:2s cubic-bezier(0,.5,.5,1) infinite ldio-www0qkokjy;box-sizing:content-box}.ldio-www0qkokjy div:first-child{background:#1b75be;transform:translate(74px,0) scale(1);animation:.5s cubic-bezier(0,.5,.5,1) infinite ldio-www0qkokjy-r,2s step-start infinite ldio-www0qkokjy-c}.ldio-www0qkokjy div:nth-child(2){animation-delay:-.5s;background:#0051a2}.ldio-www0qkokjy div:nth-child(3){animation-delay:-1s;background:#1b75be}.ldio-www0qkokjy div:nth-child(4){animation-delay:-1.5s;background:#408ee0}.ldio-www0qkokjy div:nth-child(5){animation-delay:-2s;background:#89bff8}.loadingio-spinner-ellipsis-xiqce8pxsmm{width:44px;height:10px;display:inline-block;overflow:hidden;background:0 0}.ldio-www0qkokjy{width:100%;height:100%;position:relative;transform:translateZ(0) scale(.44);backface-visibility:hidden;transform-origin:0 0}</style><div class="grid_label grid_date">HLTB</div><div class="grid_content"> <div class="loadingio-spinner-ellipsis-xiqce8pxsmm"><div class="ldio-www0qkokjy"><div></div><div></div><div></div><div></div><div></div></div></div> </div>');
$(".apphub_OtherSiteInfo").prepend('<style type="text/css">@keyframes ldio-www0qkokjy{0%,25%{transform:translate(6px,0) scale(0)}50%{transform:translate(6px,0) scale(1)}75%{transform:translate(40px,0) scale(1)}100%{transform:translate(74px,0) scale(1)}}@keyframes ldio-www0qkokjy-r{0%{transform:translate(74px,0) scale(1) :}100%{transform:translate(74px,0) scale(0)}}@keyframes ldio-www0qkokjy-c{0%,100%{background:#0051a2}25%{background:#89bff8}50%{background:#408ee0}75%{background:#1b75be}}.ldio-www0qkokjy div{position:absolute;width:20px;height:20px;border-radius:50%;transform:translate(40px,0) scale(1);background:#0051a2;animation:2s cubic-bezier(0,.5,.5,1) infinite ldio-www0qkokjy;box-sizing:content-box}.ldio-www0qkokjy div:first-child{background:#1b75be;transform:translate(74px,0) scale(1);animation:.5s cubic-bezier(0,.5,.5,1) infinite ldio-www0qkokjy-r,2s step-start infinite ldio-www0qkokjy-c}.ldio-www0qkokjy div:nth-child(2){animation-delay:-.5s;background:#0051a2}.ldio-www0qkokjy div:nth-child(3){animation-delay:-1s;background:#1b75be}.ldio-www0qkokjy div:nth-child(4){animation-delay:-1.5s;background:#408ee0}.ldio-www0qkokjy div:nth-child(5){animation-delay:-2s;background:#89bff8}.loadingio-spinner-ellipsis-xiqce8pxsmm{width:44px;height:10px;display:inline-block;overflow:hidden;background:0 0}.ldio-www0qkokjy{width:100%;height:100%;position:relative;transform:translateZ(0) scale(.44);backface-visibility:hidden;transform-origin:0 0}</style> <div id="loader" style="float:left;padding-right:5px;padding-top:10px;"> <div class="loadingio-spinner-ellipsis-xiqce8pxsmm"><div class="ldio-www0qkokjy"><div></div><div></div><div></div><div></div><div></div></div></div> </div>');


// Grab Steam game name (and get rid of symbols)
let appName = document.getElementsByClassName("apphub_AppName")[0].textContent.replace("’","'").replace(/[^a-z _0-9`~!@#$%^&*()-_=+|\\\]}[{;:'",<.>/?]/gi,'');

// Set HLTB URL
let hltbUrl = "https://howlongtobeat.com/api/search";

// Set POST string w/ correct game name
let hltbQuery = '{"searchType":"games","searchTerms":["'+appName+'"],"size":100}'

// Perform POST request
GM_xmlhttpRequest({
    method: "POST",
    url: hltbUrl,
    data: hltbQuery,
    headers: {
        "Content-Type": "application/json",
        "origin": "https://howlongtobeat.com",
        "referer": "https://howlongtobeat.com"
    },
    onload: function (response) {

        // Grab response
        let hltb = JSON.parse(response.responseText);

        //Determine if data is present in response by checking the page count.  If no data, set default HLTB button.
        let hltbPages = hltb['pageTotal'];
        if(hltbPages == 0) {
            hltbTime = "HLTB";
            bgcolor = "ff8c00";
            console.log("\x1b[36m[HLTB-Response]: \x1b[37mNo Response");
        } else {

            //If data is present in response, let's rock!
            //Show response in console for debugging purposes (or comment to hide)
            let hltbstring = JSON.stringify(hltb);
            //console.log("\x1b[36m[HLTB-Response]: \x1b[37m" + hltbstring);

            //Make sure you have the right game_name (if possible, otherwise just use first result from response)
            let n = 0;
            let loop = hltb['count'];
            for (let i = 0; i < loop; i++) {
                let hltbName = hltb['data'][i]['game_name'];
                if (hltbName.toLowerCase() == appName.toLowerCase()) {
                    console.log("\x1b[36m[HLTB-GameName]: \x1b[37m" + hltbName);
                    n = i;
                    break;
                }
            }

            // Extract time for "Main Story" and convert into hours
            hltbTime = hltb['data'][n]['comp_main'];
            hltbTime = hltbTime/60/60;                            // Convert to hours
            hltbTime = Math.round(hltbTime*2)/2;                  // Round to closes .5
            hltbTime = hltbTime.toString() .replace(".5","½");    // Convert .5 to ½ to be consistent with HLTB
            console.log("\x1b[36m[HLTB-MainTime]: \x1b[37m" + hltbTime);

            // Extract the Confidence level
            hltbConfidence = hltb['data'][n]['comp_main_count'];
            console.log("\x1b[36m[HLTB-Confidence]: \x1b[37m" + hltbConfidence);

            // If game exists but no time was returned ("--"), set button to default HLTB button
            if (!hltbTime) {
                hltbTime = "HLTB";
                bgcolor = "ff8c00";
            } else if (hltbTime == 0) {
                hltbTime = "--";
                bgcolor = "222222";
            } else {
                // Append "Hour(s)" to the end of the time
                if (hltbTime == 1 ) { hltbTime = hltbTime + " Hour"; } else { hltbTime = hltbTime + " Hours"; }

                // Determine what color to make button (based on HLTB confidence level).  These might not reflect how HLTB calculates their confidence, this is just a guess.
                if (hltbConfidence < 5 ) {
                    bgcolor = "FF3A3A";
                } else if (hltbConfidence < 10) {
                    bgcolor = "cc3b51";
                } else if (hltbConfidence < 15) {
                    bgcolor = "824985";
                } else if (hltbConfidence < 20) {
                    bgcolor = "5650a1";
                } else if (hltbConfidence < 25) {
                    bgcolor = "485cab";
                } else if (hltbConfidence < 30) {
                    bgcolor = "3a6db5";
                } else if (hltbConfidence >= 30) {
                    bgcolor = "287FC2";
                } else {
                    bgcolor = ""
                }
            }
        }
        //Display HLTB button next to "Community Hub" button and remove loader
        $('#loader').remove();
        $(".apphub_OtherSiteInfo").prepend(' <div class="apphub_OtherSiteInfo" style="float:left;padding-right:5px;"><a class="btnv6_blue_hoverfade btn_medium" href="https://howlongtobeat.com/?q='+appName+'" target="_blank" style="background-color:#'+bgcolor+';"><span style="color:white;">'+hltbTime+'</span></a></div>');
        //Or if on mobile (<500), display under the "Release Date"
        if ($(window).width() < 500 ) {
            $("#appHeaderGridContainer > div:nth-child(9)").html('<a class="btnv6_blue_hoverfade btn_small" href="https://howlongtobeat.com/?q='+appName+'" target="_blank" style="background-color:#'+bgcolor+';"><span style="color:white;">'+hltbTime+'</splan></a>');
        }
    }
});
