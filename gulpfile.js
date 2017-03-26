'use strict'
const gulp = require('gulp');
const less = require('gulp-less');
//const concat = require('gulp-concat');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const multipipe = require('multipipe');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-csso');
const svgstore = require('gulp-svgstore');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp-spritesmith');
const rigger = require('gulp-rigger');
const fileinclude = require('gulp-file-include');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('styles', function() {
  return multipipe( 
    gulp.src('frontend/styles/main.less'),
    gulpIf(isDevelopment, sourcemaps.init()),
    less(),
    autoprefixer(['last 15 versions'], {cascade: true}),
    cssmin(),
    gulpIf(isDevelopment, sourcemaps.write()),
    gulp.dest('public')).on('error', notify.onError());
  
});

gulp.task('clean', function() {
  return del('public');
});

gulp.task('svgstore', function() {
  return multipipe(
    gulp.src('frontend/img/*.svg'),
    svgstore(),
    gulp.dest('frontend/img')).on('error', notify.onError());
});


gulp.task('imagemin', function() {
  return multipipe(
    gulp.src('frontend/assets/img/*'),
    imagemin(),
    gulp.dest('public/img')).on('error', notify.onError());
});

gulp.task('sprites', function () {
  return multipipe(
    gulp.src('frontend/img/sprite/*.png'),
    tasks.spritesmith({
      imgName: 'sprite.png',
      styleName: 'sprite.css',
      imgPath: 'frontend/img/sprite.png'
    }),
    gulpif('*.png', gulp.dest('frontend/img/')),
    gulpif('*.css', gulp.dest('frontend/css/'))).on('error', notify.onError());
});

gulp.task('fileinclude', function() {
  return multipipe(
    gulp.src('frontend/assets/*.html'),
    fileinclude({
      prefix: '@@',
      basepath: '@file'
    }),
    gulp.dest('public')).on('error', notify.onError());
});

gulp.task('assets', function() {
  return gulp.src('frontend/assets/**', {since: gulp.lastRun('assets')})
    .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'imagemin', 'fileinclude')));

gulp.task('watch', function() {
  gulp.watch('frontend/styles/**/*.*', gulp.series('styles'));

  gulp.watch('frontend/assets/*.html', gulp.series('fileinclude'));
  gulp.watch('frontend/assets/html_includes/*.html', gulp.series('fileinclude'));
});

gulp.task('serve', function() {
  browserSync.init({
    server: 'public'
  });
  
  browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
