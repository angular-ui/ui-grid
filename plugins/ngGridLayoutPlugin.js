ngGridLayoutPlugin = function () {
	var self = this;
	this.grid = null;
    this.init = function (scope, grid, services) {
        self.domUtilityService = services.DomUtilityService;
		self.grid = grid;
    };
	
	this.updateGridLayout = function(){
		self.domUtilityService.UpdateGridLayout(self.grid);
	};
}