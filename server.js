// ================= DEPENDENCIAS =================
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
require('dotenv').config(); // 👈 Variables de entorno (.env)

const app = express();
const PORT = process.env.PORT || 3000; // ⚡ Render asigna el puerto automáticamente

// ================= CONEXIÓN DB =================
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'bardales1804',
    database: process.env.DB_NAME || 'colegio_reportes',
    port: process.env.DB_PORT || 3306
});

// Probar conexión
db.connect(err => {
    if (err) {
        console.error("❌ Error al conectar con la base de datos:", err.message);
    } else {
        console.log("✅ Conectado a la base de datos MySQL");
    }
});

// ================= MIDDLEWARES =================
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
            if (err) {
                console.error("❌ Error en login:", err.message);
                return res.status(500).json({ error: err.message });
            }

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

// ================= DASHBOARD PROTEGIDO =================
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
            console.error("❌ Error al obtener alumnos:", err.message);
            return res.status(500).json({ error: err.message });
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
                console.error("❌ Error al insertar alumno:", err.message);
                return res.status(500).json({ error: err.message });
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
                console.error("❌ Error al actualizar alumno:", err.message);
                return res.status(500).json({ error: err.message });
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
            console.error("❌ Error al eliminar alumno:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Alumno eliminado correctamente" });
    });
});

// ================= CRUD REPORTES =================

// Crear reporte
app.post("/api/reportes", (req, res) => {
    const { codigo, reporte } = req.body;

    if (!codigo || !reporte) {
        return res.status(400).json({ success: false, message: "Faltan datos (codigo o reporte)" });
    }

    // Fecha/hora Guatemala en formato MySQL
    const fechaGuatemala = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = "INSERT INTO reportes (codigo, reporte, fecha) VALUES (?, ?, ?)";
    db.query(sql, [codigo, reporte, fechaGuatemala], (err) => {
        if (err) {
            console.error("❌ Error insertando reporte:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Reporte agregado correctamente" });
    });
});

// Obtener todos los reportes de un alumno
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
                console.error("❌ Error obteniendo reportes del alumno:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// Buscar reportes por fecha exacta
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
                console.error("❌ Error obteniendo reportes por fecha:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// Obtener todos los reportes de un grado
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
            if (err) {
                console.error("❌ Error obteniendo reportes por grado:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// Obtener todos los reportes de un grado en una fecha específica
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
            if (err) {
                console.error("❌ Error obteniendo reportes de grado en fecha:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// ================= SERVIDOR =================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
