(function(){

angular.module('ui.grid')
.factory('GridRenderContainer', ['gridUtil', function(gridUtil) {
  function GridRenderContainer(grid) {
    this.grid = grid;
    
    this.rowCache = [];
    this.columnCache = [];
  }

  // GridRenderContainer.prototype.addRenderable = function addRenderable(renderable) {
  //   this.renderables.push(renderable);
  // };

  GridRenderContainer.prototype.reset = function reset() {
    this.rowCache.length = 0;
    this.columnCache.length = 0;
  };

  // TODO(c0bra): calculate size?? Should this be in a stackable directive?

  return GridRenderContainer;
}]);

})();