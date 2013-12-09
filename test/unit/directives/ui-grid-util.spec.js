
describe('ui-grid-util', function() {
  var GridUtil;


  beforeEach(function() {
    module('ui.grid.util');

    inject(function ($injector) {
      GridUtil = $injector.get('GridUtil');
    });
  });

  describe('readableColumnName', function() {
    it('should create readable column names from properties', function() {

      var translationExpects = [
        ['property', 'Property'],
        ['Property', 'Property'],
        ['aProperty', 'A Property'],
        ['ThisProperty', 'This Property'],
        ['a_property', 'A Property'],
        ['another_property', 'Another Property'],
        ['ALLCAPS', 'Allcaps']
      ];

      angular.forEach(translationExpects, function (set) {
        var strIn = set[0];
        var strOut = set[1];
        
        expect(GridUtil.readableColumnName(strIn)).toEqual(strOut);
      });
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