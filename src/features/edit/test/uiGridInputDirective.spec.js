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

    it('value of input date should be same as ng-model', function () {
      scope.myDate = new Date(2014, 0, 1);
      recompile();
      expect(scope.inputForm.inputDate.$viewValue).toBe('2014-01-01');
      scope.myDate = null;
      recompile();
      expect(scope.inputForm.inputDate.$viewValue).toBeNull();
    });

    it('change in input value should update ng-model', function () {
      recompile();
      scope.inputForm.inputDate.$setViewValue('1900-01-01');
      recompile();
      expect(scope.myDate.getFullYear()).toBe(1900);
      scope.inputForm.inputDate.$setViewValue(null);
      recompile();
      expect(scope.myDate).toBeNull();
    });

    it('invalid date value in ng-model should set $valid to false', function () {
      scope.myDate = new Date(2014, 0, 1);
      recompile();
      expect(scope.inputForm.$valid).toBe(true);
      scope.myDate = new Date('invalid value');
      recompile();
      expect(scope.inputForm.$valid).toBe(false);
      scope.myDate = null;
      recompile();
      expect(scope.inputForm.$valid).toBe(true);
    });

});