const { src, dest, watch, parallel, series } = require('gulp');
const fileInclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const gulpInclude = require('gulp-include');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const fs = require('fs');
const avif = require('gulp-avif');
// const avifWebpHTML = require('gulp-avif-webp-html');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();
const gulpClean = require('gulp-clean');
const notify = require('gulp-notify');
const webpCss = require('gulp-webp-css');


const srcPath = 'src/'
const distPath = 'dist/'
const path = {
  build: {
    html: distPath,
    css: distPath + 'css/',
    js: distPath + 'js/',
    images: distPath + 'images/',
    fonts: distPath + 'fonts/'
  },
  src: {
    html: srcPath + 'pages/*.html',
    css: srcPath + 'scss/*.scss',
    js: srcPath + 'js/*.js',
    images: srcPath + 'images/*.*',
    fonts: srcPath + 'fonts/*.*'
  },
  watch: {
    html: srcPath + '**/*.html',
    css: srcPath + 'scss/**/*.scss',
    js: srcPath + 'js/**/*.js',
    images: srcPath + 'images/*.*',
    fonts: srcPath + 'fonts/*.*'
  },
  clean: './' + distPath
}

function html() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(replace(/@images\//g, 'images/'))
    // .pipe(avifWebpHTML())
    .pipe(dest(srcPath))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream())
}

function fonts() {
  return src(path.src.fonts)
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))
    .pipe(src('src/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

function fontsStyle() {
  let srcFonts = 'src/scss/base/_local-fonts.scss';
  let appFonts = path.build.fonts;
  fs.writeFile(srcFonts, '', () => { });
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split('.');
        fontname = fontname[0];
        if (c_fontname != fontname) {
          fs.appendFile(srcFonts, `@include font-face("${fontname}", "${fontname}", 400);\r\n`, () => { });
        }
        c_fontname = fontname;
      }
    }
  })
}

function styles() {
  return src(path.src.css)
    .pipe(sourcemaps.init())
    .pipe(scss())
    .pipe(webpCss(['.jpg','.jpeg', '.png']))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 5 version'] }))
    .pipe(dest(path.build.css))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(sourcemaps.write())
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream())
}

function scripts() {
  return src(path.src.js)
    .pipe(gulpInclude())
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream())
}

function images() {
  return src([path.src.images, '!src/images/*.svg'])
    .pipe(newer(path.build.images))
    .pipe(avif({ quality: 75 }))
    .pipe(src([path.src.images, '!src/images/*.svg']))
    .pipe(newer(path.build.images))
    .pipe(webp())
    .pipe(src([path.src.images]))
    .pipe(newer(path.build.images))
    .pipe(imagemin())
    .pipe(dest(path.build.images))
}

function watching() {
  browserSync.init({
    server: {
      baseDir: './' + distPath
    }
  });
  watch([path.watch.html, '!src/*.html'], html)
  watch([path.watch.css], styles)
  watch([path.watch.js], scripts)
  watch([path.watch.images], images)
  watch([path.watch.fonts], fonts)
}

function clean() {
  return src(path.clean)
    .pipe(gulpClean())
}

exports.html = html;
exports.styles = styles;
exports.fonts = series(fonts, fontsStyle);
exports.images = images;
exports.scripts = scripts;
exports.watching = watching;
exports.clean = clean;

exports.default = series(parallel(html, images, styles, scripts, fonts), watching)