var fetch = require('node-fetch');
var crypto = require('crypto')


class VereinsfliegerAPI {

    constructor(appkey) {
        this.AppKey = appkey;
        this.Host = "https://vereinsflieger.de/";
    }

    setVereinsID(id) {
        this.VereinsID = id;
    }

    async getAccessToken() {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/accesstoken')
        vfp.method = "GET";
        var token;
        await vfp.fetch().then(data => token = data['accesstoken']).catch(e => console.log(e));
        return token
    }

    async signIn(accesstoken, username, password) {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/signin');
        var hash = crypto.createHash('md5').update(password).digest('hex');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('appkey', this.AppKey);
        vfp.params.append('username', username);
        vfp.params.append('password', hash);
        let data;
        if (this.VereinsID)
            params.append('cid', this.VereinsID);
        await vfp.fetch().then(d => data = d).catch(e => console.log(e));

    }

    async signOut(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/signout');
        vfp.params.append('accesstoken', accesstoken);
        vfp.method = "DELETE";
        let data;
        await vfp.fetch().then(d => data = d).catch(e => console.log(e));
        return data;
    }

    async getUser(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/auth/getuser')
        vfp.params.append('accesstoken', accesstoken);
        let user;
        await vfp.fetch().then(data => user = data).catch(e => console.log(e));
        return user;
    }

    async addFlight(accesstoken, callsign, { pilotName = '', uidPilot = 0, attendantName = "", uidAttendant = 0, attendantName2 = "", uidAttendant2 = 0, attendantName3 = "", uidAttendant3 = 0, startType = "E", departureTime = '', departureLocation = '', arrivalTime = '', arrivalLocation = '', landingCount = 1, ftId = 10, km = 0, chargeMode = 0, uidCharge = 0, comment = '', wId = 0, towCallsign = '', towPilotName = '', towUidPilot = 0, towTime = '', towHeight = 0, offBlock = '', onBlock = '', motorStart = 0.0, motorEnd = 0.0 }) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/add');
        vfp.params.append('accesstoken', accesstoken);
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

    async editFlight(accesstoken, fligthId, { callsign = '', pilotName = '', uidPilot = 0, attendantName = "", uidAttendant = 0, attendantName2 = "", uidAttendant2 = 0, attendantName3 = "", uidAttendant3 = 0, startType = "E", departureTime = '', departureLocation = '', arrivalTime = '', arrivalLocation = '', landingCount = 1, ftId = 10, km = 0, chargeMode = 0, uidCharge = 0, comment = '', wId = 0, towCallsign = '', towPilotName = '', towUidPilot = 0, towTime = '', towHeight = 0, offBlock = '', onBlock = '', motorStart = 0.0, motorEnd = 0.0 }) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/edit/' + fligthId)
        vfp.method = "PUT"
        vfp.params.append('accesstoken', accesstoken);
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

    async deleteFlight(accesstoken, fligthId) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/delete/' + fligthId)
        vfp.params.append('accesstoken', accesstoken);
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

    async getFlightListToday(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/today');
        vfp.params.append('accesstoken', accesstoken);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }
    async getFlightListDate(accesstoken, dateParam) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/date');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('dateparam', dateParam);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastFlightsPlane(accesstoken, callsign, count) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/plane');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('count', count);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastFlightsUser(accesstoken, count) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/myflights');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('count', count);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastFlightsPilot(accesstoken, uid, count) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/user');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append("uid", uid);
        vfp.params.append('count', count);
        let flights;
        await vfp.fetch().then(data => flights = data).catch(e => console.log(e));
        return flights;
    }

    async getLastModifiedFlights(accesstoken, days) {
        var vfp = new VereinsfliegerPromise('interface/rest/flight/list/modified');
        vfp.params.append('accesstoken', accesstoken);
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

    async getCalendarUser(accesstoken) {
        //warning: test of this function did not pass!!
        var vfp = new VereinsfliegerPromise('interface/rest/calendar/list/mycalendar');
        vfp.method = "GET";
        vfp.params.append('accesstoken', accesstoken);
        let appointments;
        await vfp.fetch().then(data => appointments = data).catch(e => console.log(e));
        return appointments;
    }

    async getPersonList(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/user/list');
        vfp.params.append('accesstoken', accesstoken);
        let persons;
        await vfp.fetch().then(data => persons = data).catch(e => console.log(e));
        return persons;
    }

    async getReservationList(accesstoken) {
        //warning: test of this function did not pass!!
        var vfp = new VereinsfliegerPromise('interface/rest/reservation/list/actice');
        vfp.params.append('accesstoken', accesstoken);
        let rerservations;
        await vfp.fetch().then(data => rerservations = data).catch(e => console.log(e));
        return rerservations;
    }

    async getMaintenanceData(accesstoken, callSign) {
        var vfp = new VereinsfliegerPromise('interface/rest/maintenance/airplane/' + callSign);
        vfp.params.append('accesstoken', accesstoken);
        let maintenanceData;
        await vfp.fetch().then(data => maintenanceData = data).catch(e => console.log(e));
        return maintenanceData;
    }

    async accountAddTransaction(accesstoken, bDate, value, salesTax, debitAccount, creditAccount, taxAccount, accountReference, accountReferenceId, bookingText) {
        if (value <= 0)
            return ("Betrag muss größer 0,00 sein");
        var vfp = new VereinsfliegerPromise('interface/rest/account/add');
        vfp.params.append('accesstoken', accesstoken);
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

    async getAccountTransaction(accesstoken, transactionId) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/get/' + transactionId);
        vfp.params.append('accesstoken', accesstoken);
        let transaction;
        await vfp.fetch().then(data => transaction = data).catch(e => console.log(e));
        return transaction;
    }

    async getAccountTransactionsToday(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/list/today');
        vfp.params.append('accesstoken', accesstoken);
        let transactions;
        await vfp.fetch().then(data => transactions = data).catch(e => console.log(e));
        return transactions;
    }

    async getAccountListYear(accesstoken, year) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/list/year');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('year', year);
        let transactions;
        await vfp.fetch().then(data => transactions = data).catch(e => console.log(e));
        return transactions;
    }

    async getAccountTransactionsDaterange(accesstoken, dateFrom, dateTo) {
        var vfp = new VereinsfliegerPromise('interface/rest/account/list/daterange');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        let transactions;
        await vfp.fetch().then(data => transactions = data).catch(e => console.log(e));
        return transactions;
    }
    async getWorkhoursDaterange(accesstoken, dateFrom, dateTo) {
        var vfp = new VereinsfliegerPromise('interface/rest/workhours/list/daterange');
        vfp.params.append('accesstoken', accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        let workhours;
        await vfp.fetch().then(data => workhours = data).catch(e => console.log(e));
        return workhours;
    }

    async workhoursAdd(accesstoken, uid, jobDate, jobText, hours, category, { timeFrom = '', timeTo = '', status = 0, comment = "" }) {
        var vfp = new VereinsfliegerPromise('interface/rest/workhours/add');
        vfp.params.append("accesstoken", accesstoken)
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

    async getWorkhoursCategories(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/workhourcategories/list');
        vfp.params.append("accesstoken", accesstoken)
        let categories;
        vfp.fetch().then(data => categories = data).catch(e => console.log(e));
        return categories;
    }

    async getArticles(accesstoken) {
        var vfp = new VereinsfliegerPromise('interface/rest/articles/list');
        vfp.params.append("accesstoken", accesstoken)
        let articles;
        vfp.fetch().then(data => articles = data).catch(e => console.log(e));
        return articles;
    }

    async addSale(accesstoken, bookingDate, articleId, { ammount = 0.0, memberId = 0, callsign = '', salesTax = 0.0, totalPrice = 0.0, counter = 0.0, comment = '', ccId = '' }) {
        var vfp = new VereinsfliegerPromise('interface/rest/sale/add');
        vfp.params.append("accesstoken", accesstoken)
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