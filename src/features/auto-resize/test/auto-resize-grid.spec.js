describe('ui.grid.autoResizeGrid', function () {
	'use strict';

	var gridScope, gridElm, viewportElm, $scope, $compile, $timeout, recompile, gridUtil, uiGridConstants,
		gridDimensionChangedSpy = jasmine.createSpy('gridDimensionChangedSpy'),
		data = [
			{ name: "Ethel Price", gender: "female", company: "Enersol" },
			{ name: "Claudine Neal", gender: "female", company: "Sealoud" },
			{ name: "Beryl Rice", gender: "female", company: "Velity" },
			{ name: "Wilder Gonzales", gender: "male", company: "Geekko" }
		];

	beforeEach(function() {
		module('ui.grid');
		module('ui.grid.autoResize');

		inject(function(_$compile_, _$timeout_, $rootScope, _gridUtil_, _uiGridConstants_) {
			$scope = $rootScope;
			$compile = _$compile_;
			$timeout = _$timeout_;
			gridUtil = _gridUtil_;
			uiGridConstants = _uiGridConstants_;
		});

		spyOn(gridUtil, 'debounce').and.callFake(function(callback) {
			return function() {
				var self = this;

				return callback.apply(self, arguments);
			};
		});

		$scope.gridOpts = {
			data: data,
			onRegisterApi: function(gridApi) {
				gridApi.core.on.gridDimensionChanged($scope, gridDimensionChangedSpy);
			}
		};

		recompile = function() {
			gridElm = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts" ui-grid-auto-resize></div>');
			document.body.appendChild(gridElm[0]);
			$compile(gridElm)($scope);
			$scope.$apply();
			gridScope = gridElm.isolateScope();

			viewportElm = $(gridElm).find('.ui-grid-viewport');
		};

		recompile();
	});

	afterEach(function () {
		gridDimensionChangedSpy.calls.reset();
		gridUtil.debounce.calls.reset();
		angular.element(gridElm).remove();
		gridElm = null;
	});

	describe('on grid element width change to greater', function () {
		var w;
		beforeEach(function () {
			w = $(viewportElm).width();

			$(gridElm).width(600);
			$scope.$apply();
		});
		it('adjusts the grid viewport size', function () {
			var newW = $(viewportElm).width();
			expect(newW).toBeGreaterThan(w);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});

	describe('on grid element height change to greater', function () {
		var h;
		beforeEach(function () {
			h = $(viewportElm).height();

			$(gridElm).height(400);
			$scope.$apply();
		});
		it('adjusts the grid viewport size', function () {
			var newH = $(viewportElm).height();
			expect(newH).toBeGreaterThan(h);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});

	describe('on grid element width change to smaller', function () {
		var w;
		beforeEach(function (done) {
			w = $(viewportElm).width();

			$(gridElm).width(400);
			$scope.$apply();
			setTimeout(done, 300);
		});
		it('adjusts the grid viewport size', function () {
			var newW = $(viewportElm).width();
			expect(newW).toBeLessThan(w);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});

	describe('on grid element height change to smaller', function () {
		var h;
		beforeEach(function () {
			h = $(viewportElm).height();

			$(gridElm).height(200);
			$scope.$apply();
		});
		it('adjusts the grid viewport size', function () {
			var newH = $(viewportElm).height();
			expect(newH).toBeLessThan(h);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});

	// Rebuild the grid as having 100% width and 100% height and being in a 400px wide and 300px height container, then change the container width to 500px and make sure it adjusts
	describe('on grid container width change to greater', function () {
		var gridContainerElm, w;

		beforeEach(function () {
			angular.element(gridElm).remove();

			gridContainerElm = angular.element('<div style="width: 400px; height: 300px"><div style="width: 100%; height: 100%" ui-grid="gridOpts" ui-grid-auto-resize></div></div>');
			document.body.appendChild(gridContainerElm[0]);
			$compile(gridContainerElm)($scope);
			$scope.$apply();

			gridElm = gridContainerElm.find('[ui-grid]');

			viewportElm = $(gridElm).find('.ui-grid-viewport');

			w = $(viewportElm).width();

			$(gridContainerElm).width(500);
			$scope.$apply();
		});

		it('adjusts the grid viewport size', function() {
			var newW = $(viewportElm).width();

			expect(newW).toBeGreaterThan(w);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});

	// Rebuild the grid as having 100% width and 100% height and being in a 400px wide and 300px height container, then change the container height to 400px and make sure it adjusts
	describe('on grid container height change to greater', function () {
		var gridContainerElm;
		var h;

		beforeEach(function () {
			angular.element(gridElm).remove();

			gridContainerElm = angular.element('<div style="width: 400px; height: 300px"><div style="width: 100%; height: 100%" ui-grid="gridOpts" ui-grid-auto-resize></div></div>');
			document.body.appendChild(gridContainerElm[0]);
			$compile(gridContainerElm)($scope);
			$scope.$apply();

			gridElm = gridContainerElm.find('[ui-grid]');

			viewportElm = $(gridElm).find('.ui-grid-viewport');

			h = $(viewportElm).height();

			$(gridContainerElm).height(400);
			$scope.$apply();
		});

		it('adjusts the grid viewport size', function() {
			var newH = $(viewportElm).width();

			expect(newH).toBeGreaterThan(h);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});


	// Rebuild the grid as having 100% width and 100% height and being in a 400px wide and 300px height container, then change the container width to 300px and make sure it adjusts
	describe('on grid container width change to smaller', function () {
		var gridContainerElm;
		var w;

		beforeEach(function () {
			angular.element(gridElm).remove();

			gridContainerElm = angular.element('<div style="width: 400px; height: 300px"><div style="width: 100%; height: 100%" ui-grid="gridOpts" ui-grid-auto-resize></div></div>');
			document.body.appendChild(gridContainerElm[0]);
			$compile(gridContainerElm)($scope);
			$scope.$apply();

			gridElm = gridContainerElm.find('[ui-grid]');

			viewportElm = $(gridElm).find('.ui-grid-viewport');

			w = $(viewportElm).width();

			$(gridContainerElm).width(300);
			$scope.$apply();
		});

		it('adjusts the grid viewport size', function() {
			var newW = $(viewportElm).width();

			expect(newW).toBeLessThan(w);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});

	// Rebuild the grid as having 100% width and 100% height and being in a 400px wide and 300px height container, then change the container height to 200px and make sure it adjusts
	describe('on grid container height change to smaller', function () {
		var gridContainerElm;
		var h;

		beforeEach(function () {
			angular.element(gridElm).remove();

			gridContainerElm = angular.element('<div style="width: 400px; height: 300px"><div style="width: 100%; height: 100%" ui-grid="gridOpts" ui-grid-auto-resize></div></div>');
			document.body.appendChild(gridContainerElm[0]);
			$compile(gridContainerElm)($scope);
			$scope.$apply();

			gridElm = gridContainerElm.find('[ui-grid]');

			viewportElm = $(gridElm).find('.ui-grid-viewport');

			h = $(viewportElm).height();

			$(gridContainerElm).height(200);
			$scope.$apply();
		});

		it('adjusts the grid viewport size', function() {
			var newH = $(viewportElm).height();

			expect(newH).toBeLessThan(h);
		});
		it('should raise a gridDimensionChanged event', function() {
			$timeout.flush();
			expect(gridDimensionChangedSpy).toHaveBeenCalled();
		});
	});
});
