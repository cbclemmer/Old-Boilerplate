jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};

window.onscroll=function(){
    if(window.pageYOffset>0){
    	$(".top").css({paddingTop: "20px", position: "fixed", top: "0px", fontSize: "20pt", height: "60px"});
    	$(".topRight").css({marginTop: "-10px"});
    	$("#searchResults").css({top: "80px"});
    	$("#aboutDiv").css({top: "80px"});
    	$("#newPost").css({top: "80px"});
    }
    if(window.pageYOffset==0){
    	$(".top").css({paddingTop: "100px", position: "relative", fontSize: "34pt", height: "75px"});
    	$(".topRight").css({marginTop: "0px"});
    	$("#searchResults").css({top: "175px"});
    	$("#aboutDiv").css({top: "175px"});
    	$("#newPost").css({top: "175px"});
    }
}

$(document).on('click', "#signUp-button", function(){
    $(".sLogin").hide();
    $(".sSign-up").show();
});

$(document).on('click', "#login-button", function(){
    $(".sSign-up").hide();
    $(".sLogin").show();
});
$(document).ready(function(){
	var i = screen.height;
    
	$("#sideNav").css({height: (i+"px")});
	$("#shadow").css({height: (i+"px")});
	$("#searchButton").click(function(){
		if($("#search").is(":visible")){
			$("#search").animate({top: "-200px"}, 500, function(){
				$("#search").hide();
			});		
            $("#searchResults").slideUp();
		}else{
			$("#search").show();
            $("#search").val("");
			$("#search").animate({top: "0px"}, 500);
		}
	});
	$("#menuButton").click(function(){
		$("#shadow").fadeIn('fast', function(){
			$("#sideNav").css({left: "-20%", display: "none"});
			$("#sideNav").show();
			$("#sideNav").animate({left: "0px"}, 200);			
		});
	});
	$("#shadow").click(function(){
		$("#sideNav").animate({left: "-20%"}, 200, function(){
			$("#sideNav").hide();
			$("#shadow").fadeOut('fast');
		});
	});
    $("#sideNav").click(function(){
        $("#sideNav").animate({left: "-20%"}, 200, function(){
			$("#sideNav").hide();
			$("#shadow").fadeOut('fast');
		}); 
    });
	$("#search").keyup(function(){
		if($("#search").val()!=""){
			$("#searchResults").slideDown();
		}else{
			$("#searchResults").slideUp();
		}
	});
	$("#newPostButton").click(function(){
		if($("#newPost").is(":visible")) {
			$("#newPostButton").rotate(0);
			$("#newPost").slideUp();
		}else{
			$("#newPostButton").rotate(45);
			$("#newPost").slideDown();
		}
	});
	$("#aboutButton").click(function(){
		if($("#aboutDiv").is(":visible")){
			$("#aboutDiv").slideUp();
		}else{
			$("#aboutDiv").slideDown();
		}
	});
	$(".main").click(function(){
		$("#newPostButton").rotate(0);
		$("#newPost").slideUp();
	});
	$("#aboutFriends").click(function(){
		//$("#friendsDiv").css({marginRight: "-70%"});
        $(".sFriends").show();
        $(".sFR").hide();
        $(".sGroups").hide();
		$("#friendsDiv").show();
		$("#aboutDiv").slideUp();
	});
    $("#aboutGroups").click(function(){
		//$("#friendsDiv").css({marginRight: "-70%"});
        $(".sFriends").hide();
        $(".sFR").hide();
        $(".sGroups").show();
		$("#friendsDiv").show();
		$("#aboutDiv").slideUp();
	});
    $("#aboutFR").click(function(){
		//$("#friendsDiv").css({marginRight: "-70%"});
        $(".sFriends").hide();
        $(".sFR").show();
        $(".sGroups").hide();
		$("#friendsDiv").show();
		$("#aboutDiv").slideUp();
	});
	$("#friendsExit").click(function(){
        $("#friendsDiv").hide();
	});
});