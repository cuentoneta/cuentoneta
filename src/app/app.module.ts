import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
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
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
        }),
    ],
    declarations: [AppComponent],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (storyService: StoryService) => () => storyService.setCount(),
            deps: [StoryService],
            multi: true,
        },
        InAppBrowser,
        SettingsService,
        SplashScreen,
        StatusBar,
        StoryService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
