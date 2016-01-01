//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.tile}
 */

//  ------------------------------------------------------------------------

TP.sherpa.tile.defineSubtype('sherpa:editortile');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineAttribute(
        'breadcrumb',
        {value: TP.cpc('sherpa|breadcrumb', TP.hc('shouldCollapse', true))});

TP.sherpa.editortile.Inst.defineAttribute('displays');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('getDisplayIdentifier',
function(anObject) {

    if (TP.isFunction(anObject)) {
        if (TP.isMethod(anObject)) {
            return 'Method';
        }
    } else if (TP.isType(anObject)) {
        return 'Type';
    } else if (TP.isKindOf(anObject, TP.core.ElementNode)) {
        return 'TP.core.ElementNode';
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineHandler('DetachTile',
function(anObject) {

    var retVal;

    //  Once it's detached, you cannot redock it into the console GUI stream.
    if (!this.hasAttribute('attachedto')) {
        this.toggle('hidden');

        return this;
    }

    retVal = this.callNextMethod();

    //  Force whatever is currently displayed to render
    this.get('currentDisplay').render();

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setSourceObject',
function(anObject) {

    /**
     * @method setID
     */

    var currentDisplay,

        identifier,
        displayTPElem;

    this.get('breadcrumb').setSourceObject(anObject);

    if (TP.isValid(currentDisplay = this.get('currentDisplay'))) {
        currentDisplay.toggle('hidden');
    }

    if (TP.notValid(identifier = this.getDisplayIdentifier(anObject))) {
        return this;
    }

    displayTPElem = this.get('displays').at(identifier);

    if (TP.notValid(displayTPElem)) {
        if (TP.isValid(displayTPElem = this.setupDisplayFor(anObject))) {
            this.get('displays').atPut(identifier, displayTPElem);
        }
    }

    if (TP.isValid(displayTPElem)) {

        this.set('currentDisplay', displayTPElem);
        displayTPElem.setSourceObject(anObject);
        displayTPElem.toggle('hidden');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setup',
function() {

    var resultBody,
        breadCrumbTPElem;

    resultBody = this.get('body');

    breadCrumbTPElem = resultBody.addContent(
                    TP.sherpa.breadcrumb.getResourceElement(
                        'template',
                        TP.ietf.Mime.XHTML));

    breadCrumbTPElem.awaken();
    breadCrumbTPElem.set('sourceID', this.getID());

    this.set('displays', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setupDisplayFor',
function(anObject) {

    var displayType,

        resultBody,
        displayTPElem;

    displayType = TP.getSherpaStructuredEditor(anObject);

    if (TP.isType(displayType)) {
        resultBody = this.get('body');

        displayTPElem = resultBody.addContent(
                        displayType.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML));

        displayTPElem.awaken();

        return displayTPElem;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getSherpaStructuredEditor',
function(anObject) {

    if (TP.canInvoke(anObject, 'getSherpaStructuredEditor')) {
        return anObject.getSherpaStructuredEditor();
    }

    return null;
});

//  ---

Function.Inst.defineMethod('getSherpaStructuredEditor',
function() {

    if (TP.isMethod(this)) {
        return TP.sherpa.methodeditor;
    }

    return null;
});

//  ---

TP.lang.RootObject.Type.defineMethod('getSherpaStructuredEditor',
function() {

    return TP.sherpa.typedisplay;
});

//  ---

TP.core.ElementNode.Inst.defineMethod('getSherpaStructuredEditor',
function() {

    return TP.sherpa.elementeditor;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
