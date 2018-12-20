describe('rowSearcher', function() {
	var rowSearcher,
		uiGridConstants;

	beforeEach(module('ui.grid'));

	beforeEach(inject(function(_rowSearcher_, _uiGridConstants_) {
		rowSearcher = _rowSearcher_;
		uiGridConstants = _uiGridConstants_;
	}));

	describe('runColumnFilter', function() {
		it('should be able to compare dates', function() {
			var grid = {
				getCellValue: function() {
					return '2015/05/23';
				}
			};

			var filter = {
				term: '2015/05/24',
				flags: {date: true},
				condition: uiGridConstants.filter.GREATER_THAN
			};
			expect(rowSearcher.runColumnFilter(grid, 1, 2, filter)).toBe(false, 'date not greater than');

			filter.term = '2015/05/22';
			filter.condition = uiGridConstants.filter.GREATER_THAN;
			expect(rowSearcher.runColumnFilter(grid, 1, 2, filter)).toBe(true, 'date is greater than');

			filter.term = '2015/05/24';
			filter.condition = uiGridConstants.filter.GREATER_THAN;
			expect(rowSearcher.runColumnFilter(grid, 1, 2, filter)).toBe(false, 'date not greater than again');

			filter.term = '2015/05/23';
			filter.condition = uiGridConstants.filter.GREATER_THAN_OR_EQUAL_TO;
			expect(rowSearcher.runColumnFilter(grid, 1, 2, filter)).toBe(true, 'date greater than or equal to');
		});
	});
});
