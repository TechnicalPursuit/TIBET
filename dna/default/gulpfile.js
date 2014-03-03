/**
 */

//  ---
//  Gulp Components
//  ---

var gulp = require('gulp');

var clean = require('gulp-clean');
var concat = require('gulp-concat');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var log = require('gulp-util').log;
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//  ---
//  Additional Components
//  ---

var fs = require('fs');
var path = require('path');
var sh = require('shelljs');

var Package = require('./node_modules/tibet3/base/lib/tibet/src/tibet_package.js');

//  ---
//  Admin Tasks
//  ---

gulp.task('clean', function(){
    gulp.src('./build').pipe(clean());
});

// Canonical gulp default task.
gulp.task('default', function() {
    // No-op for now.
});

// 'tibet gulp' runs this :)
gulp.task('gulp', ['default']);

//  ---
//  Codebase Tasks
//  ---

gulp.task('lint', ['jshint']);

gulp.task('jshint', function() {

    var file,
        files,
        data;

    // Build file list so we can honor .jshintignore content.
    files = [];
    files.push('./src/**/*.js');
    file = path.join(process.cwd(), '.jshintignore');
    if (sh.test('-f', file)) {
        data = fs.readFileSync(file, {encoding: 'utf8'});
        if (!data) {
            throw new Error('NoData');
        }
        files = files.concat(data.split(/\n/).map(function(str) {
            return '!' + str;
        }));
    }

    gulp.src(files).
        pipe(jshint()).
        pipe(jshint.reporter());
});

//  ---
//  Rollup Tasks
//  ---

gulp.task('rollup-base', function(){

    var pkg,
        file,
        config;

    file = path.join(process.cwd(), 'TIBET-INF/tibet.xml');
    config = 'base';

    pkg = new Package({
        assets: 'echo property script',
        files: true,
        debug: true
    });

    pkg.setcfg('boot.phaseone', false);
    pkg.setcfg('boot.phasetwo', true);

    pkg.expandPackage(file, config);
    files = pkg.listPackageAssets(file, config);

    if (files.length == 0) {
        log('No files found to roll up.');
        return;
    }

    gulp.src(files).
        pipe(header('TP.boot.$truePath = \'<%= file.relative %>\';\n', {})).
        pipe(concat('app_base.js')).
        pipe(gulp.dest('./build'));

    gulp.src(files).
        pipe(header('TP.boot.$truePath = \'<%= file.relative %>\';\n', {})).
        pipe(uglify()).
        pipe(concat('app_base.min.js')).
        pipe(gulp.dest('./build'));
});

gulp.task('rollup', [
    'clean',
    'rollup-base'
]);

