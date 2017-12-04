describe('ui-grid-column-menu uiGridColumnMenuService', function() {
	'use strict';

	var uiGridColumnMenuService, gridClassFactory, gridUtil, grid, $rootScope, $scope;

	beforeEach(function() {
		module('ui.grid');

		inject(function(_uiGridColumnMenuService_, _gridClassFactory_, _gridUtil_, _$rootScope_) {
			uiGridColumnMenuService = _uiGridColumnMenuService_;
			gridClassFactory = _gridClassFactory_;
			gridUtil = _gridUtil_;
			$rootScope = _$rootScope_;
		});
	});

	describe('uiGridColumnMenuService', function() {
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
			it('variables set', function() {
				var uiGridCtrlMock = {grid: grid};

				uiGridColumnMenuService.initialize($scope, uiGridCtrlMock);

				expect(uiGridCtrlMock.columnMenuScope).toEqual($scope);
				expect($scope.grid).toEqual(grid);
				expect($scope.menuShown).toEqual(false);
			});
		});

		describe('setColMenuItemWatch: ', function() {
			beforeEach(function() {
				$scope = $rootScope.$new();
				$scope.col = {uid: 'ui-grid-01x'};
				$scope.defaultMenuItems = [
					{title: 'a menu item'}
				];

				uiGridColumnMenuService.setColMenuItemWatch($scope);
			});
			afterEach(function() {
				$scope.$destroy();
			});
			it('sets the watch, col.menuItems added and noticed by the watch', function() {
				expect($scope.menuItems).toEqual(undefined);

				$scope.col.menuItems = [
					{title: 'a different menu item'}
				];

				$scope.$digest();

				expect($scope.menuItems).toEqual([
					{title: 'a menu item'},
					{title: 'a different menu item', context: jasmine.any(Object)}
				]);
			});
			it('should replace a falsy context with an object', function() {
				expect($scope.menuItems).toEqual(undefined);

				$scope.col.menuItems = [
					{title: 'a different menu item', context: false}
				];

				$scope.$digest();

				expect($scope.menuItems).toEqual([
					{title: 'a menu item'},
					{title: 'a different menu item', context: jasmine.any(Object)}
				]);
			});
			it('should maintain an existing context', function() {
				$scope.col = {uid: 'ui-grid-01x'};
				$scope.defaultMenuItems = [
					{title: 'a menu item'}
				];

				uiGridColumnMenuService.setColMenuItemWatch($scope);

				expect($scope.menuItems).toEqual(undefined);

				$scope.col.menuItems = [
					{title: 'a different menu item', context: {foo: 'bar'}}
				];

				$scope.$digest();

				expect($scope.menuItems).toEqual([
					{title: 'a menu item'},
					{title: 'a different menu item', context: jasmine.any(Object)}
				]);
				expect($scope.menuItems[1].context.foo).toEqual('bar');
			});
		});

		describe('sortable: ', function() {
			it('everything present: sortable', function() {
				$scope.col = {uid: 'ui-grid-01x', enableSorting: true};
				$scope.grid = {options: {enableSorting: true}};

				expect(uiGridColumnMenuService.sortable($scope)).toEqual(true);
			});

			it('grid.options missing', function() {
				$scope.col = {uid: 'ui-grid-01x', enableSorting: true};
				$scope.grid = {options: {}};

				expect(uiGridColumnMenuService.sortable($scope)).toEqual(false);
			});

			it('col missing', function() {
				$scope.grid = {options: {enableSorting: true}};

				expect(uiGridColumnMenuService.sortable($scope)).toEqual(false);
			});

			it('col enable sorting false', function() {
				$scope.col = {uid: 'ui-grid-01x', enableSorting: false};
				$scope.grid = {options: {enableSorting: true}};

				expect(uiGridColumnMenuService.sortable($scope)).toEqual(false);
			});
		});

		describe('isActiveSort: ', function() {
			it('everything present: is active', function() {
				$scope.col = {uid: 'ui-grid-01x', sort: {direction: 'asc'}};

				expect(uiGridColumnMenuService.isActiveSort($scope, 'asc')).toEqual(true);
			});

			it('everything present: is not active', function() {
				$scope.col = {uid: 'ui-grid-01x', sort: {direction: 'asc'}};

				expect(uiGridColumnMenuService.isActiveSort($scope, 'desc')).toEqual(false);
			});

			it('direction missing', function() {
				$scope.col = {uid: 'ui-grid-01x', sort: {}};

				expect(uiGridColumnMenuService.isActiveSort($scope, 'desc')).toEqual(false);
			});

			it('sort missing', function() {
				$scope.col = {uid: 'ui-grid-01x'};

				expect(uiGridColumnMenuService.isActiveSort($scope, 'desc')).toEqual(false);
			});

			it('col missing', function() {
				expect(uiGridColumnMenuService.isActiveSort($scope, 'desc')).toEqual(false);
			});
		});

		describe('suppressRemoveSort: ', function() {
			it('everything present: is suppressed', function() {
				$scope.col = {uid: 'ui-grid-01x', suppressRemoveSort: true};

				expect(uiGridColumnMenuService.suppressRemoveSort($scope)).toEqual(true);
			});

			it('not set: is not suppressed', function() {
				$scope.col = {uid: 'ui-grid-01x'};

				expect(uiGridColumnMenuService.suppressRemoveSort($scope)).toEqual(false);
			});
		});

		describe('hideable: ', function() {
			it('everything present: is not hideable', function() {
				$scope.col = {uid: 'ui-grid-01x', colDef: {enableHiding: false}};

				expect(uiGridColumnMenuService.hideable($scope)).toEqual(false);
			});

			it('colDef missing: is  hideable', function() {
				$scope.col = {uid: 'ui-grid-01x'};

				expect(uiGridColumnMenuService.hideable($scope)).toEqual(true);
			});
		});

		describe('getDefaultMenuItems: ', function() {
			var defaultMenuItems, event;

			beforeEach(function() {
				event = jasmine.createSpyObj('event', ['stopPropagation']);
				defaultMenuItems = uiGridColumnMenuService.getDefaultMenuItems($scope);
			});
			it('should return all the default menu items', function() {
				expect(angular.isArray(defaultMenuItems)).toBe(true);
				expect(defaultMenuItems.length).toEqual(4);
			});
			describe('sort.ascending', function() {
				var sortAscendingMenuItem;

				beforeEach(function() {
					sortAscendingMenuItem = defaultMenuItems[0];
				});
				it('should have the correct icon', function() {
					expect(sortAscendingMenuItem.icon).toEqual('ui-grid-icon-sort-alt-up');
				});
				it('should stop propagation on action and sort column', function() {
					$scope.sortColumn = jasmine.createSpy('sortColumn');
					sortAscendingMenuItem.action(event);

					expect(event.stopPropagation).toHaveBeenCalled();
					expect($scope.sortColumn).toHaveBeenCalled();

					$scope.sortColumn.calls.reset();
				});
				it('should call sortable on shown', function() {
					spyOn(uiGridColumnMenuService, 'sortable').and.callFake(angular.noop);
					sortAscendingMenuItem.shown();

					expect(uiGridColumnMenuService.sortable).toHaveBeenCalled();

					uiGridColumnMenuService.sortable.calls.reset();
				});
				it('should call isActiveSort on active', function() {
					spyOn(uiGridColumnMenuService, 'isActiveSort').and.callFake(angular.noop);
					sortAscendingMenuItem.active();

					expect(uiGridColumnMenuService.isActiveSort).toHaveBeenCalled();

					uiGridColumnMenuService.isActiveSort.calls.reset();
				});
			});
			describe('sort.descending', function() {
				var sortAscendingMenuItem;

				beforeEach(function() {
					sortAscendingMenuItem = defaultMenuItems[1];
				});
				it('should have the correct icon', function() {
					expect(sortAscendingMenuItem.icon).toEqual('ui-grid-icon-sort-alt-down');
				});
				it('should stop propagation on action and sort column', function() {
					$scope.sortColumn = jasmine.createSpy('sortColumn');
					sortAscendingMenuItem.action(event);

					expect(event.stopPropagation).toHaveBeenCalled();
					expect($scope.sortColumn).toHaveBeenCalled();

					$scope.sortColumn.calls.reset();
				});
				it('should call sortable on shown', function() {
					spyOn(uiGridColumnMenuService, 'sortable').and.callFake(angular.noop);
					sortAscendingMenuItem.shown();

					expect(uiGridColumnMenuService.sortable).toHaveBeenCalled();

					uiGridColumnMenuService.sortable.calls.reset();
				});
				it('should call isActiveSort on active', function() {
					spyOn(uiGridColumnMenuService, 'isActiveSort').and.callFake(angular.noop);
					sortAscendingMenuItem.active();

					expect(uiGridColumnMenuService.isActiveSort).toHaveBeenCalled();

					uiGridColumnMenuService.isActiveSort.calls.reset();
				});
			});
			describe('sort.remove', function() {
				var sortRemoveMenuItem;

				beforeEach(function() {
					sortRemoveMenuItem = defaultMenuItems[2];
				});
				it('should have the correct icon', function() {
					expect(sortRemoveMenuItem.icon).toEqual('ui-grid-icon-cancel');
				});
				it('should stop propagation on action and unsort column', function() {
					$scope.unsortColumn = jasmine.createSpy('unsortColumn');
					sortRemoveMenuItem.action(event);

					expect(event.stopPropagation).toHaveBeenCalled();
					expect($scope.unsortColumn).toHaveBeenCalled();

					$scope.unsortColumn.calls.reset();
				});
				describe('shown', function() {
					beforeEach(function() {
						spyOn(uiGridColumnMenuService, 'sortable').and.returnValue(true);
						spyOn(uiGridColumnMenuService, 'suppressRemoveSort').and.returnValue(true);
						$scope.col = {};
					});
					afterEach(function() {
						uiGridColumnMenuService.sortable.calls.reset();
					});
					it('should return false when sortable returns false', function() {
						uiGridColumnMenuService.sortable.and.returnValue(false);

						expect(sortRemoveMenuItem.shown()).toBe(false);
					});
					it('should return false when the column object is undefined', function() {
						$scope.col = undefined;

						expect(sortRemoveMenuItem.shown()).toBe(false);
					});
					it('should return false when the column sort object is undefined', function() {
						$scope.col.sort = undefined;

						expect(sortRemoveMenuItem.shown()).toBe(false);
					});
					it('should return false when the column sort direction object is undefined', function() {
						$scope.col.sort = {};

						expect(sortRemoveMenuItem.shown()).toBe(false);
					});
					it('should return false when the column sort direction object is null', function() {
						$scope.col.sort = {direction: null};

						expect(sortRemoveMenuItem.shown()).toBe(false);
					});
					it('should return false when suppressRemoveSort returns true', function() {
						$scope.col.sort = {direction: 'ASC'};
						uiGridColumnMenuService.suppressRemoveSort.and.returnValue(true);

						expect(sortRemoveMenuItem.shown()).toBe(false);
					});
					it('should return true when suppressRemoveSort returns false, the column sort direction is defined and sortable is true', function() {
						uiGridColumnMenuService.sortable.and.returnValue(true);
						$scope.col.sort = {direction: 'ASC'};
						uiGridColumnMenuService.suppressRemoveSort.and.returnValue(false);

						expect(sortRemoveMenuItem.shown()).toBe(true);
					});
				});
			});
			describe('column.hide', function() {
				var columnHideMenuItem;

				beforeEach(function() {
					columnHideMenuItem = defaultMenuItems[3];
				});
				it('should have the correct icon', function() {
					expect(columnHideMenuItem.icon).toEqual('ui-grid-icon-cancel');
				});
				it('should stop propagation on action and hide column', function() {
					$scope.hideColumn = jasmine.createSpy('hideColumn');
					columnHideMenuItem.action(event);

					expect(event.stopPropagation).toHaveBeenCalled();
					expect($scope.hideColumn).toHaveBeenCalled();

					$scope.hideColumn.calls.reset();
				});
				it('should call hideable on shown', function() {
					spyOn(uiGridColumnMenuService, 'hideable').and.callFake(angular.noop);
					columnHideMenuItem.shown();

					expect(uiGridColumnMenuService.hideable).toHaveBeenCalled();

					uiGridColumnMenuService.hideable.calls.reset();
				});
			});
		});

		describe('getColumnElementPosition: ', function() {
			var $columnElement, column;

			beforeEach(function() {
				$columnElement = [{
					offsetTop: 10,
					offsetLeft: 20,
					offsetParent: {
						offsetLeft: 10
					}
				}];
				column = {grid: {options: {}}};
				spyOn(gridUtil, 'elementHeight').and.returnValue(30);
				spyOn(gridUtil, 'elementWidth').and.returnValue(100);
			});
			afterEach(function() {
				gridUtil.elementHeight.calls.reset();
				gridUtil.elementWidth.calls.reset();
			});
			it('should return the offsetLeft option when it is defined as the offset', function() {
				column.grid.options.offsetLeft = 50;
				expect(uiGridColumnMenuService.getColumnElementPosition($scope, column, $columnElement).offset).toEqual(column.grid.options.offsetLeft);
			});
			it('should return an offset of zero', function() {
				column.grid.options = {};
				expect(uiGridColumnMenuService.getColumnElementPosition($scope, column, $columnElement).offset).toEqual(0);
			});
			it('should get the top, left and parent left positions from the column element', function() {
				var positionData = uiGridColumnMenuService.getColumnElementPosition($scope, column, $columnElement);

				expect(positionData.left).toEqual($columnElement[0].offsetLeft);
				expect(positionData.top).toEqual($columnElement[0].offsetTop);
				expect(positionData.parentLeft).toEqual($columnElement[0].offsetParent.offsetLeft);
			});
			it('should get element height and width from gridUtil', function() {
				uiGridColumnMenuService.getColumnElementPosition($scope, column, $columnElement);

				expect(gridUtil.elementHeight).toHaveBeenCalled();
				expect(gridUtil.elementWidth).toHaveBeenCalled();
			});
		});

		describe('repositionMenu: ', function() {
			var column, left, positionData, renderContainerElm, $elm, $columnElement;

			beforeEach(function() {
				column = {};
				positionData = {
					top: 50,
					left: 200,
					parentLeft: 50,
					width: 300,
					height: 200
				};
				$elm = [{
					querySelectorAll: jasmine.createSpy('querySelectorAll').and.returnValue([])
				}];
				$elm.css = jasmine.createSpy('css');
				$columnElement = {};
				renderContainerElm = jasmine.createSpyObj('renderContainerElm', ['getBoundingClientRect', 'querySelectorAll']);
				$scope.grid = {
					element: [{
						getBoundingClientRect: function() {
							return {left: 10};
						}
					}]
				};

				renderContainerElm.getBoundingClientRect.and.returnValue({left: 10});
				renderContainerElm.querySelectorAll.and.returnValue([{scrollLeft: 10}]);
				spyOn(gridUtil, 'closestElm').and.returnValue(renderContainerElm);
				spyOn(gridUtil, 'elementWidth').and.returnValue(100);
				spyOn(gridUtil, 'getStyles').and.returnValue({paddingRight: 30});
			});
			afterEach(function() {
				gridUtil.closestElm.calls.reset();
				gridUtil.elementWidth.calls.reset();
				gridUtil.getStyles.calls.reset();
				renderContainerElm.getBoundingClientRect.calls.reset();
				renderContainerElm.querySelectorAll.calls.reset();
				$elm.css.calls.reset();
			});
			describe('when the current column has a lastMenuWidth and lastMenuPaddingRight defined', function() {
				beforeEach(function() {
					column = {
						lastMenuWidth: 100,
						lastMenuPaddingRight: 150
					};
					left = positionData.left + renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left -
						renderContainerElm.querySelectorAll()[0].scrollLeft + positionData.parentLeft + positionData.width - column.lastMenuWidth +
						column.lastMenuPaddingRight;
				});
				it('should use them to calculate the left position of the element', function() {
					uiGridColumnMenuService.repositionMenu($scope, column, positionData, $elm, $columnElement);
					expect($elm.css).toHaveBeenCalledWith('left', left + 'px');
				});
			});
			describe('when the current column does not have lastMenuWidth and lastMenuPaddingRight defined, but $scope does', function() {
				beforeEach(function() {
					$scope.lastMenuWidth = 100;
					$scope.lastMenuPaddingRight = 150;
					left = positionData.left + renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left -
						renderContainerElm.querySelectorAll()[0].scrollLeft + positionData.parentLeft + positionData.width - $scope.lastMenuWidth +
						$scope.lastMenuPaddingRight;
				});
				it('should use them to calculate the left position of the element', function() {
					uiGridColumnMenuService.repositionMenu($scope, column, positionData, $elm, $columnElement);
					expect($elm.css).toHaveBeenCalledWith('left', left + 'px');
				});
			});
			describe('when the left position is less the postion data offset', function() {
				beforeEach(function() {
					$scope.lastMenuWidth = 100;
					$scope.lastMenuPaddingRight = 150;
					left = positionData.left + renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left -
						renderContainerElm.querySelectorAll()[0].scrollLeft + positionData.parentLeft + positionData.width - $scope.lastMenuWidth +
						$scope.lastMenuPaddingRight;
					positionData.offset = left + 10;
				});
				it('should use the position data offset to calculate the left position of the element', function() {
					uiGridColumnMenuService.repositionMenu($scope, column, positionData, $elm, $columnElement);
					expect($elm.css).toHaveBeenCalledWith('left', positionData.offset + 'px');
				});
			});
			describe('when ui-grid-menu-mid is defined and visible', function() {
				beforeEach(function() {
					$elm[0].querySelectorAll.and.returnValue([{
						querySelectorAll: jasmine.createSpy('querySelectorAll').and.returnValue('<div></div>')
					}]);
					$scope.lastMenuWidth = 100;
					$scope.lastMenuPaddingRight = 150;
					left = positionData.left + renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left -
						renderContainerElm.querySelectorAll()[0].scrollLeft + positionData.parentLeft + positionData.width - gridUtil.elementWidth() +
						gridUtil.getStyles().paddingRight;
				});
				it('should use the position menu width and right padding to calculate the left position of the element', function() {
					uiGridColumnMenuService.repositionMenu($scope, column, positionData, $elm, $columnElement);
					expect($elm.css).toHaveBeenCalledWith('left', left + 'px');
				});
			});
		});
	});

	describe('uiGridColumnMenu directive', function() {
		var $compile, $timeout, element, uiGrid,
			columnVisibilityChanged, sortChanged;

		beforeEach(function() {
			inject(function(_$compile_, _$timeout_) {
				$compile = _$compile_;
				$timeout = _$timeout_;
			});
			$scope = $rootScope.$new();

			$scope.gridOpts = {
				enableSorting: true,
				data: [{ name: 'Bob' }, {name: 'Mathias'}, {name: 'Fred'}],
				onRegisterApi: function(gridApi) {
					columnVisibilityChanged = jasmine.createSpy('columnVisibilityChanged');
					gridApi.core.on.columnVisibilityChanged($scope, columnVisibilityChanged);

					sortChanged = jasmine.createSpy('sortChanged');
					gridApi.core.on.sortChanged($scope, sortChanged);
				}
			};

			element = angular.element('<div ui-grid="gridOpts"></div>');

			uiGrid = $compile(element)($scope);
			$scope.$apply();

			$('body').append(uiGrid);
			$('.ui-grid-column-menu-button').click();
		});
		afterEach(function() {
			$scope.$destroy();
			uiGrid.remove();
		});
		it('should raise the sortChanged event when unsort is clicked', function() {
			$($('.ui-grid-menu-item')[2]).click();
			$timeout.flush();

			expect(sortChanged).toHaveBeenCalledWith(jasmine.any(Object), []);
		});

    it('should raise the columnVisibilityChanged event when hide column is clicked', function() {
      $($('.ui-grid-menu-item')[3]).click();

      expect(columnVisibilityChanged).toHaveBeenCalled();
    });

	});
});
