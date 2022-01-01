import { Component, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";

import { MenuController, Platform } from "@ionic/angular";

import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { SettingsService } from "./providers/settings.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  tales = [];

  appPages = [
    {
      title: "Cuento del Día",
      url: "/",
      icon: "book",
    },
    {
      title: "Lista de Cuentos",
      url: "/list",
      icon: "calendar",
    },
  ];

  settingsPages = [
    {
      title: "Acerca de...",
      url: "/about",
      icon: "information-circle",
    },
  ];

  loggedIn = false;
  public darkMode = false;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private settingsService: SettingsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.settingsService.darkMode$.subscribe(
        (value) => (this.darkMode = value)
      );
    });
  }

  public async onModeChange(event: CustomEvent) {
    this.settingsService.setDarkModeSettings(event.detail.checked);
  }
}
