angular.module('myApp.directives', [])
	.directive('scrollto', [function(){
		return function(scope, elm, attrs) {
			elm.bind('click', function(e){
				e.preventDefault();
				if (attrs.href) {
					attrs.scrollto = attrs.href;
				}
				var t = $(attrs.scrollto);
				var top = t[0].offsetTop;
				$('#exampleDefinitions').animate({ scrollTop: top }, 800);
			});
		};
	}])
	.directive('refreshScrollSpy', [function(){
		return function(scope, elm, attrs) {
			//$('[data-spy="scroll"]').each(function () {
            //    $(this).scrollspy('refresh')
		    //});
		};
	}]);