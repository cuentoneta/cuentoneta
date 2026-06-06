import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecording } from '@models/media.model';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-space-recording-widget',
	imports: [CommonModule, NgOptimizedImage, PortableTextParserComponent],
	template: `
		<section class="spaces-card grid grid-rows-3-auto rounded-lg p-4 font-inter text-base text-white">
			<div class="flex items-center justify-between text-base">
				<div class="spaces-host flex items-center gap-2.5">
					@if (media().data.hostAvatar; as hostAvatar) {
						<img
							[ngSrc]="hostAvatar"
							class="rounded-full border-1 border-solid border-white"
							alt=" "
							width="24"
							height="24"
						/>
					}
					<div class="font-bold">{{ media().data.hostName }}</div>
					<span class="flex items-center rounded bg-[#fff4] px-1 py-0.5 text-sm">Anfitrión</span>
				</div>
				<div class="space-recording-data hidden gap-2.5 md:flex">
					<div class="font-bold">{{ media().data.date | date: 'MMMM d, yyyy' }}</div>
					<div class="spaces-duration">{{ media().data.duration }}</div>
				</div>
			</div>
			<h2 class="my-4 text-xl font-semibold text-white">
				{{ media().title }}
			</h2>
			<audio
				[src]="media().data.url"
				controls
				aria-label="space-recording-audio"
				data-testid="space-recording-audio"
				class="w-full"
			></audio>
		</section>
		<p class="font-inter text-xs font-medium text-brand-500">
			<cuentoneta-portable-text-parser [paragraphs]="media().description" />
		</p>
	`,
	styles: `
		:host {
			font-family: sans-serif;
		}

		.spaces-card {
			background-image: linear-gradient(60deg, hsl(230, 100%, 50%) -15%, hsl(260, 100%, 60%) 100%);
		}

		audio {
			accent-color: hsl(260, 100%, 60%);
		}

		audio::-webkit-media-controls-panel {
			background-color: rgba(255, 255, 255, 0.25);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceRecordingWidgetComponent {
	readonly media = input.required<SpaceRecording>();
}
