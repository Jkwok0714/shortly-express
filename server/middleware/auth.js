const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

};

module.exports.handleLogin = (req, res, next) => {
    var { username, password } = req.body;

    //Handle user name and password
    var userPromise = models.Users.get({ username: username })
        .then((user) => {
            console.log(user);

            //Compare password compare(attempted, password, salt) {
            if (models.Users.compare(password, user.password, user.salt)) {

                //Create a session when the user logs index
                var session = models.Sessions.create()
                    .then((result) => {
                        //Once session is created, add the userId to the session record in database
                        models.Sessions.get({ id: result.insertId })
                            .then((result) => {
                                //Now update the userId
                                res.cookie('session', result.hash, { expires: new Date(Date.now() + 600000), httpOnly: true });
                                models.Sessions.update({ id: result.id }, { userId: user.id });
                                next();
                            })
                    })
                
            }
            else {
                //The password was wrong redirect user
                res.redirect('login');
            }
        })
}

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

