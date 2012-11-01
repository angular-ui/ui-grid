/// <reference path="../classes/grid.js" />
/// <reference path="../services/GridService.js" />
/// <reference path="../services/SelectionService.js" />
/// <reference path="../services/RowService.js" />
/// <reference path="../services/TemplateService.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../classes/footer.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridDirectives.directive('ngSize', function($compile) {
    var ngSize = {
        scope: false,
        compile: function compile(tElement, tAttrs, transclude){
            return {
                pre: function preLink($scope, iElement, iAttrs) {
                    var $container = $(iElement),
                        $parent = $container.parent(),
                        dim = $scope[iAttrs.ngSize](),
                        oldHt = $container.outerHeight(),
                        oldWdth = $container.outerWidth();
					dim.outerWidth = dim.outerWidth - 2;
                    if (dim != undefined) {
                        if (dim.autoFitHeight) {
                            dim.outerHeight = $parent.height();
                        }
                        if (dim.innerHeight && dim.innerWidth) {
                            $container.height(dim.innerHeight);
                            $container.width(dim.innerWidth);
                            return;
                        }
                        if (oldHt !== dim.outerHeight || oldWdth !== dim.outerWidth) {
                            //now set it to the new dimension, remeasure, and set it to the newly calculated
                            $container.height(dim.outerHeight).width(dim.outerWidth);
                            //remeasure
                            oldHt = $container.outerHeight();
                            oldWdth = $container.outerWidth();
                            dim.heightDiff = oldHt - $container.height();
                            dim.widthDiff = oldWdth - $container.width();
                            $container.height(dim.outerHeight - dim.heightDiff);
                            $container.width(dim.outerWidth - dim.widthDiff);
                        }
                        $compile(iElement.contents())($scope);
                    }
                }
            };
		}
	};
    return ngSize;
});