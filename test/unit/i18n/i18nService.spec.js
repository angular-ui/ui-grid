describe('i18nService', function () {
  var i18nService;
  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_i18nService_) {
    i18nService = _i18nService_;
  }));

  describe('i18n service', function () {
    it('should default to English', function () {
      expect(i18nService.getCurrentLang()).toBe('en');
      expect(i18nService.get().search.placeholder).toBe('Search...');
    });
    it('should set a new Current', function () {
      i18nService.setCurrentLang('fr');
      expect(i18nService.getCurrentLang()).toBe('fr');
      expect(i18nService.get().search.placeholder).toBe('Recherche...');
    });
    it('should add a language', function () {
      i18nService.add('tst',{test:'testlang'});
      i18nService.setCurrentLang('tst');
      expect(i18nService.get().test).toBe('testlang');
    });
    it('should return all langs', function () {
      var langs = i18nService.getAllLangs();
      expect(langs.length).toBeGreaterThan(8);
    });
    it('should get safe text', function () {
      var text = i18nService.getSafeText('search.placeholder');
      expect(text).toBe('Search...');
    });
    it('should get safe text for missing property', function () {
      var text = i18nService.getSafeText('search.bad.text');
      expect(text).toBe('[MISSING]');
    });
  });


});