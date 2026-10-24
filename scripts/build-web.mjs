// Genera la carpeta www/ (la web empaquetada para la APK) a partir de index.html.
// index.html NO se modifica: sigue funcionando igual como página web.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => join(raiz, ...p);

rmSync(r('www'), { recursive: true, force: true });
mkdirSync(r('www/vendor/fonts'), { recursive: true });

// --- Tailwind: CSS compilado en lugar del CDN ---
execFileSync(
  process.execPath,
  [r('node_modules/tailwindcss/lib/cli.js'),
   '-c', r('scripts/tailwind.config.cjs'),
   '-i', r('scripts/tailwind-input.css'),
   '-o', r('www/vendor/tailwind.css'),
   '--minify'],
  { stdio: 'inherit', cwd: raiz }
);

// --- Librerías locales ---
cpSync(r('node_modules/alpinejs/dist/cdn.min.js'), r('www/vendor/alpine.min.js'));
cpSync(r('node_modules/xlsx/dist/xlsx.full.min.js'), r('www/vendor/xlsx.full.min.js'));
cpSync(r('scripts/android-bridge.js'), r('www/vendor/android-bridge.js'));

// --- Fuentes locales ---
const fuentes = [
  ['inter', 'Inter', 'normal', [400, 500, 600, 700]],
  ['cormorant-garamond', 'Cormorant Garamond', 'normal', [400, 500, 600]],
  ['cormorant-garamond', 'Cormorant Garamond', 'italic', [400, 500, 600]],
];
let fontsCss = '';
for (const [paquete, familia, estilo, pesos] of fuentes) {
  for (const peso of pesos) {
    const archivo = `${paquete}-latin-${peso}-${estilo}.woff2`;
    const origen = r('node_modules/@fontsource', paquete, 'files', archivo);
    if (!existsSync(origen)) throw new Error('Falta la fuente ' + archivo);
    cpSync(origen, r('www/vendor/fonts', archivo));
    fontsCss += `@font-face{font-family:'${familia}';font-style:${estilo};font-weight:${peso};font-display:swap;src:url(fonts/${archivo}) format('woff2');}\n`;
  }
}
writeFileSync(r('www/vendor/fonts.css'), fontsCss);

// --- index.html: cambia los enlaces de internet por los locales ---
let html = readFileSync(r('index.html'), 'utf8');

function reemplazar(patron, nuevo, etiqueta) {
  if (!patron.test(html)) {
    throw new Error(`No encontré en index.html: ${etiqueta}. ¿Cambió esa línea? Ajusta scripts/build-web.mjs.`);
  }
  html = html.replace(patron, nuevo);
}

reemplazar(
  /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/,
  '<link rel="stylesheet" href="vendor/tailwind.css">\n<link rel="stylesheet" href="vendor/fonts.css">',
  'el script de Tailwind (cdn.tailwindcss.com)'
);
reemplazar(
  /<script defer src="https:\/\/cdn\.jsdelivr\.net\/npm\/alpinejs@[^"]*"><\/script>/,
  '<script defer src="vendor/alpine.min.js"></script>',
  'el script de Alpine.js'
);
reemplazar(
  /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/xlsx@[^"]*"><\/script>/,
  '<script src="vendor/xlsx.full.min.js"></script>\n<script src="vendor/android-bridge.js"></script>',
  'el script de SheetJS (xlsx)'
);
reemplazar(
  /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/,
  '',
  'los enlaces de Google Fonts'
);

writeFileSync(r('www/index.html'), html);
console.log('OK: carpeta www/ lista');
