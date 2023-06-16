import { AppPage } from './app.po';
import { browser, by, element } from 'protractor';

describe('rebar-spa-v2-template App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display  REBAR SPA template - Angular 7', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('REBAR SPA template - Angular 7');
  });

  it('should display Home', () => {
    page.navigateTo();
    expect(page.getRouterLink('home')).toEqual('Home');
  });

  it('should display Dasboard', () => {
    page.navigateTo();
    expect(page.getRouterLink('dash')).toEqual('Dashboard');
  });

  it('should display Dasboard table rows count', () => {
    browser.get('/dashboard');
    const elc = element.all(by.css('.table.table-striped tr'));
    expect(elc.count()).toBe(11);
  });

  it('should display Dasboard table first row col count', () => {
    browser.get('/dashboard');
    const elc = element.all(by.css('.table.table-striped tr')).get(1).all(by.tagName('td'));
    expect(elc.count()).toBe(5);
  });

  it('should display Dasboard table first row and 5th col text', () => {
    browser.get('/dashboard');
    const elc = element.all(by.css('.table.table-striped tr')).get(1).all(by.tagName('td'));
    expect(elc.get(4).getText()).toBe('Florida');
  });

});
