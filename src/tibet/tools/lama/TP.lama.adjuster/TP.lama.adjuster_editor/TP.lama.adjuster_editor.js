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
 * @type {TP.lama.adjuster_editor}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('adjuster_editor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.adjuster_editor.Inst.defineAttribute('value');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.adjuster_editor.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver.
     * @returns {TP.core.hash} The value of the receiver.
     */

    return this.$get('value');
});

//  ------------------------------------------------------------------------

TP.lama.adjuster_editor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.lama.adjuster_editor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.adjuster_editor.Inst.defineMethod('setValue',
function(aValue) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     capture the data (property name, property value, rule hosting the
     *     property) that the receiver will be managing.
     * @param {TP.core.Hash} aValue The hash containing the data that the
     *     receiver will manage.
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    this.$set('value', aValue, false);

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
