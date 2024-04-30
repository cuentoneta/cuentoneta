/* eslint-disable */
export default {
	displayName: 'cuentoneta',
	preset: './jest.preset.js',
	setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
	coverageDirectory: './coverage/cuentoneta',
	transform: {
		'\\.(html|svg)$': [
			'ts-jest',
			{
				tsConfig: '<rootDir>/tsconfig.spec.json',
				stringifyContentPathRegex: '\\.(html|svg)$',
			},
		],
		'^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
	},
	transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
	snapshotSerializers: [
		'jest-preset-angular/build/serializers/no-ng-attributes',
		'jest-preset-angular/build/serializers/ng-snapshot',
		'jest-preset-angular/build/serializers/html-comment',
	],
	testMatch: ['**/+(*.)+(spec|test).[tj]s?(x)'],
};
