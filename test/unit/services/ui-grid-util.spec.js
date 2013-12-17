describe('ui.grid.util', function() {
  var GridUtil;

  beforeEach(module('ui.grid.util'));

  beforeEach(inject(function(_GridUtil_) {
    GridUtil = _GridUtil_;
  }));

  describe('newId()', function() {
    it('creates a unique id each time it is called', function() {
      var id1 = GridUtil.newId();
      var id2 = GridUtil.newId();

      expect(id1).not.toEqual(id2);
    });
  });

  describe('readableColumnName', function() {
    it('does not throw with null name', function() {
      expect(function() {
        GridUtil.readableColumnName(null);
      }).not.toThrow();
    });

    it('should create readable column names from properties', function() {
      var translationExpects = [
        [0, '0'],
        ['property', 'Property'],
        ['Property', 'Property'],
        ['aProperty', 'A Property'],
        ['ThisProperty', 'This Property'],
        ['thisSecondProperty', 'This Second Property'],
        ['thingsILove', 'Things I Love'],
        ['a_property', 'A Property'],
        ['a__property', 'A Property'],
        ['another_property', 'Another Property'],
        ['ALLCAPS', 'Allcaps']
      ];

      angular.forEach(translationExpects, function (set) {
        var strIn = set[0];
        var strOut = set[1];
        
        expect(GridUtil.readableColumnName(strIn)).toEqual(strOut);
      });
    });

    it('handles multiple capitlization->separations', function() {
      var multiCapsed = GridUtil.readableColumnName('thisIsSoCool');

      expect(multiCapsed).toEqual('This Is So Cool');
    });
  });

  describe('getColumnsFromData', function() {
    it('should create column defs from a data array', function() {
      var data = [
        {
          firstName: 'Bob',
          lastName: 'Smith'
        }
      ];

      var columns = GridUtil.getColumnsFromData(data);

      expect(columns)
      .toEqual([
        {
          field: 'firstName',
          name: 'First Name'
        },
        {
          field: 'lastName',
          name: 'Last Name'
        }
      ]);
    });
  });
});