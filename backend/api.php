<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "db_darwin");
if ($conn->connect_error) die(json_encode(["error" => "Error de conexión"]));

$tabla = $_GET['tabla'];

if (isset($_GET['eliminar'])) {
    $conn->query("DELETE FROM $tabla WHERE {$_GET['col']} = '{$_GET['eliminar']}'");
    exit(json_encode(["success" => true]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $columnas = implode(", ", array_keys($data));
    $valores = "'" . implode("', '", array_values($data)) . "'";
    $conn->query("INSERT INTO $tabla ($columnas) VALUES ($valores)");
    exit(json_encode(["success" => true]));
}

$res = $conn->query("SELECT * FROM $tabla");
echo json_encode($res->fetch_all(MYSQLI_ASSOC));
$conn->close();
?>