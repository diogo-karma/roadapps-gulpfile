/*!
 * gulpFile for Assets
 * Copyright (C) 2014 RoadApps.net
 * version: 0.1.1
 * author: Nechtan <http://hax0r.in>
 * Licensed under the MIT license
 */

process.env.ENV = process.env.ENV || 'development';

var pkg = require('./package.json');

var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var insert = require('gulp-insert');

var by = process.env.BY || 'nechtan';
var version = pkg.version || '1.0.0';

var paths = {
  preStyles: [
    './public/prebuild/css/**/*.css'
  ],
  appStyles: [
    'app/browser/css/**/*.css'
  ],
  appJavascripts: ['app/browser/js/**/*.js'],
  vendorJavascripts: [
    'public/prebuild/js/**/*.js'
  ],
  dest: './public/app',
}

paths.destApp = {
  js: {
    file: paths.dest + '/js/' + pkg.name + '.' + version + '.min.js',
    name: pkg.name + '.' + version + '.min.js'
  },
  css: {
    file: paths.dest + '/css/' + pkg.name + version + '.min.css',
    name: pkg.name + '.' + version + '.min.css'
  }
};

var d = new Date();
var now = ''.
concat(
  d.getDate(), '/', d.getMonth() + 1, '/', d.getFullYear(), ' ',
  d.getHours(), ':', d.getMinutes()
);

var banner = ''.concat(
  '/*! Copyright (C) 2014 RoadApps.net', '\n',
  ' *! #', by, ' - ' + version + ' - ', now, ' */\n');

gulp.task('app-clean', function() {
  return gulp.src([
      paths.dest + '/css/*.css',
      paths.dest + '/js/*.js'
    ], {
      read: false
    })
    .pipe(clean());
});

gulp.task('app-css', function() {
  return gulp.src(paths.appStyles)
    .pipe(concat('app.css'))
    .pipe(gulp.dest(paths.dest + '/css'));
});

gulp.task('vendor-css', function() {
  return gulp.src(paths.preStyles)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(paths.dest + '/css'));
});

gulp.task('app-css-min', ['app-css'], function() {
  return gulp.src(paths.dest + '/css/app.css')
    .pipe(cssmin())
    .pipe(rename({
      suffix: '.' + version + '.min'
    }))
    .pipe(gulp.dest(paths.dest + '/css'));
});

gulp.task('vendor-css-min', ['vendor-css'], function() {
  return gulp.src(paths.dest + '/css/vendor.css')
    .pipe(cssmin())
    .pipe(rename({
      suffix: '.' + version + '.min'
    }))
    .pipe(gulp.dest(paths.dest + '/css'));
});

gulp.task('create-app-css', ['app-css-min', 'vendor-css-min'], function() {
  return gulp.src([
      paths.dest + '/css/vendor.css',
      paths.dest + '/css/app.css'
    ])
    .pipe(concat(paths.destApp.css.name))
    .pipe(cssmin())
    .pipe(insert.prepend(banner))
    .pipe(gulp.dest(paths.dest + '/css'));
});

gulp.task('combine-vendor-js', function() {
  return gulp.src(paths.vendorJavascripts)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.dest + '/js/'));
});

gulp.task('combine-app-js', function() {
  return gulp.src(paths.appJavascripts)
    .pipe(concat('app.js', {
      newline: ';'
    }))
    .pipe(gulp.dest(paths.dest + '/js'));
});

gulp.task('uglify-vendor-js', ['combine-vendor-js'], function() {
  return gulp.src(paths.dest + '/js/vendor.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.' + version + '.min'
    }))
    .pipe(gulp.dest(paths.dest + '/js'));
});

gulp.task('uglify-app-js', ['combine-app-js'], function() {
  return gulp.src(paths.dest + '/js/app.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.' + version + '.min'
    }))
    .pipe(gulp.dest(paths.dest + '/js'))
});

gulp.task('create-app-js', ['uglify-vendor-js', 'uglify-app-js'], function() {
  return gulp.src([
      paths.dest + '/js/vendor.' + version + '.min.js',
      paths.dest + '/js/app.' + version + '.min.js'
    ])
    .pipe(concat(paths.destApp.js.name))
    .pipe(insert.prepend(banner))
    .pipe(gulp.dest(paths.dest + '/js'));
});

gulp.task('watch', function() {
  gulp.watch([
    paths.preStyles,
    paths.appJavascripts,
    paths.vendorJavascripts
  ], ['assets']);
});

gulp.task('assets', ['create-app-css', 'create-app-js'], function() {
  gutil.log('js:', gutil.colors.blue('✔ ') + 'vendor.' + version + '.min.js');
  gutil.log('js:', gutil.colors.blue('✔ ') + 'app.' + version + '.min.js');
  gutil.log('js:', gutil.colors.blue('✔ ') + paths.destApp.js.name);
  gutil.log('css:', gutil.colors.blue('✔ ') + paths.destApp.css.name);
});

gulp.task('default', ['assets']);
