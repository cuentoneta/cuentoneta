import 'jest-preset-angular/setup-jest';

let consoleSpy: jest.SpyInstance;
beforeAll(() => {
	consoleSpy = jest.spyOn(global.console, 'error').mockImplementation((message) => {
		if (!message?.message?.includes('Could not parse CSS stylesheet')) {
			global.console.warn(message);
		}
	});
});

afterAll(() => consoleSpy.mockRestore());