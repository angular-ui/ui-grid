(function() {

var app = angular.module('customizer', []);

app.controller('Main', function($scope, less) {

  $scope.$watch('source', function(n, o) {
    less.process(n)
      .then(function(css) {
        $scope.css = css;
      });
  });

});

app.service('less', function($q) {
  var parser = new less.Parser();

  return {
    process: function (src, compress) {
      var comp;
      if (compress) {
        comp = true;
      }

      var p = $q.defer();
      parser.parse(src, function(err, tree) {
        if (err) {
          p.reject(err);
        }
        else {
          p.resolve( tree.toCSS({ compress: comp }) );
        }
      });

      return p.promise;
    }
  };
});

})();