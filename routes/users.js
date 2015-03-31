/* This is the routing for individual users. It will send a template to users with the data needed */


var express = require('express');
var router = express.Router();
var db = require('../database-manager/database.js');

// used for session storing. Returns JSON of log info or nothing if not signed in 
var getLoginData = function (req) {
    if(req.session.loggedIn) {
        // var loginData = {
        //     "login": "yes",
        //     "username": req.session.username
        // }
        return req.session.username;
    }
    else {
        return "none";
    } 
} 

/* GET EDIT users listing. */
router.get('/edit/*', function(req, res, next) {

    //DO VERIFICATION LATER LOL - OR MAYBE JUST WHEN THEY HIT SAVE?
    var loginData = getLoginData(req);
    // ^ would be none if they aren't logged in
    // could just check if requested page and your page are the same

    // Example:
    //res.render('userPage', { name: 'Mystxc'});
    db.search(db.userDB, { username: req.params[0] }, function(result) {
        if( result.length > 0 ) {
            db.search(db.profileDB, { profile_id: result[0].profile_pointer }, function(result) {
            result[0].login = loginData;
            result[0].title = "Vowb.net - Edit Profile";
                res.render('editProfPage', result[0]);
            });
        }
        else {
            res.render('404', { title: "404: Vowb.net page not found", url: "/users" + req.url });
        }
    });
});

/* GET users listing. */
router.get('/*', function(req, res, next) {
    //res.send('respond with a resource');
    var loginData = getLoginData(req);
    // Example:
    //res.render('userPage', { name: 'Mystxc'});
    db.search(db.userDB, { username: req.params[0] }, function(result) {
        if( result.length > 0 )
            res.render('profile', {result: result[0], login: loginData, title: "Vowb.net - Profile"});
        else {
            res.render('404', { title: "404: Vowb.net page not found", url: "/users" + req.url });
        }
    });
});

/* GET users listing. */
router.get('/*', function(req, res, next) {
    //res.send('respond with a resource');
    var loginData = getLoginData(req);
    // Example:
    //res.render('userPage', { name: 'Mystxc'});
    db.search(db.userDB, { username: req.params[0] }, function(result) {
        if( result.length > 0 )
            res.render('profile', {result: result[0], login: loginData });
        else {
            res.render('404', { title: "404: Vowb.net page not found", url: "/users" + req.url });
        }
    });
});


module.exports = router;
