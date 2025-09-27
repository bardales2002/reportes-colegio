document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const grado = urlParams.get("grado");

  const selectAlumno = document.getElementById("selectAlumno");
  const tablaReportes = document.getElementById("tablaReportes");
  const fechaBuscar = document.getElementById("fechaBuscar");
  const btnBuscarFecha = document.getElementById("btnBuscarFecha");

  // ✅ Cargar alumnos del grado
  const cargarAlumnos = async () => {
    try {
      const res = await fetch(`/api/alumnos/${grado}`);
      const alumnos = await res.json();

      // Agregamos la opción "Todos"
      selectAlumno.innerHTML = `<option value="todos">-- Todos los alumnos --</option>`;
      alumnos.forEach(al => {
        selectAlumno.innerHTML += `<option value="${al.codigo}">${al.nombres} ${al.apellidos}</option>`;
      });
    } catch (error) {
      console.error("Error cargando alumnos:", error);
    }
  };

  // ✅ Cargar reportes
  const cargarReportes = async (codigo, fecha = "") => {
    try {
      let url;
      if (codigo === "todos") {
        url = `/api/reportes-grado/${grado}`;
        if (fecha) url = `/api/reportes-grado/${grado}/fecha/${fecha}`;
      } else {
        url = `/api/reportes/${codigo}`;
        if (fecha) url = `/api/reportes/${codigo}/fecha/${fecha}`;
      }

      const res = await fetch(url);
      const reportes = await res.json();

      tablaReportes.innerHTML = "";
      reportes.forEach(r => {
        const fila = `
          <tr>
            <td>${r.codigo}</td>
            <td>${r.nombres}</td>
            <td>${r.apellidos}</td>
            <td>${r.reporte}</td>
            <td>${r.fecha}</td>
            <td>${r.hora}</td>
          </tr>
        `;
        tablaReportes.innerHTML += fila;
      });
    } catch (error) {
      console.error("Error cargando reportes:", error);
    }
  };

  // ✅ Eventos
  selectAlumno.addEventListener("change", () => {
    if (selectAlumno.value) {
      cargarReportes(selectAlumno.value);
    } else {
      tablaReportes.innerHTML = "";
    }
  });

  btnBuscarFecha.addEventListener("click", () => {
    if (selectAlumno.value && fechaBuscar.value) {
      cargarReportes(selectAlumno.value, fechaBuscar.value);
    } else {
      alert("Seleccione un alumno o 'Todos' y una fecha");
    }
  });

  // Inicializar
  cargarAlumnos();
});
