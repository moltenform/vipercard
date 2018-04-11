
function looksLikeMSIE() {
    if (/MSIE 10/i.test(navigator.userAgent)) {
       // This is internet explorer 10
       return true
    }

    if (/MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent)) {
        // This is internet explorer 9 or 11
        return true
    }
    
    return false
}

function looksLikeMSEdge() {
    if (/Edge\/\d./i.test(navigator.userAgent)) {
        // This is Microsoft Edge
        return true
    }
    
    return false
}

function looksLikeFirefox() {
    return window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

function looksLikeSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
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

window.addEventListener("load", function load(event) {
    try {
        document.getElementById("spcouldnotstart").style.display = "";
        if (looksMobile()) {
            document.getElementById("spcouldnotstartmobile").style.display = "";
            document.getElementById("spcouldnotstart").style.display = "none";
        } else if (looksLikeMSEdge() || looksLikeMSIE()) {
            document.getElementById("spcouldnotstart").style.display = "";
        } else {
            document.getElementById("spcouldstart").style.display = "";
            document.getElementById("spcouldnotstart").style.display = "none";
        }
    } catch (e) {
        console.err(e.toString());
    }
});
