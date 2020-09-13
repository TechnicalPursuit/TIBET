/* global fromPanel:true
*/

var toPanel;

toPanel = function(msg) {
    document.body.textContent += '\n' + msg;
};

document.documentElement.onclick = function() {
    //  No need to check for the existence of `fromPanel`, because the panel can
    //  only be clicked when it's visible.
    fromPanel('Hi there!');
};
