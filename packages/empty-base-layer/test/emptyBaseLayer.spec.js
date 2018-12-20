describe('ui.grid.emptyBaseLayer', function () {

  var scope, element, viewportHeight, emptyBaseLayerContainer, $compile;

  beforeEach(module('ui.grid.emptyBaseLayer'));

  beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {

    $compile = _$compile_;
    scope = $rootScope;

    viewportHeight = "100";
    scope.gridOptions = {};
    scope.gridOptions.data = [
      { col1: 'col1', col2: 'col2' }
    ];
    scope.gridOptions.onRegisterApi = function (gridApi) {
      scope.gridApi = gridApi;
      scope.grid = gridApi.grid;
      var renderBodyContainer = scope.grid.renderContainers.body;
      spyOn(renderBodyContainer, 'getViewportHeight').and.callFake(function() {
        return viewportHeight;
      });
    };
  }));

  describe('enabled', function() {
    beforeEach(function() {
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-empty-base-layer></div>');

      $compile(element)(scope);
      scope.$digest();

      emptyBaseLayerContainer = angular.element(element.find('.ui-grid-empty-base-layer-container')[0]);
    });

    it('should add emptyBaseLayerContainer to the viewport html', function () {
      expect(element.find('.ui-grid-empty-base-layer-container').length).toBe(1);
    });

    it('should add fake rows to the empty base layer container, on building styles', function() {
      expect(emptyBaseLayerContainer.children().length).toBe(4);
    });

    it('should increase in rows if viewport height increased', function() {
      viewportHeight = "150";
      scope.grid.buildStyles();
      scope.$digest();
      expect(emptyBaseLayerContainer.children().length).toBe(5);
    });
  });

  describe('disabled', function() {
    it('should be disabled if we pass false into the directive in the markup', function() {
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-empty-base-layer="false"></div>');
      $compile(element)(scope);
      scope.$digest();
      emptyBaseLayerContainer = angular.element(element.find('.ui-grid-empty-base-layer-container')[0]);
      expect(emptyBaseLayerContainer.children().length).toBe(0);
    });

    it('should be disabled if we pass false as an value through the scope in markup', function() {
      scope.enableEmptyBaseLayer = false;
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-empty-base-layer="enableEmptyBaseLayer"></div>');
      $compile(element)(scope);
      scope.$digest();
      emptyBaseLayerContainer = angular.element(element.find('.ui-grid-empty-base-layer-container')[0]);
      expect(emptyBaseLayerContainer.children().length).toBe(0);
    });

    it('should be disabled if set enableEmptyGridBaseLayer in gridOptions to false', function() {
      scope.gridOptions.enableEmptyGridBaseLayer = false;
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-empty-base-layer></div>');
      $compile(element)(scope);
      scope.$digest();
      emptyBaseLayerContainer = angular.element(element.find('.ui-grid-empty-base-layer-container')[0]);
      expect(emptyBaseLayerContainer.children().length).toBe(0);
    });

    it('should not reset the number of rows incase it is disabled', function() {
      scope.gridOptions.enableEmptyGridBaseLayer = false;
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-empty-base-layer></div>');
      $compile(element)(scope);
      scope.$digest();
      emptyBaseLayerContainer = angular.element(element.find('.ui-grid-empty-base-layer-container')[0]);
      expect(emptyBaseLayerContainer.children().length).toBe(0);

      viewportHeight = "150";
      scope.grid.buildStyles();
      scope.$digest();
      expect(emptyBaseLayerContainer.children().length).toBe(0);
    });
  });
});
