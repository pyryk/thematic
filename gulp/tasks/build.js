var gulp = require('gulp');

gulp.task('build', ['browserify', 'libify', 'libify-min', 'sass', 'images', 'markup']);
