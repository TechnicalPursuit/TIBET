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
 * @type {TP.xctrls.barcode}
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:barcode');

TP.xctrls.barcode.addTraitsFrom(TP.core.PipeSegmentElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.barcode.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.barcode.Type.defineMethod('generateCode39Table',
function(code, params) {

            //  Parameters: type:      barcode type ['CODE39','CODE39_CHECKSUM',CODE39_EXTENDED,CODE39_EXTENDED_CHECKSUM]
            //             barcode:    value to translate
            //             withtext:   boolean, True to add text
            //             xsize:      size of a line
            //             ysize:      the Y size
            //             blackImage: a GIF image to build the barecode
            //             whiteImage: a GIF image to build the barecode
            //             xratio:     the ration between large and small bar
            //             xinter:     the space between two digits

    var type,
        withtext,
        xsize,
        ysize,

        xratio,
        xinter,

        codeAsStr,

        value,
        digit,

        valueX,
        codeX,

        astr,
        codeok,

        i,
        thecode,
        codestr,

        checkstr,
        check,
        bcstr;

    type = 'CODE39';
    withtext = true;
    xsize = 1;
    ysize = 50;
    xratio = 3;
    xinter = 1;
    codeAsStr = TP.str(code);

    // Constants to build the image
    value = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*';
    digit = TP.ac(
    'nbnBNbNbnX', 'NbnBnbnbNX', 'nbNBnbnbNX', 'NbNBnbnbnX', 'nbnBNbnbNX',
    'NbnBNbnbnX', 'nbNBNbnbnX', 'nbnBnbNbNX', 'NbnBnbNbnX', 'nbNBnbNbnX',
    'NbnbnBnbNX', 'nbNbnBnbNX', 'NbNbnBnbnX', 'nbnbNBnbNX', 'NbnbNBnbnX',
    'nbNbNBnbnX', 'nbnbnBNbNX', 'NbnbnBNbnX', 'nbNbnBNbnX', 'nbnbNBNbnX',
    'NbnbnbnBNX', 'nbNbnbnBNX', 'NbNbnbnBnX', 'nbnbNbnBNX', 'NbnbNbnBnX',
    'nbNbNbnBnX', 'nbnbnbNBNX', 'NbnbnbNBnX', 'nbNbnbNBnX', 'nbnbNbNBnX',
    'NBnbnbnbNX', 'nBNbnbnbNX', 'NBNbnbnbnX', 'nBnbNbnbNX', 'NBnbNbnbnX',
    'nBNbNbnbnX', 'nBnbnbNbNX', 'NBnbnbNbnX', 'nBNbnbNbnX', 'nBnBnBnbnX',
    'nBnBnbnBnX', 'nBnbnBnBnX', 'nbnBnBnBnX', 'nBnbNbNbnX');

    valueX = TP.join(
    '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f',
    '\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f',
    '\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f',
    '0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\x5c]^_',
    '`abcdefghijklmnopqrstuvwxyz{|}~\x7f');

    codeX = TP.ac(
    '%U', '$A', '$B', '$C', '$D', '$E', '$F', '$G', '$H', '$I', '$J', '$K', '$L', '$M',
    '$N', '$O', '$P', '$Q', '$R', '$S', '$T', '$U', '$V', '$W', '$X', '$Y', '$Z', '%A',
    '%B', '%C', '%D', '%E', ' ', '/A', '/B', '/C', '$', '%', '/F', '/G', '/H', '/I',
    '/J', '+', '/L', '-', '.', '/O', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '/Z', '%F', '%G', '%H', '%I', '%J', '%V', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '%K', '%L', '%M', '%N', '%O', '%W', '+A', '+B', '+C', '+D', '+E', '+F', '+G', '+H',
    '+I', '+J', '+K', '+L', '+M', '+N', '+O', '+P', '+Q', '+R', '+S', '+T', '+U', '+V',
    '+W', '+X', '+Y', '+Z', '%P', '%Q', '%R', '%S', '%T');

    codeok = (code !== '');

    if (codeok === true) {
        codeok = ((type === 'CODE39') ||
                    (type === 'CODE39_CHECKSUM') ||
                    (type === 'CODE39_EXTENDED') ||
                    (type === 'CODE39_EXTENDED_CHECKSUM'));
    }

    if (codeok === false) {
        astr = type + ' ??';
    } else {
        thecode = '';
        codestr = '';

        // Transform Extended Code39
        if ((type === 'CODE39_EXTENDED') ||
            (type === 'CODE39_EXTENDED_CHECKSUM')) {
            for (i = 0; i < codeAsStr.length; i++) {
                codestr += codeAsStr.charAt(i);
                thecode += codeX[valueX.indexOf(codeAsStr.charAt(i))];
            }
        } else {
            for (i = 0; i < codeAsStr.length; i++) {
                if (value.indexOf(codeAsStr.charAt(i)) !== -1) {
                    thecode += codeAsStr.charAt(i);
                }
            }

            codestr = thecode;
        }

        //  (ss) bad idea to set a param to a value...and code isn't
        //  referenced anywhere below this.
        //code = codestr;

        // Checksum
        checkstr = '';

        if ((type === 'CODE39_CHECKSUM') ||
            (type === 'CODE39_EXTENDED_CHECKSUM')) {
            check = 0;
            for (i = 0; i < thecode.length; i++) {
                check += value.indexOf(thecode.charAt(i));
            }

            checkstr = value.charAt(check % 43);
        }

        // Add Begin and End
        thecode = '*' + thecode + checkstr + '*';
        codestr = '*' + codestr + checkstr + '*';

        bcstr = '';

        for (i = 0; i < thecode.length; i++) {
            bcstr += digit[value.indexOf(thecode.charAt(i))];
        }

        // Drawing table
        astr = '<table xmlns="' +
                TP.w3.Xmlns.XHTML +
                '" border="0" cellspacing="0" cellpadding="0">\n';

        if (withtext) {
            astr += '<caption align=bottom>' + codestr + '</caption>\n';
        }

        astr += '<tr>';
        astr += '<td><div style="background-color: black; width:' + 10 *
                    xsize + 'px; height:' + ysize + 'px"></div></td>\n';

        for (i = 0; i < bcstr.length; i++) {
            if (bcstr.charAt(i) === 'X') {
                astr += '<td><div style="background-color: black; height:' +
                ysize + 'px; width:' + xinter + 'px"></div></td>\n';
            }

            if (bcstr.charAt(i) === 'b') {
                astr += '<td><div style="background-color: black; height:' +
                ysize + 'px; width:' + xsize + 'px"></div></td>\n';
            }

            if (bcstr.charAt(i) === 'B') {
                astr += '<td><div style="background-color: black; height:' +
                ysize + 'px; width:' + xsize * xratio + 'px"></div></td>\n';
            }

            if (bcstr.charAt(i) === 'n') {
                astr += '<td><div style="background-color: white; height:' +
                ysize + 'px; width:' + xsize + 'px"></div></td>\n';
            }

            if (bcstr.charAt(i) === 'N') {
                astr += '<td><div style="background-color: white; height:' +
                ysize + 'px; width:' + xsize * xratio + 'px"></div></td>\n';
            }
        }

        astr += '<td><div style="background-color: black; width:' + 10 *
                xsize + 'px; height:' + ysize + 'px"></div></td>\n';

        astr += '</tr></table>';

        return astr;
    }
});

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.barcode.Type.defineMethod('getPrimaryArgumentName',
function() {

    return 'code';
});

//  ------------------------------------------------------------------------

TP.xctrls.barcode.Type.defineMethod('getPrimaryArgument',
function(aRequest) {

    var val;

    if (TP.notEmpty(val = this.callNextMethod())) {
        return val.split(' ');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.barcode.Type.defineMethod('processInput',
function(aRequest, functionName) {

    aRequest.atPut('cmdAsIs', true);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.barcode.Type.defineMethod('transformInput',
function(content, aNode, aRequest) {

    return this.generateCode39Table(content);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
