// ==UserScript==
// @name        Conversions GPS Orange
// @namespace   http://www.actice.net
// @description Convertit les coordonnées Lambert II en point GPS, et ouvre GogoleMaps
// @include     about:addons
// @version     0.1.0
// @grant       GM_openInTab
// @author      Stephane Gautreau
// @homepage    http://www.actice.net
// @include     file://*choixConsultAppui.htm
// @include     http://*choixConsultAppui.htm
// @require     proj4js/dist/proj4.js
// ==/UserScript==

// === Creation des fonctions GM_setValue et GM_getValue si ancienne version GM 
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    this.GM_getValue=function (key,def) {
        return localStorage[key] || def;
        };
    this.GM_setValue=function (key,value) {
        return localStorage[key]=value;
        };
}

var now = new Date();
console.log( "GM Orange : @include time : " +  now.toString()); 
 
// === Traitement des pages sources 

console.log( "GM Orange : url " + window.location.href);
console.log( "GM Orange : Recherche sources...");

var gsUrl;
var gbPageSource = false;
var loElementLambX, loElementLambY;
var lsLambX, lsLambY;

// Traitement de la page source : Orange appuis
gsUrl = /choixConsultAppui.htm/; 
if (gsUrl.test(window.location.href)) {  
  console.log( "GM Orange : Page choixConsultAppui.htm...");
  
  loElementLambX = document.evaluate(
    "/html/body/form/div/table[2]/tbody/tr/td/table/tbody/tr[1]/td/table/tbody/tr[16]/td[2]/b",
    document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		
  loElementLambY = document.evaluate(
    "/html/body/form/div/table[2]/tbody/tr/td/table/tbody/tr[1]/td/table/tbody/tr[16]/td[4]/b",
    document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    
  lsLambX = loElementLambX.snapshotItem(0).innerHTML;
  lsLambY = loElementLambY.snapshotItem(0).innerHTML;
	
  gbPageSource = true;	
}

// Affichage du bloc Orange sur la page source
if (gbPageSource) {
  if (!document.getElementById( 'divOrangeSource')) { 
    // Creation du formulaire  de contrôle Orange  
  	idDiv = document.createElement('div');
  	idDiv.id = "divOrangeSource";
    idDiv.style = "\
      position:fixed; top:3em; right:5px; z-index:10000;\
      padding: 0 1em 0.25em; background-color: #F80;\
      box-shadow: 2px 2px 4px #420;\
      ";
   	idInner = "\
      <p style='color: #fff;font-family:sans-serif;font-weight:bold; margin:0.5em 0 0;'>Source Lambert II</p>\
      <input type='text' \
        id='GM_LambX' \
        onmouseover='javascript:this.focus();this.select() ;' \
        onmouseout='javascript:this.blur();' \
        readonly \
        />\
      <br />\
      <input type='text' \
        id='GM_LambY' \
        onmouseover='javascript:this.focus();this.select() ;' \
        onmouseout='javascript:this.blur();' \
        readonly \
        />\
      <br />\
      <p style='color: #fff;font-family:sans-serif;font-weight:bold; margin:0.5em 0 0;'>Cible GPS</p>\
      <input type='text' \
        id='GM_Proj4Lat' \
        onmouseover='javascript:this.focus();this.select() ;' \
        onmouseout='javascript:this.blur();' \
        />\
      <br />\
      <input type='text' \
        id='GM_Proj4Long' \
        onmouseover='javascript:this.focus();this.select() ;' \
        onmouseout='javascript:this.blur();' \
        />\
      <br />\
      <input type='text' \
        id='GM_MapsZoom' \
        onmouseover='javascript:this.focus();this.select() ;' \
        onmouseout='javascript:this.blur();' \
        value='14' size='3' \
        />\
        <span style='color: #fff;font-family:sans-serif;'>zoom</span> \
      <br />\
      <button \
        id='GM_BoutonMaps' \
        onclick='window.open(\"https://www.google.com.au/maps/preview/@-15.623037,18.388672,8z\");' >\
        Ouvrir Google MAPS ...\
        </button>\
      ";
      
  	idDiv.innerHTML = idInner;
  	document.body.insertBefore(idDiv, document.body.firstChild);

    // Remplissage des champs Lambert II
    document.getElementById("GM_LambX").value = lsLambX;
    document.getElementById("GM_LambY").value = lsLambY;

    
    // Conversion avec PROJ4JS
    console.log( "GM Orange : Conversion en Lat/Lonng...");

    // //Lambert II : http://spatialreference.org/ref/epsg/27572/
    var lsFirstProjection = //new Proj4js.Proj('EPSG:27572'); 
      "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs";
    // WGS 84 : http://spatialreference.org/ref/epsg/4326/    
    var lsSecondProjection = // new Proj4js.Proj('EPSG:4326'); //Longitude/Latitude
      "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";  

    var lsGPSLat = 0;
    var lsGPSLong = 0;
    [lsGPSLong, lsGPSLat] = proj4( lsFirstProjection, lsSecondProjection, [lsLambX, lsLambY]); 
    // Remplissage des champs Lambert II
    document.getElementById("GM_Proj4Lat").value = lsGPSLat;
    document.getElementById("GM_Proj4Long").value = lsGPSLong;
    document.getElementById("GM_BoutonMaps").onclick = function() { 
      window.open( 
        'https://www.google.fr/maps/preview/@'+ 
        document.getElementById("GM_Proj4Lat").value + ','+ 
        document.getElementById("GM_Proj4Long").value + ','+
        document.getElementById("GM_MapsZoom").value+
        'z');
    };
  }
}

// === AIDE 

// Pour inclure les fichiers locaux, ouvrir about:config ,
// et modifier greasemonkey.fileIsGreaseable à true
// http://stackoverflow.com/questions/9931115/run-greasemonkey-on-html-files-located-on-the-local-filesystem

// Pour autoriser l'usage de fonctions GM_xxxxx, 
// placer le nom de fonction dans la directive @grant
// http://stackoverflow.com/questions/28268847/gm-openintab-or-any-other-gm-function-is-not-defined

// Pour importer des Javascripts 
// http://stackoverflow.com/questions/779739/how-do-i-include-a-remote-javascript-file-in-a-greasemonkey-script
// http://stackoverflow.com/questions/13883610/does-greasemonkey-allow-loading-local-javascript-via-require

// Convertir Lambert II vers GPS
// https://www.unicoda.com/?p=1243
