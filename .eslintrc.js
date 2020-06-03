const path = require('path');

module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: path.resolve(__dirname, './tsconfig.json'), // Works for monorepos.
		ecmaVersion: 2020,
		sourceType: 'module',
		ecmaFeatures: {
			modules: true,
		},
	},
	env: {
		browser: true,
		jest: true,
		es6: true,
		node: true,
	},
	extends: ['eslint:recommended', 'prettier'],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			extends: [
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended',
				'prettier/@typescript-eslint',
			],
			rules: {
				// Off
				// '@typescript-eslint/no-explicit-any': 0,
				// '@typescript-eslint/no-non-null-assertion': 0,

				// On
				'@typescript-eslint/no-unused-vars': 2,
				'@typescript-eslint/unbound-method': 2,
				'@typescript-eslint/no-unused-vars': [2, {argsIgnorePattern: '^_'}],
				'@typescript-eslint/explicit-function-return-type': [2, {allowExpressions: true}],
			},
		},
		{
			files: ['**/scripts/**/*', '**/__tests__/**/*'],
			rules: {
				// Off
				'@typescript-eslint/no-var-requires': 0,
				'@typescript-eslint/explicit-function-return-type': 0,
				'@typescript-eslint/no-use-before-define': 0,
			},
		},
	],
};
