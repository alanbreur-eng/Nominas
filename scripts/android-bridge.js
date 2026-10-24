/*
 * Puente para la APK. Se carga después de SheetJS.
 * En el navegador normal no cambia nada; solo actúa dentro de la app.
 */
(function () {
  function plugins() {
    var cap = window.Capacitor;
    return cap && cap.isNativePlatform && cap.isNativePlatform() ? (cap.Plugins || {}) : null;
  }

  // 1) Imprimir: en la app usa el diálogo de impresión de Android (permite "Guardar como PDF").
  var imprimirOriginal = window.print.bind(window);
  window.print = function () {
    if (window.AndroidPrint && window.AndroidPrint.print) {
      window.AndroidPrint.print();
    } else {
      imprimirOriginal();
    }
  };

  // 2) Exportar a Excel: en la app guarda el .xlsx y abre el menú de compartir/guardar.
  if (window.XLSX && window.XLSX.writeFile) {
    var escribirOriginal = window.XLSX.writeFile;
    window.XLSX.writeFile = function (libro, nombreArchivo) {
      var P = plugins();
      if (!P || !P.Filesystem || !P.Share) {
        return escribirOriginal.apply(this, arguments);
      }
      var b64 = window.XLSX.write(libro, { bookType: 'xlsx', type: 'base64' });
      return P.Filesystem.writeFile({ path: nombreArchivo, data: b64, directory: 'CACHE' })
        .then(function (r) {
          return P.Share.share({
            title: nombreArchivo,
            url: r.uri,
            dialogTitle: 'Guardar o compartir el Excel'
          });
        })
        .catch(function (e) {
          var msg = (e && e.message) || String(e);
          if (/cancel/i.test(msg)) return;
          alert('No se pudo exportar el Excel: ' + msg);
        });
    };
  }
})();
