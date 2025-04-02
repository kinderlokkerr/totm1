// Hoofdvariabelen
const canvas = document.getElementById('spelCanvas');
const ctx = canvas.getContext('2d');
const TEGEL_GROOTTE = 40;
const SPELER_GROOTTE = 30;
const VIJAND_GROOTTE = 30;

// Spelstatus
let speler = { x: 1, y: 1 };
let vijanden = [];
let doolhof = [];
let score = 0;
let spelActief = false;

// Kleuren
const KLEUREN = {
    MUUR: '#2c3e50',
    PAD: '#34495e',
    SPELER: '#f1c40f',
    VIJAND: '#e74c3c',
    DOEL: '#2ecc71',
    TEKST: '#ecf0f1'
};

// Initialisatie
function init() {
    canvas.width = 800;
    canvas.height = 600;
    genereerDoolhof(20, 15);
    plaatsVijanden(5);
    plaatsDoel();
    spelActief = true;
    requestAnimationFrame(spelLoop);
}

// Doolhofgeneratie (Recursive Backtracking)
function genereerDoolhof(bredte, hoogte) {
    // Initialiseer doolhof met muren
    doolhof = Array(hoogte).fill().map(() => Array(bredte).fill(1));
    
    // Startpositie voor generatie
    let x = 1;
    let y = 1;
    doolhof[y][x] = 0;
    
    // Recursieve functie
    function graven(x, y) {
        const richtingen = ['noord', 'oost', 'zuid', 'west'];
        // Schud de richtingen voor willekeurigheid
        richtingen.sort(() => Math.random() - 0.5);
        
        for (const richting of richtingen) {
            let nx = x, ny = y;
            
            switch (richting) {
                case 'noord': ny = y - 2; break;
                case 'oost': nx = x + 2; break;
                case 'zuid': ny = y + 2; break;
                case 'west': nx = x - 2; break;
            }
            
            // Controleer of nieuwe positie binnen grenzen is en nog muur is
            if (nx > 0 && nx < bredte - 1 && ny > 0 && ny < hoogte - 1 && doolhof[ny][nx] === 1) {
                // Verwijder muur tussen huidige en nieuwe cel
                doolhof[ny][nx] = 0;
                doolhof[y + (ny - y) / 2][x + (nx - x) / 2] = 0;
                
                // Ga verder vanaf nieuwe positie
                graven(nx, ny);
            }
        }
    }
    
    graven(x, y);
    
    // Zet speler op startpositie
    speler.x = 1;
    speler.y = 1;
}

// Plaats vijanden in het doolhof
function plaatsVijanden(aantal) {
    vijanden = [];
    for (let i = 0; i < aantal; i++) {
        let x, y;
        // Zoek een willekeurig pad dat geen muur is
        do {
            x = Math.floor(Math.random() * doolhof[0].length);
            y = Math.floor(Math.random() * doolhof.length);
        } while (doolhof[y][x] === 1 || (x === speler.x && y === speler.y));
        
        vijanden.push({
            x: x,
            y: y,
            richting: Math.random() < 0.5 ? 'horizontaal' : 'verticaal',
            beweging: Math.random() < 0.5 ? 1 : -1
        });
    }
}

// Plaats doel (einde van het level)
function plaatsDoel() {
    let x, y;
    // Zoek een positie ver van de speler
    do {
        x = Math.floor(Math.random() * doolhof[0].length);
        y = Math.floor(Math.random() * doolhof.length);
    } while (doolhof[y][x] === 1 || (Math.abs(x - speler.x) + Math.abs(y - speler.y)) < 10);
    
    doolhof[y][x] = 2; // 2 staat voor doel
}

// Beweging van vijanden
function beweegVijanden() {
    for (let vijand of vijanden) {
        // Beweeg vijand volgens zijn richting
        if (vijand.richting === 'horizontaal') {
            const nieuweX = vijand.x + vijand.beweging;
            if (doolhof[vijand.y][nieuweX] !== 1) {
                vijand.x = nieuweX;
            } else {
                vijand.beweging *= -1; // Keer om
            }
        } else { // verticaal
            const nieuweY = vijand.y + vijand.beweging;
            if (doolhof[nieuweY][vijand.x] !== 1) {
                vijand.y = nieuweY;
            } else {
                vijand.beweging *= -1; // Keer om
            }
        }
    }
}

// Spelbesturing
document.addEventListener('keydown', (e) => {
    if (!spelActief) return;
    
    let nieuweX = speler.x;
    let nieuweY = speler.y;
    
    switch (e.key) {
        case 'ArrowUp': nieuweY--; break;
        case 'ArrowRight': nieuweX++; break;
        case 'ArrowDown': nieuweY++; break;
        case 'ArrowLeft': nieuweX--; break;
    }
    
    // Controleer of nieuwe positie geldig is
    if (doolhof[nieuweY] && doolhof[nieuweY][nieuweX] !== 1) {
        speler.x = nieuweX;
        speler.y = nieuweY;
        score++;
        
        // Controleer of speler het doel heeft bereikt
        if (doolhof[nieuweY][nieuweX] === 2) {
            alert(`Gefeliciteerd! Je hebt het level voltooid met ${score} stappen.`);
            init(); // Start nieuw level
        }
        
        // Controleer botsing met vijanden
        for (let vijand of vijanden) {
            if (vijand.x === speler.x && vijand.y === speler.y) {
                spelActief = false;
                alert(`Game Over! Je score was: ${score}`);
                break;
            }
        }
    }
});

// Tekenfuncties
function tekenDoolhof() {
    for (let y = 0; y < doolhof.length; y++) {
        for (let x = 0; x < doolhof[y].length; x++) {
            ctx.fillStyle = doolhof[y][x] === 1 ? KLEUREN.MUUR : 
                           doolhof[y][x] === 2 ? KLEUREN.DOEL : 
                           KLEUREN.PAD;
            ctx.fillRect(x * TEGEL_GROOTTE, y * TEGEL_GROOTTE, TEGEL_GROOTTE, TEGEL_GROOTTE);
        }
    }
}

function tekenSpeler() {
    ctx.fillStyle = KLEUREN.SPELER;
    ctx.beginPath();
    ctx.arc(
        speler.x * TEGEL_GROOTTE + TEGEL_GROOTTE / 2,
        speler.y * TEGEL_GROOTTE + TEGEL_GROOTTE / 2,
        SPELER_GROOTTE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function tekenVijanden() {
    ctx.fillStyle = KLEUREN.VIJAND;
    for (let vijand of vijanden) {
        ctx.beginPath();
        ctx.arc(
            vijand.x * TEGEL_GROOTTE + TEGEL_GROOTTE / 2,
            vijand.y * TEGEL_GROOTTE + TEGEL_GROOTTE / 2,
            VIJAND_GROOTTE / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function tekenScore() {
    ctx.fillStyle = KLEUREN.TEKST;
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// Hoofdspellus
function spelLoop() {
    if (!spelActief) return;
    
    beweegVijanden();
    
    // Wis canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Teken alles
    tekenDoolhof();
    tekenVijanden();
    tekenSpeler();
    tekenScore();
    
    requestAnimationFrame(spelLoop);
}

// Start het spel
init();