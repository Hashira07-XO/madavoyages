-- Nettoyage des anciennes tables si elles existent
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS circuits CASCADE;
DROP TABLE IF EXISTS compte_admin CASCADE;

-- 1. Table des Administrateurs
CREATE TABLE compte_admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Voyages / Circuits
CREATE TABLE circuits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    capacity INT NOT NULL DEFAULT 15,
    image_url TEXT, 
    price_ariary BIGINT NOT NULL,
    type_transport VARCHAR(50) DEFAULT 'Non spécifié',
    date_debut_voyage DATE DEFAULT '2026-08-01',
    date_fin_voyage DATE DEFAULT '2026-08-10',
    date_fin_reservation DATE DEFAULT '2026-07-25',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Réservations
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    circuit_id INT REFERENCES circuits(id) ON DELETE CASCADE, 
    client_name VARCHAR(100) NOT NULL,  
    client_email VARCHAR(100) NOT NULL, 
    seat_number INT NOT NULL,           
    status VARCHAR(50) DEFAULT 'Confirmé',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_seat_per_circuit UNIQUE (circuit_id, seat_number)
);