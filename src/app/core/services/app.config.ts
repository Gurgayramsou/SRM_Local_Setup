import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError} from 'rxjs';
import { catchError, take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AppConfig {
  public static readonly configPath = 'config/config.json';
  public config;

  constructor(private http: HttpClient) {}

  /**
   * Use to get the data found in the second file (config file)
   */
  public getConfig() {
    return this.config;
  }

  /**
   * This method:
   *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
   *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
   *  for more https://juristr.com/blog/2018/01/ng-app-runtime-config/
   */
  public load() {
    return new Promise((resolve, reject) => {
      if (sessionStorage[AppConfig.configPath]) {
        this.config = JSON.parse(sessionStorage[AppConfig.configPath]);
        resolve(true);
        return;
      }
      this.http
        .get(AppConfig.configPath).pipe(take(1), catchError(err => throwError(err || 'Server error') ))
        .subscribe((configResponse: any) => {
          sessionStorage[AppConfig.configPath] = JSON.stringify(configResponse);
          this.config = configResponse;
          resolve(true);
        });
    });
  }
}
