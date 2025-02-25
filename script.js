// Globální proměnné pro sledování stavu
let pixelsSold = 0;
let moneyEarned = 0;
let selectedPixels = new Set();
let advertisements = new Map();
let isSelecting = true;

// Inicializace mřížky
function initializeGrid() {
    const grid = document.getElementById('pixel-grid');
    for (let i = 0; i < 10000; i++) { // 100x100 bloků po 10x10 pixelech
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.dataset.id = i;
        pixel.addEventListener('mousedown', startSelection);
        pixel.addEventListener('mouseover', handleMouseOver);
        pixel.addEventListener('click', handlePixelClick);
        grid.appendChild(pixel);
    }
}

// Funkce pro začátek výběru
function startSelection(event) {
    if (!isSelecting) return;
    const pixel = event.target;
    if (advertisements.has(pixel.dataset.id)) return;

    if (event.buttons === 1) { // Levé tlačítko myši
        if (!pixel.style.backgroundColor) {
            pixel.style.backgroundColor = '#4CAF50';
            selectedPixels.add(pixel.dataset.id);
        } else {
            pixel.style.backgroundColor = '';
            selectedPixels.delete(pixel.dataset.id);
        }
        updateSelectionInfo();
    }
}

// Funkce pro tažení myší
function handleMouseOver(event) {
    if (!isSelecting) return;
    if (event.buttons === 1) { // Pokud je stisknuto levé tlačítko
        const pixel = event.target;
        if (advertisements.has(pixel.dataset.id)) return;

        if (!pixel.style.backgroundColor) {
            pixel.style.backgroundColor = '#4CAF50';
            selectedPixels.add(pixel.dataset.id);
        }
        updateSelectionInfo();
    }
}

// Aktualizace informací o výběru
function updateSelectionInfo() {
    const count = selectedPixels.size;
    document.getElementById('selected-count').textContent = count;
    document.getElementById('selected-price').textContent = count;
}

// Obsluha kliknutí na pixel
function handlePixelClick(event) {
    const pixel = event.target;
    const pixelId = pixel.dataset.id;

    if (advertisements.has(pixelId)) {
        const ad = advertisements.get(pixelId);
        window.open(ad.url, '_blank');
    }
}

// Přepínání módů
document.getElementById('select-mode').addEventListener('click', function() {
    isSelecting = true;
    this.classList.add('active');
    document.getElementById('clear-mode').classList.remove('active');
});

document.getElementById('clear-mode').addEventListener('click', function() {
    isSelecting = false;
    this.classList.add('active');
    document.getElementById('select-mode').classList.remove('active');
    clearSelection();
});

// Vymazání výběru
function clearSelection() {
    selectedPixels.forEach(pixelId => {
        const pixel = document.querySelector(`[data-id="${pixelId}"]`);
        if (pixel && !advertisements.has(pixelId)) {
            pixel.style.backgroundColor = '';
        }
    });
    selectedPixels.clear();
    updateSelectionInfo();
}

// Aktualizace statistik
function updateStats() {
    document.getElementById('pixels-sold').textContent = `${pixelsSold} / 1,000,000`;
    document.getElementById('money-earned').textContent = `$${moneyEarned}`;
    document.getElementById('pixels-remaining').textContent = 1000000 - pixelsSold;
}

// Obsluha formuláře pro nákup
document.getElementById('ad-form').addEventListener('submit', function(event) {
    event.preventDefault();

    if (selectedPixels.size === 0) {
        alert('Nejprve vyberte pixely, které chcete koupit!');
        return;
    }

    const url = document.getElementById('url').value;
    const imageFile = document.getElementById('image').files[0];

    if (!imageFile) {
        alert('Vyberte prosím obrázek!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const selectedPixelsArray = Array.from(selectedPixels);
        const color = '#' + Math.floor(Math.random()*16777215).toString(16);
        
        // Uložení reklamy
        selectedPixelsArray.forEach(pixelId => {
            const pixel = document.querySelector(`[data-id="${pixelId}"]`);
            pixel.style.backgroundColor = 'rgba(0,0,0,0.3)';
            advertisements.set(pixelId, { url, image: e.target.result });
        });

        // Zobrazení obrázku
        const backgroundImage = document.getElementById('background-image');
        backgroundImage.src = e.target.result;
        backgroundImage.style.display = 'block';

        // Aktualizace statistik
        pixelsSold += selectedPixels.size;
        moneyEarned += selectedPixels.size;
        selectedPixels.clear();
        updateStats();
        updateSelectionInfo();

        // Reset formuláře
        event.target.reset();
        alert('Reklama byla úspěšně přidána!');
    };

    reader.readAsDataURL(imageFile);
});

// Inicializace při načtení stránky
window.addEventListener('load', () => {
    initializeGrid();
    updateStats();
    updateSelectionInfo();

    // Zabránění výběru textu při tažení myší
    document.addEventListener('selectstart', function(e) {
        if (e.target.classList.contains('pixel')) {
            e.preventDefault();
        }
    });
}); 