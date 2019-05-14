const gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	jshint = require('gulp-jshint'),
	minifycss = require('gulp-minify-css'),
	WebServer = require('gulp-webserver'),
	clean = require('gulp-clean'),
	fileInclude = require('gulp-file-include'),
	watcher = gulp.watch(['src/css/*']),
	watcherjs = gulp.watch(['src/js/*']),
	Dist = 'build/public'

// 语法检查
gulp.task('jshint', cb => {
	gulp
		.src('src/js/*.js', { allowEmpty: true })
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
	cb()
})

// 压缩合并 js
gulp.task('minify-js', cb => {
	gulp
		.src('src/js/*.js', { allowEmpty: true }) //需要操作的文件
		.pipe(concat('main.js')) //合并所有js到main.js
		.pipe(gulp.dest(Dist + '/common/js')) //输出到文件夹
		.pipe(rename({ suffix: '.main' })) //rename压缩后的文件名
		.pipe(uglify()) //压缩
		.pipe(gulp.dest(Dist + '/js')) //输出
	cb()
})

// 打包html
gulp.task('minify-html', cb => {
	gulp
		.src('src/page/*.html', { allowEmpty: true })
		.pipe(
			fileInclude({
				prefix: '##',
				basepath: '@file'
			})
		)
		.on('error', function(err) {
			console.error('Task:minify-html,', err.messsage)
			this.end()
		})
		.pipe(gulp.dest(Dist))

	cb()
})
// 打包css
gulp.task('minify-css', cb => {
	gulp
		.src('src/css/*.css', { allowEmpty: true })
		.pipe(minifycss())
		.pipe(gulp.dest(Dist + '/css'))

	cb()
})

// 打包img
gulp.task('minify-img', cb => {
	gulp
		.src('src/image/*', { allowEmpty: true })
		.pipe(gulp.dest(Dist + '/images'))

	cb()
})

//自动构建，并刷新浏览器
//自动构建监听文件变化，然后打包最新的资源到build目录下
gulp.task('watch', cb => {
	watcher.on('minify-css', (path, stats) => {
		console.log(`File ${path} was minify`)
	}) //监听css变化

	watcherjs.on('minify-js', (path, stats) => {
		console.log(`File ${path} was minify`)
	}) //监听js变化
	watcher.close()
	watcherjs.close()
	cb()
})

//整合task
gulp.task(
	'minify-resource',
	gulp.parallel(
		'jshint',
		'minify-js',
		'minify-css',
		'minify-html',
		'minify-img'
	),
	cb => {
		cb()
	}
)

gulp.task('web-server', () => {
	// 实时监听build目录变化实现浏览器自动刷新
	gulp.src(Dist, { allowEmpty: true }).pipe(
		WebServer({
			port: 8080,
			host: 'localhost',
			livereload: true,
			open: 'http://localhost:8080/index.html'
		})
	)
})

gulp.task('clean', () => {
	return gulp.src(Dist, { allowEmpty: true }).pipe(clean())
})

gulp.task(
	'default',
	gulp.series('clean', gulp.parallel('minify-resource', 'watch'), 'web-server'),
	async function() {
		console.log('成功')
	}
)

/* 错误警告：Refused to execute inline script because it violates the following Content Security
 Policy directive: "default-src 'self'". Either the 'unsafe-inline' keyword, 
 a hash ('sha256-gpnLwpFw97DB28/JjA3G79AHgq5DtCgFiFwjahrA1d4='), 
 or a nonce ('nonce-...') is required to enable inline execution. 
 Note also that 'script-src' was not explicitly set, so 'default-src' is used as a fallback. */