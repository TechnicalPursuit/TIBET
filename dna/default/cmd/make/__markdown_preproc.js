(function() {
    'use strict';

    var sechead,
        secfoot;

    //  NOTE: this should be equivalent to the `sechead` and `secfoot` partials
    sechead = '<div class="container" markdown="1">\n' +
        '<div class="row justify-content-center" markdown="1">\n' +
        '<div class="col-12 col-md-12 col-lg-10 col-xl-8" markdown="1">';
    secfoot = '</div>\n</div>\n</div>';

    module.exports = function(markdown) {
        var re,
            lines,
            buffer,
            chunks,
            result;

        re = /^(\s){0,3}(---|___){1}(-|_)*(\s)*$/;

        result = '';

        chunks = [];
        lines = markdown.split(/\n/);

        buffer = '';
        lines.forEach(function(line) {
            if (re.test(line)) {
                chunks.push(buffer);
                buffer = '';
            } else {
                buffer += line + '\n';
            }
        });

        //  Be sure to push any "leftover text" in buffer.
        if (buffer) {
            chunks.push(buffer);
        }

        chunks.forEach(function(chunk) {
            result += sechead + chunk + secfoot;
        });

        return result;
    };

}());

