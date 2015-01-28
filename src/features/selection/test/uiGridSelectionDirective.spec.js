describe('ui.grid.selection uiGridSelectionDirective', function() {
  var parentScope,
      elm,
      scope,
      gridCtrl;

  beforeEach(module('ui.grid.selection'));

  beforeEach(function() {
    var rootScope;

    inject([
        '$rootScope',
        function (rootScopeInj) {
            rootScope = rootScopeInj;
        }
    ]);

    parentScope = rootScope.$new();

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

    inject([
        '$compile',
        function ($compile) {
        elm = $compile(tpl)(parentScope);
    }]);

    parentScope.$digest();
    scope = elm.scope();

    gridCtrl = elm.controller('uiGrid');

  });

  it('should set the "enableSelection" field of the row using the function specified in "isRowSelectable"', function() {
    for (var i = 0; i < gridCtrl.grid.rows.length; i++) {
      var currentRow = gridCtrl.grid.rows[i];
      expect(currentRow.enableSelection).toEqual(currentRow.entity.id % 2 === 0);
    }
  });
});
