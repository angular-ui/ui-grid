describe('ui.grid.selection uiGridSelectionDirective', function() {
  var parentScope,
      elm,
      scope,
      gridCtrl,
      $compile,
      $rootScope,
      uiGridConstants;

  beforeEach(module('ui.grid.selection'));

  beforeEach(inject(function(_$rootScope_, _$compile_, _uiGridConstants_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    uiGridConstants = _uiGridConstants_;

    parentScope = $rootScope.$new();

    parentScope.options = {
      columnDefs : [{field: 'id'}]
    };

    parentScope.options.isRowSelectable = function(gridRow) {
      return gridRow.entity.id % 2 === 0;
    };

    parentScope.options.data = [];
    for (var i = 0; i < 10; i++) {
      parentScope.options.data.push({id: i});
    }

    var tpl = '<div ui-grid="options" ui-grid-selection options="options"></div>';
    elm = $compile(tpl)(parentScope);

    parentScope.$digest();
    scope = elm.scope();

    gridCtrl = elm.controller('uiGrid');

  }));

  it('should set the "enableSelection" field of the row using the function specified in "isRowSelectable"', function() {
    for (var i = 0; i < gridCtrl.grid.rows.length; i++) {
      var currentRow = gridCtrl.grid.rows[i];
      expect(currentRow.enableSelection).toEqual(currentRow.entity.id % 2 === 0);
    }
  });

  it('should add cellFocus to the row header columnDef"', function() {
    for (var i = 0; i < gridCtrl.grid.columns.length; i++) {
      var currentCol = gridCtrl.grid.columns[i];
      if (currentCol.name === "selectionRowHeaderCol"){
        expect(currentCol.colDef.allowCellFocus).toBe(true);
      }
    }
  });

  describe('with filtering turned on', function () {
    var elm, $timeout;

    /*
      NOTES
       - We have to flush $timeout because the header calculations are done post-$timeout, as that's when the header has been fully rendered.
       - We have to actually attach the grid element to the document body, otherwise it will not have a rendered height.
    */

    beforeEach(inject(function (_$timeout_) {
      $timeout = _$timeout_;

      parentScope.options.enableFiltering = true;

      elm = angular.element('<div style="width: 300px; height: 500px" ui-grid="options" ui-grid-selection></div>');
      document.body.appendChild(elm[0]);
      $compile(elm)(parentScope);
      $timeout.flush();
      parentScope.$digest();
    }));

    afterEach(function () {
      $(elm).remove();
    });

    it("doesn't prevent headers from shrinking when filtering gets turned off", function () {
      // Header height with filtering on
      var filteringHeight = $(elm).find('.ui-grid-header').height();
      
      parentScope.options.enableFiltering = false;
      elm.controller('uiGrid').grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      $timeout.flush();
      parentScope.$digest();

      var noFilteringHeight = $(elm).find('.ui-grid-header').height();

      expect(noFilteringHeight).not.toEqual(filteringHeight);
      expect(noFilteringHeight < filteringHeight).toBe(true);
    });
  });
});
