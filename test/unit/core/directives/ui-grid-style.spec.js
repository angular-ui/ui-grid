
describe('ui.grid.style', function() {


  beforeEach(module('ui.grid'));

  beforeEach(module(function($sceProvider) {
    $sceProvider.enabled(true);
  }));

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

    // Disable as angular 1.3.0 allows expressions in <style> blocks
    // it("doesn't affect style elements without the directive", function () {
    //   element = angular.element('<style>{{ foo }}</style>');
    //   recompile();
    //   expect(element.text()).toEqual('{{ foo }}');
    // });

    it('does not create useless <br>s', function() {
      element = angular.element("<style ui-grid-style>{{ foo }}</style>");
      scope.foo = '\n.bar { color: red }\n';
      recompile();
      expect(element.html()).toEqual(scope.foo);
    });

     it('works when mixing text and expressions', function() {
      element = angular.element("<style ui-grid-style>.blah { color: {{ color }}; }</style>");
      scope.color = 'black';
      recompile();
      expect(element.html()).toEqual('.blah { color: black; }');
    });
  });

});