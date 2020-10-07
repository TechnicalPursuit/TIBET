(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {

        var content,
            footer,
            clean,
            fullpath,
            genHtml,
            genMan,
            header,
            htmlpath,
            index,
            indexbody,
            finalstr,
            indexpath,
            list,
            cmdopts,
            options,
            splitter,
            manpath,
            rootpath,
            srcpath,
            version,
            year;

        //  ---
        //  Verify Directories
        //  ---

        make.log('building project documentation...');

        clean = make.getArgument('clean');
        if (clean) {
            fullpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'doc', 'html');
            if (make.sh.test('-d', fullpath)) {
                make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
            }

            fullpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'doc', 'man');
            if (make.sh.test('-d', fullpath)) {
                make.sh.rm('-rf', make.CLI.joinPaths(fullpath, '*'));
            }
        }

        rootpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'doc');
        srcpath = make.CLI.joinPaths(rootpath, 'markdown');

        if (!make.sh.test('-d', srcpath)) {
            reject('Unable to find doc source directory.');
            return;
        }

        htmlpath = make.CLI.joinPaths(rootpath, 'html');
        if (!make.sh.test('-d', htmlpath)) {
            make.sh.mkdir(htmlpath);
        }

        manpath = make.CLI.joinPaths(rootpath, 'man');
        if (!make.sh.test('-d', manpath)) {
            make.sh.mkdir(manpath);
        }

        //  HTML generation uses common header/footer since output from the
        //  conversion process doesn't include html/body, just "content".
        header = make.sh.cat(make.CLI.joinPaths(rootpath,
            'template', 'header.html')).toString();
        header = make.template.compile(header);
        footer = make.sh.cat(make.CLI.joinPaths(rootpath,
            'template', 'footer.html')).toString();
        footer = make.template.compile(footer);

        //  ---
        //  Helpers
        //  ---

        genHtml = function(file, params) {
            var html,
                destdir,
                destfile,
                result,
                srcfile;

            srcfile = make.CLI.joinPaths(srcpath, file + '.tmp');

            //  Compute the HTML target file path, removing .md extension.
            destfile = make.CLI.joinPaths(htmlpath, file);
            destfile = destfile.slice(0, destfile.lastIndexOf('.')) + '.html';

            //  Compute target directory value and make sure it exists.
            destdir = destfile.slice(0, destfile.lastIndexOf('/'));
            if (!make.sh.test('-d', destdir)) {
                make.sh.mkdir(destdir);
            }

            result = make.nodecli.exec('marked-man', '--format html',
                srcfile, {silent: true});

            if (result.code !== 0) {
                make.error('Unable to generate HTML documentation: ' +
                    result.output);
                return;
            }

            html = header(params) + result.output + footer(params);

            //  One last substitution is to look for variations on 'foo(n)'
            //  and convert them into links which point to the target page.
            html = html.replace(/([-_a-zA-Z]+)\((\d+)\)/g,
            function(match, topic, section) {
                if (topic === params.topic) {
                    return match;
                }

                return '<a class="crossref" href="./' + topic + '.' +
                    section + '.html">' + topic + '(' + section + ')' + '</a>';
            });

            new make.sh.ShellString(html).to(destfile);
        };

        genMan = function(file, params) {
            var man,
                destdir,
                destfile,
                result,
                srcfile;

            srcfile = make.CLI.joinPaths(srcpath, file + '.tmp');

            //  Compute the manpage target file path, removing .md extension.
            destfile = make.CLI.joinPaths(manpath, 'man' + params.section, file);
            destfile = destfile.slice(0, destfile.lastIndexOf('.'));

            //  Compute target directory value and make sure it exists.
            destdir = make.CLI.joinPaths(manpath, 'man' + params.section);
            if (!make.sh.test('-d', destdir)) {
                make.sh.mkdir(destdir);
            }

            result = make.nodecli.exec('marked-man', '--roff',
                srcfile, {silent: true});

            if (result.code !== 0) {
                //  TODO:   oops
                return;
            }

            man = result.output;
            new make.sh.ShellString(man).to(destfile);
        };

        //  ---
        //  Process Files
        //  ---

        //  File names in markdown directory should be of the form
        //  topic.section.md so we can extract and splice.
        splitter = /^(.*)\.(\d)\.md$/;

        //  We splice in year and version for copyright etc. so capture once.
        year = new Date().getFullYear();
        version = make.CLI.cfg('npm.version');

        cmdopts = make.reparse({boolean: 'force'});

        //  Create an array we can keep the list of content in.
        index = [];

        //  Markdown directory should be flat but just in case do a
        //  recursive listing. We'll filter out directories in the loop.
        list = make.sh.ls('-R', srcpath);

        //  Process each file, producing both a man page and HTML document.
        list.forEach(function(file) {
            var filename,

                parts,
                section,
                srcfile,
                template,
                tempfile,
                destfile,
                topic;

            filename = file.toString();

            //  Skip directories, just process individual files.
            srcfile = make.CLI.joinPaths(srcpath, filename);
            if (make.sh.test('-d', srcfile)) {
                return;
            }

            //  Pull file name apart. Should be topic.section.md.
            parts = splitter.exec(filename);
            if (!parts) {
                make.warn('Filename ' + filename + ' missing topic or section.');
                return;
            }
            topic = parts[1];
            section = parts[2];

            options = {
                topic: topic,
                section: section,
                version: version,
                year: year
            };

            //  Check target file and if it's more current skip this file.
            destfile = make.CLI.joinPaths(manpath, 'man' + options.section, filename);
            destfile = destfile.slice(0, destfile.lastIndexOf('.'));

            try {
                content = make.sh.cat(srcfile).toString();
                template = make.template.compile(content);
                content = template(options);

                //  NOTE this depends on first line being the # \{{topic}} line.
                options.firstline = content.split('\n')[0];
                index.push(JSON.parse(JSON.stringify(options)));

                if (!cmdopts.force && !make.CLI.isFileNewer(srcfile, destfile)) {
                    return;
                } else {
                    make.info('processing ' +
                        filename.slice(0, filename.lastIndexOf('.')));
                }

                tempfile = srcfile + '.tmp';
                new make.sh.ShellString(content).to(tempfile);

                genMan(filename, options);
                genHtml(filename, options);
            } catch (e) {
                make.error('Error processing ' + filename + ': ' + e.message);
            } finally {
                if (tempfile) {
                    make.sh.rm('-f', tempfile);
                }
            }
        });

        //  ---
        //  index.html
        //  ---

        indexpath = make.CLI.joinPaths(htmlpath, 'index.html');

        options = {
            topic: make.getcfg('project.name'),
            section: 1,
            version: version,
            year: year
        };

        //  Sort alphabetically within sections.
        index.sort(function(paramA, paramB) {
            if (paramA.section < paramB.section) {
                return -1;
            } else if (paramA.section > paramB.section) {
                return 1;
            } else {
                if (paramA.topic < paramB.topic) {
                    return -1;
                } else if (paramA.topic > paramB.topic) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });

        //  Convert param form into markup. We use a DL to wrap below so we
        //  want each item returned here to be a dt/dd pair with a link to
        //  topic.
        indexbody = index.map(function(params) {
            var parts,
                str;

            parts = params.firstline.split('--');
            str = '<dt><a class="toc" href="./' +
                params.topic + '.' + params.section + '.html">' +
                parts[0] + '</a></dt><dd>-- ' + parts[1] + '</dd>';

            return str;
        });

        //  Assemble the final index.html page content by using the same
        //  header/footer as all other pages and our indexbody for content.
        finalstr = header(options) +
                     '<dl class="toc">\n' +
                     indexbody.join('<br/>') +
                     '</dl>\n' +
                     footer(options);

        new make.sh.ShellString(finalstr).to(indexpath);

        //  ---
        //  manpage index
        //  ---

        //  TODO

        //  ---
        //  Wrapup
        //  ---

        resolve();
    };

}());
