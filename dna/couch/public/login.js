/* global login */
document.getElementById('login').addEventListener(
'submit',
function(evt) {

    var path;

    //  Grab the top-level pathname and, if it has real pathname content, use
    //  that as the TDS's home URI.
    path = top.location.pathname;
    if (path) {
        if (path.endsWith('/')) {
            path = path.slice(0, path.lastIndexOf('/'));
        }
        top.sessionStorage.setItem('TDS.home.uri', path);
    }

    evt.preventDefault();
    login();
},
false);
