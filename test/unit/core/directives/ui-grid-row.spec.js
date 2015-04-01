describe('uiGridRow', function () {
  var grid, data, columnDefs, $scope, $compile, $document, recompile, uiGridConstants, GridRow, gridUtil;

  data = [
    { "name": "Bob", "age": 35 },
    { "name": "Bill", "age": 25 },
    { "name": "Sam", "age": 17 },
    { "name": "Jane", "age": 19 }
  ];

  columnDefs = [
    { name: 'name' },
    { name: 'age' }
  ];

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$document_, _uiGridConstants_, _GridRow_, _gridUtil_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $document = _$document_;
    uiGridConstants = _uiGridConstants_;
    GridRow = _GridRow_;
    gridUtil = _gridUtil_;

    $scope.gridOpts = {
      columnDefs: columnDefs,
      data: data,
      onRegisterApi: function( gridApi ){ $scope.gridApi = gridApi; }
    };

    $scope.extScope = 'test';

    recompile = function () {
      grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');

      $compile(grid)($scope);

      $scope.$digest();
    };

    recompile();
  }));

  describe('with different row templates', function () {
    beforeEach(inject(function($templateCache, $q) {
      $templateCache.put('customRowTemplate', '<div><div>The name is: {{ row.entity.name }}</div></div>');

      $scope.gridApi.grid.registerRowsProcessor(function alterTemplates(rows, cols) {
        var grid = this;

        rows.forEach(function (row) {
          if (row.entity.name === 'Sam') {
            row.rowTemplate = 'customRowTemplate';
            gridUtil.getTemplate(row.rowTemplate)
              .then(function (template) {
                row.getRowTemplateFn = $q.when($compile(template));
              });
          }
        }, 10);

        return rows;
      });

      $scope.gridApi.grid.refresh();
      $scope.$digest();
    }));

    it('should allow rows to compile with different templates', function() {
      // The third row in the template should have a different template
      var thirdRow = $(grid).find('.ui-grid-row:nth-child(3)');

      expect(thirdRow.text()).toEqual('The name is: Sam');
    });

    it('should change templates properly after a sort', function () {
      var refreshed = false;
      runs(function () {
        $scope.gridApi.grid.sortColumn($scope.gridApi.grid.columns[0], uiGridConstants.ASC)
          .then(function () {
            $scope.gridApi.grid.refresh();
            refreshed = true;
          });

        $scope.$digest();
      });

      waitsFor(function () { return refreshed; }, 10000);

      runs(function () {
        var fourthRow = $(grid).find('.ui-grid-row:nth-child(4)');

        expect(fourthRow.text()).toEqual('The name is: Sam');
      });
    });
  });
});