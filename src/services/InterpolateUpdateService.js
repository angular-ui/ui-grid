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
            var cur_template = $templateCache.get(template);
            if (start != "}}"){
                cur_template = cur_template.replace(/\{\{/g, start);
            }
            if (end != "}}"){
                cur_template = cur_template.replace(/\}\}/g, end);
            }
            $templateCache.put(template, cur_template);
        }
    }
}]);
