'use strict';
var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    jsmin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    jsdoc = require('gulp-jsdoc3');

gulp.task('lint', function () {
    return gulp.src(['js/*.js'])
        .pipe(eslint())
        .pipe(eslint.failOnError())
        .pipe(eslint.formatEach());
});

gulp.task('jsdoc', function (cb) {
    // Consider using https://github.com/englercj/tsd-jsdoc to generate typescript definitions from JSDoc comments
    var config = require('./jsdoc.json');
    gulp.src(['README.md','./js/customEvents.js'], { read: false })
        .pipe(jsdoc(config, cb));
});
 
gulp.task('minify', function () {
    gulp.src('js/*.js')
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('js'));
});