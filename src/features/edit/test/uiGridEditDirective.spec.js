describe('uiGridEditDirective', function() {
	var gridUtil,
		scope,
		element,
		cellEditorHtml = '<div><input ng-model="COL_FIELD" ui-grid-editor/></div>',
		colDefEditableCellTemplate = '<div><input ng-model="COL_FIELD"/></div>',
		gridOptionsEditableCellTemplate = '<div><input ng-model="COL_FIELD"/></div>',
		recompile;

	beforeEach(module('ui.grid.edit'));

	beforeEach(inject(function($rootScope, $compile, $controller, _gridUtil_, $templateCache, $timeout) {
		gridUtil = _gridUtil_;

		$templateCache.put('ui-grid/ui-grid', '<div/>');
		$templateCache.put('ui-grid/uiGridCell', '<div/>');
		$templateCache.put('ui-grid/uiGridHeaderCell', '<div/>');
		$templateCache.put('ui-grid/cellEditor', cellEditorHtml);

		scope = $rootScope.$new();
		scope.options = {};
		scope.options.data = [
			{col1: 'row1'},
			{col1: 'row2'}
		];

		scope.options.columnDefs = [
			{field: 'col1', enableCellEdit: true},
			{field: 'col2', enableCellEdit: false}
		];

		recompile = function() {
			$compile(element)(scope);
			$rootScope.$digest();
		};
	}));

	describe('columnsBuilder function', function() {
		it('should create additional edit properties', function() {
			element = angular.element('<div ui-grid="options" ui-grid-edit />');
			recompile();

			// grid scope is a child of the scope used to compile the element.
			// this is the only way I could figure out how to access
			var gridScope = element.scope().$$childTail,
				col = gridScope.grid.getColumn('col1');

			expect(col).not.toBeNull();
			expect(col.colDef.enableCellEdit).toBe(true);
			expect(col.editableCellTemplate).toBe(cellEditorHtml);

			col = gridScope.grid.getColumn('col2');
			expect(col).not.toBeNull();
			expect(col.colDef.enableCellEdit).toBe(false);
			expect(col.colDef.editableCellTemplate).not.toBeDefined();
			expect(col.colDef.editModelField).not.toBeDefined();
		});

		it('editableCellTemplate value should get priority over default templates', function() {

			element = angular.element('<div ui-grid="options" ui-grid-edit />');
			scope.options.editableCellTemplate = gridOptionsEditableCellTemplate;
			recompile();

			// A template specified in Grid Options should get priority over defaults
			var gridScope = element.scope().$$childTail,
				col = gridScope.grid.getColumn('col1');

			expect(col.editableCellTemplate).toBe(gridOptionsEditableCellTemplate);

			// A template specified in colDef should get priority over defaults
			// as well as one specified in grid options
			scope.options.columnDefs[0].editableCellTemplate = colDefEditableCellTemplate;
			recompile();
			expect(col.editableCellTemplate).toBe(colDefEditableCellTemplate);
		});
	});

});
