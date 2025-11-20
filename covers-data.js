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
    },
    {
        id: 1,
        lowRes: "assets/covers/low/cover_02.jpg",
        highRes: "assets/covers/high/cover_02.jpg",
        title: "Magazine Issue #2",
        description: "Celebrating our rich history and heritage."
    },
    {
        id: 2,
        lowRes: "assets/covers/low/cover_03.jpg",
        highRes: "assets/covers/high/cover_03.jpg",
        title: "Magazine Issue #3",
        description: "Innovation and excellence in every page."
    },
    {
        id: 3,
        lowRes: "assets/covers/low/cover_04.jpg",
        highRes: "assets/covers/high/cover_04.jpg",
        title: "Magazine Issue #4",
        description: "A journey through time and achievement."
    }
    // Add covers 5-100 here following the same format
];

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COVERS_DATA;
}
