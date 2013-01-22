ngGridDirectives.directive('ngCellText',
  function () {
      return function(scope, elm) {
          elm.bind('mouseover', function(evt) {
              evt.preventDefault();
              elm.css({
                  'cursor': 'text'
              });
          });
          elm.bind('mouseleave', function(evt) {
              evt.preventDefault();
              elm.css({
                  'cursor': 'default'
              });
          });
      };
  });