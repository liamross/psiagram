module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	globals: {
		window: {},
	},
	testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};
