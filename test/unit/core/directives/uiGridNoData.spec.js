(function() {
  'use strict';

  describe('uiGridNoData', function() {
    var $rootScope, $compile, outerScope, gridElement;

    beforeEach(module('ui.grid'));

    beforeEach(inject(
      function(_$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
      }
    ));

    beforeEach(function() {
      outerScope = $rootScope.$new();
      outerScope.options = {
        data: [],
        columnDefs: [
          { field: 'foo' }
        ]
      };
    });

    var compileDirective = function() {
      var tmpl = '<div ui-grid="options"></div>';
      outerScope.options.noDataTemplate = 'custom no data template';
      gridElement = $compile(tmpl)(outerScope);
      outerScope.$digest();
    };

    it('should display the no data directive when no data is rendered', function() {
      compileDirective();

      var noDataElement = gridElement.find('[ui-grid-no-data]');
      expect(noDataElement.length).toEqual(1);
      expect(noDataElement.hasClass('ng-hide')).toBeFalsy();
    });

    it('should hide the no data directive when some data is rendered', function() {
      outerScope.options.data = [
        { foo: 'bar' }
      ];
      compileDirective();

      var noDataElement = gridElement.find('[ui-grid-no-data]');
      expect(noDataElement.length).toEqual(1);
      expect(noDataElement.hasClass('ng-hide')).toBeTruthy();
    });

    it('should display a custom template', function() {
      outerScope.options.noDataTemplate = 'custom no data template';
      compileDirective();

      var noDataElement = gridElement.find('[ui-grid-no-data]');
      expect(noDataElement.length).toEqual(1);
      expect(noDataElement.html().indexOf(outerScope.options.noDataTemplate)).not.toEqual(-1);
    });
  });
})();
