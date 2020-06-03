import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import path from 'path';
import {terser} from 'rollup-plugin-terser';

export default {
	input: path.resolve(__dirname, 'dist/esm/index.js'),
	output: [
		{
			name: 'PsiagramPluginRouting',
			file: path.resolve(__dirname, 'dist/umd/dialect.js'),
			format: 'umd',
			plugins: [
				replace({
					values: {'process.env.NODE_ENV': JSON.stringify('development')},
					delimiters: ['', ''],
				}),
			],
		},
		{
			name: 'PsiagramPluginRouting',
			file: path.resolve(__dirname, 'dist/umd/dialect.min.js'),
			format: 'umd',
			plugins: [
				replace({
					values: {'process.env.NODE_ENV': JSON.stringify('production')},
					delimiters: ['', ''],
				}),
				terser(),
			],
		},
	],
	plugins: [resolve({browser: true}), commonjs()],
};
