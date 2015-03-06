var gulp = require('gulp');
var es6transpiler = require('gulp-es6-transpiler');

gulp.task('default', function () {
    gulp.src('scheduler.es6.js')
        .pipe(es6transpiler())
        .pipe(gulp.dest('dist'));
});