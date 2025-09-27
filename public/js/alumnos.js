document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const grado = urlParams.get("grado");

  const codigoInput = document.getElementById("codigo");
  const nombresInput = document.getElementById("nombres");
  const apellidosInput = document.getElementById("apellidos");

  const btnAgregar = document.getElementById("btnAgregar");
  const btnActualizar = document.getElementById("btnActualizar");
  const listaAlumnos = document.getElementById("tablaAlumnos"); // 👈 corregido (tabla)

  let codigoEditando = null; // guarda el código del alumno en edición

  // ✅ Cargar alumnos por grado
  const cargarAlumnos = async () => {
    try {
      const res = await fetch(`/api/alumnos/${grado}`);
      const alumnos = await res.json();

      listaAlumnos.innerHTML = "";
      alumnos.forEach(alumno => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${alumno.codigo}</td>
          <td>${alumno.nombres}</td>
          <td>${alumno.apellidos}</td>
          <td>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
          </td>
        `;

        // ✅ Botón Editar
        fila.querySelector(".edit-btn").addEventListener("click", () => {
          editarAlumno(alumno.codigo, alumno.nombres, alumno.apellidos);
        });

        // ✅ Botón Eliminar
        fila.querySelector(".delete-btn").addEventListener("click", () => {
          eliminarAlumno(alumno.codigo);
        });

        listaAlumnos.appendChild(fila);
      });
    } catch (error) {
      console.error("Error cargando alumnos:", error);
    }
  };

  // ✅ Agregar alumno
  btnAgregar.addEventListener("click", async (e) => {
    e.preventDefault();
    const codigo = codigoInput.value.trim();
    const nombres = nombresInput.value.trim();
    const apellidos = apellidosInput.value.trim();

    if (!codigo || !nombres || !apellidos) {
      alert("Completa todos los campos");
      return;
    }

    await fetch("/api/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, nombres, apellidos, grado })
    });

    limpiarFormulario();
    cargarAlumnos();
  });

  // ✅ Editar alumno (llenar formulario)
  const editarAlumno = (codigo, nombres, apellidos) => {
    codigoEditando = codigo;
    codigoInput.value = codigo;
    nombresInput.value = nombres;
    apellidosInput.value = apellidos;

    codigoInput.disabled = true; // no se cambia el código
    btnAgregar.style.display = "none";
    btnActualizar.style.display = "inline-block";
  };

  // ✅ Guardar actualización
  btnActualizar.addEventListener("click", async (e) => {
    e.preventDefault();
    const nombres = nombresInput.value.trim();
    const apellidos = apellidosInput.value.trim();

    await fetch(`/api/alumnos/${codigoEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombres, apellidos, grado })
    });

    limpiarFormulario();
    cargarAlumnos();
  });

  // ✅ Eliminar alumno
  const eliminarAlumno = async (codigo) => {
    if (confirm("¿Seguro que deseas eliminar este alumno?")) {
      await fetch(`/api/alumnos/${codigo}`, { method: "DELETE" });
      cargarAlumnos();
    }
  };

  // ✅ Limpiar formulario
  const limpiarFormulario = () => {
    codigoInput.value = "";
    nombresInput.value = "";
    apellidosInput.value = "";
    codigoInput.disabled = false;

    btnAgregar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    codigoEditando = null;
  };

  // Inicializar
  cargarAlumnos();
});
