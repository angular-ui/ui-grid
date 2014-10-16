describe('uiGridCell', function () {
  var gridCell, $scope, $compile, $timeout, GridColumn, recompile, grid, uiGridConstants;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$timeout_, _GridColumn_, gridClassFactory, _uiGridConstants_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $timeout = _$timeout_;
    GridColumn = _GridColumn_;
    uiGridConstants = _uiGridConstants_;


    $scope.grid = gridClassFactory.createGrid();


    $scope.col = new GridColumn({name: 'col1', cellClass: 'testClass'}, 0, $scope.grid);
    $scope.col.cellTemplate = '<div class="ui-grid-cell-contents">{{COL_FIELD}}</div>';

    //override getCellValue
    $scope.grid.getCellValue = function (row, col) {
      return 'val';
    };
    $scope.rowRenderIndex = 2;
    $scope.colRenderIndex = 2;

    recompile = function () {
      gridCell = angular.element('<div ui-grid-cell/>');

      $compile(gridCell)($scope);

      $scope.$digest();
    };

  }));

  describe('compile and link tests', function () {
    it('should have a value', inject(function () {
      recompile();
      expect(gridCell).toBeDefined();
      expect(gridCell.text()).toBe('val');
    }));

    it('should have the cellClass class', inject(function () {
      recompile();
      var displayHtml = gridCell.html();
      expect(gridCell.hasClass('testClass')).toBe(true);
    }));

    it('should get cellClass from function, and remove it when data changes', inject(function () {
      $scope.col.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (rowRenderIndex === 2 && colRenderIndex === 2) {
          if ( col.noClass ){
            return '';
          } else {
            return 'funcCellClass';
          }
        }
      };
      recompile();
      var displayHtml = gridCell.html();
      expect(gridCell.hasClass('funcCellClass')).toBe(true);
      
      $scope.col.noClass = true;
      $scope.grid.api.core.notifyDataChange( $scope.grid, uiGridConstants.dataChange.COLUMN );
      expect(gridCell.hasClass('funcCellClass')).toBe(false);
    }));
  });

});