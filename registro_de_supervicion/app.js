const CONFIG = {
    detalle_registro: { titulo: "Supervisión", cols: ["id", "id_actividad", "observacion", "fecha"] },
    accion: { titulo: "Acciones", cols: ["id_accion", "nombre_corto", "nombre_largo", "codigo_p_accion"] },
    accion_especifica: { titulo: "Acciones Específicas", cols: ["id", "nombre", "id_accion"] },
    actividad: { titulo: "Actividades", cols: ["id", "descripcion", "id_accion_especifica"] },
    subaccion: { titulo: "Subacciones", cols: ["id", "nombre", "id_accion_especifica"] },
    tipo_agente: { titulo: "Tipos de Agente", cols: ["id", "nombre"] },
    tipo_transporte: { titulo: "Transporte", cols: ["id", "nombre"] },
    zona_distrito: { titulo: "Distritos", cols: ["id", "nombre", "id_provincia"] },
    zona_provincia: { titulo: "Provincias", cols: ["id", "nombre"] }
};

let t_actual = 'detalle_registro';
let editandoID = null;

async function cargarModulo(tabla, elemento = null) {
    t_actual = tabla;
    editandoID = null;
    document.getElementById('titulo-modulo').innerText = CONFIG[tabla].titulo;
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    if (elemento) elemento.classList.add('active');

    const res = await fetch(`api.php?tabla=${tabla}`);
    const datos = await res.json();
    renderTabla(datos);
}

function renderTabla(datos) {
    const cols = CONFIG[t_actual].cols;
    const root = document.getElementById('app-root');
    
    root.innerHTML = `
    <table class="tabla-dinamica">
        <thead><tr>${cols.map(c => `<th>${c.toUpperCase()}</th>`).join('')}<th>ACCIONES</th></tr></thead>
        <tbody>
            ${datos.map(fila => `
                <tr>
                    ${cols.map(c => `<td>${fila[c] || '-'}</td>`).join('')}
                    <td>
                        <button class="btn-edit" onclick='prepararEdicion(${JSON.stringify(fila)})'><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" onclick="eliminar('${fila[cols[0]]}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

function abrirFormulario() {
    editandoID = null;
    document.getElementById('modal-titulo').innerText = "Nuevo Registro";
    const cols = CONFIG[t_actual].cols;
    document.getElementById('inputs-container').innerHTML = cols.slice(1).map(c => `
        <div class="form-group">
            <label>${c.toUpperCase()}</label>
            <input type="text" name="${c}" id="inp_${c}" required>
        </div>
    `).join('');
    document.getElementById('modal-formulario').style.display = 'flex';
}

function prepararEdicion(fila) {
    abrirFormulario();
    editandoID = fila[CONFIG[t_actual].cols[0]];
    document.getElementById('modal-titulo').innerText = "Editar Registro";
    Object.keys(fila).forEach(key => {
        const input = document.getElementById(`inp_${key}`);
        if(input) input.value = fila[key];
    });
}

document.getElementById('form-dinamico').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if(editandoID) data.id_sistema_edit = editandoID;

    const res = await fetch(`api.php?tabla=${t_actual}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await res.json();
    if(result.success) {
        cerrarModal();
        cargarModulo(t_actual);
    } else {
        alert("Error: " + result.error);
    }
};

async function eliminar(id) {
    if(confirm("¿Eliminar registro?")) {
        await fetch(`api.php?tabla=${t_actual}&eliminar=${id}`);
        cargarModulo(t_actual);
    }
}

function cerrarModal() { document.getElementById('modal-formulario').style.display = 'none'; }
window.onload = () => cargarModulo('detalle_registro');