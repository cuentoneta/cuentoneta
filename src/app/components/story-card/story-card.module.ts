import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common'
import { StoryCardComponent } from './story-card.component';

@NgModule({
    declarations: [StoryCardComponent],
    exports: [StoryCardComponent],
    imports: [CommonModule, NgOptimizedImage],
})
export class StoryCardModule {}
