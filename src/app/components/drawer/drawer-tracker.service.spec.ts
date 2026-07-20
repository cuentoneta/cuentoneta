import { DrawerTrackerService } from './drawer-tracker.service';
import type { DrawerComponent } from './drawer.component';

const drawerStub = (): DrawerComponent => ({}) as unknown as DrawerComponent;

describe('DrawerTrackerService', () => {
	it('should generate incrementing ids', () => {
		const tracker = new DrawerTrackerService();
		expect(tracker.nextId()).toBe(1);
		expect(tracker.nextId()).toBe(2);
	});

	it('should allow registering a single drawer', () => {
		const tracker = new DrawerTrackerService();
		expect(() => tracker.register(drawerStub())).not.toThrow();
	});

	it('should throw when a second drawer registers while one is active', () => {
		const tracker = new DrawerTrackerService();
		tracker.register(drawerStub());
		expect(() => tracker.register(drawerStub())).toThrow('Only one drawer can be active at a time.');
	});

	it('should allow registering again after the active drawer unregisters', () => {
		const tracker = new DrawerTrackerService();
		const first = drawerStub();
		tracker.register(first);
		tracker.unregister(first);
		expect(() => tracker.register(drawerStub())).not.toThrow();
	});
});
