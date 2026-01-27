module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'next/core-web-vitals',
		'plugin:storybook/recommended',
	],
	plugins: ['@typescript-eslint/eslint-plugin'],
	parser: '@typescript-eslint/parser',
	ignorePatterns: ['.eslintrc'],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: false,
				argsIgnorePattern: '^_',
			},
		],
		'no-mixed-spaces-and-tabs': 'off',
		'max-len': [
			'warn',
			{
				code: 120,
			},
		],
		'no-console': 'warn',
		'no-alert': 'warn',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
	root: true,
	env: {
		node: true,
		jest: true,
	},
};
