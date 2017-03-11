'use strict';

import gulp from 'gulp';
import nunjucks from 'gulp-nunjucks';
import concat from 'gulp-concat';
import child_process from 'child_process';

const outdir = "assets/";

gulp.task("js", ["templates"], () => {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/morphdom/dist/morphdom-umd.min.js',
    'assets/templates.js',
    'bower_components/nunjucks/browser/nunjucks-slim.min.js',
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
})


gulp.task('dev', function() {
    gulp.watch('todo/**/*.js', ['js']);
    gulp.watch('todo/templates/*.njk', ['js']);
});

gulp.task('default', ['js', ]);
