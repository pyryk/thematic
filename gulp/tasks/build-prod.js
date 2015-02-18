var gulp = require('gulp');

gulp.task('build-prod', ['libify', 'libify-min', 'sass', 'images', 'markup']);
