(function() {

"use strict";

describe('templates', function () {
  var $scope;
  beforeEach(module('ngGrid'));
  beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
      $scope = $rootScope.$new();
  }));

  // describe('external templates', function() {
  //   it('should load external templates before building the grid', inject(function($httpBackend){
  //     // Row will be empty, according to my bug inspecting.
      
      
  //   }));
  // });
});

})();