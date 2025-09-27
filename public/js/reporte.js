document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const grado = urlParams.get("grado");

  const titulo = document.getElementById("titulo-reporte");
  const selectAlumno = document.getElementById("selectAlumno");
  const textoReporte = document.getElementById("textoReporte");
  const form = document.getElementById("reporteForm");

  // Mostrar el grado en el título
  if (grado) {
    titulo.textContent = `Ingresar Reporte - ${grado}`;
  }

  // ===== Cargar alumnos del grado =====
  fetch(`/api/alumnos/${encodeURIComponent(grado)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        selectAlumno.innerHTML = `<option value="">No hay alumnos en este grado</option>`;
      } else {
        selectAlumno.innerHTML = `<option value="">Seleccione un alumno</option>`;
        data.forEach(alumno => {
          const option = document.createElement("option");
          option.value = alumno.codigo; // aquí va el código (E092AEK, etc.)
          option.textContent = `${alumno.nombres} ${alumno.apellidos}`;
          selectAlumno.appendChild(option);
        });
      }
    })
    .catch(err => console.error("❌ Error cargando alumnos:", err));

  // ===== Enviar reporte =====
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const codigoAlumno = selectAlumno.value;
    const reporte = textoReporte.value.trim(); // ahora lo llamamos "reporte"

    if (!codigoAlumno || !reporte) {
      alert("Debe seleccionar un alumno y escribir un reporte.");
      return;
    }

    fetch("/api/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: codigoAlumno,
        reporte,  // 👈 CORREGIDO: ahora se manda como 'reporte'
        grado
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("✅ Reporte enviado correctamente");
          textoReporte.value = ""; // limpiar textarea
          selectAlumno.value = ""; // reset select
        } else {
          alert("❌ Error al enviar el reporte");
          console.error(data);
        }
      })
      .catch(err => {
        console.error("❌ Error en fetch:", err);
        alert("❌ Error de conexión con el servidor");
      });
  });
});
