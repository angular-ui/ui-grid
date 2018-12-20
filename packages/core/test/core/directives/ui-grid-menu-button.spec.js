describe('ui-grid-menu-button uiGridGridMenuService', function() {
	'use strict';

	var uiGridGridMenuService, gridClassFactory, grid, $rootScope, $scope, gridUtil, $q;

	beforeEach(function() {
		module('ui.grid');

		inject(function(_uiGridGridMenuService_, _gridClassFactory_, _$rootScope_, _gridUtil_, _$q_) {
			uiGridGridMenuService = _uiGridGridMenuService_;
			gridClassFactory = _gridClassFactory_;
			$rootScope = _$rootScope_;
			gridUtil = _gridUtil_;
			$q = _$q_;
		});
	});

	describe('uiGridGridMenuService', function() {
		beforeEach(function() {
			$scope = $rootScope.$new();

			grid = gridClassFactory.createGrid({id: 1234});
			grid.options.columnDefs = [
				{name: 'col1'},
				{name: 'col2'},
				{name: 'col3'},
				{name: 'col4'}
			];
			grid.options.data = [
				{col1: '1_1', col2: '1_2', col3: '1_3', col4: '1_4'},
				{col1: '2_1', col2: '2_2', col3: '2_3', col4: '2_4'},
				{col1: '3_1', col2: '3_2', col3: '3_3', col4: '3_4'},
				{col1: '4_1', col2: '4_2', col3: '4_3', col4: '4_4'}
			];

			grid.buildColumns();
			grid.modifyRows(grid.options.data);
			grid.setVisibleRows(grid.rows);
			grid.setVisibleColumns(grid.columns);
		});
		describe('initialization: ', function() {
			it('api is registered', function() {
				uiGridGridMenuService.initialize($scope, grid);

				expect(grid.gridMenuScope).toEqual($scope);
				expect($scope.grid).toEqual(grid);
				expect(grid.api.core.addToGridMenu).toEqual(jasmine.any(Function));
				expect(grid.api.core.removeFromGridMenu).toEqual(jasmine.any(Function));
			});

			it('api calls expected methods', function() {
				spyOn(uiGridGridMenuService, 'addToGridMenu').and.callFake(angular.noop);
				spyOn(uiGridGridMenuService, 'removeFromGridMenu').and.callFake(angular.noop);

				uiGridGridMenuService.initialize($scope, grid);

				grid.api.core.addToGridMenu();
				expect(uiGridGridMenuService.addToGridMenu).toHaveBeenCalled();

				grid.api.core.removeFromGridMenu();
				expect(uiGridGridMenuService.removeFromGridMenu).toHaveBeenCalled();

				uiGridGridMenuService.addToGridMenu.calls.reset();
				uiGridGridMenuService.removeFromGridMenu.calls.reset();
			});

			describe('on $destroy', function() {
				beforeEach(function() {
					uiGridGridMenuService.initialize($scope, grid);
				});
				it('does not set gridMenuScope to null if gridMenuScope is not defined', function() {
					grid.gridMenuScope = undefined;
					$scope.$destroy();

					expect(grid.gridMenuScope).toEqual(undefined);
				});
				it('does not set grid to null if grid is not defined', function() {
					$scope.grid = undefined;
					$scope.$destroy();

					expect($scope.grid).toEqual(undefined);
				});
				it('does not set registeredMenuItems to null if registeredMenuItems is not defined', function() {
					$scope.registeredMenuItems = undefined;
					$scope.$destroy();

					expect($scope.registeredMenuItems).toEqual(undefined);
				});
			});
		});

		describe('addToGridMenu and removeFromGridMenu: ', function() {
			var menuItems;

			beforeEach(function() {
				menuItems = [{id: 'customItem1', title: 'x'}, {id: 'customItem2', title: 'y'}];

				uiGridGridMenuService.initialize($scope, grid);
				spyOn(gridUtil, 'logError').and.callFake(angular.noop);
			});
			afterEach(function() {
				gridUtil.logError.calls.reset();
			});

			it('addToGridMenu will error if no array passed', function() {
				uiGridGridMenuService.addToGridMenu(grid, grid);

				expect(gridUtil.logError).toHaveBeenCalledWith('addToGridMenu: menuItems must be an array, and is not, not adding any items');
				expect(grid.gridMenuScope.registeredMenuItems).toEqual([]);
			});

			it('addToGridMenu will error if an array passed, but gridMenuScope is not defined', function() {
				uiGridGridMenuService.addToGridMenu({}, []);

				expect(gridUtil.logError).toHaveBeenCalledWith('Asked to addToGridMenu, but gridMenuScope not present.  Timing issue?  ' +
					'Please log issue with ui-grid');
			});

			it('removeFromGridMenu will error if it finds multiple items with the same id and only remove the last one', function() {
				menuItems.push(menuItems[1]); // push a second item with the same id
				uiGridGridMenuService.addToGridMenu(grid, menuItems);

				expect(grid.gridMenuScope.registeredMenuItems.length).toEqual(menuItems.length);

				uiGridGridMenuService.removeFromGridMenu(grid, menuItems[1].id);

				expect(gridUtil.logError).toHaveBeenCalledWith('removeFromGridMenu: found multiple items with the same id, removing only the last');
				expect(grid.gridMenuScope.registeredMenuItems.length).toEqual(menuItems.length - 1);
			});

			it('removeFromGridMenu will do nothing if gridMenuScope is not defined', function() {
				uiGridGridMenuService.removeFromGridMenu({}, menuItems[0].id);

				expect(gridUtil.logError).not.toHaveBeenCalled();
			});

			it('addToGridMenu will add new menu items if no menu items are defined already', function() {
				var mockGrid = {gridMenuScope: {}};

				uiGridGridMenuService.addToGridMenu(mockGrid, menuItems);

				expect(mockGrid.gridMenuScope.registeredMenuItems).toEqual(menuItems);
			});

			it('adds array to registered menu items, removes those items again', function() {
				uiGridGridMenuService.addToGridMenu(grid, menuItems);

				expect(grid.gridMenuScope.registeredMenuItems).toEqual(menuItems, 'both menu items present');

				uiGridGridMenuService.removeFromGridMenu(grid, 'customItem1');
				expect(grid.gridMenuScope.registeredMenuItems).toEqual([{id: 'customItem2', title: 'y'}], 'only one menu item present');

				// no error when remove item that is not present
				uiGridGridMenuService.removeFromGridMenu(grid, 'customItem1');
				expect(grid.gridMenuScope.registeredMenuItems).toEqual([{id: 'customItem2', title: 'y'}], 'only one menu item present');

				uiGridGridMenuService.removeFromGridMenu(grid, 'customItem2');
				expect(grid.gridMenuScope.registeredMenuItems).toEqual([], 'no menu items present');
			});
		});

		describe('getMenuItems: ', function() {
			var menuItems;

			beforeEach(function() {
				uiGridGridMenuService.initialize($scope, grid);
				grid.options.gridMenuCustomItems = undefined;
				spyOn(gridUtil, 'logError').and.callFake(angular.noop);
				spyOn(grid, 'clearAllFilters').and.callFake(angular.noop);
			});
			afterEach(function() {
				gridUtil.logError.calls.reset();
				grid.clearAllFilters.calls.reset();
			});

			it('logs an error if gridMenuCustomItems is not an array', function() {
				grid.options.gridMenuCustomItems = {};

				uiGridGridMenuService.getMenuItems($scope);

				expect(gridUtil.logError).toHaveBeenCalledWith('gridOptions.gridMenuCustomItems must be an array, and is not');
			});

			it('nothing in any config should have one element (ClearFilters)', function() {
				grid.options.gridMenuShowHideColumns = false;

				menuItems = uiGridGridMenuService.getMenuItems($scope);

				expect(menuItems.length).toEqual(1);
			});

			it('should call the clear filters function when that menu item is clicked', function() {
				grid.options.gridMenuShowHideColumns = false;

				menuItems = uiGridGridMenuService.getMenuItems($scope);
				menuItems[0].action();

				expect(grid.clearAllFilters).toHaveBeenCalled();
			});

			it('grab bag of stuff', function() {
				grid.options.gridMenuCustomItems = [{title: 'z', order: 11}, {title: 'a', order: 12}];
				grid.options.gridMenuTitleFilter = function(title) {
					return 'fn_' + title;
				};
				var registeredMenuItems = [{id: 'customItem1', title: 'x', order: 1}, {id: 'customItem2', title: 'y', order: 2}];
				grid.options.columnDefs[1].enableHiding = false;

				uiGridGridMenuService.addToGridMenu(grid, registeredMenuItems);

				menuItems = uiGridGridMenuService.getMenuItems($scope);

				expect(menuItems.length).toEqual(9,
					'Should be 9 items, 2 from customItems, 2 from registered, 1 columns header, and 3 columns that allow hiding');
				expect(menuItems[0].title).toEqual('x', 'Menu item 0 should be from register');
				expect(menuItems[1].title).toEqual('y', 'Menu item 1 should be from register');
				expect(menuItems[2].title).toEqual('z', 'Menu item 2 should be from customItem');
				expect(menuItems[3].title).toEqual('a', 'Menu item 3 should be from customItem');

				expect(menuItems[4].title).toEqual('Clear all filters', 'Menu item 4 Clear all filters');
				expect(menuItems[5].title).toEqual('Columns:', 'Menu item 5 should be header');
				expect(menuItems[5].templateUrl).toEqual('ui-grid/ui-grid-menu-header-item');
				expect(menuItems[6].title.toLowerCase()).toEqual('fn_col1', 'Menu item 5 should be col1');
				expect(menuItems[7].title.toLowerCase()).toEqual('fn_col3', 'Menu item 6 should be col3');
				expect(menuItems[8].title.toLowerCase()).toEqual('fn_col4', 'Menu item 7 should be col4');

				expect(menuItems[6].context.gridCol).toEqual(grid.columns[0], 'column hide/show menus should have gridCol');
				expect(menuItems[7].context.gridCol).toEqual(grid.columns[2], 'column hide/show menus should have gridCol');
				expect(menuItems[8].context.gridCol).toEqual(grid.columns[3], 'column hide/show menus should have gridCol');
			});

			it('gridMenuTitleFilter returns a promise', function() {
				var promises = [];

				grid.options.gridMenuTitleFilter = function() {
					var deferred = $q.defer();

					promises.push(deferred);
					return deferred.promise;
				};

				menuItems = uiGridGridMenuService.getMenuItems($scope);

				expect(menuItems.length).toEqual(6, 'Should be 6 items, 1 columns header, 4 columns that allow hiding and clear all filters');
				expect(menuItems[0].title).toEqual('Clear all filters', 'Menu item 0 should be Clear all filters');
				expect(menuItems[1].title).toEqual('Columns:', 'Menu item 1 should be header');
				expect(menuItems[1].templateUrl).toEqual('ui-grid/ui-grid-menu-header-item');
				expect(menuItems[2].title).toEqual('', 'Promise not resolved');
				expect(menuItems[3].title).toEqual('', 'Promise not resolved');
				expect(menuItems[4].title).toEqual('', 'Promise not resolved');
				expect(menuItems[5].title).toEqual('', 'Promise not resolved');

				promises.forEach(function(promise, index) {
					promise.resolve('resolve_' + index);
				});
				$scope.$digest();

				expect(menuItems.length).toEqual(6, 'Should be 10 items, 1 columns header, 4 columns that allow hiding and Clean all filters');
				expect(menuItems[0].title).toEqual('Clear all filters', 'Menu item 0 should be Clear all filters');
				expect(menuItems[1].title).toEqual('Columns:', 'Menu item 0 should be header');
				expect(menuItems[1].templateUrl).toEqual('ui-grid/ui-grid-menu-header-item');
				expect(menuItems[2].title).toEqual('resolve_0', 'Promise now resolved');
				expect(menuItems[3].title).toEqual('resolve_1', 'Promise now resolved');
				expect(menuItems[4].title).toEqual('resolve_2', 'Promise now resolved');
				expect(menuItems[5].title).toEqual('resolve_3', 'Promise now resolved');
			});
		});

		describe('showHideColumns: ', function() {
			var event, showHideColumns;

			beforeEach(function() {
				event = jasmine.createSpyObj('event', ['stopPropagation']);
				grid.options.columnDefs = [
					{name: 'col1', visible: true},
					{field: 'col2', visible: false},
					{name: 'col3'},
					{field: 'col4'}
				];
				uiGridGridMenuService.initialize($scope, grid);
				spyOn(uiGridGridMenuService, 'toggleColumnVisibility').and.callFake(function(gridCol) {
					gridCol.colDef.visible = !gridCol.colDef.visible;
				});
			});
			afterEach(function() {
				event.stopPropagation.calls.reset();
				uiGridGridMenuService.toggleColumnVisibility.calls.reset();
			});
			it('should return an empty array if no columns are defined', function() {
				grid.options.columnDefs = undefined;

				expect(uiGridGridMenuService.showHideColumns($scope)).toEqual([]);
			});
			it('calls toggleColumnVisibility and stopPropagation when hide menu item is clicked', function() {
				showHideColumns = uiGridGridMenuService.showHideColumns($scope);
				showHideColumns[1].context.gridCol.colDef.visible = false;
				showHideColumns[1].action(event);

				expect(event.stopPropagation).toHaveBeenCalled();
				expect(uiGridGridMenuService.toggleColumnVisibility).toHaveBeenCalled();
			});
			it('toggles the icon to ok when hide menu item is clicked', function() {
				showHideColumns = uiGridGridMenuService.showHideColumns($scope);
				event.target = {firstChild: {}};
				showHideColumns[1].context.gridCol.colDef.visible = false;
				showHideColumns[1].action(event);

				expect(event.target.firstChild.className).toEqual('ui-grid-icon-ok');
			});
			it('calls toggleColumnVisibility and stopPropagation when show menu item is clicked', function() {
				showHideColumns = uiGridGridMenuService.showHideColumns($scope);
				showHideColumns[1].action(event);

				expect(event.stopPropagation).toHaveBeenCalled();
				expect(uiGridGridMenuService.toggleColumnVisibility).toHaveBeenCalled();
			});
			it('toggles the icon to cancel when show menu item is clicked', function() {
				showHideColumns = uiGridGridMenuService.showHideColumns($scope);
				event.target = {firstChild: {}};
				showHideColumns[1].context.gridCol.colDef.visible = true;
				showHideColumns[1].action(event);

				expect(event.target.firstChild.className).toEqual('ui-grid-icon-cancel');
			});
		});

		describe('setMenuItemTitle: ', function() {
			var colDef, menuItem, mockGrid;

			beforeEach(function() {
				colDef = {field: 'test'};
				menuItem = {};
				mockGrid = {
					options: {gridMenuTitleFilter: jasmine.createSpy('gridMenuTitleFilter')}
				};
				spyOn(gridUtil, 'logError').and.callThrough();
			});
			afterEach(function() {
				mockGrid.options.gridMenuTitleFilter.calls.reset();
				gridUtil.logError.calls.reset();
			});
			it('should log an error when the title is invalid', function() {
				mockGrid.options.gridMenuTitleFilter.and.returnValue({foo: 'bar'});
				uiGridGridMenuService.setMenuItemTitle(menuItem, colDef, mockGrid);

				expect(gridUtil.logError).toHaveBeenCalledWith(
					'Expected gridMenuTitleFilter to return a string or a promise, it has returned neither, bad config');
				expect(menuItem.title).toEqual('badconfig');
			});
			it('should set the title to the error value when the title is a promise that fails', function() {
				mockGrid.options.gridMenuTitleFilter.and.returnValue({
					then: function(successCallback, errorCallback) {
						errorCallback('errorValue');

						return {catch: angular.noop};
					}
				});
				uiGridGridMenuService.setMenuItemTitle(menuItem, colDef, mockGrid);

				expect(menuItem.title).toEqual('errorValue');
			});
			it('should set the title to the returned value when the title is a promise that succeeds', function() {
				mockGrid.options.gridMenuTitleFilter.and.returnValue({
					then: function(successCallback) {
						successCallback('The Promised Title');

						return {catch: angular.noop};
					}
				});
				uiGridGridMenuService.setMenuItemTitle(menuItem, colDef, mockGrid);

				expect(menuItem.title).toEqual('The Promised Title');
			});
			it('should set the title to the value returned by gridMenuTitleFilter when the title is a string', function() {
				mockGrid.options.gridMenuTitleFilter.and.callFake(function(field) {
					return field;
				});
				uiGridGridMenuService.setMenuItemTitle(menuItem, colDef, mockGrid);

				expect(menuItem.title).toEqual(colDef.field);
			});
		});

		describe('toggleColumnVisibility: ', function() {
			var gridCol;

			beforeEach(function() {
				gridCol = {
					colDef: {},
					grid: {
						refresh: jasmine.createSpy('refresh'),
						api: {
							core: {
								notifyDataChange: jasmine.createSpy('notifyDataChange'),
								raise: {
									columnVisibilityChanged: jasmine.createSpy('columnVisibilityChanged')
								}
							}
						}
					}
				};
				uiGridGridMenuService.toggleColumnVisibility(gridCol);
			});
			it('should trigger refresh', function() {
				expect(gridCol.grid.refresh).toHaveBeenCalled();
			});
			it('should trigger notifyDataChange', function() {
				expect(gridCol.grid.api.core.notifyDataChange).toHaveBeenCalled();
			});
			it('should trigger columnVisibilityChanged', function() {
				expect(gridCol.grid.api.core.raise.columnVisibilityChanged).toHaveBeenCalled();
			});
		});
	});

	describe('uiGridMenuButton directive', function() {
		var $compile, element, uiGrid;

		beforeEach(function() {
			inject(function(_$compile_) {
				$compile = _$compile_;
			});

			$scope = $rootScope.$new();

			$scope.gridOpts = {
				enableGridMenu: true,
				data: [{name: 'Bob'}, {name: 'Mathias'}, {name: 'Fred'}]
			};

			element = angular.element('<div ui-grid="gridOpts"></div>');
			spyOn(uiGridGridMenuService, 'initialize').and.callThrough();
			spyOn(gridUtil.focus, 'bySelector').and.callThrough();

			uiGrid = $compile(element)($scope);
			$scope.$apply();

			$('body').append(uiGrid);
			$('.ui-grid-column-menu-button').click();
		});
		afterEach(function() {
			uiGridGridMenuService.initialize.calls.reset();
			gridUtil.focus.bySelector.calls.reset();
			$scope.$destroy();
			uiGrid.remove();
		});
		it('should trigger initializeGrid on the uiGridGridMenuService', function() {
			expect(uiGridGridMenuService.initialize).toHaveBeenCalled();
		});
		it('should show the grid menu when the ui-grid-menu-button is clicked and the menu is hidden', function() {
			$('.ui-grid-icon-menu').click();
			expect($('.ui-grid-menu').is(':visible')).toBe(true);
		});
		it('should focus on the grid container', function() {
			$('.ui-grid-icon-menu').click();
			$scope.$broadcast('menu-hidden');
			expect(gridUtil.focus.bySelector).toHaveBeenCalledWith(jasmine.any(Object), '.ui-grid-icon-container');
		});
	});
});
