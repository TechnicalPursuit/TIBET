var check;

try {
    /* eslint-disable no-unused-vars */
    check = top.document;
    /* eslint-enable no-unused-vars */
} catch (e) {
    if (window.location.protocol.indexOf('file') === 0) {
        document.getElementById('BOOT-SUBHEAD').innerHTML =
            'File launch failed. Check console for more information.';
    }
}

/* eslint-disable func-style,no-unused-vars */
function stageAction() {
/* eslint-enable func-style,no-unused-vars */
    /**
     * Respond to user clicks on the stage image, which can serve as an action
     * trigger. The most common action is to continue after a pause.
     */

    // For now TIBET always uses 'top' as the code frame.
    try {
        top.TP.boot.$stageAction();
    } catch (e) {
        // TODO: continue to ignore this?
    }
}
