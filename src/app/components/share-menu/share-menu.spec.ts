import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { advanceTimersByTime, clearAllMocks, fn, spyOn, useFakeTimers, useRealTimers } from '@test-utils';

import { ShareMenu } from './share-menu';

const SHARE_URL = 'https://cuentoneta.ar/literary-work/el-fin';
const SHARE_MESSAGE = 'Leí "El fin" de Jorge Luis Borges en La Cuentoneta y te lo comparto.';
const COPY_CONFIRMATION = 'Enlace copiado al portapapeles';

/**
 * happy-dom no implementa la Popover API: el panel se reconoce por su rol —es el único `menu`— y el
 * doble le agrega el cierre, porque el panel no se oculta solo ni emite `toggle`. Entre los dos cubren
 * las mitades que el componente consume —el estado y el evento que lo anuncia—; el comportamiento real
 * (light dismiss, `Escape`, top layer, anclaje) lo ejercita el e2e en un navegador.
 */
async function setup(url = SHARE_URL) {
	const view = await render(ShareMenu, { inputs: { url, message: SHARE_MESSAGE } });
	const trigger = screen.getByRole('button', { name: 'Compartir' });
	const panel = screen.getByRole('menu');
	const hidePopover = fn<() => void>();
	panel.hidePopover = hidePopover;

	return { ...view, trigger, panel, hidePopover };
}

/** El evento con el que la plataforma anuncia el estado nuevo del popover. */
function toggle(panel: HTMLElement, newState: 'open' | 'closed'): void {
	const event = new Event('toggle');
	Object.defineProperty(event, 'newState', { value: newState });
	panel.dispatchEvent(event);
}

const option = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

describe('ShareMenu', () => {
	beforeEach(() => clearAllMocks());

	afterEach(() => useRealTimers());

	it('should offer the trigger with the four destinations', async () => {
		await setup();

		expect(await screen.findByRole('button', { name: 'Compartir' })).toBeInTheDocument();
		expect(screen.getAllByRole('menuitem').map((item) => item.textContent?.trim())).toEqual([
			'Facebook',
			'Whatsapp',
			'X',
			'Copiar link',
		]);
	});

	it('should wire the panel to the trigger as a menu', async () => {
		const { trigger, panel } = await setup();

		expect(panel).toHaveAttribute('popover');
		expect(panel).toHaveRole('menu');
		expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
		expect(trigger).toHaveAttribute('popovertarget', panel.id);
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
	});

	it('should keep a separate popover per instance', async () => {
		await render(
			`<cuentoneta-share-menu [message]="message" [url]="url" /><cuentoneta-share-menu [message]="message" [url]="url" />`,
			{ imports: [ShareMenu], componentProperties: { url: SHARE_URL, message: SHARE_MESSAGE } },
		);

		const triggers = screen.getAllByRole('button', { name: 'Compartir' });
		const panels = screen.getAllByRole('menu');

		expect(panels).toHaveLength(2);
		expect(new Set(panels.map((panel) => panel.id)).size).toBe(2);
		expect(triggers[0]).toHaveAttribute('popovertarget', panels[0].id);
		expect(triggers[1]).toHaveAttribute('popovertarget', panels[1].id);
	});

	it('should announce the menu state on the trigger', async () => {
		const { detectChanges, trigger, panel } = await setup();
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		toggle(panel, 'open');
		detectChanges();
		expect(trigger).toHaveAttribute('aria-expanded', 'true');

		toggle(panel, 'closed');
		detectChanges();
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('should take the focus to the first destination when the menu opens', async () => {
		const { panel } = await setup();

		toggle(panel, 'open');

		expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
	});

	it('should close the menu when the focus leaves it with Tab', async () => {
		const user = userEvent.setup();
		const { panel, hidePopover } = await setup();
		toggle(panel, 'open');

		await user.keyboard('{ArrowDown}');
		await user.keyboard('{Tab}');

		expect(hidePopover).toHaveBeenCalledTimes(1);
	});

	it('should keep navigating when the key arrives at the panel instead of an option', async () => {
		const user = userEvent.setup();
		const { panel, hidePopover } = await setup();
		toggle(panel, 'open');

		panel.focus();
		await user.keyboard('{ArrowDown}');

		expect(screen.getByRole('menuitem', { name: 'Whatsapp' })).toHaveFocus();
		expect(hidePopover).not.toHaveBeenCalled();
	});

	it('should keep a single tab stop and move it with the arrow keys', async () => {
		const user = userEvent.setup();
		const { panel } = await setup();
		toggle(panel, 'open');

		const [facebook, whatsapp, , copy] = screen.getAllByRole('menuitem');
		expect(facebook).toHaveAttribute('tabindex', '0');
		expect(whatsapp).toHaveAttribute('tabindex', '-1');

		await user.keyboard('{ArrowDown}');
		expect(whatsapp).toHaveFocus();
		expect(facebook).toHaveAttribute('tabindex', '-1');
		expect(whatsapp).toHaveAttribute('tabindex', '0');

		await user.keyboard('{ArrowUp}');
		expect(facebook).toHaveFocus();

		await user.keyboard('{End}');
		expect(copy).toHaveFocus();

		await user.keyboard('{Home}');
		expect(facebook).toHaveFocus();

		await user.keyboard('{ArrowUp}');
		expect(copy).toHaveFocus();

		await user.keyboard('{ArrowDown}');
		expect(facebook).toHaveFocus();
	});

	it('should share the link with Facebook in its own window', async () => {
		const user = userEvent.setup();
		const open = spyOn(window, 'open').mockReturnValue(null);
		await setup();

		await user.click(option('Facebook'));

		expect(open).toHaveBeenCalledWith(
			`https://www.facebook.com/share.php?u=${encodeURIComponent(SHARE_URL)}`,
			'facebook-share-dialog',
			'width=626,height=436',
		);
	});

	it('should share the message and the link with Whatsapp', async () => {
		const user = userEvent.setup();
		const open = spyOn(window, 'open').mockReturnValue(null);
		await setup();

		await user.click(option('Whatsapp'));

		expect(open).toHaveBeenCalledWith(
			`whatsapp://send/?text=${encodeURIComponent(`${SHARE_MESSAGE}\n\n${SHARE_URL}`)}`,
			'_blank',
			'',
		);
	});

	it('should share the message and the link with X as separate parameters', async () => {
		const user = userEvent.setup();
		const open = spyOn(window, 'open').mockReturnValue(null);
		await setup();

		await user.click(option('X'));

		expect(open).toHaveBeenCalledWith(
			`https://twitter.com/intent/tweet?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(`${SHARE_MESSAGE}\n\n`)}`,
			'_blank',
			'',
		);
	});

	// El canonical viaja relativo en desarrollo: compartirlo tal cual dejaría un enlace que sólo
	// resuelve dentro del sitio.
	it('should complete the origin when the canonical arrives relative', async () => {
		const user = userEvent.setup();
		const open = spyOn(window, 'open').mockReturnValue(null);
		await setup('/literary-work/el-fin');

		await user.click(option('Facebook'));

		expect(open).toHaveBeenCalledWith(
			expect.stringContaining(encodeURIComponent(`${document.location.origin}/literary-work/el-fin`)),
			'facebook-share-dialog',
			'width=626,height=436',
		);
	});

	it('should close the menu after choosing a destination', async () => {
		const user = userEvent.setup();
		spyOn(window, 'open').mockReturnValue(null);
		const { hidePopover } = await setup();

		await user.click(option('X'));

		expect(hidePopover).toHaveBeenCalledTimes(1);
	});

	it('should copy the link to the clipboard and confirm it', async () => {
		const user = userEvent.setup();
		const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		const { detectChanges, hidePopover } = await setup();

		await user.click(option('Copiar link'));
		await detectChanges();

		expect(writeText).toHaveBeenCalledWith(SHARE_URL);
		expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent(COPY_CONFIRMATION);
		expect(hidePopover).toHaveBeenCalledTimes(1);
	});

	it('should return the trigger to its original label once the confirmation is read', async () => {
		const user = userEvent.setup({ advanceTimers: advanceTimersByTime });
		useFakeTimers();
		spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		const { detectChanges } = await setup();

		await user.click(option('Copiar link'));
		await detectChanges();
		expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument();

		advanceTimersByTime(3_000);
		await detectChanges();

		expect(screen.getByRole('button', { name: 'Compartir' })).toBeInTheDocument();
		expect(screen.getByRole('status').textContent?.trim()).toBe('');
	});

	it('should announce the failure when the clipboard rejects', async () => {
		const user = userEvent.setup();
		spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('permission denied'));
		const { detectChanges } = await setup();

		await user.click(option('Copiar link'));
		await detectChanges();

		expect(screen.getByRole('status')).toHaveTextContent('No se pudo copiar el enlace');
		expect(screen.getByRole('button', { name: 'Compartir' })).toBeInTheDocument();
	});
});
