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
 * @type {TP.electron.menu}
 */

//  ------------------------------------------------------------------------

TP.electron.ActionTag.defineSubtype('electron:menu');

//  Note how this property is TYPE_LOCAL, by design.
TP.electron.menu.defineAttribute('styleURI', TP.NO_RESULT);
TP.electron.menu.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  NB: These should be coordinated with the list in the Electron menu plugin.
TP.electron.menu.Type.defineConstant('MENU_TEMPLATE_SLOT_NAMES',
    TP.ac(
            'accelerator',
            'acceleratorWorksWhenHidden',
            'checked',
            'enabled',
            'eventInfo',    //  TIBET-specific
            'icon',
            'id',
            'label',
            'registerAccelerator',
            'role',
            'selector',     //  Undocumented
            'sharingItem',
            'sublabel',
            'tooltip',
            'type',
            'visible'
    ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.electron.menu.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        description;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  If the wrapped element is the 'outermost' menu (i.e. there's no menus
    //  'above' it), then process it and it's descendants into a configuration
    //  POJO and signal the Electron main that we want to add those menus.
    if (tpElem.isOutermostOfSameKind()) {

        //  Allocate an Array to gather the menu descriptions into and do it.
        //  This data structure will be 'built' as this method is called
        //  recursively for submenus.
        description = TP.ac();
        tpElem.gatherMenuDescription(description);

        TP.electron.ElectronMain.signalMain('TP.sig.AddMenuItem',
            {
                parentId: 'main',
                label: tpElem.getAttribute('label'),
                submenu: description
            });
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.electron.menu.Inst.defineMethod('gatherMenuDescription',
function(description) {

    /**
     * @method gatherMenuDescription
     * @summary Gathers the menu description into the supplied Array,
     *     recursively calling itself to process submenus.
     * @param {Array} description The menu description that will be built up as
     *     this method processes the receivers descendants.
     * @returns {TP.electron.ElectronMessageSource} The receiver.
     */

    var itemTPElems,
        attrList;

    //  Grab all *direct children* that are either menus or menuitems.
    itemTPElems = this.get('> electron|menu, > electron|menuitem');

    //  The list of attributes to retrieve from each item is defined as a type
    //  constant.
    attrList = this.getType().get('MENU_TEMPLATE_SLOT_NAMES');

    if (TP.notEmpty(itemTPElems)) {

        //  Iterate over each child, gathering its attributes into configuration
        //  object and recursively calling this method to process submenus.
        itemTPElems.forEach(
            function(anItemTPElem) {
                var configPOJO,
                    clickSignal;

                configPOJO = this.getType().buildConfigObjectFromAttributes(
                                anItemTPElem.getNativeNode(), attrList);

                //  The 'on:click' is handled specially.
                clickSignal = TP.elementGetAttribute(anItemTPElem.getNativeNode(),
                                                    'on:click',
                                                    true);

                //  If we actually had a value here, tell our overall
                //  Application instance to observe it (for dispatching
                //  purposes) and set an Array on the 'eventInfo' slot that will
                //  be used by the menu plugin on the Electron main side to
                //  dispatch the event.
                if (TP.notEmpty(clickSignal)) {
                    TP.sys.getApplication().observe(
                        TP.electron.ElectronMain, clickSignal);
                    configPOJO.eventInfo = ['TIBET/' + clickSignal];
                }

                description.push(configPOJO);

                //  If the item we processed was itself a menu, allocate an
                //  Array on the 'submenu' slot and recursively call this method
                //  with that Array.
                if (TP.isKindOf(anItemTPElem, TP.electron.menu)) {
                    configPOJO.submenu = TP.ac();
                    anItemTPElem.gatherMenuDescription(configPOJO.submenu);
                }
            }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
