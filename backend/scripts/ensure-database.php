<?php

$database = getenv('DB_DATABASE') ?: 'ai_delivery_assistant';
$host = getenv('DB_HOST') ?: 'db';
$port = getenv('DB_PORT') ?: '5432';
$username = getenv('DB_USERNAME') ?: 'postgres';
$password = getenv('DB_PASSWORD') ?: 'postgres';

$dsn = sprintf('pgsql:host=%s;port=%s;dbname=postgres', $host, $port);

$pdo = new PDO($dsn, $username, $password, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$statement = $pdo->prepare('SELECT 1 FROM pg_database WHERE datname = :name');
$statement->execute(['name' => $database]);

if ($statement->fetchColumn()) {
    fwrite(STDOUT, "Database already exists: {$database}\n");
    exit(0);
}

$quotedDatabase = sprintf('"%s"', str_replace('"', '""', $database));
$pdo->exec("CREATE DATABASE {$quotedDatabase}");

fwrite(STDOUT, "Created database: {$database}\n");
