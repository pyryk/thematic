/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var browserify   = require('browserify');
var watchify     = require('watchify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');

gulp.task('libify', function() {

  var production = (process.env.NODE_ENV === 'production');
  var bundleMethod = global.isWatching ? watchify : browserify;

  var bundler = bundleMethod({
    // Specify the entry point of your app
    entries: ['./src/javascript/thematic/index.js'],
    // Add file extentions to make optional in your requires
    extensions: ['.js'],
    // Enable source maps!
    debug: !production
  });

  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    return bundler
      .exclude('leaflet')
      .ignore('underscore')
      .exclude('../../../node_modules/leaflet/dist/leaflet.css')
      .bundle({
        debug: !production
      })
      // Report compile errors
      .on('error', handleErrors)
      // Use vinyl-source-stream to make the
      // stream gulp compatible. Specifiy the
      // desired output filename here.
      .pipe(source('index.js'))
      // Specify the output destination
      .pipe(gulp.dest('./build/'))
      // Log when bundling completes!
      .on('end', bundleLogger.end);
  };

  if(global.isWatching) {
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
});
