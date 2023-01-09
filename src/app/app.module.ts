// Components
import { AppComponent } from './app.component';

// Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Modules
import { AppRoutingModule } from './app.routing/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Providers
import { StoryService } from './providers/story.service';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
    declarations: [AppComponent, HeaderComponent],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule],
    providers: [StoryService],
    bootstrap: [AppComponent],
})
export class AppModule {}