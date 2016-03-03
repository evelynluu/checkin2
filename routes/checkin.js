/**
 * Created by kaseymunetake on 3/2/16.
 */
var express = require('express');
var router = express.Router();

var employeeModel = require('../models/employees');
var timelogModel = require('../models/timelog');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/confirm', function(req, res, next) {
    res.render('checkin/confirm', { title: 'Express' });
});

router.get('/log', function(req, res, next) {
    res.render('checkin/log', { title: 'Express' });
});

router.post('/', function(req, res){
    console.log("here");
    var newEmployee = new employeeModel({
        userid: "test",
        firstname: "testfirst",
        lastname: "testlast",
        checkedin: false
    });

    var newTimelog = new timelogModel({
        userid: "test",
        timein: 0,
        timeout: 1
    });

    newEmployee.save(function(err, doc){
        if (err) throw err;
        console.log("Employee Added");
    });

    newTimelog.save(function(err, doc){
        if (err) throw err;
        console.log("time added");
    });

    res.render('index', { title: 'Express' });
});


module.exports = router;