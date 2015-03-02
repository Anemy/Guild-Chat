/* This is the routing for basic webpages (landing, sign up, about, etc.) */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //console.log("HOME PAGE REQUESTED");

    res.render('index', { title: 'Vowb.net'});
});

/* INSERT MORE WEB PAGE ROUTES HERE (FOR EXAMPLE SIGN UP PAGE) */
router.get('/signup', function(req, res, next) {
    // sign up page request

    res.render('signup', { title: 'Signup - Vowb.net'});
});
//tmp page
router.get('/profile', function(req, res, next) { //tmp
    // tmp profile page
    res.render('profile', { title: 'ProfilePage - Vowb.net'});
});

router.post('/signup', function(req, res) {
    console.log("Sign up request from client! There's data!!!");
    // do something with the req data
    // is it a valid username?!
});

router.get('/about', function(req, res, next) {
    //console.log("HOME PAGE REQUESTED");

    res.render('about', { title: 'About Vowb.net'});
});

router.get('/jobs', function(req, res, next) {
    //console.log("HOME PAGE REQUESTED");

    res.render('jobs', { title: 'Jobs Vowb.net'});
});

module.exports = router;
