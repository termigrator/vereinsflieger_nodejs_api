# vereinsflieger_nodejs_api

## Vereinsflieger.de

[Vereinsflieger](https://www.vereinsflieger.de) is a popular system in germany to help aviation clubs with their administration. The administration ranges from the legally required documentation duties, invoicing and accounting topics, managing flight training,  to the annual statistics.

Although the system itself already maps all relevant topics in the web application, a reading and writing API is offered for many tables in the database. This API can be used to solve rare, individual needs.

Because there is some tendency towards NodeJS in woldwide application development, I took the effort to create a wrapper API for NodeJS. To save other programmers the effort, I make the code available here to the public.  You can use the code, but I do not guarantee the results and take no responsibility for the code.

## Example NodeJS / Express Code
Translated with www.DeepL.com/Translator (free version)

Example code for a router reacting to a login-form, sending the data belgonging to the current user to a display-file:
```
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
    res.render('resulting_displayfile', {
        title: 'Vereinsflieger-Benutzerdaten darstellen',
        userdata: req.session.userdata
    });
}

router.post('/', vereinsfliegerLogin, setUserdata, render);

module.exports = router;
```
