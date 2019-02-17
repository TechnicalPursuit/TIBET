//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.panel}
 * @summary Manages panel XControls.
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('xctrls:panel');

TP.xctrls.panel.addTraits(TP.xctrls.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.panel.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.panel.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIDeselect',
            'TP.sig.UISelect'
            ));

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.panel.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.panel.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.panel.Inst.defineAttribute('contentElement',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.panel.Inst.defineMethod('refresh',
function(shouldRender, shouldRefreshBindings) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound aspects
     *     in the receiver and all of the descendants of the receiver that are
     *     bound.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @param {Boolean} [shouldRefreshBindings] Whether or not to refresh data
     *     bindings from the receiver down (in a 'sparse' fashion). If not
     *     supplied, this parameter will default to true.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var contentTPElem;

    //  Grab the content element under the existing panel that we
    //  found with that content key.
    contentTPElem = this.get('contentElement');

    return contentTPElem.refresh(shouldRender, shouldRefreshBindings);
});

//  ------------------------------------------------------------------------

TP.xctrls.panel.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the value of the receiver or adds the supplied content as
     *     another panel if the panel matching the value cannot be found.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.xctrls.panel} The xctrls:panel matching the value or the
     *     newly added panel.
     */

    var contentTPElem,
        firstContentChildTPElem,

        hasContent,

        tpElemToObserve,

        handler;

    contentTPElem = this.get('contentElement');
    firstContentChildTPElem = contentTPElem.getFirstChildElement();

    hasContent = TP.isValid(firstContentChildTPElem);

    if (TP.isValid(aContentObject)) {

        if (hasContent) {
            tpElemToObserve = firstContentChildTPElem;
        } else {
            /* eslint-disable consistent-this */
            tpElemToObserve = this;
            /* eslint-enable consistent-this */
        }

        //  Observe the new panel when it gets attached to the DOM. When it
        //  does, refresh its bound data.
        handler = function() {

            //  Make sure to ignore here - otherwise, we'll fill up the
            //  signal map.
            handler.ignore(tpElemToObserve, 'TP.sig.AttachComplete');

            this.refresh();

        }.bind(this);

        handler.observe(tpElemToObserve, 'TP.sig.AttachComplete');
    }

    //  Grab the panel's content element and set its content.
    return contentTPElem.setContent(aContentObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
