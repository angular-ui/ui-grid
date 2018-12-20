
describe('rowSorter', function() {
  var grid, $scope, $compile, recompile, uiGridConstants, rowSorter, gridClassFactory, Grid, GridColumn, GridRow;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _uiGridConstants_, _rowSorter_, _Grid_, _GridColumn_, _GridRow_, _gridClassFactory_) {
    $scope = $rootScope;
    $compile = _$compile_;
    uiGridConstants = _uiGridConstants_;
    rowSorter = _rowSorter_;
    Grid = _Grid_;
    GridColumn = _GridColumn_;
    GridRow = _GridRow_;
    gridClassFactory = _gridClassFactory_;

    // recompile = function () {
    //   grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
    //   // document.body.appendChild(grid[0]);
    //   $compile(grid)($scope);
    //   $scope.$digest();
    // };

    // recompile();
  }));

  afterEach(function () {
    // grid = null;
  });

  // TODO(c0bra): Add test for grid sorting constants?

  describe('guessSortFn', function () {
    it('should guess a number', function () {
      var guessFn = rowSorter.guessSortFn('number');
      expect(guessFn).toBe(rowSorter.sortNumber);
    });

    it('should guess a date', function () {
      var guessFn = rowSorter.guessSortFn('date');

      expect(guessFn).toBe(rowSorter.sortDate);
    });

    it('should guess a string', function () {
      var guessFn = rowSorter.guessSortFn("string");

      expect(guessFn).toBe(rowSorter.sortAlpha);
    });


    it('should allow booleans', function () {
      var guessFn = rowSorter.guessSortFn('boolean');
      expect(guessFn).toBe(rowSorter.sortBool);
    });

    it('should use basicSort for objects', function () {
      var guessFn = rowSorter.guessSortFn('object');
      expect(guessFn).toBe(rowSorter.basicSort);
    });
  });

  describe('sort', function() {
    var grid, rows, cols;

    beforeEach(function() {
      grid = new Grid({ id: 123 });

      var e1 = { name: 'Bob' };
      var e2 = { name: 'Jim' };

      rows = [
        new GridRow(e1, 0, grid),
        new GridRow(e2, 1, grid)
      ];

      cols = [
        new GridColumn({
          name: 'name',
          type: 'string',
          sort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 0, grid)
      ];
    });

    it('should sort this ascending', function() {
      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Bob');
    });

    it('should sort things descending', function() {
      cols[0].sort.direction = uiGridConstants.DESC;

      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Jim');
    });

    it('should not sort if useExternalSorting is set', function() {
      cols[0].sort.direction = uiGridConstants.DESC;
      grid.options.useExternalSorting = true;

      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Bob');
    });

    // TODO(c0bra) ...
    describe('with a custom sorting algorithm', function () {
      beforeEach(function() {

      });

      it("should use the column's specified sorting algorithm if it has one", function () {
        cols[0] = new GridColumn({
          name: 'name',
          type: 'string',
          sortingAlgorithm: jasmine.createSpy('sortingAlgorithm').and.returnValue(rows),
          sort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 0, grid);

        rowSorter.sort(grid, rows, cols);

        expect(cols[0].sortingAlgorithm).toHaveBeenCalled();
      });

      it('should run and use the sorting algorithm output properly', function() {
        cols[0] = new GridColumn({
          name: 'name',
          type: 'string',
          // Sort words containing the letter 'i' to the top
          sortingAlgorithm: function (a, b) {
            var r = 0;
            if (/i/.test(a) && /i/.test(b)) {
              r = 0;
            }
            else if (/i/.test(a)) {
              r = -1;
            }
            else if (/i/.test(b)) {
              r = 1;
            }

            return r;
          },
          sort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 0, grid);

        var ret = rowSorter.sort(grid, rows, cols);

        expect(ret[0].entity.name).toEqual('Jim');
      });
    });
  });

  describe('sort by date column', function() {
    var grid, rows, cols;

    beforeEach(function() {
      grid = new Grid({ id: 123 });

      var e1 = { name: 'Bob', date: new Date('2015-07-01T13:25:00+00:00') }; // Wednesday
      var e2 = { name: 'Jim', date: new Date('2015-06-29T13:25:00+00:00') }; // Monday
      var e3 = { name: 'Bill', date: new Date('2015-07-03T13:25:00+00:00') }; // Friday

      rows = [
        new GridRow(e1, 0, grid),
        new GridRow(e2, 1, grid),
        new GridRow(e3, 1, grid)
      ];

      cols = [
        new GridColumn({
          name: 'name',
          type: 'string'
        }, 0, grid),
        new GridColumn({
          name: 'date',
          type: 'date',
          cellFilter: 'date:"EEEE"',
          sort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 1, grid)
      ];
    });

    it('should sort by the actual date', function() {
      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Jim');
    });

    it('should sort by the day of week string', function() {
      cols[1].sortCellFiltered = true;

      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Bill');
    });

  });

  describe('default sort', function() {
    var grid, rows, cols;

    beforeEach(function() {
      grid = new Grid({ id: 123 });

      var e1 = { name: 'Bob', employeeId: 4 };
      var e2 = { name: 'Jim', employeeId: 2  };
      var e3 = { name: 'Bill', employeeId: 5  };

      rows = [
        new GridRow(e1, 0, grid),
        new GridRow(e2, 1, grid),
        new GridRow(e3, 1, grid)
      ];

      cols = [
        new GridColumn({
          name: 'name',
          type: 'string'
        }, 0, grid),
        new GridColumn({
          name: 'employeeId',
          type: 'string',
          defaultSort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 1, grid)
      ];
    });

    it('should sort by the default sort column by default', function() {
      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Jim');
    });

    it('should sort by the name when a sort is applied', function() {
      cols[0].sort.direction = uiGridConstants.ASC;

      var ret = rowSorter.sort(grid, rows, cols);
      expect(ret[0].entity.name).toEqual('Bill');
    });

  });

  describe('stable sort', function() {
    var grid, rows, cols;

    beforeEach(function() {
      grid = new Grid({ id: 123 });

      var e1 = { name: 'Bob', oldIndex: 0 };
      var e2 = { name: 'Bob', oldIndex: 1 };

      rows = [
        new GridRow(e1, 0, grid),
        new GridRow(e2, 1, grid)
      ];

      cols = [
        new GridColumn({
          name: 'name',
          type: 'string',
          sort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 0, grid)
      ];
    });

    it('should sort this ascending', function() {
      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.oldIndex).toEqual(0);
    });

    it('should sort things descending', function() {
      cols[0].sort.direction = uiGridConstants.DESC;

      var ret = rowSorter.sort(grid, rows, cols);

      expect(ret[0].entity.oldIndex).toEqual(0);
    });
  });

  describe('external sort', function() {
    var grid, rows, cols, column, timeoutRows, returnedRows, $timeout;

    beforeEach(inject(function(_$timeout_) {
      $timeout = _$timeout_;

      grid = gridClassFactory.createGrid({
        externalSort: jasmine.createSpy('externalSort')
                        .and.callFake(function (r) {
                          return $timeout(function() {
                            timeoutRows[0].grid = grid;
                            return timeoutRows;
                          }, 1000);
                        })
      });

      timeoutRows = [new GridRow({ name: 'Frank' }, 0, grid)];

      // grid.options.externalSort = function (grid, column, rows) {
      //   // sort stuff here
      // };

      var e1 = { name: 'Bob' };
      var e2 = { name: 'Jim' };

      rows = grid.rows = [
        new GridRow(e1, 0, grid),
        new GridRow(e2, 1, grid)
      ];

      column = new GridColumn({
        name: 'name'
      }, 0, grid);

      cols = grid.columns = [column];
    }));

    describe('should run', function() {
      beforeEach(function() {
        grid.sortColumn(column);
        grid.processRowsProcessors(grid.rows)
          .then(function (newRows) {
            returnedRows = newRows;
          });

        // Have to flush $timeout once per processor, as they run consecutively.  Magic value - reduce by one
        // since filter processor is enabled but does nothing
        for (var i = 0; i < grid.rowsProcessors.length - 1; i++) {
          $timeout.flush();
        }

        $scope.$digest();
      });

      it('should call external sort',function () {
        expect(grid.options.externalSort).toHaveBeenCalled();

        expect(returnedRows).toEqual(timeoutRows);
      });
    });
  });

  describe( 'test each sort routine and null/undefined handling', function () {
    it( 'each function sorts as expected', function() {
      var sortValues = {
        basicSort: [ undefined, null, 'a', 'b' ],
        sortNumber: [ undefined, null, 1, 2 ],
        sortNumberStr: [ undefined, null, '3.a5', '5.b7' ],
        sortAlpha: [ undefined, null, 'a', 'b' ],
        sortDate: [ undefined, null, new Date(2009, 12, 12), new Date(2010, 11, 11) ],
        sortBool: [ undefined, null, false, true ]
      };

      angular.forEach( sortValues, function( values, sortFnName ) {
        expect( rowSorter[sortFnName] (values[0], values[1])).toEqual(0, sortFnName + ': expected undefined to equal null');
        expect( rowSorter[sortFnName] (values[0], values[2])).toBeGreaterThan(0, sortFnName + ': expected undefined to be greater than value');
        expect( rowSorter[sortFnName] (values[3], values[1])).toBeLessThan(0, sortFnName + ': expected value to be less than null');
        expect( rowSorter[sortFnName] (values[2], values[2])).toEqual(0, sortFnName + ': expected value to equal value');
        expect( rowSorter[sortFnName] (values[2], values[3])).toBeLessThan(0, sortFnName + ': expected value to be less than value');
        expect( rowSorter[sortFnName] (values[3], values[2])).toBeGreaterThan(0, sortFnName + ': expected value to be greater than value');
      });
    });
  });

});
