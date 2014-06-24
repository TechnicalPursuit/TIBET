//  ========================================================================
/*
NAME:   html_StylesheetModuleNodes.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
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

//  ========================================================================
//  TP.html.style
//  ========================================================================

/**
 * @type {TP.html.style}
 * @synopsis 'style' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('style');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Phase Support
//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tshPrecompile',
function(aRequest) {

    var node,
        base,
        styleText,
        arr,
        newStyleText,
        newNode,
        str;

    TP.debug('break.css_processing');

    //  wall off conversion of TP.html.style elements so the css processing
    //  pipeline never gets off the ground.
    if (!TP.sys.cfg('css.process_styles')) {
        return TP.CONTINUE;
    }

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail(TP.FAILURE, 'Unable to find command node.');
    }

    base = TP.ifInvalid(TP.elementGetAttribute(node, 'src'), '.');

    //  get all text content, which should be in a CDATA block
    styleText = TP.nodeGetTextContent(node);

    //  we'll be building up a string representation of our output node so
    //  get an array ready to accept the chunks.
    arr = TP.ac();

    //  replace @import references with a new css:sheet node containing that
    //  import's file content, marking the new css:sheet node with the URI
    //  for reference during indexing. the @import is replaced with a
    //  comment.
    //  The basic strategy is that since @imports have to be processed as if
    //  they were first, no matter where they were found, any @imports we
    //  find inside the inline style node can be placed in front of it in
    //  the order they were found as if they were link elements.

    TP.regex.CSS_IMPORT_RULE.lastIndex = 0;
    newStyleText = styleText.replace(
        TP.regex.CSS_IMPORT_RULE,
function(wholeMatch, arg1, href) {

            var url,
                path,
                content;

            path = href.unquoted();
            path = /\//.test(path) ? path : './' + path;
            if (TP.notValid(url = TP.uc(TP.uriResolvePaths(base, path)))) {
                content = TP.join(
                        '/* ',
                        TP.sc('Invalid import URL: '),
                        href,
                        ' */');

                return content;
            }

            //  put the import's content into a new css:sheet node (we'll
            //  build the real node outside the loop) and replace @import
            //  with a placeholder notation
                        //          arr.push('<css:sheet type="import" src="', href, '" ',
                        //              'xmlns:css="', TP.w3.Xmlns.CSSML, '"/>');
            arr.push('<html:link type="text/css" rel="stylesheet"',
                ' href="', url.getLocation(), '" ',
                'xmlns:html="', TP.w3.Xmlns.XHTML, '"/>');

            return '/* Externalized ' + href + ' import. */\n';
});

    //  put the style node and its content on as the last portion of
    //  the array before we build the fragment. NOTE that this one has
    //  no tibet:src attribute.
    arr.push('<css:sheet type="inline" xmlns:css="', TP.w3.Xmlns.CSSML, '">',
            '<![CDATA[', newStyleText, ']]></css:sheet>');

    str = arr.join('');

    newNode = TP.fragmentFromString(str);
    if (TP.notValid(newNode)) {
        //  oops, something went wrong, probably badly formed CSS that
        //  wasn't in a CDATA block to keep it from interfering with XML
        return aRequest.fail(TP.FAILURE,
        'Unable to create new css:sheet node for inline TP.html.style.');
    }

    //  NOTE that we have to capture the return value from the replace
    //  due to node importing requirements which may create a new node.
    newNode = TP.nodeReplaceChild(node.parentNode, newNode, node);

    return newNode;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
