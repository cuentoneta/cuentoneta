import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { StoryService } from './providers/story.service';
import { SettingsService } from './providers/settings.service';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
    ],
    declarations: [AppComponent],
    providers: [
        SettingsService,
        StoryService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
