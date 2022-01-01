import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Storage} from "@ionic/storage-angular";

@Injectable({ providedIn: "root" })
export class SettingsService {
  private _storage: Storage | null = null;
  public darkMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(private storage: Storage) {
    this.load();
  }

  public async load() {
    this._storage = await this.storage.create();
    this.getDarkModeSettings();
  }

  public async getDarkModeSettings() {
    const darkMode = await this._storage.get("darkMode");
    if (darkMode) {
      this.darkMode$.next(darkMode);
    }
  }

  public async setDarkModeSettings(value: boolean) {
    await this._storage.set("darkMode", value);
    this.darkMode$.next(value);
  }
}
