# vereinsflieger_nodejs_api
Nodejs-classes to access the complete api published for vereinsflieger.de

Example code for a router:
...
var express = require('express');
var router = express.Router();
var vereinsfliegerapi = require('../../vereinsflieger_api/vereinsflieger_nodejs_api');

var vf = new vereinsfliegerapi.VereinsfliegerAPI(<appkey obtained from vereinsflieger>);

async function vereinsfliegerLogin(req, res, next) {
    req.session.accesstoken  =await vf.getAccessToken()
    await vf.signIn(req.session.accesstoken, req.body.username, password = req.body.password)
    return next();
}

async function setUserdata(req,res, next){
    req.session.userdata=await(vf.getUser(req.session.accesstoken))
    return next()
}

function render(req, res) {
    res.render('liste', {
        title: 'Express',
        userdata: req.session.userdata,
        token: req.session.accesstoken
    });
}

router.post('/', vereinsfliegerLogin, setUserdata, render);

module.exports = router;
...
