import { browser, element, by, ExpectedConditions } from 'protractor';

export class MITAPage {
  navigateTo() {
    return browser.get('/');
  }

  getPageTitle() {
    return browser.getTitle();
  }

  login() {
    let emailInput = element(by.css('input[type="email"]'));
    let passwordInput = element(by.css('input[type="password"]'));
    let loginButton = element(by.css('button[type="submit"]'));
    browser.wait(ExpectedConditions.visibilityOf(emailInput), 5000);
    browser.wait(ExpectedConditions.visibilityOf(passwordInput), 5000);
    browser.wait(ExpectedConditions.visibilityOf(loginButton), 5000);
    emailInput.sendKeys('johnny@example.com');
    passwordInput.sendKeys('123456');
    loginButton.click();
  }

  getLoginError() {
    let errorContainer = element(by.css('div.auth0-global-message-error span.fadeInUp'));
    browser.wait(ExpectedConditions.visibilityOf(errorContainer), 5000);
    return errorContainer.getText();
  }
}
