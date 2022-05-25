describe('ui.grid.treeBase uiGridTreeBaseService', function() {
	var uiGridTreeBaseService,
		uiGridTreeBaseConstants,
		gridClassFactory,
		grid,
		$rootScope,
		$scope,
		GridRow,
		gridUtil,
		uiGridConstants;

	beforeEach(function() {
		module('ui.grid.treeBase');

		inject(function(_uiGridTreeBaseService_, _gridClassFactory_, $templateCache, _uiGridTreeBaseConstants_,
			_$rootScope_, _GridRow_, _gridUtil_, _uiGridConstants_) {
			uiGridTreeBaseService = _uiGridTreeBaseService_;
			uiGridTreeBaseConstants = _uiGridTreeBaseConstants_;
			gridClassFactory = _gridClassFactory_;
			$rootScope = _$rootScope_;
			GridRow = _GridRow_;
			gridUtil = _gridUtil_;
			uiGridConstants = _uiGridConstants_;
		});
		$scope = $rootScope.$new();

		grid = gridClassFactory.createGrid({});
		grid.options.columnDefs = [
			{field: 'col0'},
			{field: 'col1'},
			{field: 'col2'},
			{field: 'col3'}
		];

		spyOn(grid, 'addRowHeaderColumn').and.callThrough();
		uiGridTreeBaseService.initializeGrid(grid, $scope);
		$scope.$apply();

		var data = [];
		for (var i = 0; i < 10; i++) {
			data.push({col0: 'a_' + Math.floor(i / 4), col1: Math.floor(i / 2), col2: 'c_' + i, col3: i});
		}
		data[0].$$treeLevel = 0;
		data[1].$$treeLevel = 1;
		data[3].$$treeLevel = 1;
		data[4].$$treeLevel = 2;
		data[7].$$treeLevel = 0;
		data[9].$$treeLevel = 1;

		grid.options.data = data;

		grid.buildColumns();
		grid.modifyRows(grid.options.data);
	});

	describe('initializeGrid and defaultGridOptions', function() {
		it('initializeGrid defaults things and creates rowsProcessor as expected', function() {
			var previousRowsProcessors = grid.rowsProcessors.length;
			uiGridTreeBaseService.initializeGrid(grid, $scope);

			expect(grid.treeBase).toEqual({numberLevels: 0, expandAll: false, tree: []}, 'grid.treeBase should be defaulted');
			expect(grid.api.treeBase.expandAllRows).toEqual(jasmine.any(Function), 'expandAllRows should be defined as an example function');
			expect(grid.api.treeBase.on.rowExpanded).toEqual(jasmine.any(Function), 'rowExpanded should be defined as an example event');

			expect(grid.rowsProcessors.length).toEqual(previousRowsProcessors + 1);
		});

		it('defaultGridOptions defaults things as expected', function() {
			var options = {};
			uiGridTreeBaseService.defaultGridOptions(options);

			expect(options).toEqual({
				treeRowHeaderBaseWidth: 30,
				treeIndent: 10,
				showTreeRowHeader: true,
				showTreeExpandNoChildren: true,
				treeRowHeaderAlwaysVisible: true,
				treeCustomAggregations: {},
				enableExpandAll: true
			});
		});
		it('should call addRowHeaderColumn', function() {
			expect(grid.addRowHeaderColumn).toHaveBeenCalledWith(jasmine.any(Object), -100);
		});
	});

	describe('tree expand/collapse and event handling', function() {
		var expandCount, collapseCount, treeRows;
		beforeEach(function() {
			expandCount = 0;
			collapseCount = 0;

			grid.api.treeBase.on.rowExpanded($scope, function(row) {
				expandCount++;
			});

			grid.api.treeBase.on.rowCollapsed($scope, function(row) {
				collapseCount++;
			});

			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));

			grid.rows.forEach(function(row) {
				row.visible = true;
			});
		});

		it('expandAll', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandAllRows();
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(10, 'all rows are visible');
			expect(expandCount).toEqual(10);
		});

		it('expandRow', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandRow(grid.rows[0]);
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(4, 'children of row 0 are also visible');
			expect(expandCount).toEqual(1);
		});

		it('expandRow recursively', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandRow(grid.rows[4], true);
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(7, 'children of row 0, row 3 and row 4 are also visible');
			expect(expandCount).toEqual(3);
		});

		it('expandRowChildren', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandRowChildren(grid.rows[0]);
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(8, 'all children of row 0 are also visible');
			expect(expandCount).toEqual(7, 'called for row 0, 1, 2, 3, 4, 5 and 6');
		});

		it('collapseRow', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandAllRows();
			grid.api.treeBase.collapseRow(grid.rows[7]);
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(8, 'children of row 7 are hidden');
			expect(collapseCount).toEqual(1);
		});

		it('collapseRowChildren', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandAllRows();
			grid.api.treeBase.collapseRowChildren(grid.rows[0]);
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(4, 'children of row 0 are hidden');
			expect(collapseCount).toEqual(7, 'called for row 0, 1, 2, 3, 4, 5, and 6');
		});

		it('collapseAllRows', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			grid.api.treeBase.expandAllRows();
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(10, 'all rows visible');

			grid.api.treeBase.collapseAllRows();
			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(2, 'only level 0 is visible');
			expect(collapseCount).toEqual(10);
		});

		it('getRowChildren', function() {
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');

			treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(grid.api.treeBase.getRowChildren(grid.rows[7]).length).toEqual(2);
		});
	});

	describe('treeRows', function() {
		it('tree the rows', function() {
			var treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));
			expect(treeRows.length).toEqual(2, 'only the level 0 rows are visible');
			expect(grid.treeBase.numberLevels).toEqual(3, 'three levels in the tree');
		});
	});

	describe('renderTree', function() {
		it('renders a tree of no nodes', function() {
			grid.treeBase.tree = [];

			var rows = uiGridTreeBaseService.renderTree(grid.treeBase.tree);
			expect(rows).toEqual([]);
		});

		it('renders a tree of one node', function() {
			grid.treeBase.tree = [
				{row: {name: 'testRow', visible: true}, state: 'collapsed', children: []}
			];

			var rows = uiGridTreeBaseService.renderTree(grid.treeBase.tree);
			expect(rows).toEqual([
				{name: 'testRow', visible: true}
			]);
		});

		it('renders a nested tree with collapsed and expanded nodes, and some invisible nodes', function() {
			grid.treeBase.tree = [
				{
					row: {name: 'testRow1', visible: true}, state: 'collapsed', children: [
					{row: {name: 'testRow1-1', visible: true}, state: 'collapsed', children: []},
					{row: {name: 'testRow1-2', visible: false}, state: 'collapsed', children: []}
				]
				},
				{
					row: {name: 'testRow2', visible: true}, state: 'expanded', children: [
					{row: {name: 'testRow2-1', visible: true}, state: 'collapsed', children: []},
					{row: {name: 'testRow2-2', visible: false}, state: 'collapsed', children: []}
				]
				},
				{
					row: {name: 'testRow2', visible: false}, state: 'expanded', children: [
					{row: {name: 'testRow3-1', visible: true}, state: 'collapsed', children: []},
					{row: {name: 'testRow3-2', visible: false}, state: 'collapsed', children: []}
				]
				}
			];

			var rows = uiGridTreeBaseService.renderTree(grid.treeBase.tree);
			expect(rows).toEqual([
				{name: 'testRow1', visible: true},
				{name: 'testRow2', visible: true},
				{name: 'testRow2-1', visible: true},
				{name: 'testRow3-1', visible: true}
			]);
		});
	});

	describe('createTree', function() {
		it('create tree with no nodes', function() {
			var rows = [];
			var tree = uiGridTreeBaseService.createTree(grid, rows);

			expect(tree).toEqual([], 'empty tree');
			expect(grid.treeBase.numberLevels).toEqual(0, 'zero levels in the tree');
			expect(grid.treeBase.tree).toEqual([], 'empty tree');
		});

		it('create tree with one row', function() {
			var rows = [
				{uid: 1, entity: {$$treeLevel: 0}, visible: true}
			];
			var tree = uiGridTreeBaseService.createTree(grid, rows);

			expect(rows.length).toEqual(1, 'still only 1 row');
			expect(rows[0].treeNode).toEqual(grid.treeBase.tree[0], 'treeNode is the first node in the tree');
			delete rows[0].treeNode;
			expect(rows[0]).toEqual({uid: 1, treeLevel: 0, entity: {$$treeLevel: 0}, visible: true}, 'treeLevel copied down');
			expect(grid.treeBase.numberLevels).toEqual(1, 'one level in the tree');
			expect(grid.treeBase.tree.length).toEqual(1, 'one node at root level of tree');
			expect(grid.treeBase.tree[0].row).toEqual(rows[0], 'node is for row 0');
			delete grid.treeBase.tree[0].row;
			expect(grid.treeBase.tree[0]).toEqual({state: 'collapsed', parentRow: null, aggregations: [], children: []});
		});

		it('create tree with five rows', function() {
			var rows = [
				{uid: 1, entity: {$$treeLevel: 0}},
				{uid: 2, entity: {$$treeLevel: 1}},
				{uid: 3, entity: {$$treeLevel: 0}},
				{uid: 4, entity: {$$treeLevel: 1}},
				{uid: 5, entity: {$$treeLevel: 1}}
			];

			var tree = uiGridTreeBaseService.createTree(grid, rows);

			// overall settings
			expect(grid.treeBase.numberLevels).toEqual(2, 'two levels in the tree');

			// rows
			expect(rows.length).toEqual(5, 'still only 5 rows');

			// row 0
			expect(rows[0].treeNode).toEqual(grid.treeBase.tree[0], 'row 0 treeNode is the first node in the tree');
			delete rows[0].treeNode;
			expect(rows[0]).toEqual({uid: 1, treeLevel: 0, entity: {$$treeLevel: 0}}, 'row 0 treeLevel copied down');

			// row 1
			expect(rows[1].treeNode).toEqual(grid.treeBase.tree[0].children[0], 'row 1 treeNode is the first child of first node in the tree');
			delete rows[1].treeNode;
			expect(rows[1]).toEqual({uid: 2, treeLevel: 1, entity: {$$treeLevel: 1}}, 'row 1 treeLevel copied down');

			// row 2
			expect(rows[2].treeNode).toEqual(grid.treeBase.tree[1], 'row 2 treeNode is the second node in the tree');
			delete rows[2].treeNode;
			expect(rows[2]).toEqual({uid: 3, treeLevel: 0, entity: {$$treeLevel: 0}}, 'row 2 treeLevel copied down');

			// row 3
			expect(rows[3].treeNode).toEqual(grid.treeBase.tree[1].children[0], 'row 3 treeNode is the first child of second node in the tree');
			delete rows[3].treeNode;
			expect(rows[3]).toEqual({uid: 4, treeLevel: 1, entity: {$$treeLevel: 1}}, 'row 3 treeLevel copied down');

			// row 4
			expect(rows[4].treeNode).toEqual(grid.treeBase.tree[1].children[1], 'row 4 treeNode is the second child of the second node in the tree');
			delete rows[4].treeNode;
			expect(rows[4]).toEqual({uid: 5, treeLevel: 1, entity: {$$treeLevel: 1}}, 'row 4 treeLevel copied down');

			// tree checking
			expect(grid.treeBase.tree.length).toEqual(2, 'two nodes at root level of tree');

			// first parent
			expect(grid.treeBase.tree[0].row).toEqual(rows[0], 'first parent node is for row 0');
			delete grid.treeBase.tree[0].row;

			// second parent
			expect(grid.treeBase.tree[1].row).toEqual(rows[2], 'second parent node is for row 2');
			delete grid.treeBase.tree[1].row;

			// first child of first parent
			expect(grid.treeBase.tree[0].children[0].row).toEqual(rows[1], 'first child of first parent node is for row 1');
			delete grid.treeBase.tree[0].children[0].row;
			expect(grid.treeBase.tree[0].children[0].parentRow).toEqual(rows[0], 'parent of first child of first parent points up the tree to row 0');
			delete grid.treeBase.tree[0].children[0].parentRow;

			// first child of second parent
			expect(grid.treeBase.tree[1].children[0].row).toEqual(rows[3], 'first child of second parent node is for row 3');
			delete grid.treeBase.tree[1].children[0].row;
			expect(grid.treeBase.tree[1].children[0].parentRow).toEqual(rows[2], 'parent of first child of second parent points up the tree to row 2');
			delete grid.treeBase.tree[1].children[0].parentRow;

			// second child of second parent
			expect(grid.treeBase.tree[1].children[1].row).toEqual(rows[4], 'second child of second parent node is for row 4');
			delete grid.treeBase.tree[1].children[1].row;
			expect(grid.treeBase.tree[1].children[1].parentRow).toEqual(rows[2], 'parent of second child of second parent points up the tree to row 2');
			delete grid.treeBase.tree[1].children[1].parentRow;

			expect(grid.treeBase.tree).toEqual([
				{
					state: 'collapsed', parentRow: null, aggregations: [], children: [
					{state: 'collapsed', aggregations: [], children: []}
				]
				},
				{
					state: 'collapsed', parentRow: null, aggregations: [], children: [
					{state: 'collapsed', aggregations: [], children: []},
					{state: 'collapsed', aggregations: [], children: []}
				]
				}
			]);
		});

		describe('create tree with ten rows including leaf nodes and aggregations', function() {
			var rows;
			beforeEach(function() {
				rows = [
					{uid: 1, entity: {$$treeLevel: 0, col3: 5}, visible: true},
					{uid: 2, entity: {$$treeLevel: 1, col3: 7}, visible: true},
					{uid: '2-1', entity: {col3: 11}, visible: true},
					{uid: 3, entity: {$$treeLevel: 0, col3: null}, visible: true},
					{uid: '3-1', entity: {col3: 2}, visible: true},
					{uid: 4, entity: {$$treeLevel: 1, col3: 20}, visible: true},
					{uid: '4-1', entity: {col3: 9}, visible: true},
					{uid: '4-2', entity: {col3: 11}, visible: true},
					{uid: 5, entity: {$$treeLevel: 1, col3: 'test'}, visible: true},
					{uid: '5-1', entity: {col3: 21}, visible: true}
				];
				spyOn(grid, 'getCellValue').and.callFake(function(row, col) {
					return row.entity.col3;
				});
			});

			it('', function() {
				grid.columns[3].treeAggregationType = 'sum';
				grid.columns[3].uid = 'col3';

				var tree = uiGridTreeBaseService.createTree(grid, rows);

				// overall settings
				expect(grid.treeBase.numberLevels).toEqual(2, 'two levels in the tree');

				// rows
				expect(rows.length).toEqual(10, 'still only 10 rows');

				// some more checking of aggregations would be nice, but they've been unit tested at the function level
			});
		});
	});

	describe('addOrUseNode', function() {
		it('root row that has no old reference to a node, default state should be collapsed', function() {
			var fakeRow = {
				treeLevel: 0
			};

			grid.treeBase.tree = [];

			var parents = [];
			var aggregations = [];

			uiGridTreeBaseService.addOrUseNode(grid, fakeRow, parents, aggregations);

			expect(grid.treeBase.tree).toEqual([{
				state: 'collapsed',
				row: fakeRow,
				parentRow: null,
				aggregations: [],
				children: []
			}], 'tree should now have this row at the root level');

			expect(fakeRow).toEqual({
				treeNode: grid.treeBase.tree[0],
				treeLevel: 0
			}, 'this row should have a reference to the node in the tree');
		});

		it('root row that has an old reference to a node, uses state from that node', function() {
			var fakeRow = {
				treeNode: {state: 'expanded'},
				treeLevel: 0
			};

			grid.treeBase.tree = [];

			var parents = [];
			var aggregations = [];

			uiGridTreeBaseService.addOrUseNode(grid, fakeRow, parents, aggregations);

			expect(grid.treeBase.tree).toEqual([{
				state: 'expanded',
				row: fakeRow,
				parentRow: null,
				aggregations: [],
				children: []
			}], 'tree should now have this row in the children');

			expect(fakeRow).toEqual({
				treeNode: grid.treeBase.tree[0],
				treeLevel: 0
			}, 'this row should have a reference to the node in the tree');
		});

		it('child row that has no old reference to a node, default state should be collapsed', function() {
			var fakeRootRow = {
				treeLevel: 0
			};

			var fakeRow = {
				treeLevel: 1
			};

			grid.treeBase.tree = [{
				state: 'expanded',
				row: fakeRootRow,
				parentRow: null,
				aggregations: [],
				children: []
			}];

			fakeRootRow.treeNode = grid.treeBase.tree[0];

			var parents = [fakeRootRow];
			var aggregations = [];

			uiGridTreeBaseService.addOrUseNode(grid, fakeRow, parents, aggregations);

			expect(grid.treeBase.tree[0].children[0]).toEqual({
				state: 'collapsed',
				row: fakeRow,
				parentRow: fakeRootRow,
				aggregations: [],
				children: []
			}, 'tree should now have this row in the children of the fakeRootRow');

			expect(fakeRow).toEqual({
				treeNode: fakeRootRow.treeNode.children[0],
				treeLevel: 1
			}, 'this row should have a reference to the node in the tree');
		});

		it('child row that has an old reference to a node, default state should be collapsed', function() {
			var fakeRootRow = {
				treeLevel: 0
			};

			var fakeRow = {
				treeNode: {state: 'expanded'},
				treeLevel: 1
			};

			grid.treeBase.tree = [{
				state: 'expanded',
				row: fakeRootRow,
				parentRow: null,
				aggregations: [],
				children: []
			}];

			fakeRootRow.treeNode = grid.treeBase.tree[0];

			var parents = [fakeRootRow];
			var aggregations = [];

			uiGridTreeBaseService.addOrUseNode(grid, fakeRow, parents, aggregations);

			expect(grid.treeBase.tree[0].children[0]).toEqual({
				state: 'expanded',
				row: fakeRow,
				parentRow: fakeRootRow,
				aggregations: [],
				children: []
			}, 'tree should now have this row in the children of the fakeRootRow');

			expect(fakeRow).toEqual({
				treeNode: fakeRootRow.treeNode.children[0],
				treeLevel: 1
			}, 'this row should have a reference to the node in the tree');
		});

		it('leaf row at the root level', function() {
			var fakeRow = {};

			grid.treeBase.tree = [];

			var parents = [];
			var aggregations = [];

			uiGridTreeBaseService.addOrUseNode(grid, fakeRow, parents, aggregations);

			expect(grid.treeBase.tree[0]).toEqual({
				state: 'collapsed',
				row: fakeRow,
				parentRow: null,
				aggregations: [],
				children: []
			}, 'tree should now have this row in the children of the fakeRootRow');

			expect(fakeRow).toEqual({
				treeNode: grid.treeBase.tree[0]
			}, 'this row should have a reference to the node in the tree');
		});

		it('leaf row at the child level', function() {
			var fakeRootRow = {
				treeLevel: 0
			};

			var fakeRow = {};

			grid.treeBase.tree = [{
				state: 'expanded',
				row: fakeRootRow,
				parentRow: null,
				children: []
			}];

			fakeRootRow.treeNode = grid.treeBase.tree[0];

			var parents = [fakeRootRow];
			var aggregations = [];

			uiGridTreeBaseService.addOrUseNode(grid, fakeRow, parents, aggregations);

			expect(grid.treeBase.tree[0].children[0]).toEqual({
				state: 'collapsed',
				row: fakeRow,
				parentRow: fakeRootRow,
				aggregations: [],
				children: []
			}, 'tree should now have this row in the children of the fakeRootRow');

			expect(fakeRow).toEqual({
				treeNode: fakeRootRow.treeNode.children[0]
			}, 'this row should have a reference to the node in the tree');
		});
	});

	describe('sortTree', function() {
		it('sort empty tree', function() {
			grid.treeBase.tree = [];
			uiGridTreeBaseService.sortTree(grid);
			expect(grid.treeBase.tree).toEqual([]);
		});

		it('sort single level tree, no sort criteria, one row', function() {
			grid.treeBase.tree = [
				{state: 'collapsed', row: {uid: 1, entity: {field1: 1}}, children: []}
			];
			grid.treeBase.tree[0].row.treeNode = grid.treeBase.tree[0];

			uiGridTreeBaseService.sortTree(grid);

			delete grid.treeBase.tree[0].row.treeNode;
			expect(grid.treeBase.tree).toEqual([
				{state: 'collapsed', row: {uid: 1, entity: {field1: 1}}, children: []}
			]);
		});

		it('sort our tree', function() {
			grid.columns[1].sort = {direction: uiGridConstants.ASC};
			grid.columns[2].sort = {direction: uiGridConstants.DESC};
			grid.columns[1].type = 'string';
			grid.columns[2].type = 'number';

			var treeRows = uiGridTreeBaseService.treeRows.call(grid, grid.rows.slice(0));

			expect(grid.treeBase.tree.length).toEqual(2);
			expect(grid.treeBase.tree[0].children.length).toEqual(2);
			expect(grid.treeBase.tree[1].children.length).toEqual(2);
		});
	});

	describe('fixFilter', function() {
		it('fix empty tree', function() {
			grid.treeBase.tree = [];
			uiGridTreeBaseService.fixFilter(grid);
			expect(grid.treeBase.tree).toEqual([]);
		});

		it('fix tree with mix of visible and invisible rows, collapsed and not collapsed', function() {
			grid.treeBase.tree = [
				{
					row: {uid: '1', visible: true}, state: 'expanded', children: [
					{
						row: {uid: '1-1', visible: false}, state: 'expanded', children: [
						{row: {uid: '1-1-1', visible: false}, state: 'expanded', children: []},
						{row: {uid: '1-1-2', visible: true}, state: 'expanded', children: []}
					]
					},
					{
						row: {uid: '1-2', visible: false}, state: 'collapsed', children: [
						{row: {uid: '1-2-1', visible: false}, state: 'expanded', children: []},
						{row: {uid: '1-2-2', visible: true}, state: 'expanded', children: []}
					]
					},
					{
						row: {uid: '1-3', visible: false}, state: 'collapsed', children: [
						{row: {uid: '1-3-1', visible: false}, state: 'expanded', children: []},
						{row: {uid: '1-3-2', visible: false}, state: 'expanded', children: []}
					]
					}
				]
				},
				{
					row: {uid: '2', visible: false}, state: 'collapsed', children: [
					{
						row: {uid: '2-1', visible: true}, state: 'expanded', children: []
					}
				]
				},
				{
					row: {uid: '3', visible: false}, state: 'expanded', children: [
					{
						row: {uid: '3-1', visible: true}, state: 'collapsed', children: []
					}
				]
				},
				{
					row: {uid: '4', visible: false}, state: 'expanded', children: [
					{
						row: {uid: '4-1', visible: false}, state: 'collapsed', children: []
					}
				]
				}
			];

			// setup the treeNode references
			grid.treeBase.tree[0].row.treeNode = grid.treeBase.tree[0];
			grid.treeBase.tree[1].row.treeNode = grid.treeBase.tree[1];
			grid.treeBase.tree[2].row.treeNode = grid.treeBase.tree[2];
			grid.treeBase.tree[3].row.treeNode = grid.treeBase.tree[3];

			grid.treeBase.tree[0].children[0].row.treeNode = grid.treeBase.tree[0].children[0];
			grid.treeBase.tree[0].children[1].row.treeNode = grid.treeBase.tree[0].children[1];
			grid.treeBase.tree[0].children[2].row.treeNode = grid.treeBase.tree[0].children[2];
			grid.treeBase.tree[1].children[0].row.treeNode = grid.treeBase.tree[1].children[0];
			grid.treeBase.tree[2].children[0].row.treeNode = grid.treeBase.tree[2].children[0];

			grid.treeBase.tree[0].children[0].children[0].row.treeNode = grid.treeBase.tree[0].children[0].children[0];
			grid.treeBase.tree[0].children[0].children[1].row.treeNode = grid.treeBase.tree[0].children[0].children[1];
			grid.treeBase.tree[0].children[1].children[0].row.treeNode = grid.treeBase.tree[0].children[1].children[0];
			grid.treeBase.tree[0].children[1].children[1].row.treeNode = grid.treeBase.tree[0].children[1].children[1];
			grid.treeBase.tree[0].children[2].children[0].row.treeNode = grid.treeBase.tree[0].children[2].children[0];
			grid.treeBase.tree[0].children[2].children[1].row.treeNode = grid.treeBase.tree[0].children[2].children[1];

			// setup the parentRow references
			grid.treeBase.tree[0].children[0].parentRow = grid.treeBase.tree[0].row;
			grid.treeBase.tree[0].children[1].parentRow = grid.treeBase.tree[0].row;
			grid.treeBase.tree[1].children[0].parentRow = grid.treeBase.tree[1].row;
			grid.treeBase.tree[2].children[0].parentRow = grid.treeBase.tree[2].row;
			grid.treeBase.tree[3].children[0].parentRow = grid.treeBase.tree[3].row;

			grid.treeBase.tree[0].children[0].children[0].parentRow = grid.treeBase.tree[0].children[0].row;
			grid.treeBase.tree[0].children[0].children[1].parentRow = grid.treeBase.tree[0].children[0].row;
			grid.treeBase.tree[0].children[1].children[0].parentRow = grid.treeBase.tree[0].children[1].row;
			grid.treeBase.tree[0].children[1].children[1].parentRow = grid.treeBase.tree[0].children[1].row;
			grid.treeBase.tree[0].children[2].children[0].parentRow = grid.treeBase.tree[0].children[2].row;
			grid.treeBase.tree[0].children[2].children[1].parentRow = grid.treeBase.tree[0].children[2].row;

			uiGridTreeBaseService.fixFilter(grid);

			expect(grid.treeBase.tree[1].row.visible).toEqual(true, 'tree[1] should have changed to visible');
			expect(grid.treeBase.tree[2].row.visible).toEqual(true, 'tree[2] should have changed to visible');
			expect(grid.treeBase.tree[3].row.visible).toEqual(false, 'tree[3] has no visible children, shouldn\'t have changed to visible');
			expect(grid.treeBase.tree[0].children[0].row.visible).toEqual(true, 'tree[0].children[0] should have changed to visible');
			expect(grid.treeBase.tree[0].children[1].row.visible).toEqual(true, 'tree[0].children[1] should have changed to visible');
			expect(grid.treeBase.tree[0].children[2].row.visible).toEqual(false,
				'tree[0].children[2] has no visible children, shouldn\'t have changed to visible');
		});
	});

	describe('getAggregations', function() {
		it('no aggregations', function() {
			expect(uiGridTreeBaseService.getAggregations(grid)).toEqual([]);
		});

		it('two aggregations, one looks up label', function() {
			// treeBase has added a rowHeader column, so columns shifted right by one
			grid.columns[2].treeAggregation = {type: 'sum', label: uiGridTreeBaseService.nativeAggregations().sum.label};
			grid.columns[2].treeAggregationFn = uiGridTreeBaseService.nativeAggregations().sum.aggregationFn;

			grid.columns[3].treeAggregationFn = angular.noop;
			grid.columns[3].treeAggregation = {label: 'custom- '};

			var result = uiGridTreeBaseService.getAggregations(grid);
			expect(result.length).toEqual(2, '2 aggregated columns');
			expect(result[0].col.name).toEqual('col1', 'col1 is first aggregation');
			delete result[0].col;
			expect(result[1].col.name).toEqual('col2', 'col2 is second aggregation');
			delete result[1].col;
			expect(result).toEqual([
				{
					type: 'sum',
					label: 'total: '
				},
				{
					label: 'custom- '
				}
			]);
		});
	});

	describe('aggregate', function() {
		it('no parents', function() {
			var parents = [];

			uiGridTreeBaseService.aggregate(grid, grid.rows[0], parents);

			expect(parents).toEqual([]);
		});

		it('no aggregations', function() {
			var parents = [
				{treeNode: {aggregations: []}},
				{treeNode: {aggregations: []}}
			];

			uiGridTreeBaseService.aggregate(grid, grid.rows[0], parents);

			expect(parents).toEqual([
				{treeNode: {aggregations: []}},
				{treeNode: {aggregations: []}}
			]);
		});

		it('some aggregations over two parents', function() {
			var customAggregation = function(aggregation, fieldValue, numValue) {
				aggregation.custom = numValue / 2;
			};

			grid.columns[4].treeAggregationFn = customAggregation;

			var parents = [
				{
					treeNode: {
						aggregations: [
							{col: grid.columns[4], custom: 20}
						]
					}
				},
				{
					treeNode: {
						aggregations: [
							{col: grid.columns[4], custom: 19}
						]
					}
				}
			];

			uiGridTreeBaseService.aggregate(grid, grid.rows[2], parents);

			// remove column references, they make it impossible to see what's going on in failure messages
			parents.forEach(function(parent) {
				parent.treeNode.aggregations.forEach(function(aggregation) {
					delete aggregation.col;
				});
			});

			expect(parents[0].treeNode.aggregations[0]).toEqual({custom: 1});

			expect(parents[1].treeNode.aggregations[0]).toEqual({custom: 1});
		});
	});

	describe('finaliseAggregations', function() {
		it('no aggregations', function() {
			var fakeRow = {
				treeNode: {
					aggregations: []
				}
			};

			uiGridTreeBaseService.finaliseAggregations(fakeRow);

			expect(fakeRow).toEqual({
				treeNode: {
					aggregations: []
				}
			});
		});

		it('some aggregations', function() {
			var fakeColumn = {
				uid: '123', treeAggregationUpdateEntity: true, customTreeAggregationFinalizerFn: function(aggregation) {
					aggregation.rendered = 'custom';
				}
			};

			var fakeRow = {
				entity: {}, treeNode: {
					aggregations: [
						{value: 10, label: 'test: ', col: fakeColumn},
						{value: 10, label: 'test: ', col: {uid: '345', treeAggregationUpdateEntity: true}}
					]
				}
			};

			uiGridTreeBaseService.finaliseAggregations(fakeRow);

			delete fakeRow.treeNode.aggregations[0].col;
			delete fakeRow.treeNode.aggregations[1].col;

			expect(fakeRow).toEqual({
				entity: {
					$$123: {value: 10, label: 'test: ', rendered: 'custom'},
					$$345: {value: 10, label: 'test: ', rendered: 'test: 10'}
				}, treeNode: {
					aggregations: [
						{value: 10, label: 'test: ', rendered: 'custom'},
						{value: 10, label: 'test: ', rendered: 'test: 10'}
					]
				}
			});
		});
	});
});
