import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient, HttpHandler} from '@angular/common/http';
import { AppConfig } from '../core/auth/app.config';
import { routing } from '../app.routing';
import { AuthModule } from '../core/auth/auth.module';
import { PageNotFoundComponent } from '../shared/page-not-found/page-not-found.component';
import { APP_BASE_HREF } from '@angular/common';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [
        AppComponent, PageNotFoundComponent
      ],
      imports : [routing, AuthModule],
      providers : [HttpClient, HttpHandler, AppConfig,
        {provide: APP_BASE_HREF, useValue : '/' }]
    }).compileComponents();
  }));

  it('App component should be created', () => {
    const component = TestBed.createComponent(AppComponent);
    expect(component).toBeTruthy();
  });

  it('Validate if Auth is enabled', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.isVisible = true;
    expect(app.isVisible).toBeTruthy();
  }));
});
