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

TP.sherpa.sherpa.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        triggerKey,

        tsh;


    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Set up the trigger key

    if (TP.isEmpty(triggerKey =
                    TP.elementGetAttribute(elem, 'sherpa:toggle'))) {
        triggerKey = 'DOM_Alt_Shift_Up_Up';
    }

    tsh = TP.core.TSH.getDefaultInstance();

    TP.core.sherpa.construct(
        TP.hc('window', TP.nodeGetWindow(elem),
                'model', tsh,
                'triggerKey', triggerKey
        ));

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
