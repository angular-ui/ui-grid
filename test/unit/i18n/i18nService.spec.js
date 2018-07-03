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
    describe('get', function() {
      it('should return the language passed to it if a language is passed', function() {
        expect(i18nService.get('fr').search.placeholder).toBe('Recherche...');
      });
      it('should the current language no language is passed to it', function() {
        i18nService.setCurrentLang('en');
        expect(i18nService.get().search.placeholder).toBe('Search...');
      });
    });
    describe('add', function() {
      it('should add a language when langs is a string', function() {
        i18nService.add('tst',{test: 'testlang'});
        i18nService.setCurrentLang('tst');
        expect(i18nService.get().test).toBe('testlang');
      });
      it('should add multiple languages when langs is an array', function() {
        i18nService.add(['tst1', 'tst2'], {test: 'testlang'});
        i18nService.setCurrentLang('tst1');
        expect(i18nService.get().test).toBe('testlang');
        i18nService.setCurrentLang('tst2');
        expect(i18nService.get().test).toBe('testlang');
      });
      it('should not add null languages', function() {
        i18nService.add([null], {test: 'testlang'});
        i18nService.setCurrentLang(null);
        expect(i18nService.get().test).toBeUndefined();
      });
    });
    it('should return all langs', function() {
      var langs = i18nService.getAllLangs();

      expect(langs.length).toBeGreaterThan(8);
    });
    describe('fallback lang', function() {
      it('getFallbackLang should default to english when a fallback language is not set', function() {
        expect(i18nService.getFallbackLang()).toEqual(i18nConstants.DEFAULT_LANG);
      });
      it('getFallbackLang should return the user set language when the user calls setFallbackLang', function() {
        var fallback = 'es';

        i18nService.setFallbackLang(fallback);
        expect(i18nService.getFallbackLang()).toEqual(fallback);
      });
      it('getFallbackLang should return english when the user calls setFallbackLang with an empty string', function() {
        var fallback = '';

        i18nService.setFallbackLang(fallback);
        expect(i18nService.getFallbackLang()).toEqual(i18nConstants.DEFAULT_LANG);
      });
    });
    describe('getSafeText', function() {
      beforeEach(function() {
        i18nService.setCurrentLang('en');
        i18nService.setFallbackLang('en');
      });
      it('should get safe text when text is defined', function() {
        expect(i18nService.getSafeText('search.placeholder')).toBe('Search...');
      });
      it('should get missing text for missing property', function() {
        var badText = 'search.bad.text';

        expect(i18nService.getSafeText(badText)).toBe(i18nConstants.MISSING + badText);
      });
      it('should get fallback text when language is missing or nonexistent', function() {
        expect(i18nService.getSafeText('search.placeholder', 'valerian')).toBe('Search...');
      });
      it('should get missing text when language is missing or nonexistent and there is no fallback', function() {
        var badText = 'bad.text';

        expect(i18nService.getSafeText(badText, 'valerian')).toBe(i18nConstants.MISSING + badText);
      });
      it('should get missing text when language is missing or nonexistent and the fallback language is the same', function() {
        var missingProperty = 'search.placeholder';

        i18nService.setFallbackLang('valerian');
        expect(i18nService.getSafeText(missingProperty, 'valerian')).toBe(i18nConstants.MISSING + missingProperty);
      });
      it('should get missing text when language is missing or nonexistent and the fallback language is also missing it', function() {
        var missingProperty = 'search.placeholder';

        i18nService.setFallbackLang('orcish');
        expect(i18nService.getSafeText(missingProperty, 'valerian')).toBe(i18nConstants.MISSING + missingProperty);
      });
    });
  });
});
