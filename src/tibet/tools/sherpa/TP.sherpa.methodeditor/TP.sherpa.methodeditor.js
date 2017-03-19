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

TP.sherpa.methodeditor.Inst.defineAttribute('$changingURIs');

TP.sherpa.methodeditor.Inst.defineAttribute('sourceURI');

TP.sherpa.methodeditor.Inst.defineAttribute('dirty');

TP.sherpa.methodeditor.Inst.defineAttribute('localSourceContent');

TP.sherpa.methodeditor.Inst.defineAttribute('changeHandler');

TP.sherpa.methodeditor.Inst.defineAttribute('serverSourceObject');
TP.sherpa.methodeditor.Inst.defineAttribute('sourceObject');

TP.sherpa.methodeditor.Inst.defineAttribute(
    'head', {
        value: TP.cpc('> .head', TP.hc('shouldCollapse', true))
    });

TP.sherpa.methodeditor.Inst.defineAttribute(
    'body', {
        value: TP.cpc('> .body', TP.hc('shouldCollapse', true))
    });

TP.sherpa.methodeditor.Inst.defineAttribute(
    'foot', {
        value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))
    });

TP.sherpa.methodeditor.Inst.defineAttribute(
    'editor', {
        value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))
    });

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('applyResource',
function() {

    var editor,

        newSourceText,

        sourceObj,
        newSourceObj;

    editor = this.get('editor');

    if (TP.notValid(newSourceText = editor.getDisplayValue())) {
        editor.setDisplayValue('');

        this.isDirty(false);

        return this;
    }

    this.set('$changingURIs', true);

    sourceObj = this.get('sourceObject');
    newSourceObj = sourceObj.replaceWithSourceText(newSourceText);

    //  NB: We use '$set()' here to avoid calling our setter and blowing other
    //  references away.
    this.$set('sourceObject', newSourceObj);

    this.set('localSourceContent', newSourceText);
    this.isDirty(false);

    //  We need to signal that the source object is now dirty
    this.changed('sourceDirty',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, false,
                            TP.NEWVAL, true));

    this.set('$changingURIs', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineHandler('ValueChange',
function(aSignal) {

    var refreshFunc;

    if (this.get('$changingURIs')) {
        return this;
    }

    if (aSignal.at('aspect') === 'dirty') {
        return this;
    }

    refreshFunc = function(anObj) {

        var newObj;

        newObj = anObj.getRefreshedInstance();

        this.$set('sourceObject', newObj);
        this.$set('serverSourceObject', newObj);
    }.bind(this);

    if (this.isDirty()) {
        TP.confirm('Remote content changed. Abandon local changes?').then(
            function(abandonChanges) {

                if (abandonChanges) {

                    refreshFunc(this.get('sourceObject'));

                    //  NB: This will reset both the localSourceContent cache
                    //  and our editor to whatever is in the URI and set the
                    //  URI's 'dirty' flag to false.
                    this.render();

                    //  We need to signal that the source object is no longer
                    //  dirty
                    this.changed('sourceDirty',
                                    TP.UPDATE,
                                    TP.hc(TP.OLDVAL, true,
                                            TP.NEWVAL, false));

                }
            }.bind(this));
    } else {
        refreshFunc(this.get('sourceObject'));

        this.render();

        //  We need to signal that the source object is no longer dirty
        this.changed('sourceDirty',
                        TP.UPDATE,
                        TP.hc(TP.OLDVAL, true,
                                TP.NEWVAL, false));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('pushResource',
function() {

    var newSourceText,

        serverSourceObject,
        sourceObject,

        diffPatch,

        patchPromise;

    newSourceText = this.get('editor').getDisplayValue();

    //  This is the method as the *server* sees it. This got replaced when we
    //  'applied' whatever changes to it that we did in the applyResource()
    //  method.
    serverSourceObject = this.get('serverSourceObject');

    //  This is the method as the *client* currently sees it.
    sourceObject = this.get('sourceObject');

    diffPatch = serverSourceObject.getMethodPatch(newSourceText);

    if (TP.notEmpty(diffPatch)) {

        patchPromise = TP.tds.TDSURLHandler.sendPatch(
                            this.get('sourceURI'),
                            diffPatch);

        patchPromise.then(
            function(successfulPatch) {
                if (successfulPatch) {
                    this.set('serverSourceObject', sourceObject);
                }
            }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('render',
function() {

    var editor,
        editorObj,

        sourceURI,
        sourceResource,
        sourceStr,

        mimeType;

    editor = this.get('editor');

    sourceURI = this.get('sourceURI');

    if (TP.isValid(sourceURI)) {
        sourceResource = this.get('sourceObject');
    }

    if (TP.notValid(sourceURI) ||
        TP.isEmpty(sourceResource)) {
        this.set('localSourceContent', '');
        editor.setDisplayValue('');

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    //  Try to get a MIME type from the URI - if we can't, then we just treat
    //  the content as plain text.
    if (TP.isEmpty(mimeType = sourceURI.getMIMEType())) {
        mimeType = TP.PLAIN_TEXT_ENCODED;
    }

    //  CodeMirror won't understand XHTML as distinct from XML.
    if (mimeType === TP.XHTML_ENCODED) {
        mimeType = TP.XML_ENCODED;
    }

    //  Set the editor's 'mode' to the computed MIME type
    editorObj.setOption('mode', mimeType);

    sourceStr = TP.src(sourceResource);

    this.set('localSourceContent', sourceStr);
    this.isDirty(false);

    editorObj.setValue(sourceStr);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).uponRepaint(this.getNativeWindow());
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('revertResource',
function() {

    var editor,
        sourceText,
        editorObj,
        sourceObj,
        serverSourceObj;

    editor = this.get('editor');

    sourceObj = this.get('sourceObject');
    serverSourceObj = this.get('serverSourceObject');

    sourceText = TP.src(serverSourceObj);

    if (TP.notValid(sourceText)) {
        editor.setDisplayValue('');
        this.set('localSourceContent', '');

        this.isDirty(false);

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setValue(sourceText);

    this.set('localSourceContent', sourceText);
    this.isDirty(false);

    sourceObj = sourceObj.replaceWith(serverSourceObj);

    //  NB: We use '$set()' here to avoid calling our setter and blowing other
    //  references away.
    this.$set('sourceObject', sourceObj);

    //  We need to signal that the source object is no longer dirty
    this.changed('sourceDirty',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, true,
                            TP.NEWVAL, false));

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).uponRepaint(this.getNativeWindow());
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var sourceURI;

    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    sourceURI = TP.uc(TP.objectGetSourcePath(anObj));

    if (!TP.isURI(sourceURI)) {
        this.render();

        return this;
    }

    this.observe(sourceURI, 'TP.sig.ValueChange');

    this.$set('sourceURI', sourceURI);

    this.$set('sourceObject', anObj);
    this.$set('serverSourceObject', anObj);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('updateEditorState',
function() {

    var editorObj,
        currentEditorStr,

        localSourceStr;

    editorObj = this.get('editor').$get('$editorObj');

    currentEditorStr = editorObj.getValue();

    if (TP.notValid(localSourceStr = this.get('localSourceContent'))) {
        return this;
    }

    this.isDirty(currentEditorStr !== localSourceStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('teardown',
function() {

    var sourceURI,
        editorObj;

    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    editorObj = this.get('editor').$get('$editorObj');
    editorObj.off('change', this.get('changeHandler'));

    this.$set('editor', null, false);

    this.$set('sourceObject', null, false);
    this.$set('serverSourceObject', null, false);

    this.$set('changeHandler', null, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
