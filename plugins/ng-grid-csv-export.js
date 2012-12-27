// plunker availalbe at http://plnkr.co/edit/oU4YYcmCjgsfDAfTyD3h
//
// Todo:
// 1) Make the button prettier
// 2) add a config option for IE users which takes a URL.  That URL should accept a POST request with a
//    JSON encoded object in the payload and return a CSV.  This is necessary because IE doesn't let you
//    download from a data-uri link
//
// Notes:  This has not been adequately tested and is very much a proof of concept at this point
ngGridCsvExportPlugin = function() {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        function showDs() { 
            var keys = [];
            for (var f in grid.config.columnDefs) { keys.push(grid.config.columnDefs[f].field);}
            var csvData = '';
            function escapeQuotes(str) {
                if (str == null) return '';  // we want to catch anything null-ish, hence just == not ===
                if (typeof(str) === 'number') return '' + str;
                if (typeof(str) === 'string') return str.replace(/"/g,'\\"');
            }
            function swapLastCommaForNewline(str) {
                var newStr = str.substr(0,str.length - 1);
                return newStr + "\n";
            }
            for (var k in keys) {
                csvData += '"' + escapeQuotes(keys[k]) + '",';
            }
            csvData = swapLastCommaForNewline(csvData);
            for (var gridRow in grid.sortedData) {
                for ( k in keys) {         
                    csvData += '"' + escapeQuotes(grid.sortedData[gridRow][keys[k]]) + '",';
                }
                csvData = swapLastCommaForNewline(csvData);
            }
            var fp = grid.$root.find(".ngFooterPanel");
            fp.append("<br><a href=\"data:text/csv;charset=UTF-8,"+encodeURIComponent(csvData)+"\">CSV Export</a></br>");          
        }
        setTimeout(showDs, 0);
    };
};
