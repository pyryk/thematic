var gulp = require('gulp');

gulp.task('build', ['browserify', 'libify', 'sass', 'images', 'markup']);
