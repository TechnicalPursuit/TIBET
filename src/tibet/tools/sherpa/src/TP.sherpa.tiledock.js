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
 * @type {TP.sherpa.tiledock}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:tiledock');

TP.sherpa.tiledock.Inst.defineAttribute('tileEntries');

TP.sherpa.tiledock.Inst.defineAttribute(
        'tilelist',
        {value: TP.cpc('> .tilelist', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('init',
function() {

    this.callNextMethod();

    this.set('tileEntries', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('addTileEntry',
function(tileID, tileName) {

    this.get('tileEntries').atPut(tileID, tileName);

    this.refresh();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('refresh',
function() {

    /**
     * @method refresh
     */

    var targetList,
        data,
        items;

    targetList = this.get('tilelist');

    data = this.get('tileEntries').getItems();

    items = TP.extern.d3.select(TP.unwrap(targetList)).selectAll('li').data(data);
    items.enter().append('li');
    items.html(function(d) {return '<a href="#" onclick="TP.byId(\'' + d.first() + '\').toggle(\'hidden\')">' + d.last() + '</a>'; });
    items.exit().remove();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
