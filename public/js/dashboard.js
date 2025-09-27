document.addEventListener("DOMContentLoaded", () => {
  const usuarioRol = sessionStorage.getItem("rol");
  const usuarioCorreo = sessionStorage.getItem("correo");

  // Mostrar datos del usuario
  const currentUser = document.getElementById("currentUser");
  if (usuarioRol && usuarioCorreo) {
    const roleClass = usuarioRol === "admin" ? "admin" : "usuario";
    const roleLabel = usuarioRol === "admin" ? "Administrador" : "Usuario";
    currentUser.innerHTML = `<span class="user-label ${roleClass}">${roleLabel}</span> 
                             <span class="user-email">${usuarioCorreo}</span>`;
  }

  // Ocultar opciones si no es admin
  const adminCards = document.querySelectorAll(".admin-only");
  if (usuarioRol !== "admin") {
    adminCards.forEach(card => card.style.display = "none");
  }

  // ✅ Modificar dinámicamente el botón de reportes
  const textoReporte = document.getElementById("texto-reporte"); // <p> dentro del botón
  const btnReporte = document.getElementById("btn-reporte");

  if (usuarioRol === "admin") {
    textoReporte.textContent = "Ver reportes";
    btnReporte.onclick = () => {
    window.location.href = "ver-reportes.html"; // SOLO admins
    };
  } else {
    textoReporte.textContent = "Ingresar reportes";
    btnReporte.onclick = () => {
      window.location.href = "reportes-grado.html"; // página para usuarios
    };
  }

  // ✅ Botón de alumnos (elige grado)
  document.getElementById("btn-alumno").onclick = () => {
    window.location.href = "grado.html";
  };

  // ✅ Botón de historial (solo admin, ya está oculto para usuarios)
  document.getElementById("btn-historial").onclick = () => {
    window.location.href = "ver-reportes.html"; // SOLO admins
  };

  // ✅ Botón imprimir (solo admin, ya está oculto para usuarios)
  document.getElementById("btn-imprimir").onclick = () => {
  window.location.href = "imprimir-grado.html";  // 👈 NUEVO
  };

  // ✅ Logout
  document.getElementById("logoutBtn").onclick = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };
});
