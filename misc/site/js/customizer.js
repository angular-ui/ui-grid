(function() {

var app = angular.module('customizer', ['ui.grid', 'ui.grid.style']);

app.run(function($log, $rootScope, $http) {
});

app.controller('Main', function($log, $http, $scope, less) {
  $scope.gridOptions = {};
  $http.get('/data/100.json')
    .success(function(data) {
      $scope.gridOptions.data = data;
    });

  $http.get('/less/ui-grid.less')
    .success(function (data) {
      $scope.source = data;
      $scope.variables = less.parseVariables(data);
    });

  $scope.$watch('source', function(n, o) {
    if (n) {
      $scope.updateCSS();
    }
  });

  $scope.updateCSS = function() {
    var src = less.replaceVariables($scope.source, $scope.variables);
    less.process(src)
      .then(
        function(css) {
          $scope.css = css;
          $scope.cssErr = null;
        },
        function(err) {
          $log.debug('wha!');
          $scope.cssErr = err;
        }
      );
    };
});

app.service('less', function($log, $q) {
  

  var variableBlockRe = /\/\*-- VARIABLES.+?--\*\/([\s\S]+?)\/\*-- END VARIABLES.+?--\*\//m;
  var variableRe = /(\@\w+)\: (.+?);/g;

  return {
    parseVariables: function (src) {
      var groups = src.match(variableBlockRe);
      var variableText = groups[1];

      var variables = []

      var match;
      while (match = variableRe.exec(variableText)) {
        variables.push({ name: match[1], value: match[2] });
      }

      return variables;
    },

    replaceVariables: function(src, vars) {
      angular.forEach(vars, function (variable) {
        var re = new RegExp('(' + variable.name + ')\: (.+?);', 'g');
        src = src.replace(re, '$1: ' + variable.value + ';');
      });

      return src;
    },

    process: function (src, compress) {
      var comp;
      if (compress) {
        comp = true;
      }

      var parser = new less.Parser();

      var p = $q.defer();
      try {
        parser.parse(src, function(err, tree) {
          if (err) {
            p.reject(err.message);
          }
          else {
            $log.debug('tree', tree);
            var css = tree.toCSS({ compress: comp });
            p.resolve(css);
          }
        });
      }
      catch (e) {
        p.resolve(e);
      }

      return p.promise;
    }
  };
});

})();