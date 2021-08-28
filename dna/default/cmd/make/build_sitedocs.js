(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        var content,
            genSite,
            list,
            options,
            splitter,
            docspath,
            rootpath,
            sitesrc,
            siteout,
            preproc,
            showdown,
            converter,
            paths,
            partialspath,
            version,
            year;

        //  ---
        //  Verify Directories
        //  ---

        preproc = require('./__markdown_preproc.js');

        showdown = require('showdown');
        converter = new showdown.Converter();
        converter.setOption('tables', true);

        make.log('building site documentation...');

        rootpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'doc');

        docspath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'public',
            'docs');

        partialspath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'views',
            'partials');

        //  load any partials and get them registered so they can be used
        //  in the preprocessor and/or template logic.
        if (make.sh.test('-d', partialspath)) {
            list = make.sh.ls(partialspath);
            list.forEach(function(file) {
                var filename,
                    name,
                    partial,
                    filepath;

                filename = file.toString();
                filepath = make.CLI.joinPaths(partialspath, filename);
                name = filename.replace('.handlebars', '');
                partial = make.sh.cat(filepath).toString();
                try {
                    make.CLI.debug('Loading partial ' + name + '...');
                    make.template.registerPartial(name, partial);
                } catch (e) {
                    make.CLI.error('Error loading partial ' + name + ': ' + e);
                }
            });
        }

        //  site page content and "standard docs" live in the top-level
        //  doc/sources dir
        sitesrc = make.CLI.joinPaths(rootpath, 'markdown', 'sitepages');
        if (!make.sh.test('-d', sitesrc)) {
            reject('Unable to find html doc source directory: ' + sitesrc);
            return;
        }

        //  site/core docs sit in the public docs directory.
        siteout = docspath;
        if (!make.sh.test('-d', siteout)) {
            make.sh.mkdir(siteout);
        }

        //  ---
        //  Helpers
        //  ---

        genSite = function(file, params) {
            var html,
                header,
                footer,
                destdir,
                destfile,
                result,
                srcfile;

            //  HTML generation uses common header/footer since output from the
            //  conversion process doesn't include html/body, just "content".
            header = make.sh.cat(make.CLI.joinPaths(rootpath, 'template',
                'sitedoc-header.html')).toString();
            header = make.template.compile(header);
            footer = make.sh.cat(make.CLI.joinPaths(rootpath, 'template',
                'sitedoc-footer.html')).toString();
            footer = make.template.compile(footer);

            srcfile = make.CLI.joinPaths(sitesrc, file + '.tmp');

            //  Compute the HTML target file path, removing .md extension.
            destfile = make.CLI.joinPaths(siteout, file);
            destfile = destfile.slice(0, destfile.lastIndexOf('.')) + '.html';

            //  Compute target directory value and make sure it exists.
            destdir = destfile.slice(0, destfile.lastIndexOf('/'));
            if (!make.sh.test('-d', destdir)) {
                make.sh.mkdir(destdir);
            }

            content = make.sh.cat(srcfile).toString();
            content = preproc(content);

            result = converter.makeHtml(content);

            html = header(params) + result + footer(params);

            //  strip out markdown "flag" once markdown is processed.
            html = html.replace(/ markdown="1"/g, '');

            html.to(destfile);
        };

        //  ---
        //  Process Files
        //  ---

        //  find only the various markdown files, they're our source data.
        splitter = /^(.*)\.(\d)\.md$/;

        //  We splice in year and version for copyright etc. so capture once.
        year = new Date().getFullYear();
        version = make.CLI.cfg('tibet.version');

        paths = [
            {path: sitesrc, gen: genSite}
        ];

        paths.forEach(function(item) {
            var srcpath,
                generator;

            srcpath = item.path;
            generator = item.gen;

            //  Markdown directory should be flat but just in case do a
            //  recursive listing. We'll filter out directories in the loop.
            list = make.sh.ls('-R', srcpath);
            list.forEach(function(file) {
                var filename,
                    parts,
                    section,
                    srcfile,
                    template,
                    tempfile,
                    page,
                    topic;

                filename = file.toString();

                if (!/\.md$/.test(filename)) {
                    make.warn('Skipping non-markdown source: ' + filename);
                    return;
                }

                //  Skip directories, just process individual files.
                srcfile = make.CLI.joinPaths(srcpath, filename);
                if (make.sh.test('-d', srcfile)) {
                    return;
                }

                //  Pull file name apart. Should be topic.section.md.
                parts = splitter.exec(filename);
                if (!parts) {
                    parts = /^(.*)\.md$/.exec(filename);
                    if (!parts) {
                        make.warn('Filename ' + filename +
                            ' failed to match name pattern.');
                        return;
                    }
                }
                topic = parts[1];
                section = parts[2];
                page = filename.slice(0, filename.indexOf('.'));

                options = {
                    page: page,
                    topic: topic,
                    section: section,
                    version: version,
                    year: year
                };

                try {
                    content = make.sh.cat(srcfile).toString();
                    template = make.template.compile(content);
                    content = template(options);

                    make.info('processing ' +
                            filename.slice(0, filename.lastIndexOf('.')));

                    tempfile = srcfile + '.tmp';
                    content.to(tempfile);

                    generator(filename, options);
                } catch (e) {
                    make.error('Error processing ' + filename + ': ' + e.message);
                } finally {
                    if (tempfile) {
                        make.sh.rm('-f', tempfile);
                    }
                }
            });

        });

        //  ---
        //  Wrapup
        //  ---

        resolve();
    };

}());
