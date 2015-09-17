describe('i18n Directives', function () {
  var gridUtil;
  var scope;
  var element;
  var uiGridController;
  var recompile;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function ($rootScope, $compile, $controller, _gridUtil_, $templateCache, $timeout) {
    gridUtil = _gridUtil_;

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
      $rootScope.$digest();
    };
  }));


  describe('ui-translate directive', function () {
    it('should translate', function () {
      element = angular.element('<div ui-i18n="en"><p ui-translate="search.placeholder"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
  });

  describe('ui-t directive', function () {
    it('should translate', function () {
      element = angular.element('<div ui-i18n="en"><p ui-t="search.placeholder"></p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
  });

  describe('t filter', function () {
    it('should translate', function () {
      element = angular.element('<div ui-i18n="en"><p>{{"search.placeholder" | t}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
  });

  describe('uiTranslate filter', function () {
    it('should translate', function () {
      element = angular.element('<div ui-i18n="en"><p>{{"search.placeholder" | uiTranslate}}</p></div>');
      recompile();

      expect(element.find('p').text()).toBe('Search...');
    });
  });

});