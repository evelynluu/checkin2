/**
* Created by kaseymunetake on 3/2/16.
*/
var express = require('express');
var router = express.Router();

var employeeModel = require('../models/employees');
var timelogModel = require('../models/timelog');

/* FOR BACK-END TESTING ONLY. DELETE LATER. */
router.get('/test', function(req, res, next) {
  res.render('checkin/test', {
    title: 'The Portal Check-in System'
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('checkin/index', {
    title: 'The Portal Check-in System',
    title_style: ''
  });
});

/* GET the Confirm page. */
router.get('/confirm', function(req, res, next) {
  renderConfirmPage(res, "", "The Portal", true);
});

/* GET the user's time Log page. */
router.get('/log', function(req, res, next) { // add :id later
  res.render('checkin/log', {
    title: 'Express'
  });
});

/* POST the user's ID number. Compare to the database.
If no error, redirect to the Confirm page. */
router.post('/', function(req, res){

  console.log("Submit button has been pressed.");

  var id = "";
  var userId = req.body.user_id;
  var firstName = "";
  var checkedIn = false;
  var timeIn = Date.now();  // Get the current time
  var timeOut = 0;

  // Look for the userid to see if it exists
  employeeModel.find({userid: userId}, function(err, docs){
    if (err) throw err;

    // If the userid does not exist in the database
    if(docs[0] === undefined){
      res.render('checkin/index', {
        title: 'Invalid User ID',
        title_style: 'invalid_user'
      });
    }
    else{
      console.log(userId);

      id = docs[0]._id;
      firstName = docs[0].firstname;
      checkedIn = docs[0].checkedin;

      // If the user is already checked in
      if(checkedIn == true){
        console.log("Need to check out!");

        // Find the user's most recent time log entry
        timelogModel.find({userid: userId}, function(err, docs){
          if (err) throw err;
          var currentLog = docs.length - 1;
          var logId = docs[currentLog]._id;
          timeOut = Date.now();

          // Add the user's checkout time
          timelogModel.update({_id: logId}, {timeout: timeOut}, function(err, doc){
            if (err) throw err;
            console.log("Updated the timelogModel!");

            // Change the checkedin boolean for the user in employeeModel
            checkedIn = false;

            employeeModel.update({_id: id}, {checkedin: checkedIn}, function(err, doc){

              console.log("Updated the employeeModel!");
              //printEmployeeData(id);
              //printTimelogData(userId);

              // Redirect to the Confirm page
              renderConfirmPage(res, userId, firstName, checkedIn);
            });
          });
        });
      }
      // If the user is currently checked out
      else if(checkedIn == false){
        console.log("Need to check in!");

        // Create a new time log
        var newTimelog = createNewTimelog(userId, timeIn, timeOut);

        // Save the time log
        newTimelog.save({}, function(err, doc){
          if (err) throw err;
          console.log("Time added to the timelogModel!");

          // Change the checkedin boolean for the user in employeeModel
          checkedIn = true;

          employeeModel.update({_id: id}, {checkedin: checkedIn}, function(err, doc){

            console.log("Updated the employeeModel!");
            //printEmployeeData(id);
            //printTimelogData(userId);

            // Redirect to the Confirm page
            renderConfirmPage(res, userId, firstName, checkedIn);
          });
        });
      }
    }
  });
});

// Create a new timelogModel entry.
function createNewTimelog(userid, timein, timeout){
  var timelog = new timelogModel({
    userid: userid,
    timein: timein,
    timeout: timeout
  });
  return timelog;
}

// Render the confirm.ejs file.
function renderConfirmPage(res, userid, name, checkedIn){
  res.render('checkin/confirm', {
    user_id: userid,
    first_name: name,
    is_checking_in: checkedIn
  });
}

function printEmployeeData(id){
  employeeModel.find({_id: id}, function(err, docs){
    console.log(docs);
  });
}

function printTimelogData(userId){
  timelogModel.find({userid: userId}, function(err, docs){
    console.log(docs);
  });
}

module.exports = router;
