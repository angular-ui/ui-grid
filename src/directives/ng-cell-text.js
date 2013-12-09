ngGridDirectives.directive('ngCellText',
  function () {
      return function(scope, elm) {
          elm.bind('mouseover', function(evt) {
              evt.preventDefault();
          });
          elm.bind('mouseleave', function(evt) {
              evt.preventDefault();
          });
      };
  });