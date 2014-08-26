describe('GridRow factory', function () {
  var $q, $scope, grid, Grid, GridRow, gridUtil;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridRow_, _gridUtil_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridRow = _GridRow_;
    gridUtil = _gridUtil_;
  }));


 describe('binding', function() {
    var grid;
    var entity;
    beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridRow_, _gridUtil_) {
      grid = new Grid({id:'a'});

      entity = {
        simpleProp: 'simpleProp',
        complexProp: { many: { paths: 'complexProp'}},
        functionProp: function () {
          return 'functionProp';
        },
        arrayProp: ['arrayProp']
      };
      entity['weird-prop'] = 'weird-prop';
    }));

    it('binds correctly to row.entity', function() {
      var gridRow = new GridRow(entity,0,grid);
      var col = {
        field:'simpleProp'
      };
      expect(gridRow.getQualifiedColField(col)).toBe('row.entity[\'simpleProp\']');
    });

  });


});

