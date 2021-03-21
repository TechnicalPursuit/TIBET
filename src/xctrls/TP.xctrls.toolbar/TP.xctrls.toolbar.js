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
 * @type {TP.xctrls.toolbar}
 * @summary Manages toolbar XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:toolbar');

TP.xctrls.toolbar.addTraits(TP.xctrls.SwitchableElement);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.toolbar.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.toolbar.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Inst.defineAttribute('subitems',
    TP.cpc('> xctrls|itemgroup > *', TP.hc('shouldCollapse', false)));

TP.xctrls.toolbar.Inst.defineAttribute('selectedItem',
    TP.cpc('> xctrls|itemgroup > *[pclass|selected]', TP.hc('shouldCollapse', true)));

TP.xctrls.toolbar.Inst.defineAttribute('itemWithValue',
    TP.xpc('./xctrls:itemgroup/xctrls:value[text() = "{{0}}"]/..',
        TP.hc('shouldCollapse', true)));

TP.xctrls.toolbar.Inst.defineAttribute('selectedValue',
    TP.xpc('string(./xctrls:itemgroup/*[@pclass:selected = "true"]/xctrls:value)',
        TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Inst.defineMethod('getAllItemContent',
function() {

    /**
     * @method getAllItemContent
     * @summary Returns all of the receiver's item content, no matter whether it
     *     was statically supplied or generated dynamically.
     * @returns {TP.xctrls.item[]} All of the receiver's item content.
     */

    return this.get('subitems');
});

//  ------------------------------------------------------------------------

TP.xctrls.toolbar.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants =
        this.get('./*[not(@tibet:assembly = \'xctrls:toolbar\')]');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
