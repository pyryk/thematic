var gulp = require('gulp');
var sass = require('gulp-sass');
var handleErrors = require('../util/handleErrors');
var browserSync  = require('browser-sync');

gulp.task('sass', ['images'], function () {
  return gulp.src('src/sass/*.scss')
    .pipe(sass({
      compass: true,
      bundleExec: true,
      sourcemap: true,
      sourcemapPath: '../sass'
    }))
    .on('error', handleErrors)
    .pipe(gulp.dest('build'));
});
