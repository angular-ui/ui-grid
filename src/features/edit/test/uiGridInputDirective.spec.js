describe('inputDirective', function () {
    var element;
    var recompile;
    var scope;

  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function ($rootScope, $compile) {
      element = angular.element('<div><form name="inputForm"><input type="date" ng-model="myDate" name="inputDate"/></form></div>');
      scope = $rootScope.$new();

      recompile = function () {
        $compile(element)(scope);
        $rootScope.$digest();
      };
    }));

    xit('value of input date should be same as ng-model', function () {
      scope.myDate = new Date('2014-01-01');
      recompile();
      expect(scope.inputForm.inputDate.$viewValue).toBe('2014-01-01');
    });

    xit('change in input value should update ng-model', function () {
      recompile();
      scope.inputForm.inputDate.$setViewValue('2013-01-01');
      recompile();
      expect(scope.myDate.getFullYear()).toBe(2013);
    });

    it('invalid date value in ng-model should set $valid to false', function () {
      recompile();
      expect(scope.inputForm.$valid).toBe(true);
      scope.myDate = new Date('invalid value');
      recompile();
      expect(scope.inputForm.$valid).toBe(false);
    });

    it('invalid date value input should set $valid to false', function () {
      recompile();
      scope.inputForm.inputDate.$setViewValue('invalid date');
      recompile();
      expect(scope.inputForm.$valid).toBe(false);
    });

});