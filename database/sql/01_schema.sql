CREATE DATABASE IF NOT EXISTS campus_food;
USE campus_food;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15),
  password VARCHAR(255) NOT NULL,           -- bcrypt hash, never plain text
  role ENUM('Provider','Recipient','Admin') NOT NULL DEFAULT 'Recipient'
);

CREATE TABLE category (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE location (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  location_name VARCHAR(100) NOT NULL,
  building VARCHAR(100)
);

CREATE TABLE food_item (
  food_id INT AUTO_INCREMENT PRIMARY KEY,
  food_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL,
  prepared_time DATETIME NOT NULL,
  expiry_time DATETIME NOT NULL,
  status ENUM('Available','Reserved','Distributed','Expired') NOT NULL DEFAULT 'Available',
  provider_id INT NOT NULL,
  category_id INT NOT NULL,
  location_id INT NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  FOREIGN KEY (location_id) REFERENCES location(location_id),
  INDEX idx_status_expiry (status, expiry_time)
);

CREATE TABLE request (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
  request_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending',
  recipient_id INT NOT NULL,
  food_id INT NOT NULL,                      -- the "is requested in" 1:M relationship
  FOREIGN KEY (recipient_id) REFERENCES users(user_id),
  FOREIGN KEY (food_id) REFERENCES food_item(food_id)
);

CREATE TABLE distribution (
  distribution_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL UNIQUE,            -- UNIQUE enforces the 1:1 "results in"
  quantity_distributed INT NOT NULL,
  distribution_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collected_by VARCHAR(100),
  FOREIGN KEY (request_id) REFERENCES request(request_id)
);

CREATE VIEW v_available_food AS
SELECT f.*, c.category_name, l.location_name, l.building
FROM food_item f
JOIN category c USING (category_id)
JOIN location l USING (location_id)
WHERE f.status = 'Available' AND f.expiry_time > NOW() AND f.quantity > 0;