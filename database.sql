-- ======================
-- CREACIÓN DE BASE DE DATOS
-- ======================
DROP DATABASE IF EXISTS railway;
CREATE DATABASE railway;
USE railway;

-- ======================
-- TABLA USUARIOS
-- ======================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    rol ENUM('usuario', 'admin') DEFAULT 'usuario'
);

-- Insertar usuarios iniciales
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Juan Manuel', 'jmsc1723@gmail.com', 'Juan123.', 'usuario'),
('Samuel', 'smejiago@gmail.com', 'Samuel123.', 'usuario'),
('Oscar', 'oscar.aroche.007@gmail.com', 'Oscar123.', 'usuario'),
('Bryan', 'brayanbardales2018@gmail.com', 'Bryan123.', 'usuario'),
('Dairy', 'dayrilopez3324@gmail.com', 'Dairy123.', 'usuario'),
('Sandy', 'sandymayenc@gmail.com', 'Sandy123.', 'usuario'),
('Edgar', 'estuardo_512@hotmail.com', 'Edgar123.', 'usuario'),
('Belen', 'maribelen9@gmail.com', 'Belen123.', 'usuario'),
('Alejandra', 'ale_rivas83@hotmail.com', 'Alejandra123.', 'admin'),
('Sandra', 'sandra.flores@colegiociencias.edu.gr', 'Sandra123.', 'admin');

-- ======================
-- TABLA ALUMNOS
-- ======================
CREATE TABLE alumnos (
    codigo VARCHAR(20) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    grado VARCHAR(50) NOT NULL
);

-- ======================
-- TABLA REPORTES
-- ======================
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    reporte VARCHAR(500) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grado VARCHAR(50) NOT NULL,
    CONSTRAINT fk_alumno FOREIGN KEY (codigo) REFERENCES alumnos(codigo) 
    ON DELETE CASCADE ON UPDATE CASCADE
);
