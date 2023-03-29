// Components
import { AppComponent } from './app.component';

// Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Providers
import { StoryService } from './providers/story.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContentService } from './providers/content.service';

@NgModule({
    declarations: [AppComponent, HeaderComponent, FooterComponent],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, NgOptimizedImage],
    providers: [ContentService, StoryService],
    bootstrap: [AppComponent],
})
export class AppModule {}
