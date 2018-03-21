(function() {

var app = angular.module('customizer', ['ui.grid', 'ui.grid.cellNav', 'ui.grid.edit',
'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns',
'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping'
]);

app.run(function($log, $rootScope, $http) {
});

app.constant('FILES',{
  DATA_100: '/data/100.json',
  LESS_MAIN: '/less/main.less',
  LESS_VARIABLES: '/less/variables.less',
  JSON_THEMES: '/customizer/themes/themes.json',
});

app.constant('DIRECTORIES', {
  BOOTSTRAP: './../../bootstrap'
});

app.controller('Main', function($log, $http, $scope, uiGridConstants, less, Theme, FILES) {
  var vm = this;

  function updateCSS(compress) {
    $scope.compress = compress;
    var fullSrc = $scope.source + ' ' + $scope.customLess;
    var src = fullSrc;
    less.process(src, $scope.compress, $scope.variables)
      .then(
        function(css) {
          $scope.css = css;
          $scope.cssErr = null;
          //Apply is needed because this is in a promise
          $scope.$apply();
        },
        function(err) {
          $scope.cssErr = err;
          //Apply is needed because this is in a promise
          $scope.$apply();
        }
      );
  }

  vm.gridOptions = {
    showGridFooter: true,
    showColumnFooter: true,
    enableFiltering: true,
    enableGridMenu: true,
    flatEntityAccess: true,
    fastWatch: true,
    enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED
  };
  $http.get(FILES.DATA_100)
    .then(function(response) {
      vm.gridOptions.data = response.data;
    });

  //Fetch initial less file
  $http.get(FILES.LESS_MAIN)
    .then(function (response) {
      $scope.source = response.data;
    });

  $http.get(FILES.LESS_VARIABLES)
    .then(function (response) {
      $scope.variables = less.parseVariables(response.data);
      $scope.trueDefaultVariables = angular.copy($scope.variables);
      $scope.defaultVariables = angular.copy($scope.trueDefaultVariables);
    });

  // function() { return { a: $scope.source, b: $scope.compress }; }
  $scope.$watch('source', function(n, o) {
    if (n) {
      updateCSS();
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
    updateCSS();
  };

  $scope.updateCSS = _.debounce(updateCSS, 750);

  $scope.cssSize = function() {
    return (unescape(encodeURIComponent( $scope.css )).length / 1000).toFixed(2) + 'kB';
  };

  $scope.setTheme = function(theme) {
    $scope.theme = theme;
    if (theme) {
      var themeData = $scope.themeHash[theme];

      _.forEach(themeData.variables, function (val, name) {
        var matches = _.where($scope.defaultVariables, { name: name });
        matches[0].value = val;
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

app.service('Theme', function($q, $http, FILES) {
  return {
    getThemes: function() {
      var p = $q.defer();

      $http.get(FILES.JSON_THEMES)
        .then(function (themeList) {
          var promises = [];
          var themes = {};
          angular.forEach(themeList.data, function(theme) {
            var tp = $http.get('/customizer/themes/' + theme + '.json');
            tp.then(function (response) {
              themes[theme] = response.data;
            });
            promises.push(tp);
          });

          $q.all(promises)
            .then(function() {
              p.resolve({
                themeList: themeList.data,
                themeHash: themes
              });
            });
        });

      return p.promise;
    }
  };
});

app.service('less', function($log, $q, FILES, DIRECTORIES) {
  var blackListVariables = [
    '@bootstrapDirectory'
  ];
  var variableBlockRe = /\/\*-- VARIABLES.+?--\*\/([\s\S]+?)\/\*-- END VARIABLES.+?--\*\//m;

  var sectionRe = /\/\*\*([\s\S])*?\*\//mg;

  var variableRe = /(\@\w+)\: (.+?);/g;

  var lessService = {
    parseVariables: function (src) {
      var groups = src.match(variableBlockRe);
      var variableText = groups[1];

      var variables = [];

      var varMatch;
      while ((varMatch = variableRe.exec(variableText))) {
        //If the var is in the list of blacklist variables then don't add it
        if(_.includes(blackListVariables, varMatch[1])) {
          continue;
        }
        variables.push({ name: varMatch[1], cleanName: varMatch[1].replace('@',''), value: varMatch[2] });
      }
      return variables;
    },


    // replaceVariables: function(src, vars) {
    //   angular.forEach(vars, function (variable) {
    //     var re = new RegExp('(' + variable.name + ')\: (.+?);', 'g');
    //     src = src.replace(re, '$1: ' + variable.value + ';');
    //   });
    //
    //   return src;
    // },

    process: function (src, compress, variables) {
      var comp = !!compress;
      var modifyVars = {
        bootstrapDirectory: "'" + DIRECTORIES.BOOTSTRAP + "'"
      };
      if(variables){
        _.forEach(variables, function(variable){
          modifyVars[variable.cleanName] = variable.value;
        });
      }
      return less.render(src, {
         paths: ['.' ,'./less/'],  // Specify search paths for @import directives
         filename: './..' + FILES.LESS_MAIN, // Specify a filename to know what the source directory was.
         compress: comp,          // Minify CSS output
         modifyVars: modifyVars
       })
        .then(function( output) {
          return output.css;
        })
        .catch(function(error){
          $log.error(error);
        });
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
