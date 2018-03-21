//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
*/

//  ------------------------------------------------------------------------
//  HTML Entities
//  ------------------------------------------------------------------------

//  NB: Almost all of these are encoded in Unicode to avoid escaping
//  problems, etc. in IE.

//  Note that these keys are missing their leading '&' and trailing ';', due
//  to the way that TP.htmlEntitiesToLiterals() works.
TP.HTML_ENTITIES_TO_LITERALS =
    TP.hc(
            'aacute', '\u00c1',     //  Á
            'aacute', '\u00e1',     //  á
            'acirc', '\u00c2',      //  Â
            'acirc', '\u00e2',      //  â
            'aelig', '\u00c6',      //  Æ
            'aelig', '\u00e6',      //  æ
            'agrave', '\u00c0',     //  À
            'agrave', '\u00e0',     //  à
            'amp', '&',
            'apos', '\'',
            'aring', '\u00c5',      //  Å
            'aring', '\u00e5',      //  å
            'atilde', '\u00c3',     //  Ã
            'atilde', '\u00e3',     //  ã,
            'auml', '\u00c4',       //  Ä
            'auml', '\u00e4',       //  ä
            'ccedil', '\u00c7',     //  Ç
            'ccedil', '\u00e7',     //  ç
            'cent', '\u00a2',       //  ¢
            'copy', '\u00a9',       //  ©
            'divide', '\u00f7',     //  ÷
            'eacute', '\u00c9',     //  É
            'eacute', '\u00e9',     //  é
            'ecirc', '\u00ca',      //  Ê
            'ecirc', '\u00ea',      //  ê
            'egrave', '\u00c8',     //  È
            'egrave', '\u00e8',     //  è
            'euml', '\u00cb',       //  Ë
            'euml', '\u00eb',       //  ë
            'euro', '\u20ac',       //  €
            'gt', '>',
            'iacute', '\u00cd',     //  Í
            'iacute', '\u00ed',     //  í
            'icirc', '\u00ce',      //  Î
            'icirc', '\u00ee',      //  î
            'iexcl', '\u00a1',      //  ¡
            'igrave', '\u00cc',     //  Ì
            'igrave', '\u00ec',     //  ì
            'iquest', '\u00bf',     //  ¿
            'iuml', '\u00cf',       //  Ï
            'iuml', '\u00ef',       //  ï
            'laquo', '\u00ab',      //  «
            'lt', '<',
            'mdash', '\u2014',      //  mdash
            'micro', '\u00b5',      //  µ
            'middot', '\u00b7',     //  ·
            'nbsp', '\u00a0',
            'ndash', '\u2013',      //  ndash
            'ntilde', '\u00d1',     //  Ñ
            'ntilde', '\u00f1',     //  ñ
            'oacute', '\u00d3',     //  Ó
            'oacute', '\u00f3',     //  ó
            'ocirc', '\u00d4',      //  Ô
            'ocirc', '\u00f4',      //  ô
            'ograve', '\u00d2',     //  Ò
            'ograve', '\u00f2',     //  ò
            'oslash', '\u00d8',     //  Ø
            'oslash', '\u00f8',     //  ø
            'otilde', '\u00d5',     //  Õ
            'otilde', '\u00f5',     //  õ
            'ouml', '\u00d6',       //  Ö
            'ouml', '\u00f6',       //  ö
            'para', '\u00b6',       //  ¶
            'plusmn', '\u00b1',     //  ±
            'pound', '\u00a3',      //  £
            'quot', '"',
            'raquo', '\u00bb',      //  »
            'reg', '\u00ae',        //  ®
            'sect', '\u00a7',       //  §
            'szlig', '\u00df',      //  ß
            'uacute', '\u00da',     //  Ú
            'uacute', '\u00fa',     //  ú
            'ucirc', '\u00db',      //  Û
            'ucirc', '\u00fb',      //  û
            'ugrave', '\u00d9',     //  Ù
            'ugrave', '\u00f9',     //  ù
            'uuml', '\u00dc',       //  Ü
            'uuml', '\u00fc',       //  ü
            'yen', '\u00a5',        //  ¥
            'yuml', '\u00ff'        //  ÿ
    );

//  ---

//  If 'replaceSpaces' is true, we should be replacing ' ' with '&nbsp;'
TP.HTML_LITERALS_TO_ENTITIES =
    TP.hc(
            '\u00a0', '&#160;',     //  space
            '\u00a1', '&#161;',     //  ¡
            '\u00a2', '&#162;',     //  ¢
            '\u00a3', '&#163;',     //  £
            '\u00a5', '&#165;',     //  ¥
            '\u00a7', '&#167;',     //  §
            '\u00a9', '&#169;',     //  ©
            '\u00ab', '&#171;',     //  «
            '\u00ae', '&#174;',     //  ®
            '\u00b1', '&#177;',     //  ±
            '\u00b4', '&#180;',     //  ´
            '\u00b5', '&#181;',     //  µ
            '\u00b6', '&#182;',     //  ¶
            '\u00b7', '&#183;',     //  ·
            '\u00bb', '&#187;',     //  »
            '\u00bf', '&#191;',     //  ¿
            '\u00c0', '&#192;',     //  À
            '\u00c1', '&#193;',     //  Á
            '\u00c2', '&#194;',     //  Â
            '\u00c3', '&#195;',     //  Ã
            '\u00c4', '&#196;',     //  Ä
            '\u00c5', '&#197;',     //  Å
            '\u00c6', '&#198;',     //  Æ
            '\u00c7', '&#199;',     //  Ç
            '\u00c8', '&#200;',     //  È
            '\u00c9', '&#201;',     //  É
            '\u00ca', '&#202;',     //  Ê
            '\u00cb', '&#203;',     //  Ë
            '\u00cc', '&#204;',     //  Ì
            '\u00cd', '&#205;',     //  Í
            '\u00ce', '&#206;',     //  Î
            '\u00cf', '&#207;',     //  Ï
            '\u00d1', '&#209;',     //  Ñ
            '\u00d2', '&#210;',     //  Ò
            '\u00d3', '&#211;',     //  Ó
            '\u00d4', '&#212;',     //  Ô
            '\u00d5', '&#213;',     //  Õ
            '\u00d6', '&#214;',     //  Ö
            '\u00d8', '&#216;',     //  Ø
            '\u00d9', '&#217;',     //  Ù
            '\u00da', '&#218;',     //  Ú
            '\u00db', '&#219;',     //  Û
            '\u00dc', '&#220;',     //  Ü
            '\u00df', '&#223;',     //  ß
            '\u00e0', '&#224;',     //  à
            '\u00e1', '&#225;',     //  á
            '\u00e2', '&#226;',     //  â
            '\u00e3', '&#227;',     //  ã
            '\u00e4', '&#228;',     //  ä
            '\u00e5', '&#229;',     //  å
            '\u00e6', '&#230;',     //  æ
            '\u00e7', '&#231;',     //  ç
            '\u00e8', '&#232;',     //  è
            '\u00e9', '&#233;',     //  é
            '\u00ea', '&#234;',     //  ê
            '\u00eb', '&#235;',     //  ë
            '\u00ec', '&#236;',     //  ì
            '\u00ed', '&#237;',     //  í
            '\u00ee', '&#238;',     //  î
            '\u00ef', '&#239;',     //  ï
            '\u00f1', '&#241;',     //  ñ
            '\u00f2', '&#242;',     //  ò
            '\u00f3', '&#243;',     //  ó
            '\u00f4', '&#244;',     //  ô
            '\u00f5', '&#245;',     //  õ
            '\u00f6', '&#246;',     //  ö
            '\u00f7', '&#247;',     //  ÷
            '\u00f8', '&#248;',     //  ø
            '\u00f9', '&#249;',     //  ù
            '\u00fa', '&#250;',     //  ú
            '\u00fb', '&#251;',     //  û
            '\u00fc', '&#252;',     //  ü
            '\u00ff', '&#255;',     //  ÿ
            '\u0022', '&#34;',      //  "
            '\u0026', '&#38;',      //  &
            '\u0027', '&#39;',      //  '
            '\u003c', '&#60;',      //  <
            '\u003e', '&#62;',      //  >
            '\u2013', '&#8211;',    //  ndash
            '\u2014', '&#8212;',    //  mdash
            '\u20ac', '&#8364;',    //  €
            '\u0060', '&#96;',      //  `
            '\u00c1', '&aacute;',   //  Á
            '\u00e1', '&aacute;',   //  á
            '\u00c2', '&acirc;',    //  Â
            '\u00e2', '&acirc;',    //  â
            '\u00c6', '&aelig;',    //  Æ
            '\u00e6', '&aelig;',    //  æ
            '\u00c0', '&agrave;',   //  À
            '\u00e0', '&agrave;',   //  à
            '&', '&amp;',
            '\'', '&apos;',
            '\u00c5', '&aring;',    //  Å
            '\u00e5', '&aring;',    //  å
            '\u00c3', '&atilde;',   //  Ã
            '\u00e3', '&atilde;',   //  ã
            '\u00c4', '&auml;',     //  Ä
            '\u00e4', '&auml;',     //  ä
            '\u00c7', '&ccedil;',   //  Ç
            '\u00e7', '&ccedil;',   //  ç
            '\u00a2', '&cent;',     //  ¢
            '\u00a9', '&copy;',     //  ©
            '\u00f7', '&divide;',   //  ÷
            '\u00c9', '&eacute;',   //  É
            '\u00e9', '&eacute;',   //  é
            '\u00ca', '&ecirc;',    //  Ê
            '\u00ea', '&ecirc;',    //  ê
            '\u00c8', '&egrave;',   //  È
            '\u00e8', '&egrave;',   //  è
            '\u00cb', '&euml;',     //  Ë
            '\u00eb', '&euml;',     //  ë
            '\u20ac', '&euro;',     //  €
            '>', '&gt;',
            '\u00cd', '&iacute;',   //  Í
            '\u00ed', '&iacute;',   //  í
            '\u00ce', '&icirc;',    //  Î
            '\u00ee', '&icirc;',    //  î
            '\u00a1', '&iexcl;',    //  ¡
            '\u00cc', '&igrave;',   //  Ì
            '\u00ec', '&igrave;',   //  ì
            '\u00bf', '&iquest;',   //  ¿
            '\u00cf', '&iuml;',     //  Ï
            '\u00ef', '&iuml;',     //  ï
            '\u00ab', '&laquo;',    //  «
            '<', '&lt;',
            '\u2014', '&mdash;',    //  mdash
            '\u00b5', '&micro;',    //  µ
            '\u00b7', '&middot;',   //  ·
            '\u00a0', '&nbsp;',
            '\u2013', '&ndash;',    //  ndash
            '\u00d1', '&ntilde;',   //  Ñ
            '\u00f1', '&ntilde;',   //  ñ
            '\u00d3', '&oacute;',   //  Ó
            '\u00f3', '&oacute;',   //  ó
            '\u00d4', '&ocirc;',    //  Ô
            '\u00f4', '&ocirc;',    //  ô
            '\u00d2', '&ograve;',   //  Ò
            '\u00f2', '&ograve;',   //  ò
            '\u00d8', '&oslash;',   //  Ø
            '\u00f8', '&oslash;',   //  ø
            '\u00d5', '&otilde;',   //  Õ
            '\u00f5', '&otilde;',   //  õ
            '\u00d6', '&ouml;',     //  Ö
            '\u00f6', '&ouml;',     //  ö
            '\u00b6', '&para;',     //  ¶
            '\u00b1', '&plusmn;',   //  ±
            '\u00a3', '&pound;',    //  £
            '"', '&quot;',
            '\u00bb', '&raquo;',    //  »
            '\u00ae', '&reg;',      //  ®
            '\u00a7', '&sect;',     //  §
            '\u00df', '&szlig;',    //  ß
            '\u00da', '&uacute;',   //  Ú
            '\u00fa', '&uacute;',   //  ú
            '\u00db', '&ucirc;',    //  Û
            '\u00fb', '&ucirc;',    //  û
            '\u00d9', '&ugrave;',   //  Ù
            '\u00f9', '&ugrave;',   //  ù
            '\u00dc', '&uuml;',     //  Ü
            '\u00fc', '&uuml;',     //  ü
            '\u00a5', '&yen;',      //  ¥
            '\u00ff', '&yuml;'      //  ÿ
    );

//  ---

//  Note that apos, quot, amp, lt and gt aren't mentioned, since they're the
//  same for both.
TP.HTML_ENTITIES_TO_XML_ENTITIES =
    TP.hc(
            'aacute', '&#193;',
            'acirc', '&#194;',
            'aelig', '&#198;',
            'agrave', '&#192;',
            'amp', '&#38;',
            'aring', '&#197;',
            'atilde', '&#195;',
            'auml', '&#196;',
            'ccedil', '&#199;',
            'cent', '&#162;',
            'copy', '&#169;',
            'divide', '&#247;',
            'eacute', '&#201;',
            'ecirc', '&#202;',
            'egrave', '&#200;',
            'euml', '&#203;',
            'euro', '&#8364;',
            'iacute', '&#205;',
            'icirc', '&#206;',
            'iexcl', '&#161;',
            'igrave', '&#204;',
            'iquest', '&#191;',
            'iuml', '&#207;',
            'laquo', '&#171;',
            'mdash', '&#8212;',
            'micro', '&#181;',
            'middot', '&#183;',
            'nbsp', '&#160;',
            'ndash', '&#8211;',
            'ntilde', '&#209;',
            'oacute', '&#211;',
            'ocirc', '&#212;',
            'ograve', '&#210;',
            'oslash', '&#216;',
            'otilde', '&#213;',
            'ouml', '&#214;',
            'para', '&#182;',
            'plusmn', '&#177;',
            'pound', '&#163;',
            'raquo', '&#187;',
            'reg', '&#174;',
            'sect', '&#167;',
            'szlig', '&#223;',
            'uacute', '&#218;',
            'ucirc', '&#219;',
            'ugrave', '&#217;',
            'uuml', '&#220;',
            'yen', '&#165;',
            'yuml', '&#255;'
    );

//  ------------------------------------------------------------------------
//  XML Entities
//  ------------------------------------------------------------------------

//  Note that these keys are missing their leading '&' and trailing ';', due
//  to the way that TP.xmlEntitiesToLiterals() works.
TP.XML_ENTITIES_TO_LITERALS =
    TP.hc(
            'amp', '&',
            'apos', '\'',
            'gt', '>',
            'lt', '<',
            'nbsp', '\u00a0',
            'quot', '"'
    );

//  ---

//  If 'replaceSpaces' is true, we should be replacing ' ' with '&#160;'
TP.XML_LITERALS_TO_ENTITIES =
    TP.hc(
            '\u00a0', '&#160;',     //  space
            '\u00a1', '&#161;',     //  ¡
            '\u00a2', '&#162;',     //  ¢
            '\u00a3', '&#163;',     //  £
            '\u00a5', '&#165;',     //  ¥
            '\u00a7', '&#167;',     //  §
            '\u00a9', '&#169;',     //  ©
            '\u00ab', '&#171;',     //  «
            '\u00ae', '&#174;',     //  ®
            '\u00b1', '&#177;',     //  ±
            '\u00b4', '&#180;',     //  ´
            '\u00b5', '&#181;',     //  µ
            '\u00b6', '&#182;',     //  ¶
            '\u00b7', '&#183;',     //  ·
            '\u00bb', '&#187;',     //  »
            '\u00bf', '&#191;',     //  ¿
            '\u00c0', '&#192;',     //  À
            '\u00c1', '&#193;',     //  Á
            '\u00c2', '&#194;',     //  Â
            '\u00c3', '&#195;',     //  Ã
            '\u00c4', '&#196;',     //  Ä
            '\u00c5', '&#197;',     //  Å
            '\u00c6', '&#198;',     //  Æ
            '\u00c7', '&#199;',     //  Ç
            '\u00c8', '&#200;',     //  È
            '\u00c9', '&#201;',     //  É
            '\u00ca', '&#202;',     //  Ê
            '\u00cb', '&#203;',     //  Ë
            '\u00cc', '&#204;',     //  Ì
            '\u00cd', '&#205;',     //  Í
            '\u00ce', '&#206;',     //  Î
            '\u00cf', '&#207;',     //  Ï
            '\u00d1', '&#209;',     //  Ñ
            '\u00d2', '&#210;',     //  Ò
            '\u00d3', '&#211;',     //  Ó
            '\u00d4', '&#212;',     //  Ô
            '\u00d5', '&#213;',     //  Õ
            '\u00d6', '&#214;',     //  Ö
            '\u00d8', '&#216;',     //  Ø
            '\u00d9', '&#217;',     //  Ù
            '\u00da', '&#218;',     //  Ú
            '\u00db', '&#219;',     //  Û
            '\u00dc', '&#220;',     //  Ü
            '\u00df', '&#223;',     //  ß
            '\u00e0', '&#224;',     //  à
            '\u00e1', '&#225;',     //  á
            '\u00e2', '&#226;',     //  â
            '\u00e3', '&#227;',     //  ã
            '\u00e4', '&#228;',     //  ä
            '\u00e5', '&#229;',     //  å
            '\u00e6', '&#230;',     //  æ
            '\u00e7', '&#231;',     //  ç
            '\u00e8', '&#232;',     //  è
            '\u00e9', '&#233;',     //  é
            '\u00ea', '&#234;',     //  ê
            '\u00eb', '&#235;',     //  ë
            '\u00ec', '&#236;',     //  ì
            '\u00ed', '&#237;',     //  í
            '\u00ee', '&#238;',     //  î
            '\u00ef', '&#239;',     //  ï
            '\u00f1', '&#241;',     //  ñ
            '\u00f2', '&#242;',     //  ò
            '\u00f3', '&#243;',     //  ó
            '\u00f4', '&#244;',     //  ô
            '\u00f5', '&#245;',     //  õ
            '\u00f6', '&#246;',     //  ö
            '\u00f7', '&#247;',     //  ÷
            '\u00f8', '&#248;',     //  ø
            '\u00f9', '&#249;',     //  ù
            '\u00fa', '&#250;',     //  ú
            '\u00fb', '&#251;',     //  û
            '\u00fc', '&#252;',     //  ü
            '\u00ff', '&#255;',     //  ÿ
            '\u0022', '&#34;',      //  "
            '\u0026', '&#38;',      //  &
            '\u0027', '&#39;',      //  '
            '\u003c', '&#60;',      //  <
            '\u003e', '&#62;',      //  >
            '\u2013', '&#8211;',    //  ndash
            '\u2014', '&#8212;',    //  mdash
            '\u20ac', '&#8364;',    //  €
            '\u0060', '&#96;',      //  `
            '\u00c1', '&#193;',     //  Á
            '\u00e1', '&#225;',     //  á
            '\u00c2', '&#194;',     //  Â
            '\u00e2', '&#226;',     //  â
            '\u00c6', '&#198;',     //  Æ
            '\u00e6', '&#230;',     //  æ
            '\u00c0', '&#192;',     //  À
            '\u00e0', '&#224;',     //  à
            '&', '&amp;',
            '\'', '&apos;',
            '\u00c5', '&#199;',     //  Å
            '\u00e5', '&#229;',     //  å
            '\u00c3', '&#195;',     //  Ã
            '\u00e3', '&#227;',     //  ã
            '\u00c4', '&#196;',     //  Ä
            '\u00e4', '&#228;',     //  ä
            '\u00c7', '&#199;',     //  Ç
            '\u00e7', '&#231;',     //  ç
            '\u00a2', '&#162;',     //  ¢
            '\u00a9', '&#169;',     //  ©
            '\u00f7', '&#247;',     //  ÷
            '\u00c9', '&#201;',     //  É
            '\u00e9', '&#233;',     //  é
            '\u00ca', '&#202;',     //  Ê
            '\u00ea', '&#234;',     //  ê
            '\u00c8', '&#200;',     //  È
            '\u00e8', '&#232;',     //  è
            '\u00cb', '&#203;',     //  Ë
            '\u00eb', '&#235;',     //  ë
            '\u20ac', '&#8364;',    //  €
            '>', '&gt;',
            '\u00cd', '&#205;',     //  Í
            '\u00ed', '&#237;',     //  í
            '\u00ce', '&#206;',     //  Î
            '\u00ee', '&#238;',     //  î
            '\u00a1', '&#161;',     //  ¡
            '\u00cc', '&#204;',     //  Ì
            '\u00ec', '&#236;',     //  ì
            '\u00bf', '&#191;',     //  ¿
            '\u00cf', '&#207;',     //  Ï
            '\u00ef', '&#239;',     //  ï
            '\u00ab', '&#171;',     //  «
            '<', '&lt;',
            '\u2014', '&#8212;',    //  mdash
            '\u00b5', '&#181;',     //  µ
            '\u00b7', '&#183;',     //  ·
            '\u00a0', '&nbsp;',
            '\u2013', '&#8211;',    //  ndash
            '\u00d1', '&#209;',     //  Ñ
            '\u00f1', '&#241;',     //  ñ
            '\u00d3', '&#211;',     //  Ó
            '\u00f3', '&#243;',     //  ó
            '\u00d4', '&#212;',     //  Ô
            '\u00f4', '&#244;',     //  ô
            '\u00d2', '&#210;',     //  Ò
            '\u00f2', '&#242;',     //  ò
            '\u00d8', '&#216;',     //  Ø
            '\u00f8', '&#248;',     //  ø
            '\u00d5', '&#213;',     //  Õ
            '\u00f5', '&#245;',     //  õ
            '\u00d6', '&#214;',     //  Ö
            '\u00f6', '&#246;',     //  ö
            '\u00b6', '&#182;',     //  ¶
            '\u00b1', '&#177;',     //  ±
            '\u00a3', '&#163;',     //  £
            '"', '&quot;',
            '\u00bb', '&#187;',     //  »
            '\u00ae', '&#174;',     //  ®
            '\u00a7', '&#167;',     //  §
            '\u00df', '&#223;',     //  ß
            '\u00da', '&#218;',     //  Ú
            '\u00fa', '&#250;',     //  ú
            '\u00db', '&#219;',     //  Û
            '\u00fb', '&#251;',     //  û
            '\u00d9', '&#217;',     //  Ù
            '\u00f9', '&#249;',     //  ù
            '\u00dc', '&#220;',     //  Ü
            '\u00fc', '&#252;',     //  ü
            '\u00a5', '&#165;',     //  ¥
            '\u00ff', '&#255;'      //  ÿ
    );

//  ---

//  Note that apos, quot, amp, lt and gt aren't mentioned, since they're the
//  same for both.
TP.XML_ENTITIES_TO_HTML_ENTITIES =
    TP.hc(
            '#193', '&aacute;',
            '#194', '&acirc;',
            '#198', '&aelig;',
            '#192', '&agrave;',
            '#38', '&amp;',
            '#197', '&aring;',
            '#195', '&atilde;',
            '#196', '&auml;',
            '#199', '&ccedil;',
            '#162', '&cent;',
            '#169', '&copy;',
            '#247', '&divide;',
            '#201', '&eacute;',
            '#202', '&ecirc;',
            '#200', '&egrave;',
            '#203', '&euml;',
            '#8364', '&euro;',
            '#205', '&iacute;',
            '#206', '&icirc;',
            '#161', '&iexcl;',
            '#204', '&igrave;',
            '#191', '&iquest;',
            '#207', '&iuml;',
            '#171', '&laquo;',
            '#8212', '&mdash;',
            '#181', '&micro;',
            '#183', '&middot;',
            '#160', '&nbsp;',
            '#8211', '&ndash;',
            '#209', '&ntilde;',
            '#211', '&oacute;',
            '#212', '&ocirc;',
            '#210', '&ograve;',
            '#216', '&oslash;',
            '#213', '&otilde;',
            '#214', '&ouml;',
            '#182', '&para;',
            '#177', '&plusmn;',
            '#163', '&pound;',
            '#187', '&raquo;',
            '#174', '&reg;',
            '#167', '&sect;',
            '#223', '&szlig;',
            '#218', '&uacute;',
            '#219', '&ucirc;',
            '#217', '&ugrave;',
            '#220', '&uuml;',
            '#165', '&yen;',
            '#255', '&yuml;'
    );

//  ------------------------------------------------------------------------
//  HTML "Types"
//  ------------------------------------------------------------------------

//  A constant containing names of HTML DOM elements. This is used in the
//  TP.$nodeToString() function for printing reasonable type names for
//  elements as IE does an extremely poor job of making this easy (ActiveX
//  objects, like those created in XML/XHTML documents, and
//  'instance-programmed' objects, like nodes in IE's HTML DOM) do not
//  respond to even simple JavaScript methods like 'toString()').

TP.HTML_DOM_NAMES =
    TP.hc(
            'a', 'HTMLAnchorElement',
            'applet', 'HTMLAppletElement',
            'area', 'HTMLAreaElement',
            'br', 'HTMLBrElement',
            'base', 'HTMLBaseElement',
            'basefont', 'HTMLBaseFontElement',
            'body', 'HTMLBodyElement',
            'button', 'HTMLButtonElement',
            'dl', 'HTMLDListElement',
            'dir', 'HTMLDirectoryElement',
            'div', 'HTMLDivElement',
            'embed', 'HTMLEmbedElement',
            'fieldset', 'HTMLFieldsetElement',
            'font', 'HTMLFontElement',
            'form', 'HTMLFormElement',
            'frame', 'HTMLFrameElement',
            'frameset', 'HTMLFramesetElement',
            'hr', 'HTMLHrElement',
            'head', 'HTMLHeadElement',
            'h1', 'HTMLHeadingElement',
            'h2', 'HTMLHeadingElement',
            'h3', 'HTMLHeadingElement',
            'h4', 'HTMLHeadingElement',
            'h5', 'HTMLHeadingElement',
            'h6', 'HTMLHeadingElement',
            'html', 'HTMLHtmlElement',
            'iframe', 'HTMLIframeElement',
            'img', 'HTMLImageElement',
            'input', 'HTMLInputElement',
            'isindex', 'HTMLIsIndexElement',
            'li', 'HTMLLIElement',
            'label', 'HTMLLabelElement',
            'legend', 'HTMLLegendElement',
            'link', 'HTMLLinkElement',
            'map', 'HTMLMapElement',
            'menu', 'HTMLMenuElement',
            'meta', 'HTMLMetaElement',
            'mod', 'HTMLModElement',
            'ol', 'HTMLOListElement',
            'object', 'HTMLObjectElement',
            'option', 'HTMLOptionElement',
            'optgroup', 'HTMLOptGroupElement',
            'p', 'HTMLParagraphElement',
            'param', 'HTMLParamElement',
            'pre', 'HTMLPreElement',
            'q', 'HTMLQuoteElement',
            'script', 'HTMLScriptElement',
            'select', 'HTMLSelectElement',
            'span', 'HTMLSpanElement',
            'style', 'HTMLStyleElement',
            'caption', 'HTMLTableCaptionElement',
            'td', 'HTMLTableCellElement',
            'col', 'HTMLTableColElement',
            'table', 'HTMLTableElement',
            'tr', 'HTMLTableRowElement',
            'tbody', 'HTMLTableSectionElement',
            'textarea', 'HTMLTextAreaElement',
            'title', 'HTMLTitleElement',
            'ul', 'HTMLUListElement'
    );

//  ------------------------------------------------------------------------
//  NATIVE TYPES
//  ------------------------------------------------------------------------

TP.sys.defineMethod('getNativeTypes',
function() {

    /**
     * @method getNativeTypes
     * @summary Returns an object containing the names and type objects for all
     *     native types. These types are those which are defined at some level
     *     in JavaScript or the DOM.
     * @returns {Object} A hash containing all of the native types in the
     *     system.
     */

    var nativeTypesKeys;

    //  Already computed this? Exit here.
    if (TP.isValid(TP.sys.$nativeTypes)) {
        return TP.sys.$nativeTypes;
    }

    //  If we havent' finalized yet we may not have the proper dictionaries in
    //  place to continue.
    if (TP.notValid(TP.sys.$extraglobals)) {
        return TP.hc();
    }

    //  Otherwise, we iterate over all of the keys from 'TP.sys.$extraglobals',
    //  do our best job filtering them, and make a new Hash.

    //  Filter out keys here where the first character isn't an uppercase letter
    //  (like a native type name would have) or where it starts with '__'.
    nativeTypesKeys = TP.sys.$extraglobals.getKeys().select(
            function(aKey) {
                if (TP.sys.$excludedGlobals.indexOf(aKey) === TP.NOT_FOUND) {
                    return TP.isNativeType(TP.global[aKey]);
                }
            });

    //  Allocate the native types hash and initialize with the key and the value
    //  obtained by accessing that key on the global object.
    TP.sys.$nativeTypes = TP.hc();
    nativeTypesKeys.perform(
            function(aKey) {
                TP.sys.$nativeTypes.atPut(aKey, TP.global[aKey]);
            });

    /*
       TODO: Figure out what we want to do about metadata here. These days it
       *is* possible to determine the 'supertype' chain of a native type, so
       we could be more sophisticated here rather than just supplying
       'Object' as the supertype of all.
    var len,
        i,
        name,
        item;


    //  Iterate and add metadata for the native types.
    len = nativeTypesKeys.getSize();
    for (i = 0; i < len; i++) {
        name = nativeTypesKeys.at(i);

        //  skip adding Object as a subtype of Object :)
        if (name === 'Object') {
            continue;
        }

        item = TP.sys.$nativeTypes.at(name);
        if (TP.isValid(item) && (item !== Infinity)) {
            //  NOTE that this isn't necessarily true, but we don't try
            //  too hard to get it right for native types
            TP.sys.addMetadata(null, item, TP.SUBTYPE);
        }
    }
    */

    return TP.sys.$nativeTypes;
});

//  ------------------------------------------------------------------------
//  SUPPORT
//  ------------------------------------------------------------------------

TP.definePrimitive('isSherpaNode',
function(aNode) {

    /**
     * @method isSherpaNode
     * @summary Returns whether the node exists in the Sherpa context (i.e. is a
     *     node that has been used to build the Sherpa, rather than a part of
     *     the author's application).
     * @param {Node} aNode The node to test.
     * @returns {Boolean} Whether or not the node is part of the Sherpa itself
     *     or not.
     */

    var backgroundElem;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  Make sure the Sherpa is running
    if (!TP.sys.hasFeature('sherpa')) {
        return false;
    }

    //  If it's a descendant under the 'background' element (but not in a canvas
    //  iframe), then it's part of the Sherpa.
    backgroundElem = TP.byId('background', TP.sys.getUIRoot(true), false);

    return TP.nodeContainsNode(backgroundElem, aNode);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hash',
function(anObject, aHashMode, aHashFormat) {

    /**
     * @method hash
     * @summary Hashes the string representation of the Object provided.
     * @description Note that the full TIBET cryptography library will overlay
     *     this method and install its own version.
     * @param {Object} anObject The object to acquire a hash code for.
     * @param {Number} aHashMode TP.HASH_MD5 or TP.HASH_SHA1. The default is
     *     SHA-1 since MD5 has been cracked.
     * @param {Number} aHashFormat TP.HASH_HEX or TP.HASH_B64. The default is
     *     TP.HASH_HEX.
     * @exception TP.sig.InvalidParameter
     * @returns {String} The hashed string result.
     */

    var str,

        mode,
        fmt,

        result;

    if (TP.notValid(anObject)) {
        return TP.raise(null, 'TP.sig.InvalidParameter');
    }

    str = TP.str(anObject);

    mode = TP.ifInvalid(aHashMode, TP.HASH_SHA1);
    fmt = TP.ifInvalid(aHashFormat, TP.HASH_HEX);

    switch (mode) {
        case TP.HASH_MD5:

            result = TP.extern.CryptoJS.MD5(str);

            break;

        case TP.HASH_SHA1:

            result = TP.extern.CryptoJS.SHA1(str);

            break;

        default:
            break;
    }

    switch (fmt) {

        case TP.HASH_B64:

            return result.toString(TP.extern.CryptoJS.enc.Base64);

        case TP.HASH_HEX:

            return result.toString(TP.extern.CryptoJS.enc.Hex);

        default:

            return result;
    }
}, {
    dependencies: [TP.extern.CryptoJS]
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlEntitiesToLiterals',
function(aString) {

    /**
     * @method htmlEntitiesToLiterals
     * @summary Converts HTML entities into their literal character
     *     representation.
     * @param {String} aString The string that may contain HTML entities to be
     *     converted.
     * @returns {String} The supplied String with the HTML entities converted to
     *     literal characters.
     */

    if (!TP.regex.ML_ENTITY.test(aString)) {
        return aString;
    }

    return aString.replace(
                /&#?([a-zA-Z]+|[0-9]+);/g,
                function(whole, entity) {

                    var lookup;

                    if (TP.isNumber(parseInt(entity, 10))) {
                        return String.fromCharCode(entity);
                    }

                    lookup = TP.HTML_ENTITIES_TO_LITERALS.at(entity);

                    return TP.ifInvalid(lookup, whole);
                });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlLiteralsToEntities',
function(aString, replaceSpaces, replaceQuoting) {

    /**
     * @method htmlLiteralsToEntities
     * @summary Converts literal characters in the supplied String to their
     *     HTML entity equivalent. Spaces, when replaced, become &nbsp;
     * @param {String} aString The string that may contain literal characters to
     *     convert to HTML entities.
     * @param {Boolean} replaceSpaces Whether or not to 'entitify' spaces. The
     *     default is false.
     * @param {Boolean} replaceQuoting Whether or not to 'entitify' quoting
     *     characters (the ' and " characters). The default is true.
     * @returns {String} The supplied String with the literal characters that
     *     need to be entities made into them.
     */

    var regex,
        result,

        dontReplaceQuoting;

    if (TP.regex.NON_UTF8_CHARS.test(aString)) {
        if (TP.notValid(regex = TP.regex.$$HTML_LITERALS_TO_ENTITIES)) {
            regex = TP.rc(
                        TP.keys(TP.HTML_LITERALS_TO_ENTITIES).join('|'),
                        'g');

            TP.regex.$$HTML_LITERALS_TO_ENTITIES = regex;
        }

        result = aString.replace(
                    regex,
                    function(match) {

                        return TP.HTML_LITERALS_TO_ENTITIES.at(match);
                    });
    } else {

        if (/[&<>'"]/.test(aString)) {

            dontReplaceQuoting = TP.isFalse(replaceQuoting);

            result = aString.replace(
                /[<>'"]/g,
                function(aChar) {

                    switch (aChar) {
                        case '<':
                            return '&lt;';

                        case '>':
                            return '&gt;';

                        case '\'':
                            if (dontReplaceQuoting) {
                                return aChar;
                            }
                            return '&apos;';

                        case '"':
                            if (dontReplaceQuoting) {
                                return aChar;
                            }
                            return '&quot;';

                        default:
                            break;
                    }
                });

            //  Replace all '&' that are *not* part of an entity with '&amp;'
            //  Note here how we replace '&&' first because sometimes,
            //  especially when formatting JavaScript, we might have an
            //  expression like 'foo&&bar;' and the second RegExp cannot
            //  determine whether or not '&bar;' is a real entity or not. So we
            //  replace the double '&' first.
            result = result.
                        replace(/&&/g, '&amp;&amp;').
                        replace(/&(?!([a-zA-Z]+|#[0-9]+);)/g, '&amp;');
        } else {
            result = aString;
        }
    }

    result = replaceSpaces ? result.replace(/ /g, '&nbsp;') : result;

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlEntitiesToLiterals',
function(aString) {

    /**
     * @method xmlEntitiesToLiterals
     * @summary Converts XML entities into their literal character
     *     representation.
     * @param {String} aString The string that may contain XML entities to be
     *     converted.
     * @returns {String} The supplied String with the XML entities converted to
     *     literal characters.
     */

    if (!TP.regex.ML_ENTITY.test(aString)) {
        return aString;
    }

    return aString.replace(
                /&#?([a-zA-Z]+|[0-9]+);/g,
                function(whole, entity) {

                    var lookup;

                    if (TP.isNumber(parseInt(entity, 10))) {
                        return String.fromCharCode(entity);
                    }

                    lookup = TP.XML_ENTITIES_TO_LITERALS.at(entity);

                    return TP.ifInvalid(lookup, whole);
                });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlLiteralsToEntities',
function(aString, replaceSpaces, replaceQuoting) {

    /**
     * @method xmlLiteralsToEntities
     * @summary Converts literal characters in the supplied String to their XML
     *     entities.
     * @param {String} aString The string that may contain literal characters to
     *     convert to XML entities.
     * @param {Boolean} replaceSpaces Whether or not to 'entitify' spaces. The
     *     default is false.
     * @param {Boolean} replaceQuoting Whether or not to 'entitify' quoting
     *     characters (the ' and " characters). The default is true.
     * @returns {String} The supplied String with the literal characters that
     *     need to be entities made into them.
     */

    var regex,
        result,

        dontReplaceQuoting;

    if (TP.regex.NON_UTF8_CHARS.test(aString)) {
        if (TP.notValid(regex = TP.regex.$$XML_LITERALS_TO_ENTITIES)) {
            regex = TP.rc(
                        TP.keys(TP.XML_LITERALS_TO_ENTITIES).join('|'),
                        'g');

            TP.regex.$$XML_LITERALS_TO_ENTITIES = regex;
        }

        result = aString.replace(
                    regex,
                    function(match) {

                        return TP.XML_LITERALS_TO_ENTITIES.at(match);
                    });
    } else {

        if (/[&<>'"]/.test(aString)) {

            dontReplaceQuoting = TP.isFalse(replaceQuoting);

            result = aString.replace(
                /[<>'"]/g,
                function(aChar) {

                    switch (aChar) {
                        case '<':
                            return '&lt;';

                        case '>':
                            return '&gt;';

                        case '\'':
                            if (dontReplaceQuoting) {
                                return aChar;
                            }
                            return '&apos;';

                        case '"':
                            if (dontReplaceQuoting) {
                                return aChar;
                            }
                            return '&quot;';

                        default:
                            break;
                    }
                });

            //  Replace all '&' that are *not* part of an entity with '&amp;'
            //  Note here how we replace '&&' first because sometimes,
            //  especially when formatting JavaScript, we might have an
            //  expression like 'foo&&bar;' and the second RegExp cannot
            //  determine whether or not '&bar;' is a real entity or not. So we
            //  replace the double '&' first.
            result = result.
                        replace(/&&/g, '&amp;&amp;').
                        replace(/&(?!([a-zA-Z]+|#[0-9]+);)/g, '&amp;');
        } else {
            result = aString;
        }
    }

    result = replaceSpaces ? result.replace(/ /g, '&#160;') : result;

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlEntitiesToXMLEntities',
function(aString) {

    /**
     * @method htmlEntitiesToXMLEntities
     * @summary Converts an HTML string to an XML equivalent. This attempts to
     *     preserve entities that exist in the HTML in the XML.
     * @param {String} aString The string that may contain HTML entities.
     * @returns {String} The supplied String with the HTML entities converted to
     *     XML entities.
     */

    if (!TP.regex.ML_ENTITY.test(aString)) {
        return aString;
    }

    return aString.replace(
                /&([a-zA-Z#0-9]+);/g,
                function(whole, entity) {

                    var lookup;

                    lookup = TP.HTML_ENTITIES_TO_XML_ENTITIES.at(entity);

                    return TP.ifInvalid(lookup, whole);
                });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlEntitiesToHTMLEntities',
function(aString) {

    /**
     * @method xmlEntitiesToHTMLEntities
     * @summary Converts an XML string to an HTML equivalent. This attempts to
     *     preserve entities that exist in the XML in the HTML.
     * @param {String} aString The string that may contain XML entities.
     * @returns {String} The supplied String with the XML entities converted to
     *     HTML entities.
     */

    if (!TP.regex.ML_ENTITY.test(aString)) {
        return aString;
    }

    return aString.replace(
                /&([a-zA-Z#0-9]+);/g,
                function(whole, entity) {

                    var lookup;

                    lookup = TP.XML_ENTITIES_TO_HTML_ENTITIES.at(entity);

                    return TP.ifInvalid(lookup, whole);
                });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('regExpEscape',
function(aString) {

    /**
     * @method regExpEscape
     * @summary Escapes any RegExp metacharacters contained in the supplied
     *     String.
     * @param {String} aString The string that contains the regexp.
     * @returns {String} The regexp string with all RegExp metacharacters
     *     escaped such that this string can be used to build a RegExp.
     */

    TP.regex.REGEX_DETECT_META_CHARS.lastIndex = 0;

    //  Replace any *unescaped* RegExp meta characters with an escaping
    //  backslash and that character.
    return aString.replace(TP.regex.REGEX_DETECT_META_CHARS, '\\$1');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('regExpUnescape',
function(aString) {

    /**
     * @method regExpUnescape
     * @summary Unescapes any RegExp metacharacters contained in the supplied
     *     String.
     * @param {String} aString The string that contains the regexp.
     * @returns {String} The regexp string with all RegExp metacharacters
     *     unescaped such that this string is stripped of all unescaped
     *     metacharacters and with the remaining escaped metacharacters
     *     unescaped.
     */

    var str;

    TP.regex.REGEX_DETECT_UNESCAPED_META_CHARS.lastIndex = 0;

    //  Strip all unescaped RegExp meta characters.
    str = aString.strip(TP.regex.REGEX_DETECT_UNESCAPED_META_CHARS);

    //  Then strip all of the escaping backslash characters themselves.
    str = str.strip('\\');

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('regExpConstruct',
function(aList, aPrefix, aSuffix) {

    /**
     * @method regExpConstruct
     * @summary Construct a RegExp using the prefix, an alternation built from
     *     the list and the suffix.
     * @param {Array} aList An Array of items that will be built up into an
     *     alternation.
     * @param {String} aPrefix A regex expression to prepend to the list
     *     alternation.
     * @param {String} aSuffix A regex expression to append to the list
     *     alternation.
     * @returns {RegExp} A RegExp built from the supplied arguments.
     */

    var prefix,
        suffix;

    prefix = TP.ifInvalid(aPrefix, '');
    suffix = TP.ifInvalid(aSuffix, '');

    return new RegExp(prefix + '(' + aList.join('|') + ')' + suffix);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getNextWindowName',
function() {

    /**
     * @method getNextWindowName
     * @summary Returns a generated window name of the form window_N where N is
     *     a unique number based on the TP.sys.$$windowCount.
     * @returns {String} The next available window name.
     */

    //  count starts at 0, so we work upward making the first window _1 etc
    TP.sys.$$windowCount++;

    return 'window_' + TP.sys.$$windowCount;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('escapeTypeName',
function(aString) {

    /**
     * @method escapeTypeName
     * @summary Escapes the supplied type name so that it can be used as a
     *     signal name, etc. This method turns all periods ('.') into
     *     underscores ('_').
     * @param {String} aString The string that contains the type name.
     * @returns {String} The escaped type name.
     */

    if (!TP.isString(aString)) {
        return;
    }

    return aString.replace(/\./g, '_');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('escapeMethodName',
function(aString) {

    /**
     * @method escapeMethodName
     * @summary Escapes the supplied method name so that it can be used as a
     *     method name, etc. This method turns all spaces (' ') into
     *     underscores ('_').
     * @param {String} aString The string that contains the method name.
     * @returns {String} The escaped method name.
     */

    if (!TP.isString(aString)) {
        return;
    }

    return aString.replace(/ /g, '_');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('unescapeMethodName',
function(aString) {

    /**
     * @method unescapeMethodName
     * @summary Unescapes the supplied escaped method name so that it can be
     *     used as a method name. This method turns all underscores ('_') into
     *     spaces ('_').
     * @param {String} aString The string that contains the escaped method name.
     * @returns {String} The unescaped method name.
     */

    if (!TP.isString(aString)) {
        return;
    }

    return aString.replace(/_/g, ' ');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('unescapeTypeName',
function(aString) {

    /**
     * @method unescapeTypeName
     * @summary Unescapes the supplied escaped type name so that it can be used
     *     as a type name. This method turns all underscores ('_') into periods
     *     ('.').
     * @param {String} aString The string that contains the escaped type name.
     * @returns {String} The unescaped type name.
     */

    if (!TP.isString(aString)) {
        return;
    }

    return aString.replace(/_/g, '.');
});

//  ------------------------------------------------------------------------
//  ID/NAME FUNCTIONS
//  ------------------------------------------------------------------------

/*
All TIBET objects should be able to give you a unique ID and a name (which
may not be unique). An object's ID and/or name are used often enough in
logging and event processing that we offer quick check functions here.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGlobalID',
function(anObject, assignIfAbsent) {

    /**
     * @method objectGlobalID
     * @alias gid
     * @summary Returns the global ID of the object, an identifier that
     *     uniquely identifies the element within a particular TIBET
     *     environment. Most objects can be found via their global ID however
     *     certain scenarios are not handled automatically including Node
     *     instances which don't reside in a window, a TP.uri.URI's content, or
     *     an object capable of locating them. To find elements of this type you
     *     must have registered them under an ID, which you may have had to
     *     generate. NOTE that registering objects agressively can lead to
     *     memory leaks. NOTE that return values from this function are encoded
     *     via encodeURI since they are typically TIBET URI strings. Also note
     *     that the TP.gid() function is aliased to this call.
     * @description The return value of this function may vary between what
     *     looks like typical TIBET ID, a window path, or a TIBET URI. The
     *     reason for the variation has to do with trying to keep the IDs as
     *     simple as possible while keeping them unique enough to use with
     *     TP.sys.getObjectById(). The major difference you'll see here is that
     *     windows return window paths, while the various nodes you'd find in a
     *     window return TIBET URIs which include the window path as the canvas
     *     specification. Also be aware that not all objects have a global ID
     *     since they cannot be reliably reacquired.
     *
     *     A typical window global ID might be:
     *
     *     TDC.ui
     *
     *     A typical document global ID might be:
     *
     *     tibet://TDC.ui/http://www.teamtibet.com/index.html#document
     *
     *     A typical element global ID might be:
     *
     *     tibet://TDC.ui/http://www.teamtibet.com/index.html#elem1
     *
     *     A typical object global ID might be anything, since those values are
     *     based on IDs you can set as you desire, however most randomly
     *     assigned IDs will contain a prefix that tries to identify the type of
     *     object followed by an _ (underscore) and then a unique ID number.
     *
     *     NOTE that at the present time we do not support global IDs for node
     *     types other than document or element nodes.
     * @param {Object} anObject The node, window, or other object to get the
     *     global ID of.
     * @param {Boolean} assignIfAbsent True if the object should have an ID
     *     assigned if one doesn't exist. Default is false.
     * @example Obtain a global ID for a JavaScript object:
     *     <code>
     *          TP.gid('hi');
     *          <samp>hi</samp>
     *          TP.gid(42);
     *          <samp>42</samp>
     *          TP.gid(true);
     *          <samp>true</samp>
     *          TP.gid(TP.ac());
     *          <samp>Array_11194fef891948efcb003e0d8</samp>
     *          TP.gid(TP.hc());
     *          <samp>TP.core.Hash_11194ff08b02373b76de8c7c</samp>
     *          TP.gid(TP.dc());
     *          <samp>Date_111997a9773f185a33f9280f</samp>
     *          TP.gid((function() {TP.info('foo');}));
     *          <samp>Function_111997cb98f69d60b2cc7daa</samp>
     *          TP.gid(TP.lang.Object.construct());
     *          <samp>TP.lang.Object_111997a3ada0b5cb1f4dc5398</samp>
     *     </code>
     * @example Obtain a global ID for a top-level Window:
     *     <code>
     *          TP.gid(top);
     *          <samp>TDC</samp>
     *     </code>
     * @example Obtain a global ID for a frame window within top-level Window:
     *     <code>
     *          TP.gid(top);
     *          <samp>TDC.ui</samp>
     *     </code>
     * @example Obtain a global ID for the document of a frame window within
     *     top-level Window:
     *     <code>
     *          TP.gid(top.document);
     *         <samp>tibet://TDC.ui/http://www.teamtibet.com/tibet/app/tdc/TIBET-INF/src/html/tdc_moz.html#document</samp>
     *     </code>
     * @example Obtain a global ID for the 'body' element of the document of a
     *     frame window within top-level Window, assigning it an 'id' if it
     *     doesn't have one:
     *     <code>
     *          TP.gid(TP.documentGetBody(top.document), true);
     *         <samp>tibet://TDC.ui/http://www.teamtibet.com/tibet/app/tdc/TIBET-INF/src/html/tdc_moz.html#BODY_111996b6d1560b4952693a988</samp>
     *     </code>
     * @returns {String} The global ID of anObject or null if it doesn't have
     *     one.
     */

    var assign,
        obj,
        doc,
        win,
        loc,
        prefix,
        localID,
        globalID,
        pnames,
        id,
        root,

        elem;

    if (anObject === null) {
        return 'null';
    } else if (anObject === undefined) {
        return 'undefined';
    }

    //  non-mutables can't do much here, their value is their ID
    if (!TP.isMutable(anObject)) {
        return TP.str(anObject);
    }

    assign = TP.ifInvalid(assignIfAbsent, false);

    if (TP.isKindOf(anObject, TP.dom.Node)) {
        if (TP.isType(anObject)) {
            obj = anObject;
        } else {
            obj = anObject.getNativeNode();
        }
    } else {
        obj = anObject;
    }

    if (TP.isElement(obj)) {
        //  If the element doesn't have a cached value for its globalID
        //  slot then we compute one

        //  if we have a value, encode and return it. Note here how we have put
        //  the slot directly on the element for speed and to avoid markup
        //  clutter.
        globalID = obj[TP.GLOBAL_ID];
        if (TP.notEmpty(globalID)) {
            return encodeURI(globalID);
        }

        //  the local ID for our element is the last portion
        localID = TP.lid(obj, assign);

        //  if no localID then we're not going to be able to locate this
        //  element again...so it doesn't have a global ID
        if (TP.isEmpty(localID)) {
            return;
        }

        //  if we've got a local ID then we can try to get the global ID
        //  for its document. if we're successful with that then we can
        //  adjust that ID for the element
        doc = TP.nodeGetDocument(obj);
        if (TP.isDocument(doc)) {
            prefix = TP.objectGlobalID(doc, assign);
            if (TP.notEmpty(prefix)) {
                globalID = prefix.replace(/#.+/, '#' + localID);
                if (assign) {
                    //  Note here how we put the slot directly on the element
                    //  for speed and to avoid markup clutter.
                    obj[TP.GLOBAL_ID] = globalID;
                }
                return globalID;
            }
        }

        //  no document, or no document global ID, so we can't be found
        //  again via any ID we might return
        return;
    }

    if (TP.isDocument(obj)) {

        prefix = '';

        //  if a document doesn't have a window then we have to know its
        //  URI location so we can access it via the URI
        win = TP.nodeGetWindow(obj);
        if (TP.isWindow(win)) {
            globalID = TP.objectGlobalID(win, assign);
            prefix = 'tibet://' + globalID + '/';
        }

        //  in some sense the URI aspect is irrelevant if the document is in
        //  a window, since to reacquire that particular document a) we
        //  don't need any more data and b) it won't be the same document if
        //  the window reloads for any reason. it's the second portion of
        //  this that leads us to qualify document IDs with their URI
        //  locations to help ensure that at least we end up with a new
        //  document that should roughly approximate the one we've got now

        //  this should return either an empty string, or a URI that
        //  resolves to a file: or http[s]: address
        if (TP.isElement(root = obj.documentElement) &&
            TP.notEmpty(id = TP.elementGetAttribute(
                            root, TP.GLOBAL_DOCID_ATTR, true))) {

            //  If the document ID was assigned before this document was placed
            //  into a Window, or was placed into a different window, this 'id'
            //  won't have a prefix containing the current Window ID. We will
            //  update it to contain that.
            if (win) {

                //  It doesn't start with our current prefix
                if (!id.startsWith(prefix)) {
                    //  If it starts with another 'tibet:' prefix (but *not* a
                    //  virtual path - we allow those), slice that off
                    if (TP.regex.TIBET_URL.test(id) &&
                        !TP.regex.VIRTUAL_URI_PREFIX.test(id)) {
                        id = id.slice(id.indexOf('/', 8) + 1);
                    }

                    loc = id;

                    if (TP.regex.URI_FRAGMENT.test(loc)) {
                        //  had a # fragment identifier so won't need #document
                        loc = encodeURI(prefix + loc);
                    } else {
                        //  NOTE we add the '#document' element reference as our
                        //  barename when no specific subelement is the document
                        loc = encodeURI(prefix + loc + '#document');
                    }

                    if (TP.isElement(root) && assign) {
                        TP.elementSetAttribute(
                                root, TP.GLOBAL_DOCID_ATTR, loc, true);
                    }

                    //  Remove all TP.GLOBAL_ID and TP.EVENT_IDs slots from any
                    //  elements in the document that have them - this will
                    //  cause them to reset
                    TP.ac(obj.getElementsByTagName('*')).forEach(
                            function(anElem) {
                                delete anElem[TP.EVENT_IDS];
                                delete anElem[TP.GLOBAL_ID];
                            });
                } else {
                    loc = id;
                }
            } else {
                loc = id;
            }
        } else {
            loc = TP.documentGetLocation(obj, false, true) || '';

            if (TP.isEmpty(loc)) {
                if (TP.isElement(root)) {
                    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
                    id = TP.genID().replace('$', 'document_').replace(
                                            TP.regex.INVALID_ID_CHARS, '_');

                    loc = id;
                } else {
                    //  empty location, empty document
                    loc = '';
                }
            } else {
                loc = TP.uriInTIBETFormat(loc);
            }

            if (TP.regex.URI_FRAGMENT.test(loc)) {
                //  had a # fragment identifier so we won't need #document
                loc = encodeURI(prefix + loc);
            } else {
                //  NOTE we add the '#document' element reference as our
                //  barename when no specific sub-element is the document
                loc = encodeURI(prefix + loc + '#document');
            }

            if (TP.isElement(root) && assign) {
                TP.elementSetAttribute(
                        root, TP.GLOBAL_DOCID_ATTR, loc, true);
            }
        }

        return loc;
    }

    if (TP.isNode(obj)) {
        elem = obj.parentNode;

        if (TP.isAttributeNode(obj)) {
            //  Reset the element here to the attribute's owner element.
            elem = TP.attributeGetOwnerElement(obj);

            //  A detached AttributeNode won't have an Element as an owner
            //  element... sometimes it has an empty Array - weird.
            if (TP.isElement(elem)) {
                //  Grab the owner element's global ID and slice off from the
                //  beginning through the '#'. This will give us the 'primary
                //  URI'.
                globalID = TP.gid(elem, true);
                globalID = globalID.slice(0, globalID.lastIndexOf('#'));

                //  Construct an 'xpath1' XPointer that causes the traversal to
                //  the Element and then down to the attribute.
                globalID += '#xpath1(//*[@id=\'' + TP.lid(elem, true) + '\']' +
                            '/@' + TP.attributeGetLocalName(obj) + ')';
            } else {
                globalID = '#xpath1(./@' + TP.attributeGetLocalName(obj) + ')';
            }

            //  Set elem to 'null' here as we've already computed the element's
            //  ID and don't want further content.
            elem = null;
        } else if (TP.isTextNode(obj)) {
            globalID = '#xpath1(./text()[contains(.,\'' +
                TP.nodeGetTextContent(obj) + '\')])';
        } else if (TP.isCDATASectionNode(obj)) {
            globalID = '#xpath1(./text()[contains(.,\'' +
                TP.nodeGetTextContent(obj) + '\')])';
        } else if (TP.isPINode(obj)) {
            globalID = '#xpath1(./processing-instruction(\'' +
                TP.name(obj) + '\'))';
        } else if (TP.isCommentNode(obj)) {
            globalID = '#xpath1(./comment()[1])';
        } else if (TP.isFragment(obj)) {
            globalID = '#document-fragment';
        }

        if (TP.isElement(elem)) {
            //  Note here how we pass true to assign an ID to the element if it
            //  doesn't have one. We're trying to avoid getting an '#element()'
            //  path.
            globalID = TP.gid(elem, true) + globalID;
        }

        return globalID;
    }

    if (TP.isWindow(obj) || TP.isKindOf(obj, TP.core.Window)) {
        //  Unwrap it (in case it's a TP.core.Window wrapper)
        obj = TP.unwrap(obj);

        //  get the Array of parent window names
        pnames = TP.windowGetParentNames(obj);

        //  the local ID for our window
        localID = TP.lid(obj, assign);

        //  if no localID then call TP.lid() again, forcing it to
        //  assign.
        if (TP.isEmpty(localID)) {
            localID = TP.lid(obj, true);
        }

        //  add our name (the window where we started this process) onto
        //  the end of the window's name array
        pnames.push(localID);

        //  join the names together with a '.'
        globalID = pnames.join('.');

        return globalID;
    }

    //  an option is if the object can return a standard TIBET ID
    if (TP.canInvoke(obj, 'getID')) {
        return obj.getID();
    }

    //  can't compute a local ID? Just return the object's name then.
    return TP.name(obj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('gid', TP.objectGlobalID);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectLocalID',
function(anObject, assignIfAbsent) {

    /**
     * @method objectLocalID
     * @alias lid
     * @summary Returns the local ID of the object provided. This method is
     *     normally used on nodes as a way of getting an ID that is local to the
     *     node's enclosing document. NOTE that the TP.lid() function is aliased
     *     to this function as a 'shorthand'.
     * @description It's often necessary to get a handle to an object by ID. In
     *     a typical environment this would be done via the native
     *     document.getElementById() call. Unfortunately, that call won't work
     *     on XML DOMs cross-browser so in TIBET you'd normally use
     *     TP.nodeGetElementById() instead.
     *
     *     In any case, this function will return the local ID of the object
     *     provided. When the object is an element this is the value of the 'id'
     *     attribute as set by the original markup author, or a generated ID
     *     which is then assigned to the element for future reference.
     *
     *     If anObject is a Window, this method returns the Window's name, or a
     *     uniquely generated window name such as window_1 when the window had
     *     no name. This name is also assigned to the window and registered with
     *     the 'browser' object for future lookup purposes.
     *
     *     If anObject is a Document (or XML Document), this method returns the
     *     string 'document', which is not unique, but it's about all we can use
     *     to ensure that when used as part of a larger global ID the document
     *     element has a reference.
     *
     *     If anObject is any other type of object TIBET will try to return
     *     that object's ID via the getID() method.
     * @param {Object} anObject The node, window, or object to return the ID of.
     * @param {Boolean} assignIfAbsent True if the object should have an ID
     *     assigned if one doesn't exist. Default is false.
     * @example Obtain a local ID for a JavaScript object:
     *     <code>
     *          TP.lid('hi');
     *          <samp>hi</samp>
     *          TP.lid(42);
     *          <samp>42</samp>
     *          TP.lid(true);
     *          <samp>true</samp>
     *          TP.lid(TP.ac());
     *          <samp>Array_11194fef891948efcb003e0d8</samp>
     *          TP.lid(TP.hc());
     *          <samp>TP.core.Hash_11194ff08b02373b76de8c7c</samp>
     *          TP.lid(TP.dc());
     *          <samp>Date_111997a9773f185a33f9280f</samp>
     *          TP.lid((function() {TP.info('foo');}));
     *          <samp>Function_111997cb98f69d60b2cc7daa</samp>
     *          TP.lid(TP.lang.Object.construct());
     *          <samp>TP.lang.Object_111997a3ada0b5cb1f4dc5398</samp>
     *     </code>
     * @example Obtain a local ID for a top-level Window:
     *     <code>
     *          TP.lid(top);
     *          <samp>TDC</samp>
     *     </code>
     * @example Obtain a local ID for a frame window within top-level Window:
     *     <code>
     *          TP.lid(top);
     *          <samp>ui</samp>
     *     </code>
     * @example Obtain a local ID for the document of a frame window within
     *     top-level Window:
     *     <code>
     *          TP.lid(top.document);
     *          <samp>document</samp>
     *     </code>
     * @example Obtain a local ID for the 'body' element of the document of a
     *     frame window within top-level Window, assigning it an 'id' if it
     *     doesn't have one:
     *     <code>
     *          TP.lid(TP.documentGetBody(top.document), true);
     *          <samp>element(/1/1)</samp>
     *     </code>
     * @returns {String} The local ID of anObject.
     */

    var assign,
        obj,
        localID,
        frameElem,

        elem;

    if (anObject === null) {
        return 'null';
    } else if (anObject === undefined) {
        return 'undefined';
    }

    //  non-mutables can't do much here, their value is their ID
    if (!TP.isMutable(anObject)) {
        return TP.str(anObject);
    }

    assign = TP.ifInvalid(assignIfAbsent, false);

    if (TP.isKindOf(anObject, TP.dom.Node)) {
        obj = TP.unwrap(anObject);
    } else {
        obj = anObject;
    }

    //  other nodes use their 'id' attribute, or create one as needed
    if (TP.isElement(obj)) {
        //  here, our preference is return an ID, as it tends to be much
        //  more unique than a NAME
        if (TP.isEmpty(localID = TP.elementGetAttribute(obj, 'id'))) {
            //  if we're able to assign then we can look for semantically
            //  valuable identification options
            if (assign) {

                if (TP.isEmpty(localID)) {
                    //  Build a unique value and assign it
                    localID = TP.elemGenID(obj);
                }

                TP.elementSetAttribute(obj, 'id', localID);
            } else {
                //  only option is to construct a unique ID
                if (TP.isEmpty(localID)) {
                    //  Build a unique value
                    localID = TP.elemGenID(obj);
                }
            }
        }

        return localID;
    }

    //  when dealing with documents of any kind we return the string
    //  'document' so lookups have a way to identify the document
    if (TP.isDocument(obj)) {
        return 'document';
    }

    if (TP.isNode(obj)) {
        if (TP.isAttributeNode(obj)) {
            localID = '@' + TP.attributeGetLocalName(obj);
            elem = TP.attributeGetOwnerElement(obj);
        } else if (TP.isTextNode(obj)) {
            localID = 'text()[contains(.,\'' +
                TP.nodeGetTextContent(obj) + '\')]';
        } else if (TP.isCDATASectionNode(obj)) {
            localID = 'text()[contains(.,\'' +
                TP.nodeGetTextContent(obj) + '\')]';
        } else if (TP.isPINode(obj)) {
            localID = 'processing-instruction(\'' + TP.name(obj) + '\')';
        } else if (TP.isCommentNode(obj)) {
            localID = 'comment()[1]';
        } else if (TP.isFragment(obj)) {
            localID = '#document-fragment';
        }

        //  If the element wasn't assigned above (i.e. we were not an Attribute
        //  node), then try here by getting the parent node.
        if (!TP.isElement(elem)) {
            elem = obj.parentNode;
        }

        if (TP.isElement(elem)) {
            localID = '#xpath1(//*[@id=\'' + TP.lid(elem) + '\']/' +
                        localID +
                        ')';
        } else if (!TP.isFragment(obj)) {
            //  NB: We don't do this for DocumentFragments.
            localID = '#xpath1(./' + localID + ')';
        }

        return localID;
    }

    //  when dealing with windows we use the window name, or a generated one
    if (TP.isWindow(obj) || TP.isKindOf(obj, TP.core.Window)) {
        //  Unwrap it (in case it's a TP.core.Window wrapper)
        obj = TP.unwrap(obj);

        //  IE will throw an exception if we try to get the frameElement but
        //  the window is not hosted in a frame/iframe... sigh.
        try {
            frameElem = obj.frameElement;
        } catch (e) {
            frameElem = null;
        }

        if (TP.isElement(frameElem)) {
            localID = TP.elementGetAttribute(frameElem, 'id');
            if (TP.isEmpty(localID)) {
                if (assign) {
                    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
                    localID = TP.genID().replace('$', 'ID_').replace(
                                            TP.regex.INVALID_ID_CHARS, '_');
                    TP.elementSetAttribute(frameElem, 'id', localID);
                }
            }

            return localID;
        }

        localID = obj.name;
        if (localID && !localID.isJSIdentifier()) {
            localID = '';
            assign = true;
        }

        //  no name and assign was true? generate the next available one and
        //  use it
        if (TP.isEmpty(localID)) {
            if (assign) {
                if (obj === window.top) {
                    localID = 'top';
                } else {
                    localID = TP.getNextWindowName();
                }

                try {
                    obj.name = localID;
                } catch (e) {
                    //  if we can't set the name (permissions?) then we
                    //  don't want to return a valid ID here
                    return null;
                }
            }

            return;
        }

        return localID;
    }

    //  an option is if the object can return a standard TIBET ID

    //  NOTE that we don't use objectLocalID here or we'd recurse into this
    //  routine
    if (TP.canInvoke(obj, 'getID')) {
        return obj.getID();
    }

    //  can't compute a local ID? Just return the object's name then.
    return TP.name(obj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('lid', TP.objectLocalID);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectID',
function(anObject, assignIfAbsent) {

    /**
     * @method objectID
     * @alias id
     * @summary Returns the ID of anObject, the value considered to be the
     *     object's unique identifier. NOTE that the TP.id() function is aliased
     *     to this function as a 'shorthand'.
     * @param {Object} anObject The object to interrogate.
     * @param {Boolean} assignIfAbsent True if the object should have an ID
     *     assigned if one doesn't exist. Default is false.
     * @example Obtain an ID for a JavaScript object:
     *     <code>
     *          TP.id('hi');
     *          <samp>hi</samp>
     *          TP.id(42);
     *          <samp>42</samp>
     *          TP.id(true);
     *          <samp>true</samp>
     *          TP.id(TP.ac());
     *          <samp>Array_11194fef891948efcb003e0d8</samp>
     *          TP.id(TP.hc());
     *          <samp>TP.core.Hash_11194ff08b02373b76de8c7c</samp>
     *          TP.id(TP.dc());
     *          <samp>Date_111997a9773f185a33f9280f</samp>
     *          TP.id((function() {TP.info('foo');}));
     *          <samp>Function_111997cb98f69d60b2cc7daa</samp>
     *          TP.id(TP.lang.Object.construct());
     *          <samp>TP.lang.Object_111997a3ada0b5cb1f4dc5398</samp>
     *     </code>
     * @example Obtain an ID for a top-level Window:
     *     <code>
     *          TP.id(top);
     *          <samp>TDC</samp>
     *     </code>
     * @example Obtain an ID for a frame window within top-level Window:
     *     <code>
     *          TP.id(top);
     *          <samp>TDC.ui</samp>
     *     </code>
     * @example Obtain an ID for the document of a frame window within top-level
     *     Window:
     *     <code>
     *          TP.id(top.document);
     *
     *
     *         <samp>tibet://TDC.ui/http://www.teamtibet.com/tibet/app/tdc/TIBET-INF/src/html/tdc_moz.html#document</samp>
     *     </code>
     * @example Obtain an ID for the 'body' element of the document of a frame
     *     window within top-level Window, assigning it an 'id' if it doesn't
     *     have one:
     *     <code>
     *          TP.id(TP.documentGetBody(top.document), true);
     *
     *
     *         <samp>tibet://TDC.ui/http://www.teamtibet.com/tibet/app/tdc/TIBET-INF/src/html/tdc_moz.html#BODY_111996b6d1560b4952693a988</samp>
     *     </code>
     * @returns {String} A string ID.
     */

    if (anObject === void 0) {
        return 'undefined';
    }

    if (anObject === null) {
        return 'null';
    }

    //  the ID of a non-mutable object is its value
    if (!TP.isMutable(anObject)) {
        return TP.str(anObject);
    }

    if (TP.canInvoke(anObject, 'getID')) {
        return anObject.getID();
    }

    //  most everything else can be managed via global ID (nodes, windows,
    //  etc)
    return TP.gid(anObject, assignIfAbsent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('id', TP.objectID);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectName',
function(anObject) {

    /**
     * @method objectName
     * @alias name
     * @summary Returns the name of anObject, most often associated with types,
     *     functions, or node "tag names". When dealing with tag names this
     *     method returns the canonical name of the tag. When all else fails
     *     this method will return the local ID of the object.
     * @param {Object} anObject The object to interrogate.
     * @returns {String} A string "name".
     */

    if (anObject === void 0) {
        return 'undefined';
    }

    if (anObject === null) {
        return 'null';
    }

    if (TP.isNonFunctionConstructor(anObject)) {
        return TP.getNonFunctionConstructorName(anObject);
    }

    //  non-mutables use their value as their name
    if (!TP.isMutable(anObject)) {
        return TP.str(anObject);
    }

    if (TP.isNode(anObject)) {
        if (TP.isElement(anObject)) {
            return TP.elementGetCanonicalName(anObject);
        } else if (TP.isTextNode(anObject)) {
            return '#text';
        } else if (TP.isDocument(anObject)) {
            return '#document';
        } else if (TP.isAttributeNode(anObject)) {
            return TP.attributeGetCanonicalName(anObject);
        } else if (TP.isFragment(anObject)) {
            return '#document-fragment';
        } else if (TP.isCommentNode(anObject)) {
            return '#comment';
        } else if (TP.isCDATASectionNode(anObject)) {
            return '#cdata-section';
        } else if (TP.isPINode(anObject)) {
            return anObject.nodeName;
        }
    }

    if (TP.isWindow(anObject)) {
        return anObject.name;
    }

    if (TP.canInvoke(anObject, 'getName')) {
        return anObject.getName();
    } else if (TP.isFunction(anObject)) {
        //  This should only trigger for Functions that came from other JS
        //  contexts - in TIBET, TP.FunctionProto has a 'getName' method.
        return TP.getFunctionName(anObject);
    }

    //  Try to 'call' "TP.FunctionProto's" 'getName' on the object, but put it
    //  in a try...catch, since this is a bit dangerous (it will try to put a
    //  slot on anObject).
    try {
        return TP.FunctionProto.$getOID.call(anObject);
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e, 'Error retrieving object name.')) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('name', TP.objectName);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectOwner',
function(anObject) {

    /**
     * @method objectOwner
     * @alias owner
     * @summary Returns the owner of anObject, which should be a Function. The
     *     owner is the type, either TIBET or native type, which 'owns' the
     *     Function (i.e. its 'owns' the property in a 'hasOwnProperty' sort of
     *     way).
     * @param {Object} anObject The object to interrogate.
     * @returns {Object} The owner object.
     */

    if (TP.isValid(anObject)) {
        return anObject[TP.OWNER];
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('owner', TP.objectOwner);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectTrack',
function(anObject) {

    /**
     * @method objectTrack
     * @alias track
     * @summary Returns the track of anObject, which should be a Function. The
     *     track is the 'track' that the object can be found when looking up an
     *     inheritance hierarchy. The value returned can be one of the
     *     following:
     *
     *      TP.GLOBAL_TRACK
     *      TP.PRIMITIVE_TRACK
     *      TP.META_INST_TRACK
     *      TP.META_TYPE_TRACK
     *      TP.INST_TRACK
     *      TP.LOCAL_TRACK
     *      TP.TYPE_TRACK
     *      TP.TYPE_LOCAL_TRACK
     *
     * @param {Object} anObject The object to interrogate.
     * @returns {String} A string "track".
     */

    if (TP.isValid(anObject)) {
        return anObject[TP.TRACK];
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('track', TP.objectTrack);

//  ------------------------------------------------------------------------

TP.definePrimitive('elemGenID',
function(anElement, assignIfAbsent) {

    /**
     * @method elemGenID
     * @summary Generates a unique ID (if the element doesn't already have one)
     *     that is compliant with XML ID rules.
     * @param {TP.dom.ElementNode|Element} anElement An Element or element
     *     wrapper.
     * @param {Boolean} assignIfAbsent True if the element should have an ID
     *     assigned if one doesn't exist. Default is false.
     * @returns {String} The element's ID, which might have been newly assigned
     *     by this method.
     */

    var elem,
        assign,

        fullName,

        id;

    elem = TP.unwrap(anElement);
    assign = TP.ifInvalid(assignIfAbsent, false);

    if (TP.isEmpty(id = TP.elementGetAttribute(elem, 'id', true))) {

        fullName = TP.elementGetFullName(anElement);

        TP.regex.INVALID_ID_CHARS.lastIndex = 0;
        id = TP.genID(fullName).replace(TP.regex.INVALID_ID_CHARS, '_');

        if (assign) {
            TP.elementSetAttribute(elem, 'id', id, true);
        }
    }

    return id;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nsuri',
function(anObject) {

    /**
     * @method nsuri
     * @summary Returns the namespace URI of the object, if it has one. This is
     *     only relevant for nodes. The search includes both the namespaceURI
     *     property and a search for an xmlns attribute.
     * @param {TP.dom.Node|Node} anObject A Node or node wrapper.
     * @returns {String} The namespace URI.
     */

    var node;

    node = TP.unwrap(anObject);
    if (!TP.isNode(node)) {
        return;
    }

    return TP.nodeGetNSURI(node);
});

//  ------------------------------------------------------------------------
//  DUPLICATION
//  ------------------------------------------------------------------------

TP.definePrimitive('objectCopy',
function(anObject, shallow) {

    /**
     * @method objectCopy
     * @alias copy
     * @summary Returns a copy of the object provided. When the object is a
     *     Node the copy is deep unless overridden by the shallow flag. When the
     *     object is a standard JS object the clone is shallow. NOTE that window
     *     objects cannot be copied, nor can various ActiveX elements so not all
     *     objects will return a valid value in response to this call.
     * @param {Object} anObject The object to interrogate.
     * @param {Boolean} shallow True to force node clones to be shallow, or
     *     reference elements to be shallow copies.
     * @returns {Node|Object} A Node or Object depending on the nature of the
     *     inbound object.
     */

    var eventDocument,

        newObj,
        keys;

    //  null, undefined, and window objects are obvious problems
    if (TP.notValid(anObject) || TP.isWindow(anObject)) {
        return;
    } else if (TP.isNode(anObject)) {
        return TP.nodeCloneNode(anObject, TP.isTrue(shallow) ? false : true);
    } else if (TP.canInvoke(anObject, 'copy')) {
        return anObject.copy(shallow);
    } else if (TP.isEvent(anObject)) {
        if (TP.isDocument(eventDocument =
                            TP.eventGetTarget(anObject).document)) {
            return TP.documentConstructEvent(eventDocument, anObject);
        }
    } else if (TP.isPlainObject(anObject)) {
        newObj = {};

        keys = TP.keys(anObject);
        keys.forEach(
                function(aKey) {
                    var val;

                    val = anObject[aKey];
                    if (!shallow && TP.isReferenceType(val)) {
                        newObj[aKey] = TP.objectCopy(val);
                    } else {
                        newObj[aKey] = val;
                    }
                });

        return newObj;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('copy', TP.objectCopy);

//  ------------------------------------------------------------------------
//  VALUE/FORMAT QUERIES
//  ------------------------------------------------------------------------

/*
When inspecting or logging an object you'll often want to get a string or
source-code formatted string version of the object to view. These functions
let you do that in a consistent fashion that still leverages any processing
the object may support for providing a "best case" representation.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('format',
function(anObject, aFormat, formatParams) {

    /**
     * @method format
     * @summary Formats an object using the format provided. The process here
     *     tries to leverage TIBET's object layer to produce the best possible
     *     formatted output based on the combination of object and format.
     * @param {Object} anObject The object to format.
     * @param {Object} aFormat A String or type used to format the object. If
     *     empty then no formatting is performed.
     * @param {TP.core.Hash|TP.sig.Request} formatParams Optional formatting
     *     data.
     * @returns {Object} Typically a string, but not required.
     */

    var obj;

    //  no format means no work
    if (TP.isEmpty(aFormat)) {
        return anObject;
    }

    //  no valid source object? Try to see if we can transform it.
    if (TP.notValid(anObject)) {

        //  See if we can use 'transform' with the invalid object (it should
        //  work as 'getBestMethod' computes proper method names for null and
        //  undefined)
        if (TP.canInvoke(aFormat, 'transform')) {
            return aFormat.transform(anObject, formatParams);
        }

        return;
    }

    //  If the 'shouldWrap' flag in the format params isn't false, wrap the
    //  object so that we ensure we're talking to TIBET objects.
    if (TP.isValid(formatParams) &&
        TP.notFalse(formatParams.at('shouldWrap'))) {
        obj = TP.wrap(anObject);
    } else {
        obj = anObject;
    }

    //  as() leads to format() in many cases, so we start with that given
    //  that it's the common TIBET entry point
    if (TP.canInvoke(obj, 'as')) {
        return obj.as(aFormat, formatParams);
    }

    //  Otherwise, see if we can use 'transform' with the unwrapped object
    if (TP.canInvoke(aFormat, 'transform')) {
        return aFormat.transform(anObject, formatParams);
    }

    //  Out of options. Return original object.
    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectHTMLNode',
function(anObject, aDocument) {

    /**
     * @method objectHTMLNode
     * @alias htmlnode
     * @summary Returns an HTML node representation of the receiver. NOTE that
     *     the TP.htmlnode() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need an HTML-compatible node. For objects which can't
     *     provide their own asHTMLNode() implementations this method typically
     *     returns the TP.objectStringValue() in a text node.
     *
     *     NOTE that since HTML can't handle a number of XML constructs those
     *     constructs are removed from the result node by the processing of this
     *     method.
     * @param {Object} anObject The object to format as HTML.
     * @param {HTMLDocument} aDocument The document which should own the result
     *     node. Defaults to the current canvas's document.
     * @example Obtain the HTML node representation for a JavaScript object:
     *     <code>
     *          TP.htmlnode('hi');
     *          <samp>[object Text]</samp>
     *          TP.htmlnode(42);
     *          <samp>[object Text]</samp>
     *          TP.htmlnode(true);
     *          <samp>[object Text]</samp>
     *          TP.htmlnode(TP.ac());
     *          <samp>[object Text]</samp>
     *          TP.htmlnode(TP.hc());
     *          <samp>[object Text]</samp>
     *          TP.htmlnode(TP.dc());
     *          <samp>[object Text]</samp>
     *          TP.htmlnode((function() {TP.info('foo');}));
     *          <samp>[object Text]</samp>
     *          TP.htmlnode(TP.lang.Object.construct());
     *          <samp>[object Text]</samp>
     *     </code>
     * @example Obtain the HTML node representation for a Window:
     *     <code>
     *          TP.htmlnode(top);
     *          <samp>[object Text]</samp>
     *     </code>
     * @example Obtain the HTML node representation for an HTML Document:
     *     <code>
     *          TP.htmlnode(top.document);
     *          <samp>[object HTMLDocument]</samp>
     *          TP.htmlnode(top.document) === top.document;
     *          <samp>true</samp>
     *     </code>
     * @example Obtain the HTML node representation for an HTML Element:
     *     <code>
     *          TP.htmlnode(TP.documentGetBody(top.document));
     *          <samp>[object HTMLBodyElement]</samp>
     *          TP.htmlnode(TP.documentGetBody(top.document)) ===
     *         TP.documentGetBody(top.document);
     *          <samp>true</samp>
     *     </code>
     * @returns {Node} The best-possible HTML node for the Object.
     */

    var doc;

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    doc = TP.isHTMLDocument(aDocument) ?
                aDocument :
                TP.sys.getUICanvas().getNativeDocument();

    if (TP.isNode(anObject)) {
        return TP.nodeAsHTMLNode(anObject, doc);
    }

    if (TP.canInvoke(anObject, 'asHTMLNode')) {
        return anObject.asHTMLNode(doc);
    }

    return doc.createTextNode(TP.str(anObject));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlnode', TP.objectHTMLNode);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectHTMLString',
function(anObject) {

    /**
     * @method objectHTMLString
     * @alias htmlstr
     * @summary Returns an HTML string representation of the receiver. NOTE
     *     that the TP.htmlstr() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need an HTML-compatible string. For objects which can't
     *     provide their own asHTMLString implementations this method typically
     *     returns the objectStringValue.
     *
     *     NOTE that since HTML can't handle a number of XML constructs those
     *     constructs are removed from the result string by the processing of
     *     this method.
     * @param {Object} anObject The object to format as HTML.
     * @returns {String} The best-possible HTML rep of the Object.
     */

    var arr,

        len,
        i,

        rules;

    if (anObject === void 0) {
        return 'undefined';
    }

    if (anObject === null) {
        return 'null';
    }

    //  we're usually calling this with a standard object so we can leverage
    //  TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asHTMLString')) {
        try {
            return anObject.asHTMLString();
        } catch (e) {
            void 0;
        }
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        return '<span class="XHR">' +
                    '<span data-name="status">' +
                        anObject.status +
                    '</span>' +
                    '<span data-name="responseText">' +
                        TP.htmlstr(anObject.responseText) +
                    '</span>' +
                '</span>';
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return TP.nodeAsHTMLString(anObject);
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        return '<span class="Error" data-name="message">' +
                    TP.str(anObject.message) +
                '</span>';
    }

    if (TP.isString(anObject)) {
        return anObject;
    }

    //  Since Number is a non-mutable, we must do this before the next check
    if (TP.isNumber(anObject)) {
        return TP.str(anObject);
    }

    if (!TP.isMutable(anObject)) {
        //  TODO:   does this really deal with all the special constants
        //  like NaN, Number.POSITIVE_INFINITY, etc.?
        return TP.str(anObject);
    }

    //  The top-level Window has TIBET loaded into it, so it will respond to
    //  'asString' properly, but other iframes, etc. won't so we have to handle
    //  Windows in a special manner here, which is the same as the
    //  'asXMLString()'
    if (TP.isWindow(anObject)) {
        return TP.windowAsHTMLString(anObject);
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        return TP.eventAsHTMLString(anObject);
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        arr.push('<span class="NodeList">');
        for (i = 0; i < len; i++) {
            arr.push(
                    '<span data-name="', i, '">',
                        TP.htmlstr(anObject[i]),
                    '</span>');
        }
        arr.push('</span>');

        return arr.join('');
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        arr.push('<span class="NamedNodeMap">');
        for (i = 0; i < len; i++) {
            arr.push(
                    '<span data-name="key">',
                        TP.name(anObject.item(i)),
                    '</span>',
                    '<span data-name="value">',
                        TP.val(anObject.item(i)),
                    '</span>');
        }
        arr.push('</span>');

        return arr.join('');
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.htmlstr(rules[i]));
        }

        return '<span class="CSSStyleSheet">' + arr.join(' ') + '</span>';
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return '<span class="CSSStyleRule">' + anObject.cssText + '</span>';
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return '<span class="CSSStyleDeclaration">' +
            anObject.cssText + '</span>';
    }

    //  we're usually calling this with a standard object so we can leverage
    //  TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asHTMLString')) {
        return anObject.asHTMLString();
    }

    //  other cases should be dealt with by just returning the string rep
    return TP.str(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlstr', TP.objectHTMLString);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectJSONSource',
function(anObject) {

    /**
     * @method objectJSONSource
     * @alias jsonsrc
     * @summary Returns a best-possible JSON representation of the object. NOTE
     *     that the TP.jsonsrc() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need a JSON string.
     * @param {Object} anObject The object to return the JSON for.
     * @returns {String} The best-possible JSON rep of the Object.
     */

    var arr,
        len,
        i,

        rules;

    if (anObject === void 0) {
        return 'undefined';
    }

    if (anObject === null) {
        return 'null';
    }

    if (TP.isNaN(anObject)) {
        return '"NaN"';
    }

    if (TP.isInvalidDate(anObject)) {
        return '"NaN-NaN-NaNTNaN:NaN:NaN"';
    }

    //  we're usually calling this with a standard object so we can leverage
    //  TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asJSONSource')) {
        try {
            return anObject.asJSONSource();
        } catch (e) {
            void 0;
        }
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        return '{"type":"XHR",' +
                '"data":{' +
                    '"status":' + anObject.status.quoted('"') + ',' +
                    '"content":' + TP.jsonsrc(anObject.responseText) + '}}';
    }

    //  DocumentFragment objects need to be treated specially.
    if (TP.isFragment(anObject)) {
        arr = TP.ac();

        arr.push('{"type":"DocumentFragment","data":[');

        len = anObject.childNodes.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.jsonsrc(anObject.childNodes[i]), ',');
        }

        //  Pop off the last comma
        arr.pop();

        arr.push(']}');

        return arr.join('');
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return '{"type":"' + TP.tname(anObject) + '",' +
                '"data":' + TP.xml2json(anObject) + '}';
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        return '{"type":"' + TP.tname(anObject) + '",' +
                '"data":' + anObject.message.quoted('"') +
                '}';
    }

    if (TP.isString(anObject)) {
        return anObject.quoted('"');
    }

    if (TP.isNumber(anObject) || TP.isBoolean(anObject)) {
        return TP.objectToString(anObject);
    }

    if (!TP.isMutable(anObject)) {
        //  TODO:   does this really deal with all the special constants
        //  like NaN, Number.POSITIVE_INFINITY, etc.?

        return TP.objectToString(anObject).quoted('"');
    }

    if (TP.isFunction(anObject)) {
        return '{"type":"' + TP.tname(anObject) + '",' +
                '"data":' + TP.str(anObject) + '}';
    }

    //  The top-level Window has TIBET loaded into it, so it will respond to
    //  'asString' properly, but other iframes, etc. won't so we have to handle
    //  Windows in a special manner here, which is the same as the
    //  'asJSONSource()'
    if (TP.isWindow(anObject)) {
        return TP.windowAsJSONSource(anObject);
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        return TP.eventAsJSONSource(anObject);
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        arr = TP.ac();

        arr.push('{"type":"NodeList","data":[');

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.jsonsrc(anObject[i]), ',');
        }

        //  Pop off the last comma
        arr.pop();

        arr.push(']}');

        return arr.join('');
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        arr.push('{"type":"NamedNodeMap","data":{');

        len = anObject.length;
        for (i = 0; i < len; i++) {

            arr.push('"', TP.name(anObject.item(i)), '":"',
                         TP.val(anObject.item(i)), '"',
                        ',');
        }

        //  Pop off the last comma
        arr.pop();

        arr.push('}}');

        return arr.join('');
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.jsonsrc(rules[i]));
        }

        return '{"type":"Stylesheet","data":[' + arr.join(',') + ']}';
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return '{"type":"Rule","data":"' + anObject.cssText + '"}';
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return '{"type":"Declaration","data":"' + anObject.cssText + '"}';
    }

    //  other cases should be dealt with by just returning the JSON rep
    return TP.js2json(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('jsonsrc', TP.objectJSONSource);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectKeys',
function(anObject, includeNonenumerables, includePrototypeProps) {

    /**
     * @method objectKeys
     * @alias keys
     * @summary Returns the keys of the object.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need the object's keys.
     * @param {Object} anObject The object to return the keys for.
     * @param {Boolean} [includeNonenumerables=false] Whether or not to include
     *     the supplied object's 'non enumerable' properties.
     * @param {Boolean} [includePrototypeProps=false] Whether or not to include
     *     properties that the supplied object inherits through it's prototype
     *     chain.
     * @returns {Array} The object's keys.
     */

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return [];
    }

    //  Note that we only call 'getKeys' if the object has it *and* neither of
    //  the two flags are set.
    if (TP.canInvoke(anObject, 'getKeys') &&
        !includeNonenumerables &&
        !includePrototypeProps) {
        return anObject.getKeys();
    }

    //  If the caller wants non enumerable and/or prototype properties, we call
    //  on one of the helpers defined on TP.boot
    if (includeNonenumerables && includePrototypeProps) {
        return TP.boot.$simplePropertyRetriever.
                getOwnAndPrototypeEnumerablesAndNonenumerables(anObject);
    } else if (includeNonenumerables) {
        return TP.boot.$simplePropertyRetriever.
                getOwnEnumerablesAndNonenumerables(anObject);
    } else if (includePrototypeProps) {
        return TP.boot.$simplePropertyRetriever.
                getOwnAndPrototypeEnumerables(anObject);
    }

    if (TP.isNode(anObject)) {
        if (TP.isXMLDocument(anObject)) {
            return TP.sys.$documentkeys;
        } else if (TP.isXMLNode(anObject) && TP.isElement(anObject)) {
            return TP.sys.$elementkeys;
        } else {
            return TP.sys.$nodekeys;
        }
    } else if (TP.isWindow(anObject)) {
        //  Webkit doesn't expose Window.prototype, so you can't put a
        //  getKeys() there.
        return TP.sys.$windowkeys;
    } else if (TP.isEvent(anObject)) {
        return TP.eventGetPropertyKeys(anObject);
    }

    return TP.$getOwnKeys(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('keys', TP.objectKeys);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectLocation',
function(anObject) {

    /**
     * @method objectLocation
     * @alias loc
     * @summary Returns the location represented by the receiver. The typical
     *     usage is in methods that might accept either a string or a
     *     TP.uri.URI which need a common way to ask for the location. When the
     *     object is neither a TP.uri.URI instance or a String the return value
     *     is based on the object's source path.
     * @param {String|TP.uri.URI} anObject The true location of the object in
     *     string form.
     * @returns {String} The location in string URI form.
     */

    var url;

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.isString(anObject)) {
        url = anObject;
    } else if (TP.canInvoke(anObject, 'getLocation')) {
        url = anObject.getLocation();
    } else {
        url = TP.objectGetSourcePath(anObject);
    }

    return TP.uriExpandPath(url);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('loc', TP.objectLocation);

//  ------------------------------------------------------------------------

TP.definePrimitive('parse',
function(aType, aString, aLocale) {

    /**
     * @method parse
     * @summary Attempts to produce an instance of aType by parsing the string
     *     provided.
     * @param {TP.FunctionProto|TP.lang.RootObject} aType A specific target type
     *     to produce.
     * @param {String} aString The incoming data to parse.
     * @param {TP.i18n.Locale|String} aLocale A string of the proper xml:lang
     *     format such as en, en:us, de, etc. or a valid TP.i18n.Locale subtype.
     * @returns {Object} An instance of aType if the parse is successful.
     */

    var type,

        result;

    if (!TP.isType(type = TP.sys.getTypeByName(aType))) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (!TP.canInvoke(type, 'parse')) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (!TP.isString(aString)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Date.parse is already defined in ECMAScript to return a Number...
    //  sigh. Make sure to turn it into a Date instance.
    if (type === Date) {
        result = new Date(type.parse(aString, aLocale));
        if (!TP.isDate(result)) {
            result = null;
        }
    } else {
        result = type.parse(aString, aLocale);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('process',
function(anObject, aRequest) {

    /**
     * @method process
     * @summary Attempts to process a request using the object as a "service".
     *     If the object can't respond to a process request then its value
     *     (TP.val()) is used as the result of processing.
     * @param {Object} anObject The object to process.
     * @param {TP.sig.Request} aRequest The request to use in the processing
     *     process.
     * @returns {Object} The result of processing the object.
     */

    var obj;

    if (TP.notValid(anObject) || anObject === '') {
        return anObject;
    }

    obj = TP.wrap(anObject);

    if (TP.canInvoke(obj, 'process')) {
        return obj.process(aRequest);
    }

    obj = TP.canInvoke(anObject, 'process') ? anObject : TP.val(anObject);

    if (TP.canInvoke(obj, 'process')) {
        return obj.process(aRequest);
    }

    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('processAndExecuteWith',
function(anObject, aRequest, stdinContent) {

    /**
     * @method processAndExecuteWith
     * @summary Attempts to process and execute a request using the object as a
     *     "service". If the object can't respond to a process request then its
     *     value (TP.val()) is used as the result of processing.
     * @param {Object} anObject The object to process and execute.
     * @param {TP.sig.Request} aRequest The request to use in the processing
     *     process.
     * @param {Object} stdinContent The content to use as 'stdin' when executing
     *     the supplied object.
     * @returns {Object} The result of processing and executing the object.
     */

    var obj;

    if (TP.notValid(anObject) || anObject === '') {
        return anObject;
    }

    obj = TP.wrap(anObject);

    if (TP.canInvoke(obj, 'processAndExecuteWith')) {
        return obj.processAndExecuteWith(aRequest, stdinContent);
    }

    obj = TP.canInvoke(anObject, 'processAndExecuteWith') ?
                anObject :
                TP.val(anObject);

    if (TP.canInvoke(obj, 'processAndExecuteWith')) {
        return obj.processAndExecuteWith(aRequest, stdinContent);
    }

    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectSize',
function(anObject) {

    /**
     * @method objectSize
     * @alias size
     * @summary Returns the best size for the object, or TP.NO_SIZE if the
     *     object doens't appear to have a size.
     * @param {Object} anObject The object to query for size.
     * @returns {Number} The size, or TP.NO_SIZE if no size is found.
     */

    if (TP.notValid(anObject)) {
        return TP.NO_SIZE;
    }

    if (TP.canInvoke(anObject, 'getSize')) {
        return anObject.getSize();
    }

    if (TP.owns(anObject, 'length')) {
        return anObject.length;
    }

    return TP.NO_SIZE;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('size', TP.objectSize);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectSourceValue',
function(anObject) {

    /**
     * @method objectSourceValue
     * @alias src
     * @summary Returns a JavaScript source representation of the object. NOTE
     *     that the TP.src() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need a source rep of the return value.
     * @param {Object} anObject The object to return the representational String
     *     of.
     * @returns {String} The best-possible source rep of the Object.
     */

    var marker;

    if (anObject === null) {
        return 'null';
    } else if (anObject === undefined) {
        return 'undefined';
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        return TP.NO_SOURCE_REP;
    }

    if (TP.isNode(anObject)) {
        if (TP.isDocument(anObject)) {
            return 'TP.doc(' +
                        TP.nodeAsString(anObject).quoted() +
                    ')';
        } else if (TP.isElement(anObject)) {
            return 'TP.elem(' +
                        TP.nodeAsString(anObject).quoted() +
                    ')';
        } else if (TP.isFragment(anObject)) {
            return 'TP.frag(' +
                        TP.nodeAsString(anObject).quoted() +
                    ')';
        } else {
            return 'TP.node(' +
                        TP.nodeAsString(anObject).quoted() +
                    ')';
        }
    }

    //  error objects are a little special, can't always work with them as
    //  instrumented objects so we'll do it manually... and they freak out if
    //  handed to TP.isString().
    if (TP.isError(anObject)) {
        return 'new Error(' + anObject.message.quoted() + ')';
    }

    //  strings are always single-quoted so they'll eval back in easily
    if (TP.isString(anObject)) {
        return anObject.quoted();
    }

    //  number/boolean just return value since it will eval in just fine.
    if (!TP.isMutable(anObject)) {
        return TP.str(anObject);
    }

    //  for a window we'll create a string that would open a new window with
    //  that location and name
    if (TP.isWindow(anObject)) {
        return 'TP.open("' +
                        anObject.document.location +
                        '", "' +
                        anObject.name +
                        '")';
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        return TP.eventAsSource(anObject);
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        return TP.NO_SOURCE_REP;
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        return TP.NO_SOURCE_REP;
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        return TP.NO_SOURCE_REP;
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return TP.NO_SOURCE_REP;
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return TP.NO_SOURCE_REP;
    }

    if (TP.canInvoke(anObject, 'asSource')) {
        marker = '$$recursive_asSource';
        if (TP.owns(anObject, marker)) {
            return TP.recursion(anObject, marker);
        }

        try {
            this[marker] = true;
            return anObject.asSource();
        } finally {
            delete anObject[marker];
        }
    }

    if (TP.canInvoke(anObject, 'toString')) {
        return TP.js2json(anObject);
    }

    //  if all else fails we'll return the string value
    return TP.NO_SOURCE_REP;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('src', TP.objectSourceValue);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectStringValue',
function(anObject, verbose) {

    /**
     * @method objectStringValue
     * @alias str
     * @summary Returns a best-possible string representation of the object.
     *     NOTE that the TP.str() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need a string rep of the return value. This method will
     *     attempt to get the best possible string by using asString and then
     *     degrading to calling TP.objectToString.
     * @param {Object} anObject The object to return the representational String
     *     of.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the object's String representation. Some objects have a more
     *     'verbose' version (like Nodes, which will print their entire
     *     contents). This is true by default.
     * @returns {String} The best-possible string rep of the Object.
     */

    var str,
        wantsVerbose,
        marker,
        arr,
        len,
        i,

        rules;

    if (anObject === null) {
        return 'null';
    } else if (anObject === undefined) {
        return 'undefined';
    }

    wantsVerbose = TP.ifInvalid(verbose, true);

    if (TP.canInvoke(anObject, 'asString')) {
        try {
            str = anObject.asString(wantsVerbose);

            //  If it reports as '[native code]' and is also a native type, then
            //  extract it's name.
            if (TP.regex.NATIVE_CODE.test(str) && TP.isNativeType(anObject)) {
                str = TP.tname(anObject);
            }

            return str;
        } catch (e) {
            void 0;
        }
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        if (wantsVerbose) {
            return TP.tname(anObject) + ' :: ' +
                    anObject.status + ' : ' + anObject.responseText;
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        if (wantsVerbose) {
            return TP.nodeAsString(anObject);
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        if (wantsVerbose) {
            return TP.tname(anObject) + ' :: ' + TP.errorAsString(anObject);
        } else {
            return TP.objectToString(anObject);
        }
    }

    if (TP.isString(anObject)) {
        return anObject;
    }

    if (!TP.isMutable(anObject)) {
        //  TODO:   does this really deal with all the special constants
        //  like NaN, Number.POSITIVE_INFINITY, etc.?
        return TP.objectToString(anObject);
    }

    //  The top-level Window has TIBET loaded into it, so it will respond to
    //  'asString' properly, but other iframes, etc. won't so we have to handle
    //  Windows in a special manner here.
    if (TP.isWindow(anObject)) {
        if (wantsVerbose) {
            return TP.windowAsString(anObject);
        } else {
            return TP.gid(anObject);
        }
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        if (wantsVerbose) {
            return TP.tname(anObject) + ' :: ' + TP.eventAsString(anObject);
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        if (wantsVerbose) {

            arr = TP.ac();

            len = anObject.length;
            for (i = 0; i < len; i++) {
                arr.push(TP.str(anObject[i]));
            }

            return TP.tname(anObject) + ' :: ' + '[' + arr.join(', ') + ']';
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        if (wantsVerbose) {

            arr = TP.ac();

            len = anObject.length;
            for (i = 0; i < len; i++) {
                arr.push(TP.name(anObject.item(i)) + ': ' +
                             TP.val(anObject.item(i)));
            }

            return TP.tname(anObject) + ' :: ' + '{' + arr.join(', ') + '}';
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        if (wantsVerbose) {
            rules = TP.styleSheetGetStyleRules(anObject, false);

            arr = TP.ac();

            len = rules.length;
            for (i = 0; i < len; i++) {
                arr.push(rules[i].cssText);
            }
            return TP.tname(anObject) + ' :: ' + arr.join(' ');
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        if (wantsVerbose) {
            return TP.tname(anObject) + ' :: ' + anObject.cssText;
        } else {
            return TP.objectToString(anObject);
        }
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        if (wantsVerbose) {
            return TP.tname(anObject) + ' :: ' + anObject.cssText;
        } else {
            return TP.objectToString(anObject);
        }
    }

    if (TP.canInvoke(anObject, 'asString')) {
        str = anObject.asString(wantsVerbose);
        //  If it reports as '[native code]' and is also a native type, then
        //  extract it's name.
        if (TP.regex.NATIVE_CODE.test(str) && TP.isNativeType(anObject)) {
            str = TP.tname(anObject);
        }

        return str;
    }

    marker = '$$recursive_asString';
    if (TP.owns(anObject, marker)) {
        return TP.recursion(anObject, marker);
    }

    try {
        this[marker] = true;
        return TP.META_INST_OWNER.meta_methods.asString.call(anObject);
    } finally {
        delete anObject[marker];
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('str', TP.objectStringValue);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectValue',
function(anObject, anAspect, autoCollapse) {

    /**
     * @method objectValue
     * @alias val
     * @summary Returns anObject's value for anAspect, where the aspect
     *     defaults to 'value'. This method will attempt to use various TIBET
     *     methods such as get(), at(), etc. to get the best result. NOTE that
     *     the TP.val() function is aliased to this function as a 'shorthand'.
     * @param {Object} anObject The object to interrogate.
     * @param {String|Function} anAspect The aspect whose value to get. Default
     *     is 'value'. If a Function is supplied here it will be called with the
     *     initial value and is expected to return the extracted value.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @returns {Object} The object's value, as defined by that object's
     *     semantics.
     */

    var aspect,
        val,
        i,
        len,
        parts,
        part,
        obj;

    if (anObject === null) {
        return null;
    } else if (anObject === undefined) {
        return undefined;
    }

    //  The value of a Type is the Type (native or TIBET-made)
    if (TP.isType(anObject)) {
        return anObject;
    }

    if (TP.isNaN(anObject)) {
        return NaN;
    }

    if (TP.isCallable(anAspect)) {
        return anAspect(anObject);
    }

    if (TP.isEmpty(anAspect)) {
        if (TP.isString(anObject)) {
            //  force to primitive string
            return '' + anObject;
        }

        //  non-mutables can't do much here, their value is their ID
        if (!TP.isMutable(anObject)) {
            return anObject;
        }

        aspect = 'value';
    } else if (TP.isPlainObject(anObject)) {
        //  Really only one approach in this case...
        if (anAspect.indexOf('.') !== TP.NOT_FOUND) {

            parts = anAspect.split('.');
            obj = anObject;

            len = parts.getSize();
            for (i = 0; i < len; i++) {
                part = parts.at(i);
                obj = obj[part];
                if (TP.notValid(obj)) {
                    return;
                }
            }
            return obj;
        } else if (anAspect === 'value') {
            return anObject;
        } else {
            return anObject[anAspect];
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(anAspect)) {
        aspect = TP.apc(anAspect);
    } else {
        aspect = anAspect;
    }

    val = null;

    //  if the aspect is a URI (but only if it's an absolute URI with a scheme),
    //  try to get the value of the URI's resource's result.
    if (TP.isURIString(anAspect) &&
        TP.regex.HAS_SCHEME.test(TP.str(anAspect))) {
        //  NB: We assume 'async' of false here.
        val = TP.val(TP.uc(anAspect).getResource(
                                        TP.hc('async', false)).get('result'));
    }

    //  some native objects may not have been TIBET-enabled, so for those
    //  we try to get a wrapper and ask it
    if (TP.isNode(anObject)) {
        val = TP.tpnode(anObject).get(aspect);
    }

    if (TP.isWindow(anObject)) {
        if (aspect === 'value') {
            return anObject;
        }

        val = TP.tpwin(anObject).get(aspect);
    }

    if (TP.notValid(val) && TP.canInvoke(anObject, 'get')) {
        val = anObject.get(aspect);
    }

    if (TP.notValid(val)) {
        try {
            //  probably not something we can query at this stage, but we can
            //  try slot access just in case
            val = anObject[aspect];
        } catch (e) {
            //  did our best - don't report though
            //  empty
        }
    }

    if (TP.isValid(val)) {
        if (TP.isArray(val)) {
            //  Make sure that if autoCollapse is turned on that we either
            //  return the only item if there is only one or null if the Array
            //  is empty, to be consistent with 'collapse' usage elsewhere in
            //  TIBET.
            if (TP.isTrue(autoCollapse)) {
                if (val.getSize() === 1) {
                    return val.at(0);
                } else if (TP.isEmpty(val)) {
                    return null;
                }
            }
        }

        return val;
    }

    //  there was no computed value and an object's value defaults to itself,
    //  unless a specific aspect was provided as a query
    if (aspect === 'value') {
        return anObject;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('val', TP.objectValue);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectXHTMLNode',
function(anObject, aDocument) {

    /**
     * @method objectXHTMLNode
     * @alias xhtmlnode
     * @summary Returns an XHTML node representation of the supplied object.
     *     NOTE that the TP.xhtmlnode() function is aliased to this function as
     *     a 'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need an XHTML-compatible node.
     * @param {Object} anObject The object to format as XHTML.
     * @param {XMLDocument} aDocument The document which should own the result
     *     node. Defaults to the XML document TP.XML_FACTORY_DOCUMENT.
     * @returns {Node} The best-possible XHTML node for the Object.
     */

    var doc;

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    //  If it's a String, then we return the value of 'TP.node()' and we specify
    //  that the default namespace for any non-prefixed elements that don't
    //  already have their own default namespace should be the XHTML namespace.
    if (TP.isString(anObject)) {
        return TP.node(anObject, TP.w3.Xmlns.XHTML);
    }

    //  If its already an XML node, we just return it.
    if (TP.isXMLNode(anObject)) {
        return anObject;
    }

    doc = TP.isXMLDocument(aDocument) ? aDocument :
                                    TP.XML_FACTORY_DOCUMENT;

    //  HTML nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isHTMLNode(anObject)) {
        return TP.htmlNodeAsXHTMLNode(anObject, doc);
    }

    //  we're usually calling this with a standard object so we can
    //  leverage TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asXHTMLNode')) {
        return anObject.asXHTMLNode(doc);
    }

    return doc.createTextNode(TP.str(anObject));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xhtmlnode', TP.objectXHTMLNode);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectXHTMLString',
function(anObject) {

    /**
     * @method objectXHTMLString
     * @alias xhtmlstr
     * @summary Returns an XHTML string representation of the supplied object.
     *     NOTE that the TP.xhtmlstr() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need an XHTML-compatible string. For objects which can't
     *     provide their own asXHTMLString implementations this method typically
     *     returns the objectStringValue.
     * @param {Object} anObject The object to format as XHTML.
     * @returns {String} The best-possible XHTML rep of the Object.
     */

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    //  If its already an XML node, we just return it.
    if (TP.isXMLNode(anObject)) {
        return TP.nodeAsString(anObject);
    }

    //  HTML nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isHTMLNode(anObject)) {
        return TP.htmlNodeAsXHTMLString(anObject);
    }

    //  we're usually calling this with a standard object so we can
    //  leverage TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asXHTMLString')) {
        return anObject.asXHTMLString();
    }

    //  other cases should be dealt with by just returning the string rep
    return TP.str(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xhtmlstr', TP.objectXHTMLString);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectXMLNode',
function(anObject, aDocument) {

    /**
     * @method objectXMLNode
     * @alias xmlnode
     * @summary Returns an XML node representation of the supplied object.
     *     NOTE that the TP.xmlnode() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need an XML-compatible node.
     * @param {Object} anObject The object to format as XML.
     * @param {XMLDocument} aDocument The document which should own the result
     *     node. Defaults to the XML document TP.XML_FACTORY_DOCUMENT.
     * @returns {Node} The best-possible XML node for the Object.
     */

    var doc;

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    //  If it's a String, then we return the value of 'TP.node()'
    if (TP.isString(anObject)) {
        return TP.node(anObject);
    }

    doc = TP.isXMLDocument(aDocument) ? aDocument :
                                    TP.XML_FACTORY_DOCUMENT;

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return TP.nodeAsXMLNode(anObject, doc);
    }

    //  we're usually calling this with a standard object so we can
    //  leverage TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asXMLNode')) {
        return anObject.asXMLNode(doc);
    }

    return doc.createTextNode(TP.str(anObject));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlnode', TP.objectXMLNode);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectXMLString',
function(anObject) {

    /**
     * @method objectXMLString
     * @alias xmlstr
     * @summary Returns an XML string representation of the supplied object.
     *     NOTE that the TP.xmlstr() function is aliased to this function as a
     *     'shorthand'.
     * @description This function is used to avoid type checking an object or
     *     duplicating test code when you're not sure of the return type of some
     *     function but need an XML-compatible string. For objects which can't
     *     provide their own asXHTMLString implementations this method typically
     *     returns the objectStringValue.
     * @param {Object} anObject The object to format as XML.
     * @returns {String} The best-possible XML rep of the Object.
     */

    var arr,
        len,
        i,

        rules;

    if (anObject === null) {
        return 'null';
    } else if (anObject === undefined) {
        return 'undefined';
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        return '<xhr>' +
                '<status>' + anObject.status + '</status>' +
                '<content>' + TP.xmlstr(anObject.responseText) + '</content>' +
                '</xhr>';
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return TP.nodeAsXMLString(anObject);
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        return '<error>' +
                '<type>' + TP.tname(anObject) + '</type>' +
                '<message>' + TP.str(anObject.message) + '</message>' +
                '</error>';
    }

    if (TP.isString(anObject)) {
        return anObject;
    }

    //  Since Number is a non-mutable, we must do this before the next check
    if (TP.isNumber(anObject)) {
        return anObject.asXMLString();
    }

    if (!TP.isMutable(anObject)) {
        //  TODO:   does this really deal with all the special constants
        //  like NaN, Number.POSITIVE_INFINITY, etc.?
        return TP.objectToString(anObject);
    }

    //  The top-level Window has TIBET loaded into it, so it will respond to
    //  'asString' properly, but other iframes, etc. won't so we have to handle
    //  Windows in a special manner here, which is the same as the
    //  'asXMLString()'
    if (TP.isWindow(anObject)) {
        return TP.windowAsXMLString(anObject);
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        return TP.eventAsXMLString(anObject);
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push('<node index="', i, '">',
                        TP.xmlstr(anObject[i]),
                        '</node>');
        }

        return arr.join('');
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push('<', TP.name(anObject.item(i)), '>',
                         TP.val(anObject.item(i)),
                        '</', TP.name(anObject.item(i)), '>');
        }

        return arr.join('');
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.xmlstr(rules[i]));
        }

        return '<sheet>' + arr.join(' ') + '</sheet>';
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return '<rule>' + anObject.cssText + '</rule>';
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return '<declaration>' + anObject.cssText + '</declaration>';
    }

    //  we're usually calling this with a standard object so we can leverage
    //  TIBET's method APIs to do a best-fit job
    if (TP.canInvoke(anObject, 'asXMLString')) {
        return anObject.asXMLString();
    }

    //  other cases should be dealt with by just returning the string rep (after
    //  doing literal-to-entity replacement)
    return TP.xmlLiteralsToEntities(
            TP.htmlEntitiesToXMLEntities(
            TP.str(anObject)));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlstr', TP.objectXMLString);

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAsHTMLString',
function(windowObj) {

    /**
     * @method windowAsHTMLString
     * @summary Returns an HTML String representation of the supplied Window
     *     object.
     * @param {Window} windowObj The window object to produce the HTML String
     *     representation of.
     * @returns {String} An HTML String representation of the supplied Window
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    arr.push('<span class="DOMWindow" gid="', TP.gid(windowObj), '">');

    for (i = 0; i < len; i++) {
        try {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(windowObj[keys[i]]), '</span>');
        } catch (e) {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '</span>');
        }
    }

    arr.push('</span>');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAsJSONSource',
function(windowObj) {

    /**
     * @method windowAsJSONSource
     * @summary Returns a JSON String representation of the supplied Window
     *     object.
     * @param {Window} windowObj The window object to produce the JSON String
     *     representation of.
     * @returns {String} An JSON String representation of the supplied Window
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    arr.push('{"type":"DOMWindow","data":{');

    arr.push('"gid":', TP.gid(windowObj).quoted('"'));

    arr.push(',');

    for (i = 0; i < len; i++) {
        try {
            arr.push(keys[i].quoted('"'), ':', TP.jsonsrc(windowObj[keys[i]]));
        } catch (e) {
            arr.push(keys[i].quoted('"'), ':"undefined"');
        } finally {
            arr.push(',');
        }
    }

    //  Pop off the trailing comma
    arr.pop();

    arr.push('}}');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAsPrettyString',
function(windowObj) {

    /**
     * @method windowAsPrettyString
     * @summary Returns a 'pretty print' representation of the supplied Window
     *     object.
     * @param {Window} windowObj The window object to produce the pretty print
     *     representation of.
     * @returns {String} A pretty print representation of the supplied Window
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    arr.push('<dl class="pretty ', TP.escapeTypeName(TP.tname(windowObj)), '">',
                '<dt>Type name</dt>',
                '<dd class="pretty typename">', TP.tname(windowObj), '</dd>');

    arr.push('<dt class="pretty key">Global ID</dt>',
                '<dd>', TP.gid(windowObj), '</dd>');

    for (i = 0; i < len; i++) {
        try {
            arr.push('<dt class="pretty key">', keys[i], '</dt>',
                        '<dd>', TP.pretty(windowObj[keys[i]]), '</dd>');
        } catch (e) {
            arr.push('<dt class="pretty key">', keys[i], '</dt>',
                        '<dd>', TP.pretty(undefined), '</dd>');
        }
    }

    arr.push('</dl>');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAsString',
function(windowObj) {

    /**
     * @method windowAsString
     * @summary Returns a String representation of the supplied Window
     *     object.
     * @param {Window} windowObj The window object to produce the String
     *     representation of.
     * @returns {String} A String representation of the supplied Window
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    arr.push(TP.gid(windowObj));

    //  NB: We use '+' concatting here sometimes because of the join on comma
    //  (',') below.
    for (i = 0; i < len; i++) {
        try {
            arr.push(keys[i] + ': ' + TP.str(windowObj[keys[i]]));
        } catch (e) {
            arr.push(keys[i] + ': undefined');
        }
    }

    return arr.join(', ').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAsXMLString',
function(windowObj) {

    /**
     * @method windowAsXMLString
     * @summary Returns an XML String representation of the supplied Window
     *     object.
     * @param {Window} windowObj The window object to produce the XML String
     *     representation of.
     * @returns {String} An XML String representation of the supplied Window
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.sys.$windowkeys;
    len = keys.length;

    arr.push('<window');

    arr.push(' gid="', TP.gid(windowObj), '"');

    for (i = 0; i < len; i++) {
        try {
            arr.push(' ', keys[i], '="', TP.xmlstr(windowObj[keys[i]]), '"');
        } catch (e) {
            arr.push(' ', keys[i], '="undefined"');
        }
    }

    arr.push('/>');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------
//  REFLECTION QUERIES
//  ------------------------------------------------------------------------

TP.definePrimitive('objectType',
function(anObject) {

    /**
     * @method objectType
     * @alias type
     * @summary Returns the type object for the object provided. NOTE that this
     *     is not the same as the value returned by the native typeof keyword,
     *     which is the type name. NOTE that the TP.type() function is aliased
     *     to this function as a 'shorthand'.
     * @description While we prefer polymorphic messaging to type checking it's
     *     sometimes necessary to do the latter. This method gives you a way to
     *     get the Type object responsible for the object provided. If you want
     *     the type name use TP.objectTypeName instead. Note that the value
     *     returned by these functions is based on the TIBET concept for types,
     *     not the native values returned by typeof. For example, TIBET thinks
     *     the type name of a String is "String", not "string". Also note that
     *     this method and the TP.objectTypeName call return a far more detailed
     *     type or type name than "object" for most objects.
     * @param {Object} anObject The object to return the Type for.
     * @returns {Object} The type of the supplied object.
     */

    var typeName,
        type;

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.canInvoke(anObject, 'getType')) {
        return anObject.getType();
    }

    //  If it's not a TIBET-enhanced object we don't have a lot of options left.
    //  It's tempting to just rely on the object's native constructor. The thing
    //  is, in many host environments, an object's 'constructor' slot *cannot*
    //  be counted upon to be the actual 'instance of Function representing the
    //  object's type in the system' (i.e. 'CSSStyleSheet' or whatever). The
    //  'Host' object system, especially in browsers, is *seriously*
    //  underspecified. So here we try to get the object's type name and then
    //  look the object with that name on the global. This gives us a consistent
    //  way to find an object's "type".
    if (TP.notEmpty(typeName = TP.objectTypeName(anObject))) {
        if (TP.isValid(type = TP.global[typeName])) {
            return type;
        }
    }

    //  We're out of ideas... return the '.constructor' and pray...
    return anObject.constructor;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('type', TP.objectType);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectSupertype',
function(anObject) {

    /**
     * @method objectSupertype
     * @alias stype
     * @summary Returns the supertype object for the object provided.
     * @param {Object} anObject The object to return the supertype for.
     * @returns {Object} The supertype of the supplied object.
     */

    var supertype;

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.canInvoke(anObject, 'getSupertype')) {
        return anObject.getSupertype();
    }

    if (TP.isValid(supertype = anObject[TP.SUPER])) {
        return supertype;
    }

    //  We're out of ideas... return null
    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stype', TP.objectSupertype);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectTypeName',
function(anObject) {

    /**
     * @method objectTypeName
     * @alias tname
     * @summary Returns the type name for the object provided. NOTE that this
     *     is not the same as the value returned by the native typeof keyword,
     *     which is often inadequately detailed and/or simply wrong. NOTE that
     *     the TP.tname() function is aliased to this function as a 'shorthand'.
     * @description While we prefer polymorphic messaging to type checking it's
     *     sometimes necessary to do the latter. This method gives you a way to
     *     get the Type name of the object provided. If you want the type object
     *     use TP.objectType instead. Note that the value returned by these
     *     functions is based on the TIBET concept of types, not the native
     *     values returned by typeof.
     * @param {Object} anObject The object to return the Type name for.
     * @returns {String} The object's type name.
     */

    var type,
        str,
        name;

    if (TP.notDefined(anObject)) {
        return 'Undefined';
    }

    if (TP.isNull(anObject)) {
        return 'Null';
    }

    if (TP.isNativeType(anObject)) {
        return 'Function';
    }

    //  First see if it responds to 'getTypeName()' - polymorphically, this is
    //  the best approach
    if (TP.canInvoke(anObject, 'getTypeName')) {
        return anObject.getTypeName();
    }

    //  Then check to see if it's constructor can respond to 'getName()'
    type = anObject.constructor;

    //  Some objects lie - they will report their constructor as Object, but
    //  they're really something else
    if (type === Object) {
        if (TP.isNamedNodeMap(anObject)) {
            return 'NamedNodeMap';
        }
    }

    if (TP.canInvoke(type, 'getName')) {
        return type.getName();
    }

    //  Then see if calling 'TP.objectToString()' on it will result in the
    //  native '[object ...]' representation yielding something useful
    if (TP.notEmpty(str = TP.objectToString(anObject)) &&
            TP.regex.NATIVE_TYPENAME_MATCH.test(str)) {
        if (TP.notEmpty(name = str.match(TP.regex.NATIVE_TYPENAME_EXTRACT))) {
            return name[1];
        }
    }

    return typeof type;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('tname', TP.objectTypeName);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectSupertypes',
function(anObject) {

    /**
     * @method objectSupertypes
     * @alias stypes
     * @summary Returns an Array of 'supertype' for the object provided.
     *     NOTE that the TP.stnames() function is aliased to this function as a
     *     'shorthand'.
     * @description While we prefer polymorphic messaging to type checking it's
     *     sometimes necessary to do the latter. This method gives you a way to
     *     get the list of supertypes of the object provided. Note that the
     *     values returned by these functions is based on the TIBET concept of
     *     types, not the native values returned by typeof.
     * @param {Object} anObject The object to return the list of supertypes for.
     * @returns {Array} A list of the object's supertypes.
     */

    var type,
        obj,
        supers;

    if (TP.notDefined(anObject) || TP.isNull(anObject)) {
        return TP.ac();
    }

    //  Types

    //  Non-Function host objects
    if (TP.isNonFunctionConstructor(anObject)) {
        //  These guys are shallow
        return TP.ac(Object);
    }

    //  Function-based host objects
    if (TP.isNativeType(anObject)) {
        if (anObject === Function) {
            return TP.ac(Object);
        }

        //  If the object has a 'TP.ANCESTORS' property, that means it's been
        //  instrumented by us for consistency. Return the value of that.
        if (TP.isValid(supers = anObject[TP.ANCESTORS])) {
            return supers;
        }

        //  Walk the 'getPrototypeOf()' proto chain until it's null, gathering
        //  names along the way. Since these are already constructors, we don't
        //  need to get their constructor like we do below.
        obj = anObject;
        supers = TP.ac();

        while (TP.isValid(obj = Object.getPrototypeOf(obj))) {
            if (obj === TP.FunctionProto) {
                //  NB: If the object is TP.FunctionProto, we do not push
                //  'Function' (or anything else) onto the results. We're not
                //  interested in knowing that things end up on Function in the
                //  prototype chain
                continue;
            }

            if (obj === TP.ObjectProto) {
                supers.push(Object);
            } else {
                supers.push(obj);
            }
        }

        return supers;
    }

    //  Have to put this test *after* the isNativeType() test so that we know
    //  we're talking to a TIBET type.
    if (TP.isType(anObject)) {
        return anObject.getSupertypes();
    }

    //  Instances

    type = TP.type(anObject);

    //  Non-Function host objects
    if (TP.isNonFunctionConstructor(type)) {
        //  These guys are shallow
        return TP.ac(Object);
    }

    //  Function-based host objects
    if (TP.isNativeType(type)) {

        //  If the type has a 'TP.ANCESTORS' property, that means it's been
        //  instrumented by us for consistency. Return the value of that.
        if (TP.isValid(supers = type[TP.ANCESTORS])) {
            return supers;
        }

        //  Grab the list of supertypes from the type and slice off the last
        //  two (which slice off any 'Function' or 'Object' references).
        supers = TP.stypes(type);
        supers = supers.slice(0, supers.getSize() - 2);

        //  If the type isn't 'Object' itself (in which case there will already
        //  be an entry for 'Object'), then push Object onto the end.
        if (type !== Object) {
            supers.push(Object);
        }

        return supers;
    }

    //  Instances of TIBET types and instances should respond to
    //  'getSupertypes()' - polymorphically, this is the best approach
    if (TP.canInvoke(anObject, 'getSupertypes')) {
        return anObject.getSupertypes();
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stypes', TP.objectSupertypes);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectSupertypeNames',
function(anObject) {

    /**
     * @method objectSupertypeNames
     * @alias stnames
     * @summary Returns an Array of 'supertype' names for the object provided.
     *     NOTE that the TP.stnames() function is aliased to this function as a
     *     'shorthand'.
     * @description While we prefer polymorphic messaging to type checking it's
     *     sometimes necessary to do the latter. This method gives you a way to
     *     get the list of supertype names of the object provided. Note that the
     *     values returned by these functions is based on the TIBET concept of
     *     types, not the native values returned by typeof.
     * @param {Object} anObject The object to return the list of supertype names
     *     for.
     * @returns {Array} A list of the object's supertype names.
     */

    var stypes;

    stypes = TP.stypes(anObject);

    //  Make sure to run a map() to create a new Array, since we might be
    //  touching a cached Array of TP.ANCESTORS.
    return stypes.map(
            function(aType) {
                return TP.name(aType);
            });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stnames', TP.objectSupertypeNames);

//  ------------------------------------------------------------------------
//  SETTERS
//  ------------------------------------------------------------------------

TP.definePrimitive('objectSetValue',
function(anObject, anAspect, aValue) {

    /**
     * @method objectSetValue
     * @alias setval
     * @summary Sets the value for anAspect using set(), atPut(), or a direct
     *     slot access in that order.
     * @param {Object} anObject The object to update.
     * @param {String} anAspect The aspect whose value to alter. Default is
     *     'value'.
     * @param {Object} aValue The new value to set.
     * @returns {Object} The original object, OR a wrapper if that object was
     *     capable of being wrapped in a more powerful TIBET type. The return
     *     value is effectively the object whose set(), atPut(), or slot was
     *     accessed.
     */

    var obj,
        aspect,
        old;

    if (TP.notValid(anObject)) {
        return;
    }

    //  We don't set the value of a Type (native or TIBET-made) this way.
    if (TP.isType(anObject)) {
        return;
    }

    //  Can't set the value of NaN
    if (TP.isNaN(anObject)) {
        return;
    }

    if (!TP.isMutable(anObject)) {
        return;
    }

    if (TP.isEmpty(anAspect)) {
        aspect = 'value';
    } else if (TP.regex.NON_SIMPLE_PATH.test(anAspect)) {
        aspect = TP.apc(anAspect);
    } else {
        aspect = anAspect;
    }

    //  wrapping gets us the best possible handler for set() operations
    obj = TP.wrap(anObject);

    if (TP.canInvoke(obj, 'set')) {
        return obj.set(aspect, aValue);
    }

    if (TP.canInvoke(obj, 'atPut')) {
        return obj.atPut(aspect, aValue);
    }

    //  not everybody likes to set every property :)
    try {
        old = obj[aspect];
        if (old === aValue) {
            return obj;
        }

        obj[aspect] = aValue;
        if (obj[aspect] === aValue) {
            TP.signal(obj, aspect + 'Change');
        }
    } catch (e) {
        //  probably didn't work...but just in case
        if (obj[aspect] === aValue) {
            TP.signal(obj, aspect + 'Change');
        }
    }

    return obj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setval', TP.objectSetValue);

//  ------------------------------------------------------------------------
//  VALIDATION
//  ------------------------------------------------------------------------

TP.definePrimitive('validate',
function(anObject, aType) {

    /**
     * @method validate
     * @summary Validates anObject with respect to the constraints defined by
     *     aType. This method will attempt to use the object's isa() method if
     *     possible and, failing that, will try to use the type's validate()
     *     method. When no means can be found to be sure that the validation
     *     passes this method returns false.
     * @param {Object} anObject The object to validate.
     * @param {String|Type} aType A Type or type name.
     * @param {TP.lang.RootObject|String} aType The type object or type name
     *     String to use for validation.
     */

    var type;

    //  not much to check, but we won't call this failure
    if (!TP.isType(aType)) {
        return true;
    }

    //  objects can sometimes spoof type membership, and we allow that here
    //  by offering the right to answer to the object first
    if (TP.canInvoke(anObject, 'isa')) {
        if (!anObject.isa(aType)) {
            return false;
        }
    }

    //  apparently not a viable TIBET-enhanced object, perhaps the type can
    //  make a decision "from the outside"
    if (TP.isType(type = TP.sys.getTypeByName(aType))) {
        if (TP.canInvoke(type, 'validate')) {
            return type.validate(anObject);
        }
    }

    //  NOTE the default here...if we can't prove it's valid we assume it
    //  isn't
    return false;
});

//  ------------------------------------------------------------------------
//  WRAP/UNWRAP
//  ------------------------------------------------------------------------

/*
TP.dom.Node vs. Node, TP.core.Window vs. Window, etc.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('objectUnwrap',
function(anObject) {

    /**
     * @method objectUnwrap
     * @alias unwrap
     * @summary Returns the native object equivalent (or content) of the
     *     receiver. This is a way of "unboxing" TIBET wrappers in a consistent
     *     fashion regardless of their type. NOTE that the TP.unwrap() function
     *     is aliased to this function as a 'shorthand'.
     * @param {Object} anObject The object to interrogate.
     * @example Obtain the native Window for a TP.core.Window:
     *     <code>
     *          tpWin = TP.tpwin(top);
     *          TP.unwrap(tpWin) === top;
     *          <samp>true</samp>
     *     </code>
     * @example Obtain the native Document for a TP.dom.DocumentNode:
     *     <code>
     *          tpDoc = TP.tpnode(top.document);
     *          TP.unwrap(tpDoc) === top.document;
     *          <samp>true</samp>
     *     </code>
     * @example Obtain the native Node for a TP.dom.Node:
     *     <code>
     *          tpNode = TP.tpnode(TP.documentGetBody(top.document));
     *          TP.unwrap(tpNode) === TP.documentGetBody(top.document);
     *          <samp>true</samp>
     *     </code>
     * @returns {Object} A native object.
     */

    var newObj,

        len,
        i,

        keys;

    //  Note that a *lot* of things in the system use wrap and unwrap, so the
    //  potential for endless recursions is high. Therefore, we need to use 'low
    //  level' primitives to do processing here.

    //  fail on null/undefined content...although it would have been fun to
    //  return a TP.lang.Null or TP.lang.Undefined wouldn't it ;)
    if (TP.notDefined(anObject)) {
        return undefined;
    }

    if (TP.isNull(anObject)) {
        return null;
    }

    //  The wrapped value of a Type is the Type (native or TIBET-made)
    if (TP.isType(anObject)) {
        return anObject;
    }

    if (TP.isNodeList(anObject) || TP.isNamedNodeMap(anObject)) {
        return anObject;
    }

    //  TP.dom.Nodes, TP.sig.HTTPResponse, TP.sig.DOMUISignal, TP.core.Window,
    //  TP.uri.URI, etc.
    if (TP.canInvoke(anObject, 'getNativeObject')) {
        return anObject.getNativeObject();
    }

    //  unwrapping a list of items is a really powerful option so we can
    //  manipulate the list using more intelligence
    if (TP.isArray(anObject)) {
        newObj = TP.ac();
        len = anObject.length;
        for (i = 0; i < len; i++) {
            newObj.push(TP.unwrap(anObject.at(i)));
        }

        return newObj;
    }

    if (TP.isHash(anObject)) {
        keys = TP.keys(anObject);

        newObj = TP.hc();
        len = keys.length;
        for (i = 0; i < len; i++) {
            newObj.atPut(keys.at(i), TP.unwrap(anObject.at(keys.at(i))));
        }

        return newObj;
    }

    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('unwrap', TP.objectUnwrap);

//  ------------------------------------------------------------------------

TP.definePrimitive('objectWrap',
function(anObject) {

    /**
     * @method objectWrap
     * @alias wrap
     * @summary Wraps the object in a suitable TIBET encapsulation type. Most
     *     objects don't require this and simply pass through, however Node and
     *     Window instances will be wrapped in TP.dom.Node or TP.core.Window
     *     wrappers as appropriate. NOTE that passing an array or, more
     *     interestingly, a NodeList to this method will result in the contents
     *     of the list being wrapped. This is an easy way to get a set of native
     *     nodes wrapped into an array of TP.dom.Node objects for further
     *     processing.
     * @param {Object} anObject The object wrapper, or the object if no wrapper
     *     type is suitable.
     * @returns {String} A string "name".
     */

    var newObj,
        len,
        i,

        keys,

        sigTypeName,
        sigType;

    //  Note that a *lot* of things in the system use wrap and unwrap, so the
    //  potential for endless recursions is high. Therefore, we need to use 'low
    //  level' primitives to do processing here.

    //  fail on null/undefined content...although it would have been fun to
    //  return a TP.lang.Null or TP.lang.Undefined wouldn't it ;)
    if (TP.notDefined(anObject)) {
        return undefined;
    }

    if (TP.isNull(anObject)) {
        return null;
    }

    //  The wrapped value of a Type is the Type (native or TIBET-made)
    if (TP.isType(anObject) || TP.isNamespace(anObject)) {
        return anObject;
    }

    //  90% case or better is that we're trying to wrap an element node from
    //  the UI
    if (TP.isElement(anObject)) {
        if (TP.isValid(anObject[TP.WRAPPER])) {
            //  Make sure the wrapper has this node as its native node.
            anObject[TP.WRAPPER].$set('node', anObject, false);
            return anObject[TP.WRAPPER];
        }
        return TP.dom.ElementNode.construct(anObject);
    } else if (TP.isDocument(anObject)) {
        return TP.dom.DocumentNode.construct(anObject);
    } else if (TP.isNode(anObject)) {
        return TP.dom.Node.construct(anObject);
    }

    //  wrapping a list of items is a really powerful option so we can
    //  manipulate the list using more intelligence
    if (TP.isArray(anObject) || TP.isNodeList(anObject)) {
        newObj = TP.ac();
        len = anObject.length;
        for (i = 0; i < len; i++) {
            newObj.push(TP.wrap(anObject[i]));
        }

        return newObj;
    }

    if (TP.isHash(anObject)) {
        keys = TP.keys(anObject);

        newObj = TP.hc();
        len = keys.length;
        for (i = 0; i < len; i++) {
            newObj.atPut(keys.at(i), TP.wrap(anObject.at(keys.at(i))));
        }

        return newObj;
    }

    if (TP.isNamedNodeMap(anObject)) {
        newObj = TP.hc();
        len = anObject.length;
        for (i = 0; i < len; i++) {
            newObj.atPut(anObject.item(i).name, TP.wrap(anObject.item(i)));
        }

        return newObj;
    }

    if (TP.isWindow(anObject)) {
        return TP.tpwin(anObject);
    }

    if (TP.isEvent(anObject)) {
        if (TP.notEmpty(sigTypeName =
                        TP.DOM_SIGNAL_TYPE_MAP.at(TP.eventGetType(anObject)))) {
            if (TP.isType(sigType = sigTypeName.asType())) {
                return sigType.construct(anObject);
            }
        }
    }

    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('wrap', TP.objectWrap);

//  ------------------------------------------------------------------------

TP.definePrimitive('collapse',
function(anObject) {

    /**
     * @method collapse
     * @summary If the supplied object is a Collection, this function
     *     'collapses' it by returning the first item. Otherwise the object
     *     itself is returned.
     * @param {Object} anObject The object to collapse.
     * @returns {Object} The result of collapsing the object.
     */

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.isString(anObject) ||
        TP.isNumber(anObject) ||
        TP.isBoolean(anObject)) {
        return anObject;
    }

    if (TP.isNodeList(anObject) && anObject.length === 1) {
        return anObject[0];
    }

    if (TP.canInvoke(anObject, 'collapse')) {
        return anObject.collapse();
    }

    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('expand',
function(anObject) {

    /**
     * @method expand
     * @summary If the supplied object is an Array, this function returns it.
     *     Otherwise it returns an Array wrapping the object.
     * @param {Object} anObject The object to expand.
     * @returns {Object[]} The result of expanding the object.
     */

    //  no valid source object means no work
    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.isArray(anObject)) {
        return anObject;
    }

    if (TP.canInvoke(anObject, 'expand')) {
        return anObject.expand();
    }

    return TP.ac(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getAccessPathParts',
function(aPath, aScheme) {

    /**
     * @method getAccessPathParts
     * @summary Returns the parts of the supplied path.
     * @param {String} aPath The path to obtain the parts from.
     * @param {String} [aScheme] An optional scheme that indicates the type of
     *     the supplied path. If this is not supplied, the system attempts to
     *     compute the scheme.
     * @returns {Array} An Array of path parts.
     */

    var scheme,

        predicateExprs,
        path,

        results;

    //  Need at least a path to test.
    if (TP.isEmpty(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath',
                        'Unable to get parts of empty path.');
    }

    //  If a schema wasn't supplied, try to compute one.
    scheme = aScheme;
    if (TP.notValid(scheme)) {
        scheme = TP.getPointerScheme(aPath);
    }

    switch (scheme) {

        case 'css':

            //  Split along separators, etc.
            results = aPath.split(TP.regex.CSS_PATH_SPLITTER);

            //  Strip out anything that would be empty or separator characters.
            results = results.filter(
                        function(item, index) {
                            return !TP.regex.CSS_PATH_STRIPPER.test(item);
                        });

            break;

        case 'tibet':
        case 'jpath':

            if (aPath === '.') {
                return TP.ac('.');
            }

            //  Capture all predicate expressions to avoid processing
            //  separators, etc. within predicates.
            predicateExprs = TP.ac();
            path = TP.stringTokenizeUsingDelimiters(
                        aPath,
                        '[',
                        ']',
                        predicateExprs,
                        '__PRED__',
                        '__PRED__');

            //  Split along separators, etc.
            results = path.split(TP.regex.JSON_PATH_SPLITTER);

            //  Iterate over the results, encoding certain values in certain
            //  ways, and putting the captured predicates back into what is now
            //  individual parts of the path.
            results = results.map(
                    function(item) {

                        if (item === '') {
                            return '';
                        }

                        if (item === '..') {
                            return '__DOUBLE_PERIOD__';
                        }

                        if (item.indexOf('__PRED__') !== TP.NOT_FOUND) {

                            return TP.stringUntokenizeUsingDelimiters(
                                    item,
                                    '[',
                                    ']',
                                    predicateExprs,
                                    '__PRED__',
                                    '__PRED__');
                        }

                        return item;
                    });

            //  Strip out anything that would be empty or separator characters.
            results = results.filter(
                        function(item, index) {
                            return !TP.regex.JSON_PATH_STRIPPER.test(item);
                        });

            //  If there were any 'double period' constructs, convert them to an
            //  empty String
            results = results.map(
                    function(item) {

                        if (item === '__DOUBLE_PERIOD__') {
                            return '';
                        }

                        return item;
                    });

            break;

        case 'xpath1':
        case 'xpointer':

            if (aPath === '/') {
                return TP.ac('/');
            }

            //  Capture all predicate expressions to avoid processing
            //  separators, etc. within predicates.
            predicateExprs = TP.ac();
            path = TP.stringTokenizeUsingDelimiters(
                        aPath,
                        '[',
                        ']',
                        predicateExprs,
                        '__PRED__',
                        '__PRED__');

            //  Split along separators, etc.
            results = path.split(TP.regex.XPATH_PATH_SPLITTER);

            //  Iterate over the results, encoding certain values in certain
            //  ways, and putting the captured predicates back into what is now
            //  individual parts of the path.
            results = results.map(
                    function(item) {

                        if (item === '') {
                            return '';
                        }

                        if (item === '//') {
                            return '__DOUBLE_SLASH__';
                        }

                        if (item.indexOf('__PRED__') !== TP.NOT_FOUND) {

                            return TP.stringUntokenizeUsingDelimiters(
                                    item,
                                    '[',
                                    ']',
                                    predicateExprs,
                                    '__PRED__',
                                    '__PRED__');
                        }

                        return item;
                    });

            //  Strip out anything that would be empty or separator characters.
            results = results.filter(
                        function(item, index) {
                            return !TP.regex.XPATH_PATH_STRIPPER.test(item);
                        });

            //  If there were any 'double slash' constructs, convert them to an
            //  empty String
            results = results.map(
                    function(item) {

                        if (item === '__DOUBLE_SLASH__') {
                            return '';
                        }

                        return item;
                    });

            break;

        default:
            break;
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getAccessPathType',
function(aPath) {

    /**
     * @method getAccessPathType
     * @summary Obtains the 'path type' of the supplied path. This allows TIBET
     *     to distinguish between different markup query languages.
     * @param {String} aPath The path to obtain the type of.
     * @returns {String} One of the 'path type' constants:
     *     TP.TIBET_PATH_TYPE
     *     TP.JSON_PATH_TYPE
     *     TP.CSS_PATH_TYPE
     *     TP.XPATH_PATH_TYPE
     *     TP.BARENAME_PATH_TYPE
     *     TP.XPOINTER_PATH_TYPE
     *     TP.ELEMENT_PATH_TYPE
     *     TP.XTENSION_POINTER_PATH_TYPE
     */

    var path;

    //  Need at least a path to test.
    if (TP.isEmpty(path = aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath',
                        'Unable to get type of empty path.');
    }

    //  Note that we only allow numeric ACP expressions in paths
    if (TP.regex.HAS_ACP.test(path)) {

        //  Strip out any numeric expressions and recheck
        TP.regex.ACP_NUMERIC.lastIndex = 0;
        path = path.replace(TP.regex.ACP_NUMERIC, TP.DEFAULT);

        //  If it still has ACP expressions, then it's an invalid path
        if (TP.regex.HAS_ACP.test(path)) {
            return this.raise('TP.sig.InvalidPath');
        }

        //  Now, so as to not change the overall meaning of the path, go back to
        //  the original path and substitute '0's - remember that we're only
        //  doing path type detection here, so we're not changing the meaning of
        //  the path.
        TP.regex.ACP_NUMERIC.lastIndex = 0;
        path = aPath.replace(TP.regex.ACP_NUMERIC, '0');
    }

    //  We try to determine the path type based on discriminating characters
    //  and regular expression forms but since there's a lot of overlap
    //  between the legal characters for both CSS and XPath paths we will
    //  default to CSS path when no clear distinction can be made.

    //  An xpointer barename would indicate an XPath (barenames cannot contain
    //  parentheses), but we cannot evaluate that directly (by itself, '#foo'
    //  isn't a real XPath), so we return TP.BARENAME_PATH_TYPE
    if (TP.regex.BARENAME.test(path)) {
        return TP.BARENAME_PATH_TYPE;
    }

    //  regular xpointer, either xpointer(), xpath1() or element() scheme
    if (TP.regex.XPOINTER.test(path)) {

        //  If we're handed an '#element(...)' pointer, then we know what kind
        //  of path it is (or should be, anyway)

        //  NB: We do *not* check against TP.regex.ELEMENT_PATH here, since it
        //  matches all IDs ("#"), attributes ("@"), etc.
        if (TP.regex.ELEMENT_POINTER.test(path)) {
            return TP.ELEMENT_PATH_TYPE;
        } else {
            return TP.XPATH_PATH_TYPE;
        }
    }

    //  extended xpointer, perhaps explicit css() scheme (TIBET-only)
    if (TP.regex.XTENSION_POINTER.test(path)) {
        return TP.XTENSION_POINTER_PATH_TYPE;
    }

    //  strip any id/fragment prefix
    path = path.charAt(0) === '#' ? path.slice(1) : path;

    //  If the path is just '.', then that's the shortcut to just return a TIBET
    //  path
    if (TP.regex.ONLY_PERIOD.test(aPath)) {
        return TP.TIBET_PATH_TYPE;
    }

    //  XPath is typically ./elem, //elem, @attr, or ./elem[predicate], all
    //  of which are going to include a slash (other than 'standalone' attr
    //  expressions which start with a '@'). These can be completely
    //  disambiguated with CSS.
    //  So check for:
    //      An attribute path (one that starts with '@')
    //  OR
    //      Some form of XPath that starts with a '/', a '.', a name
    //      followed by a '(' or one of the full XPath 'axis' names followed
    //      by a '::'
    //  OR
    //      Some form of XPath that has a '/'
    if (TP.regex.ATTRIBUTE.test(path) ||
        TP.regex.XPATH_PATH.test(path) ||
        TP.regex.HAS_SLASH.test(path)) {
        return TP.XPATH_PATH_TYPE;
    }

    //  A JSON path
    if (TP.regex.JSON_PATH.test(path)) {
        return TP.JSON_PATH_TYPE;
    }

    //  A TIBET path - simple or complex
    if (TP.regex.TIBET_PATH.test(path)) {
        return TP.TIBET_PATH_TYPE;
    }

    //  If there is no 'path punctuation' (only JS identifer characters), or
    //  it's a simple numeric path like '2' or '[2]', that means it's a 'simple
    //  path'.
    //  TODO: This is hacky - figure out how to combine them into one RegExp.
    if (TP.regex.JS_IDENTIFIER.test(path) ||
        TP.regex.ONLY_NUM.test(path) ||
        TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        return TP.TIBET_PATH_TYPE;
    }

    //  So far its not either an XPath or a TIBET Xtension path. So there
    //  are various overlaps between CSS and XPath that we now have to take
    //  into account:
    //
    //      CSS         XPath
    //      ---         -----
    //
    //      span        span
    //      #myElem     #myElem
    //      *           *
    //
    //  Thankfully, these constructs have the exact same meaning in both
    //  selection languages. Therefore, we return a CSS path type since that
    //  call is faster.

    //  Additionally, we're now out of things to check, so we just punt to
    //  this type.
    return TP.CSS_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getPointerScheme',
function(aPath) {

    /**
     * @method getPointerScheme
     * @summary Returns the 'pointer scheme' given a path.
     * @description Depending on the type of path supplied, this method will
     *     return the proper 'scheme' to be used in an XPointer. These are the
     *     current return values:
     *
     *     TP.TIBET_PATH_TYPE               ->      'tibet'
     *     TP.JSON_PATH_TYPE                ->      'jpath'
     *     TP.CSS_PATH_TYPE                 ->      'css'
     *     TP.XPATH_PATH_TYPE               ->      'xpath1'
     *     TP.BARENAME_PATH_TYPE            ->      ''
     *     TP.XPOINTER_PATH_TYPE            ->      'xpointer'
     *     TP.ELEMENT_PATH_TYPE             ->      'element'
     *     TP.XTENSION_POINTER_PATH_TYPE    ->      'css'
     *
     *     Note that if the path consists only of word characters that a value
     *     of 'tibet' will be returned.
     * @param {String} aPath The path to return the scheme of.
     * @returns {String} An XPointer scheme depending on path type.
     */

    var pathType;

    //  Need at least a path to test.
    if (TP.isEmpty(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath',
                        'Unable to get type of empty path.');
    }

    //  The default, if the path only contains word characters, is 'tibet'.
    if (TP.regex.ONLY_WORD.test(aPath)) {
        return 'tibet';
    }

    //  If the path only contains a dollar character, is 'jpath'.
    if (TP.regex.ONLY_DOLLAR.test(aPath)) {
        return 'jpath';
    }

    pathType = TP.getAccessPathType(aPath);

    switch (pathType) {
        case TP.TIBET_PATH_TYPE:
            return 'tibet';
        case TP.JSON_PATH_TYPE:
            return 'jpath';
        case TP.CSS_PATH_TYPE:
            return 'css';
        case TP.XPATH_PATH_TYPE:
            return 'xpath1';
        case TP.BARENAME_PATH_TYPE:
            return '';
        case TP.XPOINTER_PATH_TYPE:
            return 'xpointer';
        case TP.ELEMENT_PATH_TYPE:
            return 'element';
        case TP.XTENSION_POINTER_PATH_TYPE:
            return 'css';
        default:
            return '';
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('joinAccessPathParts',
function(pathParts, aPathType) {

    /**
     * @method joinAccessPathParts
     * @summary Returns the 'pointer scheme' given a path.
     * @description Depending on the type of path supplied, this method will use
     *     the proper 'joining character' to join together the supplied path
     *     parts. These are the various joining character values:
     *
     *     TP.TIBET_PATH_TYPE               ->      '.'
     *     TP.JSON_PATH_TYPE                ->      '.'
     *     TP.CSS_PATH_TYPE                 ->      ' '
     *     TP.XPATH_PATH_TYPE               ->      '/'
     *     TP.XPOINTER_PATH_TYPE            ->      '/'
     *
     * @param {Array} pathParts The path parts to join together.
     * @param {String} aPathType The type of path to join the parts together as.
     * @returns {String} The path obtained by joining the path parts together
     *     using the computed join character.
     */

    var result,

        len,
        i,
        part,

        joinChar;

    //  Need at least one path part.
    if (TP.isEmpty(pathParts)) {
        return TP.raise(this, 'TP.sig.InvalidPath',
                        'Unable to join empty path parts.');
    }

    if (TP.notValid(aPathType)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Initially, the result is the first part.
    result = pathParts.at(0);

    //  Loop over the remaining parts and append them, using a computed joining
    //  character.
    len = pathParts.getSize();
    for (i = 1; i < len; i++) {
        part = pathParts.at(i);

        switch (aPathType) {
            case TP.CSS_PATH_TYPE:
                joinChar = ' ';
                break;

            case TP.TIBET_PATH_TYPE:
            case TP.JSON_PATH_TYPE:
                if (part.charAt(0) === '[') {
                    joinChar = '';
                } else {
                    joinChar = '.';
                }

                break;

            case TP.XPATH_PATH_TYPE:
            case TP.XPOINTER_PATH_TYPE:
                if (part.charAt(0) === '[') {
                    joinChar = '';
                } else {
                    joinChar = '/';
                }

                break;

            default:
                joinChar = '';
        }

        //  Do the concatentation.
        result += joinChar + part;
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('prefixAssignmentStatements',
function(prefixStr, aScriptStr) {

    /**
     * @method prefixAssignmentStatements
     * @summary Prefixes assignment statements ('x = 2') in aScriptStr with the
     *     prefix supplied in prefixStr.
     * @param {String} prefixStr The String to prefix onto assignment statements
     *     within the script String.
     * @param {String} aScriptStr The String to extract and prefix assignment
     *     statements in.
     * @returns {String} The supplied script String with the assignments
     *     prefixed by the supplied prefix.
     */

    TP.regex.JS_ASSIGNMENT.lastIndex = 0;
    return aScriptStr.replace(TP.regex.JS_ASSIGNMENT,
                                '$1' + prefixStr + '$2$3');
});

//  ------------------------------------------------------------------------
//  Signaling
//  ------------------------------------------------------------------------

TP.definePrimitive('contractSignalName',
function(signame) {

    /**
     * @method contractSignalName
     * @summary Produces the 'short form' of the supplied signal name.
     * @description Given a signal name of 'TP.sig.fooSignal', this method will
     *     produce 'fooSignal'.
     * @param {String} signame The signal name.
     * @returns {String} The shortened signal name.
     */

    var parts,
        i,
        newparts;

    if (TP.isEmpty(signame)) {
        return '';
    }

    //  Event sequences (i.e. typically keyboard sequences) will have a
    //  double underscore between each part of the sequence. We need to make
    //  sure to contract each part.
    if (/__/.test(signame)) {
        newparts = TP.ac();
        parts = signame.split('__');

        for (i = 0; i < parts.getSize(); i++) {
            //  Note the recursive call here.
            newparts.push(TP.contractSignalName(parts.at(i)));
        }

        return newparts.join('__');
    }

    //  Note how we only do this if signame starts with 'TP.' - otherwise, we
    //  leave the signal name.
    if (/^TP\.(.+)/.test(signame)) {
        return signame.slice(signame.lastIndexOf('.') + 1);
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('expandSignalName',
function(signame) {

    /**
     * @method expandSignalName
     * @summary Produces the 'long form' of the supplied signal name.
     * @description Given a signal name of 'fooSignal', this method will produce
     *     'TP.sig.fooSignal'. If the signal name already has a period ('.'),
     *     this method will just prepend 'TP.'.
     * @param {String} signame The signal name.
     * @returns {String} The lengthened signal name.
     */

    var parts,
        i,
        newparts,

        type,

        namespaceNames;

    //  NB: This is a very heavily used routine, so we use very primitive
    //  checking in it.

    if (signame === '') {
        return '';
    }

    //  Event sequences (i.e. typically keyboard sequences) will have a
    //  double underscore between each part of the sequence. We need to make
    //  sure to expand each part.
    if (/__/.test(signame)) {
        newparts = TP.ac();
        parts = signame.split('__');

        for (i = 0; i < parts.getSize(); i++) {
            //  Note the recursive call here.
            newparts.push(TP.expandSignalName(parts.at(i)));
        }

        return newparts.join('__');
    }

    if (/^(TP|APP)\.(.+)/.test(signame)) {
        return signame;
    }

    //  See if the system has a type corresponding directly to signame.
    if (TP.isType(type = TP.sys.getTypeByName(signame))) {
        if (TP.canInvoke(type, 'getSignalName')) {
            return type.getSignalName();
        }
    }

    //  Iterate over all of the namespaces in the system and try to see if any
    //  of the namespaces have a type corresponding to signame.
    namespaceNames = TP.sys.getNamespaceNames();
    for (i = 0; i < namespaceNames.getSize(); i++) {
        if (TP.isType(type = TP.sys.getTypeByName(
                        namespaceNames.at(i) + '.' + signame))) {
            if (TP.canInvoke(type, 'getSignalName')) {
                return type.getSignalName();
            }
        }
    }

    //  We have at least one namespace - just prefix it with 'TP.' and exit
    if (/^(.+)\.(.+)/.test(signame)) {
        return 'TP.' + signame;
    }

    //  Couldn't find anything - just put 'TP.sig.' on the front of it.
    return 'TP.sig.' + signame;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('queueSignalFromData',
function(signalData, originElem, triggerSignal, aPayload, aPolicy, signalType) {

    /**
     * @method queueSignalFromData
     * @summary Queues a signal derived from the signal data and the other
     *     associated parameters for firing. Parameters for this call after the
     *     initial signalData value mirror those in the 'queue' call  Each of
     *     the parameters other than signal data act primarily as default values
     *     which are used if the corresponding value is not provided in the
     *     signalData itself.
     * @param {String} signalData The signal data which should either just a
     *     signal name or a origin, signal, payload encoded as a JS-like String
     *     that can be reformatted into JSON.
     * @param {Element} originElem The originating element that will be used as
     *     a target if an alternate target isn't provided as an ID to another
     *     element in the signal data.
     * @param {TP.sig.Signal} [triggerSignal] The signal that triggered this
     *     signal queueing to happen. This will be placed in the firing signal's
     *     payload under the 'trigger' key.
     * @param {Object} aPayload Optional argument object. Note that this is only
     *     used if not specified in the signalData.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired. Defaults to the policy of the signal instance/type.
     * @param {TP.meta.sig.Signal} A signal type that will be used as the 'real'
     *     signal type if the signal name supplied (in some form) in the signal
     *     data is a spoofed signal name.
     */

    var doc,
        sigData,
        sigParams,
        orgid,
        target,
        sigName,
        sigPayload,
        policy,
        delay;

    doc = TP.nodeGetDocument(originElem);

    //  If signal data is a string it can be either a signal name or a
    //  descriptor in pseudo-JSON form. Try to get it into hash form either way.
    if (TP.isString(signalData)) {
        sigData = TP.trim(signalData);

        //  If the signal data starts with a '{', then its not just a signal
        //  name. There's a 'signal descriptor'.
        if (sigData.startsWith('{')) {
            //  What's left is a JS-formatted String. Parse that into a Hash.
            sigParams = TP.json2js(TP.reformatJSToJSON(sigData));
        } else {
            sigParams = TP.hc('signal', sigData, 'target', originElem);
        }
    } else {
        sigParams = signalData;
    }

    if (!TP.canInvoke(sigParams, 'at')) {
        TP.ifError() ?
            TP.error('Invalid signal data for queueing operation.') : 0;
        return;
    }

    //  ---
    //  origin
    //  ---

    //  If an 'origin' slot was supplied, then we look that up by ID (using
    //  the original origin's document).
    if (TP.notEmpty(orgid = sigParams.at('origin'))) {

        //  Just in case it was supplied as a quoted value
        orgid = orgid.unquoted();

        //  Note how we pass false to avoid getting a wrapped origin, which
        //  we don't want here.
        target = TP.byId(orgid, doc, false);
    }

    //  ---
    //  signal
    //  ---

    sigName = sigParams.at('signal');

    //  If a signal was supplied, use it as the signal name instead of the
    //  name of the original DOM signal that was fired.
    if (TP.isEmpty(sigName) && TP.isValid(triggerSignal)) {
        sigName = triggerSignal.getSignalName();
    }

    //  If there is no signal name, warn and exit.
    if (TP.isEmpty(sigName)) {
        TP.ifError() ?
            TP.error('No signal name in signal queueing data.') : 0;
        return;
    }

    //  Just in case it was supplied in the signal params as a quoted value
    sigName = sigName.unquoted();

    //  ---
    //  payload
    //  ---

    //  Payload is whatever we found in signal data followed by anything
    //  provided explicitly followed by an empty hash we can add to.
    sigPayload = sigParams.at('payload');
    sigPayload = TP.ifInvalid(sigPayload, aPayload);
    if (TP.notValid(sigPayload)) {
        sigPayload = TP.hc();
    }

    //  Stash a reference to the original DOM signal in the payload under the
    //  key 'trigger'. This will be useful for things like stopping propagation,
    //  etc.
    sigPayload.atPut('trigger', triggerSignal);

    //  Some objects in the system, in lieu of the trigger, will still use the
    //  TP.dom.Document where the triggering originated. We try to provide that
    //  here, which is especially important if the trigger is undefined.
    sigPayload.atPut('triggerTPDocument', TP.tpdoc(doc));

    //  Note that it's important to put the current target on the signal here in
    //  case that the new signal is a RESPONDER_FIRING signal (very likely) as
    //  it will look there for the first responder when computing the responder
    //  chain.
    target = TP.ifInvalid(target, originElem);
    sigPayload.atPut('target', target);

    //  Queue the new signal and continue - thereby skipping processing for the
    //  bubbling phase of this signal (for this target) in deference to
    //  signaling the new signal. Note here how we supply a signal type as the
    //  default type to use if the mapped signal type isn't a real type.

    //  If a delay was defined and it can be converted into a Number, then set
    //  up a timeout to queue the signal after that delay. Otherwise, queue the
    //  signal immediately.
    delay = sigPayload.at('delay');

    policy = TP.ifInvalid(sigParams.at('policy'), aPolicy);

    if (TP.notEmpty(delay) && TP.isNumber(delay = delay.asNumber())) {
        setTimeout(
            function() {
                TP.queue(target, sigName, sigPayload, policy, signalType);
            }, delay);
    } else {
        TP.queue(target, sigName, sigPayload, policy, signalType);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.$$computedHandlers = new TP.boot.PHash();
TP.$$computedHandlers.$lookups = 0;

//  ------------------------------------------------------------------------

TP.definePrimitive('composeHandlerName',
function(aDescriptor) {

    /**
     * @method composeHandlerName
     * @summary Composes a standard handler name defined by the signal handler
     *     descriptor provided. This method defaults the signal name used for
     *     the descriptor so the parameter is optional.
     * @param {Object} [aDescriptor] The 'descriptor' parameter is a property
     *     descriptor. Properties can be any combination of the following:
     *          {String|Type} signal The type or signal name.
     *          {String|Object} origin The origin.
     *          {String} state The state name.
     *          {String} phase (TP.CAPTURING, TP.AT_TARGET, TP.BUBBLING). The
     *              default is TP.BUBBLING.
     * @returns {String} The handler name defined by the descriptor.
     */

    var descriptor,
        signal,

        signame,

        handler,

        origin,
        state;

    if (TP.isString(aDescriptor)) {
        signal = aDescriptor;
    } else if (TP.isNumber(aDescriptor)) {
        //  Handle 404 for example :)
        signal = '' + aDescriptor;
    } else if (!TP.isPlainObject(aDescriptor)) {
        return this.raise('InvalidDescriptor', aDescriptor);
    } else {
        descriptor = aDescriptor;
        signal = aDescriptor.signal;
    }

    if (!descriptor) {
        handler = TP.$$computedHandlers.at(signal);
        if (handler) {
            TP.$$computedHandlers.$lookups += 1;
            return handler;
        }
    }

    //  Signal types, signal instances, and Strings all respond to this.
    if (signal === TP.ANY) {
        //  Default is 'handleSignal', not handleANY.
        signame = 'Signal';
    } else if (TP.canInvoke(signal, 'getSignalName')) {
        signame = signal.getSignalName();
    } else {
        //  Default is 'handleSignal', not handleANY.
        signame = 'Signal';
    }

    //  Simplify for internal signals. 'APP.sig.' prefixing (or signal types
    //  from another namespace) has to remain in place and this method ensures
    //  that.
    signame = TP.contractSignalName(signame);

    //  Regardless of how it got here, don't let signame carry anything that
    //  isn't a valid JS identifier character as part of the handler name.
    if (TP.isNumber(aDescriptor) || TP.notNaN(parseInt(aDescriptor, 10))) {
        handler = 'handle' + signame;
    } else {
        handler = 'handle' + signame.asJSIdentifier();
    }

    //  Add optional phase-specific phrase
    if (descriptor && TP.isValid(descriptor.phase)) {
        switch (descriptor.phase) {
            case TP.CAPTURING:
                handler += TP.CAPTURING;
                break;
            case TP.AT_TARGET:
                handler += TP.AT_TARGET;
                break;
            case TP.BUBBLING:
                break;
            default:
                TP.ifWarn() ?
                    TP.warn('InvalidSignalPhase', descriptor.phase) : 0;
                break;
        }
    }

    //  Add optional From clause for origin filtering.
    if (descriptor && TP.isValid(origin = descriptor.origin)) {
        handler += 'From' + TP.gid(origin);
    } else {
        handler += 'From' + TP.ANY;
    }

    //  Add optional When clause for state filtering.
    if (descriptor && TP.notEmpty(state = descriptor.state)) {
        handler += 'When' + TP.str(state).asTitleCase();
    } else {
        handler += 'When' + TP.ANY;
    }

    //  Simple handlers (very common) are cached.
    if (!descriptor) {
        TP.$$computedHandlers.atPut(signal, handler);
    }

    return handler;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('decomposeHandlerName',
function(aHandlerName) {

    /**
     * @method decomposeHandlerName
     * @summary Deomposes a standard handler name into a descriptor that can be
     *     used to generate the handler name.
     * @param {String} aHandlerName The handler name to decompose.
     * @returns {Object} A property 'descriptor'.
     *     Properties can be any combination of the following:
     *          {String} signal The type or signal name.
     *          {String} origin The origin.
     *          {String} state The state name.
     *          {String} phase (TP.CAPTURING, TP.AT_TARGET, TP.BUBBLING). The
     *              default is TP.BUBBLING.
     */

    var expression,
        regex,

        result,
        parts;

    expression = 'handle';

    //  ---
    //  Signal
    //  ---

    expression += '(\\w+?)';

    //  ---
    //  Phase
    //  ---

    expression += '(' +
                    TP.CAPTURING +
                    '|' +
                    TP.AT_TARGET +
                    '|(?:\\b\\B)*?)'; //  Matches no characters - non-capturing

    //  ---
    //  Origin
    //  ---

    expression += 'From(.+?)';

    //  ---
    //  State
    //  ---

    expression += 'When(.+)';


    //  Construct a RegExp and make sure that it is indeed one.
    regex = RegExp.construct(expression);
    if (!TP.isRegExp(regex)) {
        //  TODO:   expression problems...
        return;
    }

    result = {};

    parts = regex.exec(aHandlerName);

    //  Nothing matched - return empty descriptor
    if (TP.isEmpty(parts)) {
        return result;
    }

    //  The 0th place contains the 'whole match' - ignore it.

    //  'signal' is at the 1st place.
    if (TP.notEmpty(parts.at(1))) {
        result.signal = parts.at(1);
    }

    //  'phase' is at the 2nd place.
    if (TP.notEmpty(parts.at(2))) {
        result.phase = parts.at(2);
    }

    //  'origin' is at the 3rd place.
    if (TP.notEmpty(parts.at(3))) {
        result.origin = parts.at(3);
    }

    //  'state' is at the 4th place.
    if (TP.notEmpty(parts.at(4))) {
        result.state = parts.at(4);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventAsHTMLString',
function(eventObj) {

    /**
     * @method eventAsHTMLString
     * @summary Returns an HTML String representation of the supplied event
     *     object.
     * @param {Event} eventObj The event object to produce the HTML String
     *     representation of.
     * @returns {String} An HTML String representation of the supplied event
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.keys(eventObj);
    len = keys.length;

    arr.push('<span',
                ' class="Event ', TP.escapeTypeName(TP.tname(eventObj)), '">');

    for (i = 0; i < len; i++) {
        try {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(eventObj[keys[i]]), '</span>');
        } catch (e) {
            arr.push('<span data-name="', keys[i], '">',
                        TP.htmlstr(undefined), '</span>');
        }
    }

    arr.push('</span>');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventAsJSONSource',
function(eventObj) {

    /**
     * @method eventAsJSONSource
     * @summary Returns a JSON String representation of the supplied event
     *     object.
     * @param {Event} eventObj The event object to produce the JSON String
     *     representation of.
     * @returns {String} An JSON String representation of the supplied event
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.keys(eventObj);
    len = keys.length;

    arr.push('{"type":"', TP.tname(eventObj), '","data":{');

    for (i = 0; i < len; i++) {
        try {
            arr.push(keys[i].quoted('"'), ':', TP.jsonsrc(eventObj[keys[i]]));
        } catch (e) {
            arr.push(keys[i].quoted('"'), ':"undefined"');
        } finally {
            arr.push(',');
        }
    }

    //  Pop off the trailing comma
    arr.pop();

    arr.push('}}');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventAsPrettyString',
function(eventObj) {

    /**
     * @method eventAsPrettyString
     * @summary Returns a 'pretty print' representation of the supplied event
     *     object.
     * @param {Event} eventObj The event object to produce the pretty print
     *     representation of.
     * @returns {String} A pretty print representation of the supplied event
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.keys(eventObj);
    len = keys.length;

    arr.push('<dl class="pretty ', TP.escapeTypeName(TP.tname(eventObj)), '">',
                '<dt>Type name</dt>',
                '<dd class="pretty typename">', TP.tname(eventObj), '</dd>');

    for (i = 0; i < len; i++) {
        try {
            arr.push('<dt class="pretty key">', keys[i], '</dt>',
                        '<dd>', TP.pretty(eventObj[keys[i]]), '</dd>');
        } catch (e) {
            arr.push('<dt class="pretty key">', keys[i], '</dt>',
                        '<dd>', TP.pretty(undefined), '</dd>');
        }
    }

    arr.push('</dl>');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventAsSource',
function(eventObj) {

    /**
     * @method eventAsSource
     * @summary Returns a TIBET source string representation of the supplied
     *     event object.
     * @param {Event} eventObj The event object to produce the TIBET source
     *     representation of.
     * @returns {String} A TIBET source string representation of the supplied
     *     event object.
     */

    var arr,

        target,

        keys,
        len,
        i;

    arr = TP.ac();

    if (TP.isNode(target = TP.eventGetTarget(eventObj))) {
        arr.push('TP.documentConstructEvent(',
                    TP.gid(TP.nodeGetWindow(target)),
                    '.document,');
    } else {
        //  NOTE the use of 'window.document' here to try to capture the current
        //  window context rather than 'top.document' in case we didn't load
        //  into the top window.
        arr.push('TP.documentConstructEvent(window.document, ');
    }

    keys = TP.keys(eventObj);
    len = keys.length;

    arr.push('TP.hc(');

    for (i = 0; i < len; i++) {
        try {
            arr.push(keys[i], ', ', TP.src(eventObj[keys[i]]), ', ');
        } catch (e) {
            arr.push(keys[i], ', ', 'undefined', ', ');
        }
    }

    //  Pop off the last comma
    arr.pop();

    arr.push(')');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventAsString',
function(eventObj) {

    /**
     * @method eventAsString
     * @summary Returns a String representation of the supplied event
     *     object.
     * @param {Event} eventObj The event object to produce the String
     *     representation of.
     * @returns {String} A String representation of the supplied event
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.keys(eventObj);
    len = keys.length;

    arr.push(TP.eventGetType(eventObj), ' : ', '(');

    for (i = 0; i < len; i++) {
        try {
            arr.push(keys[i], ' => ', TP.str(eventObj[keys[i]]), ', ');
        } catch (e) {
            arr.push(keys[i], ' => undefined', ', ');
        }
    }

    //  Pop off the last comma
    arr.pop();

    arr.push(')');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventAsXMLString',
function(eventObj) {

    /**
     * @method eventAsXMLString
     * @summary Returns an XML String representation of the supplied event
     *     object.
     * @param {Event} eventObj The event object to produce the XML String
     *     representation of.
     * @returns {String} An XML String representation of the supplied event
     *     object.
     */

    var arr,
        keys,
        len,
        i;

    arr = TP.ac();

    keys = TP.keys(eventObj);
    len = keys.length;

    arr.push('<event', ' typename="', TP.tname(eventObj), '"');

    for (i = 0; i < len; i++) {
        try {
            arr.push(' ', keys[i], '="', TP.xmlstr(eventObj[keys[i]]), '"');
        } catch (e) {
            arr.push(' ', keys[i], '="undefined"');
        }
    }

    arr.push('/>');

    return arr.join('').toString();
});

//  ------------------------------------------------------------------------
//  MUTATION OBSERVER REGISTRY
//  ------------------------------------------------------------------------

TP.definePrimitive('addMutationObserver',
function(recordsHandler, observerConfig, observerID) {

    /**
     * @method addMutationObserver
     * @summary Adds a Mutation Observer entry to the Mutation Observer
     *     registry.
     * @description Note that you must call 'TP.activateMutationObserver()' in
     *     order to actually activate the Mutation Observer. This method merely
     *     creates a registry entry.
     * @param {Function} recordsHandler A function that will take in an Array of
     *     MutationRecord objects and process them.
     * @param {Object} observerConfig A plain JS object that will be passed
     *     along as options to the native Mutation Observer creation machinery.
     * @param {String} observerID The ID of the observer to register.
     */

    var registry,
        registryRecord,

        filterFunctions;

    registry = TP.$$mutationObserverRegistry;

    //  Create the managed Mutation Observer registry if it doesn't already
    //  exist.
    if (TP.notValid(registry)) {
        registry = TP.hc('$ALL_FILTER_FUNCS', TP.ac());
        TP.$$mutationObserverRegistry = registry;
    }

    registryRecord = registry.at(observerID);

    //  Grab a copy of the filter functions registered as meant for 'ALL'.
    filterFunctions = TP.copy(registry.at('$ALL_FILTER_FUNCS'));

    //  If we have a valid registry record, then we may be a dup or we may have
    //  just had filter functions registered for us before this call was made.
    if (TP.isValid(registryRecord)) {

        //  If we have an observerConfig, then it's highly likely that this is a
        //  duplicate and not just filter functions that got registered for us.
        if (TP.isValid(registryRecord.at('observerConfig'))) {
            TP.ifWarn() ?
                TP.warn('Existing managed mutation observer already' +
                            ' registered: ', observerID) : 0;
        }

        //  There may have been existing filter functions for this managed
        //  mutation observer if they were registered before this call was made.
        //  Concatenate them onto the end of the 'all filter function' set that
        //  we grabbed above for use below.
        filterFunctions = filterFunctions.concat(
                            registryRecord.at('filterFunctions'));
    }

    registryRecord = TP.hc(
                'recordsHandler', recordsHandler,
                'observerConfig', observerConfig,
                'observerID', observerID,
                'filterFunctions', filterFunctions
                );

    registry.atPut(observerID, registryRecord);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('addMutationObserverFilter',
function(filterFunction, observerID) {

    /**
     * @method addMutationObserverFilter
     * @summary Adds a filter function that will be used to filter mutation
     *     records. This can be installed for either a particular observer or
     *     for all managed Mutation Observers.
     * @description If observerID is TP.ALL, the filter functions will be
     *     installed for all managed Mutation Observers.
     * @param {Function} filterFunction A function that will take in a single
     *     MutationRecord objects and return true or false as to whether that
     *     record should be processed.
     * @param {String} observerID The ID of the observer to register the filter
     *     function for or TP.ALL.
     */

    var registry,

        registryRecord;

    registry = TP.$$mutationObserverRegistry;

    //  Create the managed Mutation Observer registry if it doesn't already
    //  exist.
    if (TP.notValid(registry)) {
        registry = TP.hc('$ALL_FILTER_FUNCS', TP.ac());
        TP.$$mutationObserverRegistry = registry;
    }

    //  If the supplied observer ID is not TP.ALL, then this filter is being
    //  installed for a particular observer. Find its filter functions and add
    //  the new Function.
    if (observerID !== TP.ALL) {

        registryRecord = registry.at(observerID);

        //  It looks like the managed mutation observer hasn't been registered
        //  yet, so we create a (mostly) blank record, but with the
        //  'filterFunctions' set to an empty Array.
        if (TP.notValid(registryRecord)) {

            registryRecord = TP.hc(
                        'recordsHandler', null,
                        'observerConfig', null,
                        'observerID', null,
                        'filterFunctions', TP.ac()
                        );

            registry.atPut(observerID, registryRecord);
        }

        registryRecord.at('filterFunctions').push(filterFunction);

        return;
    }

    //  The observerID is TP.ALL... we need to add this filter to all managed
    //  Mutation Observers.
    registry.perform(
            function(kvPair) {
                if (kvPair.first() === '$ALL_FILTER_FUNCS') {
                    return;
                }

                kvPair.last().at('filterFunctions').push(filterFunction);
            });

    //  We also keep track of all of the filter functions that should be
    //  installed for all observers for installation into future managed
    //  Mutation Observers.
    registry.at('$ALL_FILTER_FUNCS').push(filterFunction);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('activateMutationObserver',
function(targetNode, observerID) {

    /**
     * @method activateMutationObserverFilter
     * @summary Activates a previously added managed Mutation Observer.
     * @param {Node} targetNode The node that will be observed for mutations.
     * @param {String} observerID The ID of the observer to activate.
     */

    var registry,

        registryRecord,

        observerCallback,
        observerObj;

    //  Make sure that we have a real managed Mutation Observer registry.
    registry = TP.$$mutationObserverRegistry;
    if (TP.notValid(registry)) {
        return TP.raise(this,
                        'TP.sig.InvalidObject',
                        'Invalid managed Mutation Observer registry');
    }

    //  Make sure that we can find the record of the managed Mutation Observer
    //  that the caller wants.
    registryRecord = registry.at(observerID);
    if (TP.notValid(registryRecord)) {
        return TP.raise(
                this,
                'TP.sig.InvalidObject',
                'No managed Mutation Observer entry for: ' + observerID);
    }

    //  Create a Function that will be used as the native Mutation Observer
    //  callback. This Function will filter mutation records based on whether
    //  they've been handled or not already (to fix Webkit bug:
    //  https://bugs.webkit.org/show_bug.cgi?id=103916) and whether they pass
    //  further filter functions.

    observerCallback = function(mutationRecords, observer) {

        var handledSlotName,

            allRecords,

            records;

        //  Compute a 'handled' slot based on the ID of the observer
        //  that we're processing.
        handledSlotName = 'HANDLED_FOR_' +
                            observer.registryRecord.at('observerID');

        //  Note that we grab the mutationRecords parameter and then obtain
        //  *any* remaining currently queued mutation records from the observer
        //  by calling 'takeRecords'. This significantly speeds processing by
        //  avoiding multiple callbacks firing as mutation records are serviced
        //  and allows callbacks to handle the whole block of mutation records
        //  at once.
        allRecords = mutationRecords.concat(observer.takeRecords());

        records = allRecords.filter(
            function(aRecord) {

                var filterFuncs,

                    len,
                    i;

                //  If the record has already been handled by this observer,
                //  return false to filter it out. This fixes the Webkit bug
                //  mentioned above.
                if (aRecord[handledSlotName]) {
                    return false;
                }

                //  Grab the filter functions, iterate through them and if *any
                //  one* of them returns false, return false from here, thereby
                //  filtering out that record.
                filterFuncs =
                    observer.registryRecord.at('filterFunctions');

                len = filterFuncs.getSize();
                for (i = 0; i < len; i++) {
                    if (filterFuncs.at(i)(aRecord) === false) {
                        return false;
                    }
                }

                return true;
            });

        //  If we have real records to process, call the records handling
        //  Function with those records.
        if (TP.notEmpty(records)) {
            observer.registryRecord.at('recordsHandler')(records);
        }

        records.forEach(
            function(aRecord) {

                //  We go ahead and stamp this record as 'handled' for this
                //  observer.
                aRecord[handledSlotName] = true;
            });
    };

    //  Go ahead and install the callback using the native Mutation Observer
    //  call and begin observation using data found in the record created when
    //  the caller added the managed Mutation Observer.
    observerObj = new MutationObserver(observerCallback);

    //  Capture the registry record on the observer object itself for use
    //  inside of the callback handler above to avoid closure issues.
    observerObj.registryRecord = registryRecord;

    observerObj.observe(targetNode, registryRecord.at('observerConfig'));

    //  Stash the target node into the registry record for this managed Mutation
    //  Observer for convenience.
    registryRecord.atPut('targetNode', targetNode);

    //  Stash the native Mutation Observer object into the registry record for
    //  this managed Mutation Observer for use in deactivation.
    registryRecord.atPut('$observerObj', observerObj);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('deactivateMutationObserver',
function(observerID) {

    /**
     * @method deactivateMutationObserverFilter
     * @summary Deactivates a previously activated managed Mutation Observer.
     * @param {String} observerID The ID of the observer to deactivate.
     */

    var registry,

        registryRecord,
        observerObj;

    //  Make sure that we have a real managed Mutation Observer registry.
    registry = TP.$$mutationObserverRegistry;
    if (TP.notValid(registry)) {
        return TP.raise(this,
                        'TP.sig.InvalidObject',
                        'Invalid managed Mutation Observer registry');
    }

    //  Make sure that we can find the record of the managed Mutation Observer
    //  that the caller wants.
    registryRecord = registry.at(observerID);
    if (TP.notValid(registryRecord)) {
        return TP.raise(
                this,
                'TP.sig.InvalidObject',
                'No managed Mutation Observer entry for: ' + observerID);
    }

    //  Make sure that we have a valid native Mutation Observer object. Note
    //  that, if the node that the observer was watching is no longer valid, the
    //  observer will be automatically garbage collected, according to the
    //  Mutation Observers specification. In that case, we don't worry about it.
    observerObj = registryRecord.at('$observerObj');
    if (TP.isValid(observerObj)) {
        //  Clean the native Mutation Observers queue. NB: This may cause the
        //  callback that we installed in TP.activateMutationObserver() above to
        //  activate.
        observerObj.takeRecords();
        observerObj.disconnect();
    }

    //  The target node is of no use to us now - remove it.
    registryRecord.removeKey('targetNode');

    //  The native observer object is of no use to us now - remove it.
    registryRecord.removeKey('$observerObj');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeMutationObserver',
function(observerID) {

    /**
     * @method removeMutationObserverFilter
     * @summary Removes a previously added managed Mutation Observer.
     * @param {String} observerID The ID of the observer to remove.
     */

    var registry;

    //  Make sure that we have a real managed Mutation Observer registry.
    registry = TP.$$mutationObserverRegistry;
    if (TP.notValid(registry)) {
        return TP.raise(this,
                        'TP.sig.InvalidObject',
                        'Invalid managed Mutation Observer registry');
    }

    //  Deactivate it to properly shut it down.
    TP.deactivateMutationObserver(observerID);

    //  The managed Mutation Observer object is of no use to us now - remove it.
    registry.removeKey(observerID);

    return;
});

//  ------------------------------------------------------------------------
//  TIBET - ENVIRONMENT PLUGIN INFORMATION
//  ------------------------------------------------------------------------

TP.boot.$configurePluginEnvironment = function() {

    /**
     * @method $configurePluginEnvironment
     * @summary Populates the TIBET environment metadata with information about
     *     all of the known plugins, whether they are installed or not and, if
     *     so, their version number.
     */

    var pluginKeys,
        len,
        i,
        pluginInfo;

    //  Get all of the keys in the TP.PLUGIN_INFO hash. This will contain
    //  keys matching all of the 'known' (but not necessarily installed)
    //  plugins.
    pluginKeys = TP.keys(TP.PLUGIN_INFO);

    //  Loop over that and register a set of key / value pairs containing:
    //      'plugin.<name>.installed'   ->  true or false
    //      'plugin.<name>.revMajor'    ->  Major revision number or undef
    //      'plugin.<name>.revMinor'    ->  Minor revision number or undef
    //      'plugin.<name>.revPatch'    ->  Patch revision number or undef

    len = pluginKeys.getSize();
    for (i = 0; i < len; i++) {
        pluginInfo = TP.getPluginInfo(pluginKeys.at(i));

        TP.boot.$$setenv(
                    TP.join('plugin.', pluginKeys.at(i), '.', 'installed'),
                    pluginInfo.at('isInstalled'));

        TP.boot.$$setenv(
                    TP.join('plugin.', pluginKeys.at(i), '.', 'revMajor'),
                    pluginInfo.at('revMajor'));
        TP.boot.$$setenv(
                    TP.join('plugin.', pluginKeys.at(i), '.', 'revMinor'),
                    pluginInfo.at('revMinor'));
        TP.boot.$$setenv(
                    TP.join('plugin.', pluginKeys.at(i), '.', 'revPatch'),
                    pluginInfo.at('revPatch'));
    }

    return;
};

//  ------------------------------------------------------------------------

//  A TIBET-formatted version of the code found here:
//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties

TP.boot.$simplePropertyRetriever = {

    getOwnEnumerables: function(obj) {
        return this._getPropertyNames(
                        obj, true, false, this._enumerable);
         // Or could use for..in filtered with hasOwnProperty or just this:
         //     return Object.keys(obj);
    },
    getOwnNonenumerables: function(obj) {
        return this._getPropertyNames(
                        obj, true, false, this._notEnumerable);
    },
    getOwnEnumerablesAndNonenumerables: function(obj) {
        return this._getPropertyNames(
                        obj, true, false, this._enumerableAndNotEnumerable);
        //  Or just use: return Object.getOwnPropertyNames(obj);
    },
    getPrototypeEnumerables: function(obj) {
        return this._getPropertyNames(
                        obj, false, true, this._enumerable);
    },
    getPrototypeNonenumerables: function(obj) {
        return this._getPropertyNames(
                        obj, false, true, this._notEnumerable);
    },
    getPrototypeEnumerablesAndNonenumerables: function(obj) {
        return this._getPropertyNames(
                        obj, false, true, this._enumerableAndNotEnumerable);
    },
    getOwnAndPrototypeEnumerables: function(obj) {
        return this._getPropertyNames(
                        obj, true, true, this._enumerable);
        //  Or could use unfiltered for..in
    },
    getOwnAndPrototypeNonenumerables: function(obj) {
        return this._getPropertyNames(
                        obj, true, true, this._notEnumerable);
    },
    getOwnAndPrototypeEnumerablesAndNonenumerables: function(obj) {
        return this._getPropertyNames(
                        obj, true, true, this._enumerableAndNotEnumerable);
    },
    //  Private static property checker callbacks
    _enumerable: function(obj, prop) {
        return obj.propertyIsEnumerable(prop);
    },
    _notEnumerable: function(obj, prop) {
        return !obj.propertyIsEnumerable(prop);
    },
    _enumerableAndNotEnumerable: function(obj, prop) {
        return true;
    },
    //  Inspired by http://stackoverflow.com/a/8024294/271577
    /* eslint-disable func-names */
    _getPropertyNames: function getAllPropertyNames(
                                    obj, iterateSelfBool,
                                    iteratePrototypeBool, includePropCb) {
        var target,
            props,

            selfBool;

        target = obj;
        props = [];
        selfBool = iterateSelfBool;

        /* eslint-disable no-loop-func */
        do {
            if (selfBool) {
                Object.getOwnPropertyNames(target).forEach(
                        function(prop) {
                            if (props.indexOf(prop) === -1 &&
                                includePropCb(target, prop)) {
                                props.push(prop);
                            }
                        });
            }
            if (!iteratePrototypeBool) {
                break;
            }
            selfBool = true;
        /* eslint-enable no-loop-func */
        /* eslint-disable no-extra-parens */
        } while ((target = Object.getPrototypeOf(target)));
        /* eslint-enable no-extra-parens */

        return props;
    }
    /* eslint-enable func-names */
};

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
