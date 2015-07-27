//Tests the simple functionality on the basic directives
angular.forEach([
  {tag:'id',              method:'attr'},
  {tag:'alt',             method:'attr'},
  {tag:'value',           method:'attr'},
  {tag:'href',            method:'attr'},
  {tag:'title',           method:'attr'},
  {tag:'aria-label',      method:'attr'},
  {tag:'aria-labelledby', method:'attr'},
  {tag:'html',            method:'html'},
  {tag:'text',            method:'text'}

], function(v){
  //Generate the directive name
  var directiveName = 'ui-grid-one-bind-' + v.tag;
  describe(directiveName, function() {
    var $scope, $compile, directiveElt, recompile;

    beforeEach(module('ui.grid'));

    beforeEach(inject(function (_$compile_, $rootScope) {
      $scope = $rootScope;
      $compile = _$compile_;

      //Initialize the value
      $scope.val = null;

      recompile = function () {
        directiveElt = angular.element('<div '+ directiveName +'="val"></div>');
        $compile(directiveElt)($scope);
        $scope.$digest();
      };
      recompile();
    }));

    describe("basic '"+ v.tag +"' one bind", function(){
      it("should bind the value to the '"+ v.tag +"' dom tag", function(){
        $scope.val = "aValue";
        $scope.$digest();
        if (v.method === 'attr'){
          expect(directiveElt[v.method](v.tag)).toBe($scope.val);
        } else {
          expect(directiveElt[v.method]()).toBe($scope.val);
        }
      });

      it("should not change the '"+ v.tag +"' after the watcher should have been removed", function(){
        $scope.val = "aValue";
        $scope.$digest();
        $scope.val = "aNewValue";
        $scope.$digest();
        if (v.method === 'attr'){
          expect(directiveElt[v.method](v.tag)).not.toBe($scope.idVal);
        } else {
          expect(directiveElt[v.method]()).not.toBe($scope.idVal);
        }
      });
    });

  });
});

//Tests for the directives that dynamically add the grid id to the parameters
angular.forEach([
  {tag:'id',              directiveName:'id-grid',              method:'attr'},
  {tag:'aria-labelledby', directiveName:'aria-labelledby-grid', method:'attr', supportsMultipleIds:true /*Supports multiple ids on this tag*/}
], function(v){
  //Generate the directive name
  var directiveName = 'ui-grid-one-bind-' + v.directiveName;
  describe(directiveName, function() {
    var $scope, $compile, directiveElt, recompile;

    beforeEach(module('ui.grid'));

    beforeEach(inject(function (_$compile_, $rootScope) {
      $scope = $rootScope;
      $compile = _$compile_;

      //Initialize the value
      $scope.val = null;
      //Generate a fake grid id to put in the scope
      $scope.grid = {
        id: 12345
      };

      recompile = function () {
        directiveElt = angular.element('<div '+ directiveName +'="val"></div>');
        $compile(directiveElt)($scope);
        $scope.$digest();
      };
      recompile();
    }));

    describe("basic '"+ v.directiveName +"' one bind", function(){
      it("should bind the value to the '"+ v.tag +"' dom tag and append the grid id", function(){
        $scope.val = "aValue";
        $scope.$digest();
        if (v.method === 'attr'){
          expect(directiveElt[v.method](v.tag)).toBe($scope.grid.id + '-' +$scope.val);
        } else {
          expect(directiveElt[v.method]()).toBe($scope.grid.id + '-' +$scope.val);
        }
      });

      it("should not change the '"+ v.tag +"' after the watcher should have been removed", function(){
        $scope.val = "aValue";
        $scope.$digest();
        $scope.val = "aNewValue";
        $scope.$digest();
        if (v.method === 'attr'){
          expect(directiveElt[v.method](v.tag)).not.toBe($scope.grid.id + '-' +$scope.val);
        } else {
          expect(directiveElt[v.method]()).not.toBe($scope.grid.id + '-' +$scope.val);
        }
      });

      if (v.supportsMultipleIds){ //If this tag supports multiple ids on the tag

        it("should bind the the multiple ids to the '"+ v.tag +"' dom tag and append the grid id to each one", function(){
          var valPt1 = "aValue";
          var valPt2 = "bValue";
          $scope.val = valPt1 + " " + valPt2;
          //The id that is expected.
          var expectedId = $scope.grid.id + "-" + valPt1 + " " + $scope.grid.id + "-" + valPt2;
          $scope.$digest();

          if (v.method === 'attr'){
            expect(directiveElt[v.method](v.tag)).toBe(expectedId);
          } else {
            expect(directiveElt[v.method]()).toBe(expectedId);
          }
        });
      }
    });
  });
});

describe('ui-grid-one-bind-class', function() {
  var $scope, $compile, directiveElt, recompile;

  beforeEach(module('ui.grid'));

  //Try out two different starting values
  angular.forEach([null, undefined], function(startingValue){
    describe("basic 'class' one bind using object with starting value '" + startingValue + "'", function(){
      beforeEach(inject(function (_$compile_, $rootScope) {
        $scope = $rootScope;
        $compile = _$compile_;

        //Initialize the value
        $scope.val = startingValue;

        recompile = function () {
          directiveElt = angular.element("<div ui-grid-one-bind-class='{customClass: val}'></div>");
          $compile(directiveElt)($scope);
          $scope.$digest();
        };
        recompile();
      }));

      it("should bind the value to the 'class' dom tag", function(){
        $scope.val = true;
        $scope.$digest();
        expect(directiveElt.hasClass('customClass')).toBe($scope.val);

      });

      it("should not change the 'class' after the watcher should have been removed", function(){
        $scope.val = true;
        $scope.$digest();
        $scope.val = false;
        $scope.$digest();
        expect(directiveElt.hasClass('customClass')).not.toBe($scope.val);
      });
    });
  });

  describe("basic 'class' one bind using a variable", function(){
    beforeEach(inject(function (_$compile_, $rootScope) {
      $scope = $rootScope;
      $compile = _$compile_;

      $scope.classElement = null;

      recompile = function () {
        directiveElt = angular.element("<div ui-grid-one-bind-class='classElement'></div>");
        $compile(directiveElt)($scope);
        $scope.$digest();
      };
      recompile();

    }));
    it("should have the classses listed", function(){
      $scope.classElement = ['customClass', 'anotherCustomClass'];

      $scope.$digest();

      expect(directiveElt.hasClass('customClass')).toBe(true);
      expect(directiveElt.hasClass('anotherCustomClass')).toBe(true);
    });
    it("should have the class listed", function(){
      $scope.classElement = 'customClass';

      $scope.$digest();

      expect(directiveElt.hasClass('customClass')).toBe(true);
    });
  });

});
