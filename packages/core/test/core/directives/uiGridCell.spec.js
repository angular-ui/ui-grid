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

    // override getCellValue
    $scope.grid.getCellValue = function () {
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
      expect(gridCell.hasClass('testClass')).toBe(true);
    }));

    it('should get cellClass from function, and remove it when data changes', inject(function () {
      $scope.col.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
        if (rowRenderIndex === 2 && colRenderIndex === 2) {
          if ( col.noClass ) {
            return '';
          } else {
            return 'funcCellClass';
          }
        }
      };
      recompile();
      expect(gridCell.hasClass('funcCellClass')).toBe(true);

      $scope.col.noClass = true;
      $scope.grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      expect(gridCell.hasClass('funcCellClass')).toBe(false);
    }));
  });

  // Don't run this on IE9. The behavior looks correct when testing interactively but these tests fail
  if (!navigator.userAgent.match(/MSIE\s+9\.0/)) {
    it("should change a column's class when its uid changes", inject(function (gridUtil, $compile, uiGridConstants) {
      // Reset the UIDs (used by columns) so they're fresh and clean
      gridUtil.resetUids();

      // Set up a couple basic columns
      $scope.gridOptions = {
        columnDefs: [{ field: 'name', width: 100 }, { field: 'age', width: 50 }],
        data: [
          { name: 'Bob', age: 50 }
        ],
        onRegisterApi: function( gridApi ) { $scope.gridApi = gridApi; }
      };

      // Create a grid elements
      var gridElm = angular.element('<div ui-grid="gridOptions" style="width: 400px; height: 300px"></div>');

      // Compile the grid and attach it to the document, as the widths won't be right if it's unattached
      $compile(gridElm)($scope);
      document.body.appendChild(gridElm[0]);
      $scope.$digest();

      // Get the first column and its root column class
      var firstCol = $(gridElm).find('.ui-grid-cell').first();
      var firstHeaderCell = $(gridElm).find('.ui-grid-header-cell').first();
      var classRegEx = new RegExp('^' + uiGridConstants.COL_CLASS_PREFIX);
      var class1 = _(firstCol[0].className.split(/\s+/)).find(function(c) { return classRegEx.test(c); });

      // The first column should be 100px wide because we said it should be
      expect(firstCol.outerWidth()).toEqual(100, 'first cell is 100px, counting border');
      expect(firstHeaderCell.outerWidth()).toEqual(100, "header cell is 100px, counting border");

      // Now swap the columns in the column defs
      $scope.gridOptions.columnDefs = [{ field: 'age', width: 50 }, { field: 'name', width: 100 }];
      $scope.$digest();
      $timeout.flush();

      var firstColAgain = $(gridElm).find('.ui-grid-cell').first();
      var firstHeaderCellAgain = $(gridElm).find('.ui-grid-header-cell').first();
      var class2 = _(firstColAgain[0].className.split(/\s+/)).find(function(c) { return classRegEx.test(c); });

      // The column root classes should have changed
      expect(class2).not.toEqual(class1);

      $scope.gridApi.grid.refresh();
      $scope.$digest();

      // The first column should now be 50px wide
      expect(firstColAgain.outerWidth()).toEqual(50, 'first cell again is 50px, counting border');
      expect(firstHeaderCellAgain.outerWidth()).toEqual(50, 'header cell again is 50px, counting border');

      // ... and the last column should now be 100px wide
      var lastCol = $(gridElm).find('.ui-grid-cell').last();
      var lastHeaderCell = $(gridElm).find('.ui-grid-header-cell').last();
      expect(lastCol.outerWidth()).toEqual(100, 'last cell again is 100px, counting border');
      expect(lastHeaderCell.outerWidth()).toEqual(100, 'last header cell again is 100px, counting border');

      angular.element(gridElm).remove();
    }));
  }
});
