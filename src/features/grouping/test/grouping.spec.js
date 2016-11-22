describe('ui.grid.grouping uiGridGroupingService', function () {
  var uiGridGroupingService;
  var uiGridGroupingConstants;
  var uiGridTreeBaseService;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;
  var GridRow;
  var $timeout;

  beforeEach(module('ui.grid.grouping'));

  beforeEach(inject(function (_uiGridGroupingService_,_gridClassFactory_, $templateCache, _uiGridGroupingConstants_,
                              _$rootScope_, _GridRow_, _uiGridTreeBaseService_,_$timeout_) {
    uiGridGroupingService = _uiGridGroupingService_;
    uiGridGroupingConstants = _uiGridGroupingConstants_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    GridRow = _GridRow_;
    uiGridTreeBaseService = _uiGridTreeBaseService_;
    $timeout = _$timeout_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
      {field: 'col0', enableGrouping: true},
      {field: 'col1', enableGrouping: true},
      {field: 'col2', enableGrouping: true},
      {field: 'col3', enableGrouping: true},
      {field: 'col4', enableGrouping: true, type: 'date'}
    ];

    uiGridGroupingService.initializeGrid(grid, $scope);
    var data = [];
    for (var i = 0; i < 10; i++) {

      data.push({
        col0: 'a_' + Math.floor(i/4),
        col1: 'b_' + Math.floor(i/2),
        col2: 'c_' + i,
        col3: 'd_' + i,
        col4: i > 5 ? new Date(2015, 6, 1) : null
      });
    }
    grid.options.data = data;

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
  }));


  describe( 'tidySortPriority', function() {
    it( 'no group columns, no sort columns, no errors', function() {
      uiGridGroupingService.tidyPriorities( grid );
    });

    it( 'some group columns, some sort columns, tidies correctly', function() {
      grid.columns[0].sort = { priority: 1};
      grid.columns[0].grouping = { groupPriority: 3};
      grid.columns[1].sort = {priority: 9};
      grid.columns[2].sort = {priority: 1};
      grid.columns[2].grouping = { groupPriority: 2 };
      grid.columns[3].sort = {priority: 0};

      uiGridGroupingService.tidyPriorities( grid );
      expect(grid.columns[2].grouping.groupPriority).toEqual(0, 'column 2 groupPriority');
      expect(grid.columns[2].sort.priority).toEqual(0, 'column 2 sort priority');
      expect(grid.columns[0].grouping.groupPriority).toEqual(1, 'column 0 groupPriority');
      expect(grid.columns[0].sort.priority).toEqual(1, 'column 0 sort priority');
      expect(grid.columns[3].sort.priority).toEqual(2, 'column 3 sort priority');
      expect(grid.columns[1].sort.priority).toEqual(3, 'column 1 sort priority');
    });
  });


  describe( 'moveGroupColumns', function() {
    it( 'move some columns left, and some columns right', function() {
      // TODO
    });

    it( 'will not move header columns', function() {

      $timeout(function () {
        grid.addRowHeaderColumn({name:'aRowHeader'}, -200);
      });
      $timeout.flush();


      grid.columns[2].renderContainer = 'left';
      grid.columns[2].sort = { priority: 1};
      grid.columns[2].grouping = { groupPriority: 1};
      uiGridGroupingService.moveGroupColumns(grid,grid.columns,grid.rows);
      expect(grid.columns[0].colDef.name).toBe('aRowHeader');


    });
  });


  describe('groupColumn', function() {
    it('saves previous sort state', function() {
      grid.columns[1].sort = { priority: 42, direction: 'foo'};
      uiGridGroupingService.groupColumn(grid, grid.columns[1]);
      expect(grid.columns[1].previousSort.priority).toBe(42);
      expect(grid.columns[1].previousSort.direction).toBe('foo');
    });
  });

  describe('ungroupColumn', function() {
    it('restores previuosly restored state if there is one', function() {
      grid.columns[1].previousSort = { direction: 'bar'};
      uiGridGroupingService.ungroupColumn(grid, grid.columns[1]);
      expect(grid.columns[1].sort.direction).toBe('bar');
    });

    it('should remove previous sort prop from column object after column sort is restored', function() {
      grid.columns[1].previousSort = {direction: 'bar'};
      uiGridGroupingService.ungroupColumn(grid, grid.columns[1]);
      expect(grid.columns[1].previousSort).toBeUndefined();
    });
  });


  describe( 'groupRows', function() {
    beforeEach(function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').and.callFake( function() {});
    });

    it( 'group by col0 then col1', function() {

      grid.columns[0].grouping = { groupPriority: 1 };
      grid.columns[1].grouping = { groupPriority: 2 };

      var groupedRows = uiGridGroupingService.groupRows.call( grid, grid.rows.slice(0) );
      expect( groupedRows.length ).toEqual( 18, 'all rows are present, including the added group headers' );
    });

    it( 'group by col4 (type date with nulls)', function() {
      grid.columns[4].grouping = { groupPriority: 1 };

      uiGridGroupingService.tidyPriorities(grid);
      var groupedRows = uiGridGroupingService.groupRows.call( grid, grid.rows.slice(0) );
      expect( groupedRows.length ).toEqual( 12, 'all rows are present, including two group header rows' );
    });
  });

  describe('initialiseProcessingState', function() {
    it('no grouping', function() {
      grid.columns[1].grouping = {};
      grid.columns[3].grouping = {};

      expect(uiGridGroupingService.initialiseProcessingState(grid)).toEqual([
      ]);
    });

    it('groupingShowCounts', function() {
      grid.columns[1].grouping = {groupPriority: 3};
      grid.columns[3].grouping = {groupPriority: 2};
      grid.options.groupingShowCounts = true;

      var result = uiGridGroupingService.initialiseProcessingState(grid);
      expect(result[0].col).toEqual(grid.columns[3]);
      delete result[0].col;
      expect(result[1].col).toEqual(grid.columns[1]);
      delete result[1].col;

      expect(result).toEqual([
        { fieldName: 'col3', initialised: false, currentValue: null, currentRow: null },
        { fieldName: 'col1', initialised: false, currentValue: null, currentRow: null }
      ]);
    });

    it('without groupingShowCounts', function() {
      grid.columns[1].grouping = {groupPriority: 3};
      grid.columns[3].grouping = {groupPriority: 2};
      grid.options.groupingShowCounts = false;

      var result = uiGridGroupingService.initialiseProcessingState(grid);
      expect(result[0].col).toEqual(grid.columns[3]);
      delete result[0].col;
      expect(result[1].col).toEqual(grid.columns[1]);
      delete result[1].col;

      expect(result).toEqual([
        { fieldName: 'col3', initialised: false, currentValue: null, currentRow: null },
        { fieldName: 'col1', initialised: false, currentValue: null, currentRow: null }
      ]);
    });

    it('mixture of settings', function() {
      grid.columns[0].grouping = {};
      grid.columns[1].grouping = {groupPriority: 3};
      grid.columns[2].grouping = {};
      grid.columns[3].grouping = {groupPriority: 2};
      grid.options.groupingShowCounts = true;

      // when expected results go wrong the messages suck if columns are in the results...so check them individually then delete them out
      var result = uiGridGroupingService.initialiseProcessingState(grid);
      expect(result[0].col).toEqual(grid.columns[3]);
      delete result[0].col;
      expect(result[1].col).toEqual(grid.columns[1]);
      delete result[1].col;
      expect(result).toEqual([
        { fieldName: 'col3', initialised: false, currentValue: null, currentRow: null },
        { fieldName: 'col1', initialised: false, currentValue: null, currentRow: null }
      ]);
    });
  });


  describe('getGrouping', function() {
    it('should find no grouping', function() {
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [],
        aggregations: []
      });
    });

    it('finds one grouping', function() {
      grid.columns[1].grouping = {groupPriority: 0};

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.grouping[0].col.name).toEqual('col1');
      delete grouping.grouping[0].col;

      expect(grouping).toEqual({
        grouping: [{ field: 'col1', groupPriority: 0 }],
        aggregations: []
      });
    });

    it('finds one aggregation, has no priority', function() {
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.aggregations[0].col.name ).toEqual('col1');
      delete grouping.aggregations[0].col;

      expect( grouping ).toEqual({
        grouping: [],
        aggregations: [ { field: 'col1', aggregation: { type: 'count' } } ]
      });
    });

    it('finds one aggregation, has a priority', function() {
      grid.columns[1].grouping = {groupPriority: 0};
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.grouping[0].col.name).toEqual('col1');
      delete grouping.grouping[0].col;
      expect( grouping.aggregations[0].col.name).toEqual('col1');
      delete grouping.aggregations[0].col;

      expect(grouping).toEqual({
        grouping: [{ field: 'col1', groupPriority: 0 }],
        aggregations: [ { field: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT } } ]
      });
    });

    it('finds one aggregation, has no priority, aggregation is stored', function() {
      grid.columns[1].grouping = {groupPriority: -1};
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.aggregations[0].col.name).toEqual('col1');
      delete grouping.aggregations[0].col;

      expect(grouping).toEqual({
        grouping: [],
        aggregations: [ { field: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT } } ]
      });
    });

    it('multiple finds, sorts correctly', function() {
      grid.columns[1].grouping = {};
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };
      grid.columns[2].grouping = {groupPriority: 1};
      grid.columns[3].grouping = {groupPriority: 0};
      grid.columns[3].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.grouping[0].col.name).toEqual('col3');
      delete grouping.grouping[0].col;
      expect( grouping.grouping[1].col.name).toEqual('col2');
      delete grouping.grouping[1].col;
      expect( grouping.aggregations[0].col.name).toEqual('col1');
      delete grouping.aggregations[0].col;
      expect( grouping.aggregations[1].col.name).toEqual('col3');
      delete grouping.aggregations[1].col;

      expect(grouping).toEqual({
        grouping: [
          { field: 'col3', groupPriority: 0 },
          { field: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT} },
          { field: 'col3', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT} }
        ]
      });
    });

    it('different multiple finds, sorts correctly', function() {
      grid.columns[1].grouping = {groupPriority: 0};
      grid.columns[2].grouping = {groupPriority: 2};
      grid.columns[3].grouping = {groupPriority: 1};

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.grouping[0].col.name).toEqual('col1');
      delete grouping.grouping[0].col;
      expect( grouping.grouping[1].col.name).toEqual('col3');
      delete grouping.grouping[1].col;
      expect( grouping.grouping[2].col.name).toEqual('col2');
      delete grouping.grouping[2].col;

      expect(grouping).toEqual({
        grouping: [
          { field: 'col1', groupPriority: 0 },
          { field: 'col3', groupPriority: 1 },
          { field: 'col2', groupPriority: 2 }
       ],
       aggregations: []
      });
    });

    it('renumbers non-contiguous grouping', function() {
      grid.columns[1].grouping = {groupPriority: 2};
      grid.columns[2].grouping = {groupPriority: 6};
      grid.columns[3].grouping = {groupPriority: 4};

      var grouping = uiGridGroupingService.getGrouping(grid);

      expect( grouping.grouping[0].col.name).toEqual('col1');
      delete grouping.grouping[0].col;
      expect( grouping.grouping[1].col.name).toEqual('col3');
      delete grouping.grouping[1].col;
      expect( grouping.grouping[2].col.name).toEqual('col2');
      delete grouping.grouping[2].col;

      expect(grouping).toEqual({
        grouping: [
          { field: 'col1', groupPriority: 0 },
          { field: 'col3', groupPriority: 1 },
          { field: 'col2', groupPriority: 2 }
       ],
       aggregations: []
      });
    });
  });


  describe('getGrouping via api (returns colName)', function() {
    it('should find no grouping', function() {
      expect(grid.api.grouping.getGrouping( true )).toEqual({
        grouping: [],
        aggregations: [],
        rowExpandedStates: {}
      });
    });

    it('should find no grouping', function() {
      expect(grid.api.grouping.getGrouping( false )).toEqual({
        grouping: [],
        aggregations: []
      });
    });

    it('should find no grouping, expanded states present', function() {
      grid.grouping.groupingHeaderCache = { male: { row: { treeNode: { state: 'expanded' } } } };

      expect(grid.api.grouping.getGrouping( true )).toEqual({
        grouping: [],
        aggregations: [],
        rowExpandedStates: { male: { state: 'expanded', children: {} } }
      });
    });

    it('finds one grouping', function() {
      grid.columns[1].grouping = {groupPriority: 0};
      expect(grid.api.grouping.getGrouping(true)).toEqual({
        grouping: [{ field: 'col1', colName: 'col1', groupPriority: 0 }],
        aggregations: [],
        rowExpandedStates: {}
      });
    });

    it('finds one aggregation, has no priority', function() {
      grid.columns[1].grouping = {};
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [],
        aggregations: [{ field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT} } ]
      });
    });

    it('finds one aggregation, has a priority, aggregation is not ignored', function() {
      grid.columns[1].grouping = {groupPriority: 0};
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [{ field: 'col1', colName: 'col1', groupPriority: 0 }],
        aggregations: [{ field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT} } ]
      });
    });

    it('finds one aggregation, has no priority, aggregation is stored', function() {
      grid.columns[1].grouping = {groupPriority: -1};
      grid.columns[1].treeAggregation = { type: uiGridGroupingConstants.aggregation.COUNT };
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [],
        aggregations: [{ field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT} } ]
      });
    });

    it('multiple finds, sorts correctly', function() {
      grid.columns[1].treeAggregation = {type: uiGridGroupingConstants.aggregation.COUNT};
      grid.columns[2].grouping = {groupPriority: 1};
      grid.columns[3].grouping = {groupPriority: 0};
      grid.columns[3].treeAggregation = {type: uiGridGroupingConstants.aggregation.COUNT};
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT } },
          { field: 'col3', colName: 'col3', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT } }
        ]
      });
    });
  });


  describe('setGrouping', function() {
    it('no grouping', function() {
      grid.api.grouping.setGrouping(
        {}
      );
      expect(grid.api.grouping.getGrouping( true )).toEqual(
        { grouping: [], aggregations: [], rowExpandedStates: {} }
      );
    });

    it('grouping, aggregations and rowExpandedStates', function() {
      grid.grouping.groupingHeaderCache = {
        male: {
          row: { treeNode: { state: 'collapsed' } },
          children: {
            22: { row: { treeNode: { state: 'expanded' } }, children: {} },
            39: { row: { treeNode: { state: 'collapsed' } }, children: {} }
          }
        },
        female: {
          row: { treeNode: { state: 'expanded' } },
          children: {
            23: { row: { treeNode: { state: 'collapsed' } }, children: {} },
            38: { row: { treeNode: { state: 'expanded' } }, children: {} }
          }
        }
      };

      grid.api.grouping.setGrouping({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT } }
        ],
        rowExpandedStates: {
          male: { state: 'expanded', children: {
            22: { state: 'collapsed' },
            38: { state: 'expanded' }
          } },
          female: { state: 'expanded', children: {
            23: { state: 'expanded' },
            39: { state: 'collapsed' }
          } }
        }
      });
      expect(grid.api.grouping.getGrouping(true)).toEqual({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT, label: uiGridTreeBaseService.nativeAggregations().count.label } }
        ],
        rowExpandedStates: {
          male: { state: 'expanded', children: {
            22: { state: 'collapsed', children: {} },
            39: { state: 'collapsed', children: {} }
          } },
          female: { state: 'expanded', children: {
            23: { state: 'expanded', children: {} },
            38: { state: 'expanded', children: {} }
          } }
        }
      });
    });


    describe('sorts', function(){
      beforeEach(function() {
        spyOn(grid.api.core.raise, 'sortChanged').and.callThrough();
      });

      it('', function() {
        grid.grouping.groupingHeaderCache = {
          male: {
            row: { treeNode: { state: 'collapsed' } },
            children: {
              22: { row: { treeNode: { state: 'expanded' } }, children: {} },
              39: { row: { treeNode: { state: 'collapsed' } }, children: {} }
            }
          },
          female: {
            row: { treeNode: { state: 'expanded' } },
            children: {
              23: { row: { treeNode: { state: 'collapsed' } }, children: {} },
              38: { row: { treeNode: { state: 'expanded' } }, children: {} }
            }
          }
        };


        grid.api.grouping.setGrouping({
          grouping: [
            { field: 'col3', colName: 'col3', groupPriority: 0 },
            { field: 'col2', colName: 'col2', groupPriority: 1 }
          ],
          aggregations: [
            { field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT } }
          ],
          rowExpandedStates: {
            male: { state: 'expanded', children: {
              22: { state: 'collapsed' },
              38: { state: 'expanded' }
            } },
            female: { state: 'expanded', children: {
              23: { state: 'expanded' },
              39: { state: 'collapsed' }
            } }
          }
        });

        // Should call sort change twice because we are grouping by two columns
        expect(grid.api.core.raise.sortChanged.calls.count()).toEqual(2);
      });

    });

  });


  describe('clearGrouping', function() {
    it('no grouping', function() {
      grid.api.grouping.setGrouping(
        {}
      );

      // really just checking there are no errors, it should do nothing
      grid.api.grouping.clearGrouping();

      expect(grid.api.grouping.getGrouping( true )).toEqual(
        { grouping: [], aggregations: [], rowExpandedStates: {} }
      );
    });

    it('clear grouping, aggregations and rowExpandedStates', function() {
      grid.grouping.groupingHeaderCache = {
        male: { row: { treeNode: { state: 'collapsed' } } }
      };

      grid.api.grouping.setGrouping({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: { type: uiGridGroupingConstants.aggregation.COUNT }}
        ],
        rowExpandedStates: { male: { state: 'expanded' } }
      });

      grid.api.grouping.clearGrouping();

      expect(grid.api.grouping.getGrouping( true )).toEqual(
        { grouping: [], aggregations: [], rowExpandedStates: { male : { state : 'expanded', children: {} } } }
      );
    });

  });


  describe('insertGroupHeader', function() {
    it('inserts a header in the middle', function() {
      var rowTemplateSpy = jasmine.createSpy('rowTemplateSpy');
      rowTemplateSpy.and.callFake( function() {});
      rowTemplateSpy(gridClassFactory, 'rowTemplateAssigner');
      var headerRow1 = new GridRow( {}, null, grid );
      var headerRow2 = new GridRow( {}, null, grid );
      var headerRow3 = new GridRow( {}, null, grid );

      headerRow1.expandedState = { state: uiGridGroupingConstants.EXPANDED };
      headerRow2.expandedState = { state: uiGridGroupingConstants.COLLAPSED };
      grid.grouping.groupingHeaderCache = {
        test: {
          row: {},
          children: {}
        }
      };

      var processingStates = [
        {
          fieldName: 'col1',
          col: grid.columns[1],
          initialised: true,
          currentValue: 'test',
          currentRow: headerRow1
        },
        {
          fieldName: 'col2',
          col: grid.columns[2],
          initialised: true,
          currentValue: 'blah',
          currentRow: headerRow2
        },
        {
          fieldName: 'col3',
          col: grid.columns[3],
          initialised: true,
          currentValue: 'fred',
          currentRow: headerRow3
        }
      ];

      uiGridGroupingService.insertGroupHeader(grid, grid.rows, 3, processingStates, 1);

      expect( grid.rows.length ).toEqual(11, 'extra row created');

      expect( processingStates[0].currentRow.uid ).toEqual(headerRow1.uid);
      delete processingStates[0].currentRow;
      expect( processingStates[1].currentRow.uid ).toBe(grid.rows[3].uid);
      delete processingStates[1].currentRow;
      expect( processingStates[2].currentRow ).toEqual(null, 'should be cleared as parent initialised it');

      expect( processingStates[0].col.name ).toEqual( grid.columns[1].name, 'processing state 0 should have col1' );
      delete processingStates[0].col;
      expect( processingStates[1].col.name ).toEqual( grid.columns[2].name, 'processing state 1 should have col2' );
      delete processingStates[1].col;
      expect( processingStates[2].col.name ).toEqual( grid.columns[3].name, 'processing state 2 should have col3' );
      delete processingStates[2].col;

      expect(processingStates).toEqual([
        {
          fieldName: 'col1',
          initialised: true,
          currentValue: 'test'
        },
        {
          fieldName: 'col2',
          initialised: true,
          currentValue: 'c_3'
        },
        {
          fieldName: 'col3',
          initialised: false,
          currentValue: null,
          currentRow: null
        }
      ]);
    });
  });
 });
