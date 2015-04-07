/*global window */
var self = false;

var editProfButtonClicked = function () {
    var url = "/users/edit/";
    url = url.concat(user_name);
    window.location.href = url;
}
var friendButtonClicked = function() {
    console.log("friendButtonClicked");
    if(loginData != "none") {
        if(self){
            sweetAlert("Opps...", "We don't have a edit friends yet", "error");
        }
        else{
            console.log("before ajax");
            $.ajax({
                url:"/users/addFriend",
                type: "POST",
                data: {
                    addFriend : username
                },
                success: function(data){
                    console.log("Successfully added friend");
                    var alertTitle = "Successfully added ";
                    alertTitle = alertTitle.concat();
                    swal({title:"Added Friend", type:"success"},
                        function(){
                            var url = "/users/";
                            url = url.concat(username);
                            window.location.href = url;
                        }
                    );
                },
                error: function(data){
                    console.log("Failed to added friend");
                    swal({title: "Error",text:"Failed to add friend", type:"error"}, 
                        function(){
                            var url = "/users/";
                            url = url.concat(username);
                            window.location.href = url;
                        }
                    );
                }
            });
        }
    }
    else{
        sweetAlert("Opps...", "You're not logged in", "error");
    }

}
var changeButtons = function() {
        var checkurl = "/users/";
    checkurl = checkurl.concat(user_name)
    console.log(window.location.pathname);
    console.log(checkurl);
    if(window.location.pathname == checkurl){
        self = true;
        $("#addEditFriend").text("Edit Friends List");
        $("#addEditFriend").attr("href","");
        $("#sendViewMSG").text("View Messages");
        $("#sendViewMSG").attr("href","VIEWMSGES");
    }
    else {
        self = false;
        $("#addEditFriend").text("Add to Friends List");
        // $("#addEditFriend").attr("href","/ADDFRIEND");
        $("#sendViewMSG").text("Send Message");
        // $("#sendViewMSG").attr("href","/SENDMSG");
    }

}
var msgButtonClicked = function() {
  if (!loggedIn) {
    $('.signupButton').addClass('dontShowGradient');
    $('.loginPopup').fadeIn(50);
    $('.overlay').fadeIn(50);
    $('#un_id').focus();
    loginpop = true;
  } else {
    var url = "/users/";
    url = url.concat(user_name);
    window.location.href = url;
  }
}
/* This javascript manages the sign up page's client side interactions */
$(document).ready(function() {    
    if(loginData != "none") {
        console.log("Has a session! " + loginData);
        showLoggedIn( loginData );
    }
    else {
      console.log("No session :'(");
    }
    changeButtons();
    var checkurl = "/users/";
    checkurl = checkurl.concat(user_name)
    console.log(window.location.pathname);
    console.log(checkurl);
    if(window.location.pathname != checkurl) {
      $('.editProfButton').hide();
    }
    else {
      $('.editProfButton').show();
    }

});