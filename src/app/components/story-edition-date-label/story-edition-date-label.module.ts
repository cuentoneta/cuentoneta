import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryEditionDateLabelComponent } from './story-edition-date-label.component';

@NgModule({
    imports: [CommonModule, StoryEditionDateLabelComponent],
    exports: [
        StoryEditionDateLabelComponent
    ]
})
export class StoryEditionDateLabelModule {}
