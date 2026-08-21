require('dotenv').config();
const vereinsfliegerapi = require('./vereinsflieger_nodejs_api');

/**
 * Test Suite für Flugzeugreservierungs-Funktionalität
 * 
 * HINWEIS: Die Vereinsflieger API unterstützt nur Lese-Operationen für Reservierungen.
 * Siehe Dokumentation Kapitel 6.1: Nur "Aktuelle Reservierungen auslesen" ist verfügbar.
 * 
 * Getestete Funktionen:
 * - getReservationList() - Aktuelle Reservierungen abrufen
 */
class ReservationTestSuite {
    constructor() {
        this.api = new vereinsfliegerapi.VereinsfliegerAPI(process.env.VEREINSFLIEGER_APPKEY);
        this.testResults = [];
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
            test: testName,
            status: status, // 'PASS', 'FAIL', 'INFO'
            message: message,
            timestamp: new Date().toISOString(),
            data: safeData
        };
        this.testResults.push(result);
        
        const statusSymbol = {
            'PASS': '✓',
            'FAIL': '✗',
            'INFO': 'ℹ'
        }[status] || '?';
        
        console.log(`[${statusSymbol}] ${testName}: ${message}`);
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
     * Setup: Authentifizierung und Vorbereitung
     */
    async setup() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║  Vereinsflieger API - Reservierungs-Test-Suite          ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        console.log('========== Test Setup ==========');
        try {
            await this.api.signIn(
                process.env.VEREINSFLIEGER_USERNAME,
                process.env.VEREINSFLIEGER_PASSWORD
            );
            this.isAuthenticated = true;
            this.log('Setup', 'PASS', 'Authentifizierung erfolgreich');
            
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
     * Teardown: Logout
     */
    async teardown() {
        console.log('\n========== Test Teardown ==========');
        
        if (this.isAuthenticated) {
            try {
                await this.api.signOut();
                this.log('Teardown', 'PASS', 'Logout erfolgreich');
            } catch (error) {
                if (error.message && error.message.includes('not valid JSON')) {
                    this.log('Teardown', 'INFO', 'Logout abgeschlossen (API gab HTML statt JSON zurück - bekanntes Problem)');
                } else {
                    this.log('Teardown', 'FAIL', 'Logout fehlgeschlagen', error);
                }
            }
        }
    }

    /**
     * Hilfsfunktion: Wartet kurz zwischen Tests
     */
    async wait(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test: Reservierungsliste abrufen
     */
    async testGetReservationList() {
        const testName = 'getReservationList';
        
        try {
            const result = await this.api.getReservationList();
            
            if (result && result.httpstatuscode === 200) {
                const count = Array.isArray(result) ? result.length : 0;
                this.log(testName, 'PASS', `${count} Reservierungen gefunden`, { count });
                return result;
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
     * Führt alle Tests aus
     */
    async runAllTests() {
        const startTime = Date.now();

        // Setup
        const setupSuccess = await this.setup();
        if (!setupSuccess) {
            console.log('\n❌ Setup fehlgeschlagen. Tests werden abgebrochen.');
            return this.generateReport();
        }

        await this.wait();

        // Test: Liste abrufen
        console.log('\n========== Test: Reservierungsliste ==========');
        await this.testGetReservationList();

        // Teardown
        await this.teardown();

        // Report
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        return this.generateReport(duration);
    }

    /**
     * Generiert einen Abschlussbericht
     */
    generateReport(duration = 0) {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                      TEST REPORT                         ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = passed + failed;

        console.log(`Gesamt:       ${total}`);
        console.log(`✓ Bestanden:  ${passed}`);
        console.log(`✗ Fehler:     ${failed}`);
        if (duration > 0) {
            console.log(`Dauer:        ${duration}s`);
        }

        if (failed > 0) {
            console.log('\n--- Fehlerhafte Tests ---');
            this.testResults.filter(r => r.status === 'FAIL').forEach(r => {
                console.log(`  ✗ ${r.test}: ${r.message}`);
            });
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        if (failed === 0) {
            console.log('Ergebnis: ✓ ALLE TESTS BESTANDEN');
        } else {
            console.log('Ergebnis: ✗ TESTS FEHLGESCHLAGEN');
        }
        console.log('═══════════════════════════════════════════════════════════\n');
    }
}

// Hauptprogramm
async function main() {
    const suite = new ReservationTestSuite();
    await suite.runAllTests();
}

main().catch(console.error);
