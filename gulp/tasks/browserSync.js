var browserSync = require('browser-sync');
var gulp        = require('gulp');

gulp.task('browserSync', ['build'], function() {
  browserSync.init(['build/**'], {
  	open: false,
    server: {
      baseDir: ['build', 'src']
    }
  });
});
