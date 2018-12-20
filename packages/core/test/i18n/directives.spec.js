describe('i18n Directives', function() {
  var $compile, $rootScope, gridUtil, element, recompile, scope;

  beforeEach(function() {
    module('ui.grid');

    inject(function (_$rootScope_, _$compile_, _gridUtil_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      gridUtil = _gridUtil_;
    });

    scope = $rootScope.$new();
    scope.options = {};
    scope.options.data = [
      {col1: 'row1'},
      {col1: 'row2'}
    ];

    scope.options.columnDefs = [
      {field: 'col1', enableCellEdit: true},
      {field: 'col2', enableCellEdit: false}
    ];

    recompile = function () {
      $compile(element)(scope);
      $rootScope.$apply();
    };
  });

  describe('ui-translate directive', function() {
    beforeEach(function() {
      scope.lang = 'en';
      element = angular.element('<div ui-i18n="lang"><p ui-translate="search.placeholder"></p></div>');
      recompile();
    });
    afterEach(function() {
      element.remove();
    });
    it('should translate', function() {
      expect(element.find('p').text()).toBe('Search...');
    });
    it('should translate even if token is on the html instead of the attribute', function() {
      element = angular.element('<div ui-i18n="en"><p ui-translate>search.placeholder</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should be able to interpolate languages and default to english when the language is not defined', function() {
      element = angular.element('<div ui-i18n="{{lang}}"><p ui-translate="search.placeholder"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should be able to interpolate properties', function() {
      scope.lang = 'en';
      scope.property = 'search.placeholder';
      element = angular.element('<div ui-i18n="{{lang}}"><p ui-translate="{{property}}"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should get missing text for missing property', function() {
      element = angular.element('<div ui-i18n="en"><p ui-translate="search.bad.text"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('[MISSING]search.bad.text');
    });
  });

  describe('ui-t directive', function() {
    afterEach(function() {
      element.remove();
    });
    it('should translate', function() {
      element = angular.element('<div ui-i18n="en"><p ui-t="search.placeholder"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should translate even if token is on the html instead of the attribute', function() {
      element = angular.element('<div ui-i18n="en"><p ui-t>search.placeholder</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should be able to interpolate languages and default to english when the language is not defined', function() {
      element = angular.element('<div ui-i18n="{{lang}}"><p ui-t="search.placeholder"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should be able to interpolate properties', function() {
      scope.lang = 'en';
      scope.property = 'search.placeholder';
      element = angular.element('<div ui-i18n="{{lang}}"><p ui-t="{{property}}"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should get missing text for missing property', function() {
      element = angular.element('<div ui-i18n="en"><p ui-t="search.bad.text"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('[MISSING]search.bad.text');

      $rootScope.$broadcast('$uiI18n');

      expect(element.find('p').text()).toBe('[MISSING]search.bad.text');
    });
  });

  describe('t filter', function() {
    afterEach(function() {
      element.remove();
    });
    it('should translate', function() {
      element = angular.element('<div ui-i18n="en"><p>{{"search.placeholder" | t}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should get missing text for missing property', function() {
      element = angular.element('<div ui-i18n="en"><p>{{"search.bad.text" | t}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('[MISSING]search.bad.text');
    });
  });

  describe('uiTranslate filter', function() {
    afterEach(function() {
      element.remove();
    });
    it('should translate', function() {
      element = angular.element('<div ui-i18n="en"><p>{{"search.placeholder" | uiTranslate}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should translate even without the ui-i18n directive', function() {
      element = angular.element('<div><p>{{"search.placeholder" | uiTranslate:"en"}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
    it('should get missing text for missing property', function() {
      element = angular.element('<div ui-i18n="en"><p>{{"search.bad.text" | uiTranslate}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('[MISSING]search.bad.text');
    });
  });
});
