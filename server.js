const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// ================= Configuración DB =================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bardales1804',
    database: 'colegio_reportes'
});

// ================= Middlewares =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// ================= LOGIN =================
app.post("/login", (req, res) => {
    const { correo, contrasena } = req.body;

    db.query(
        "SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?",
        [correo, contrasena],
        (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                req.session.usuario = results[0];
                res.json({
                    success: true,
                    rol: results[0].rol,
                    correo: results[0].correo
                });
            } else {
                res.json({ success: false, message: "Correo o contraseña incorrectos" });
            }
        }
    );
});

// ================= Dashboard protegido =================
app.get('/dashboard.html', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ================= CRUD ALUMNOS =================

// Obtener alumnos por grado
app.get("/api/alumnos/:grado", (req, res) => {
    const { grado } = req.params;
    db.query("SELECT * FROM alumnos WHERE grado = ?", [grado], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener alumnos:", err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

// Agregar alumno
app.post("/api/alumnos", (req, res) => {
    const { codigo, nombres, apellidos, grado } = req.body;
    db.query(
        "INSERT INTO alumnos (codigo, nombres, apellidos, grado) VALUES (?, ?, ?, ?)",
        [codigo, nombres, apellidos, grado],
        (err) => {
            if (err) {
                console.error("❌ Error al insertar alumno:", err);
                return res.status(500).json({ error: err });
            }
            res.json({ success: true, message: "Alumno agregado correctamente" });
        }
    );
});

// Editar alumno
app.put("/api/alumnos/:codigo", (req, res) => {
    const { codigo } = req.params;
    const { nombres, apellidos, grado } = req.body;
    db.query(
        "UPDATE alumnos SET nombres=?, apellidos=?, grado=? WHERE codigo=?",
        [nombres, apellidos, grado, codigo],
        (err) => {
            if (err) {
                console.error("❌ Error al actualizar alumno:", err);
                return res.status(500).json({ error: err });
            }
            res.json({ success: true, message: "Alumno actualizado correctamente" });
        }
    );
});

// Eliminar alumno
app.delete("/api/alumnos/:codigo", (req, res) => {
    const { codigo } = req.params;
    db.query("DELETE FROM alumnos WHERE codigo=?", [codigo], (err) => {
        if (err) {
            console.error("❌ Error al eliminar alumno:", err);
            return res.status(500).json({ error: err });
        }
        res.json({ success: true, message: "Alumno eliminado correctamente" });
    });
});

// ================= CRUD REPORTES =================

// Crear reporte
app.post("/api/reportes", (req, res) => {
    const { codigo, reporte } = req.body;
    
    // Fecha/hora Guatemala
    const fechaGuatemala = new Date().toLocaleString("sv-SE", { timeZone: "America/Guatemala" }); 

    const sql = "INSERT INTO reportes (codigo, reporte, fecha) VALUES (?, ?, ?)";
    db.query(sql, [codigo, reporte, fechaGuatemala], (err) => {
        if (err) {
            console.error("❌ Error insertando reporte:", err);
            return res.json({ success: false, error: err });
        }
        res.json({ success: true });
    });
});

// 📌 Obtener todos los reportes de un alumno
app.get("/api/reportes/:codigo", (req, res) => {
    const { codigo } = req.params;
    db.query(
        `SELECT r.id, r.codigo, a.nombres, a.apellidos, r.reporte,
                DATE_FORMAT(r.fecha, '%d-%m-%Y') AS fecha,
                DATE_FORMAT(r.fecha, '%H:%i:%s') AS hora
         FROM reportes r
         JOIN alumnos a ON r.codigo = a.codigo
         WHERE r.codigo = ?
         ORDER BY r.fecha DESC`,
        [codigo],
        (err, results) => {
            if (err) {
                console.error("❌ Error obteniendo reportes del alumno:", err);
                return res.status(500).json({ error: err });
            }
            res.json(results);
        }
    );
});

// 📌 Buscar reportes por fecha exacta
app.get("/api/reportes/:codigo/fecha/:fecha", (req, res) => {
    const { codigo, fecha } = req.params;
    db.query(
        `SELECT r.id, r.codigo, a.nombres, a.apellidos, r.reporte,
                DATE_FORMAT(r.fecha, '%d-%m-%Y') AS fecha,
                DATE_FORMAT(r.fecha, '%H:%i:%s') AS hora
         FROM reportes r
         JOIN alumnos a ON r.codigo = a.codigo
         WHERE r.codigo = ? AND DATE(r.fecha) = ?
         ORDER BY r.fecha DESC`,
        [codigo, fecha],
        (err, results) => {
            if (err) {
                console.error("❌ Error obteniendo reportes por fecha:", err);
                return res.status(500).json({ error: err });
            }
            res.json(results);
        }
    );
});

// 📌 Obtener todos los reportes de un grado
app.get("/api/reportes-grado/:grado", (req, res) => {
  const { grado } = req.params;
  db.query(
    `SELECT r.id, r.codigo, a.nombres, a.apellidos, r.reporte,
            DATE_FORMAT(r.fecha, '%d-%m-%Y') AS fecha,
            DATE_FORMAT(r.fecha, '%H:%i:%s') AS hora
     FROM reportes r
     JOIN alumnos a ON r.codigo = a.codigo
     WHERE a.grado = ?
     ORDER BY r.fecha DESC`,
    [grado],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// 📌 Obtener todos los reportes de un grado en una fecha específica
app.get("/api/reportes-grado/:grado/fecha/:fecha", (req, res) => {
  const { grado, fecha } = req.params;
  db.query(
    `SELECT r.id, r.codigo, a.nombres, a.apellidos, r.reporte,
            DATE_FORMAT(r.fecha, '%d-%m-%Y') AS fecha,
            DATE_FORMAT(r.fecha, '%H:%i:%s') AS hora
     FROM reportes r
     JOIN alumnos a ON r.codigo = a.codigo
     WHERE a.grado = ? AND DATE(r.fecha) = ?
     ORDER BY r.fecha DESC`,
    [grado, fecha],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});


// ================= Servidor =================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
