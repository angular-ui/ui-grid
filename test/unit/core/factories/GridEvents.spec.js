describe('GridEvent factory', function () {
  var $q, $scope, Grid, GridEvents;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridEvents_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridEvents = _GridEvents_;
  }));

  it('should register, publish, and subscribe to events', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var scope = $rootScope.$new();
    var gridEvents = new GridEvents(grid);
    expect(gridEvents.grid.id).toBe(grid.id);

    gridEvents.registerEvent('testFeature','testEvent');

    var onFired = false;
    var arg1Val = '';
    var arg2Val = '';

    var pubArg1Val = '';
    var pubArg2Val = '';
    $timeout(function(){
      scope.$on(grid.id + 'testFeature' + 'testEvent',function(evt,arg1,arg2){
        onFired = true;
        arg1Val = arg1;
        arg2Val = arg2;
      });
      gridEvents.testFeature.on.testEvent(scope,function(arg1,arg2){
        pubArg1Val = arg1;
        pubArg2Val = arg2;
      });

      gridEvents.testFeature.raise.testEvent('123', '456');

    });
    $timeout.flush();

    expect(onFired).toBe(true);
    expect(arg1Val).toBe('123');
    expect(arg2Val).toBe('456');
    expect(pubArg1Val).toBe('123');
    expect(pubArg2Val).toBe('456');
  }));

  it('should keep events separate for different grids', inject(function($timeout, $rootScope) {
    var grid1 = new Grid({ id: 1 });
    var grid2 = new Grid({ id: 2 });

    var scope = $rootScope.$new();
    var gridEvents1 = new GridEvents(grid1);
    var gridEvents2 = new GridEvents(grid2);

    expect(gridEvents1.grid.id).toBe(grid1.id);
    expect(gridEvents2.grid.id).toBe(grid2.id);

    gridEvents1.registerEvent('testFeature','testEvent');
    gridEvents2.registerEvent('testFeature','testEvent');

    var grid1arg = '';
    var grid2arg = '';

    $timeout(function(){
      gridEvents1.testFeature.on.testEvent(scope,function(arg1){
        grid1arg = arg1;
      });

      gridEvents2.testFeature.on.testEvent(scope,function(arg1){
        grid2arg = arg1;
      });

      gridEvents1.testFeature.raise.testEvent('grid1');
      gridEvents2.testFeature.raise.testEvent('grid2');

    });
    $timeout.flush();

    expect(grid1arg).toBe('grid1');
    expect(grid2arg).toBe('grid2');
  }));

  it('should register events from object', inject(function($timeout, $rootScope) {
    var publicEvents = {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){}
      },
      someOtherFeature: {
        someEvent : function(){},
        someOtherEvent : function(){}
      }
    };

    var grid = new Grid({ id: 1 });
    var gridEvents = new GridEvents(grid);

    gridEvents.registerEventsFromObject(publicEvents);

    expect(gridEvents.gridCellNav).toBeDefined();
    expect(gridEvents.gridCellNav.raise.cellNav).toBeDefined();
    expect(gridEvents.gridCellNav.on.cellNav).toBeDefined();
    expect(gridEvents.someOtherFeature.raise.someEvent).toBeDefined();
    expect(gridEvents.someOtherFeature.raise.someOtherEvent).toBeDefined();
  }));

  it('should register methods from object', inject(function($timeout, $rootScope) {
    var publicMethods = {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){}
      },
      someOtherFeature: {
        someEvent : function(){},
        someOtherEvent : function(){}
      }
    };

    var grid = new Grid({ id: 1 });
    var gridEvents = new GridEvents(grid);

    gridEvents.registerMethodsFromObject(publicMethods);

    expect(gridEvents.gridCellNav).toBeDefined();
    expect(gridEvents.gridCellNav.cellNav).toBeDefined();
    expect(gridEvents.someOtherFeature.someEvent).toBeDefined();
    expect(gridEvents.someOtherFeature.someOtherEvent).toBeDefined();
  }));




});
