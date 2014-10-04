(function(){
	var app = angular.module("search", []);
	app.controller("searchController", ['$http', '$scope', '$rootScope', function(h, s, rs){
		s.search = function(s){
			h.get('/api/search?s='+s).success(function(res){
				if(res.err) return showErr(res.err);
				if(res.length>0){
				rs.options = res;
				}else{rs.options = [{type: 404, name: "Sorry nothing was found"}];}
			});
		}
	}]);
})();