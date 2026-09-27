import type { UrlLink } from './link.model';

// La tipificación del ícono la evalúa el gate `typecheck`, que cubre los *.spec.ts. El caso válido
// y el inválido se sostienen entre sí: sin el primero, un `IconName` que no admitiera ningún nombre
// pasaría igual; sin el segundo, uno que admitiera cualquier string.
describe('UrlLink icon typing', () => {
	it('should accept a name declared by an installed icon set', () => {
		const link: UrlLink = {
			url: 'https://wa.me/',
			label: 'WhatsApp',
			ariaLabel: 'Escribinos por WhatsApp',
			icon: 'faBrandWhatsapp',
			alt: 'Logo de WhatsApp',
		};

		expect(link.icon).toBe('faBrandWhatsapp');
	});

	it('should reject a name that no installed icon set declares', () => {
		const link: UrlLink = {
			url: 'https://wa.me/',
			label: 'WhatsApp',
			ariaLabel: 'Escribinos por WhatsApp',
			// @ts-expect-error el nombre real es `faBrandWhatsapp`
			icon: 'faBrandWhatsApp',
			alt: 'Logo de WhatsApp',
		};

		expect(link.icon).toBe('faBrandWhatsApp');
	});
});
