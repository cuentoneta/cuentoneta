// Core
import { APP_ID, APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Providers
import { StoryService } from './providers/story.service';
import { ContentService } from './providers/content.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgOptimizedImage,
    HeaderComponent,
    FooterComponent
  ],
  providers: [
    ContentService,
    StoryService,
    { provide: APP_ID, useValue: 'serverApp' },
    {
      provide: APP_INITIALIZER,
      useFactory: (contentService: ContentService) => () =>
        contentService.fetchContentConfig(),
      deps: [ContentService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
