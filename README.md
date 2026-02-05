# vereinsflieger_nodejs_api

A comprehensive Node.js wrapper for the Vereinsflieger REST API with full TypeScript-style JSDoc documentation, modern ES6+ features, and complete CRUD operations.

## Vereinsflieger.de

[Vereinsflieger](https://www.vereinsflieger.de) is a popular system in Germany to help aviation clubs with their administration. The administration ranges from the legally required documentation duties, invoicing and accounting topics, managing flight training, to the annual statistics.

Although the system itself already maps all relevant topics in the web application, a reading and writing REST-based API is offered for many tables in the database. This API can be used to solve rare, individual needs.

Because there is a worldwide tendency to develop web applications based on Node.js, this wrapper API was created for Node.js. The code is made available here to the public.

## Features

✅ **48+ API Methods** covering all major endpoints  
✅ **Complete JSDoc Documentation** with IntelliSense support  
✅ **Input Validation** for all critical parameters  
✅ **Modern Error Handling** with descriptive error messages  
✅ **Native Fetch API** (Node.js 18+, no external dependencies for HTTP)  
✅ **Environment Variables** support via dotenv  
✅ **Zero Security Vulnerabilities**

## Installation

```bash
npm install
```

## Setup

### 1. Environment Variables

Copy the template and add your credentials:

```bash
cp muster.env .env
```

Edit `.env` file:
```env
VEREINSFLIEGER_APPKEY=your_appkey_from_vereinsflieger
VEREINSFLIEGER_USERNAME=your.email@example.com
VEREINSFLIEGER_PASSWORD=your_password
```

**Important:** The `.env` file is already in `.gitignore` and will not be committed to git.

### 2. Get Your API Key

The API key (appkey) must be requested from Vereinsflieger support. Note the usage restrictions:
```
Der für die Anmeldung erforderliche appkey kann über den Support
angefragt werden. Die max. Anzahl an Requests (gemeint sind alle
Aufrufe) ist auf 1000 je Tag limitiert. Die kommerzielle Nutzung der
Schnittstelle ist grundsätzlich untersagt.
```

## Quick Start

```javascript
require('dotenv').config();
const { VereinsfliegerAPI } = require('./vereinsflieger_nodejs_api');

const vf = new VereinsfliegerAPI(process.env.VEREINSFLIEGER_APPKEY);

async function example() {
    try {
        // Sign in
        await vf.signIn(process.env.VEREINSFLIEGER_USERNAME, process.env.VEREINSFLIEGER_PASSWORD);
        
        // Get user info
        const user = await vf.getUser();
        console.log(`Logged in as: ${user.firstname} ${user.lastname}`);
        
        // Get today's flights
        const flights = await vf.getFlightListToday();
        console.log('Today\'s flights:', flights);
        
        // Sign out
        await vf.signOut();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

example();
```

## API Overview

### Authentication
- `signIn(username, password)` - Sign in user
- `signOut()` - Sign out current user
- `getUser()` - Get current user info
- `setAccessToken()` - Get access token (called automatically)

### Flights (Complete CRUD)
- `addFlight(callsign, options)` - Add new flight
- `editFlight(flightId, options)` - Edit existing flight
- `deleteFlight(flightId)` - Delete flight
- `getFlight(flightId)` - Get flight details
- `getFlightListToday()` - Today's flights
- `getFlightListDate(date)` - Flights for specific date
- `getFlightListDaterange(from, to)` - Flights in date range
- `getLastFlightsPlane(callsign, count)` - Last N flights of aircraft
- `getLastFlightsUser(count)` - Last N flights of current user
- `getLastFlightsPilot(uid, count)` - Last N flights of pilot
- `getLastModifiedFlights(days)` - Recently modified flights
- `getFlightStatistics(from, to)` - Flight statistics

### Aircraft
- `getAircraftList()` - List all aircraft
- `getAircraft(callsign)` - Get aircraft details
- `getMaintenanceData(callsign)` - Get maintenance data

### Users
- `getPersonList()` - List all users/members
- `getUserDetails(uid)` - Get detailed user info

### Reservations (Complete CRUD)
- `addReservation(callsign, from, to, options)` - Add reservation
- `editReservation(reservationId, options)` - Edit reservation
- `deleteReservation(reservationId)` - Delete reservation
- `getReservation(reservationId)` - Get reservation details
- `getReservationList()` - List active reservations

### Calendar
- `getCalendarPublic(hpaccessCode)` - Get public calendar (no auth)
- `getCalendarUser()` - Get user's calendar

### Accounting (Complete CRUD)
- `accountAddTransaction(date, value, tax, debit, credit, ...)` - Add transaction
- `editAccountTransaction(transactionId, options)` - Edit transaction
- `deleteAccountTransaction(transactionId)` - Delete transaction
- `getAccountTransaction(transactionId)` - Get transaction details
- `getAccountTransactionsToday()` - Today's transactions
- `getAccountListYear(year)` - Transactions for year
- `getAccountTransactionsDaterange(from, to)` - Transactions in range

### Work Hours (Complete CRUD)
- `workhoursAdd(uid, date, text, hours, category, options)` - Add work hours
- `editWorkhour(workhourId, options)` - Edit work hours
- `deleteWorkhour(workhourId)` - Delete work hours
- `getWorkhour(workhourId)` - Get work hour details
- `getWorkhoursDaterange(from, to)` - Work hours in range
- `getWorkhoursCategories()` - Get available categories

### Articles & Sales
- `getArticles()` - List all articles
- `addSale(date, articleId, options)` - Add sale transaction

## Example: Express.js Router with dotenv

```javascript
require('dotenv').config();
const express = require('express');
const router = express.Router();
const { VereinsfliegerAPI } = require('../../vereinsflieger_api/vereinsflieger_nodejs_api');

const vf = new VereinsfliegerAPI(process.env.VEREINSFLIEGER_APPKEY);

async function vereinsfliegerLogin(req, res, next) {
    try {
        await vf.signIn(req.body.username, req.body.password);
        return next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

async function setUserdata(req, res, next) {
    try {
        req.session.userdata = await vf.getUser();
        return next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

function render(req, res) {
    res.render('resulting_displayfile', {
        title: 'Vereinsflieger-Benutzerdaten darstellen',
        userdata: req.session.userdata
    });
}

router.post('/login', vereinsfliegerLogin, setUserdata, render);

module.exports = router;
```

## Example: Working with Nested Objects

Data returned from the API are often nested JavaScript objects. Here's how to convert them to arrays:

```javascript
require('dotenv').config();
const express = require('express');
const { VereinsfliegerAPI } = require('../../vereinsflieger_api/vereinsflieger_nodejs_api');
const router = express.Router();

const vf = new VereinsfliegerAPI(process.env.VEREINSFLIEGER_APPKEY);

async function fillCashTransactions(req, res, next) {
    try {
        const transactions_json = await vf.getAccountListYear(new Date().getFullYear());
        
        // Convert nested object to array
        const transaction_array = Object.values(transactions_json);
        
        // Filter transactions
        const filteredTransactions = transaction_array.filter(el => el.creditaccount == 100000);
        
        req.filteredTransactions = filteredTransactions;
        return next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

router.get('/transactions', fillCashTransactions, (req, res) => {
    res.json(req.filteredTransactions);
});

module.exports = router;
```

## Error Handling

All methods throw descriptive errors that can be caught:

```javascript
try {
    await vf.addFlight('D-ECQH', {
        pilotName: 'John Doe',
        departureTime: '2024-01-01 10:00',
        arrivalTime: '2024-01-01 12:00'
    });
} catch (error) {
    if (error.message.includes('Not signed in')) {
        console.error('Please sign in first');
    } else if (error.message.includes('Callsign is required')) {
        console.error('Missing required parameter');
    } else {
        console.error('API Error:', error);
    }
}
```

## IntelliSense Support

All methods have complete JSDoc documentation. Your IDE will show:
- Parameter types and descriptions
- Return types
- Required vs optional parameters
- Error conditions

Simply start typing `vf.` and see all available methods with descriptions!

## Requirements

- Node.js 18+ (for native fetch API support)
- Valid Vereinsflieger API key

## Dependencies

- `dotenv` - Environment variable management
- `crypto` - MD5 hashing for passwords (built-in)
- Native `fetch` API (Node.js 18+)

## Legal Notice

You can use the code, but I do not guarantee the results and take no responsibility for the code. You have to get an individual App-Key from vereinsflieger.de. In this context you have to comply with the terms of use of vereinsflieger.de.

## License

MIT License - See file header for details

## Contributing

Contributions are welcome! Please ensure:
- All new methods have JSDoc documentation
- Input validation for required parameters
- Proper error handling
- Test your changes

## Changelog

### Version 2.0 (2026)
- ✅ Added 23 new API endpoints (48+ total methods)
- ✅ Complete JSDoc documentation
- ✅ Modern error handling with descriptive messages
- ✅ Input validation for all methods
- ✅ Migrated to native fetch API (no node-fetch dependency)
- ✅ Environment variable support with dotenv
- ✅ Fixed all security vulnerabilities
- ✅ Improved code quality and consistency

### Version 1.0
- Initial release with basic API coverage
