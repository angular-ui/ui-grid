angular.module("ngGrid.services").service("$InterpolateUpdateService", ['$templateCache', '$interpolate', function($templateCache, $interpolate){
    this.changeGridInterpolate = function() {

        var templates = [
            "aggregateTemplate.html",
            "rowTemplate.html",
            "cellTemplate.html",
            "cellEditTemplate.html",
            "checkboxCellTemplate.html",
            "editableCellTemplate.html",
            "headerRowTemplate.html",
            "headerCellTemplate.html",
            "checkboxHeaderTemplate.html",
            "gridTemplate.html",
            "footerTemplate.html",
            "menuTemplate.html"
        ];

        var start = $interpolate.startSymbol();
        var end = $interpolate.endSymbol();
        for (var i = 0; i < templates.length; i++){
            var template = templates[i];
            var curTemplate = $templateCache.get(template);
            if (start != "}}"){
                curTemplate = curTemplate.replace(/\{\{/g, start);
            }
            if (end != "}}"){
                curTemplate = curTemplate.replace(/\}\}/g, end);
            }
            $templateCache.put(template, curTemplate);
        }
    };
}]);
