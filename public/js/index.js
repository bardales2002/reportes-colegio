document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("rol", data.rol);
        sessionStorage.setItem("correo", data.correo);

        window.location.href = "/dashboard.html";
      } else {
        errorMsg.textContent = data.message;
        errorMsg.style.color = "yellow";
        errorMsg.style.fontWeight = "bold";
      }
    } catch (err) {
      console.error("Error en login:", err);
      errorMsg.textContent = "Error de conexión con el servidor.";
      errorMsg.style.color = "red";
    }
  });
});
