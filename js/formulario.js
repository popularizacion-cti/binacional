const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwVtBkNMo8wCxEGzT0nIgFV09nzZHDZA_2Zj7OsU_mJQ5h0v0kCfuicPCvCEWvDoS8Tdg/exec";
const CHUNK_SIZE = 2 * 1024 * 1024; 

document.getElementById('inscripcionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnEnviar');
    const status = document.getElementById('status');
    btn.disabled = true;
    status.style.color = "var(--primary)";
    status.innerText = "Iniciando proceso de subida segura...";

    const files = document.querySelectorAll('.pdf-input');
    const links = [];
    const nombresArchivosOriginales = [];
    
    // Usamos el DNI del docente como identificador del envío
    const dniPrincipal = document.getElementById('dniAsesor').value.trim();

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i].files[0];
            const tipoDocumento = files[i].getAttribute('data-doc');
            
            status.innerText = `Subiendo (${i+1}/5): ${tipoDocumento}...`;

            nombresArchivosOriginales.push(file.name);
            // Renombrado inteligente usando el tipo de documento exacto según las bases
            const nombreModificado = `${dniPrincipal} | ${tipoDocumento} | ${file.name}`;

            const resStart = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: "startUpload", 
                    fileName: nombreModificado,
                    mimeType: file.type,
                    origin: window.location.origin 
                })
            });
            const startData = await resStart.json();

            if (startData.status !== "success" || !startData.uploadUrl) {
                throw new Error("Rechazo del servidor Google Drive: " + (startData.message || "No se obtuvo URL"));
            }

            const uploadUrl = startData.uploadUrl;
            let offset = 0;
            while (offset < file.size) {
                const chunk = file.slice(offset, offset + CHUNK_SIZE);
                const resChunk = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Range': `bytes ${offset}-${offset + chunk.size - 1}/${file.size}` },
                    body: chunk
                });

                if (!resChunk.ok && resChunk.status !== 308) {
                    throw new Error(`Error en la transmisión del fragmento (${resChunk.status})`);
                }

                if (resChunk.status === 200 || resChunk.status === 201) {
                    const finalData = await resChunk.json();
                    links.push(`https://drive.google.com/open?id=${finalData.id}`);
                }
                offset += CHUNK_SIZE;
            }
        }

        status.innerText = "Consolidando y guardando registro de inscripción...";
        
        // Enviamos el objeto con toda la nueva estructura a tu Google Sheets
        const resSave = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "saveData",
                proyecto: document.getElementById('nombreProyecto').value,
                area: document.getElementById('areaParticipacion').value,
                region: document.getElementById('region').value,
                provincia: document.getElementById('provincia').value,
                institucion: document.getElementById('institucion').value,
                
                // Estudiante 1
                e1_nombres: document.getElementById('nombresE1').value,
                e1_dni: document.getElementById('dniE1').value.trim(),
                e1_grado: document.getElementById('gradoE1').value,
                e1_correo: document.getElementById('correoE1').value.trim(),
                e1_fechaNac: document.getElementById('fechaNacimientoE1').value,
                
                // Estudiante 2
                e2_nombres: document.getElementById('nombresE2').value,
                e2_dni: document.getElementById('dniE2').value.trim(),
                e2_grado: document.getElementById('gradoE2').value,
                e2_correo: document.getElementById('correoE2').value.trim(),
                e2_fechaNac: document.getElementById('fechaNacimientoE2').value,
                
                // Docente
                docente: document.getElementById('nombreAsesor').value,
                docente_dni: dniPrincipal,
                docente_especialidad: document.getElementById('especialidadAsesor').value,
                docente_cargo: document.getElementById('cargoAsesor').value,
                docente_correo: document.getElementById('correoAsesor').value.trim(),
                
                links: links,
                nombresArchivos: nombresArchivosOriginales
            })
        });

        const saveData = await resSave.json();
        if (saveData.status !== "success") {
            throw new Error("La base de datos rechazó el guardado final.");
        }

        status.style.color = "var(--accent)";
        status.innerHTML = "🎉 ¡Inscripción completada con éxito!<br><span style='font-size:12px;color:#64748b;'>Los datos han sido validados y archivados.</span>";
        document.getElementById('inscripcionForm').reset();

    } catch (error) {
        console.error(error);
        status.style.color = "red";
        status.innerText = "❌ Error: " + error.message; 
        btn.disabled = false;
    }
});