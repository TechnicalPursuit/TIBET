//  ============================================================================
//  TP.tibet.sherpa
//  ============================================================================

/**
 * @type {TP.sherpa.sherpa}
 * @synopsis
 */

//  ----------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.tibet.sherpa.Type.defineMethod('tshAwakenDOM',
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

        blankURI,
        sherpaURI,

        frameElem,
    
        func;

    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception
        return;
    }

    blankURI = TP.uc(TP.sys.cfg('tibet.blankpage'));
    sherpaURI  = TP.uc('~ide_root/xhtml/sherpa_framing.xhtml');

    //  Build an iframe element to contain our custom element.
    frameElem = TP.elem(
        TP.join('<iframe xmlns="', TP.w3.Xmlns.XHTML, '"',
                ' id="UISCREENS"',
                ' style="position: absolute; border: none;',
                ' top: 0px; left: 0px; width: 100%; height: 100%"',
                ' src="' + blankURI.getLocation() + '"></iframe>'));

    frameElem = TP.nodeAppendChild(elem.parentNode, frameElem, false);

    frameElem.addEventListener(
            'load',
            func = function() {
                this.removeEventListener('load', func, false);
                TP.wrap(this).setContent(sherpaURI);
            },
            false);

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
