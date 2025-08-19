'use strict';

const gulp = require('gulp');
const colors = require('ansi-colors');
const log = require('fancy-log');
const gulpTypescript = require('gulp-typescript');
const through2 = require('through2');
const rename = require('gulp-rename');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');

// TypeScript project (reads tsconfig.json)
const tsProject = gulpTypescript.createProject('tsconfig.json');

const decorator = [
	'/**',
	'----',
	'*',
	'* Custom Events v4.0.0 (2025-07-30)',
	'*',
	'* (c) 2012-2025 Black Label',
	'*',
	'* License: Creative Commons Attribution (CC)',
	'*/',
	''
];

// Step 1: Compile TS → JS (no wrapping yet)
gulp.task('tsc', () => {
	return gulp.src('ts/customEvents.ts')
		.pipe(tsProject())
		.js
		.pipe(rename('customEvents.js'))
		.pipe(gulp.dest('dist/tmp')); // Output to temp directory first
});

// Step 2: Wrap into UMD
gulp.task('wrap', () => {
	return gulp.src('dist/tmp/customEvents.js')
		.pipe(through2.obj(function (file, _encoding, callback) {
			if (file.isBuffer()) {
				let fileContent = file.contents.toString('utf8');

				// Strip ES imports/exports (keep function declarations)
				fileContent = fileContent
					.replace(/import (.+?) from ["'](.+?)["'];/g, '')
					.replace(/import ["'](.+?)["'];/g, '')
					.replace(/export default function ObjectEventsPlugin/g, 'function ObjectEventsPlugin')
					.replace(/export function /g, 'function ');

				// UMD wrapper
				const wrappedFileContent = decorator.join('\n') +
					`(function (factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(Highcharts);
  }
}(function (Highcharts) {
${fileContent}
ObjectEventsPlugin(Highcharts);
}));`;

				file.contents = Buffer.from(wrappedFileContent, 'utf8');
			}
			this.push(file);
			callback();
		}))
		.pipe(gulp.dest('dist'));
});

// Lint task using modern ESLint
gulp.task('lint', async () => {
	try {
		await execAsync('npx eslint ts/**/*.ts');
		log(colors.green('✓ ESLint passed'));
	} catch (error) {
		log(colors.red('✗ ESLint failed'));
		throw error;
	}
});
// Clean up temporary files
gulp.task('clean', (done) => {
	if (fs.existsSync('dist/tmp')) {
		fs.rmSync('dist/tmp', { recursive: true, force: true });
	}
	log(colors.green('✓ Cleaned temp files'));
	done();
});

// Combined build (lint → tsc → wrap → clean)
gulp.task('build', gulp.series('lint', 'tsc', 'wrap', 'clean'));

// Watch (skip lint for speed)
gulp.task('watch', () => {
	return gulp.watch('ts/**/*.ts', gulp.series('tsc', 'wrap'));
});



// Default task help
gulp.task('default', (done) => {
	log([
		'\n',
		colors.yellow('TASKS:'),
		colors.cyan('build    :') + ' lint, compile TS, and wrap in UMD',
		colors.cyan('tsc      :') + ' compile TS only (no wrapping)',
		colors.cyan('wrap     :') + ' wrap compiled JS in UMD',
		colors.cyan('watch    :') + ' watch TS files, recompile + wrap',
		''
	].join('\n'));
	done();
});
