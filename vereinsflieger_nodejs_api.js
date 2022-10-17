/* Copyright (c) 2021 robert1 @ kaider.info

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE. */

var fetch = require('node-fetch');
var crypto = require('crypto')
var vfHostname = "https://vereinsflieger.de/"

class VereinsfliegerAPI {

    constructor(appkey) {
        this.AppKey = appkey;
        this.Host = vfHostname;
        this.accesstoken = ""; //access-token will be set during sign-in

    }
    //vereinsID only neccessary if user can access multiple Vereine
    setVereinsID(id) {
        this.VereinsID = id;
    }

    async setAccessToken() {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/accesstoken')
        vfp.method = "GET";
        return vfp.fetch()//.then(data => this.accesstoken = data['accesstoken']).catch(e => console.log(e));
    }

    async signIn(username, password) {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/signin');
        await this.setAccessToken()
            .then(data => {
                this.accesstoken = data.accesstoken;
                var hash = crypto.createHash('md5').update(password).digest('hex');
                console.log("signInAccesstoken: " + this.accesstoken);
                vfp.params.append('accesstoken', this.accesstoken);
                vfp.params.append('appkey', this.AppKey);
                vfp.params.append('username', username);
                vfp.params.append('password', hash);
                if (this.VereinsID) //vereinsID only neccessary if user can access multiple Vereine
                    params.append('cid', this.VereinsID);
                return vfp.fetch();
            },
            error=>console.log("Error fetching Access-Token: ", error));
    }

    async signOut() {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/signout');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.method = "DELETE";
        return vfp.fetch();//.then(d => data = d).catch(e => console.log("Error on Logout: " + e));
        // return data;
    }

    getUser() {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/getuser')
        console.log("getUser Accesstoken: " + this.accesstoken);
        vfp.params.append('accesstoken', this.accesstoken);
        return vfp.fetch()//.then(data => user = data).catch(e => console.log(e));
        //return user;
    }

    async addFlight(callsign, { pilotName = '', uidPilot = 0, attendantName = "", uidAttendant = 0, attendantName2 = "", uidAttendant2 = 0, attendantName3 = "", uidAttendant3 = 0, startType = "E", departureTime = '', departureLocation = '', arrivalTime = '', arrivalLocation = '', landingCount = 1, ftId = 10, km = 0, chargeMode = 0, uidCharge = 0, comment = '', wId = 0, towCallsign = '', towPilotName = '', towUidPilot = 0, towTime = '', towHeight = 0, offBlock = '', onBlock = '', motorStart = 0.0, motorEnd = 0.0 }) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/add');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('pilotname', pilotName);
        vfp.params.append('uidpilot', uidPilot);
        vfp.params.append('attendantname', attendantName);
        vfp.params.append('uidattendant', uidAttendant);
        vfp.params.append('attendantname2', attendantName2);
        vfp.params.append('uidattendant2', uidAttendant2);
        vfp.params.append('attendantname3', attendantName3);
        vfp.params.append('uidattendant3', uidAttendant3);
        vfp.params.append('starttype', startType);
        vfp.params.append('departuretime', departureTime);
        vfp.params.append('departurelocation', departureLocation);
        vfp.params.append('arrivaltime', arrivalTime);
        vfp.params.append('arrivallocation', arrivalLocation);
        vfp.params.append('landingcount', landingCount);
        vfp.params.append('ftid', ftId);
        vfp.params.append('chargemode', chargeMode);
        vfp.params.append('uidcharge', uidCharge);
        vfp.params.append('comment', comment);
        vfp.params.append('wid', wId);
        vfp.params.append('towcallsign', towCallsign);
        vfp.params.append('towpilotname', towPilotName);
        vfp.params.append('towuidpilot', towUidPilot);
        vfp.params.append('towtime', towTime);
        vfp.params.append('towheight', towHeight);
        vfp.params.append('offblock', offBlock);
        vfp.params.append('onblock', onBlock);
        vfp.params.append('motorstart', motorStart);
        vfp.params.append('motorend', motorEnd);
        var newflight;
        await vfp.fetch().then(data => newflight = data).catch(e => console.log(e));
        return newflight;
    }

    async editFlight(fligthId, { callsign = '', pilotName = '', uidPilot = 0, attendantName = "", uidAttendant = 0, attendantName2 = "", uidAttendant2 = 0, attendantName3 = "", uidAttendant3 = 0, startType = "E", departureTime = '', departureLocation = '', arrivalTime = '', arrivalLocation = '', landingCount = 1, ftId = 10, km = 0, chargeMode = 0, uidCharge = 0, comment = '', wId = 0, towCallsign = '', towPilotName = '', towUidPilot = 0, towTime = '', towHeight = 0, offBlock = '', onBlock = '', motorStart = 0.0, motorEnd = 0.0 }) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/edit/' + fligthId)
        vfp.method = "PUT"
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('pilotname', pilotName);
        vfp.params.append('uidpilot', uidPilot);
        vfp.params.append('attendantname', attendantName);
        vfp.params.append('uidattendant', uidAttendant);
        vfp.params.append('attendantname2', attendantName2);
        vfp.params.append('uidattendant2', uidAttendant2);
        vfp.params.append('attendantname3', attendantName3);
        vfp.params.append('uidattendant3', uidAttendant3);
        vfp.params.append('starttype', startType);
        vfp.params.append('departuretime', departureTime);
        vfp.params.append('departurelocation', departureLocation);
        vfp.params.append('arrivaltime', arrivalTime);
        vfp.params.append('arrivallocation', arrivalLocation);
        vfp.params.append('landingcount', landingCount);
        vfp.params.append('ftid', ftId);
        vfp.params.append('chargemode', chargeMode);
        vfp.params.append('uidcharge', uidCharge);
        vfp.params.append('comment', comment);
        vfp.params.append('towcallsign', towCallsign);
        vfp.params.append('towpilotname', towPilotName);
        vfp.params.append('towuidpilot', towUidPilot);
        vfp.params.append('towtime', towTime);
        vfp.params.append('towheight', towHeight);
        vfp.params.append('offblock', offBlock);
        vfp.params.append('onblock', onBlock);
        vfp.params.append('motorstart', motorStart);
        vfp.params.append('motorend', motorEnd);
        var changedFlight;
        await vfp.fetch().then(data => changedFlight = data).catch(e => console.log(e));
        return changedFlight;
    }

    async deleteFlight( fligthId) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/delete/' + fligthId)
        vfp.params.append('accesstoken', this.accesstoken);
        var result;
        await vfp.fetch().then(r => result = r).catch(e => console.log(e));
        return result;
    }

    async getFlight(accesstoken, fligthId) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/get/' + fligthId)
        vfp.params.append('accesstoken', accesstoken);
        let flight;
        await vfp.fetch().then(data => flight = data).catch(e => console.log(e));
        return flight;
    }

    async getFlightListToday() {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/today');
        vfp.params.append('accesstoken', this.accesstoken);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }
    async getFlightListDate( dateParam) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/date');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('dateparam', dateParam);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastFlightsPlane( callsign, count) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/plane');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('count', count);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastFlightsUser( count) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/myflights');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('count', count);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastFlightsPilot( uid, count) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/user');
        vfp.params.append('accesstoken',this.accesstoken);
        vfp.params.append("uid", uid);
        vfp.params.append('count', count);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastModifiedFlights( days) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/modified');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append("days", days);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getCalendarPublic(hpaccessCode) {
        var vfp = new VereinsfliegerPromise('interface/rest/calendar/list/public');
        //no login required, no accesstoken!!
        vfp.params.append('hpaccesscode', hpaccessCode);
        let appointments;
        await vfp.fetch().then(data => appointments = data).catch(e => console.log(e));
        return appointments;
    }

    async getCalendarUser() {
        //warning: test of this function did not pass!!
        var vfp = new VereinsfliegerPromise('interface/rest/calendar/list/mycalendar');
        vfp.method = "GET";
        vfp.params.append('accesstoken', this.accesstoken);
        let appointments;
        await vfp.fetch().then(data => appointments = data).catch(e => console.log(e));
        return appointments;
    }

    async getPersonList() {
        var vfp = new VereinsfliegerPromise('interface/rest/user/list');
        vfp.params.append('accesstoken', this.accesstoken);
        let persons;
        await vfp.fetch().then(data => persons = data).catch(e => console.log(e));
        return persons;
    }

    async getReservationList() {
        //warning: test of this function did not pass!!
        var vfp = new VereinsfliegerPromise('interface/rest/reservation/list/actice');
        vfp.params.append('accesstoken', this.accesstoken);
        let rerservations;
        await vfp.fetch().then(data => rerservations = data).catch(e => console.log(e));
        return rerservations;
    }

    async getMaintenanceData( callSign) {
        var vfp = new VereinsfliegerPromise('interface/rest/maintenance/airplane/' + callSign);
        vfp.params.append('accesstoken', this.accesstoken);
        let maintenanceData;
        await vfp.fetch().then(data => maintenanceData = data).catch(e => console.log(e));
        return maintenanceData;
    }

    async accountAddTransaction( bDate, value, salesTax, debitAccount, creditAccount, taxAccount, accountReference, accountReferenceId, bookingText) {
        if (value <= 0)
            return ("Betrag muss größer 0,00 sein");
        var vfp = new VereinsfliegerPromise('interface/rest/account/add');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('bookingdate', bDate);
        vfp.params.append('value', value);
        vfp.params.append('salestax', salesTax);
        vfp.params.append('debitaccount', debitAccount);
        vfp.params.append('creditaccount', creditAccount);
        vfp.params.append('taxaccount', taxAccount);
        vfp.params.append('accountreference', accountReference);
        vfp.params.append('accountreferenceid', accountReferenceId);
        vfp.params.append('bookingtext', bookingText);
        let newTransaction;
        vfp.fetch().then(data => newTransaction = data).catch(e => console.log(e));
        return newTransaction;
    }

    async getAccountTransaction(transactionId) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/get/' + transactionId);
        vfp.params.append('accesstoken', this.accesstoken);
        let transaction;
        await vfp.fetch().then(data => transaction = data).catch(e => console.log(e));
        return transaction;
    }

    async getAccountTransactionsToday() {
        var vfp = new VereinsfliegerPromise('interface/rest/account/list/today');
        vfp.params.append('accesstoken', this.accesstoken);
        let transactions;
        await vfp.fetch().then(data => transactions = data).catch(e => console.log(e));
        return transactions;
    }

    async getAccountListYear(year) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/list/year');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('year', year);
        let transactions;
        await vfp.fetch().then(data => transactions = data).catch(e => console.log("Error in Routine getAccountListYear:" + e));
        return transactions;
    }

    async getAccountTransactionsDaterange( dateFrom, dateTo) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/list/daterange');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        let transactions;
        await vfp.fetch().then(data => transactions = data).catch(e => console.log(e));
        return transactions;
    }
    async getWorkhoursDaterange( dateFrom, dateTo) {
        var vfp = new VereinsfliegerPromise('interface/rest/workhours/list/daterange');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        let workhours;
        await vfp.fetch().then(data => workhours = data).catch(e => console.log(e));
        return workhours;
    }

    async workhoursAdd( uid, jobDate, jobText, hours, category, { timeFrom = '', timeTo = '', status = 0, comment = "" }) {
        var vfp = new VereinsfliegerPromise('interface/rest/workhours/add');
        vfp.params.append("accesstoken", this.accesstoken)
        vfp.params.append('uid', uid);
        vfp.params.append('jobdate', jobDate);
        vfp.params.append('jobtext', jobText);
        vfp.params.append('hours', hours);
        vfp.params.append('category', category);
        vfp.params.append('timefrom', timeFrom);
        vfp.params.append('timeto', timeTo);
        vfp.params.append('status', status);
        vfp.params.append('comment', comment);
        let newTransaction;
        vfp.fetch().then(data => newTransaction = data).catch(e => console.log(e));
        return newTransaction;
    }

    async getWorkhoursCategories() {
        var vfp = new VereinsfliegerPromise('interface/rest/workhourcategories/list');
        vfp.params.append("accesstoken", this.accesstoken)
        let categories;
        vfp.fetch().then(data => categories = data).catch(e => console.log(e));
        return categories;
    }

    async getArticles() {
        var vfp = new VereinsfliegerPromise('interface/rest/articles/list');
        vfp.params.append("accesstoken", this.accesstoken)
        let articles;
        vfp.fetch().then(data => articles = data).catch(e => console.log(e));
        return articles;
    }

    async addSale( bookingDate, articleId, { ammount = 0.0, memberId = 0, callsign = '', salesTax = 0.0, totalPrice = 0.0, counter = 0.0, comment = '', ccId = '' }) {
        var vfp = new VereinsfliegerPromise('interface/rest/sale/add');
        vfp.params.append("accesstoken", this.accesstoken)
        vfp.params.append('bookingdate', bookingDate);
        vfp.params.append('articleid', articleId);
        vfp.params.append('amount', ammount);
        vfp.params.append('memberid', memberId); //buyers memberId!
        vfp.params.append('callsign', callsign);
        vfp.params.append('salestax', salesTax);
        vfp.params.append('totalprice', totalPrice);
        vfp.params.append('counter', counter);
        vfp.params.append('comment', comment);
        vfp.params.append('ccid', ccId);
        let sale;
        vfp.fetch().then(data => sale = data).catch(e => console.log(e));
        return sale;
    }
}

class VereinsfliegerPromise {
    constructor(resturi, method = "POST") {
        this.Host = "https://vereinsflieger.de/";
        this.params = new URLSearchParams();
        this.resturi = resturi;
        this.method = method;
    }

    fetch() {
        //method 'GET' is not allowed to have a body
        return new Promise((resolve, reject) => {
            if (this.method == "GET")
                fetch(this.Host + this.resturi)
                    .then(r => r.json())
                    .then(function (data) {
                        if (data.httpstatuscode == 200)
                            resolve(data);
                        else
                            reject(data);
                    })
            else //all other methods need a body
                fetch(this.Host + this.resturi, { method: this.method, body: this.params })
                    .then(r => r.json())
                    .then(function (data) {
                        if (data.httpstatuscode == 200)
                            resolve(data);
                        else
                            reject(data);
                    })
        })
    }
}

module.exports = { VereinsfliegerAPI }