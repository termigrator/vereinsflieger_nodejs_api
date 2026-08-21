require('dotenv').config();
const vereinsfliegerapi = require('./vereinsflieger_nodejs_api');

/**
 * Test Suite für Flugzeugreservierungs-Funktionalität
 * 
 * HINWEIS: Die Vereinsflieger API unterstützt derzeit nur Lese-Operationen für Reservierungen.
 * Schreib-Operationen (add/edit/delete) sind in der API-Implementierung vorbereitet,
 * aber werden als SKIP markiert, bis die API diese Endpunkte unterstützt.
 * 
 * Siehe Dokumentation Kapitel 6.1: Nur "Aktuelle Reservierungen auslesen" ist verfügbar.
 */
class ReservationTestSuite {
    constructor() {
        this.api = new vereinsfliegerapi.VereinsfliegerAPI(process.env.VEREINSFLIEGER_APPKEY);
        this.testResults = [];
        this.createdReservationIds = []; // Zum Cleanup am Ende
        this.isAuthenticated = false;
    }

    /**
     * Protokolliert Testergebnisse
     */
    log(testName, status, message = '', data = null) {
        // Sichere Daten für Speicherung (ohne zirkuläre Referenzen)
        let safeData = null;
        if (data) {
            if (data instanceof Error) {
                safeData = { message: data.message, name: data.name };
            } else if (typeof data === 'object') {
                try {
                    // Teste ob serialisierbar
                    JSON.stringify(data);
                    safeData = data;
                } catch {
                    // Wenn nicht serialisierbar, extrahiere Haupteigenschaften
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
            test: testName,
            status: status, // 'PASS', 'FAIL', 'SKIP', 'INFO'
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
        
        console.log(`[${statusSymbol}] ${testName}: ${message}`);
        if (data) {
            // Bessere Fehlerausgabe für API-Antworten
            if (typeof data === 'object' && data !== null) {
                if (data.httpstatuscode) {
                    console.log('   HTTP Status:', data.httpstatuscode);
                    if (data.message) console.log('   Message:', data.message);
                    if (data.error) console.log('   Error:', data.error);
                } else if (data.message) {
                    console.log('   Error:', data.message);
                } else if (data instanceof Error) {
                    console.log('   Error:', data.message);
                    if (data.stack) console.log('   Stack:', data.stack.split('\n').slice(0, 3).join('\n'));
                } else {
                    // Vermeide zirkuläre Referenzen
                    try {
                        const safeDataStr = JSON.stringify(data, null, 2);
                        console.log('   Data:', safeDataStr);
                    } catch (e) {
                        console.log('   Data: [Objekt mit zirkulären Referenzen]');
                        // Zeige die Haupteigenschaften
                        Object.keys(data).forEach(key => {
                            try {
                                console.log(`   ${key}:`, JSON.stringify(data[key]));
                            } catch {
                                console.log(`   ${key}: [nicht darstellbar]`);
                            }
                        });
                    }
                }
            } else {
                console.log('   Data:', data);
            }
        }
    }

    /**
     * Setup: Authentifizierung
     */
    async setup() {
        console.log('\n========== Test Setup ==========');
        try {
            await this.api.signIn(
                process.env.VEREINSFLIEGER_USERNAME,
                process.env.VEREINSFLIEGER_PASSWORD
            );
            this.isAuthenticated = true;
            this.log('Setup', 'PASS', 'Authentifizierung erfolgreich');
            
            // Optional: Vereins-ID setzen falls vorhanden
            if (process.env.VEREINSFLIEGER_VEREINS_ID) {
                this.api.setVereinsID(process.env.VEREINSFLIEGER_VEREINS_ID);
                this.log('Setup', 'INFO', 'Vereins-ID gesetzt', { id: process.env.VEREINSFLIEGER_VEREINS_ID });
            }
            
            return true;
        } catch (error) {
            this.log('Setup', 'FAIL', 'Authentifizierung fehlgeschlagen', error);
            return false;
        }
    }

    /**
     * Teardown: Cleanup und Logout
     */
    async teardown() {
        console.log('\n========== Test Teardown ==========');
        
        // Cleanup: Lösche alle während der Tests erstellten Reservierungen
        for (const reservationId of this.createdReservationIds) {
            try {
                await this.api.deleteReservation(reservationId);
                this.log('Cleanup', 'PASS', `Reservierung ${reservationId} gelöscht`);
            } catch (error) {
                this.log('Cleanup', 'FAIL', `Fehler beim Löschen von Reservierung ${reservationId}`, error);
            }
        }

        // Logout
        if (this.isAuthenticated) {
            try {
                await this.api.signOut();
                this.log('Teardown', 'PASS', 'Logout erfolgreich');
            } catch (error) {
                // signOut gibt manchmal HTML zurück - das ist ein bekanntes API-Problem
                if (error.message && error.message.includes('not valid JSON')) {
                    this.log('Teardown', 'INFO', 'Logout abgeschlossen (API gab HTML statt JSON zurück - bekanntes Problem)');
                } else {
                    this.log('Teardown', 'FAIL', 'Logout fehlgeschlagen', error);
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
        return date.toISOString().slice(0, 16).replace('T', ' '); // Format: YYYY-MM-DD HH:MM
    }

    /**
     * Hilfsfunktion: Wartet kurz zwischen Tests
     */
    async wait(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========== Test Cases ==========

    /**
     * Test 1: Reservierungsliste abrufen
     */
    async testGetReservationList() {
        const testName = 'getReservationList';
        try {
            const result = await this.api.getReservationList();
            
            // Die API gibt entweder ein Array oder nur {httpstatuscode: 200} zurück
            if (result && result.httpstatuscode === 200) {
                // Leere Liste ist auch ein Erfolg
                const reservations = Array.isArray(result) ? result : [];
                this.log(testName, 'PASS', `${reservations.length} Reservierungen gefunden`, { count: reservations.length });
                return reservations;
            } else {
                this.log(testName, 'FAIL', 'Ungültige API-Antwort', result);
                return null;
            }
        } catch (error) {
            this.log(testName, 'FAIL', 'Fehler beim Abrufen der Reservierungsliste', error);
            return null;
        }
    }

    /**
     * Test 2: Neue Reservierung erstellen
     */
    async testAddReservation() {
        const testName = 'addReservation';
        this.log(testName, 'SKIP', 'API unterstützt derzeit nur Lese-Operationen (siehe Dokumentation 6.1)');
        return null;
        
        // Implementierung vorhanden für zukünftige API-Versionen:
        /*
        const callsign = process.env.TEST_AIRCRAFT_CALLSIGN || 'D-KXXX';
        const dateFrom = this.getFutureDate(7, 10);
        const dateTo = this.getFutureDate(7, 12);
        const comment = 'Automatischer Test - Kann gelöscht werden';

        try {
            const result = await this.api.addReservation(callsign, dateFrom, dateTo, {
                comment: comment
            });
            
            if (result && result.reservationId) {
                this.createdReservationIds.push(result.reservationId);
                this.log(testName, 'PASS', 'Reservierung erfolgreich erstellt', {
                    id: result.reservationId,
                    callsign: callsign,
                    from: dateFrom,
                    to: dateTo
                });
                return result;
            }
        } catch (error) {
            this.log(testName, 'FAIL', 'Fehler beim Erstellen der Reservierung', error);
            return null;
        }
        */
    }

    /**
     * Test 3: Reservierung abrufen
     */
    async testGetReservation(reservationId) {
        const testName = 'getReservation';
        this.log(testName, 'SKIP', 'API unterstützt derzeit nur Lese-Operationen (siehe Dokumentation 6.1)');
        return null;
        
        // Implementierung vorhanden für zukünftige API-Versionen
    }

    /**
     * Test 4: Reservierung bearbeiten
     */
    async testEditReservation(reservationId) {
        const testName = 'editReservation';
        this.log(testName, 'SKIP', 'API unterstützt derzeit nur Lese-Operationen (siehe Dokumentation 6.1)');
        return null;
        
        // Implementierung vorhanden für zukünftige API-Versionen
        /*
        if (!reservationId) {
            this.log(testName, 'SKIP', 'Keine Reservierungs-ID zum Testen vorhanden');
            return null;
        }

        const newComment = 'Bearbeiteter Test-Kommentar - ' + new Date().toISOString();

        try {
            const result = await this.api.editReservation(reservationId, {
                comment: newComment
            });
            
            if (result) {
                this.log(testName, 'PASS', 'Reservierung erfolgreich bearbeitet', {
                    id: reservationId,
                    newComment: newComment
                });
                return result;
            } else {
                this.log(testName, 'FAIL', 'Keine Bestätigung erhalten', result);
                return null;
            }
        } catch (error) {
            this.log(testName, 'FAIL', 'Fehler beim Bearbeiten der Reservierung', error);
            return null;
        }
        */
    }

    /**
     * Test 5: Reservierung löschen
     */
    async testDeleteReservation(reservationId) {
        const testName = 'deleteReservation';
        this.log(testName, 'SKIP', 'API unterstützt derzeit nur Lese-Operationen (siehe Dokumentation 6.1)');
        return null;
        
        // Implementierung vorhanden für zukünftige API-Versionen
        /*
        if (!reservationId) {
            this.log(testName, 'SKIP', 'Keine Reservierungs-ID zum Testen vorhanden');
            return false;
        }

        try {
            const result = await this.api.deleteReservation(reservationId);
            
            // Entferne aus der Cleanup-Liste, da bereits gelöscht
            const index = this.createdReservationIds.indexOf(reservationId);
            if (index > -1) {
                this.createdReservationIds.splice(index, 1);
            }
            
            this.log(testName, 'PASS', 'Reservierung erfolgreich gelöscht', { id: reservationId });
            return true;
        } catch (error) {
            this.log(testName, 'FAIL', 'Fehler beim Löschen der Reservierung', error);
            return false;
        }
        */
    }

    /**
     * Test 6: Fehlerbehandlung - Ungültige Parameter
     */
    async testErrorHandling() {
        const testName = 'errorHandling';
        let errorsCaught = 0;

        // Test 1: Fehlende Callsign (Client-seitige Validierung)
        try {
            await this.api.addReservation('', this.getFutureDate(), this.getFutureDate(1));
            this.log(testName, 'FAIL', 'Exception für fehlende Callsign wurde nicht geworfen');
        } catch (error) {
            errorsCaught++;
            this.log(testName, 'PASS', 'Client-seitige Validierung für fehlende Callsign funktioniert');
        }

        // Test 2: Fehlende Datumsangaben (Client-seitige Validierung)
        try {
            await this.api.addReservation('D-KXXX', '', '');
            this.log(testName, 'FAIL', 'Exception für fehlende Datumsangaben wurde nicht geworfen');
        } catch (error) {
            errorsCaught++;
            this.log(testName, 'PASS', 'Client-seitige Validierung für fehlende Datumsangaben funktioniert');
        }

        return errorsCaught >= 2; // Mindestens 2 Fehler sollten abgefangen werden
    }

    /**
     * Führt die komplette Test-Suite aus
     */
    async runAllTests() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║  Vereinsflieger API - Reservierungs-Test-Suite          ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const startTime = Date.now();

        // Setup
        const setupSuccess = await this.setup();
        if (!setupSuccess) {
            console.log('\n❌ Setup fehlgeschlagen. Tests werden abgebrochen.');
            return this.generateReport();
        }

        await this.wait();

        // Test 1: Liste abrufen
        console.log('\n========== Test 1: Reservierungsliste ==========');
        await this.testGetReservationList();
        await this.wait();

        // Test 2: Neue Reservierung erstellen
        console.log('\n========== Test 2: Reservierung erstellen ==========');
        const newReservation = await this.testAddReservation();
        const reservationId = newReservation?.reservationId;
        await this.wait();

        // Test 3: Reservierung abrufen
        console.log('\n========== Test 3: Reservierung abrufen ==========');
        await this.testGetReservation(reservationId);
        await this.wait();

        // Test 4: Reservierung bearbeiten
        console.log('\n========== Test 4: Reservierung bearbeiten ==========');
        await this.testEditReservation(reservationId);
        await this.wait();

        // Test 5: Fehlerbehandlung
        console.log('\n========== Test 5: Fehlerbehandlung ==========');
        await this.testErrorHandling();
        await this.wait();

        // Test 6: Reservierung löschen
        console.log('\n========== Test 6: Reservierung löschen ==========');
        await this.testDeleteReservation(reservationId);
        await this.wait();

        // Teardown
        await this.teardown();

        // Report
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        return this.generateReport(duration);
    }

    /**
     * Generiert einen Test-Report
     */
    generateReport(duration = 0) {
        console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
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
        console.log(`Dauer:        ${duration}s`);

        if (failed > 0) {
            console.log('\n--- Fehlerhafte Tests ---');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => {
                    console.log(`  ✗ ${r.test}: ${r.message}`);
                });
        }

        console.log('\n' + '═'.repeat(61));
        console.log(`Ergebnis: ${failed === 0 ? '✓ ALLE TESTS BESTANDEN' : '✗ TESTS FEHLGESCHLAGEN'}`);
        console.log('═'.repeat(61) + '\n');

        return {
            total,
            passed,
            failed,
            skipped,
            duration,
            success: failed === 0,
            results: this.testResults
        };
    }

    /**
     * Führt nur ausgewählte Tests aus
     */
    async runSelectedTests(testNames = []) {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║  Vereinsflieger API - Selektive Tests                   ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const startTime = Date.now();
        const setupSuccess = await this.setup();
        
        if (!setupSuccess) {
            console.log('\n❌ Setup fehlgeschlagen. Tests werden abgebrochen.');
            return this.generateReport();
        }

        for (const testName of testNames) {
            console.log(`\n========== Test: ${testName} ==========`);
            
            switch (testName) {
                case 'list':
                    await this.testGetReservationList();
                    break;
                case 'add':
                    await this.testAddReservation();
                    break;
                case 'get':
                    // Benötigt eine Reservierung
                    const res = await this.testAddReservation();
                    if (res) await this.testGetReservation(res.reservationId);
                    break;
                case 'edit':
                    // Benötigt eine Reservierung
                    const res2 = await this.testAddReservation();
                    if (res2) await this.testEditReservation(res2.reservationId);
                    break;
                case 'delete':
                    // Benötigt eine Reservierung
                    const res3 = await this.testAddReservation();
                    if (res3) await this.testDeleteReservation(res3.reservationId);
                    break;
                case 'errors':
                    await this.testErrorHandling();
                    break;
                default:
                    this.log('Unknown Test', 'SKIP', `Test '${testName}' nicht gefunden`);
            }
            
            await this.wait();
        }

        await this.teardown();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        return this.generateReport(duration);
    }
}

// ========== Hauptprogramm ==========

async function main() {
    // Prüfe, ob Umgebungsvariablen gesetzt sind
    if (!process.env.VEREINSFLIEGER_APPKEY || 
        !process.env.VEREINSFLIEGER_USERNAME || 
        !process.env.VEREINSFLIEGER_PASSWORD) {
        console.error('❌ Fehler: Erforderliche Umgebungsvariablen nicht gesetzt!');
        console.error('Bitte setzen Sie folgende Variablen in Ihrer .env Datei:');
        console.error('  - VEREINSFLIEGER_APPKEY');
        console.error('  - VEREINSFLIEGER_USERNAME');
        console.error('  - VEREINSFLIEGER_PASSWORD');
        console.error('  - TEST_AIRCRAFT_CALLSIGN (optional)');
        process.exit(1);
    }

    const testSuite = new ReservationTestSuite();
    
    // Kommandozeilen-Argumente auswerten
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--test') {
        // Selektive Tests: node test-reservation.js --test list add edit
        const selectedTests = args.slice(1);
        await testSuite.runSelectedTests(selectedTests);
    } else {
        // Alle Tests ausführen
        await testSuite.runAllTests();
    }
}

// Programm ausführen
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Unerwarteter Fehler:', error);
        process.exit(1);
    });
}

// Exportiere die Testklasse für Wiederverwendung
module.exports = { ReservationTestSuite };
