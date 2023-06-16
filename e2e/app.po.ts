import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('.navbar-brand')).getText();
  }

  getRouterLink(id: string) {
    return element(by.id(id)).getText();
  }

  getDashboradTable()  {
    browser.get('/dashboard');
    return element.all(by.css('.table .table-striped tr'));
  }
}
