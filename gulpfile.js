'use strict';

import pkg from 'gulp';
const {
  src,
  dest,
  parallel, 
  series, 
  watch, 
} = pkg;

import pug from 'gulp-pug';
import htmlmin from 'gulp-htmlmin';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import svgmin from 'gulp-svgmin';
import imagemin from 'gulp-imagemin';
import imageminJpegRecompress from 'imagemin-jpeg-recompress';
import browserSync from 'browser-sync';

const paths = {
  dev: {
    html: 'dev/pug/index.pug',
    img: 'dev/img/*.{*, !svg}',
    svg: 'dev/img/svg/*',
    css: 'dev/sass/**/*.scss',
    js: 'dev/js/**/*',
  },
  build: {
    html: 'build/',
    svg: 'build/img/svg',
    css: 'build/css',
    img: 'build/img',
    js: 'build/js',
  },
  watch: {
    html: 'dev/pug/**/*',
  },
  serv: {
    html: 'build',
  },
};

function browsersync() {
  browserSync.init({
    server: {
      baseDir: paths.serv.html,
    },
  })
}

function html() {
  return src(paths.dev.html)
    .pipe(pug({ pretty: true, }))
    .pipe(htmlmin({ collapseWhitespace: true, })) 
    .pipe(dest(paths.build.html))
}

function css() {
  return src(paths.dev.css)
    .pipe(sass())
    .pipe(cleanCSS()) 
    .pipe(dest(paths.build.css))
    .pipe(browserSync.stream())
}

function js() {
  return src(paths.dev.js)
    .pipe(uglify())
    .pipe(dest(paths.build.js))
}

function svg() {
  return src(paths.dev.svg)
    .pipe(svgmin())
    .pipe(dest(paths.build.svg))
    .pipe(browserSync.stream())
}

function img() {
  return src(paths.dev.img)
    .pipe(imagemin([
      imageminJpegRecompress({
        loops: 6,
        min: 70,
        max: 85,
        quality: 'high',
      }),
    ]))
    .pipe(dest(paths.build.img))
    .pipe(browserSync.stream());
}

function startwatch() {
  watch(paths.watch.html, html);
  watch(paths.dev.css, css);
  watch(paths.dev.img, img);
  watch(paths.dev.svg, svg);
  watch(paths.dev.js, js);
  watch([paths.watch.html, paths.dev.js]).on('change', browserSync.reload);
}

export default series(html, css, svg, img, parallel(browsersync, startwatch));