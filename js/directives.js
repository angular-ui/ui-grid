angular.module('myApp.directives', [])
	.directive('scrollto', [function(){
		return function(scope, elm, attrs) {
			elm.bind('click', function(e){
				e.preventDefault();
				if (attrs.href) {
					attrs.scrollto = attrs.href;
				}
				var t = $(attrs.scrollto);
				var u = t.offset();
				var top = u.top - 60;
				$('#exampleDefinitions').animate({ scrollTop: top }, 800);
			});
		};
	}]);