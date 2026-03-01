-- Scandiweb fullstack test database schema
-- MySQL 5.6+

CREATE DATABASE IF NOT EXISTS scandiweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scandiweb;

CREATE TABLE IF NOT EXISTS currency (
    id VARCHAR(10) PRIMARY KEY,
    label VARCHAR(10) NOT NULL,
    symbol VARCHAR(5) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    in_stock TINYINT(1) NOT NULL DEFAULT 1,
    gallery JSON NOT NULL,
    description TEXT,
    category_id VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS attribute_set (
    id VARCHAR(200) PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attribute_item (
    id VARCHAR(400) PRIMARY KEY,
    attribute_set_id VARCHAR(200) NOT NULL,
    display_value VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    FOREIGN KEY (attribute_set_id) REFERENCES attribute_set(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price (
    product_id VARCHAR(100) NOT NULL,
    currency_id VARCHAR(10) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (product_id, currency_id),
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES currency(id)
);

CREATE TABLE IF NOT EXISTS `order` (
    id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    selected_attributes JSON,
    FOREIGN KEY (order_id) REFERENCES `order`(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id)
);
