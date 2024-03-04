import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecording } from '@models/media.model';

@Component({
	selector: 'cuentoneta-space-recording-widget',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage],
	template: `
		<a [href]="spaceUrl" target="_blank">
			<section class="spaces-card grid grid-rows-3-auto inter-body-base text-white rounded-lg p-4">
				<div class="text-base flex items-center justify-between">
					<div class="spaces-host flex gap-2.5">
						<img
							[ngSrc]="media.data.tweetBy.profileImage"
							class="rounded-full border-white border-1 border-solid"
							width="24"
							height="24"
						/>
						<div class="font-bold">{{ media.data.tweetBy.fullName }}</div>
						<span class="badge text-sm py-0.5 px-1 rounded bg-[hsla(0, 0 * 1%, 100 * 1%, 0.3)] flex items-center"
							>Anfitrión</span
						>
					</div>
					<div class="space-recording-data gap-2.5 hidden md:flex">
						<div class="font-bold">{{ media.data.createdAt | date: 'MMMM d, YYYY' }}</div>
						<div class="spaces-duration">{{ media.data.duration }}</div>
					</div>
				</div>
				<h3 class="text-white font-semibold text-xl my-4">
					{{ media.title }}
				</h3>
				<div class="no-underline font-bold text-base text-center p-2.5 rounded-3xl bg-[#fff4] hover:bg-[#1114]">
					Reproducir Grabación en X
				</div>
			</section>
		</a>
	`,
	styles: `
		:host {
			font-family: sans-serif;
		}
		
		.spaces-card {
			background-image: linear-gradient(60deg, hsl(230, 100 * 1%, 50 * 1%) -15%, hsl(260, 100 * 1%, 60 * 1%) 100%);
		}
	`,
})
export class SpaceRecordingWidgetComponent implements OnInit {
	@Input({ required: true }) media!: SpaceRecording;

	public spaceUrl: string = '';

	ngOnInit() {
		this.spaceUrl = this.media.data.entities.urls[0];
	}
}
