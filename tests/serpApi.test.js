const { normalizeOrganicResults } = require('../src/services/serpApi');

describe('normalizeOrganicResults', () => {
    it('filters invalid items and normalizes fields', () => {
        const input = [
            { position: 1, title: 'Result A', link: 'https://a.com', snippet: 'A snippet' },
            { position: 2, title: '', link: 'https://b.com', snippet: 'Missing title -> should be filtered' },
            { position: 3, title: 'Missing link -> filtered', snippet: 'x' },
            null,
            { title: 'Result C', link: 'https://c.com' } // no position/snippet
        ];

        const output = normalizeOrganicResults(input);

        expect(output).toHaveLength(2);

        expect(output[0]).toEqual({
            position: 1,
            title: 'Result A',
            url: 'https://a.com',
            snippet: 'A snippet'
        });

        expect(output[1]).toEqual({
            position: 2, // fallback index+1 after filtering/map order
            title: 'Result C',
            url: 'https://c.com',
            snippet: ''
        });
    });

    it('returns empty array for non-array/empty input default', () => {
        expect(normalizeOrganicResults()).toEqual([]);
        expect(normalizeOrganicResults([])).toEqual([]);
    });

    it('trims text fields', () => {
        const input = [
            {
                position: 5,
                title: '   Hello World   ',
                link: '   https://example.com   ',
                snippet: '   some text   '
            }
        ];

        const output = normalizeOrganicResults(input);

        expect(output[0]).toEqual({
            position: 5,
            title: 'Hello World',
            url: 'https://example.com',
            snippet: 'some text'
        });
    });
});