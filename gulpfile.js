var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber"); // Позволяет не перерывать процесс во время ошибок в коде
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var flexbugs = require("postcss-flexbugs-fixes");
var uncss = require("gulp-uncss");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var htmlmin = require("gulp-htmlmin");
var htmlhint = require("gulp-htmlhint");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var del = require("del");
var server = require("browser-sync").create(); // Create создает сервер для плагина

gulp.task("style", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      flexbugs()
    ]))
    .pipe(minify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream()); // Просит browser-sync перерисовать css
});

gulp.task("images", function () {
  return gulp.src("source/img/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 80, progressive: true}),
      imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/*.{png, jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(posthtml([
      include() // <include src="source/img/sprite.svg"></include>
    ]))
    .pipe(gulp.dest("source")); 
});

gulp.task("htmlmin", function () {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ 
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest("build"));
});

// gulp.task("cssLibs", function() {
//   return gulp.src([
//     "node_modules/normalize.css/normalize.css",
//     "node_modules/slick-carousel/slick/slick.css",
//     "source/sass/libs/wow-animate.scss"
//   ])
//     .pipe(concat("_libs.scss"))
//     .pipe(gulp.dest("source/sass"))
// });

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("source/js"))
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/css/*.css",
    "source/js/**"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("del", function () {
  return del("build");
});

gulp.task("server", function() {
  server.init({
      server: {
          baseDir: "source/"
      }
  });
});

gulp.task("clear", function () {
	return cache.clearAll();
})

gulp.task("watch", function () {
  gulp.watch("source/sass/**/*.scss", gulp.parallel("style"));
  gulp.watch("source/*.html").on("change", server.reload);
  gulp.watch("source/js/*.js").on("change", server.reload);
});

gulp.task("build", gulp.series("del", "copy", "images", "htmlmin"));

gulp.task("default", gulp.parallel("watch", "server", "style", "html"));