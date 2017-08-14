import { OmniscentPage } from './app.po';

describe('omniscent App', function() {
  let page: OmniscentPage;

  beforeEach(() => {
    page = new OmniscentPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
