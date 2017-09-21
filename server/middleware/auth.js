const models = require('../models');
const Promise = require('bluebird');

var createSession = (userId, res) => {
  var expiryTime = 600000;

  //Create a session when the user logs index
  return new Promise ((resolve, reject) => {
    models.Sessions.create()
      .then((result) => {
          //Once session is created, add the userId to the session record in database
          models.Sessions.get({ id: result.insertId })
              .then((result) => {
                  //Now update the userId
                  res.cookie('session', result.hash, { expires: new Date(Date.now() + expiryTime), httpOnly: true });
                  models.Sessions.update({ id: result.id }, { userId: userId });
                  setTimeout(() => {
                    models.Sessions.delete({ userId: userId });
                  }, expiryTime);
                  resolve();
              })
      })
    });
};

module.exports.handleSignUp = (req, res, next) => {
  var { username, password } = req.body;

  //Create and save user
  models.Users.create({ username, password })
    .then((result) => {
      console.log('The user was created successfully');
      createSession(result.insertId, res)
        .then(() => {
          console.log('The session was created for the new user');
          next();
        })

    }) //Log success, take user to index page
    .catch((err) => {
      console.log(err);
    })
}


module.exports.handleLogin = (req, res, next) => {
    var { username, password } = req.body;

    //Handle user name and password
    var userPromise = models.Users.get({ username: username })
        .then((user) => {
            console.log(user);

            //Compare password compare(attempted, password, salt) {
            if (models.Users.compare(password, user.password, user.salt)) {

              //Create the session for the user
              createSession(user.id, res)
                .then((result) => {
                  next();
                })
            }
            else {
                //The password was wrong redirect user
                //If login fails
                res.render('login', {
                      myVar: true
                  });
            }
        })
        .catch(() => {
          console.log("The user does not exist");
          res.render('login', {
                myVar: true
            });
        })
};

module.exports.closeSession = (req, res, next) => {
  var cookieList = {};
  var requestCookies = req.headers.cookie;

  requestCookies && requestCookies.split(';').forEach((cookie) => {
      var parts = cookie.split('=');
      cookieList[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  var sessionHash = cookieList.session || undefined;

  //Delete the cookie in the browser
  res.cookie("session", "", { expires: new Date() });

  models.Sessions.delete({ hash: sessionHash })
    .then(() => {
      console.log('Deleted session');
      // res.set("Refresh", "1");
      next();
    })

};

module.exports.logActivity = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
