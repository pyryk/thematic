var jshint = require('gulp-jshint');
var gulp   = require('gulp');

gulp.task('jshint', function() {
  return gulp.src('src/javascript/thematic/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});