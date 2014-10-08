(function() {

var app = angular.module('customizer', ['ui.grid']);

app.run(function($log, $rootScope, $http) {
});

app.controller('Main', function($log, $http, $scope, less, Theme) {
  // Create grid
  $scope.gridOptions = {};
  $http.get('/data/100.json')
    .success(function(data) {
      $scope.gridOptions.data = data;
    });

  // Fetch initial less file
  $http.get('/less/ui-grid.less')
    .success(function (data) {
      $scope.source = data;
      $scope.variables = less.parseVariables(data);
      $scope.trueDefaultVariables = angular.copy($scope.variables);
      $scope.defaultVariables = angular.copy($scope.trueDefaultVariables);
    });

  // function() { return { a: $scope.source, b: $scope.compress }; }
  $scope.$watch('source', function(n, o) {
    if (n) {
      $scope.updateCSS();
    }
  });

  // Get themes
  Theme.getThemes()
    .then(function (themes) {
      $scope.themes = themes.themeList;
      $scope.themeHash = themes.themeHash;
    });

  // Reset variables to defaults
  $scope.resetVariables = function() {
    if ($scope.defaultCustomLess) {
      $scope.customLess = $scope.defaultCustomLess;
    }

    $scope.variables = angular.copy($scope.defaultVariables);
    $scope.updateCSS();
  };

  $scope.updateCSS = function(compress) {
    $scope.compress = compress;
    var fullSrc = $scope.source + ' ' + $scope.customLess;
    var src = less.replaceVariables(fullSrc, $scope.variables);
    less.process(src, $scope.compress)
      .then(
        function(css) {
          $scope.css = css;
          $scope.cssErr = null;
        },
        function(err) {
          $scope.cssErr = err;
        }
      );
  };

  $scope.cssSize = function() {
    return (unescape(encodeURIComponent( $scope.css )).length / 1000).toFixed(2) + 'kB';
  };

  $scope.setTheme = function(theme) {
    $scope.theme = theme;
    if (theme) {
      var themeData = $scope.themeHash[theme];

      angular.forEach(themeData.variables, function (val, name) {
        var matches = _.where($scope.defaultVariables, { name: name });
        matches[0].value = val
        // $scope.defaultVariables[name] = val;
      });

      if (themeData.customLess) {
        $scope.defaultCustomLess = themeData.customLess;
        $scope.customLess = themeData.customLess;
      }

      $scope.resetVariables();
    }
    else {
      $scope.defaultVariables = angular.copy($scope.trueDefaultVariables);
      $scope.defaultCustomLess = '';
      $scope.customLess = '';
      $scope.resetVariables();
    }
  };

  // $scope.clipboard = function() {
  //   client.setText($scope.css);
  // };
});

app.service('Theme', function($q, $http) {
  return {
    getThemes: function() {
      var p = $q.defer();

      $http.get('/customizer/themes/themes.json')
        .success(function (themeList) {
          var promises = [];
          var themes = {};
          angular.forEach(themeList, function(theme) {
            var tp = $http.get('/customizer/themes/' + theme + '.json');
            tp.success(function (data) {
              themes[theme] = data;
            });
            promises.push(tp);
          });

          $q.all(promises)
            .then(function() {
              p.resolve({
                themeList: themeList,
                themeHash: themes
              });
            });
        });

      return p.promise;
    }
  };
});

app.service('less', function($log, $q) {
  var variableBlockRe = /\/\*-- VARIABLES.+?--\*\/([\s\S]+?)\/\*-- END VARIABLES.+?--\*\//m;

  var sectionRe = /\/\*\*([\s\S])*?\*\//mg;

  var variableRe = /(\@\w+)\: (.+?);/g;

  var lessService = {
    parseVariables: function (src) {
      var groups = src.match(variableBlockRe);
      var variableText = groups[1];

      // var sections = [];
      var variables = [];

      // var sectionMatch;
      // while (sectionMatch = sectionRe.exec(variableText) {
      //   var sectionName = 

        var varMatch;
        while (varMatch = variableRe.exec(variableText)) {
          variables.push({ name: varMatch[1], value: varMatch[2] });
        }
      // });

      return variables;
    },

    replaceVariableBlock: function(src, replacement) {
      return src.replace(variableBlockRe, replacement);
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
            // $log.debug('tree', tree);
            var css = tree.toCSS({ compress: comp });
            p.resolve(css);
          }
        });
      }
      catch (e) {
        // $log.debug('catch e', e);
        p.reject(e.message);
      }

      return p.promise;
    }
  };

  return lessService;
});

app.directive('hoverSelect', function() {
  
  return {
    link: function(scope, elm, attrs) {
      elm.on('mouseover', function() {
        var startPos = 0, endPos = elm.val().length;

         // Chrome / Firefox
        if(typeof(elm[0].selectionStart) != "undefined") {
          elm.focus();
          elm[0].selectionStart = startPos;
          elm[0].selectionEnd = endPos;
          return true;
        }

        // IE
        if (document.selection && document.selection.createRange) {
            elm.focus();
            elm.select();
            var range = document.selection.createRange();
            range.collapse(true);
            range.moveEnd("character", endPos);
            range.moveStart("character", startPos);
            range.select();
            return true;
        }
      });
    }
  };
});

app.filter('capitalize', function() {
    return function(input, scope) {
        if (input!=null)
            return input.substring(0,1).toUpperCase()+input.substring(1);
    };
});

})();