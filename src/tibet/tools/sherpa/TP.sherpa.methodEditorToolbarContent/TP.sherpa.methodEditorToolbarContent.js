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
 * @type {TP.sherpa.methodEditorToolbarContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.defineSubtype('methodEditorToolbarContent');

//  ------------------------------------------------------------------------

TP.sherpa.methodEditorToolbarContent.Inst.defineMethod('refreshControls',
function(editorIsDirty, uriIsDirty) {

    /**
     * @method refreshControls
     * @summary Refreshes the toolbar buttons based on the supplied dirty flags.
     * @param {Boolean} [editorIsDirty] Whether or not the editor is dirty. If
     *     not supplied, this defaults by querying the editor directly.
     * @param {Boolean} [uriIsDirty] Whether or not the URI the editor is
     *     editing is dirty. If not supplied, this defaults by querying the URI
     *     directly.
     * @returns {TP.sherpa.uriEditorToolbarContent} The receiver.
     */

    var editorTPElem,
        isDirty;

    editorTPElem = TP.byId(this.getAttribute('tibet:ctrl'),
                            this.getNativeDocument());

    isDirty = editorTPElem.isDirty();
    if (isDirty) {
        this.get('applyButton').removeAttribute('disabled');
        this.get('revertButton').removeAttribute('disabled');
    } else {
        this.get('applyButton').setAttribute('disabled', true);
        this.get('revertButton').setAttribute('disabled', true);
    }

    isDirty = editorTPElem.isSourceDirty();
    if (isDirty && TP.isKindOf(this.get('$editorURI'), TP.uri.URL)) {
        this.get('pushButton').removeAttribute('disabled');
    } else {
        this.get('pushButton').setAttribute('disabled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
