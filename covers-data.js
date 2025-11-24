// Magazine Cover Data
// Each cover should have:
// - id: 0-99
// - lowRes: path to low-resolution image for wall texture (e.g., "assets/covers/low/cover_01.jpg")
// - highRes: path to high-resolution image for overlay (e.g., "assets/covers/high/cover_01.jpg")
// - title: Title for the overlay
// - description: Description text for the overlay

const COVERS_DATA = [
    {
        id: 0,
        lowRes: "assets/covers/low/cover_01.jpg",
        highRes: "assets/covers/high/cover_01.jpg",
        title: "Die erste Ausgabe",
        description: "1926 startet die Vorgängerzeitschrift der WirtschaftsWoche in Berlin."
    }
];

// Generate entries for Cover 2 to Cover 42
for (let i = 1; i < 42; i++) {
    const num = (i + 1).toString().padStart(2, '0');
    COVERS_DATA.push({
        id: i,
        lowRes: `assets/covers/low/cover_${num}.jpg`,
        highRes: `assets/covers/high/cover_${num}.jpg`,
        title: `Magazine Issue #${i + 1}`,
        description: `Description for issue #${i + 1}`
    });
}

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COVERS_DATA;
}
