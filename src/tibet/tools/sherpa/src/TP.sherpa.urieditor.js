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
 * @type {TP.sherpa.urieditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('urieditor');

TP.sherpa.urieditor.Inst.defineAttribute('didSetup');

TP.sherpa.urieditor.Inst.defineAttribute('remoteSourceContent');
TP.sherpa.urieditor.Inst.defineAttribute('localSourceContent');

TP.sherpa.urieditor.Inst.defineAttribute('sourceObject');

TP.sherpa.urieditor.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('acceptResource',
function() {

    var newSourceText,
        sourceObj,
        resourceObj,
        contentObj;

    newSourceText = this.get('editor').getDisplayValue();

    sourceObj = this.get('sourceObject');

    resourceObj = sourceObj.getResource();

    contentObj = resourceObj.get('result');
    if (TP.isKindOf(contentObj, TP.core.Content)) {
        contentObj.setData(newSourceText);
    } else {
        sourceObj.setResource(newSourceText);
        sourceObj.$changed();
    }

    this.set('localSourceContent', newSourceText);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourceAccept',
function(aSignal) {

    this.acceptResource();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourcePush',
function(aSignal) {

    var sourceObject,

        patchableURI,

        patchSourceLocation,
        sourceLocation,

        patchText;

    this.acceptResource();

    sourceObject = this.get('sourceObject');

    //  TODO: Fix this!
    patchableURI = true;

    sourceLocation = TP.uriInTIBETFormat(sourceObject.getLocation());
    if (patchableURI) {

        patchSourceLocation = sourceLocation.slice(
                                sourceLocation.lastIndexOf('/') + 1);

        patchText = TP.extern.JsDiff.createPatch(
                            patchSourceLocation,
                            this.get('remoteSourceContent'),
                            this.get('localSourceContent'));

        TP.bySystemId('Sherpa').postPatch(patchText, sourceLocation);

        this.set('remoteSourceContent', this.get('localSourceContent'));
    } else {

        //  An unpatchable URI

        // newSourceText = this.get('localSourceContent');
        // sourceLocation = sourceObject.getSourcePath();
        TP.warn('not a patchable URI: ' + sourceLocation);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('render',
function() {

    var editor,
        editorObj,

        sourceObj,
        sourceStr,

        mimeType,

        str;

    if (TP.notTrue(this.$get('didSetup'))) {
        this.setup();
    }

    editor = this.get('editor');

    if (TP.notValid(sourceStr = this.get('localSourceContent'))) {
        editor.setDisplayValue('');

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    sourceObj = this.get('sourceObject');

    //  Try to get a MIME type from the URI - if we can't, then we just treat
    //  the content as plain text.
    if (TP.isEmpty(mimeType = sourceObj.getMIMEType())) {
        mimeType = TP.PLAIN_TEXT_ENCODED;
    }

    //  CodeMirror won't understand XHTML as distinct from XML.
    if (mimeType === TP.XHTML_ENCODED) {
        mimeType = TP.XML_ENCODED;
    }

    //  Set the editor's 'mode' to the computed MIME type
    editorObj.setOption('mode', mimeType);

    str = sourceStr;
    editorObj.setValue(str);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var editorObj;

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    //  By forking this, we give the console a chance to focus the input cell
    //  (which it really wants to do after executing a command) and then we can
    //  shift the focus back to us.
    (function() {
        this.get('editor').refreshEditor();
        this.get('editor').focus();
    }).bind(this).fork(500);

    this.$set('didSetup', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var fetchOptions,
        content;

    this.$set('sourceObject', anObj);

    fetchOptions = TP.hc('async', false,
                            'resultType', TP.TEXT,
                            'refresh', true);
    content = anObj.getResource(fetchOptions).get('result');

    this.set('remoteSourceContent', content);
    this.set('localSourceContent', content);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
