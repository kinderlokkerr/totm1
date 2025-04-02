// Globale variabelen
let speler;
let vijanden = [];
let doolhof = [];
let tegelGrootte = 40;
let score = 0;
let spelActief = false;
let doelPositie;

// Kleuren
const kleuren = {
  muur: '#2c3e50',
  pad: '#34495e',
  speler: '#f1c40f',
  vijand: '#e74c3c',
  doel: '#2ecc71',
  tekst: '#ecf0f1'
};

// Doolhof afmetingen
const doolhofBreedte = 20;
const doolhofHoogte = 15;

function setup() {
  createCanvas(800, 600);
  initialiseerSpel();
}

function initialiseerSpel() {
  // Initialiseer speler
  speler = {
    x: 1,
    y: 1,
    grootte: 30
  };
  
  // Genereer doolhof
  genereerDoolhof(doolhofBreedte, doolhofHoogte);
  
  // Plaats vijanden
  plaatsVijanden(5);
  
  // Plaats doel
  plaatsDoel();
  
  // Reset score
  score = 0;
  
  // Start spel
  spelActief = true;
}

function genereerDoolhof(breedte, hoogte) {
  // Initialiseer doolhof met muren
  doolhof = Array(hoogte).fill().map(() => Array(breedte).fill(1));
  
  // Startpositie voor generatie
  let x = 1;
  let y = 1;
  doolhof[y][x] = 0;
  
  // Recursieve functie om doolhof te graven
  function graven(x, y) {
    const richtingen = ['noord', 'oost', 'zuid', 'west'];
    // Schud de richtingen voor willekeurigheid
    shuffle(richtingen, true);
    
    for (const richting of richtingen) {
      let nx = x, ny = y;
      
      switch (richting) {
        case 'noord': ny = y - 2; break;
        case 'oost': nx = x + 2; break;
        case 'zuid': ny = y + 2; break;
        case 'west': nx = x - 2; break;
      }
      
      // Controleer of nieuwe positie binnen grenzen is en nog muur is
      if (nx > 0 && nx < breedte - 1 && ny > 0 && ny < hoogte - 1 && doolhof[ny][nx] === 1) {
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

function plaatsVijanden(aantal) {
  vijanden = [];
  for (let i = 0; i < aantal; i++) {
    let x, y;
    // Zoek een willekeurig pad dat geen muur is
    do {
      x = floor(random(1, doolhof[0].length - 1));
      y = floor(random(1, doolhof.length - 1));
    } while (doolhof[y][x] === 1 || (x === speler.x && y === speler.y));
    
    vijanden.push({
      x: x,
      y: y,
      richting: random(['horizontaal', 'verticaal']),
      beweging: random([-1, 1]),
      grootte: 30
    });
  }
}

function plaatsDoel() {
  let x, y;
  // Zoek een positie ver van de speler
  do {
    x = floor(random(1, doolhof[0].length - 1));
    y = floor(random(1, doolhof.length - 1));
  } while (doolhof[y][x] === 1 || (abs(x - speler.x) + abs(y - speler.y)) < 10);
  
  doelPositie = { x: x, y: y };
}

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

function keyPressed() {
  if (!spelActief) return;
  
  let nieuweX = speler.x;
  let nieuweY = speler.y;
  
  switch (keyCode) {
    case UP_ARROW: nieuweY--; break;
    case RIGHT_ARROW: nieuweX++; break;
    case DOWN_ARROW: nieuweY++; break;
    case LEFT_ARROW: nieuweX--; break;
  }
  
  // Controleer of nieuwe positie geldig is
  if (doolhof[nieuweY] && doolhof[nieuweY][nieuweX] !== 1) {
    speler.x = nieuweX;
    speler.y = nieuweY;
    score++;
    
    // Controleer of speler het doel heeft bereikt
    if (nieuweX === doelPositie.x && nieuweY === doelPositie.y) {
      spelActief = false;
      setTimeout(() => {
        alert(`Gefeliciteerd! Je hebt het level voltooid met ${score} stappen.`);
        initialiseerSpel(); // Start nieuw level
      }, 100);
    }
    
    // Controleer botsing met vijanden
    for (let vijand of vijanden) {
      if (vijand.x === speler.x && vijand.y === speler.y) {
        spelActief = false;
        setTimeout(() => {
          alert(`Game Over! Je score was: ${score}`);
          initialiseerSpel();
        }, 100);
        break;
      }
    }
  }
}

function draw() {
  if (!spelActief) return;
  
  beweegVijanden();
  
  // Wis canvas
  background(0);
  
  // Teken doolhof
  tekenDoolhof();
  
  // Teken doel
  tekenDoel();
  
  // Teken vijanden
  tekenVijanden();
  
  // Teken speler
  tekenSpeler();
  
  // Teken score
  tekenScore();
}

function tekenDoolhof() {
  for (let y = 0; y < doolhof.length; y++) {
    for (let x = 0; x < doolhof[y].length; x++) {
      if (doolhof[y][x] === 1) {
        fill(kleuren.muur);
      } else {
        fill(kleuren.pad);
      }
      rect(x * tegelGrootte, y * tegelGrootte, tegelGrootte, tegelGrootte);
    }
  }
}

function tekenDoel() {
  fill(kleuren.doel);
  ellipse(
    doelPositie.x * tegelGrootte + tegelGrootte / 2,
    doelPositie.y * tegelGrootte + tegelGrootte / 2,
    speler.grootte
  );
}

function tekenVijanden() {
  fill(kleuren.vijand);
  for (let vijand of vijanden) {
    ellipse(
      vijand.x * tegelGrootte + tegelGrootte / 2,
      vijand.y * tegelGrootte + tegelGrootte / 2,
      vijand.grootte
    );
  }
}

function tekenSpeler() {
  fill(kleuren.speler);
  ellipse(
    speler.x * tegelGrootte + tegelGrootte / 2,
    speler.y * tegelGrootte + tegelGrootte / 2,
    speler.grootte
  );
}

function tekenScore() {
  fill(kleuren.tekst);
  textSize(20);
  text(`Score: ${score}`, 20, 30);
}