// (function() {
//     var a = 1;
//     var head = document.getElementsByTagName("head")[0];

//     function addScript(src, defer=true, text=null) {
//         var script = document.createElement("script");
//         script.language = "javascript";
//         script.src = src;
//         script.defer = defer;
//         if (text) {
//             script.
//         }
//         head.appendChild(script);
//     }
//     addScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js", false);
//     addScript("javascripts/lunar.js");

//     addScript("javascripts/calendar.js");

// }) ()

function createElement(tagName, className, innerText) {
    let ele = document.createElement(tagName);
    if (className) {
        ele.className = className;
    }
    if (innerText) {
        ele.innderText = ele.textContent = innerText;
    }
    return ele;
}