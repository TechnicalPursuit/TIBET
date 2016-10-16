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
 * @type {TP.sherpa.methodeditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.defineSubtype('methodeditor');

TP.sherpa.methodeditor.Inst.defineAttribute('serverSourceObject');
TP.sherpa.methodeditor.Inst.defineAttribute('sourceObject');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain supertype processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.$set('sourceObject', null);
    tpElem.$set('serverSourceObject', null);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('applyResource',
function() {

    var newSourceText,
        newMethodObj;

    newSourceText = this.get('editor').getDisplayValue();

    newMethodObj = this.get('sourceObject').replaceWithSourceText(
                                                        newSourceText);

    //  Note that we *must* use '$set()' here to avoid using our setter and
    //  resetting the server source object.
    this.$set('sourceObject', newMethodObj);

    this.set('localSourceContent', TP.src(newMethodObj));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('getSourceID',
function() {

    var obj;

    if (TP.isValid(obj = this.get('sourceObject'))) {
        return obj[TP.DISPLAY];
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineHandler('ValueChange',
function(aSignal) {

    var srcObj,

        owner,
        track,
        name,

        newSrcObj;

    this.callNextMethod();

    srcObj = this.get('sourceObject');

    owner = srcObj[TP.OWNER];
    track = srcObj[TP.TRACK];
    name = srcObj[TP.NAME];

    newSrcObj = owner[track][name];

    if (TP.isValid(newSrcObj)) {

        this.$set('sourceObject', newSrcObj);
        this.$set('serverSourceObject', newSrcObj);

        this.set('remoteSourceContent', TP.src(newSrcObj));
        this.set('localSourceContent', TP.src(newSrcObj));

        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('pushResource',
function(aSignal) {

    var newSourceText,

        serverSourceObject,

        diffPatch,
        patchPath,

        successfulPatch;

    this.applyResource();

    newSourceText = this.get('editor').getDisplayValue();

    serverSourceObject = this.get('serverSourceObject');

    diffPatch = serverSourceObject.getMethodPatch(newSourceText);

    if (TP.notEmpty(diffPatch)) {

        patchPath = TP.objectGetSourcePath(this.get('sourceObject'));

        successfulPatch = TP.uc(patchPath).saveDiffPatch(diffPatch);

        if (successfulPatch) {
            this.set('serverSourceObject', this.get('sourceObject'));
            this.set('remoteSourceContent', this.get('localSourceContent'));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var sourceURI;

    if (TP.isURI(sourceURI = this.get('$sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    sourceURI = TP.uc(TP.objectGetSourcePath(anObj));
    this.observe(sourceURI, 'TP.sig.ValueChange');

    this.$set('$sourceURI', sourceURI);

    this.$set('sourceObject', anObj);
    this.$set('serverSourceObject', anObj);

    this.set('remoteSourceContent', TP.src(anObj));
    this.set('localSourceContent', TP.src(anObj));

    this.render();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
