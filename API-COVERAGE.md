# Vereinsflieger API - Vollständige Übersicht

## Legende
- ✓ = Durch Tests abgesichert
- ✗ = Nicht durch Tests abgesichert

---

## AUTHENTICATION

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✗ | Access Token abrufen | GET | `interface/rest/auth/accesstoken` | `setAccessToken()` | - |
| ✓ | Benutzer anmelden | POST | `interface/rest/auth/signin` | `signIn(username, password)` | test-api-complete.js, test-reservation.js, test.js |
| ✓ | Benutzer abmelden | GET | `interface/rest/auth/signout` | `signOut()` | test-api-complete.js, test-reservation.js, test.js |
| ✓ | Aktuellen Benutzer abrufen | GET | `interface/rest/auth/getuser` | `getUser()` | test.js |

---

## FLIGHTS

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Flug hinzufügen | POST | `interface/rest/flight/add` | `addFlight(callsign, options)` | test.js |
| ✓ | Flug bearbeiten | PUT | `interface/rest/flight/edit/[flid]` | `editFlight(flightId, options)` | test.js |
| ✓ | Flug löschen | DELETE | `interface/rest/flight/delete/[flid]` | `deleteFlight(flightId)` | test.js |
| ✗ | F-Schlepp verbinden | POST | `interface/rest/flight/jointowflights` | `joinTowFlights(uidglider, uidtowplane)` | - |
| ✓ | Flug-Details abrufen | GET | `interface/rest/flight/get/[flid]` | `getFlight(flightId)` | test.js |
| ✓ | Heutige Flüge | GET | `interface/rest/flight/list/today` | `getFlightListToday()` | test-api-complete.js, test.js |
| ✓ | Flüge nach Datum | GET | `interface/rest/flight/list/date` | `getFlightListDate(date)` | test.js |
| ✓ | Flüge nach Flugzeug | GET | `interface/rest/flight/list/plane` | `getFlightListPlane(callsign, from, to)` | test.js |
| ✓ | Meine Flüge | GET | `interface/rest/flight/list/myflights` | `getMyFlights(limit)` | test.js |
| ✓ | Flüge nach Pilot | GET | `interface/rest/flight/list/user` | `getLastFlightsPilot(uid, count)` | test.js |
| ✓ | Geänderte Flüge | GET | `interface/rest/flight/list/modified` | `getLastModifiedFlights(days)` | test.js |
| ✓ | Flüge im Zeitraum | GET | `interface/rest/flight/list/daterange` | `getFlightListDaterange(from, to)` | test.js |

---

## CALENDAR

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Öffentlicher Kalender | GET | `interface/rest/calendar/list/public` | `getCalendarPublic(hpaccessCode)` | test.js |
| ✗ | Mein Kalender | GET | `interface/rest/calendar/list/mycalendar` | `getCalendarUser()` | - |
| ✓ | Termine im Zeitraum | GET | `interface/rest/calendar/list` | `getCalendarList(dateFrom, dateTo)` | test-api-complete.js |
| ✗ | Termin anlegen | POST | `interface/rest/calendar/add` | `addCalendarAppointment(title, dateFrom, dateTo, options)` | - |
| ✗ | Termin bearbeiten | POST | `interface/rest/calendar/edit/[apoid]` | `editCalendarAppointment(apoid, dateFrom, dateTo, options)` | - |
| ✗ | Termin löschen | DELETE | `interface/rest/calendar/delete/[apoid]` | `deleteCalendarAppointment(apoid)` | - |

---

## USERS

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Mitgliederliste | GET | `interface/rest/user/list` | `getPersonList()` | test-api-complete.js, test.js |

---

## RESERVATIONS

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Aktive Reservierungen | GET | `interface/rest/reservation/list/active` | `getReservationList()` | test-api-complete.js, test-reservation.js, test.js |

---

## MAINTENANCE

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Wartungsdaten Flugzeug | GET | `interface/rest/maintenance/airplane/[callsign]` | `getMaintenanceData(callsign)` | test.js |

---

## ACCOUNTING

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✗ | Buchung hinzufügen | POST | `interface/rest/account/add` | `accountAddTransaction(date, value, tax, debit, credit, ..., options)` | - |
| ✗ | Buchung bearbeiten | PUT | `interface/rest/account/edit/[adid]` | `editAccountTransaction(transactionId, options)` | - |
| ✗ | Buchung abrufen | GET | `interface/rest/account/get/[adid]` | `getAccountTransaction(transactionId)` | - |
| ✓ | Heutige Buchungen | GET | `interface/rest/account/list/today` | `getAccountTransactionsToday()` | test-api-complete.js |
| ✗ | Buchungen Jahr | GET | `interface/rest/account/list/year` | `getAccountListYear(year)` | - |
| ✗ | Buchungen Zeitraum | GET | `interface/rest/account/list/daterange` | `getAccountTransactionsDaterange(from, to)` | - |

---

## WORK HOURS

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Arbeitsstunden Zeitraum | GET | `interface/rest/workhours/list/daterange` | `getWorkhoursDaterange(from, to)` | test-api-complete.js |
| ✗ | Arbeitsstunden hinzufügen | POST | `interface/rest/workhours/add` | `workhoursAdd(uid, date, text, hours, category, options)` | - |
| ✓ | Arbeitsstunden-Kategorien | GET | `interface/rest/workhourcategories/list` | `getWorkhoursCategories()` | test-api-complete.js |

---

## ARTICLES

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Artikelliste | GET | `interface/rest/articles/list` | `getArticles()` | test-api-complete.js |

---

## SALES

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✗ | Verkäufe Zeitraum | GET | `interface/rest/sale/list/daterange` | `getSaleListDaterange(from, to)` | - |
| ✗ | Geänderte Verkäufe | GET | `interface/rest/sale/list/modified` | `getSaleListModified(days)` | - |
| ✗ | Verkäufe Datum | GET | `interface/rest/sale/list/date` | `getSaleListDate(date)` | - |
| ✓ | Heutige Verkäufe | GET | `interface/rest/sale/list/today` | `getSaleListToday()` | test-api-complete.js |
| ✗ | Verkauf hinzufügen | POST | `interface/rest/sale/add` | `addSale(date, articleId, options)` | - |

---

## BACKUP

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✗ | Backup-Datei abrufen | GET | `interface/rest/backup/getzip` | `getBackupZip()` | - |

---

## VOUCHERS

| Status | Beschreibung | HTTP | API-Endpunkt | Node.js-Methode | Getestet in |
|--------|--------------|------|--------------|-----------------|-------------|
| ✓ | Gutschein-Liste | GET | `interface/rest/voucher/list` | `getVoucherList()` | test-api-complete.js |
| ✗ | Gutschein anlegen | POST | `interface/rest/voucher/add` | `addVoucher(voucherId, title, value, insertNewUser, lastname, options)` | - |
| ✗ | Gutschein-Status ändern | POST | `interface/rest/voucher/changestatus` | `changeVoucherStatus(voucherId, status)` | - |

---

## STATISTIK

| Kategorie | Anzahl | Prozent |
|-----------|--------|---------|
| **Gesamt dokumentierte API-Endpunkte** | 44 | 100% |
| **Durch Tests abgesichert** | 25 | 57% |
| **Nicht durch Tests abgesichert** | 19 | 43% |

---

## HINWEISE

### Übersprungene Tests (SKIP)
Die folgenden Methoden haben Tests in `test-reservation.js`, die aber übersprungen werden, weil die API diese Operationen nicht unterstützt:
- `addReservation()` - API unterstützt keine Reservierungs-Schreiboperationen
- `getReservation()` - API unterstützt nur Liste, keine einzelnen Reservierungen
- `editReservation()` - API unterstützt keine Reservierungs-Schreiboperationen
- `deleteReservation()` - API unterstützt keine Reservierungs-Schreiboperationen

### Nicht dokumentierte Methoden (⚠️ im README)
Diese Methoden sind im Code implementiert, aber nicht in der offiziellen API-Spezifikation (Stand 17.08.2026):
- `getAircraftList()` - Aircraft-Liste nicht in API-Doku
- `getAircraft()` - Aircraft-Details nicht in API-Doku
- `getUserDetails()` - User-Details nicht in API-Doku
- `addReservation()` - Reservierungs-CRUD nicht verfügbar
- `editReservation()` - Reservierungs-CRUD nicht verfügbar
- `deleteReservation()` - Reservierungs-CRUD nicht verfügbar
- `getReservation()` - Reservierungs-CRUD nicht verfügbar
- `deleteAccountTransaction()` - Account-Delete nicht in API-Doku
- `getWorkhour()` - Arbeitsstunden-Details nicht in API-Doku
- `editWorkhour()` - Arbeitsstunden-Bearbeitung nicht in API-Doku
- `deleteWorkhour()` - Arbeitsstunden-Löschen nicht in API-Doku
- `getFlightStatistics()` - Statistik-Endpunkt nicht in API-Doku

### Test-Dateien
- **test-api-complete.js**: Testet alle dokumentierten Endpunkte (11 Tests)
- **test-reservation.js**: Fokussierte Tests für Reservierungen (8 Tests, 4 davon SKIP)
- **test.js**: Legacy-Tests für Flüge und Basis-Funktionen (Tests umfassender Flug-CRUD)

---


### Kritische Endpunkte ohne Test-Abdeckung (Tests würden Echtdaten verändern):
1. **Calendar CRUD** (3 Endpunkte)
   - `addCalendarAppointment()`
   - `editCalendarAppointment()`
   - `deleteCalendarAppointment()`

2. **Accounting** (5 Endpunkte)
   - `accountAddTransaction()`
   - `editAccountTransaction()`
   - `getAccountTransaction()`
   - `getAccountListYear()`
   - `getAccountTransactionsDaterange()`

3. **Sales** (4 Endpunkte)
   - `getSaleListDaterange()`
   - `getSaleListModified()`
   - `getSaleListDate()`
   - `addSale()`

4. **Vouchers** (2 Endpunkte)
   - `addVoucher()`
   - `changeVoucherStatus()`

5. **Work Hours** (1 Endpunkt)
   - `workhoursAdd()`

6. **Sonstige** (4 Endpunkte)
   - `setAccessToken()`
   - `joinTowFlights()`
   - `getCalendarUser()`
   - `getBackupZip()`
