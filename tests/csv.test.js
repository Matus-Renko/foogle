const { toCsv, escapeCsvValue } = require('../public/csv-utils');

describe('CSV export utils', () => {
    describe('escapeCsvValue', () => {
        it('wraps values in quotes', () => {
            expect(escapeCsvValue('hello')).toBe('"hello"');
        });

        it('escapes inner double quotes', () => {
            expect(escapeCsvValue('he said "hi"')).toBe('"he said ""hi"""');
        });

        it('handles null/undefined as empty string', () => {
            expect(escapeCsvValue(null)).toBe('""');
            expect(escapeCsvValue(undefined)).toBe('""');
        });

        it('handles numbers', () => {
            expect(escapeCsvValue(123)).toBe('"123"');
        });
    });

    describe('toCsv', () => {
        it('returns header only for empty input', () => {
            const csv = toCsv([]);

            expect(csv).toBe('position,title,url,snippet');
        });

        it('returns header only for missing input', () => {
            const csv = toCsv();

            expect(csv).toBe('position,title,url,snippet');
        });

        it('creates CSV with expected columns and rows', () => {
            const rows = [
                {
                    position: 1,
                    title: 'Result A',
                    url: 'https://a.com',
                    snippet: 'Snippet A'
                },
                {
                    position: 2,
                    title: 'Result B',
                    url: 'https://b.com',
                    snippet: 'Snippet B'
                }
            ];

            const csv = toCsv(rows);
            const lines = csv.split('\n');

            expect(lines).toHaveLength(3); // header + 2 rows
            expect(lines[0]).toBe('position,title,url,snippet');
            expect(lines[1]).toBe('"1","Result A","https://a.com","Snippet A"');
            expect(lines[2]).toBe('"2","Result B","https://b.com","Snippet B"');
        });

        it('escapes quotes and preserves commas/newlines inside fields', () => {
            const rows = [
                {
                    position: 1,
                    title: 'A "quoted" title, with comma',
                    url: 'https://example.com',
                    snippet: 'Line 1\nLine 2'
                }
            ];

            const csv = toCsv(rows);

            expect(csv).toContain('"A ""quoted"" title, with comma"');
            expect(csv).toContain('"Line 1\nLine 2"');
        });

        it('fills missing fields with empty strings', () => {
            const rows = [
                {
                    position: 1,
                    title: 'Only title'
                    // url/snippet missing
                }
            ];

            const csv = toCsv(rows);
            const lines = csv.split('\n');

            expect(lines[1]).toBe('"1","Only title","",""');
        });

        it('handles non-array input safely', () => {
            const csv = toCsv('not-an-array');

            expect(csv).toBe('position,title,url,snippet');
        });
    });
});