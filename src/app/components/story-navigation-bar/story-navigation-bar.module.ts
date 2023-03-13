import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryNavigationBarComponent } from './story-navigation-bar.component';
import {RouterLink} from "@angular/router";

@NgModule({
    declarations: [StoryNavigationBarComponent],
    imports: [CommonModule, RouterLink],
    exports: [
        StoryNavigationBarComponent
    ]
})
export class StoryNavigationBarModule {}
