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

async function cargarModulo(tabla) {
    t_actual = tabla;
    document.getElementById('titulo-modulo').innerText = CONFIG[tabla].titulo;
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    try {
        const res = await fetch(`api.php?tabla=${tabla}`);
        const datos = await res.json();
        renderTabla(datos);
    } catch (e) { console.error("Error de conexión"); }
}

function renderTabla(datos) {
    const cols = CONFIG[t_actual].cols;
    const root = document.getElementById('app-root');
    root.innerHTML = `
        <table class="tabla-dinamica">
            <thead><tr>${cols.map(c => `<th>${c.toUpperCase()}</th>`).join('')}<th>ACCIONES</th></tr></thead>
            <tbody>
                ${datos.map(f => `<tr>${cols.map(c => `<td>${f[c] || '-'}</td>`).join('')}
                    <td><button class="btn-delete" onclick="eliminar('${f[cols[0]]}')"><i class="fa-solid fa-trash"></i></button></td>
                </tr>`).join('')}
            </tbody>
        </table>`;
}

function abrirFormulario() {
    const container = document.getElementById('inputs-container');
    container.innerHTML = CONFIG[t_actual].cols.slice(1).map(c => `
        <div style="margin-bottom:15px">
            <label>${c.toUpperCase()}</label>
            <input type="text" name="${c}" required style="width:100%; padding:8px; border-radius:4px; border:1px solid #ddd">
        </div>`).join('');
    document.getElementById('modal-formulario').style.display = 'flex';
}

function cerrarModal() { document.getElementById('modal-formulario').style.display = 'none'; }

document.getElementById('form-dinamico').onsubmit = async (e) => {
    e.preventDefault();
    await fetch(`api.php?tabla=${t_actual}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    cerrarModal(); cargarModulo(t_actual);
};

async function eliminar(id) {
    if(confirm("¿Eliminar?")) {
        await fetch(`api.php?tabla=${t_actual}&eliminar=${id}&col=${CONFIG[t_actual].cols[0]}`);
        cargarModulo(t_actual);
    }
}
window.onload = () => cargarModulo('detalle_registro');