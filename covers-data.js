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
        title: "Magazine Issue #1",
        description: "A bold exploration of color and form. This is the special 100th Anniversary Edition cover number 1."
    },
    // Add covers 2-100 here following the same format
    // Example for cover 2:
    // {
    //     id: 1,
    //     lowRes: "assets/covers/low/cover_02.jpg",
    //     highRes: "assets/covers/high/cover_02.jpg",
    //     title: "Magazine Issue #2",
    //     description: "Celebrating our rich history and heritage. This is the special 100th Anniversary Edition cover number 2."
    // },
];

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COVERS_DATA;
}
