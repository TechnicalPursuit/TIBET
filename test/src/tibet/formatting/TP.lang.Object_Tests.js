//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.lang.Object.Inst.describe('as',
function() {

    this.it('Meta objects \'as\' method using simple substitutions', function(test, options) {

        var testRep,
            correctRep;

        //  ---
        //  Any character simple substitution
        //  ---

        testRep = '4582022'.as('@{@@@-@@@@}');

        correctRep = '458-2022';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Numeric simple substitution
        //  ---

        testRep = (22).as('#{##.00}');

        correctRep = '22.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = (200).as('#{999,999.00}');

        correctRep = '200.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        testRep = (200).as('The number is: {{value.%$#{?99,999.00}}}');

        correctRep = 'The number is: $ 200.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  'as' with method lookup substitution
        //  ---

        testRep = 'bill'.as('startUpper');

        correctRep = 'Bill';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  'as' with token to 'format' method on type substitution
        //  ---

        testRep = TP.dc().as('YYYY');

        correctRep = TP.dc().getFullYear().toString();

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using object & Function substitutions', function(test, options) {

        var testRep,
            correctRep,

            transformObj,

            dateVal;

        //  ---
        //  'as' substitution
        //  ---

        testRep = (22).as(
                    function(anObj) {
                        return 'His age is: ' + anObj;
                    });

        correctRep = 'His age is: 22';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  'as' substitution - locally defined 'transform' method
        //  ---

        transformObj = TP.lang.Object.construct();
        transformObj.defineMethod('transform',
                        function(anObj) {
                            return 'The value is: ' + anObj;
                        });

        //  ---

        testRep = (22).as(transformObj);

        correctRep = 'The value is: 22';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  'as' substitution - locally defined 'transform<Type>' methods
        //  ---

        transformObj = TP.lang.Object.construct();
        transformObj.defineMethod('transformNumber',
                        function(anObj) {
                            return 'This is a Number: ' + anObj;
                        });
        transformObj.defineMethod('transformDate',
                        function(anObj) {
                            return 'This is a Date: ' + anObj;
                        });

        //  ---

        testRep = (22).as(transformObj);

        correctRep = 'This is a Number: 22';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        dateVal = TP.dc();

        testRep = dateVal.as(transformObj);

        correctRep = 'This is a Date: ' + dateVal.toString();

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using conversion types', function(test, options) {

        var testElem,

            testRep,
            correctRep;

        //  ---
        //  'as' substitution - type conversion
        //  ---

        testElem = TP.ac(1, 2, TP.hc('foo', 'bar')).as('TP.dom.XMLRPCNode');

        //  Need to generate an ID for elements for reporting purposes.
        TP.elemGenID(testElem, true);

        test.assert.isElement(testElem);

        testRep = TP.str(testElem);
        correctRep = '<array id="' + TP.elementGetAttribute(testElem, 'id') + '"><data><value><double>1</double></value><value><double>2</double></value><value><struct><member><name>foo</name><value><string>bar</string></value></member></struct></value></data></array>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using nested substitutions', function(test, options) {

        var testRep,
            correctRep;

        //  ---
        //  'value' is the standard slot
        //  ---

        testRep = TP.hc('foo', 'bar').as('It is: {{value.foo}}');

        correctRep = 'It is: bar';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  But 'value' is optional
        //  ---

        testRep = TP.hc('foo', 'bar').as('It is: {{foo}}');

        correctRep = 'It is: bar';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Default value
        //  ---

        testRep = TP.hc('foo', 'bar').as('It is: {{goo .|| \'fluffy\'}}');

        correctRep = 'It is: fluffy';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Path traversal
        //  ---

        testRep = TP.hc('foo', TP.hc('bar', 'baz')).as('It is: {{foo.bar}}');

        correctRep = 'It is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Path traversal with default value (quoted)
        //  ---

        testRep = TP.hc('foo', TP.hc('bar', 'baz')).as('It is: {{foo.goo .|| \'fluffy\'}}');

        correctRep = 'It is: fluffy';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Formatted results
        //  ---

        testRep = TP.hc('lname', 'edney', 'salary', 10000).as(
                                'The number is: {{salary.%$#{?99,999.00}}}');

        correctRep = 'The number is: $ 10,000.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Formatted results with default values
        //  ---

        testRep = TP.hc('lname', 'edney').as(
                                '{{lname}}\'s salary is: {{salary .|| 20000 .% $#{?99,999.00}}}');

        correctRep = 'edney\'s salary is: $ 20,000.00';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Formatted results using built-in variables
        //  ---

        testRep = TP.ac(1, 2, 3).as(
                    'The item at: {{$INDEX}} is: {{value}} ', TP.hc('repeat', true));

        correctRep =
            'The item at: 0 is: 1 The item at: 1 is: 2 The item at: 2 is: 3 ';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using registered templates', function(test, options) {

        var testRep,
            correctRep,

            dataElem,
            templateStr;

        //  --------------------------------------------------------------------
        //  Registered templates - register a template with the system and call
        //  it.
        //  --------------------------------------------------------------------

        //  ---
        //  Simple path templates
        //  ---

        templateStr = 'This is a value: {{value.2}} for row #: {{1}}';

        //  The 'true' flag here flushes the template cache and forces
        //  redefinition
        templateStr.compile('myTemplate', true);

        testRep = TP.ac(1, 2, 3).as('myTemplate');

        correctRep = 'This is a value: 3 for row #: 2';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Complex path templates (in this case, XPath) feeding to a String
        //  format
        //  ---

        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        templateStr = 'The element with a bar attribute is: {{./*[@bar].%String}}';

        //  The 'true' flag here flushes the template cache and forces
        //  redefinition
        templateStr.compile('myXMLTemplate', true);

        testRep = dataElem.as('myXMLTemplate');
        correctRep = 'The element with a bar attribute is: <baz bar="moo"/>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Complex path template with nested template
        //  ---

        templateStr = 'The name of the element with a bar attribute is: {{./*[@bar].%{{localName}}}}';

        //  The 'true' flag here flushes the template cache and forces
        //  redefinition
        templateStr.compile('myXMLTemplate', true);

        testRep = dataElem.as('myXMLTemplate');
        correctRep = 'The name of the element with a bar attribute is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Sequence of templates - one calls another
        //  ---

        //  The 'true' flag here flushes the template cache and forces
        //  redefinition
        'This is a row value: {{value}}\n'.compile('rowTemp', true);

        //  NB: This template calls on the registered 'rowTemp' template.
        'Here is some row data {{.%rowTemp}}\n'.compile('tableTemp', true);

        testRep = TP.ac(1, 2, 3).as('tableTemp', TP.hc('repeat', true));

        correctRep = 'Here is some row data This is a row value: 1\n\nHere is some row data This is a row value: 2\n\nHere is some row data This is a row value: 3\n\n';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  --------------------------------------------------------------------
        //  Registered templates that iterate
        //  --------------------------------------------------------------------

        //  ---
        //  The template contains special TIBET variables that vary when
        //  iterating ($INDEX is one).
        //  ---

        //  The 'true' flag here flushes the template cache and forces
        //  redefinition
        'This is a row value: {{value}} for row #: {{$INDEX}}\n'.compile(
            'myTemplate', true);

        //  The 'repeat' flag here causes iteration.
        testRep = TP.ac(1, 2, 3).as('myTemplate', TP.hc('repeat', true));

        correctRep = 'This is a row value: 1 for row #: 0\nThis is a row value: 2 for row #: 1\nThis is a row value: 3 for row #: 2\n';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using externally loaded XML templates', function(test, options) {

        var testRep,
            correctRep,

            googleDogData;

        //  TODO: Skipped for now until we restore Google data
        //  manipulation capability

        //  ---

        googleDogData = TP.google.GoogleSearchData.construct('{"responseData":{"results":[{"GsearchResultClass":"GwebSearch","unescapedUrl":"http://en.wikipedia.org/wiki/Dog","url":"http://en.wikipedia.org/wiki/Dog","visibleUrl":"en.wikipedia.org","cacheUrl":"http://www.google.com/search?q=cache:dIBIpaJI7JgJ:en.wikipedia.org","title":"<b>Dog</b> - Wikipedia, the free encyclopedia","titleNoFormatting":"Dog - Wikipedia, the free encyclopedia","content":"The domestic <b>dog</b> (Canis lupus familiaris) is a subspecies of the gray wolf (Canis lupus), a member of the Canidae family of the mammalian order Carnivora."},{"GsearchResultClass":"GwebSearch","unescapedUrl":"http://www.petfinder.com/dogs/","url":"http://www.petfinder.com/dogs/","visibleUrl":"www.petfinder.com","cacheUrl":"http://www.google.com/search?q=cache:Rht9y0MbwZEJ:www.petfinder.com","title":"<b>Dog</b>: <b>Dog</b> Breeds, Adoption, Bringing a <b>Dog</b> Home and Care","titleNoFormatting":"Dog: Dog Breeds, Adoption, Bringing a Dog Home and Care","content":"Everything you need to know about <b>dogs</b>, including <b>dog</b> breeds, <b>...</b>"},{"GsearchResultClass":"GwebSearch","unescapedUrl":"http://www.petfinder.com/dog-breeds?see-all=1","url":"http://www.petfinder.com/dog-breeds%3Fsee-all%3D1","visibleUrl":"www.petfinder.com","cacheUrl":"http://www.google.com/search?q=cache:bJO230hBZAgJ:www.petfinder.com","title":"<b>Dog</b> Breeds | Browse 151 <b>dog</b> breeds | Petfinder","titleNoFormatting":"Dog Breeds | Browse 151 dog breeds | Petfinder","content":"<b>Dog</b> breeds: Browse our list of 152 <b>dog</b> breeds to find the perfect <b>dog</b> breed for you, and then find adoptable <b>dogs</b> and <b>dog</b> shelters close to you."},{"GsearchResultClass":"GwebSearch","unescapedUrl":"http://animal.discovery.com/tv-shows/dogs-101","url":"http://animal.discovery.com/tv-shows/dogs-101","visibleUrl":"animal.discovery.com","cacheUrl":"http://www.google.com/search?q=cache:1alMhUGABdQJ:animal.discovery.com","title":"<b>Dogs</b> 101: Animal Planet","titleNoFormatting":"Dogs 101: Animal Planet","content":"<b>Dogs</b> 101 is a fun crash course about all things <b>dog</b>! Learn about some of the most popular <b>dog</b> breeds, play fun <b>dog</b> games and find fascinating <b>dog</b> trivia."}],"cursor":{"resultCount":"53,700,000","pages":[{"start":"0","label":1},{"start":"4","label":2},{"start":"8","label":3},{"start":"12","label":4},{"start":"16","label":5},{"start":"20","label":6},{"start":"24","label":7},{"start":"28","label":8}],"estimatedResultCount":"126000000","currentPageIndex":0,"moreResultsUrl":"http://www.google.com/search?oe=utf8&ie=utf8&source=uds&start=0&hl=en&q=dogs","searchResultTime":"0.13"}},"responseDetails":null,"responseStatus":200}');

        //  ---
        //  Use an external template to transform data
        //  ---

        testRep = TP.uc('~lib_test/src/tibet/formatting/google_results_template.xml#totalTemplate').transform(googleDogData).get('result');

        correctRep = /<span xmlns="http:\/\/www.w3.org\/1999\/xhtml" id="totalTemplate"><span class="estimatedResultCount">Result count: <span([\s\S]*)tibet:templateexpr="responseData.cursor.resultCount"([\s\S]*)>53,700,000<\/span><\/span>Results:<br\/><span([\s\S]*)tibet:templateexpr="responseData.results"([\s\S]*)>\[object Object\]\[object Object\]\[object Object\]\[object Object\]<\/span><\/span>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent when' +
            ' external template used directly'));

        //  ---
        //  Same test, but use a URI reference to an external template to
        //  transform data against the 'value'
        //  ---

        testRep = '{{value .% ~lib_test/src/tibet/formatting/google_results_template.xml#totalTemplate}}'.transform(googleDogData);

        correctRep = /<span xmlns="http:\/\/www.w3.org\/1999\/xhtml" id="totalTemplate"><span class="estimatedResultCount">Result count: <span([\s\S]*)tibet:templateexpr="responseData.cursor.resultCount"([\s\S]*)>53,700,000<\/span><\/span>Results:<br\/><span([\s\S]*)tibet:templateexpr="responseData.results"([\s\S]*)>\[object Object\]\[object Object\]\[object Object\]\[object Object\]<\/span><\/span>/;
        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent when' +
            ' external template used as a formatter'));

        //  ---
        //  Use a path retrieval in conjunction with an external template
        //  ---

        testRep = TP.uc('~lib_test/src/tibet/formatting/google_results_template.xml#rowTemplate').transform(googleDogData.get('responseData.results.0')).get('result');
        correctRep = /<span xmlns="http:\/\/www.w3.org\/1999\/xhtml" id="rowTemplate"><tr class="googleResultRow"><td><span([\s\S]*)tibet:templateexpr="unescapedUrl"([\s\S]*)>http:\/\/en.wikipedia.org\/wiki\/Dog<\/span><\/td><td><span([\s\S]*)tibet:templateexpr="title"([\s\S]*)><b>Dog<\/b> - Wikipedia, the free encyclopedia<\/span><\/td><td><span([\s\S]*)tibet:templateexpr="content"([\s\S]*)>The domestic <b>dog<\/b> \(Canis lupus familiaris\) is a subspecies of the gray wolf \(Canis lupus\), a member of the Canidae family of the mammalian order Carnivora\.<\/span><\/td><\/tr><\/span>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent when' +
            ' external template used directly in conjunction with path retrieval'));

        //  ---
        //  Same test, but use a URI reference to an external template to
        //  transform data against the value retrieved with a path
        //  ---

        testRep = '{{value.responseData.results.0 .% ~lib_test/src/tibet/formatting/google_results_template.xml#rowTemplate}}'.transform(googleDogData);

        correctRep = /<span xmlns="http:\/\/www.w3.org\/1999\/xhtml" id="rowTemplate"><tr class="googleResultRow"><td><span([\s\S]*)tibet:templateexpr="unescapedUrl"([\s\S]*)>http:\/\/en.wikipedia.org\/wiki\/Dog<\/span><\/td><td><span([\s\S]*)tibet:templateexpr="title"([\s\S]*)><b>Dog<\/b> - Wikipedia, the free encyclopedia<\/span><\/td><td><span([\s\S]*)tibet:templateexpr="content"([\s\S]*)>The domestic <b>dog<\/b> \(Canis lupus familiaris\) is a subspecies of the gray wolf \(Canis lupus\), a member of the Canidae family of the mammalian order Carnivora\.<\/span><\/td><\/tr><\/span>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent when' +
            ' external template used as a formatter in conjunction with path' +
            ' retrieval'));
    }).skip();

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using externally loaded XSLT templates', function(test, options) {

        var testRep,
            correctRep,

            data,
            dataDoc;

        //  ---

        data = TP.ac(1, 2, 3, 4, 5, 6);

        dataDoc = TP.doc('<dataroot>' + data.asXMLString() + '</dataroot>');

        //  ---
        //  Use an external XSLT template to transform data
        //  ---

        //  NB: This method returns a TP.sig.Response - we need to fetch it's
        //  result.
        testRep = TP.uc('~lib_xsl/tp_xmlarrs2xhtmltable.xsl').transform(
                                                        dataDoc).get('result');

        //  If we're running in IE, the output will be slightly different - but
        //  it's still correct.
        if (TP.sys.isUA('IE')) {
            correctRep = '<html:table xmlns:html="http://www.w3.org/1999/xhtml" xmlns:tibet="http://www.technicalpursuit.com/1999/tibet" style="border: 1px solid black; border-image: none; border-collapse: collapse; border-spacing: 0;"><html:th style="border: 1px solid black; border-image: none; color: white; background-color: gray;">1</html:th><html:td style="border: 1px solid black; border-image: none;">2</html:td><html:td style="border: 1px solid black; border-image: none;">3</html:td><html:td style="border: 1px solid black; border-image: none;">4</html:td><html:td style="border: 1px solid black; border-image: none;">5</html:td><html:td style="border: 1px solid black; border-image: none;">6</html:td></html:table>';
        } else {
            correctRep = '<html:table xmlns:html="http://www.w3.org/1999/xhtml" xmlns:tibet="http://www.technicalpursuit.com/1999/tibet" style="border: solid 1px black; border-spacing: 0; border-collapse: collapse"><html:th style="background-color: gray; color: white; border: solid 1px black">1</html:th><html:td style="border: solid 1px black">2</html:td><html:td style="border: solid 1px black">3</html:td><html:td style="border: solid 1px black">4</html:td><html:td style="border: solid 1px black">5</html:td><html:td style="border: solid 1px black">6</html:td></html:table>';
        }

        //  Strip non-essential whitespace before comparing
        testRep = testRep.strip(/\n/g).replace(/>\s+</g, '><');

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    }).skip(TP.sys.cfg('boot.context') === 'phantomjs');

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method generating markup', function(test, options) {

        var testRep,
            correctRep,

            dateVal;

        //  ---
        //  Generate an 'ul' from an Array - iterate so that we generate an
        //  embedded 'li' for each Array item.
        //  ---

        testRep = TP.ac(1, 2, 'that\'s cool').as('html:ul', TP.hc('repeat', true));

        correctRep = '<html:ul>' +
                        '<html:li>1</html:li>' +
                        '<html:li>2</html:li>' +
                        '<html:li>that\'s cool</html:li>' +
                        '</html:ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Generate an 'ul' from an Array - iterate so that we generate an
        //  embedded 'li' for each Array item. Also, supply attribute
        //  information that goes with each 'li'
        //  ---

        testRep = TP.ac(1, 2, 'that\'s cool').as('html:ul',
                     TP.hc('repeat', true,
                            'infos', TP.ac(
                                        TP.hc('repeat', true,
                                                '$attrInfo', 'baz="goo"'))));

        correctRep = '<html:ul>' +
                        '<html:li baz="goo">1</html:li>' +
                        '<html:li baz="goo">2</html:li>' +
                        '<html:li baz="goo">that\'s cool</html:li>' +
                        '</html:ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Generate an 'form' from a TP.core.Hash. Note how this generate
        //  an 'html type="text"' for each item (due to the 'repeat' being set
        //  to true). Also, it generates a 'label' for each item and wires it
        //  back to the field it's meant for. Lastly, it generates an
        //  'select' for the embedded Array.
        //  ---

        dateVal = TP.dc();
        testRep = TP.hc(
                'Emp Number', 1,
                'First Name', 'Bill',
                'Last Name', 'Edney',
                'Hire Date', dateVal.toISOString(),
                'Emp Level', TP.ac(1, 2, 3)).as(
                        'html:form', TP.hc('repeat', true));

        correctRep =
                '<html:form>' +
                    '<html:label for="field_0">Emp Number:</html:label>' +
                    '<html:input id="field_0" type="text" value="1"/>' +
                    '<html:label for="field_1">First Name:</html:label>' +
                    '<html:input id="field_1" type="text" value="Bill"/>' +
                    '<html:label for="field_2">Last Name:</html:label>' +
                    '<html:input id="field_2" type="text" value="Edney"/>' +
                    '<html:label for="field_3">Hire Date:</html:label>' +
                    '<html:input id="field_3" type="text" value="' + dateVal.toISOString() + '"/>' +
                    '<html:label for="field_4">Emp Level:</html:label>' +
                    '<html:select>' +
                        '<html:option>1, 2, 3</html:option>' +
                   '</html:select>' +
               '</html:form>';


        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using logic-control helpers', function(test, options) {

        var templateStr,

            testRep,
            correctRep;

        //  ---
        //  The {{:with}}...{{/:with}} statement, which sets the context
        //  ---

        templateStr = '<ul>{{:with foo.bar}}<li>{{goo}}</li><li>{{moo}}</li>{{/:with}}</ul>';

        testRep = templateStr.transform(TP.hc('foo', TP.hc('bar', TP.hc('goo', 'googoo', 'moo', 'moomoo'))));

        correctRep = '<ul><span tibet:templateexpr="foo.bar"><li>googoo</li><li>moomoo</li></span></ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  The {{:if}}...{{/:if}} statement, which tests its expression for
        //  existence.
        //  ---

        templateStr = '<ul>{{:if foo.bar}}<li>{{goo}}</li><li>{{moo}}</li>{{/:if}}</ul> and then there\'s: {{foo.bar.moo}}';

        testRep = templateStr.transform(TP.hc('foo', TP.hc('bar', TP.hc('goo', 'googoo', 'moo', 'moomoo'))));

        correctRep = '<ul><span tibet:templateexpr="foo.bar"><li>googoo</li><li>moomoo</li></span></ul> and then there\'s: <span tibet:templateexpr="foo.bar.moo">moomoo</span>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  This should fail - it's looking for foo.bar, but we supply foo.baz
        templateStr = '<ul>{{:if foo.bar}}<li>{{goo}}</li><li>{{moo}}</li>{{/:if}}</ul> and then there\'s: {{foo.bar.moo}}';

        testRep = templateStr.transform(TP.hc('foo', TP.hc('baz', TP.hc('goo', 'googoo', 'moo', 'moomoo'))));

        correctRep = '<ul><span tibet:templateexpr="foo.bar"></span></ul> and then there\'s: <span tibet:templateexpr="foo.bar.moo"></span>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  The {{:if}}...{{:else}}...{{/:if}} statement, which tests its
        //  expression for existence and runs the 'else' block if the target
        //  doesn't exist.
        //  ---

        templateStr = '<ul>{{:if foo.bar}}<li>This is goo: {{goo}}</li>{{:else}}<li>This is moo:{{foo.baz.moo}}</li>{{/:if}}</ul>';

        testRep = templateStr.transform(TP.hc('foo', TP.hc('bar', TP.hc('goo', 'googoo', 'moo', 'moomoo'))));

        correctRep = '<ul><span tibet:templateexpr="foo.bar"><li>This is goo: googoo</li></span></ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  This should fail - it's looking for foo.bar, but we supply foo.baz
        templateStr = '<ul>{{:if foo.bar}}<li>This is goo: {{goo}}</li>{{:else}}<li>This is moo: {{$INPUT.foo.baz.moo}}</li>{{/:if}}</ul>';

        testRep = templateStr.transform(TP.hc('foo', TP.hc('baz', TP.hc('goo', 'googoo', 'moo', 'moomoo'))));

        correctRep = '<ul><span tibet:templateexpr="foo.bar"><li>This is moo: moomoo</li></span></ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        //  'if' expression contains relative path
        templateStr = '<span {{:if ./label}}haslabel="true"{{/:if}}><span>More stuff</span></span>';

        testRep = templateStr.transform(TP.elem('<foo><label/></foo>'));

        correctRep = '<span haslabel="true"><span>More stuff</span></span>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  The {{:for}}...{{/:for}} statement, which iterates over the
        //  collection returned by its expression
        //  ---

        templateStr = '<ul>{{:for foo}}<li><span>{{goo}}</span><span>{{moo}}</span></li>{{/:for}}</ul>';

        testRep = templateStr.transform(TP.hc('foo', TP.ac(TP.hc('goo', 'googoo1', 'moo', 'moomoo1'), TP.hc('goo', 'googoo2', 'moo', 'moomoo2'))));

        correctRep = '<ul><span tibet:templateexpr="foo"><li><span>googoo1</span><span>moomoo1</span></li><li><span>googoo2</span><span>moomoo2</span></li></span></ul>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  The {{:for}}...{{/:for}} statement also sets up the 'item' and
        //  'index' expressions for use within the block
        //  ---

        templateStr = 'Hello {{world}}. {{:for words}}{{item}} is at: {{index}} {{/:for}}';

        testRep = templateStr.transform(TP.hc('world', 'Earth', 'words', TP.ac('Where', 'will', 'we', 'go?')));

        correctRep = 'Hello Earth. Where is at: 0 will is at: 1 we is at: 2 go? is at: 3 ';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  The {{:for}}...{{/:for}} statement can also use user-defined names
        //  for the 'item' and 'index' expressions. In this example, 'a' is the
        //  'item' and 'b' is the 'index'
        //  ---

        templateStr = 'Hello {{world}}. {{:for (a,b) words}}{{a}} is at: {{b}} {{/:for}}';

        testRep = templateStr.transform(TP.hc('world', 'Earth', 'words', TP.ac('Where', 'will', 'we', 'go?')));

        correctRep = 'Hello Earth. Where is at: 0 will is at: 1 we is at: 2 go? is at: 3 ';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using variables in a non-iterating context', function(test, options) {

        var templateStr,
            srcObj,

            testRep,
            correctRep,

            dataElem;

        //  ---
        //  $INPUT is the original input to the template
        //  ---

        templateStr = 'The item is: {{$INPUT .% String}}';
        srcObj = TP.hc('lastName', 'Edney');

        testRep = templateStr.transform(srcObj);

        correctRep = 'The item is: lastName => Edney';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  $_ has the same value as $INPUT to a non-iterating template
        //  ---

        templateStr = 'The item is: {{$_ .% String}}';
        srcObj = TP.hc('lastName', 'Edney');

        testRep = templateStr.transform(srcObj);

        correctRep = 'The item is: lastName => Edney';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  $TAG is the TP.dom.ElementNode that is supplied to the template.
        //  Note that in the case of nested templates, $TAG shifts to be
        //  whatever markup is being processed at that time. To access the
        //  original, authored markup that started the templating process, use
        //  $SOURCE>
        //  ---

        templateStr = 'The item is: {{$TAG .% String}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: <foo><baz bar="moo"/></foo>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  A user-supplied variable, in this case a Function named '$FUNC' that
        //  will execute when accessed. User-supplied variables don't have to be
        //  Functions, but this is a nice convenience to avoid pre-computing
        //  values.
        //  ---

        templateStr = 'The item is: {{$FUNC .% String}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$FUNC',
                                                    function(params) {
                                                        return dataElem;
                                                    }));

        correctRep = 'The item is: <foo><baz bar="moo"/></foo>';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  {{:with}}...{{/:with}} statements work with variables too.
        //  ---

        templateStr = 'The item is: {{:with $TAG}}{{localName}}{{/:with}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: foo';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{:with $TAG}}{{./*[@bar] .% {{localName}}}}{{/:with}}';

        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{:with $TAG}}{{(./*[@bar]).localName}}{{/:with}}';

        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{:with $TAG}}{{(./*[@bar]).localName .% String}}{{/:with}}';

        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Variables can be accessed as part of an access path
        //  ---

        templateStr = 'The item is: {{$TAG.localName}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: foo';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Variables can be accessed as part of an access path and formatted
        //  ---

        templateStr = 'The item is: {{$TAG.localName .% String}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: foo';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Variables can be part of a formatter chain, including ones
        //  containing nested templates.
        //  ---

        templateStr = 'The item is: {{$TAG .% {{./*[@bar] .% {{localName}}}}}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{$TAG .% {{./*[@bar] .% {{localName}} .% String}}}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{$TAG .% {{./*[@bar]}}}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = /The item is: <baz bar="moo"(.*?)\/>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{$TAG .% {{./*[@bar] .% String}}}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = /The item is: <baz bar="moo"(.*?)\/>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Variables can be accessed as part of an composite access path
        //  ---

        templateStr = 'The item is: {{$TAG.(./*[@bar])}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = /The item is: <baz bar="moo"(.*?)\/>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---
        //  Variables can be accessed as part of an composite access path and
        //  formatted
        //  ---

        templateStr = 'The item is: {{$TAG.(./*[@bar]) .% String}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = /The item is: <baz bar="moo"(.*?)\/>/;

        test.assert.matches(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{$TAG.(./*[@bar]).localName}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{$TAG.(./*[@bar]).localName .% String}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$TAG', dataElem));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));

        //  ---

        templateStr = 'The item is: {{$FUNC.(./*[@bar]).localName}}';
        dataElem = TP.tpelem('<foo><baz bar="moo"/></foo>');

        testRep = templateStr.transform(null, TP.hc('$FUNC',
                                                    function(params) {
                                                        return dataElem;
                                                    }));

        correctRep = 'The item is: baz';

        test.assert.isEqualTo(
            testRep,
            correctRep,
            TP.sc(testRep + ' and ' + correctRep + ' should be equivalent.'));
    });

    //  ------------------------------------------------------------------------

    this.it('Meta objects \'as\' method using variables in a iterating context', function(test, options) {
        //  empty
    }).todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
