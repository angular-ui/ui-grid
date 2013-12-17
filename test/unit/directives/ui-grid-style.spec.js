
describe('ui.grid.style', function() {
  var GridUtil;

  beforeEach(module('ui.grid.style'));

  describe('ui-grid-style', function() {
    var element, scope, compile, recompile;

    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope;
      compile = $compile;
      
      recompile = function() {
        compile(element)(scope);
        scope.$digest();
      };
    }));

    it('allows style elements to have expressions', function() {
      element = angular.element('<style ui-grid-style>{{ foo }}</style>');
      scope.foo = '.bar { color: red }';
      recompile();

      expect(element.text()).toEqual(scope.foo);
    });

    it("doesn't affect style elements without the directive", function () {
      element = angular.element('<style>{{ foo }}</style>');
      recompile();
      expect(element.text()).toEqual('{{ foo }}');
    });
  });

});