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

TP.sherpa.tile.defineSubtype('editortile');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

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
    } else if (TP.isKindOf(anObject, TP.core.URI)) {
        return 'TP.core.URI';
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineHandler('DetachTile',
function(anObject) {

    var retVal;

    retVal = this.callNextMethod();

    //  Force whatever is currently displayed to render
    this.get('currentDisplay').render();

    return retVal;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setSourceData',
function(dataRecord) {

    /**
     * @method setSourceData
     */

    var srcObject,

        currentDisplay,

        identifier,

        displayTPElem,

        displayType;

    srcObject = dataRecord.at('rawData');

    if (TP.isValid(currentDisplay = this.get('currentDisplay'))) {
        currentDisplay.toggle('hidden');
    }

    if (srcObject === TP.TSH_NO_VALUE) {
        identifier = dataRecord.at('request').at('tiledOutputEditorType');
    } else {
        identifier = this.getDisplayIdentifier(srcObject);
    }

    if (TP.notValid(identifier)) {
        return this;
    }

    displayTPElem = this.get('displays').at(identifier);
    if (TP.notValid(displayTPElem)) {

        if (srcObject === TP.TSH_NO_VALUE) {
            displayType = TP.sys.getTypeByName(identifier);
        } else {
            displayType = TP.getSherpaStructuredEditor(srcObject);
        }

        if (TP.isValid(displayTPElem = this.setupDisplayFor(displayType))) {
            this.get('displays').atPut(identifier, displayTPElem);
        }
    }

    if (TP.isValid(displayTPElem)) {
        this.set('currentDisplay', displayTPElem);

        displayTPElem.setSourceObject(srcObject);
        displayTPElem.toggle('hidden');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setup',
function() {

    this.set('displays', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.editortile.Inst.defineMethod('setupDisplayFor',
function(displayType) {

    var resultBody,
        displayTPElem;

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

//  ---

TP.core.ElementNode.Inst.defineMethod('getSherpaStructuredEditor',
function() {

    return TP.sherpa.elementeditor;
});

//  ---

TP.core.URI.Inst.defineMethod('getSherpaStructuredEditor',
function() {

    return TP.sherpa.urieditor;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
