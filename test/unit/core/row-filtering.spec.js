describe('rowSearcher', function() {
  var grid, $scope, $compile, recompile,
      rows, columns, rowSearcher, uiGridConstants, filter;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _rowSearcher_, Grid, GridRow, GridColumn, _uiGridConstants_) {
    $scope = $rootScope;
    rowSearcher = _rowSearcher_;
    uiGridConstants = _uiGridConstants_;

    grid = new Grid({
        id: 1,
        enableFiltering: true
    });

    rows = grid.rows = [
      new GridRow({ name: 'Bill', company: 'Gruber, Inc.', age: 25, isActive: true, date: new Date('2015-07-01T13:25:00+00:00') }, 0, grid), // Wednesday
      new GridRow({ name: 'Frank', company: 'Foo Co', age: 45, isActive: false, date: new Date('2015-06-24T13:25:00+00:00') }, 1, grid), // Wednesday
      new GridRow({ name: 'Joe', company: 'Movers, Inc.', age: 0, isActive: false, date: new Date('2015-06-29T13:25:00+00:00') }, 2, grid) // Monday
    ];

    columns = grid.columns = [
      new GridColumn({ name: 'name' }, 0, grid),
      new GridColumn({ name: 'company' }, 1, grid),
      new GridColumn({ name: 'age' }, 2, grid),
      new GridColumn({ name: 'isActive' }, 3, grid),
      new GridColumn({ name: 'date' }, 4, grid)
    ];

    filter = null;
  }));

  function setFilter(column, term, condition) {
    column.filters = [];
    column.filters.push({
      term: term,
      condition: condition
    });
  }

  afterEach(function () {
    // angular.element(grid).remove();
    grid = null;
  });

  describe('guessCondition', function () {
    it('should create a RegExp when term ends with a *', function() {
      var filter = { term: 'blah*' };

      var re = new RegExp(/^blah[\s\S]*?$/i);

      expect(rowSearcher.guessCondition(filter)).toEqual(re);
    });

    it('should create a RegExp when term starts with a *', function() {
      var filter = { term: '*blah' };

      var re = new RegExp(/^[\s\S]*?blah$/i);

      expect(rowSearcher.guessCondition(filter)).toEqual(re);
    });

    it('should create a RegExp when term starts and ends with a *', function() {
      var filter = { term: '*blah*' };

      var re = new RegExp(/^[\s\S]*?blah[\s\S]*?$/i);

      expect(rowSearcher.guessCondition(filter)).toEqual(re);
    });

    it('should create a RegExp when term has a * in the middle', function() {
      var filter = { term: 'bl*h' };

      var re = new RegExp(/^bl[\s\S]*?h$/i);

      expect(rowSearcher.guessCondition(filter)).toEqual(re);
    });

    it('should guess CONTAINS when term has no *s', function() {
      var filter = { term: 'blah' };

      expect(rowSearcher.guessCondition(filter)).toEqual(uiGridConstants.filter.CONTAINS, 'CONTAINS');
    });


  });

  describe('getTerm', function() {
    it('should return the term from a filter', function () {
      var filter = { term: 'bob' };

      expect(rowSearcher.getTerm(filter)).toEqual('bob');
    });

    it('should trims strings', function () {
      var filter = { term: '  bob    ' };

      expect(rowSearcher.getTerm(filter)).toEqual('bob');
    });
  });

  describe('stripTerm', function() {
    it('should remove leading asterisk ', function () {
      var filter = { term: '*bob' };

      expect(rowSearcher.stripTerm(filter)).toEqual('bob');
    });

    it('should remove trailing asterisk ', function () {
      var filter = { term: 'bob*' };

      expect(rowSearcher.stripTerm(filter)).toEqual('bob');
    });

    it('should remove both leading and trailing asterisk ', function () {
      var filter = { term: '*bob*' };

      expect(rowSearcher.stripTerm(filter)).toEqual('bob');
    });

    it('should remove only one leading and trailing asterisk, and escape the rest', function () {
      var filter = { term: '**bob**' };

      expect(rowSearcher.stripTerm(filter)).toEqual('\\*bob\\*');
    });
  });

  // TODO(c0bra): add tests for term handling like '< 5', etc. It needs to guess the condition

  describe('with one column filtered', function () {
    it('should run the search', function () {
      setFilter(columns[0], 'il', uiGridConstants.filter.CONTAINS);

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('with two columns filtered', function () {
    it('should run the search', function () {
      setFilter(columns[0], 'il', uiGridConstants.filter.CONTAINS);
      setFilter(columns[1], 'ub', uiGridConstants.filter.CONTAINS);

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('with one matching term and one failing term set on both columns', function() {
    it('should not show the row', function () {
      setFilter(columns[0], 'Bil');
      setFilter(columns[1], 'blargle');

      rows.splice(1);

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(0);
    });
  });

  describe('with a trailing *', function () {
    it('needs to match', function () {
      setFilter(columns[0], 'Bil*');

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('with a preceding *', function () {
    it('needs to match', function () {
      setFilter(columns[0], '*ll');

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('with a * inside the term', function () {
    it('needs to match', function () {
      setFilter(columns[0], 'B*ll');

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('a *', function () {
    it('should match zero characters too', function () {
      setFilter(columns[0], 'Bi*ll');

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('with logically falsy terms (0 and false)', function() {
    it('should filter by false', function() {
      setFilter(columns[3], false);

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(2);
    });

    it('should filter by 0', function() {
      setFilter(columns[2], 0);

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(1);
    });
  });

  describe('with external filtering', function () {
    it('should not filter at all', function () {
      grid.options.useExternalFiltering = true;
      setFilter(columns[0], 'Bi*ll');

      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(3);
    });
  });

  describe('with a custom filter function', function() {
    var custom, ret;
    beforeEach(function() {
      // A custom filtering function (condition), eg:
      //   ">20"  : returns rows where column val is >20
      //   "<=10" : returns rows where column val is <=10
      custom = {};
      custom.filterFn = function(searchTerm, rowValue, row, column) {
        var firstChar = searchTerm.charAt(0);
        var secondChar = searchTerm.charAt(1);
        var orEqualTo = secondChar === '=';
        var trimBy = orEqualTo ? 2 : 1 ;
        var compareTo;

        if (firstChar === '>') {
          compareTo = searchTerm.substr(trimBy) * 1;
          return orEqualTo ? rowValue >= compareTo : rowValue > compareTo;
        }
        else if (firstChar === '<') {
          compareTo = searchTerm.substr(trimBy) * 1;
          return orEqualTo ? rowValue <= compareTo : rowValue < compareTo;
        }
        else {
          return true;
        }
      };

      spyOn(custom, 'filterFn').andCallThrough();
      setFilter(columns[2], '>27', custom.filterFn);
      ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });
    });
    it('should run the function for each row', function() {
      expect(custom.filterFn.calls.length).toEqual(3);
      expect(custom.filterFn.calls[0].args).toEqual(['>27', 25, rows[0], columns[2]]);
      expect(custom.filterFn.calls[1].args).toEqual(['>27', 45, rows[1], columns[2]]);
    });
    it('should honor the result of the function call when filtering', function() {
      expect(ret.length).toEqual(1);
    });
  });

  describe('with a cellFilter', function(){
    it('should filter by the displayed text', function(){
      var col = grid.columns[4];
      col.cellFilter = 'date:"EEEE"';
      col.filterCellFiltered = true;

      setFilter(columns[4], 'Wed', uiGridConstants.filter.CONTAINS);
      var ret = rowSearcher.search(grid, rows, columns).filter(function(row){ return row.visible; });

      expect(ret.length).toEqual(2);
    });
  });
});
