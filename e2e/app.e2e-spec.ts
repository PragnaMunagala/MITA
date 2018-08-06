import { MITAPage } from './app.po';

describe('mica App', function() {
  let page: MITAPage;

  beforeEach(() => {
    page = new MITAPage();
  });

  it('Page title must be "MITA"', () => {
    page.navigateTo();
    page.getPageTitle()
      .then(title => {
        expect(title).toEqual('MITA')
      })
  });

  it('Must be an error SOMETHING WENT WRONG', () => {
    page.login();
    page.getLoginError().then((error) => {
      expect(error.toUpperCase()).toContain('SOMETHING WENT WRONG')
    })
  });
});
