# APK de Comisiones Monte Sinaí

`index.html` sigue siendo la fuente y la página web funciona igual que antes.
La APK se genera sola con GitHub Actions:

1. Sube estos archivos al repositorio (rama `main` o `master`).
2. Entra a la pestaña **Actions** → **Compilar APK** (se ejecuta sola al subir cambios; también puedes darle **Run workflow**).
3. Cuando termine, abre la ejecución y descarga **Comisiones-APK** (al final de la página, en *Artifacts*). Dentro viene `app-debug.apk`.
4. Pásala al teléfono e instálala (hay que permitir "instalar apps de orígenes desconocidos").

Cada vez que cambies `index.html` y lo subas, se genera una APK nueva.

## En la app
- Imprimir abre el diálogo de impresión de Android (ahí mismo se puede "Guardar como PDF").
- Exportar a Excel guarda el .xlsx y abre el menú de compartir/guardar.
- Los datos se guardan en el teléfono (localStorage). Desinstalar la app los borra.
- Sin internet funciona la captura; guardar/cargar en Google Sheets sí necesita conexión.

## Si cambias las primeras líneas de index.html
`scripts/build-web.mjs` reemplaza los enlaces de CDN (Tailwind, Alpine, SheetJS, Google Fonts). Si cambias esas líneas, el flujo avisa con un error claro.
