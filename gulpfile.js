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

// 默认执行的命令
// gulp.task('default', gulp.series('jshint', 'minifyjs', async function () {
//     console.log('打包完成..')
// }))

// 默认执行的命令
// gulp.task('default', gulp.series('jshint', 'minifyjs',  function (done) {
//     console.log('打包完成..')
//     done()
// }))

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
	;(watcherjs = gulp.watch(['src/js/*'])),
		watcherjs.on('minify-js', (path, stats) => {
			console.log(`File ${path} was minify`)
		}) //监听js变化
	// gulp.watch('src/js/*', ['minify-js'])
	// gulp.watch('src/css/*', ['minify-css']) //监听css文件变化
	// gulp.watch('src/image/*', ['minifg-img']) //监听image变化
	watcher.close()
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
