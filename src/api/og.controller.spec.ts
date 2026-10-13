import ogController from './og.controller';

// Ejercita el render real de satori: es lo que una actualización del paquete puede romper, y el build
// solo prueba que el bundle se arma.
describe('ogController', () => {
	it.each([
		{ query: '', width: 1200, height: 630 },
		{ query: '?rrss=twitter', width: 1000, height: 523 },
		{ query: '?rrss=facebook', width: 1000, height: 1000 },
	])('renders an SVG of $width×$height for "$query"', async ({ query, width, height }) => {
		const response = await ogController.request(`/og${query}`);
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('image/svg+xml');
		expect(body).toMatch(new RegExp(`^<svg width="${width}" height="${height}"`));
	});
});
