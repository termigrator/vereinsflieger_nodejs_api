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

const crypto = require('crypto');
const vfHostname = "https://vereinsflieger.de/";

/**
 * Vereinsflieger API Wrapper for Node.js
 * Provides a convenient interface to interact with the Vereinsflieger REST API
 * @class
 */
class VereinsfliegerAPI {

    /**
     * Creates an instance of the Vereinsflieger API
     * @param {string} appkey - Your application key from Vereinsflieger (required)
     * @throws {Error} If appkey is missing or not a string
     */
    constructor(appkey) {
        if (!appkey || typeof appkey !== 'string') {
            throw new Error('AppKey is required and must be a string');
        }
        this.AppKey = appkey;
        this.Host = vfHostname;
        this.accesstoken = ""; //access-token will be set during sign-in

    }
    
    /**
     * Sets the Vereins ID for users with access to multiple clubs
     * Only necessary if user can access multiple Vereine
     * @param {string|number} id - The Vereins ID
     * @throws {Error} If id is missing
     */
    setVereinsID(id) {
        if (!id) {
            throw new Error('Vereins ID is required');
        }
        this.VereinsID = id;
    }

    // ========== Internal Helper Methods ==========

    /**
     * Validates that an access token is available
     * @private
     * @throws {Error} If no access token is available
     */
    _validateAccessToken() {
        this._validateAccessToken();
    }

    /**
     * Builds flight parameters from an options object
     * @private
     * @param {Object} options - Flight options
     * @returns {Object} Object with all flight parameters
     */
    _buildFlightParams(options) {
        return {
            pilotName: options.pilotName || '',
            uidPilot: options.uidPilot || 0,
            attendantName: options.attendantName || '',
            uidAttendant: options.uidAttendant || 0,
            attendantName2: options.attendantName2 || '',
            uidAttendant2: options.uidAttendant2 || 0,
            attendantName3: options.attendantName3 || '',
            uidAttendant3: options.uidAttendant3 || 0,
            startType: options.startType || 'E',
            departureTime: options.departureTime || '',
            departureLocation: options.departureLocation || '',
            arrivalTime: options.arrivalTime || '',
            arrivalLocation: options.arrivalLocation || '',
            landingCount: options.landingCount || 1,
            ftId: options.ftId || 10,
            km: options.km || 0,
            chargeMode: options.chargeMode || 0,
            uidCharge: options.uidCharge || 0,
            comment: options.comment || '',
            wId: options.wId || 0,
            towCallsign: options.towCallsign || '',
            towPilotName: options.towPilotName || '',
            towUidPilot: options.towUidPilot || 0,
            towTime: options.towTime || '',
            towHeight: options.towHeight || 0,
            offBlock: options.offBlock || '',
            onBlock: options.onBlock || '',
            motorStart: options.motorStart || 0.0,
            motorEnd: options.motorEnd || 0.0
        };
    }

    /**
     * Appends flight parameters to a request
     * @private
     * @param {VereinsfliegerPromise} vfp - The request object
     * @param {Object} params - Flight parameters
     */
    _appendFlightParams(vfp, params) {
        vfp.params.append('pilotname', params.pilotName);
        vfp.params.append('uidpilot', params.uidPilot);
        vfp.params.append('attendantname', params.attendantName);
        vfp.params.append('uidattendant', params.uidAttendant);
        vfp.params.append('attendantname2', params.attendantName2);
        vfp.params.append('uidattendant2', params.uidAttendant2);
        vfp.params.append('attendantname3', params.attendantName3);
        vfp.params.append('uidattendant3', params.uidAttendant3);
        vfp.params.append('starttype', params.startType);
        vfp.params.append('departuretime', params.departureTime);
        vfp.params.append('departurelocation', params.departureLocation);
        vfp.params.append('arrivaltime', params.arrivalTime);
        vfp.params.append('arrivallocation', params.arrivalLocation);
        vfp.params.append('landingcount', params.landingCount);
        vfp.params.append('ftid', params.ftId);
        vfp.params.append('chargemode', params.chargeMode);
        vfp.params.append('uidcharge', params.uidCharge);
        vfp.params.append('comment', params.comment);
        vfp.params.append('wid', params.wId);
        vfp.params.append('towcallsign', params.towCallsign);
        vfp.params.append('towpilotname', params.towPilotName);
        vfp.params.append('towuidpilot', params.towUidPilot);
        vfp.params.append('towtime', params.towTime);
        vfp.params.append('towheight', params.towHeight);
        vfp.params.append('offblock', params.offBlock);
        vfp.params.append('onblock', params.onBlock);
        vfp.params.append('motorstart', params.motorStart);
        vfp.params.append('motorend', params.motorEnd);
    }

    // ========== Authentication Methods ==========

    /**
     * Retrieves an access token from the Vereinsflieger API
     * This is automatically called during sign-in
     * @returns {Promise<Object>} The response containing the access token
     * @throws {Error} If the API request fails
     */
    async setAccessToken() {
        const vfp = new VereinsfliegerPromise('interface/rest/auth/accesstoken');
        vfp.method = "GET";
        return await vfp.fetch();
    }

    /**
     * Signs in a user to the Vereinsflieger system
     * @param {string} username - The user's email address
     * @param {string} password - The user's password (will be MD5 hashed)
     * @returns {Promise<Object>} The sign-in response
     * @throws {Error} If username or password is missing, or if sign-in fails
     */
    async signIn(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/auth/signin');
        const data = await this.setAccessToken();
        
        this.accesstoken = data.accesstoken;
        const hash = crypto.createHash('md5').update(password).digest('hex');
        
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('appkey', this.AppKey);
        vfp.params.append('username', username);
        vfp.params.append('password', hash);
        if (this.VereinsID) { //vereinsID only neccessary if user can access multiple Vereine
            vfp.params.append('cid', this.VereinsID);
        }
        return await vfp.fetch();
    }

    /**
     * Signs out the current user and invalidates the access token
     * @returns {Promise<Object>} The sign-out response
     * @throws {Error} If not signed in or if sign-out fails
     */
    async signOut() {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/auth/signout');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.method = "DELETE";
        return await vfp.fetch();
    }

    /**
     * Retrieves user information for the authenticated user
     * @param {string} [accesstoken=this.accesstoken] - Optional access token (uses instance token if not provided)
     * @returns {Promise<Object>} User data including uid, firstname, lastname, roles, etc.
     * @throws {Error} If access token is missing
     */
    async getUser(accesstoken = this.accesstoken) {
        if (!accesstoken) {
            throw new Error('Access token is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/auth/getuser');
        vfp.params.append('accesstoken', accesstoken);
        return await vfp.fetch();
    }

    /**
     * Adds a new flight to the system
     * @param {string} callsign - The aircraft callsign (required)
     * @param {Object} [options={}] - Flight details
     * @param {string} [options.pilotName=''] - Pilot name
     * @param {number} [options.uidPilot=0] - Pilot user ID
     * @param {string} [options.attendantName=''] - First attendant/co-pilot name
     * @param {number} [options.uidAttendant=0] - First attendant user ID
     * @param {string} [options.attendantName2=''] - Second attendant name
     * @param {number} [options.uidAttendant2=0] - Second attendant user ID
     * @param {string} [options.attendantName3=''] - Third attendant name
     * @param {number} [options.uidAttendant3=0] - Third attendant user ID
     * @param {string} [options.startType='E'] - Start type (E=Eigenstart, W=Windenstart, F=F-Schlepp, etc.)
     * @param {string} [options.departureTime=''] - Departure time
     * @param {string} [options.departureLocation=''] - Departure location
     * @param {string} [options.arrivalTime=''] - Arrival time
     * @param {string} [options.arrivalLocation=''] - Arrival location
     * @param {number} [options.landingCount=1] - Number of landings
     * @param {number} [options.ftId=10] - Flight type ID
     * @param {number} [options.km=0] - Distance in kilometers
     * @param {number} [options.chargeMode=0] - Charge mode
     * @param {number} [options.uidCharge=0] - User ID to charge
     * @param {string} [options.comment=''] - Flight comment
     * @param {number} [options.wId=0] - Weather ID
     * @param {string} [options.towCallsign=''] - Tow plane callsign
     * @param {string} [options.towPilotName=''] - Tow pilot name
     * @param {number} [options.towUidPilot=0] - Tow pilot user ID
     * @param {string} [options.towTime=''] - Tow time
     * @param {number} [options.towHeight=0] - Tow height in meters
     * @param {string} [options.offBlock=''] - Off-block time
     * @param {string} [options.onBlock=''] - On-block time
     * @param {number} [options.motorStart=0.0] - Motor start counter
     * @param {number} [options.motorEnd=0.0] - Motor end counter
     * @returns {Promise<Object>} The created flight data
     * @throws {Error} If not signed in or callsign is missing
     */
    async addFlight(callsign, options = {}) {
        this._validateAccessToken();
        if (!callsign) {
            throw new Error('Callsign is required');
        }
        
        const params = this._buildFlightParams(options);
        const vfp = new VereinsfliegerPromise('interface/rest/flight/add');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        this._appendFlightParams(vfp, params);
        return await vfp.fetch();
    }

    /**
     * Edits an existing flight
     * @param {string|number} fligthId - The flight ID to edit (required)
     * @param {Object} [options={}] - Flight details to update (same structure as addFlight)
     * @returns {Promise<Object>} The updated flight data
     * @throws {Error} If not signed in or flight ID is missing
     */
    async editFlight(fligthId, options = {}) {
        this._validateAccessToken();
        if (!fligthId) {
            throw new Error('Flight ID is required');
        }
        
        const params = this._buildFlightParams(options);
        const vfp = new VereinsfliegerPromise('interface/rest/flight/edit/' + fligthId);
        vfp.method = "PUT";
        vfp.params.append('accesstoken', this.accesstoken);
        if (options.callsign) vfp.params.append('callsign', options.callsign);
        this._appendFlightParams(vfp, params);
        return await vfp.fetch();
    }

    /**
     * Deletes a flight from the system
     * @param {string|number} fligthId - The flight ID to delete (required)
     * @returns {Promise<Object>} Deletion confirmation
     * @throws {Error} If not signed in or flight ID is missing
     */
    async deleteFlight(fligthId) {
        this._validateAccessToken();
        if (!fligthId) {
            throw new Error('Flight ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/delete/' + fligthId);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves a specific flight by ID
     * @param {string|number} fligthId - The flight ID (required)
     * @param {string} [accesstoken=this.accesstoken] - Optional access token
     * @returns {Promise<Object>} Flight data
     * @throws {Error} If access token or flight ID is missing
     */
    async getFlight(fligthId, accesstoken = this.accesstoken) {
        if (!accesstoken) {
            throw new Error('Access token is required');
        }
        if (!fligthId) {
            throw new Error('Flight ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/get/' + fligthId);
        vfp.params.append('accesstoken', accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves all flights for today
     * @returns {Promise<Object>} List of today's flights
     * @throws {Error} If not signed in
     */
    async getFlightListToday() {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/today');
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }
    
    /**
     * Retrieves all flights for a specific date
     * @param {string} dateParam - The date in format YYYY-MM-DD (required)
     * @returns {Promise<Object>} List of flights for the specified date
     * @throws {Error} If not signed in or date parameter is missing
     */
    async getFlightListDate(dateParam) {
        this._validateAccessToken();
        if (!dateParam) {
            throw new Error('Date parameter is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/date');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('dateparam', dateParam);
        return await vfp.fetch();
    }

    /**
     * Retrieves the last N flights for a specific aircraft
     * @param {string} callsign - The aircraft callsign (required)
     * @param {number} count - Number of flights to retrieve
     * @returns {Promise<Object>} List of flights for the aircraft
     * @throws {Error} If not signed in or callsign is missing
     */
    async getLastFlightsPlane(callsign, count) {
        this._validateAccessToken();
        if (!callsign) {
            throw new Error('Callsign is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/plane');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('count', count);
        return await vfp.fetch();
    }

    /**
     * Retrieves the last N flights for the current user
     * @param {number} count - Number of flights to retrieve
     * @returns {Promise<Object>} List of user's flights
     * @throws {Error} If not signed in
     */
    async getLastFlightsUser(count) {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/myflights');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('count', count);
        return await vfp.fetch();
    }

    /**
     * Retrieves the last N flights for a specific pilot
     * @param {string|number} uid - The pilot's user ID (required)
     * @param {number} count - Number of flights to retrieve
     * @returns {Promise<Object>} List of pilot's flights
     * @throws {Error} If not signed in or user ID is missing
     */
    async getLastFlightsPilot(uid, count) {
        this._validateAccessToken();
        if (!uid) {
            throw new Error('User ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/user');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('uid', uid);
        vfp.params.append('count', count);
        return await vfp.fetch();
    }

    /**
     * Retrieves flights that were modified in the last N days
     * @param {number} days - Number of days to look back
     * @returns {Promise<Object>} List of modified flights
     * @throws {Error} If not signed in
     */
    async getLastModifiedFlights(days) {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/modified');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('days', days);
        return await vfp.fetch();
    }

    /**
     * Retrieves public calendar entries (no authentication required)
     * @param {string} hpaccessCode - The homepage access code (required)
     * @returns {Promise<Object>} List of public calendar appointments
     * @throws {Error} If HP access code is missing
     */
    async getCalendarPublic(hpaccessCode) {
        if (!hpaccessCode) {
            throw new Error('HP access code is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/calendar/list/public');
        //no login required, no accesstoken!!
        vfp.params.append('hpaccesscode', hpaccessCode);
        return await vfp.fetch();
    }

    /**
     * Retrieves the current user's calendar entries
     * @returns {Promise<Object>} List of user's calendar appointments
     * @throws {Error} If not signed in
     * @note This function may not be fully tested
     */
    async getCalendarUser() {
        this._validateAccessToken();
        
        //warning: test of this function did not pass!!
        const vfp = new VereinsfliegerPromise('interface/rest/calendar/list/mycalendar');
        vfp.method = "GET";
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves the list of all persons/members
     * @param {string} [token=this.accesstoken] - Optional access token
     * @returns {Promise<Object>} List of all persons in the system
     * @throws {Error} If access token is missing
     */
    async getPersonList(token = this.accesstoken) {
        if (!token) {
            throw new Error('Access token is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/user/list');
        vfp.params.append('accesstoken', token);
        return await vfp.fetch();
    }

    /**
     * Retrieves the list of active reservations
     * @returns {Promise<Object>} List of active reservations
     * @throws {Error} If not signed in
     * @note This function may not be fully tested
     */
    async getReservationList() {
        this._validateAccessToken();
        
        //warning: test of this function did not pass!!
        const vfp = new VereinsfliegerPromise('interface/rest/reservation/list/actice');
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves maintenance data for a specific aircraft
     * @param {string} callSign - The aircraft callsign (required)
     * @returns {Promise<Object>} Maintenance data for the aircraft
     * @throws {Error} If not signed in or callsign is missing
     */
    async getMaintenanceData(callSign) {
        this._validateAccessToken();
        if (!callSign) {
            throw new Error('Callsign is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/maintenance/airplane/' + callSign);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Adds a new accounting transaction
     * @param {string} bDate - Booking date in format YYYY-MM-DD (required)
     * @param {number} value - Transaction value, must be greater than 0 (required)
     * @param {number} salesTax - Sales tax percentage
     * @param {string} debitAccount - Debit account number (required)
     * @param {string} creditAccount - Credit account number (required)
     * @param {string} taxAccount - Tax account number
     * @param {string} accountReference - Account reference
     * @param {string} accountReferenceId - Account reference ID
     * @param {string} bookingText - Booking text/description
     * @returns {Promise<Object>} The created transaction
     * @throws {Error} If not signed in, required parameters missing, or value <= 0
     */
    async accountAddTransaction(bDate, value, salesTax, debitAccount, creditAccount, taxAccount, accountReference, accountReferenceId, bookingText) {
        this._validateAccessToken();
        if (!bDate || !value || !debitAccount || !creditAccount) {
            throw new Error('Booking date, value, debit account and credit account are required');
        }
        if (value <= 0) {
            throw new Error('Value must be greater than 0');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/add');
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
        return await vfp.fetch();
    }

    /**
     * Retrieves a specific accounting transaction by ID
     * @param {string|number} transactionId - The transaction ID (required)
     * @returns {Promise<Object>} Transaction data
     * @throws {Error} If not signed in or transaction ID is missing
     */
    async getAccountTransaction(transactionId) {
        this._validateAccessToken();
        if (!transactionId) {
            throw new Error('Transaction ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/get/' + transactionId);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves all accounting transactions for today
     * @returns {Promise<Object>} List of today's transactions
     * @throws {Error} If not signed in
     */
    async getAccountTransactionsToday() {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/list/today');
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves all accounting transactions for a specific year
     * @param {number} year - The year (e.g., 2024) (required)
     * @returns {Promise<Object>} List of transactions for the year
     * @throws {Error} If not signed in or year is missing
     */
    async getAccountListYear(year) {
        this._validateAccessToken();
        if (!year) {
            throw new Error('Year is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/list/year');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('year', year);
        return await vfp.fetch();
    }

    /**
     * Retrieves accounting transactions for a date range
     * @param {string} dateFrom - Start date in format YYYY-MM-DD (required)
     * @param {string} dateTo - End date in format YYYY-MM-DD (required)
     * @returns {Promise<Object>} List of transactions in the date range
     * @throws {Error} If not signed in or date parameters are missing
     */
    async getAccountTransactionsDaterange(dateFrom, dateTo) {
        this._validateAccessToken();
        if (!dateFrom || !dateTo) {
            throw new Error('Date from and date to are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/list/daterange');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        return await vfp.fetch();
    }
    
    /**
     * Retrieves work hours for a date range
     * @param {string} dateFrom - Start date in format YYYY-MM-DD (required)
     * @param {string} dateTo - End date in format YYYY-MM-DD (required)
     * @returns {Promise<Object>} List of work hours in the date range
     * @throws {Error} If not signed in or date parameters are missing
     */
    async getWorkhoursDaterange(dateFrom, dateTo) {
        this._validateAccessToken();
        if (!dateFrom || !dateTo) {
            throw new Error('Date from and date to are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/workhours/list/daterange');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        return await vfp.fetch();
    }

    /**
     * Adds a new work hours entry
     * @param {string|number} uid - User ID (required)
     * @param {string} jobDate - Job date in format YYYY-MM-DD (required)
     * @param {string} jobText - Description of the work (required)
     * @param {number} hours - Number of hours worked (required)
     * @param {string|number} category - Work category (required)
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.timeFrom=''] - Start time
     * @param {string} [options.timeTo=''] - End time
     * @param {number} [options.status=0] - Status
     * @param {string} [options.comment=''] - Additional comment
     * @returns {Promise<Object>} The created work hours entry
     * @throws {Error} If not signed in or required parameters are missing
     */
    async workhoursAdd(uid, jobDate, jobText, hours, category, { timeFrom = '', timeTo = '', status = 0, comment = "" } = {}) {
        this._validateAccessToken();
        if (!uid || !jobDate || !jobText || hours === undefined || !category) {
            throw new Error('UID, job date, job text, hours and category are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/workhours/add');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('uid', uid);
        vfp.params.append('jobdate', jobDate);
        vfp.params.append('jobtext', jobText);
        vfp.params.append('hours', hours);
        vfp.params.append('category', category);
        vfp.params.append('timefrom', timeFrom);
        vfp.params.append('timeto', timeTo);
        vfp.params.append('status', status);
        vfp.params.append('comment', comment);
        return await vfp.fetch();
    }

    /**
     * Retrieves all available work hour categories
     * @returns {Promise<Object>} List of work hour categories
     * @throws {Error} If not signed in
     */
    async getWorkhoursCategories() {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/workhourcategories/list');
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves all available articles for sale
     * @returns {Promise<Object>} List of articles
     * @throws {Error} If not signed in
     */
    async getArticles() {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/articles/list');
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Adds a new sale transaction
     * @param {string} bookingDate - Booking date in format YYYY-MM-DD (required)
     * @param {string|number} articleId - Article ID (required)
     * @param {Object} [options={}] - Sale details
     * @param {number} [options.ammount=0.0] - Quantity/amount
     * @param {string|number} [options.memberId=0] - Buyer's member ID
     * @param {string} [options.callsign=''] - Associated aircraft callsign
     * @param {number} [options.salesTax=0.0] - Sales tax
     * @param {number} [options.totalPrice=0.0] - Total price
     * @param {number} [options.counter=0.0] - Counter reading
     * @param {string} [options.comment=''] - Comment
     * @param {string} [options.ccId=''] - Cost center ID
     * @returns {Promise<Object>} The created sale transaction
     * @throws {Error} If not signed in or required parameters are missing
     */
    async addSale(bookingDate, articleId, { ammount = 0.0, memberId = 0, callsign = '', salesTax = 0.0, totalPrice = 0.0, counter = 0.0, comment = '', ccId = '' } = {}) {
        this._validateAccessToken();
        if (!bookingDate || !articleId) {
            throw new Error('Booking date and article ID are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/sale/add');
        vfp.params.append('accesstoken', this.accesstoken);
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
        return await vfp.fetch();
    }

    // ========== Aircraft Endpoints ==========

    /**
     * Retrieves the list of all aircraft in the system
     * @returns {Promise<Object>} List of all aircraft
     * @throws {Error} If not signed in
     */
    async getAircraftList() {
        this._validateAccessToken();
        
        const vfp = new VereinsfliegerPromise('interface/rest/aircraft/list');
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves detailed information about a specific aircraft
     * @param {string} callsign - The aircraft callsign (required)
     * @returns {Promise<Object>} Aircraft details
     * @throws {Error} If not signed in or callsign is missing
     */
    async getAircraft(callsign) {
        this._validateAccessToken();
        if (!callsign) {
            throw new Error('Callsign is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/aircraft/get/' + callsign);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    // ========== User Detail Endpoints ==========

    /**
     * Retrieves detailed information about a specific user
     * @param {string|number} uid - The user ID (required)
     * @returns {Promise<Object>} User details
     * @throws {Error} If not signed in or user ID is missing
     */
    async getUserDetails(uid) {
        this._validateAccessToken();
        if (!uid) {
            throw new Error('User ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/user/get/' + uid);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    // ========== Reservation Management Endpoints ==========

    /**
     * Adds a new reservation
     * @param {string} callsign - Aircraft callsign (required)
     * @param {string} dateFrom - Start date/time (required)
     * @param {string} dateTo - End date/time (required)
     * @param {Object} [options={}] - Additional options
     * @param {string|number} [options.uid=''] - User ID
     * @param {string} [options.comment=''] - Reservation comment
     * @returns {Promise<Object>} The created reservation
     * @throws {Error} If not signed in or required parameters are missing
     */
    async addReservation(callsign, dateFrom, dateTo, { uid = '', comment = '' } = {}) {
        this._validateAccessToken();
        if (!callsign || !dateFrom || !dateTo) {
            throw new Error('Callsign, dateFrom and dateTo are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/reservation/add');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        vfp.params.append('uid', uid);
        vfp.params.append('comment', comment);
        return await vfp.fetch();
    }

    /**
     * Edits an existing reservation
     * @param {string|number} reservationId - Reservation ID (required)
     * @param {Object} [options={}] - Fields to update
     * @param {string} [options.callsign=''] - Aircraft callsign
     * @param {string} [options.dateFrom=''] - Start date/time
     * @param {string} [options.dateTo=''] - End date/time
     * @param {string} [options.comment=''] - Reservation comment
     * @returns {Promise<Object>} The updated reservation
     * @throws {Error} If not signed in or reservation ID is missing
     */
    async editReservation(reservationId, { callsign = '', dateFrom = '', dateTo = '', comment = '' } = {}) {
        this._validateAccessToken();
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/reservation/edit/' + reservationId);
        vfp.method = "PUT";
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('callsign', callsign);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        vfp.params.append('comment', comment);
        return await vfp.fetch();
    }

    /**
     * Deletes a reservation
     * @param {string|number} reservationId - Reservation ID (required)
     * @returns {Promise<Object>} Deletion confirmation
     * @throws {Error} If not signed in or reservation ID is missing
     */
    async deleteReservation(reservationId) {
        this._validateAccessToken();
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/reservation/delete/' + reservationId);
        vfp.method = "DELETE";
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Retrieves a specific reservation by ID
     * @param {string|number} reservationId - Reservation ID (required)
     * @returns {Promise<Object>} Reservation details
     * @throws {Error} If not signed in or reservation ID is missing
     */
    async getReservation(reservationId) {
        this._validateAccessToken();
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/reservation/get/' + reservationId);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    // ========== Account Management Endpoints ==========

    /**
     * Edits an existing accounting transaction
     * @param {string|number} transactionId - Transaction ID (required)
     * @param {Object} [options={}] - Fields to update
     * @param {string} [options.bookingDate=''] - Booking date
     * @param {number} [options.value=0] - Transaction value
     * @param {number} [options.salesTax=0] - Sales tax
     * @param {string} [options.bookingText=''] - Booking text
     * @returns {Promise<Object>} The updated transaction
     * @throws {Error} If not signed in or transaction ID is missing
     */
    async editAccountTransaction(transactionId, { bookingDate = '', value = 0, salesTax = 0, bookingText = '' } = {}) {
        this._validateAccessToken();
        if (!transactionId) {
            throw new Error('Transaction ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/edit/' + transactionId);
        vfp.method = "PUT";
        vfp.params.append('accesstoken', this.accesstoken);
        if (bookingDate) vfp.params.append('bookingdate', bookingDate);
        if (value) vfp.params.append('value', value);
        if (salesTax) vfp.params.append('salestax', salesTax);
        if (bookingText) vfp.params.append('bookingtext', bookingText);
        return await vfp.fetch();
    }

    /**
     * Deletes an accounting transaction
     * @param {string|number} transactionId - Transaction ID (required)
     * @returns {Promise<Object>} Deletion confirmation
     * @throws {Error} If not signed in or transaction ID is missing
     */
    async deleteAccountTransaction(transactionId) {
        this._validateAccessToken();
        if (!transactionId) {
            throw new Error('Transaction ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/account/delete/' + transactionId);
        vfp.method = "DELETE";
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    // ========== Workhours Management Endpoints ==========

    /**
     * Retrieves a specific workhours entry by ID
     * @param {string|number} workhourId - Workhour ID (required)
     * @returns {Promise<Object>} Workhour entry details
     * @throws {Error} If not signed in or workhour ID is missing
     */
    async getWorkhour(workhourId) {
        this._validateAccessToken();
        if (!workhourId) {
            throw new Error('Workhour ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/workhours/get/' + workhourId);
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    /**
     * Edits an existing workhours entry
     * @param {string|number} workhourId - Workhour ID (required)
     * @param {Object} [options={}] - Fields to update
     * @param {string} [options.jobDate=''] - Job date
     * @param {string} [options.jobText=''] - Job description
     * @param {number} [options.hours=0] - Hours worked
     * @param {string} [options.comment=''] - Comment
     * @returns {Promise<Object>} The updated workhour entry
     * @throws {Error} If not signed in or workhour ID is missing
     */
    async editWorkhour(workhourId, { jobDate = '', jobText = '', hours = 0, comment = '' } = {}) {
        this._validateAccessToken();
        if (!workhourId) {
            throw new Error('Workhour ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/workhours/edit/' + workhourId);
        vfp.method = "PUT";
        vfp.params.append('accesstoken', this.accesstoken);
        if (jobDate) vfp.params.append('jobdate', jobDate);
        if (jobText) vfp.params.append('jobtext', jobText);
        if (hours) vfp.params.append('hours', hours);
        if (comment) vfp.params.append('comment', comment);
        return await vfp.fetch();
    }

    /**
     * Deletes a workhours entry
     * @param {string|number} workhourId - Workhour ID (required)
     * @returns {Promise<Object>} Deletion confirmation
     * @throws {Error} If not signed in or workhour ID is missing
     */
    async deleteWorkhour(workhourId) {
        this._validateAccessToken();
        if (!workhourId) {
            throw new Error('Workhour ID is required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/workhours/delete/' + workhourId);
        vfp.method = "DELETE";
        vfp.params.append('accesstoken', this.accesstoken);
        return await vfp.fetch();
    }

    // ========== Additional Flight Endpoints ==========

    /**
     * Retrieves flight statistics for a date range
     * @param {string} dateFrom - Start date in format YYYY-MM-DD (required)
     * @param {string} dateTo - End date in format YYYY-MM-DD (required)
     * @returns {Promise<Object>} Flight statistics
     * @throws {Error} If not signed in or date parameters are missing
     */
    async getFlightStatistics(dateFrom, dateTo) {
        this._validateAccessToken();
        if (!dateFrom || !dateTo) {
            throw new Error('Date from and date to are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/statistics/daterange');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        return await vfp.fetch();
    }

    /**
     * Retrieves flights for a specific date range
     * @param {string} dateFrom - Start date in format YYYY-MM-DD (required)
     * @param {string} dateTo - End date in format YYYY-MM-DD (required)
     * @returns {Promise<Object>} List of flights in the date range
     * @throws {Error} If not signed in or date parameters are missing
     */
    async getFlightListDaterange(dateFrom, dateTo) {
        this._validateAccessToken();
        if (!dateFrom || !dateTo) {
            throw new Error('Date from and date to are required');
        }
        
        const vfp = new VereinsfliegerPromise('interface/rest/flight/list/daterange');
        vfp.params.append('accesstoken', this.accesstoken);
        vfp.params.append('datefrom', dateFrom);
        vfp.params.append('dateto', dateTo);
        return await vfp.fetch();
    }
}

/**
 * Internal helper class for making HTTP requests to the Vereinsflieger API
 * Handles GET and POST/PUT/DELETE requests with proper parameter formatting
 * @private
 * @class
 */
class VereinsfliegerPromise {
    /**
     * Creates a new API request handler
     * @param {string} resturi - The REST URI path (e.g., 'interface/rest/auth/signin')
     * @param {string} [method='POST'] - HTTP method (GET, POST, PUT, DELETE)
     */
    constructor(resturi, method = "POST") {
        this.Host = "https://vereinsflieger.de/";
        this.params = new URLSearchParams();
        this.resturi = resturi;
        this.method = method;
    }

    /**
     * Executes the HTTP request to the Vereinsflieger API
     * @returns {Promise<Object>} Resolves with API response data if httpstatuscode is 200, rejects otherwise
     * @throws {Error} Rejects with API error response if httpstatuscode is not 200
     */
    fetch() {
        //method 'GET' is not allowed to have a body
        return new Promise((resolve, reject) => {
            const that = this;
            if (this.method == "GET")
                fetch(this.Host + this.resturi)
                    .then(r => r.json())
                    .then(function (data) {
                        if (data.httpstatuscode == 200) {
                            // data is enriched by accesstoken, if accesstoken is present
                            if (that.params.has("accesstoken"))
                                data.accesstoken = that.params.get("accesstoken");
                            resolve(data);
                        }
                        else
                            reject(data);
                    })
                    .catch(error => reject(error));
            else //all other methods need a body
                fetch(this.Host + this.resturi, { method: this.method, body: this.params })
                    .then(r => r.json())
                    .then(function (data) {
                        if (data.httpstatuscode == 200) {
                            // data is enriched by accesstoken, if accesstoken is present
                            if (that.params.has("accesstoken"))
                                data.accesstoken = that.params.get("accesstoken");
                            resolve(data);
                        }
                        else
                            reject(data);
                    })
                    .catch(error => reject(error));
        })
    }
}

module.exports = { VereinsfliegerAPI }