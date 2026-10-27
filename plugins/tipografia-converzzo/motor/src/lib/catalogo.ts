// Biblioteca de fuentes gratuitas (licencia OFL o Apache, uso comercial libre). Archivos en public/fonts.
// En el plan se pueden usar por id ("anton"), por nombre ("Bebas Neue") o por archivo ("Anton.ttf").
export type FuenteCat = { id: string; nombre: string; archivo: string; grupo: string; uso: string };

export const CATALOGO: FuenteCat[] = [
  // Impacto: titulares, ganchos, subtítulos fuertes
  { id: "anton", nombre: "Anton", archivo: "Anton.ttf", grupo: "Impacto", uso: "Titulares altos y condensados" },
  { id: "bebas-neue", nombre: "Bebas Neue", archivo: "BebasNeue.ttf", grupo: "Impacto", uso: "Mayúsculas limpias, muy legible" },
  { id: "montserrat", nombre: "Montserrat Black", archivo: "Montserrat-Black.ttf", grupo: "Impacto", uso: "Moderna y gruesa, todo terreno" },
  { id: "archivo-black", nombre: "Archivo Black", archivo: "ArchivoBlack.ttf", grupo: "Impacto", uso: "Gruesa y ancha, mucha presencia" },
  { id: "oswald", nombre: "Oswald", archivo: "Oswald.ttf", grupo: "Impacto", uso: "Condensada, estilo afiche" },
  { id: "league-gothic", nombre: "League Gothic", archivo: "LeagueGothic.ttf", grupo: "Impacto", uso: "Muy alta y estrecha, editorial" },
  { id: "barlow-condensed", nombre: "Barlow Condensed", archivo: "BarlowCondensed.ttf", grupo: "Impacto", uso: "Condensada deportiva" },
  // Modernas: subtítulos cómodos, marcas y tecnología
  { id: "inter", nombre: "Inter", archivo: "Inter.ttf", grupo: "Modernas", uso: "Neutra y muy legible" },
  { id: "inter-medium", nombre: "Inter Medium", archivo: "InterMedium.ttf", grupo: "Modernas", uso: "Inter más delgada, para estilos minimal" },
  { id: "poppins", nombre: "Poppins", archivo: "Poppins.ttf", grupo: "Modernas", uso: "Redonda y amigable" },
  { id: "poppins-medium", nombre: "Poppins Medium", archivo: "PoppinsMedium.ttf", grupo: "Modernas", uso: "Poppins más delgada" },
  { id: "dm-sans", nombre: "DM Sans", archivo: "DMSans.ttf", grupo: "Modernas", uso: "Geométrica y compacta" },
  { id: "manrope", nombre: "Manrope", archivo: "Manrope.ttf", grupo: "Modernas", uso: "Moderna, de startups" },
  { id: "space-grotesk", nombre: "Space Grotesk", archivo: "SpaceGrotesk.ttf", grupo: "Modernas", uso: "Tecnológica con carácter" },
  { id: "outfit", nombre: "Outfit", archivo: "Outfit.ttf", grupo: "Modernas", uso: "Geométrica y limpia" },
  { id: "sora", nombre: "Sora", archivo: "Sora.ttf", grupo: "Modernas", uso: "Ancha y moderna" },
  // Elegantes: belleza, moda, gastronomía, lujo
  { id: "playfair", nombre: "Playfair Display", archivo: "PlayfairDisplay.ttf", grupo: "Elegantes", uso: "Serif de revista" },
  { id: "playfair-italic", nombre: "Playfair Italic", archivo: "PlayfairDisplayItalic.ttf", grupo: "Elegantes", uso: "Cursiva elegante para resaltar" },
  { id: "dm-serif", nombre: "DM Serif Display", archivo: "DMSerifDisplay.ttf", grupo: "Elegantes", uso: "Serif con contraste alto" },
  { id: "cormorant", nombre: "Cormorant Garamond", archivo: "CormorantGaramond.ttf", grupo: "Elegantes", uso: "Clásica y delicada" },
  { id: "fraunces", nombre: "Fraunces", archivo: "Fraunces.ttf", grupo: "Elegantes", uso: "Serif suave y cálida" },
  { id: "bodoni", nombre: "Bodoni Moda", archivo: "BodoniModa.ttf", grupo: "Elegantes", uso: "Moda y lujo" },
  { id: "cinzel", nombre: "Cinzel", archivo: "Cinzel.ttf", grupo: "Elegantes", uso: "Mayúsculas romanas, premium" },
  { id: "italiana", nombre: "Italiana", archivo: "Italiana.ttf", grupo: "Elegantes", uso: "Fina y sofisticada" },
  // Manuscritas: notas, cercanía, belleza, comida
  { id: "caveat", nombre: "Caveat", archivo: "Caveat.ttf", grupo: "Manuscritas", uso: "Letra a mano natural" },
  { id: "pacifico", nombre: "Pacifico", archivo: "Pacifico.ttf", grupo: "Manuscritas", uso: "Script retro de surf" },
  { id: "dancing-script", nombre: "Dancing Script", archivo: "DancingScript.ttf", grupo: "Manuscritas", uso: "Cursiva alegre" },
  { id: "permanent-marker", nombre: "Permanent Marker", archivo: "PermanentMarker.ttf", grupo: "Manuscritas", uso: "Marcador grueso" },
  { id: "great-vibes", nombre: "Great Vibes", archivo: "GreatVibes.ttf", grupo: "Manuscritas", uso: "Caligrafía fina, bodas y belleza" },
  { id: "kalam", nombre: "Kalam", archivo: "Kalam.ttf", grupo: "Manuscritas", uso: "Apuntes de cuaderno" },
  { id: "shadows-into-light", nombre: "Shadows Into Light", archivo: "ShadowsIntoLight.ttf", grupo: "Manuscritas", uso: "Lápiz ligero" },
  // Divertidas: niños, comida, juegos, humor
  { id: "bangers", nombre: "Bangers", archivo: "Bangers.ttf", grupo: "Divertidas", uso: "Cómic" },
  { id: "luckiest-guy", nombre: "Luckiest Guy", archivo: "LuckiestGuy.ttf", grupo: "Divertidas", uso: "Gruesa y caricaturesca" },
  { id: "fredoka", nombre: "Fredoka", archivo: "Fredoka.ttf", grupo: "Divertidas", uso: "Redonda y tierna" },
  { id: "lilita-one", nombre: "Lilita One", archivo: "LilitaOne.ttf", grupo: "Divertidas", uso: "Gruesa y simpática" },
  { id: "chewy", nombre: "Chewy", archivo: "Chewy.ttf", grupo: "Divertidas", uso: "Blanda, tipo dulce" },
  { id: "bowlby-one", nombre: "Bowlby One", archivo: "BowlbyOne.ttf", grupo: "Divertidas", uso: "Extra gruesa, ideal para 3D" },
  // Retro y tech
  { id: "press-start", nombre: "Press Start 2P", archivo: "PressStart2P.ttf", grupo: "Retro y tech", uso: "Pixel de videojuego" },
  { id: "vt323", nombre: "VT323", archivo: "VT323.ttf", grupo: "Retro y tech", uso: "Terminal y máquina de escribir" },
  { id: "righteous", nombre: "Righteous", archivo: "Righteous.ttf", grupo: "Retro y tech", uso: "Retro de los 70" },
  { id: "monoton", nombre: "Monoton", archivo: "Monoton.ttf", grupo: "Retro y tech", uso: "Letreros de neón (solo títulos)" },
  { id: "orbitron", nombre: "Orbitron", archivo: "Orbitron.ttf", grupo: "Retro y tech", uso: "Futurista" },
  { id: "rubik-mono", nombre: "Rubik Mono One", archivo: "RubikMonoOne.ttf", grupo: "Retro y tech", uso: "Monoespaciada gruesa" },
];

const norm = (s: string) => s.toLowerCase().replace(/\.(ttf|otf|woff2?)$/, "").replace(/[^a-z0-9]/g, "");
// Convierte un id, nombre o archivo en el nombre del archivo dentro de public/fonts.
export const archivoFuente = (v: string): string => {
  const n = norm(v);
  const c = CATALOGO.find((x) => norm(x.id) === n || norm(x.nombre) === n || norm(x.archivo) === n);
  if (c) return c.archivo;
  return /\.(ttf|otf|woff2?)$/i.test(v) ? v : "Montserrat-Black.ttf";
};
