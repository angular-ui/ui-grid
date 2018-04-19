describe('i18nService', function () {
  var i18nConstants, i18nService;

  beforeEach(function() {
    module('ui.grid');
    inject(function (_i18nConstants_, _i18nService_) {
      i18nConstants = _i18nConstants_;
      i18nService = _i18nService_;
    });
  });

  describe('i18n service', function() {
    it('should default to English', function() {
      expect(i18nService.getCurrentLang()).toBe('en');
      expect(i18nService.get().search.placeholder).toBe('Search...');
    });
    it('should set a new Current', function() {
      i18nService.setCurrentLang('fr');
      expect(i18nService.getCurrentLang()).toBe('fr');
      expect(i18nService.get().search.placeholder).toBe('Recherche...');
    });
    describe('add', function() {
      it('should add a language when langs is a string', function() {
        i18nService.add('tst',{test:'testlang'});
        i18nService.setCurrentLang('tst');
        expect(i18nService.get().test).toBe('testlang');
      });
      it('should add multiple languages when langs is an array', function() {
        i18nService.add(['tst1', 'tst2'], {test:'testlang'});
        i18nService.setCurrentLang('tst1');
        expect(i18nService.get().test).toBe('testlang');
        i18nService.setCurrentLang('tst2');
        expect(i18nService.get().test).toBe('testlang');
      });
      it('should not add null languages', function() {
        i18nService.add([null], {test:'testlang'});
        i18nService.setCurrentLang(null);
        expect(i18nService.get().test).toBeUndefined();
      });
    });
    it('should return all langs', function() {
      var langs = i18nService.getAllLangs();
      expect(langs.length).toBeGreaterThan(8);
    });

    describe('getSafeText', function() {
      it('should get safe text when text is defined', function() {
        expect(i18nService.getSafeText('search.placeholder')).toBe('Search...');
      });
      it('should get safe text for missing property', function() {
        expect(i18nService.getSafeText('search.bad.text')).toBe('[MISSING]');
      });
      it('should get missing text when language is missing or nonexistent', function() {
        expect(i18nService.getSafeText('search.placeholder', 'valerian')).toBe(i18nConstants.MISSING);
      });
    });
  });
});
