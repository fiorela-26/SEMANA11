<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
$conn = new mysqli("localhost", "root", "", "db_darwin");

if ($conn->connect_error) die(json_encode(["error" => "Error de conexión"]));

$tabla = $_GET['tabla'] ?? 'detalle_registro';
$metodo = $_SERVER['REQUEST_METHOD'];

// Función para obtener el nombre de la columna ID (Llave Primaria)
function obtenerPK($conn, $tabla) {
    $res = $conn->query("SHOW KEYS FROM $tabla WHERE Key_name = 'PRIMARY'");
    $row = $res->fetch_assoc();
    return $row['Column_name'] ?? 'id';
}

$pk = obtenerPK($conn, $tabla);

// --- ELIMINAR ---
if (isset($_GET['eliminar'])) {
    $id = $conn->real_escape_string($_GET['eliminar']);
    $conn->query("DELETE FROM $tabla WHERE $pk = '$id'");
    echo json_encode(["success" => true]);
    exit;
}

// --- INSERTAR O ACTUALIZAR ---
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_editar = $data['id_sistema_edit'] ?? null;
    unset($data['id_sistema_edit']);

    if ($id_editar) {
        // UPDATE
        $sets = [];
        foreach($data as $key => $val) $sets[] = "$key = '" . $conn->real_escape_string($val) . "'";
        $sql = "UPDATE $tabla SET " . implode(", ", $sets) . " WHERE $pk = '$id_editar'";
    } else {
        // INSERT
        $cols = implode(", ", array_keys($data));
        $vals = "'" . implode("', '", array_map([$conn, 'real_escape_string'], array_values($data))) . "'";
        $sql = "INSERT INTO $tabla ($cols) VALUES ($vals)";
    }
    
    if($conn->query($sql)) echo json_encode(["success" => true]);
    else echo json_encode(["error" => $conn->error, "sql" => $sql]);
    exit;
}

// --- LEER ---
$res = $conn->query("SELECT * FROM $tabla ORDER BY $pk DESC");
echo json_encode($res->fetch_all(MYSQLI_ASSOC));