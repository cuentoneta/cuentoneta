// Components
import { AppComponent } from './app.component';

// Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Modules
import { HttpClientModule } from '@angular/common/http';

// Providers
import { StoryService } from './providers/story.service';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, HttpClientModule],
    providers: [StoryService],
    bootstrap: [AppComponent],
})
export class AppModule {}