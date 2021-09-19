//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------

import * as gui from 'urn:tibet:TP.gui';

//  ------------------------------------------------------------------------

class AnotherPoint extends gui.Point {

    constructor(x, y) {
        super(x + 10, y + 10);
    }

    asString() {
        return super.asString();
    }

    init(x, y) {
        return super.init(x, y);
    }

    static constructFromPolar(radius, angle) {
        return super.constructFromPolar(radius, angle);
    }
}

class YetAnotherPoint extends AnotherPoint {

    constructor(x, y) {
        super(x + 100, y + 100);
    }

    asString() {
        return super.asString();
    }

    init(x, y) {
        return super.init(x, y);
    }

    static constructFromPolar(radius, angle) {
        return super.constructFromPolar(radius, angle);
    }
}

export {AnotherPoint, YetAnotherPoint};

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
