document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const grado = urlParams.get("grado");

  const selectAlumno = document.getElementById("selectAlumno");
  const tablaReportes = document.getElementById("tablaReportes");
  const fechaBuscar = document.getElementById("fechaBuscar");
  const btnBuscarFecha = document.getElementById("btnBuscarFecha");

  const btnPDF = document.getElementById("btnPDF");
  const btnExcel = document.getElementById("btnExcel");
  const btnPrint = document.getElementById("btnPrint");

  let reportesCargados = [];

  // ✅ Cargar alumnos
  const cargarAlumnos = async () => {
    const res = await fetch(`/api/alumnos/${grado}`);
    const alumnos = await res.json();

    // Agregamos "Todos los alumnos"
    selectAlumno.innerHTML = `<option value="todos">-- Todos los alumnos --</option>`;
    alumnos.forEach(al => {
      selectAlumno.innerHTML += `<option value="${al.codigo}">${al.nombres} ${al.apellidos}</option>`;
    });
  };

  // ✅ Cargar reportes
  const cargarReportes = async (codigo, fecha = "") => {
    let url;
    if (codigo === "todos") {
      url = `/api/reportes-grado/${grado}`;
      if (fecha) url = `/api/reportes-grado/${grado}/fecha/${fecha}`;
    } else {
      url = `/api/reportes/${codigo}`;
      if (fecha) url = `/api/reportes/${codigo}/fecha/${fecha}`;
    }

    const res = await fetch(url);
    reportesCargados = await res.json();

    tablaReportes.innerHTML = "";
    reportesCargados.forEach(r => {
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
  };

  // ================== Eventos ==================
  selectAlumno.addEventListener("change", () => {
    if (selectAlumno.value) cargarReportes(selectAlumno.value);
  });

  btnBuscarFecha.addEventListener("click", () => {
    if (selectAlumno.value && fechaBuscar.value) {
      cargarReportes(selectAlumno.value, fechaBuscar.value);
    }
  });

  // ================== Exportar a PDF ==================
  btnPDF.addEventListener("click", () => {
    if (reportesCargados.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 📌 Logo
    const logo = new Image();
    logo.src = "/img/logo2.png";

    logo.onload = () => {
      // Encabezado
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Colegio de Ciencias Comerciales El Progreso", 14, 20);
      doc.setFontSize(12);
      doc.text("Reporte de Conducta", 14, 30);

       // 📌 Aquí agregamos el grado
    doc.setFontSize(11);
    doc.text(`Grado: ${grado}`, 14, 38);

      // Logo más pequeño
      doc.addImage(logo, "PNG", 165, 10, 25, 25);

      // Línea separadora
      doc.setDrawColor(255, 165, 0);
      doc.line(14, 35, 195, 35);

      // Tabla
      doc.autoTable({
        head: [["Código", "Nombre", "Apellido", "Motivo", "Fecha", "Hora"]],
        body: reportesCargados.map(r => [
          r.codigo, r.nombres, r.apellidos, r.reporte, r.fecha, r.hora
        ]),
        startY: 45,
        theme: "striped",
        headStyles: { fillColor: [239, 141, 36] },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [255, 247, 230] }
      });

      // Guardar
      doc.save("Reporte_Conducta.pdf");
    };

    logo.onerror = () => {
      alert("⚠️ No se pudo cargar el logo en el PDF");
    };
  });

  // ================== Exportar a Excel ==================
  btnExcel.addEventListener("click", () => {
    if (reportesCargados.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportesCargados);
    XLSX.utils.book_append_sheet(wb, ws, "Reportes");
    XLSX.writeFile(wb, "Reporte_Conducta.xlsx");
  });

  // ================== Imprimir ==================
  btnPrint.addEventListener("click", () => {
    window.print();
  });

  // Inicializar
  cargarAlumnos();
});
