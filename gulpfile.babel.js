'use strict';

import gulp from 'gulp';
import nunjucks from 'gulp-nunjucks';
import concat from 'gulp-concat';
import child_process from 'child_process';
import plumber from 'gulp-plumber';
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import notify from 'gulp-notify';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';

const outdir = "assets/";


var onError = function(err) {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);

    this.emit('end');
};


gulp.task('css', function() {
    return gulp.src('frontend/css/app.scss')
      .pipe(plumber({errorHandler: onError}))
      .pipe(sourcemaps.init())
      .pipe(sass({
          follow: true,
          outputStyle: "compressed"
      }))
      .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
      }))
      .pipe(sourcemaps.write('./maps'))
      .pipe(rename(function(path){
          path.extname = ".min" + path.extname;
          return path;
      }))
      .pipe(gulp.dest(outdir))
});


gulp.task("js", ["templates"], () => {
  return gulp.src([
    'frontend/node_modules/jquery/dist/jquery.min.js',
    'frontend/node_modules/morphdom/dist/morphdom-umd.min.js',
    'assets/templates.js',
    'frontend/node_modules/nunjucks/browser/nunjucks-slim.min.js',
    'frontend/node_modules/html5sortable/dist/html.sortable.min.js',
    'frontend/js/board.js',
  ])
  .pipe(concat('app.js'))
  .pipe(gulp.dest(outdir))
})

gulp.task("templates", () => {
  return gulp.src('frontend/templates/components/*.html')
      .pipe(nunjucks.precompile({
          name: function(f) {
              return `components\/${f.relative}`;
          }
      }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest(`${outdir}`))
});


gulp.task('watch', function() {
    gulp.watch('frontend/**/*.js', ['js']);
    gulp.watch('frontend/templates/components/*.html', ['js']);
    gulp.watch('frontend/**/*.scss', ['css']);
});

gulp.task('default', ['js', 'css']);
