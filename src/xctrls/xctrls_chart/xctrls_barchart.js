//  ========================================================================
/*
NAME:   xctrls_barchart.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.barchart}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.xctrls.chart.defineSubtype('barchart');

//  ------------------------------------------------------------------------

TP.xctrls.barchart.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    var data,

        body,

        d3,

        w,
        h,
        x,
        y,

        vis,
        bars,
        rules;

    if (TP.notValid(data = this.get('currentData'))) {
        return;
    }

    if (!TP.isElement(
            body = this.get('tpIFrame').getNativeContentDocument().body)) {
        //  TODO: Raise an exception - big trouble
        return;
    }

    TP.nodeEmptyContent(body);

    d3 = this.$getD3Inst();

    //var data = TP.extern.d3.range(10).map(Math.random);

    w = 430;
    h = 230;

    x = TP.extern.d3.scale.linear().domain([0, 1]).range([0, w]);
    y = TP.extern.d3.scale.ordinal().domain(TP.extern.d3.range(data.length)).rangeBands(
                                                            [0, h], 0.2);

    /*
    x = TP.extern.d3.scale.linear().domain([0, 1]).range([0, w]);
    y = TP.extern.d3.scale.linear().domain([1, 0]).range([h, 0]);
    */

    vis = TP.extern.d3.select(body)
            .append('svg:svg')
            .attr('width', w + 40)
            .attr('height', h + 20)
            .append('svg:g')
            .attr('transform', 'translate(20,0)');

    bars = vis.selectAll('g.bar')
            .data(data)
            .enter().append('svg:g')
            .attr('class', 'bar')
            .attr('transform',
                    function(d, i) {

                        return 'translate(0,' + y(i) + ')';
                    });

    bars.append('svg:rect')
            .attr('fill', 'steelblue')
            .attr('width', x)
            .attr('height', y.rangeBand());

    bars.append('svg:text')
            .attr('x', x)
            .attr('y', y.rangeBand() / 2)
            .attr('dx', -6)
            .attr('dy', '.35em')
            .attr('fill', 'white')
            .attr('text-anchor', 'end')
            .text(x.tickFormat(100));

    bars.append('svg:text')
            .attr('x', 0)
            .attr('y', y.rangeBand() / 2)
            .attr('dx', -6)
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(function(d, i) {

                        return String.fromCharCode(65 + i);
                    });

    rules = vis.selectAll('g.rule')
            .data(x.ticks(10))
            .enter().append('svg:g')
            .attr('class', 'rule')
            .attr('transform',
                    function(d) {

                        return 'translate(' + x(d) + ',0)';
                    });

    rules.append('svg:line')
            .attr('y1', h)
            .attr('y2', h + 6)
            .attr('stroke', 'black');

    rules.append('svg:line')
            .attr('y1', 0)
            .attr('y2', h)
            .attr('stroke', 'white')
            .attr('stroke-opacity', 0.3);

    rules.append('svg:text')
            .attr('y', h + 9)
            .attr('dy', '.71em')
            .attr('text-anchor', 'middle')
            .text(x.tickFormat(10));

    vis.append('svg:line')
            .attr('y1', 0)
            .attr('y2', h)
            .attr('stroke', 'black');

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
