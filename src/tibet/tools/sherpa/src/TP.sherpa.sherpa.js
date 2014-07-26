//  ============================================================================
//  TP.sherpa.sherpa
//  ============================================================================

/**
 * @type {TP.sherpa.sherpa}
 * @synopsis
 */

//  ----------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.sherpa.sherpa.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem,

        triggerKey;

    console.log('Arise from your slumber Sherpa!');

    //  TODO: Completely update the Sherpa to take advantage of the new template

    return this.callNextMethod();

    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Set up the trigger key

    if (TP.isEmpty(triggerKey = TP.elementGetAttribute(elem, 'sherpa:toggle'))) {
        triggerKey = 'DOM_Shift_Alt_Up_Up';
    }

    this.observe(
            null,
            'TP.sig.AppDidStart',
            function (aSignal) {
                (function () {
                    var uiRoot,
                        tsh;

                    uiRoot = TP.win('UIROOT');

                    tsh = TP.core.TSH.getDefaultInstance();

                    //  Flip the cfg flag that says "yes, we're running in the
                    //  Sherpa".
                    TP.sys.setcfg('tibet.sherpa', true);

                    TP.core.sherpa.construct(
                        TP.hc('window', uiRoot,
                                'model', tsh,
                                'triggerKey', triggerKey
                        ));

                }.fork(100));
            });

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------

TP.sherpa.sherpa.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        return;
    }

    return TP.CONTINUE;
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
