describe('ui.grid.grouping uiGridGroupingService', function () {
  var uiGridGroupingService;
  var uiGridGroupingConstants;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;
  var GridRow;

  beforeEach(module('ui.grid.grouping'));

  beforeEach(inject(function (_uiGridGroupingService_,_gridClassFactory_, $templateCache, _uiGridGroupingConstants_,
                              _$rootScope_, _GridRow_) {
    uiGridGroupingService = _uiGridGroupingService_;
    uiGridGroupingConstants = _uiGridGroupingConstants_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    GridRow = _GridRow_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
      {field: 'col0', enableGrouping: true},
      {field: 'col1', enableGrouping: true},
      {field: 'col2', enableGrouping: true},
      {field: 'col3', enableGrouping: true}
    ];

    _uiGridGroupingService_.initializeGrid(grid, $scope);
    var data = [];
    for (var i = 0; i < 10; i++) {
      data.push({col0: 'a_' + Math.floor(i/4), col1: 'b_' + Math.floor(i/2), col2: 'c_' + i, col3: 'd_' + i});
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
      // XXXXXX
    });
  });


  describe( 'groupRows', function() {
    it( 'group by col0 then col1', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});
      grid.columns[0].grouping = { groupPriority: 1 };
      grid.columns[1].grouping = { groupPriority: 2 };
      
      var groupedRows = uiGridGroupingService.groupRows.call( grid, grid.rows.slice(0) );
      expect( groupedRows.length ).toEqual( 3, 'only the level 1 rows are visible' );
      
      grid.api.grouping.expandAllRows();
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      groupedRows = uiGridGroupingService.groupRows.call( grid, grid.rows.slice(0) );
      expect( groupedRows.length ).toEqual( 18, 'we\'ve added 3 col0 headers, and 5 col2 headers' );
    });
  });

  describe('initialiseProcessingState', function() {
    it('no grouping', function() {
      grid.columns[1].grouping = {aggregation: uiGridGroupingConstants.aggregation.COUNT};
      grid.columns[3].grouping = {aggregation: uiGridGroupingConstants.aggregation.SUM};
      
      expect(uiGridGroupingService.initialiseProcessingState(grid)).toEqual([
      ]);
    });
    
    it('no aggregation, but groupingShowCounts', function() {
      grid.columns[1].grouping = {groupPriority: 3};
      grid.columns[3].grouping = {groupPriority: 2};
      grid.options.groupingShowCounts = true;

      var result = uiGridGroupingService.initialiseProcessingState(grid);
      expect(result[0].col).toEqual(grid.columns[3]);
      delete result[0].col;
      expect(result[1].col).toEqual(grid.columns[1]);
      delete result[1].col;
      
      expect(result).toEqual([
        { fieldName: 'col3', initialised: false, currentValue: null, currentGroupHeader: null, runningAggregations: [ 
          { type : uiGridGroupingConstants.aggregation.COUNT, fieldName : uiGridGroupingConstants.aggregation.FIELD, value : null } 
        ] },
        { fieldName: 'col1', initialised: false, currentValue: null, currentGroupHeader: null, runningAggregations: [ 
          { type : uiGridGroupingConstants.aggregation.COUNT, fieldName : uiGridGroupingConstants.aggregation.FIELD, value : null } 
        ] }
      ]);
    });

    it('no aggregation, without groupingShowCounts', function() {
      grid.columns[1].grouping = {groupPriority: 3};
      grid.columns[3].grouping = {groupPriority: 2};
      grid.options.groupingShowCounts = false;

      var result = uiGridGroupingService.initialiseProcessingState(grid);
      expect(result[0].col).toEqual(grid.columns[3]);
      delete result[0].col;
      expect(result[1].col).toEqual(grid.columns[1]);
      delete result[1].col;
      
      expect(result).toEqual([
        { fieldName: 'col3', initialised: false, currentValue: null, currentGroupHeader: null, runningAggregations: [] },
        { fieldName: 'col1', initialised: false, currentValue: null, currentGroupHeader: null, runningAggregations: [] }
      ]);
    });
    
    it('mixture of settings', function() {
      grid.columns[0].grouping = {aggregation: uiGridGroupingConstants.aggregation.COUNT};
      grid.columns[1].grouping = {groupPriority: 3};
      grid.columns[2].grouping = {aggregation: uiGridGroupingConstants.aggregation.SUM};
      grid.columns[3].grouping = {groupPriority: 2};
      grid.options.groupingShowCounts = true;

      // when expected results go wrong the messages suck if columns are in the results...so check them individually then delete them out
      var result = uiGridGroupingService.initialiseProcessingState(grid);
      expect(result[0].col).toEqual(grid.columns[3]);
      delete result[0].col;
      expect(result[0].runningAggregations[1].col).toEqual(grid.columns[0]);
      delete result[0].runningAggregations[1].col;
      expect(result[0].runningAggregations[2].col).toEqual(grid.columns[2]);
      delete result[0].runningAggregations[2].col;
      expect(result[1].col).toEqual(grid.columns[1]);
      delete result[1].col; 
      expect(result[1].runningAggregations[1].col).toEqual(grid.columns[0]);
      delete result[1].runningAggregations[1].col;
      expect(result[1].runningAggregations[2].col).toEqual(grid.columns[2]);
      delete result[1].runningAggregations[2].col;
      expect(result).toEqual([
        { fieldName: 'col3', initialised: false, currentValue: null, currentGroupHeader: null, runningAggregations: [
          { type : uiGridGroupingConstants.aggregation.COUNT, fieldName : uiGridGroupingConstants.aggregation.FIELD, value : null }, 
          { type: uiGridGroupingConstants.aggregation.COUNT, fieldName: 'col0', value: null },
          { type: uiGridGroupingConstants.aggregation.SUM, fieldName: 'col2', value: null }
        ] },
        { fieldName: 'col1', initialised: false, currentValue: null, currentGroupHeader: null, runningAggregations: [
          { type : uiGridGroupingConstants.aggregation.COUNT, fieldName : uiGridGroupingConstants.aggregation.FIELD, value : null }, 
          { type: uiGridGroupingConstants.aggregation.COUNT, fieldName: 'col0', value: null },
          { type: uiGridGroupingConstants.aggregation.SUM, fieldName: 'col2', value: null }
        ] }
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
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({ 
        grouping: [{ field: 'col1', col: grid.columns[1], groupPriority: 0 }],
        aggregations: []
      });
    });

    it('finds one aggregation, has no priority', function() {
      grid.columns[1].grouping = {aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [],
        aggregations: [{ field: 'col1', col: grid.columns[1], aggregation: uiGridGroupingConstants.aggregation.COUNT} ]
      });
    });

    it('finds one aggregation, has a priority, aggregation is ignored', function() {
      grid.columns[1].grouping = {groupPriority: 0, aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [{ field: 'col1', col: grid.columns[1], groupPriority: 0 }],
        aggregations: []
      });
    });

    it('finds one aggregation, has no priority, aggregation is stored', function() {
      grid.columns[1].grouping = {groupPriority: -1, aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [],
        aggregations: [ { field: 'col1', col: grid.columns[1], aggregation: uiGridGroupingConstants.aggregation.COUNT } ]
      });
    });

    it('multiple finds, sorts correctly', function() {
      grid.columns[1].grouping = {aggregation: uiGridGroupingConstants.aggregation.COUNT};
      grid.columns[2].grouping = {groupPriority: 1};
      grid.columns[3].grouping = {groupPriority: 0, aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [
          { field: 'col3', col: grid.columns[3], groupPriority: 0 },
          { field: 'col2', col: grid.columns[2], groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', col: grid.columns[1], aggregation: uiGridGroupingConstants.aggregation.COUNT}
        ]
      });
    });

    it('different multiple finds, sorts correctly', function() {
      grid.columns[1].grouping = {groupPriority: 0};
      grid.columns[2].grouping = {groupPriority: 2};
      grid.columns[3].grouping = {groupPriority: 1};
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [
          { field: 'col1', col: grid.columns[1], groupPriority: 0 },
          { field: 'col3', col: grid.columns[3], groupPriority: 1 },
          { field: 'col2', col: grid.columns[2], groupPriority: 2 }
       ],
       aggregations: []
      });
    });

    it('renumbers non-contiguous grouping', function() {
      grid.columns[1].grouping = {groupPriority: 2};
      grid.columns[2].grouping = {groupPriority: 6};
      grid.columns[3].grouping = {groupPriority: 4};
      expect(uiGridGroupingService.getGrouping(grid)).toEqual({
        grouping: [
          { field: 'col1', col: grid.columns[1], groupPriority: 0 },
          { field: 'col3', col: grid.columns[3], groupPriority: 1 },
          { field: 'col2', col: grid.columns[2], groupPriority: 2 }
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
    
    it('should find no grouping, no expanded states', function() {
      expect(grid.api.grouping.getGrouping( false )).toEqual({
        grouping: [],
        aggregations: []
      });
    });
    
    it('should find no grouping, expanded states present', function() {
      grid.grouping.rowExpandedStates = { male: { state: 'expanded' } };
      expect(grid.api.grouping.getGrouping( true )).toEqual({
        grouping: [],
        aggregations: [],
        rowExpandedStates: { male: { state: 'expanded' } } 
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
      grid.columns[1].grouping = {aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [],
        aggregations: [{ field: 'col1', colName: 'col1', aggregation: uiGridGroupingConstants.aggregation.COUNT} ]
      });
    });

    it('finds one aggregation, has a priority, aggregation is ignored', function() {
      grid.columns[1].grouping = {groupPriority: 0, aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [{ field: 'col1', colName: 'col1', groupPriority: 0 }],
        aggregations: []
      });
    });

    it('finds one aggregation, has no priority, aggregation is stored', function() {
      grid.columns[1].grouping = {groupPriority: -1, aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [],
        aggregations: [ { field: 'col1', colName: 'col1', aggregation: uiGridGroupingConstants.aggregation.COUNT } ]
      });
    });

    it('multiple finds, sorts correctly', function() {
      grid.columns[1].grouping = {aggregation: uiGridGroupingConstants.aggregation.COUNT};
      grid.columns[2].grouping = {groupPriority: 1};
      grid.columns[3].grouping = {groupPriority: 0, aggregation: uiGridGroupingConstants.aggregation.COUNT};
      expect(grid.api.grouping.getGrouping(false)).toEqual({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: uiGridGroupingConstants.aggregation.COUNT}
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
      grid.api.grouping.setGrouping({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: uiGridGroupingConstants.aggregation.COUNT}
        ],
        rowExpandedStates: { male: { state: 'expanded' } } 
      });
      expect(grid.api.grouping.getGrouping(true)).toEqual({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: uiGridGroupingConstants.aggregation.COUNT}
        ],
        rowExpandedStates: { male: { state: 'expanded' } } 
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
      grid.api.grouping.setGrouping({
        grouping: [
          { field: 'col3', colName: 'col3', groupPriority: 0 },
          { field: 'col2', colName: 'col2', groupPriority: 1 }
        ],
        aggregations: [
          { field: 'col1', colName: 'col1', aggregation: uiGridGroupingConstants.aggregation.COUNT}
        ],
        rowExpandedStates: { male: { state: 'expanded' } } 
      });
      grid.api.grouping.clearGrouping();
      
      expect(grid.api.grouping.getGrouping( true )).toEqual(
        { grouping: [], aggregations: [], rowExpandedStates: { male : { state : 'expanded' } } }
      );
    });

  });
    

  describe('insertGroupHeader', function() {
    it('inserts a header in the middle', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});
      var headerRow1 = new GridRow( {}, null, grid );
      var headerRow2 = new GridRow( {}, null, grid );
      var headerRow3 = new GridRow( {}, null, grid );

      headerRow1.expandedState = { state: uiGridGroupingConstants.EXPANDED };
      headerRow2.expandedState = { state: uiGridGroupingConstants.COLLAPSED };
       
      var processingStates = [
        { 
          fieldName: 'col1',
          col: grid.columns[1], 
          initialised: true,
          currentValue: 'test',
          currentGroupHeader: headerRow1,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
          ]
        },
        { 
          fieldName: 'col2',
          col: grid.columns[2], 
          initialised: true,
          currentValue: 'blah',
          currentGroupHeader: headerRow2,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: 'x'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 22 }
          ]
        },
        { 
          fieldName: 'col3',
          col: grid.columns[3], 
          initialised: true,
          currentValue: 'fred',
          currentGroupHeader: headerRow3,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: 'y'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 13 }
          ]
        }
      ];
      
      uiGridGroupingService.insertGroupHeader(grid, grid.rows, 3, processingStates, 1);
      
      expect( grid.rows.length ).toEqual(11, 'extra row created');
      expect( grid.rows[3].entity).toEqual({col2: 'c_3'}, 'no aggregations yet, only the group title');
      expect( grid.rows[3].entity).toEqual({col2: 'c_3'}, 'no aggregations yet, only the group title');
      expect(headerRow2.entity).toEqual({ agg1: 'max: x', agg2: 'min: 22' });
      expect(headerRow3.entity).toEqual({ agg1: 'max: y', agg2: 'min: 13' });
      
      expect( processingStates[0].currentGroupHeader ).toBe(headerRow1);
      processingStates[0].currentGroupHeader = 'x';
      expect( processingStates[1].currentGroupHeader ).toBe(grid.rows[3]);
      processingStates[1].currentGroupHeader = 'y';
      expect(processingStates).toEqual([
        { 
          fieldName: 'col1', 
          col: grid.columns[1],
          initialised: true,
          currentValue: 'test',
          currentGroupHeader: 'x',
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
          ]
        },
        { 
          fieldName: 'col2',
          col: grid.columns[2], 
          initialised: true,
          currentValue: 'c_3',
          currentGroupHeader: 'y',
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: null },
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: null }
          ]
        },
        { 
          fieldName: 'col3', 
          col: grid.columns[3],
          initialised: false,
          currentValue: null,
          currentGroupHeader: null,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: null },
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: null }
          ]
        }
      ]);
    });
  });


  describe('writeOutAggregations', function() {
    it('one state', function() {
      var headerRow1 = new GridRow( {}, null, grid );
       
      var processingStates = [
        { 
          fieldName: 'col1', 
          initialised: true,
          currentValue: 'test',
          currentGroupHeader: headerRow1,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
          ]
        }
      ];
      
      uiGridGroupingService.writeOutAggregations( grid, processingStates, 0 );
      
      expect(headerRow1.entity).toEqual({ agg1: 'max: 1234', agg2: 'min: 98' });
      expect(processingStates).toEqual([
        {
          fieldName: 'col1', 
          initialised: false,
          currentValue: null,
          currentGroupHeader: null,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: null},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: null }
          ]
        }
      ]);
    });
    
    it('many states, start in the middle', function() {
      var headerRow1 = new GridRow( {}, null, grid );
      var headerRow2 = new GridRow( {}, null, grid );
      var headerRow3 = new GridRow( {}, null, grid );
       
      var processingStates = [
        { 
          fieldName: 'col1', 
          initialised: true,
          currentValue: 'test',
          currentGroupHeader: headerRow1,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
          ]
        },
        { 
          fieldName: 'col2', 
          initialised: true,
          currentValue: 'blah',
          currentGroupHeader: headerRow2,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: 'x'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 22 }
          ]
        },
        { 
          fieldName: 'col3', 
          initialised: true,
          currentValue: 'fred',
          currentGroupHeader: headerRow3,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: 'y'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 13 }
          ]
        }
      ];
      
      uiGridGroupingService.writeOutAggregations( grid, processingStates, 1 );
      
      expect(headerRow1.entity).toEqual({});
      expect(headerRow2.entity).toEqual({ agg1: 'max: x', agg2: 'min: 22' });
      expect(headerRow3.entity).toEqual({ agg1: 'max: y', agg2: 'min: 13' });
      
      expect(processingStates).toEqual([
        { 
          fieldName: 'col1', 
          initialised: true,
          currentValue: 'test',
          currentGroupHeader: headerRow1,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
          ]
        },
        { 
          fieldName: 'col2', 
          initialised: false,
          currentValue: null,
          currentGroupHeader: null,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: null },
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: null }
          ]
        },
        { 
          fieldName: 'col3', 
          initialised: false,
          currentValue: null,
          currentGroupHeader: null,
          runningAggregations: [
            { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: null },
            { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: null }
          ]
        }
      ]);
    });    
  });
  

  describe('writeOutAggregation', function() {
    it('no rowHeader', function() {
      var processingState = { 
        fieldName: 'col1', 
        initialised: true,
        currentValue: 'test',
        currentGroupHeader: null,
        runningAggregations: [
        ]
      };
      
      uiGridGroupingService.writeOutAggregation( grid, processingState );
      
      expect(processingState).toEqual({
        fieldName: 'col1', 
        initialised: false,
        currentValue: null,
        currentGroupHeader: null,
        runningAggregations: [
        ]
      });
    });

    it('no aggregations', function() {
      var headerRow = new GridRow( {}, null, grid );
       
      var processingState = { 
        fieldName: 'col1', 
        initialised: true,
        currentValue: 'test',
        currentGroupHeader: headerRow,
        runningAggregations: [
        ]
      };
      
      uiGridGroupingService.writeOutAggregation( grid, processingState );
      
      expect(headerRow.entity).toEqual({});
      expect(processingState).toEqual({
        fieldName: 'col1', 
        initialised: false,
        currentValue: null,
        currentGroupHeader: null,
        runningAggregations: [
        ]
      });
    });

    it('some aggregations', function() {
      var headerRow = new GridRow( {}, null, grid );
       
      var processingState = { 
        fieldName: 'col1', 
        initialised: true,
        currentValue: 'test',
        currentGroupHeader: headerRow,
        runningAggregations: [
          { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
          { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
        ]
      };
      
      uiGridGroupingService.writeOutAggregation( grid, processingState );
      
      expect(headerRow.entity).toEqual({ agg1: 'max: 1234', agg2: 'min: 98' });
      expect(processingState).toEqual({
        fieldName: 'col1', 
        initialised: false,
        currentValue: null,
        currentGroupHeader: null,
        runningAggregations: [
          { fieldName: 'agg1', col: {}, type: uiGridGroupingConstants.aggregation.MAX, value: null},
          { fieldName: 'agg2', col: {}, type: uiGridGroupingConstants.aggregation.MIN, value: null }
        ]
      });
    });

    it('groupingSuppressAggregationText', function() {
      var headerRow = new GridRow( {}, null, grid );
       
      var processingState = { 
        fieldName: 'col1', 
        initialised: true,
        currentValue: 'test',
        currentGroupHeader: headerRow,
        runningAggregations: [
          { fieldName: 'agg1', col: { groupingSuppressAggregationText: true }, type: uiGridGroupingConstants.aggregation.MAX, value: '1234'},
          { fieldName: 'agg2', col: { groupingSuppressAggregationText: true }, type: uiGridGroupingConstants.aggregation.MIN, value: 98 }
        ]
      };
      
      uiGridGroupingService.writeOutAggregation( grid, processingState );
      
      expect(headerRow.entity).toEqual({ agg1: '1234', agg2: 98 });
      expect(processingState).toEqual({
        fieldName: 'col1', 
        initialised: false,
        currentValue: null,
        currentGroupHeader: null,
        runningAggregations: [
          { fieldName: 'agg1', col: { groupingSuppressAggregationText: true }, type: uiGridGroupingConstants.aggregation.MAX, value: null},
          { fieldName: 'agg2', col: { groupingSuppressAggregationText: true }, type: uiGridGroupingConstants.aggregation.MIN, value: null }
        ]
      });
    });
  });
  
  
  describe( 'getExpandedState', function() {
    it( 'empty states', function() {
      grid.grouping.rowExpandedStates = {};
      
      var processingStates = [
        { 
          fieldName: 'col1', 
          currentValue: 'test'
        },
        { 
          fieldName: 'col2', 
          currentValue: 'blah'
        },
        { 
          fieldName: 'col3', 
          currentValue: 'fred'
        }
      ];
      
      var expandedState = uiGridGroupingService.getExpandedState( grid, processingStates, 1);
      
      expect( grid.grouping.rowExpandedStates ).toEqual(
        {
          test: {
            state: 'collapsed',
            blah: {
              state: 'collapsed'
            }
          }
        }
      );
      expect( expandedState ).toBe( grid.grouping.rowExpandedStates.test.blah);      
    });

    it( 'existing states', function() {
      grid.grouping.rowExpandedStates = {
        test: {
          state: 'collapsed',
          blah: {
            state: 'collapsed'
          },
          fred: {
            state: 'expanded'
          }
        }
      };
      
      var processingStates = [
        { 
          fieldName: 'col1', 
          currentValue: 'test'
        },
        { 
          fieldName: 'col2', 
          currentValue: 'blah'
        },
        { 
          fieldName: 'col3', 
          currentValue: 'fred'
        }
      ];
      
      var expandedState = uiGridGroupingService.getExpandedState( grid, processingStates, 1);
      
      expect( grid.grouping.rowExpandedStates ).toEqual(
        {
          test: {
            state: 'collapsed',
            blah: {
              state: 'collapsed'
            },
            fred: {
              state: 'expanded'
            }
          }
        }
      );
      expect( expandedState ).toBe( grid.grouping.rowExpandedStates.test.blah);      
    });
  });
  
  
  describe( 'setVisibility', function() {
    it( 'invisible', function() {
      var headerRow1 = new GridRow( {}, null, grid );
      var headerRow2 = new GridRow( {}, null, grid );
      
      headerRow1.expandedState = { state: uiGridGroupingConstants.EXPANDED };
      headerRow2.expandedState = { state: uiGridGroupingConstants.COLLAPSED };
      
      var processingStates = [
        { 
          fieldName: 'col1', 
          currentGroupHeader: headerRow1
        },
        { 
          fieldName: 'col2', 
          currentGroupHeader: headerRow2
        }
      ];
      
      uiGridGroupingService.setVisibility( grid, grid.rows[1], processingStates );
      expect( grid.rows[1].visible ).toEqual(false);
    });

    it( 'visible', function() {
      var headerRow1 = new GridRow( {}, null, grid );
      var headerRow2 = new GridRow( {}, null, grid );
      
      headerRow1.expandedState = { state: uiGridGroupingConstants.EXPANDED };
      headerRow2.expandedState = { state: uiGridGroupingConstants.EXPANDED };
      
      var processingStates = [
        { 
          fieldName: 'col1', 
          currentGroupHeader: headerRow1
        },
        { 
          fieldName: 'col2', 
          currentGroupHeader: headerRow2
        }
      ];
      
      uiGridGroupingService.setVisibility( grid, grid.rows[1], processingStates );
      expect( grid.rows[1].visible ).toEqual(true);
      expect( grid.rows[1].invisibleReason).toEqual(undefined);
    });
  });
  
  
  describe( 'aggregate', function() {
    it( 'aggregates many fields', function() {
      var groupFieldState = {
        runningAggregations: [
          { fieldName: 'col0', col: grid.columns[0], type: uiGridGroupingConstants.aggregation.COUNT, value: 3 },
          { fieldName: 'col1', col: grid.columns[1], type: uiGridGroupingConstants.aggregation.SUM, value: 48 },
          { fieldName: 'col2', col: grid.columns[2], type: uiGridGroupingConstants.aggregation.MAX, value: 5 },
          { fieldName: 'col3', col: grid.columns[3], type: uiGridGroupingConstants.aggregation.MIN, value: 28 }
        ]
      };
      
      var row = new GridRow( { col0: 'x', col1: 10, col2: '7', col3: '22' }, null, grid );
      
      uiGridGroupingService.aggregate( grid, row, groupFieldState);
      
      expect( groupFieldState ).toEqual({
        runningAggregations: [
          { fieldName: 'col0', col: grid.columns[0], type: uiGridGroupingConstants.aggregation.COUNT, value: 4 },
          { fieldName: 'col1', col: grid.columns[1], type: uiGridGroupingConstants.aggregation.SUM, value: 58 },
          { fieldName: 'col2', col: grid.columns[2], type: uiGridGroupingConstants.aggregation.MAX, value: '7' },
          { fieldName: 'col3', col: grid.columns[3], type: uiGridGroupingConstants.aggregation.MIN, value: '22' }
        ]
      });
    });

    it( 'aggregates many fields, doesn\'t trigger max and min', function() {
       var groupFieldState = {
        runningAggregations: [
          { fieldName: 'col0', col: grid.columns[0], type: uiGridGroupingConstants.aggregation.COUNT, value: 3 },
          { fieldName: 'col1', col: grid.columns[1], type: uiGridGroupingConstants.aggregation.SUM, value: 48 },
          { fieldName: 'col2', col: grid.columns[2], type: uiGridGroupingConstants.aggregation.MAX, value: 5 },
          { fieldName: 'col3', col: grid.columns[3], type: uiGridGroupingConstants.aggregation.MIN, value: 28 }
        ]
      };
      
      var row = new GridRow( { col0: 'x', col1: 10, col2: '3', col3: '30' }, null, grid );
      
      uiGridGroupingService.aggregate( grid, row, groupFieldState);
      
      expect( groupFieldState ).toEqual({
        runningAggregations: [
          { fieldName: 'col0', col: grid.columns[0], type: uiGridGroupingConstants.aggregation.COUNT, value: 4 },
          { fieldName: 'col1', col: grid.columns[1], type: uiGridGroupingConstants.aggregation.SUM, value: 58 },
          { fieldName: 'col2', col: grid.columns[2], type: uiGridGroupingConstants.aggregation.MAX, value: 5 },
          { fieldName: 'col3', col: grid.columns[3], type: uiGridGroupingConstants.aggregation.MIN, value: 28 }
        ]
      });
    });

    it( 'averages', function() {
       var groupFieldState = {
        runningAggregations: [
          { fieldName: 'col0', col: grid.columns[0], type: uiGridGroupingConstants.aggregation.AVG, value: 3, count: 2, sum: 6 },
          { fieldName: 'col1', col: grid.columns[1], type: uiGridGroupingConstants.aggregation.SUM, value: 48 },
          { fieldName: 'col2', col: grid.columns[2], type: uiGridGroupingConstants.aggregation.SUM, value: 5 },
          { fieldName: 'col3', col: grid.columns[3], type: uiGridGroupingConstants.aggregation.MIN, value: 28 }
        ]
      };
      
      var row = new GridRow( { col0: 6, col1: '10', col2: '3.3', col3: '30' }, null, grid );
      
      uiGridGroupingService.aggregate( grid, row, groupFieldState);
      
      expect(groupFieldState.runningAggregations[0].col).toEqual(grid.columns[0]);
      expect(groupFieldState.runningAggregations[1].col).toEqual(grid.columns[1]);
      expect(groupFieldState.runningAggregations[2].col).toEqual(grid.columns[2]);
      expect(groupFieldState.runningAggregations[3].col).toEqual(grid.columns[3]);
      delete groupFieldState.runningAggregations[0].col;
      delete groupFieldState.runningAggregations[1].col;
      delete groupFieldState.runningAggregations[2].col;
      delete groupFieldState.runningAggregations[3].col;
      expect( groupFieldState ).toEqual({
        runningAggregations: [
          { fieldName: 'col0', type: uiGridGroupingConstants.aggregation.AVG, value: 4, count: 3, sum: 12 },
          { fieldName: 'col1', type: uiGridGroupingConstants.aggregation.SUM, value: 58 },
          { fieldName: 'col2', type: uiGridGroupingConstants.aggregation.SUM, value: 8.3 },
          { fieldName: 'col3', type: uiGridGroupingConstants.aggregation.MIN, value: 28 }
        ]
      });
    });

    it( 'dates, text', function() {
      var now = new Date();
      var nowPlus = new Date();
      nowPlus.setDate(nowPlus.getDate() + 1);
      
      var groupFieldState = {
        runningAggregations: [
          { fieldName: 'col0', col: grid.columns[0], type: uiGridGroupingConstants.aggregation.MAX, value: now },
          { fieldName: 'col1', col: grid.columns[1], type: uiGridGroupingConstants.aggregation.MIN, value: nowPlus },
          { fieldName: 'col2', col: grid.columns[2], type: uiGridGroupingConstants.aggregation.MAX, value: 'x' },
          { fieldName: 'col3', col: grid.columns[3], type: uiGridGroupingConstants.aggregation.MIN, value: 'y' }
        ]
      };
      
      var row = new GridRow( { col0: nowPlus, col1: now, col2: 'y', col3: 'x' }, null, grid );
      
      uiGridGroupingService.aggregate( grid, row, groupFieldState);
      
      expect(groupFieldState.runningAggregations[0].col).toEqual(grid.columns[0]);
      expect(groupFieldState.runningAggregations[1].col).toEqual(grid.columns[1]);
      expect(groupFieldState.runningAggregations[2].col).toEqual(grid.columns[2]);
      expect(groupFieldState.runningAggregations[3].col).toEqual(grid.columns[3]);
      delete groupFieldState.runningAggregations[0].col;
      delete groupFieldState.runningAggregations[1].col;
      delete groupFieldState.runningAggregations[2].col;
      delete groupFieldState.runningAggregations[3].col;
      expect( groupFieldState ).toEqual({
        runningAggregations: [
          { fieldName: 'col0', type: uiGridGroupingConstants.aggregation.MAX, value: nowPlus },
          { fieldName: 'col1', type: uiGridGroupingConstants.aggregation.MIN, value: now },
          { fieldName: 'col2', type: uiGridGroupingConstants.aggregation.MAX, value: 'y' },
          { fieldName: 'col3', type: uiGridGroupingConstants.aggregation.MIN, value: 'x' }
        ]
      });
    });
  });
});