# vereinsflieger_nodejs_api

## Vereinsflieger.de

[Vereinsflieger](https://www.vereinsflieger.de) is a popular system in germany to help aviation clubs with their administration. The administration ranges from the legally required documentation duties, invoicing and accounting topics, managing flight training,  to the annual statistics.

Although the system itself already maps all relevant topics in the web application, a reading and writing REST-based API is offered for many tables in the database. This API can be used to solve rare, individual needs.

Because there is some worldwide tendency to develop webapplications based on NodeJS, I took the effort to create a wrapper API for NodeJS. To save other programmers the effort, I make the code available here to the public. 

## Legal issues
You can use the code, but I do not guarantee the results and take no responsibility for the code. You have to get an individual App-Key form vereinsflieger.de. In this context you have to comply the terms of use of vereinsflieger.de. Extract from the documentation:
```
Der für die Anmeldung erforderliche appkey kann über den Support
angefragt werden. Die max. Anzahl an Requests (gemeint sind alle
Aufrufe) ist auf 1000 je Tag limitiert. Die kommerzielle Nutzung der
Schnittstelle ist grundsätzlich untersagt.
```

## Example NodeJS / Express Code

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

## Example NodeJS Middleware - Read nested Javascript-Object returned by this api (cutout)
Data representing a list returnd from this API are nested Javascript-Objects. Here is a sample to convert this list in a array. In this example the needen appkey is read from a config-file.

```
var express = require('express');
var config = require('../config').config;
const { VereinsfliegerAPI } = require('../../vereinsflieger_api/vereinsflieger_nodejs_api');
var router = express.Router();
var vf = new VereinsfliegerAPI(config.vereinsflieger_appkey);
var filteredTransactions

async function fillCashTransactions(req, res, next) {
  var transactions_json = await vf.getAccountListYear(req.session.accesstoken, new Date().getFullYear());
  var transaction_array = [];
  for (var key in transactions_json)
    (transaction_array.push(transactions_json[key]));
  filteredTransactions = transaction_array.filter(function (el) {
    return el.creditaccount == 100000;
  });
  return next();
}

...... other needed middleware functions ...

```
