import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecording } from '@models/media.model';

@Component({
	selector: 'cuentoneta-space-recording-widget',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage],
	template: `
		<a [href]="spaceUrl" target="_blank">
			<section class="spaces-card cursor-pointer">
				<div class="spaces-meta flex items-center justify-between">
					<div class="spaces-host flex gap-2.5">
						<img [ngSrc]="media.data.tweetBy.profileImage" class="rounded-full" width="24" height="24" />
						<div class="name">{{ media.data.tweetBy.fullName }}</div>
						<span class="badge flex items-center">Anfitrión</span>
					</div>
					<div class="space-recording-data gap-2.5 hidden md:flex">
						<div class="spaces-date">{{ media.data.createdAt | date: 'MMMM d, YYYY' }}</div>
						<div class="spaces-duration">{{ media.data.duration }}</div>
					</div>
				</div>
				<h3 class="spaces-title my-4">
					{{ media.title }}
				</h3>
				<div class="spaces-btn">Reproducir Grabación en X</div>
			</section>
		</a>
	`,
	styleUrl: './space-recording-widget.component.scss',
})
export class SpaceRecordingWidgetComponent implements OnInit {
	@Input({ required: true }) media!: SpaceRecording;

	public spaceUrl: string = '';

	ngOnInit() {
		this.spaceUrl = this.media.data.entities.urls[0];
	}
}
