    
function newBrowserDetect() {
    var s = window.navigator.userAgent;
    var obj = bowser.parse(s);
    var rawPlatform = obj && obj.platform && obj.platform.type;
    if (rawPlatform == 'mobile') {
        return 'mobile'
    } else {
        var rawBrowser = obj && obj.browser && obj.browser.name
        if (rawBrowser == BROWSER_MAP.ie || rawBrowser == BROWSER_MAP.edge) {
            return 'notstart'
        } else {
            return 'canstart'
        }
    }
}

function oldBrowserDetect() {
    function looksLikeFirefox() {
        return window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }

    function looksLikeSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    function looksLikeMSIE() {
        if (/MSIE 10/i.test(navigator.userAgent)) {
            /* internet explorer 10 */
            return true
        }

        if (/MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent)) {
            /* internet explorer 9 or 11 */
            return true
        }
        
        return false
    }

    function looksLikeMSEdge() {
        if (/Edge\/\d./i.test(navigator.userAgent)) {
            /* Microsoft Edge */
            return true
        }
        
        return false
    }

    function looksLikeDesktopChrome() {
        var isChromium = window.chrome,
            winNav = window.navigator,
            vendorName = winNav.vendor,
            isOpera = winNav.userAgent.indexOf("OPR") > -1,
            isIEedge = winNav.userAgent.indexOf("Edge") > -1,
            isIOSChrome = winNav.userAgent.match("CriOS");

        if (isIOSChrome) {
            return false;
        } else if (
            isChromium !== null &&
            typeof isChromium !== "undefined" &&
            vendorName.indexOf("Google") > -1 &&
            isOpera === false &&
            isIEedge === false
        ) {
            return true;
        } else {
            return false;
        }
    }

    function looksMobile() {
        return /Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent);
    }

    if (looksMobile()) {
        return 'mobile'
    } else if (looksLikeMSEdge() || looksLikeMSIE()) {
        return 'notstart'
    } else {
        return 'canstart'
    }
}

function goImpl() {
    var typ = undefined
    try {
        typ = newBrowserDetect()
    } catch (e) {
        console.err(e.toString());
    }

    if (typ == undefined) {
        try {
            typ = oldBrowserDetect()
        } catch (e) {
            console.err(e.toString());
        }
    }

    if (typ == 'mobile') {
        document.getElementById("spempty").style.display = "none";
        document.getElementById("spcouldnotstart").style.display = "none";
        document.getElementById("spcouldstart").style.display = "none";
        document.getElementById("spcouldnotstartmobile").style.display = "block";
    } else if (typ == 'notstart') {
        document.getElementById("spempty").style.display = "none";
        document.getElementById("spcouldnotstart").style.display = "block";
        document.getElementById("spcouldstart").style.display = "none";
        document.getElementById("spcouldnotstartmobile").style.display = "none";
    } else {
        document.getElementById("spempty").style.display = "none";
        document.getElementById("spcouldnotstart").style.display = "none";
        document.getElementById("spcouldstart").style.display = "block";
        document.getElementById("spcouldnotstartmobile").style.display = "none";
    }
}

function go() {
    try {
        goImpl()
    } catch (e) {
        console.err(e.toString());
    }  
}

go()
