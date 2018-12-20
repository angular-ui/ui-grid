describe('ui.grid.selection uiGridSelectionDirective', function() {
  var parentScope,
      elm,
      scope,
      gridCtrl,
      $compile,
      $rootScope,
      $timeout,
      uiGridConstants;

  /*
   NOTES
   - We have to flush $timeout because the header calculations are done post-$timeout, as that's when the header has been fully rendered.
   - We have to actually attach the grid element to the document body, otherwise it will not have a rendered height.
   */
  function compileUiGridSelectionDirective(parentScope) {
    var elm = angular.element('<div style="width: 300px; height: 500px" ui-grid="options" ui-grid-selection></div>');

    document.body.appendChild(elm[0]);
    $compile(elm)(parentScope);
    $timeout.flush();
    parentScope.$apply();

    return elm;
  }

  beforeEach(function() {
    module('ui.grid.selection');

    inject(function(_$compile_, _$rootScope_, _$timeout_, _uiGridConstants_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      uiGridConstants = _uiGridConstants_;
    });

    parentScope = $rootScope.$new();
    parentScope.options = {
      columnDefs : [{field: 'id'}],
      data: [],
      isRowSelectable: function(gridRow) {
        return gridRow.entity.id % 2 === 0;
      }
    };

    for (var i = 0; i < 10; i++) {
      parentScope.options.data.push({id: i});
    }

    elm = compileUiGridSelectionDirective(parentScope);
    scope = elm.scope();
    gridCtrl = elm.controller('uiGrid');
  });

  it('should add the row header selection buttons', function() {
    expect($(elm).find('.ui-grid-header .ui-grid-selection-row-header-buttons').length).toEqual(1);
  });

  it('should set the "enableSelection" field of the row using the function specified in "isRowSelectable"', function() {
    for (var i = 0; i < gridCtrl.grid.rows.length; i++) {
      var currentRow = gridCtrl.grid.rows[i];
      expect(currentRow.enableSelection).toEqual(currentRow.entity.id % 2 === 0);
    }
  });

  it('should add cellFocus to the row header columnDef"', function() {
    for (var i = 0; i < gridCtrl.grid.columns.length; i++) {
      var currentCol = gridCtrl.grid.columns[i];
      if (currentCol.name === "selectionRowHeaderCol") {
        expect(currentCol.colDef.allowCellFocus).toBe(true);
      }
    }
  });

  describe('with filtering turned on', function () {
    beforeEach(function () {
      parentScope.options.enableFiltering = true;
      elm = compileUiGridSelectionDirective(parentScope);
    });

    afterEach(function () {
      $(elm).remove();
    });

    it("doesn't prevent headers from shrinking when filtering gets turned off", function () {
      // Header height with filtering on
      var filteringHeight = $(elm).find('.ui-grid-header').height();

      parentScope.options.enableFiltering = false;
      elm.controller('uiGrid').grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      $timeout.flush();
      parentScope.$apply();

      var noFilteringHeight = $(elm).find('.ui-grid-header').height();

      expect(noFilteringHeight).not.toEqual(filteringHeight);
      expect(noFilteringHeight < filteringHeight).toBe(true);
    });
  });

  describe('when row header selection is turned off', function() {
    beforeEach(function () {
      parentScope.options.enableRowHeaderSelection = false;
      elm = compileUiGridSelectionDirective(parentScope);
    });

    it('should not add the row header selection buttons', function() {
      expect($(elm).find('.ui-grid-header .ui-grid-selection-row-header-buttons').length).toEqual(0);
    });
  });

  describe('when isRowSelectable is not defined', function() {
    beforeEach(function () {
      delete parentScope.options.isRowSelectable;
      elm = compileUiGridSelectionDirective(parentScope);
      gridCtrl = elm.controller('uiGrid');
    });

    it('should not define enableSelection', function() {
      for (var i = 0; i < gridCtrl.grid.rows.length; i++) {
        var currentRow = gridCtrl.grid.rows[i];
        expect(currentRow.enableSelection).toBeUndefined();
      }
    });
  });
});
