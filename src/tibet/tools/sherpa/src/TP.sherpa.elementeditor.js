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
 * @type {TP.sherpa.elementeditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('elementeditor');

TP.sherpa.elementeditor.Inst.defineAttribute('didSetup');

TP.sherpa.elementeditor.Inst.defineAttribute('remoteSourceTemplate');
TP.sherpa.elementeditor.Inst.defineAttribute('localSourceTemplate');

TP.sherpa.elementeditor.Inst.defineAttribute('sourceObject');

TP.sherpa.elementeditor.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.sherpa.elementeditor.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.sherpa.elementeditor.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

TP.sherpa.elementeditor.Inst.defineAttribute(
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('acceptMarkup',
function() {

    var newSourceText,
        newElem,

        halo,

        templateURI,
        sourceObject,
        newSourceTPElem;

    //  Grab the new text from the editor.
    newSourceText = this.get('editor').getDisplayValue();

    //  Make sure we can turn it into a node.
    if (!TP.isElement(newElem = TP.nodeFromString(newSourceText))) {
        //  TODO: Warn
        return this;
    }

    halo = TP.byId('SherpaHalo', TP.win('UIROOT'));
    halo.blur();

    sourceObject = this.get('sourceObject');

    if (TP.isValid(templateURI = sourceObject.getType().getResourceURI(
                                        'template', TP.ietf.Mime.XHTML))) {
        templateURI.setResource(TP.wrap(newElem));
    }

    this.set('localSourceTemplate', newSourceText);

    newSourceTPElem = sourceObject.replaceContent(newElem);
    halo.focusOn(newSourceTPElem);

    this.$set('sourceObject', newSourceTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineHandler('MarkupAccept',
function(aSignal) {

    this.acceptMarkup();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineHandler('MarkupPush',
function(aSignal) {

    var newSourceText,

        sourceObject,

        templateURI,

        patchSourceLocation,
        sourceLocation,

        patchText;

    this.acceptMarkup();

    sourceObject = this.get('sourceObject');

    if (TP.isValid(templateURI = sourceObject.getType().getResourceURI(
                                        'template', TP.ietf.Mime.XHTML))) {
        sourceLocation = TP.uriInTIBETFormat(templateURI.getLocation());

        patchSourceLocation = sourceLocation.slice(
                                sourceLocation.lastIndexOf('/') + 1);

        patchText = TP.extern.JsDiff.createPatch(
                            patchSourceLocation,
                            this.get('remoteSourceTemplate'),
                            this.get('localSourceTemplate'));

        TP.bySystemId('Sherpa').postPatch(patchText, sourceLocation);

        this.set('remoteSourceTemplate', this.get('localSourceTemplate'));
    } else {
        newSourceText = sourceObject.getDocument().asString();
        alert('there was no template - must be a whole page: ' + newSourceText);
        sourceLocation = sourceObject.getSourcePath();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('render',
function() {

    var editor,
        str;

    if (TP.notTrue(this.$get('didSetup'))) {
        this.setup();
    }

    editor = this.get('editor');

    if (TP.notValid(str = this.get('localSourceTemplate'))) {
        editor.setDisplayValue('');

        return this;
    }

    editor.setDisplayValue(str);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var editorObj;

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('mode', 'xml');
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

TP.sherpa.elementeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var templateURI,
        template;

    this.$set('sourceObject', anObj);

    if (TP.isValid(templateURI = anObj.getType().getResourceURI(
                                        'template', TP.ietf.Mime.XHTML))) {

        //  NB: This should already be loaded, since we got here by selecting a
        //  custom element
        template = templateURI.getResource(
                TP.hc('async', false, 'resultType', TP.TEXT, 'refresh', true)).get('result');

        this.set('remoteSourceTemplate', template);
        this.set('localSourceTemplate', template);
    }

    this.render();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
