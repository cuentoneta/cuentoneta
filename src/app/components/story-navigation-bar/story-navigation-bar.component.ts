import { AfterViewInit, Component, ContentChildren, QueryList } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
	NavigationBarConfig,
	StorylistNavigationFrameComponent,
} from '../storylist-navigation-frame/storylist-navigation-frame.component';
import { combineLatest } from 'rxjs';

@Component({
	selector: 'cuentoneta-story-navigation-bar',
	templateUrl: './story-navigation-bar.component.html',
	standalone: true,
	imports: [CommonModule, NgxSkeletonLoaderModule, RouterLink],
})
export class StoryNavigationBarComponent implements AfterViewInit {
	@ContentChildren(StorylistNavigationFrameComponent) frames: QueryList<StorylistNavigationFrameComponent> | undefined;

	isLoading = false;
	config: NavigationBarConfig = {
		headerTitle: '',
		footerTitle: '',
		navigationRoute: '',
		showFooter: false,
	};

	ngAfterViewInit() {
		this.frames?.forEach((frame) => {
			combineLatest([frame.isLoading, frame.loaded]).subscribe(([loading, config]) => {
				this.isLoading = loading;
				this.config = config;
			});
		});
	}
}
