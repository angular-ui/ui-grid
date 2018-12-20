describe('Grid factory', function() {
	var $timeout, $q, $scope, grid, Grid, GridRow, GridColumn, rows, returnedRows, column, uiGridConstants,
		gridClassFactory, gridUtil;

	beforeEach(function() {
		module('ui.grid');

		inject(function(_$timeout_, _$q_, _$rootScope_, _Grid_, _GridRow_, _GridColumn_, _uiGridConstants_,
			_gridClassFactory_, _gridUtil_) {
			$timeout = _$timeout_;
			$q = _$q_;
			$scope = _$rootScope_;
			Grid = _Grid_;
			GridRow = _GridRow_;
			GridColumn = _GridColumn_;
			uiGridConstants = _uiGridConstants_;
			gridClassFactory = _gridClassFactory_;
			gridUtil = _gridUtil_;
		});
		grid = new Grid({id: 1});
		rows = [
			new GridRow({a: 'one'}, 0, grid),
			new GridRow({a: 'two'}, 1, grid)
		];

		column = new GridColumn({name: 'a'}, 0, grid);

		grid.rows = rows;
		grid.columns = [column];

		returnedRows = null;
	});

	function runProcs(done) {
		grid.processRowsProcessors(grid.rows)
			.then(function(newRows) {
				returnedRows = newRows;
				done();
			});

		$scope.$digest();
	}

	describe('scrollToIfNecessary', function() {
		var renderContainers;
		var prevScrollTop = 100;
		var viewportWidth = 100;
		var viewportHeight = 100;
		var canvasHeight = 360;
		var canvasWidth = 100;

		beforeEach(function() {
			renderContainers = {
				body: {
					visibleRowCache: null,
					visibleColumnCache: null,
					prevScrollTop: prevScrollTop,
					headerHeight: 30,
					getViewportWidth: jasmine.createSpy('getViewportWidth').and.callFake(function() {
						return viewportWidth;
					}),
					getViewportHeight: jasmine.createSpy('getViewportWidth').and.callFake(function() {
						return viewportHeight;
					}),
					getCanvasHeight: jasmine.createSpy('getCanvasHeight').and.callFake(function() {
						return canvasHeight;
					}),
					getCanvasWidth: jasmine.createSpy('getCanvasHeight').and.callFake(function() {
						return canvasWidth;
					})
				}
			};
		});

		it('should not scroll.y when scrollpercentage > 100% when row is less then top boundry', function() {
			// row is less then the top boundary
			var rowCache = [];
			for (var i = 0; i < 9; i++) {
				rowCache.push(i);
			}
			rowCache.push(rows[1]);
			renderContainers.body.prevScrollTop = 100;
			renderContainers.body.visibleRowCache = rowCache;
			renderContainers.body.visibleColumnCache = [column];
			grid.renderContainers = renderContainers;

			// try to scroll to row 10
			grid.scrollToIfNecessary(rowCache[9], column).then(function(scrollEvent) {
				expect(scrollEvent).toBeUndefined();
			});

			$scope.$apply();
		});

		it('should not scroll.y when scrollpercentage > 100% when row is more then top boundry', function() {
			// row is more then the top boundary
			var rowCache = [];
			for (var i = 0; i < 9; i++) {
				rowCache.push(i);
			}
			rowCache.push(rows[1]);
			renderContainers.body.prevScrollTop = 300;
			renderContainers.body.visibleRowCache = rowCache;
			renderContainers.body.visibleColumnCache = [column];
			grid.renderContainers = renderContainers;

			// try to scroll to row 10
			grid.scrollToIfNecessary(rowCache[9], column).then(function(scrollEvent) {
				expect(scrollEvent).toBeUndefined();
			});

			$scope.$apply();
		});
	});

	describe('constructor', function() {
		it('should throw an exception if no id is provided', function() {
			expect(function() {
				var grid = new Grid();
			}).toThrow(new Error('No ID provided. An ID must be given when creating a grid.'));
		});

		it('should throw an exception if the provided id is invalid', function() {
			expect(function() {
				var grid = new Grid({id: 'blah blah'});
			}).toThrow();
		});

		it("should say a grid ID is invalid when it doesn't follow CSS selector rules", function() {
			try {
				var grid = new Grid({id: 'blah blah'});
			}
			catch (e) {
				expect(e).toMatch(/It must follow CSS selector syntax rules/);
			}
		});
		describe('scrollbarHeight and scrollbarWidth', function() {
			beforeEach(function() {
				spyOn(gridUtil, 'getScrollbarWidth').and.returnValue(100);
			});
			afterEach(function() {
				gridUtil.getScrollbarWidth.calls.reset();
			});
			describe('when enableHorizontalScrollbar not equal to NEVER', function() {
				it('should set scrollbarHeight and scrollbarWidth', function() {
					var grid = new Grid({
						id: 1,
						enableHorizontalScrollbar: uiGridConstants.scrollbars.ALWAYS,
						enableVerticalScrollbar: uiGridConstants.scrollbars.ALWAYS
					});

					expect(grid.scrollbarHeight).toEqual(100);
					expect(grid.scrollbarWidth).toEqual(100);
				});
			});
			describe('when enableHorizontalScrollbar is equal to NEVER', function() {
				it('should set scrollbarHeight and scrollbarWidth to 0', function() {
					var grid = new Grid({
						id: 1,
						enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
						enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER
					});

					expect(grid.scrollbarHeight).toEqual(0);
					expect(grid.scrollbarWidth).toEqual(0);
				});
			});
		});
	});

	describe('row processors', function() {
		var proc1, proc2;

		// Stub for adding function spies to
		function testObj() {

		}

		/* Actual rows processors */
		proc1 = function(rows) {
			rows.forEach(function(r) {
				r.c = 'foo';
			});

			return rows;
		};

		proc2 = function(rows) {
			var p = $q.defer();

			rows.forEach(function(r) {
				r.d = 'bar';
			});

			p.resolve(rows);

			return p.promise;
		};

		beforeEach(function() {
			// Create function spies but also call real functions
			testObj.proc1 = jasmine.createSpy('proc1').and.callFake(proc1);
			testObj.proc2 = jasmine.createSpy('proc2').and.callFake(proc2);

			// Register the two spies as rows processors
			grid.registerRowsProcessor(testObj.proc1, 70);
			grid.registerRowsProcessor(testObj.proc2, 80);
		});

		describe("when process run", function() {
			beforeEach(function(callback) {
				runProcs(callback);
			});

			it('should call both processors', function() {
				expect(testObj.proc1).toHaveBeenCalled();
				expect(testObj.proc2).toHaveBeenCalled();
			});

			it('should actually process the rows', function() {
				expect(rows[0].grid).toEqual(grid);
				expect(rows[0].c).toEqual('foo');
				expect(rows[0].d).toEqual('bar');
				expect(rows[1].c).toEqual('foo');
				expect(rows[1].d).toEqual('bar');
			});
		});

		describe(', when deregistered, ', function() {
			beforeEach(function(callback) {
				grid.removeRowsProcessor(testObj.proc1);
				runProcs(callback);
			});
			it('should not be run', function() {
				expect(testObj.proc1).not.toHaveBeenCalled();
				expect(testObj.proc2).toHaveBeenCalled();
			});
		});

		describe(', when one is broken and does not return an array, ', function() {
			beforeEach(function() {
				grid.removeRowsProcessor(testObj.proc1);
				grid.removeRowsProcessor(testObj.proc2);

				grid.registerRowsProcessor(function() {
					return "goobers!";
				}, 70);
			});

			it('should throw an exception', function() {
				expect(function() {
					runProcs(function() {
					});
				}).toThrow();
			});
		});
	});

	describe('with no rows processors', function() {
		it('should have none registered', function() {
			expect(grid.rowsProcessors.length).toEqual(0);
		});

		describe('processRowsProcessors should return a shallow copy of grid.rows', function() {
			beforeEach(runProcs);

			it('when run', function() {
				expect(returnedRows).toEqual(grid.rows);
			});
		});
	});

	describe('registering a non-function as a rows processor', function() {
		it('should error', function() {
			expect(function() {
				grid.registerRowsProcessor('blah', 70);
			}).toThrow();
		});
	});

	describe('row builder', function() {
		function testObj() {
		}

		it('should return a defined gridOptions', function() {
			var testRowBuilder = function(row, gridOptions) {
				expect(gridOptions).toBeDefined();
			};
			var row = new GridRow({str: 'abc'}, 0, grid);
			testObj.testRowBuilder = jasmine.createSpy('testRowBuilder').and.callFake(testRowBuilder);
			grid.registerRowBuilder(testObj.testRowBuilder);
			grid.processRowBuilders(row);
			expect(testObj.testRowBuilder).toHaveBeenCalled();
		});
	});

	describe('renderContainers', function() {
		it('should have a body render container', function() {
			expect(grid.renderContainers.body).toBeDefined();
		});

		it('should create a left render container', function() {
			expect(grid.renderContainers.left).not.toBeDefined();
			grid.createLeftContainer();
			expect(grid.renderContainers.left).toBeDefined();

			var left = grid.renderContainers.left;

			// creating twice does nothing
			grid.createLeftContainer();
			expect(grid.renderContainers.left).toBe(left);
		});

		it('should create a right render container', function() {
			expect(grid.renderContainers.right).not.toBeDefined();
			grid.createRightContainer();
			expect(grid.renderContainers.right).toBeDefined();

			var right = grid.renderContainers.right;

			// creating twice does nothing
			grid.createRightContainer();
			expect(grid.renderContainers.right).toBe(right);
		});
	});

	describe('buildColumns', function() {
		it('guess correct column types when not specified', function() {
			var dataRow = {str: 'abc', num: 123, dat: new Date(), bool: true, obj: {}, nll: null, negNum: -1, posNum: +1};
			var grid = new Grid({id: 1});
			var rows = [
				new GridRow(dataRow, 1, grid)
			];

			grid.buildColumnDefsFromData([dataRow]);
			grid.buildColumns();
			grid.modifyRows([dataRow]);

			expect(grid.getColumn('str').colDef.type).toBe('string');
			expect(grid.getColumn('num').colDef.type).toBe('number');
			expect(grid.getColumn('negNum').colDef.type).toBe('number');
			expect(grid.getColumn('posNum').colDef.type).toBe('number');
			expect(grid.getColumn('dat').colDef.type).toBe('date');
			expect(grid.getColumn('bool').colDef.type).toBe('boolean');
			expect(grid.getColumn('obj').colDef.type).toBe('object');
			expect(grid.getColumn('nll').colDef.type).toBe('object');
		});

		it('not overwrite column types specified in options', function() {
			var grid1 = new Grid({id: 3});

			grid1.options.columnDefs = [
				{name: 'str', type: 'string'},
				{name: 'num', type: 'number'},
				{name: 'dat', type: 'date'},
				{name: 'bool', type: 'boolean'},
				{name: 'obj', type: 'object'}
			];
			grid1.buildColumns();

			expect(grid1.getColumn('str').colDef.type).toBe('string');
			expect(grid1.getColumn('num').colDef.type).toBe('number');
			expect(grid1.getColumn('dat').colDef.type).toBe('date');
			expect(grid1.getColumn('bool').colDef.type).toBe('boolean');
			expect(grid1.getColumn('obj').colDef.type).toBe('object');
		});

		it('add columns at the correct position - middle', function() {
			var grid1 = new Grid({id: 3});

			grid1.options.columnDefs = [
				{name: '1'},
				{name: '2'},
				{name: '3'},
				{name: '4'},
				{name: '5'}
			];
			grid1.buildColumns();

			expect(grid1.columns[0].name).toEqual('1');
			expect(grid1.columns[1].name).toEqual('2');
			expect(grid1.columns[2].name).toEqual('3');
			expect(grid1.columns[3].name).toEqual('4');
			expect(grid1.columns[4].name).toEqual('5');

			grid1.options.columnDefs.splice(3, 0, {name: '3.5'});
			grid1.buildColumns();

			expect(grid1.columns[0].name).toEqual('1');
			expect(grid1.columns[1].name).toEqual('2');
			expect(grid1.columns[2].name).toEqual('3');
			expect(grid1.columns[3].name).toEqual('3.5');
			expect(grid1.columns[4].name).toEqual('4');
			expect(grid1.columns[5].name).toEqual('5');
		});

		it('should respect the row header in order', function() {
			var columnDefs = [
				{name: '1'},
				{name: '2'}
			];

			var grid1 = gridClassFactory.createGrid({columnDefs: columnDefs});

			$timeout(function() {
				grid1.addRowHeaderColumn({name: 'rowHeader3'}, 100);
				grid1.addRowHeaderColumn({name: 'rowHeader1'}, -100);
				grid1.addRowHeaderColumn({name: 'rowHeader2'}, 0);
			});
			$timeout.flush();

			$timeout(function() {
				grid1.buildColumns();
			});
			$timeout.flush();

			expect(grid1.columns[0].name).toEqual('rowHeader1');
			expect(grid1.columns[1].name).toEqual('rowHeader2');
			expect(grid1.columns[2].name).toEqual('rowHeader3');
			expect(grid1.columns[3].name).toEqual('1');
			expect(grid1.columns[4].name).toEqual('2');

		});

		it('add columns at the correct position - start', function() {
			var grid1 = new Grid({id: 3});

			grid1.options.columnDefs = [
				{name: '1'},
				{name: '2'},
				{name: '3'},
				{name: '4'},
				{name: '5'}
			];
			grid1.buildColumns();

			expect(grid1.columns[0].name).toEqual('1');
			expect(grid1.columns[1].name).toEqual('2');
			expect(grid1.columns[2].name).toEqual('3');
			expect(grid1.columns[3].name).toEqual('4');
			expect(grid1.columns[4].name).toEqual('5');

			grid1.options.columnDefs.unshift({name: '0.5'});
			grid1.buildColumns();

			expect(grid1.columns[0].name).toEqual('0.5');
			expect(grid1.columns[1].name).toEqual('1');
			expect(grid1.columns[2].name).toEqual('2');
			expect(grid1.columns[3].name).toEqual('3');
			expect(grid1.columns[4].name).toEqual('4');
			expect(grid1.columns[5].name).toEqual('5');
		});

		it('add columns at the correct position - end', function() {
			var grid1 = new Grid({id: 3});

			grid1.options.columnDefs = [
				{name: '1'},
				{name: '2'},
				{name: '3'},
				{name: '4'},
				{name: '5'}
			];
			grid1.buildColumns();

			expect(grid1.columns[0].name).toEqual('1');
			expect(grid1.columns[1].name).toEqual('2');
			expect(grid1.columns[2].name).toEqual('3');
			expect(grid1.columns[3].name).toEqual('4');
			expect(grid1.columns[4].name).toEqual('5');

			grid1.options.columnDefs.push({name: '5.5'});
			grid1.buildColumns();

			expect(grid1.columns[0].name).toEqual('1');
			expect(grid1.columns[1].name).toEqual('2');
			expect(grid1.columns[2].name).toEqual('3');
			expect(grid1.columns[3].name).toEqual('4');
			expect(grid1.columns[4].name).toEqual('5');
			expect(grid1.columns[5].name).toEqual('5.5');
		});

		describe('when adding the same field multiple times', function() {
			var grid;

			beforeEach(function() {
				grid = new Grid({id: 1});
				grid.options.columnDefs = [{field: 'a'}];
				grid.buildColumns();
			});

			it('should not throw an exception', function() {
				expect(function() {
					for (var i = 1; i <= 4; i++) {
						grid.options.columnDefs.push({field: 'a'});
						grid.buildColumns();
					}
				}).not.toThrow();
			});

			it('should create incremental displayNames', function() {
				for (var i = 1; i <= 4; i++) {
					grid.options.columnDefs.push({field: 'a'});
				}
				grid.buildColumns();

				expect(grid.columns[0].displayName).toEqual('A');
				expect(grid.columns[1].displayName).toEqual('A2');
				expect(grid.columns[2].displayName).toEqual('A3');
				expect(grid.columns[3].displayName).toEqual('A4');
				expect(grid.columns[4].displayName).toEqual('A5');
			});
		});

		describe('when preCompileCellTemplates option is set to true', function() {
			var grid;

			beforeEach(function() {
				grid = new Grid({id: 3});

				grid.options.columnDefs = [
					{name: '1'},
					{name: '2'},
					{name: '3'},
					{name: '4'},
					{name: '5'}
				];
				spyOn(grid, 'preCompileCellTemplates').and.callThrough();
				grid.buildColumns({preCompileCellTemplates: true});
				$scope.$apply();
			});

			it('should call preCompileCellTemplates on the grid', function() {
				expect(grid.preCompileCellTemplates).toHaveBeenCalled();
			});
		});
	});

	describe('selection', function() {
		var grid;

		beforeEach(function() {
			grid = new Grid({id: 1, enableRowHashing: false});
			spyOn(grid, 'getRow').and.callFake(function(newEntity) {
				return newEntity;
			});

			grid.rows = [];
			grid.selection = {selectAll: false};
		});
		afterEach(function() {
			grid.getRow.calls.reset();
		});

		it('should enable selectAll if a new row is added that is already selected', function() {
			grid.modifyRows([{isSelected: true}]);

			expect(grid.selection.selectAll).toBe(true);
		});
		it('should disable selectAll if a new row is added that is not selected', function() {
			grid.modifyRows([{isSelected: false}]);

			expect(grid.selection.selectAll).toBe(false);
		});
		it('should not update selectAll if there are no rows', function() {
			grid.modifyRows([]);

			expect(grid.selection.selectAll).toBe(false);
		});
	});

	describe('follow source array', function() {
		var dataRows, grid;

		beforeEach(function() {
			dataRows = [{str: 'abc'}, {str: 'cba'}, {str: 'bac'}];
			grid = new Grid({id: 1});
			grid.options.enableRowHashing = false;

			spyOn(grid, 'getRow').and.callThrough();

			grid.modifyRows(dataRows);
		});

		it('should update the grid rows', function() {
			expect(grid.rows.length).toBe(3);
			expect(grid.rows[0].entity.str).toBe('abc');
			expect(grid.rows[1].entity.str).toBe('cba');
			expect(grid.rows[2].entity.str).toBe('bac');
		});

		it('should insert it on position 0', function() {
			dataRows.splice(0, 0, {str: 'cba'});
			grid.modifyRows(dataRows);

			expect(grid.getRow).toHaveBeenCalled();
			expect(grid.rows.length).toBe(4);
			expect(grid.rows[0].entity.str).toBe('cba');
		});

		it('should swap', function() {
			var tmpRow = dataRows[0];

			dataRows[0] = dataRows[1];
			dataRows[1] = tmpRow;
			grid.modifyRows(dataRows);

			expect(grid.getRow).toHaveBeenCalled();
			expect(grid.rows[0].entity.str).toBe('cba');
			expect(grid.rows[1].entity.str).toBe('abc');
		});

		it('should delete and insert new in the middle', function() {
			dataRows[1] = {str: 'xyz'};
			grid.modifyRows(dataRows);

			expect(grid.getRow).toHaveBeenCalled();
			expect(grid.rows.length).toBe(3);
			expect(grid.rows[0].entity.str).toBe('abc');
			expect(grid.rows[1].entity.str).toBe('xyz');
			expect(grid.rows[2].entity.str).toBe('bac');
		});
	});

	describe('when row hashing is enabled', function() {
		var dataRows, grid;

		beforeEach(function() {
			dataRows = [{str: 'abc'}, {str: 'cba'}, {str: 'bac'}];
			grid = new Grid({id: 1});
			grid.options.enableRowHashing = true;

			spyOn(grid, 'getRow').and.callThrough();

			grid.modifyRows(dataRows);
		});

		it('should update the grid rows', function() {
			expect(grid.rows.length).toBe(3);
			expect(grid.rows[0].entity.str).toBe('abc');
			expect(grid.rows[1].entity.str).toBe('cba');
			expect(grid.rows[2].entity.str).toBe('bac');
		});

		it('should insert it on position 0', function() {
			dataRows.splice(0, 0, {str: 'cba'});
			grid.modifyRows(dataRows);

			expect(grid.getRow).not.toHaveBeenCalled();
			expect(grid.rows.length).toBe(4);
			expect(grid.rows[0].entity.str).toBe('cba');
		});

		it('should swap', function() {
			var tmpRow = dataRows[0];

			dataRows[0] = dataRows[1];
			dataRows[1] = tmpRow;
			grid.modifyRows(dataRows);

			expect(grid.getRow).not.toHaveBeenCalled();
			expect(grid.rows[0].entity.str).toBe('cba');
			expect(grid.rows[1].entity.str).toBe('abc');
		});

		it('should delete and insert new in the middle', function() {
			dataRows[1] = {str: 'xyz'};
			grid.modifyRows(dataRows);

			expect(grid.getRow).not.toHaveBeenCalled();
			expect(grid.rows.length).toBe(3);
			expect(grid.rows[0].entity.str).toBe('abc');
			expect(grid.rows[1].entity.str).toBe('xyz');
			expect(grid.rows[2].entity.str).toBe('bac');
		});
	});

	describe('binding', function() {
		var entity;

		beforeEach(function() {
			entity = {
				simpleProp: 'simplePropValue',
				complexProp: {many: {paths: 'complexPropValue'}},
				functionProp: function() {
					return 'functionPropValue';
				},
				arrayProp: ['arrayPropValue'],
				dateProp: new Date('2015-07-01T13:25:00+00:00') // Wednesday in July
			};
			entity['\"!weird-pro\'p'] = 'weirdPropValue';

		});

		it('should replace constants in template', inject(function($timeout) {

			var colDefs = [
				{name: 'simpleProp', cellTemplate: '<div ng-model="MODEL_COL_FIELD"/>'}
			];
			var grid = gridClassFactory.createGrid({columnDefs: colDefs});
			var rows = [
				new GridRow(entity, 1, grid)
			];

			$timeout(function() {
				grid.buildColumns();
			});
			$timeout.flush();
			grid.modifyRows([entity]);
			grid.preCompileCellTemplates();

			var row = grid.rows[0];
			expect(grid.getColumn('simpleProp').compiledElementFn).toBeDefined();

		}));

		it('should bind correctly to simple prop', function() {

			var colDefs = [
				{name: 'simpleProp'},
				{name: 'complexProp', field: 'complexProp.many.paths'},
				{name: 'functionProp', field: 'functionProp()'},
				{name: 'arrayProp', field: 'arrayProp[0]'},
				{name: 'weirdProp', field: '\"!weird-pro\'p'}
			];
			var grid = new Grid({id: 1, columnDefs: colDefs});
			var rows = [
				new GridRow(entity, 1, grid)
			];

			grid.buildColumns();
			grid.modifyRows([entity]);

			var row = grid.rows[0];
			expect(grid.getCellValue(row, grid.getColumn('simpleProp'))).toBe('simplePropValue');
			expect(grid.getCellValue(row, grid.getColumn('complexProp'))).toBe('complexPropValue');
			expect(grid.getCellValue(row, grid.getColumn('functionProp'))).toBe('functionPropValue');
			expect(grid.getCellValue(row, grid.getColumn('arrayProp'))).toBe('arrayPropValue');
			expect(grid.getCellValue(row, grid.getColumn('weirdProp'))).toBe('weirdPropValue');

			expect(grid.getCellDisplayValue(row, grid.getColumn('simpleProp'))).toBe('simplePropValue');
			expect(grid.getCellDisplayValue(row, grid.getColumn('complexProp'))).toBe('complexPropValue');
			expect(grid.getCellDisplayValue(row, grid.getColumn('functionProp'))).toBe('functionPropValue');
			expect(grid.getCellDisplayValue(row, grid.getColumn('arrayProp'))).toBe('arrayPropValue');
			expect(grid.getCellDisplayValue(row, grid.getColumn('weirdProp'))).toBe('weirdPropValue');

		});

		it('should set cache correctly with flatEntityAccess', function() {

			var colDefs = [
				{name: 'simpleProp'}
			];
			var entity2 = {
				simpleProp: 'simplePropValue.2'
			};

			var grid = new Grid({id: 1, columnDefs: colDefs, flatEntityAccess: true});
			var rows = [
				new GridRow(entity, 1, grid),
				new GridRow(entity2, 2, grid)
			];

			grid.buildColumns();
			grid.modifyRows([entity, entity2]);

			var simpleCol = grid.getColumn('simpleProp');

			var row = grid.rows[0];
			expect(grid.getCellValue(row, simpleCol)).toBe('simplePropValue');
			expect(grid.getCellDisplayValue(row, simpleCol)).toBe('simplePropValue');

			var row2 = grid.rows[1];
			expect(grid.getCellValue(row2, simpleCol)).toBe('simplePropValue.2');
			expect(grid.getCellDisplayValue(row2, simpleCol)).toBe('simplePropValue.2');
		});

		it('should bind correctly to $$this', function() {
			var colDefs = [
				{name: 'thisProp', field: '$$this'}
			];
			var grid = new Grid({id: 1, columnDefs: colDefs});
			var data = [
				"abc",
				"def"
			];
			var rows = [
				new GridRow(data[0], 1, grid),
				new GridRow(data[1], 2, grid)
			];

			grid.buildColumns();
			grid.modifyRows(data);

			expect(grid.getCellValue(rows[0], grid.getColumn('thisProp'))).toBe('abc');
			expect(grid.getCellValue(rows[1], grid.getColumn('thisProp'))).toBe('def');

			expect(grid.getCellDisplayValue(rows[0], grid.getColumn('thisProp'))).toBe('abc');
			expect(grid.getCellDisplayValue(rows[1], grid.getColumn('thisProp'))).toBe('def');
		});

		it('should apply angularjs filters', function() {
			var colDefs = [
				{displayName: 'date', field: 'dateProp', cellFilter: 'date:"yyyy-MM-dd"'},
				{displayName: 'weekday', field: 'dateProp', cellFilter: 'date:"EEEE" | uppercase'}
			];
			var grid = new Grid({id: 1, columnDefs: colDefs});
			var rows = [
				new GridRow(entity, 1, grid)
			];
			grid.buildColumns();
			grid.modifyRows([entity]);

			var row = grid.rows[0];
			expect(grid.getCellDisplayValue(row, grid.columns[0])).toEqual("2015-07-01");
			expect(grid.getCellDisplayValue(row, grid.columns[1])).toEqual("WEDNESDAY");
		});

		it('should apply angularjs filters with flatEntityAccess', function() {
			var colDefs = [
				{displayName: 'date', field: 'dateProp', cellFilter: 'date:"yyyy-MM-dd"'},
				{displayName: 'weekday', field: 'dateProp', cellFilter: 'date:"EEEE" | uppercase'}
			];
			var grid = new Grid({id: 1, columnDefs: colDefs, flatEntityAccess: true});
			var rows = [
				new GridRow(entity, 1, grid)
			];
			grid.buildColumns();
			grid.modifyRows([entity]);

			var row = grid.rows[0];
			expect(grid.getCellDisplayValue(row, grid.columns[0])).toEqual("2015-07-01");
			expect(grid.getCellDisplayValue(row, grid.columns[1])).toEqual("WEDNESDAY");
		});

		it('should get cell display value with special chars column name and flatEntityAccess', function() {
			var colDefs = [
				{name: 'Column 1', field: 'column.1'},
				{name: 'Column 2', field: 'column \'2\'', cellFilter: 'number:2'},
				{name: 'Column 3', field: 'column   3'},
				{name: 'Column 4', field: '\\\\////&é"(-è_çà)=+{}:/\\_!<>*|\',?;.§$ê£µ%'}
			];
			var grid = new Grid({id: 1, columnDefs: colDefs, flatEntityAccess: true});
			var data = [
				{
					'column.1': 'test',
					'column \'2\'': 2,
					'column   3': '3',
					'\\\\////&é"(-è_çà)=+{}:/\\_!<>*|\',?;.§$ê£µ%': '&é"(-è_çà)=+{}'
				},
				{
					'column.1': 'test1',
					'column \'2\'': 3,
					'column   3': '4',
					'\\\\////&é"(-è_çà)=+{}:/\\_!<>*|\',?;.§$ê£µ%': ''
				}
			];
			var rows = [
				new GridRow(data[0], 1, grid),
				new GridRow(data[1], 2, grid)
			];

			grid.buildColumns();
			grid.modifyRows(data);

			expect(grid.getCellDisplayValue(rows[0], grid.getColumn('Column 1'))).toBe('test');
			expect(grid.getCellDisplayValue(rows[1], grid.getColumn('Column 1'))).toBe('test1');

			expect(grid.getCellDisplayValue(rows[0], grid.getColumn('Column 2'))).toBe('2.00');
			expect(grid.getCellDisplayValue(rows[1], grid.getColumn('Column 2'))).toBe('3.00');

			expect(grid.getCellDisplayValue(rows[0], grid.getColumn('Column 3'))).toBe('3');
			expect(grid.getCellDisplayValue(rows[1], grid.getColumn('Column 3'))).toBe('4');

			expect(grid.getCellDisplayValue(rows[0], grid.getColumn('Column 4'))).toBe('&é"(-è_çà)=+{}');
			expect(grid.getCellDisplayValue(rows[1], grid.getColumn('Column 4'))).toBe('');
		});

		it('not overwrite column types specified in options', function() {

			var grid1 = new Grid({id: 3});

			grid1.options.columnDefs = [
				{name: 'str', type: 'string'},
				{name: 'num', type: 'number'},
				{name: 'dat', type: 'date'},
				{name: 'bool', type: 'boolean'},
				{name: 'obj', type: 'object'}
			];
			grid1.buildColumns();

			expect(grid1.getColumn('str').colDef.type).toBe('string');
			expect(grid1.getColumn('num').colDef.type).toBe('number');
			expect(grid1.getColumn('dat').colDef.type).toBe('date');
			expect(grid1.getColumn('bool').colDef.type).toBe('boolean');
			expect(grid1.getColumn('obj').colDef.type).toBe('object');
		});
	});

	describe('addRowHeaderColumn', function() {
		var grid;

		beforeEach(function() {
			var colDefs = [
				{name: 'col1'}
			];

			grid = new gridClassFactory.createGrid({columnDefs: colDefs});
			spyOn(grid, 'buildColumns').and.callThrough();
		});

		describe('when stopBuildColumns is set to true', function() {
			it('should not call buildColumns', function() {
				grid.addRowHeaderColumn({name: 'rowHeader', cellTemplate: '<div/>'}, 1, true);
				$scope.$apply();

				expect(grid.buildColumns).not.toHaveBeenCalled();
			});
		});
		describe('when stopBuildColumns is set to false', function() {
			it('should call buildColumns', function() {
				grid.addRowHeaderColumn({name: 'rowHeader', cellTemplate: '<div/>'}, 1, false);
				$scope.$apply();

				expect(grid.buildColumns).toHaveBeenCalled();
			});
		});
	});

	describe('row header', function() {
		it('should create left container for left row header', inject(function(gridClassFactory, $timeout) {
			var colDefs = [
				{name: 'col1'}
			];
			var grid = new gridClassFactory.createGrid({columnDefs: colDefs});

			spyOn(grid, "preCompileCellTemplates").and.callFake(function() {
			});
			spyOn(grid, "handleWindowResize").and.callFake(function() {
			});

			$timeout(function() {
				grid.addRowHeaderColumn({name: 'rowHeader', cellTemplate: "<div/>"});
			});
			$timeout.flush();
			expect(grid.hasLeftContainer()).toBe(true);
			expect(grid.hasRightContainer()).toBe(false);

			grid.buildColumns();
			expect(grid.columns.length).toBe(2);

		}));

		it('should create right container when RTL', inject(function(gridClassFactory, $timeout) {

			var colDefs = [
				{name: 'col1'}
			];
			var grid = new gridClassFactory.createGrid({columnDefs: colDefs});
			grid.rtl = true;

			spyOn(grid, "preCompileCellTemplates").and.callFake(function() {
			});
			spyOn(grid, "handleWindowResize").and.callFake(function() {
			});

			$timeout(function() {
				grid.addRowHeaderColumn({name: 'rowHeader', cellTemplate: "<div/>"});
			});
			$timeout.flush();
			expect(grid.hasLeftContainer()).toBe(false);
			expect(grid.hasRightContainer()).toBe(true);

			$timeout(function() {
				grid.buildColumns();
			});
			$timeout.flush();

			expect(grid.columns.length).toBe(2);

			// test calling build columns twice to assure we don't get duplicate headers
			$timeout(function() {
				grid.buildColumns();
			});
			$timeout.flush();
			expect(grid.columns.length).toBe(2);
		}));
	});

	describe('sortColumn', function() {
		it('should throw an exception if no column parameter is provided', function() {
			expect(function() {
				grid.sortColumn();
			}).toThrow();

			try {
				grid.sortColumn();
			}
			catch (e) {
				expect(e.message).toContain('No column parameter provided', 'exception contains column name');
			}
		});

		it('if sort is currently null, then should toggle to ASC, and reset priority', function() {
			grid.sortColumn(column, false);

			expect(column.sort.direction).toEqual(uiGridConstants.ASC);
			expect(column.sort.priority).toEqual(0);
		});

		it('if sort is currently ASC, then should toggle to DESC, and reset priortiy', function() {
			column.sort = {direction: uiGridConstants.ASC, priority: 2};
			grid.sortColumn(column, false);

			expect(column.sort.direction).toEqual(uiGridConstants.DESC);
			expect(column.sort.priority).toEqual(0);
		});

		it('if sort is currently DESC, and suppressRemoveSort is undefined, then should toggle to null, and remove priority', function() {
			column.sort = {direction: uiGridConstants.DESC, priority: 1};
			grid.sortColumn(column, false);

			expect(column.sort.direction).toBeUndefined();
			expect(column.sort.priority).toBeUndefined();
		});

		it('if sort is currently DESC, and suppressRemoveSort is null, then should toggle to null, and remove priority', function() {
			column.sort = {direction: uiGridConstants.DESC, priority: 1, suppressRemoveSort: null};
			grid.sortColumn(column, false);

			expect(column.sort.direction).toBeUndefined();
			expect(column.sort.priority).toBeUndefined();
		});

		it('if sort is currently DESC, and suppressRemoveSort is false, then should toggle to null, and remove priority', function() {
			column.sort = {direction: uiGridConstants.DESC, priority: 1, suppressRemoveSort: false};
			grid.sortColumn(column, false);

			expect(column.sort.direction).toBeUndefined();
			expect(column.sort.priority).toBeUndefined();
		});

		it('if sort is currently DESC, and suppressRemoveSort is true, then should toggle to ASC, and reset priority', function() {
			column.sort = {direction: uiGridConstants.DESC, priority: 2};
			column.suppressRemoveSort = true;
			grid.sortColumn(column, false);

			expect(column.sort.direction).toEqual(uiGridConstants.ASC);
			expect(column.sort.priority).toEqual(0);
		});

		it('if another column has a sort, that sort should be removed', function() {
			var priorColumn = new GridColumn({name: 'b', sort: {direction: uiGridConstants.ASC}}, 0, grid);
			grid.columns.push(priorColumn);

			grid.sortColumn(column, false);

			expect(column.sort.direction).toEqual(uiGridConstants.ASC);
			expect(column.sort.priority).toEqual(0);
			expect(priorColumn.sort).toEqual({});
		});

		it('if another column has a sort, and add is set to true, then that sort should not be removed', function() {
			var priorColumn = new GridColumn({name: 'b', sort: {direction: uiGridConstants.ASC, priority: 1}}, 0, grid);
			grid.columns.push(priorColumn);

			grid.sortColumn(column, true);

			expect(column.sort.direction).toEqual(uiGridConstants.ASC);
			expect(column.sort.priority).toEqual(2);
			expect(priorColumn.sort).toEqual({direction: uiGridConstants.ASC, priority: 1});
		});

		it('if another column has a sort, and add is set to false, but that other column has suppressRemoveSort, then it shouldn\'t be removed',
			function() {
				var priorColumn = new GridColumn({name: 'b', sort: {direction: uiGridConstants.ASC, priority: 1}, suppressRemoveSort: true}, 0, grid);
				grid.columns.push(priorColumn);

				grid.sortColumn(column, false);

				expect(column.sort.direction).toEqual(uiGridConstants.ASC);
				expect(column.sort.priority).toEqual(2);
				expect(priorColumn.sort).toEqual({direction: uiGridConstants.ASC, priority: 1});
			});

		it('if sortDirectionCycle is null-DESC-ASC, and sort is currently null, then should toggle to DESC, and reset priority', function() {
			column.sort = {};
			column.sortDirectionCycle = [null, uiGridConstants.DESC, uiGridConstants.ASC];

			grid.sortColumn(column, false);

			expect(column.sort.direction).toEqual(uiGridConstants.DESC);
			expect(column.sort.priority).toEqual(0);
		});

		it('if sortDirectionCycle is null-DESC-ASC, and sort is currently ASC, then should toggle to null, and remove priority', function() {
			column.sort = {direction: uiGridConstants.ASC, priority: 1};
			column.sortDirectionCycle = [null, uiGridConstants.DESC, uiGridConstants.ASC];

			grid.sortColumn(column, false);

			expect(column.sort.direction).toBeUndefined();
			expect(column.sort.priority).toBeUndefined();
		});

		it('if sortDirectionCycle is DESC, and sort is currently DESC, then should not change the sort', function() {
			column.sort = {direction: uiGridConstants.DESC, priority: 1};
			column.sortDirectionCycle = [uiGridConstants.DESC];

			grid.sortColumn(column, false);

			expect(column.sort.direction).toEqual(uiGridConstants.DESC);
			expect(column.sort.priority).toEqual(0);
		});

		it(
			'if sortDirectionCycle is DESC-null-ASC, and sort is currently DESC, and suppressRemoveSort is true, then should toggle to ASC, and reset priority',
			function() {
				column.sort = {direction: uiGridConstants.DESC, priority: 1};
				column.sortDirectionCycle = [uiGridConstants.DESC, null, uiGridConstants.ASC];
				column.suppressRemoveSort = true;

				grid.sortColumn(column, false);

				expect(column.sort.direction).toEqual(uiGridConstants.ASC);
				expect(column.sort.priority).toEqual(0);
			});

		it('if two column has sort 1 and 2 on the ui which is 0 and 1 in the sort object and the sort change for the first do not change the priority',
			function() {
				var priorColumn1 = new GridColumn({name: 'a', sort: {direction: uiGridConstants.ASC, priority: 0}}, 0, grid);
				var priorColumn2 = new GridColumn({name: 'b', sort: {direction: uiGridConstants.ASC, priority: 1}}, 1, grid);
				grid.columns.push(priorColumn1);
				grid.columns.push(priorColumn2);

				grid.sortColumn(priorColumn1, true);

				expect(priorColumn1.sort).toEqual({direction: uiGridConstants.DESC, priority: 0});
			});

		it(
			'if three column has sort 1,2 and 3 on the ui which is 0,1 and 2 in the sort object and the sort removed for the second decrease priority for the third but do not change for the first',
			function() {
				var priorColumn1 = new GridColumn({name: 'a', sort: {direction: uiGridConstants.ASC, priority: 0}}, 0, grid);
				var priorColumn2 = new GridColumn({name: 'b', sort: {direction: uiGridConstants.DESC, priority: 1}}, 1, grid);
				var priorColumn3 = new GridColumn({name: 'c', sort: {direction: uiGridConstants.ASC, priority: 2}}, 2, grid);
				grid.columns.push(priorColumn1);
				grid.columns.push(priorColumn2);
				grid.columns.push(priorColumn3);

				grid.sortColumn(priorColumn2, true);

				expect(priorColumn1.sort).toEqual({direction: uiGridConstants.ASC, priority: 0});
				expect(priorColumn2.sort).toEqual({});
				expect(priorColumn3.sort).toEqual({direction: uiGridConstants.ASC, priority: 1});
			});
	});

	describe('redrawInPlace', function() {
		beforeEach(function() {
			grid.renderContainers = {
				body: {
					prevScrollTop: 0,
					prevScrollLeft: 0,
					prevScrolltopPercentage: 0,
					prevScrollleftPercentage: 0,
					adjustRows: jasmine.createSpy('adjustRows'),
					adjustColumns: jasmine.createSpy('adjustColumns')
				}
			};
		});
		describe('when rows have been added', function() {
			beforeEach(function() {
				grid.renderContainers.body.prevScrollTop = 10;
				grid.renderContainers.body.prevScrollLeft = 20;
				grid.redrawInPlace(true);
			});
			it('should call adjust rows with null for a scroll percentage and the prevScrollTop value', function() {
				expect(grid.renderContainers.body.adjustRows).toHaveBeenCalledWith(
					grid.renderContainers.body.prevScrollTop,
					null
				);
			});
			it('should call adjust columns with null for a scroll percentage and the prevScrollLeft value', function() {
				expect(grid.renderContainers.body.adjustColumns).toHaveBeenCalledWith(
					grid.renderContainers.body.prevScrollLeft,
					null
				);
			});
		});
		describe('when rows have not been added', function() {
			it('should call adjust rows with null for a scroll percentage and the prevScrollTop value if prevScrollTop is greater than 0', function() {
				grid.renderContainers.body.prevScrollTop = 10;
				grid.redrawInPlace(false);
				expect(grid.renderContainers.body.adjustRows).toHaveBeenCalledWith(
					grid.renderContainers.body.prevScrollTop,
					null
				);
			});
			it('should call adjust columns with null for a scroll percentage and the prevScrollLeft value if prevScrollLeft is greater than 0', function() {
				grid.renderContainers.body.prevScrollLeft = 20;
				grid.redrawInPlace(false);
				expect(grid.renderContainers.body.adjustColumns).toHaveBeenCalledWith(
					grid.renderContainers.body.prevScrollLeft,
					null
				);
			});
			it('should call adjust rows with null for a scroll top and the scroll percentage value if prevScrollTop is less or equal to 0', function() {
				grid.renderContainers.body.prevScrollTop = 0;
				grid.renderContainers.body.prevScrolltopPercentage = 30;
				grid.redrawInPlace(false);
				expect(grid.renderContainers.body.adjustRows).toHaveBeenCalledWith(
					null,
					grid.renderContainers.body.prevScrolltopPercentage
				);
			});
			it('should call adjust columns with null for a scroll left and the scroll percentage value if prevScrollLeft is less or equal to 0',
				function() {
					grid.renderContainers.body.prevScrollLeft = 0;
					grid.renderContainers.body.prevScrollleftPercentage = 40;
					grid.redrawInPlace(false);
					expect(grid.renderContainers.body.adjustColumns).toHaveBeenCalledWith(
						null,
						grid.renderContainers.body.prevScrollleftPercentage
					);
				});
		});
	});

	describe('data change callbacks', function() {
		it('register then deregister data change callback', function() {
			var countCallbacks = function() {
				var i = 0;
				angular.forEach(grid.dataChangeCallbacks, function(callback, key) {
					i++;
				});
				return i;
			};

			var prevCount = countCallbacks();
			var deregFunction = grid.registerDataChangeCallback(function() {
			});
			expect(countCallbacks()).toEqual(prevCount + 1);

			deregFunction();
			expect(countCallbacks()).toEqual(prevCount);
		});

		describe('mix of callbacks being called', function() {
			var called, constants, optionsPassed;

			beforeEach(function() {
				called = [];
				optionsPassed = false;
				constants = uiGridConstants.dataChange;

				// this function will push it's type into the called array when it's called
				function createCallbackFunction(type) {
					return function(grid, options) {
						called.push(type);
						optionsPassed = angular.isDefined(options);
					};
				}

				grid.registerDataChangeCallback(createCallbackFunction(constants.ALL), [constants.ALL]);
				grid.registerDataChangeCallback(createCallbackFunction(constants.ROW), [constants.ROW]);
				grid.registerDataChangeCallback(createCallbackFunction(constants.EDIT), [constants.EDIT]);
				grid.registerDataChangeCallback(createCallbackFunction(constants.COLUMN), [constants.COLUMN]);
				grid.registerDataChangeCallback(createCallbackFunction(constants.COLUMN + constants.EDIT), [constants.COLUMN, constants.EDIT]);
			});

			it('call of type ALL', function() {
				grid.callDataChangeCallbacks(constants.ALL);
				expect(called).toEqual([constants.ALL, constants.ROW, constants.EDIT, constants.COLUMN, constants.COLUMN + constants.EDIT]);
				expect(optionsPassed).toBe(false);
			});

			it('call of type ROW', function() {
				grid.callDataChangeCallbacks(constants.ROW);
				expect(called).toEqual([constants.ALL, constants.ROW]);
				expect(optionsPassed).toBe(false);
			});

			it('call of type EDIT', function() {
				grid.callDataChangeCallbacks(constants.EDIT);
				expect(called).toEqual([constants.ALL, constants.EDIT, constants.COLUMN + constants.EDIT]);
				expect(optionsPassed).toBe(false);
			});

			it('call of type COLUMN', function() {
				grid.callDataChangeCallbacks(constants.COLUMN);
				expect(called).toEqual([constants.ALL, constants.COLUMN, constants.COLUMN + constants.EDIT]);
				expect(optionsPassed).toBe(false);
			});

			it('call works via api', function() {
				grid.api.core.notifyDataChange(constants.COLUMN);
				expect(called).toEqual([constants.ALL, constants.COLUMN, constants.COLUMN + constants.EDIT]);
				expect(optionsPassed).toBe(false);
			});

			describe('when options are passed in', function() {
				it('should pass the options to the callback', function() {
					grid.callDataChangeCallbacks(constants.ALL, {options: true});
					expect(called).toEqual([constants.ALL, constants.ROW, constants.EDIT, constants.COLUMN, constants.COLUMN + constants.EDIT]);
					expect(optionsPassed).toBe(true);
				});
			});
		});
	});

	describe('columnRefreshCallback', function() {
		var options;

		beforeEach(function() {
			options = {preCompileCellTemplates: true};
			spyOn(grid, 'buildColumns').and.callThrough();
			spyOn(grid, 'queueGridRefresh').and.callThrough();
			grid.columnRefreshCallback(grid, options);
		});

		it('should call buildColumns with the options passed into it', function() {
			expect(grid.buildColumns).toHaveBeenCalledWith(options);
		});
		it('should call queueGridRefresh', function() {
			expect(grid.queueGridRefresh).toHaveBeenCalled();
		});
	});

	describe('clearAllFilters', function() {
		it('should clear all filter terms from all columns', function() {
			grid.columns = [
				{filters: [{term: 'A'}, {term: 'B'}]},
				{filters: [{term: 'C'}]},
				{filters: []}
			];

			grid.clearAllFilters();

			expect(grid.columns[0].filters).toEqual([{term: undefined}, {term: undefined}]);
			expect(grid.columns[1].filters).toEqual([{term: undefined}]);
			expect(grid.columns[2].filters).toEqual([]);
		});

		it('should call grid.refreshRows() if the refreshRows parameter is true', function() {
			spyOn(grid, 'refreshRows');

			grid.clearAllFilters(true);

			expect(grid.refreshRows).toHaveBeenCalled();
		});

		it('should not call grid.refreshRows() if the refreshRows parameter is false', function() {
			spyOn(grid, 'refreshRows');

			grid.clearAllFilters(false);

			expect(grid.refreshRows).not.toHaveBeenCalled();
		});

		it('should clear filter conditions from all columns if the clearConditions parameter is true', function() {
			grid.columns = [
				{filters: [{condition: 'a value'}]}
			];

			grid.clearAllFilters(undefined, true, undefined);

			expect(grid.columns[0].filters[0].condition).toBeUndefined();
		});

		it('should not clear filter conditions from any column if the clearConditions parameter is false', function() {
			grid.columns = [
				{filters: [{condition: 'a value'}]}
			];

			grid.clearAllFilters(undefined, false, undefined);

			expect(grid.columns[0].filters[0].condition).toBe('a value');
		});

		it('should clear filter flags from all columns if the clearFlags parameter is true', function() {
			grid.columns = [
				{filters: [{flags: 'a value'}]}
			];

			grid.clearAllFilters(undefined, undefined, true);

			expect(grid.columns[0].filters[0].flags).toBeUndefined();
		});

		it('should not clear filter flags from any column if the clearFlags parameter is false', function() {
			grid.columns = [
				{filters: [{flags: 'a value'}]}
			];

			grid.clearAllFilters(undefined, undefined, false);

			expect(grid.columns[0].filters[0].flags).toBe('a value');
		});
	});
});
