//  ========================================================================
/**
 * @copyright Copyright (C) 2020, Technical Pursuit Inc. (TPI) All Rights
 *     Reserved.
 */
//  ========================================================================

window.addEventListener('load',
    function() {
        if (window.TP && TP.boot) {

            console.log('booting TIBET');

            TP.boot.launch();

            return;
        }

        //  If TP isn't real it means tibet_loader wasn't found. Try to notify
        //  about that in a reasonable fashion so the UI doesn't just look hung.
        if (top.UIBOOT && top.UIBOOT.contentDocument) {
            top.UIBOOT.contentDocument.getElementById('BOOT-IMAGE').src =
                '../media/alert.png';
            top.UIBOOT.contentDocument.getElementById('BOOT-SUBHEAD').innerHTML =
                'Error loading. Was the project initialized via `tibet init`?';
        }
    },
    false);

document.querySelector('.image-link').addEventListener(
    'click',
    function() {
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
    },
    false);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
