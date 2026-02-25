(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node / Vitest
        module.exports = factory();
    } else {
        // Browser
        root.csvUtils = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function escapeCsvValue(value) {
        const str = String(value ?? '');
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
    }

    function toCsv(rows = []) {
        const header = ['position', 'title', 'url', 'snippet'];
        const safeRows = Array.isArray(rows) ? rows : [];

        const lines = [
            header.join(','),
            ...safeRows.map((row) =>
                [
                    row?.position ?? '',
                    row?.title ?? '',
                    row?.url ?? '',
                    row?.snippet ?? ''
                ]
                    .map(escapeCsvValue)
                    .join(',')
            )
        ];

        return lines.join('\n');
    }

    return {
        escapeCsvValue,
        toCsv
    };
});