var http = require('http');
const models = require('../models');


const parseCookies = (req, res, next) => {

    //get cookies from the http request
    var cookieList = {};
    var requestCookies = req.headers.cookie;

    requestCookies && requestCookies.split(';').forEach((cookie) => {
        var parts = cookie.split('=');
        cookieList[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    console.log('Cookies:', cookieList);

    var sessionHash = cookieList.session || undefined;
    if(sessionHash === undefined){
        //The user is not authenticated, redirect to login page
        console.log("There is no has available");
        res.redirect('login');
    }else{
        //Check if the cookie is in the database
        models.Sessions.get({ hash: sessionHash }).
          then((result) => {
            if (result === undefined) {
              res.redirect('login');
            } else {
              next();
            }
          }).catch((err) => {
            console.error(err);
            // res.redirect('login');
          });
    }

};

module.exports = parseCookies;
