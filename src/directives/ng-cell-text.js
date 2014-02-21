ngGridDirectives.directive('ngCellText',
  function () {
      return function(scope, elm) {
          function mouseover (evt) {
              evt.preventDefault();
          }
          elm.bind('mouseover', mouseover);

          function mouseleave(evt) {
              evt.preventDefault();
          }
          elm.bind('mouseleave', mouseleave);

          elm.on('$destroy', function() {
            elm.off('mouseover', mouseover);
            elm.off('mouseleave', mouseleave);
          });
      };
  });