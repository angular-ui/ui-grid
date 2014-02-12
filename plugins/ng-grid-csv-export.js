// Todo:
// 1) Make the button prettier
// 2) add a config option for IE users which takes a URL.  That URL should accept a POST request with a
//    JSON encoded object in the payload and return a CSV.  This is necessary because IE doesn't let you
//    download from a data-uri link
//    http://plnkr.co/edit/keci2Y?p=preview
// Notes:  This has not been adequately tested and is very much a proof of concept at this point

//see Kyle changes on plunker http://plnkr.co/edit/0pRgu6r8hMOibUkgx12L?p=preview
function ngGridCsvExportPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope; 
        function showDs() {
            var keys = [];
            var csvData = '';/**Kyle, moved so that it doesnt get reset before loop**/
            for (var f in grid.config.columnDefs) {
            	keys.push(grid.config.columnDefs[f].field);
            	
            	csvData += '"' ;/**Kyle Added**/
            	if(typeof grid.config.columnDefs[f].displayName !== 'undefined'){/** moved to reduce looping and capture the display name if it exists**/
            		csvData += csvStringify(grid.config.columnDefs[f].displayName);/**Kyle Added**/
            	}
            	else{/**Kyle Added**/
            		csvData += csvStringify(grid.config.columnDefs[f].field);/**Kyle Added**/
            	}
            	csvData +=  '",'; /**Kyle Added**/
            }
            
            function csvStringify(str) {
                if (str == null) { // we want to catch anything null-ish, hence just == not ===
                    return '';
                }
                if (typeof(str) === 'number') {
                    return '' + str;
                }
                if (typeof(str) === 'boolean') {
                    return (str ? 'TRUE' : 'FALSE') ;
                }
                if (typeof(str) === 'string') {
                    return str.replace(/"/g,'""');
                }

                return JSON.stringify(str).replace(/"/g,'""');
            }
            function swapLastCommaForNewline(str) {
                var newStr = str.substr(0,str.length - 1);
                return newStr + "\n";
            }
            /**unnecessary loop**/
            /**for (var k in keys) {
            	csvData += '"' + csvStringify(keys[k]) + '",';
            }**/
            csvData = swapLastCommaForNewline(csvData);
            var gridData = grid.data;
            for (var gridRow in gridData) {
                for ( k in keys) {
                    var curCellRaw;
                    /**this still needs a case for arrays**/
                    if(keys[k]){/**Kyle added**/
                    	if (opts != null && opts.columnOverrides != null && opts.columnOverrides[keys[k]] != null) {
	                        curCellRaw = opts.columnOverrides[keys[k]](gridData[gridRow][keys[k]]);
	                    }
	                    else if (opts != null && opts.columnOverrides != null && keys[k].indexOf(".") >= 0) {/**Kyle modified**/
	                    	var tempObj = keys[k].substring(0, keys[k].indexOf("."));/**Kyle added**/
	                    	var tempProp = keys[k].substring(keys[k].indexOf(".")+1, keys[k].length);/**Kyle added**/
	                    	if(typeof gridData[gridRow][tempObj] !== 'undefined'){/**Kyle**/
	                    		curCellRaw = opts.columnOverrides['object'](gridData[gridRow][tempObj], tempProp);/**Kyle modified**/
	                    	}
	                    }
	                    else {
	                        curCellRaw = gridData[gridRow][keys[k]];/**Kyle modified**/
	                    }
                    	csvData += '"' + csvStringify(curCellRaw) + '",';
                    }/**Kyle added**/
                }
                csvData = swapLastCommaForNewline(csvData);
            }
            var fp = grid.$root.find(".ngFooterPanel");
            var csvDataLinkPrevious = grid.$root.find('.ngFooterPanel .csv-data-link-span');
            if (csvDataLinkPrevious != null) {csvDataLinkPrevious.remove() ; }
            var csvDataLinkHtml = "<span class=\"csv-data-link-span\" style='float:right;'>";
            csvDataLinkHtml += "<br><a class=\"btn btn-primary\" href=\"data:text/csv;charset=UTF-8,";
            csvDataLinkHtml += encodeURIComponent(csvData);
            csvDataLinkHtml += "\" download=\"Export.csv\">CSV Export</a></br></span>" ;
            fp.append(csvDataLinkHtml);
        }
        setTimeout(showDs, 0);
        scope.catHashKeys = function() {
            var hash = '';
            for (var idx in scope.renderedRows) {
                hash += scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        if (opts && opts.customDataWatcher) {
            scope.$watch(opts.customDataWatcher, showDs);
        } else {
            scope.$watch(scope.catHashKeys, showDs);
        }
    };
}
