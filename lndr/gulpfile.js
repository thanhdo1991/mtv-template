const gulp         = require('gulp');
const plumber      = require('gulp-plumber');
const sass         = require('gulp-sass');
const sourcemaps   = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rename       = require('gulp-rename');
const browserSync  = require('browser-sync').create();
const mmq          = require('gulp-merge-media-queries');
const minifycss    = require('gulp-uglifycss');
const lec          = require('gulp-line-ending-corrector');
const notify       = require("gulp-notify");

const autoprefixerOptions = [
    'last 3 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
];

const dirs = {
    dist : './assets',
    node : './node_modules'
};

const browserSyncOptions = {

    // For more options
    // @link http://www.browsersync.io/docs/options/

    notify : false,

    // Project URL.
    // proxy : "sites.dev",

    server : {
        baseDir : "./"
    },

    // `true` Automatically open the browser with BrowserSync live server.
    // `false` Stop the browser from automatically opening.
    open : true,

    // Inject CSS changes.
    // Commnet it to reload browser for every CSS change.
    injectChanges : true,

    // Use a specific port (instead of the one auto-detected by Browsersync).
    // port: 7000,

};

// Styles

gulp.task('sass:dev', () =>
    gulp.src(`${dirs.dist}/sass/styles.scss`)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole : false,
            // outputStyle     : 'compact',
            //outputStyle     : 'compressed',
            // outputStyle: 'nested',
            outputStyle     : 'expanded',
            precision       : 10
        })).on('error', notify.onError({
            title   : "Sass Problem",
            message : "Check console for details. <%= error.message %>",
            icon    : './assets/img/icon-error.png'
        }))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(sourcemaps.write({includeContent : false}))
        .pipe(plumber.stop())
        .pipe(lec({verbose : true, eolc : 'LF', encoding : 'utf8'}))
        .pipe(gulp.dest(`${dirs.dist}/css`))
);

gulp.task('sass:build', () =>
    gulp.src(`${dirs.dist}/sass/styles.scss`)
        .pipe(plumber())
        .pipe(sass({
            errLogToConsole : true,
            //outputStyle     : 'compact',
            outputStyle     : 'compressed',
            // outputStyle: 'nested',
            // outputStyle: 'expanded',
            precision       : 10
        })).on('error', console.error.bind(console))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(mmq())
        .pipe(minifycss({
            "maxLineLen"   : 80,
            "uglyComments" : true
        }))
        .pipe(notify({
            title   : 'Build Successfully',
            message : "Sass file compiled: \"<%= file.relative %>\"",
            icon    : './assets/img/icon-success.png'
        }))
        .pipe(plumber.stop())
        //.pipe(sourcemaps.write({includeContent : false}))
        .pipe(rename({
            suffix : ".min"
        }))

        .pipe(lec({verbose : false, eolc : 'LF', encoding : 'utf8'}))
        .pipe(gulp.dest(`${dirs.dist}/css`))
);

gulp.task('sass:bundle', ['sass:dev', 'sass:build']);

gulp.task('browser-sync', () => browserSync.init(browserSyncOptions));

// npm run build | yarn build
gulp.task('build', ['sass:build']);

// npm run bundle | yarn bundle
gulp.task('bundle', ['sass:bundle']);

// npm run dev | yarn dev
gulp.task('dev', ['sass:dev', 'browser-sync'], () => {
    gulp.watch(`${dirs.dist}/js/**/*.js`, browserSync.reload);
    gulp.watch(`${dirs.dist}/sass/**/*.scss`, ['sass:dev', browserSync.reload]);
    gulp.watch('*.html', { readDelay: 500, verbose: true }, browserSync.reload);
});

// default task
gulp.task('default', ['dev']);
