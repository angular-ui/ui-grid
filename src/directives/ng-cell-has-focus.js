ngGridDirectives.directive('ngCellHasFocus', ['$domUtilityService',
    function (domUtilityService) {
        var focusOnInputElement = function($scope, elm) {
            $scope.isFocused = true;
            domUtilityService.digest($scope);

            $scope.$broadcast('ngGridEventStartCellEdit');
            $scope.$emit('ngGridEventStartCellEdit');

            $scope.$on('$destroy', $scope.$on('ngGridEventEndCellEdit', function() {
                $scope.isFocused = false;
                domUtilityService.digest($scope);
            }));
        };

        return function($scope, elm) {
            var isFocused = false;
            var isCellEditableOnMouseDown = false;

            $scope.editCell = function() {
                if(!$scope.enableCellEditOnFocus) {
                    setTimeout(function() {
                        focusOnInputElement($scope,elm);
                    }, 0);
                }
            };

            function mousedown (evt) {
                if($scope.enableCellEditOnFocus) {
                    isCellEditableOnMouseDown = true;
                } else {
                    elm.focus();
                }
                return true;
            }

            function click (evt) {
                if($scope.enableCellEditOnFocus) {
                    evt.preventDefault();
                    isCellEditableOnMouseDown = false;
                    focusOnInputElement($scope,elm);
                }
            }

            elm.bind('mousedown', mousedown);

            elm.bind('click', click); 

            function focus (evt) {
                isFocused = true;
                if($scope.enableCellEditOnFocus && !isCellEditableOnMouseDown) {
                    focusOnInputElement($scope,elm);
                }
                return true;
            }

            elm.bind('focus', focus);

            function blur() {
                isFocused = false;
                return true;
            }

            elm.bind('blur', blur);

            function keydown (evt) {
                if(!$scope.enableCellEditOnFocus) {
                    if (isFocused && evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && evt.keyCode !== 9 && !evt.shiftKey && evt.keyCode !== 13) {
                        focusOnInputElement($scope,elm);
                    }
                    if (isFocused && evt.shiftKey && (evt.keyCode >= 65 && evt.keyCode <= 90)) {
                        focusOnInputElement($scope, elm);
                    }
                    if (evt.keyCode === 27) {
                        elm.focus();
                    }
                }
                return true;
            }

            elm.bind('keydown', keydown);

            elm.on('$destroy', function() {
                elm.off('mousedown', mousedown);
                elm.off('click', click);
                elm.off('focus', focus);
                elm.off('blur', blur);
                elm.off('keydown', keydown);
            });
        };
    }]);
