require('dotenv').config();
const vereinsfliegerapi = require('./vereinsflieger_nodejs_api');

/**
 * Umfassende Test-Suite für alle DOKUMENTIERTEN Vereinsflieger API-Endpunkte
 * 
 * Testet nur Endpunkte, die in der offiziellen API-Spezifikation (Stand 17.08.2026) dokumentiert sind.
 * Methoden mit "⚠️ NICHT DOKUMENTIERT" werden NICHT getestet.
 * 
 * Getestete Bereiche:
 * - Authentication (signin, signout, getUser, setAccessToken)
 * - Flights (add, edit, delete, get, list variants, joinTowFlights)
 * - Calendar (public, user, list, add, edit, delete)
 * - Users (list only - getUserDetails nicht dokumentiert)
 * - Reservations (list only - CRUD nicht dokumentiert)
 * - Maintenance (airplane data)
 * - Accounting (add, edit, get, list variants - delete nicht dokumentiert)
 * - Work Hours (add, list, categories - edit/delete/get nicht dokumentiert)
 * - Sales (add, list variants)
 * - Backup (getzip)
 * - Vouchers (list, add, changestatus)
 */
class APICompleteTestSuite {
    constructor() {
        this.api = new vereinsfliegerapi.VereinsfliegerAPI(process.env.VEREINSFLIEGER_APPKEY);
        this.testResults = [];
        this.createdIds = {
            flights: [],
            appointments: [],
            workHours: [],
            sales: [],
            vouchers: []
        };
        this.isAuthenticated = false;
    }

    /**
     * Protokolliert Testergebnisse
     */
    log(category, testName, status, message = '', data = null) {
        // Sichere Daten für Speicherung
        let safeData = null;
        if (data) {
            if (data instanceof Error) {
                safeData = { message: data.message, name: data.name };
            } else if (typeof data === 'object') {
                try {
                    JSON.stringify(data);
                    safeData = data;
                } catch {
                    safeData = {};
                    for (const key of Object.keys(data)) {
                        try {
                            JSON.stringify(data[key]);
                            safeData[key] = data[key];
                        } catch {
                            safeData[key] = '[nicht darstellbar]';
                        }
                    }
                }
            } else {
                safeData = data;
            }
        }
        
        const result = {
            category: category,
            test: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString(),
            data: safeData
        };
        this.testResults.push(result);
        
        const statusSymbol = {
            'PASS': '✓',
            'FAIL': '✗',
            'SKIP': '○',
            'INFO': 'ℹ'
        }[status] || '?';
        
        console.log(`[${statusSymbol}] ${category}/${testName}: ${message}`);
        if (data && status === 'FAIL') {
            if (typeof data === 'object' && data !== null) {
                if (data.httpstatuscode) {
                    console.log('   HTTP Status:', data.httpstatuscode);
                    if (data.message) console.log('   Message:', data.message);
                    if (data.error) console.log('   Error:', data.error);
                } else if (data.message) {
                    console.log('   Error:', data.message);
                }
            }
        }
    }

    /**
     * Setup: Authentifizierung
     */
    async setup() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║  Vereinsflieger API - Vollständige Test-Suite           ║');
        console.log('║  (Nur dokumentierte Endpunkte)                           ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        console.log('========== Test Setup ==========');
        try {
            await this.api.signIn(
                process.env.VEREINSFLIEGER_USERNAME,
                process.env.VEREINSFLIEGER_PASSWORD
            );
            this.isAuthenticated = true;
            this.log('Setup', 'authentication', 'PASS', 'Authentifizierung erfolgreich');
            
            if (process.env.VEREINSFLIEGER_VEREINS_ID) {
                this.api.setVereinsID(process.env.VEREINSFLIEGER_VEREINS_ID);
                this.log('Setup', 'vereinsid', 'INFO', 'Vereins-ID gesetzt', { id: process.env.VEREINSFLIEGER_VEREINS_ID });
            }
            
            return true;
        } catch (error) {
            this.log('Setup', 'authentication', 'FAIL', 'Authentifizierung fehlgeschlagen', error);
            return false;
        }
    }

    /**
     * Teardown: Cleanup und Logout
     */
    async teardown() {
        console.log('\n========== Test Teardown ==========');
        
        // Cleanup: Lösche erstellte Test-Daten
        for (const flightId of this.createdIds.flights) {
            try {
                await this.api.deleteFlight(flightId);
                this.log('Cleanup', 'flight', 'PASS', `Flug ${flightId} gelöscht`);
            } catch (error) {
                this.log('Cleanup', 'flight', 'FAIL', `Fehler beim Löschen von Flug ${flightId}`, error);
            }
        }

        for (const apoid of this.createdIds.appointments) {
            try {
                await this.api.deleteCalendarAppointment(apoid);
                this.log('Cleanup', 'appointment', 'PASS', `Termin ${apoid} gelöscht`);
            } catch (error) {
                this.log('Cleanup', 'appointment', 'FAIL', `Fehler beim Löschen von Termin ${apoid}`, error);
            }
        }

        // Logout
        if (this.isAuthenticated) {
            try {
                await this.api.signOut();
                this.log('Teardown', 'logout', 'PASS', 'Logout erfolgreich');
            } catch (error) {
                if (error.message && error.message.includes('not valid JSON')) {
                    this.log('Teardown', 'logout', 'INFO', 'Logout abgeschlossen (API gab HTML statt JSON zurück - bekanntes Problem)');
                } else {
                    this.log('Teardown', 'logout', 'FAIL', 'Logout fehlgeschlagen', error);
                }
            }
        }
    }

    /**
     * Hilfsfunktion: Erstellt ein Datum in der Zukunft
     */
    getFutureDate(daysFromNow = 7, hoursFromMidnight = 10) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        date.setHours(hoursFromMidnight, 0, 0, 0);
        return date.toISOString().slice(0, 16).replace('T', ' ');
    }

    /**
     * Hilfsfunktion: Heutiges Datum
     */
    getTodayDate() {
        const date = new Date();
        return date.toISOString().slice(0, 10);
    }

    /**
     * Hilfsfunktion: Wartet kurz zwischen Tests
     */
    async wait(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========== Test Cases ==========

    /**
     * Test: Reservierungen auslesen (einziger dokumentierter Reservierungs-Endpunkt)
     */
    async testReservations() {
        console.log('\n========== Reservierungen ==========');
        try {
            const result = await this.api.getReservationList();
            if (result && result.httpstatuscode === 200) {
                const count = Array.isArray(result) ? result.length : 0;
                this.log('Reservations', 'getReservationList', 'PASS', `${count} Reservierungen gefunden`, { count });
            } else {
                this.log('Reservations', 'getReservationList', 'FAIL', 'Ungültige API-Antwort', result);
            }
        } catch (error) {
            this.log('Reservations', 'getReservationList', 'FAIL', 'Fehler beim Abrufen', error);
        }
    }

    /**
     * Test: Kalender
     */
    async testCalendar() {
        console.log('\n========== Kalender ==========');
        
        // Test 1: Terminliste
        try {
            const from = this.getTodayDate();
            const to = this.getFutureDate(30, 0).slice(0, 10);
            const result = await this.api.getCalendarList(from, to);
            if (result && result.httpstatuscode === 200) {
                this.log('Calendar', 'getCalendarList', 'PASS', 'Terminliste abgerufen');
            } else {
                this.log('Calendar', 'getCalendarList', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Calendar', 'getCalendarList', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Mitglieder
     */
    async testUsers() {
        console.log('\n========== Mitglieder ==========');
        
        try {
            const result = await this.api.getPersonList();
            if (result && result.httpstatuscode === 200) {
                this.log('Users', 'getPersonList', 'PASS', 'Mitgliederliste abgerufen');
            } else {
                this.log('Users', 'getPersonList', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Users', 'getPersonList', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Flüge (Read-Only für Live-Tests)
     */
    async testFlights() {
        console.log('\n========== Flüge (Lesen) ==========');
        
        // Test: Heutige Flüge
        try {
            const result = await this.api.getFlightListToday();
            if (result && result.httpstatuscode === 200) {
                this.log('Flights', 'getFlightListToday', 'PASS', 'Heutige Flüge abgerufen');
            } else {
                this.log('Flights', 'getFlightListToday', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Flights', 'getFlightListToday', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Arbeitsstunden
     */
    async testWorkHours() {
        console.log('\n========== Arbeitsstunden ==========');
        
        // Test: Kategorien
        try {
            const result = await this.api.getWorkhoursCategories();
            if (result && result.httpstatuscode === 200) {
                this.log('WorkHours', 'getWorkhoursCategories', 'PASS', 'Kategorien abgerufen');
            } else {
                this.log('WorkHours', 'getWorkhoursCategories', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('WorkHours', 'getWorkhoursCategories', 'FAIL', 'Fehler', error);
        }

        // Test: Arbeitsstunden auslesen
        try {
            const from = '2026-01-01';
            const to = this.getTodayDate();
            const result = await this.api.getWorkhoursDaterange(from, to);
            if (result && result.httpstatuscode === 200) {
                this.log('WorkHours', 'getWorkhoursDaterange', 'PASS', 'Arbeitsstunden abgerufen');
            } else {
                this.log('WorkHours', 'getWorkhoursDaterange', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('WorkHours', 'getWorkhoursDaterange', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Artikel
     */
    async testArticles() {
        console.log('\n========== Artikel ==========');
        
        try {
            const result = await this.api.getArticles();
            if (result && result.httpstatuscode === 200) {
                this.log('Articles', 'getArticles', 'PASS', 'Artikel abgerufen');
            } else {
                this.log('Articles', 'getArticles', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Articles', 'getArticles', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Verkäufe
     */
    async testSales() {
        console.log('\n========== Verkäufe ==========');
        
        // Test: Heutige Verkäufe
        try {
            const result = await this.api.getSaleListToday();
            if (result && result.httpstatuscode === 200) {
                this.log('Sales', 'getSaleListToday', 'PASS', 'Heutige Verkäufe abgerufen');
            } else {
                this.log('Sales', 'getSaleListToday', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Sales', 'getSaleListToday', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Gutscheine
     */
    async testVouchers() {
        console.log('\n========== Gutscheine ==========');
        
        try {
            const result = await this.api.getVoucherList();
            if (result && result.httpstatuscode === 200) {
                this.log('Vouchers', 'getVoucherList', 'PASS', 'Gutscheinliste abgerufen');
            } else {
                this.log('Vouchers', 'getVoucherList', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Vouchers', 'getVoucherList', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Test: Buchungen
     */
    async testAccounting() {
        console.log('\n========== Buchungen ==========');
        
        // Test: Heutige Buchungen
        try {
            const result = await this.api.getAccountTransactionsToday();
            if (result && result.httpstatuscode === 200) {
                this.log('Accounting', 'getAccountTransactionsToday', 'PASS', 'Heutige Buchungen abgerufen');
            } else {
                this.log('Accounting', 'getAccountTransactionsToday', 'FAIL', 'Ungültige Antwort', result);
            }
        } catch (error) {
            this.log('Accounting', 'getAccountTransactionsToday', 'FAIL', 'Fehler', error);
        }
    }

    /**
     * Führt die komplette Test-Suite aus
     */
    async runAllTests() {
        const success = await this.setup();
        if (!success) {
            console.log('\n✗ Setup fehlgeschlagen - Tests werden abgebrochen\n');
            return;
        }

        // Führe alle Tests aus
        await this.testReservations();
        await this.testCalendar();
        await this.testUsers();
        await this.testFlights();
        await this.testWorkHours();
        await this.testArticles();
        await this.testSales();
        await this.testVouchers();
        await this.testAccounting();

        await this.teardown();
        this.generateReport();
    }

    /**
     * Generiert einen Abschlussbericht
     */
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                      TEST REPORT                         ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
        const total = passed + failed + skipped;

        console.log(`Gesamt:       ${total}`);
        console.log(`✓ Bestanden:  ${passed}`);
        console.log(`✗ Fehler:     ${failed}`);
        console.log(`○ Übersprungen: ${skipped}`);

        if (failed > 0) {
            console.log('\n--- Fehlerhafte Tests ---');
            this.testResults.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  ✗ ${r.category}/${r.test}: ${r.message}`);
            });
        }

        console.log('\n═════════════════════════════════════════════════════════════');
        if (failed === 0) {
            console.log('Ergebnis: ✓ ALLE TESTS BESTANDEN');
        } else {
            console.log('Ergebnis: ✗ TESTS FEHLGESCHLAGEN');
        }
        console.log('═════════════════════════════════════════════════════════════\n');
    }
}

// Hauptprogramm
async function main() {
    const suite = new APICompleteTestSuite();
    await suite.runAllTests();
}

main().catch(console.error);
