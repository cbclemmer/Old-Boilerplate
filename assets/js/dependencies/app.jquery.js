function Editor(input, preview) {
    this.update = function () {
        preview.innerHTML = markdown.toHTML(input.value);
    };
    this.change  =function(i, p) {
    	preview = p;
    	input = i;
    }
	input.editor = this;
    this.update();
}
function showErr(s){
	$('#err').empty();
	$('#err').hide();
	$('#err').append(s);
	$('#err').show();
	$('#err').css({marginTop: '-100px'});
	$('#err').animate({marginTop: '10px'}, function(){
			setTimeout(function(){$('#err').fadeOut('fast');}, 1500);
	});
};
function showInfo(s){
	$('#info').empty();
	$('#info').hide();
	$('#info').append(s);
	$('#info').show();
	$('#info').css({marginTop: '-100px'});
	$('#info').animate({marginTop: '10px'}, function(){
		setTimeout(function(){$('#info').fadeOut('fast');}, 1500);
	});
}
console.log("yes");
$("#gSelect").on("change", function(){
});
//var $i = function (id) { return document.getElementById(id);};
$(document).ready(function(){
	$('#err').hide();
	$('#info').hide();
	$("#cPassword").hide();
	$("#editor").hide();
	$(document).on('click', function(){
		$('#err').hide();
		$('#info').hide();
	});
    
	//when pressing enter at user/show post text area
	$("#pUser").keypress(function(e){
		if(e.keyCode==13){
      angular.element($("#pUser")[0].parentElement).scope().post.create();
    }
	});
	$("#searchBar").click(function(event){
	  $('.opt').hide();
	  $('#search').val("");
	});
	$("#search").keydown(function(){
		if($('#search').val().length>0){
			angular.element(document.getElementById('searchBar')).scope().search($('#search').val());
		}else{
			$('#searchBar').find("div").remove();
		}
	});
});
