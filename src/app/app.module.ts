// Components
import { AppComponent } from './app.component';

// Core
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Providers
import { StoryService } from './providers/story.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
    declarations: [AppComponent, HeaderComponent, FooterComponent],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule],
    providers: [StoryService],
    bootstrap: [AppComponent],
})
export class AppModule {}
