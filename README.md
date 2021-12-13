# vereinsflieger_nodejs_api

## Vereinsflieger.de

[Vereinsflieger](https://www.vereinsflieger.de) is a popular system in germany to help aviation clubs with their administration. The administration ranges from the legally required documentation duties, invoicing and accounting topics, managing flight training,  to the annual statistics.

Although the system itself already maps all relevant topics in the web application, a reading and writing API is offered for many tables in the database. This can be put to good use in rare, individual needs.

Because there is a certain tendency towards NodeJS in application development, I took the trouble to create a wrapper API for NodeJS. I make this publicly available for use here.

## Example NodeJS / Express Code
Translated with www.DeepL.com/Translator (free version)

Example code for a router:
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
