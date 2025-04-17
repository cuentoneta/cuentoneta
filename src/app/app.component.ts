import { afterNextRender, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';

// Analytics
import { AnalyticsService } from './providers/analytics.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { WINDOW } from './providers/window';
import { distinctUntilChanged, filter, fromEvent, map, pairwise, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum VisibilityState {
	Visible = 'visible',
	Hidden = 'hidden',
}

enum Direction {
	Up = 'Up',
	Down = 'Down',
}

@Component({
	selector: 'cuentoneta-root',
	template: `
		@if (isHeaderVisible) {
			<header cuentoneta-header></header>
		}
		<div [class]="isHeaderVisible ? 'top-20' : 'top-0'" class="fixed z-10 h-2 w-full overflow-hidden bg-primary-100">
			<div class="progress-bar h-full w-0 bg-primary-400"></div>
		</div>
		<div class="mx-5 my-0 mt-20 min-h-screen md:m-auto md:max-w-screen-md">
			<router-outlet />
		</div>
		<cuentoneta-footer />
	`,
	imports: [CommonModule, FooterComponent, HeaderComponent, RouterModule],
	providers: [AnalyticsService],
	animations: [
		trigger('toggle', [
			state(VisibilityState.Hidden, style({ opacity: 0, transform: 'translateY(-100%)' })),
			state(VisibilityState.Visible, style({ opacity: 1, transform: 'translateY(0)' })),
			transition('* => *', animate('500ms ease-in')),
		]),
	],
	styles: `
		@keyframes scrollbar {
			to {
				width: 100%;
			}
		}

		header {
			transition: top 0.2s ease-in-out;
		}

		.progress-bar {
			transition-timing-function: ease-out;
			transition: width 0.5s;
			animation: scrollbar linear;
			animation-timeline: scroll(root);
		}
	`,
})
export class AppComponent implements OnInit {
	analytics = inject(AnalyticsService);
	isHeaderVisible = true;

	private changeDetectionRef = inject(ChangeDetectorRef);
	private window = inject(WINDOW);
	private userHasScrolled$ = fromEvent(this.window, 'scroll').pipe(
		takeUntilDestroyed(),
		throttleTime(25),
		map(() => this.window?.scrollY),
		filter((scrollAmount) => scrollAmount > 400),
		pairwise(),
		map(([y1, y2]): Direction => (y2 < y1 ? Direction.Up : Direction.Down)),
		distinctUntilChanged(),
	);

	async ngOnInit() {
		if (environment.environment !== 'production') {
			return;
		}
		await this.analytics.init();
	}

	constructor() {
		afterNextRender(() => {
			this.userHasScrolled$.subscribe((direction) => {
				this.isHeaderVisible = direction === Direction.Up;
				this.changeDetectionRef.detectChanges();
			});
		});
	}
}
