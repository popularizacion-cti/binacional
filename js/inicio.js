// Lógica que solo funciona en la página de inicio

const SHEET_ID = '1GPnvJ5dJepZ9hm-I4B1wDTeuwQXeOVjrkIWPlgXuEmE';
const SHEET_NAME = 'Hoja 1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// Array de colores institucionales para alternar en los bordes
const coloresBorde = ['border-brand', 'border-accent', 'border-dark'];

fetch(URL)
    .then(res => res.text())
    .then(data => {
        // Limpiar el JSON que devuelve Google Sheets
        const json = JSON.parse(data.substr(47).slice(0, -2));
        const rows = json.table.rows;
        const contenedor = document.getElementById('contenedor-videos');
        
        // 1. Borramos las tarjetas de carga (skeletons)
        contenedor.innerHTML = ''; 

        // 2. Iteramos la data
        rows.slice(1).forEach((row, index) => {
            const idVideo = row.c[0] ? row.c[0].v : "";
            const titulo = row.c[1] ? row.c[1].v : "Sin título";
            const descripcion = row.c[2] ? row.c[2].v : "";

            // Evitar generar tarjeta si la celda del ID está vacía
            if (!idVideo) return;

            // Seleccionamos un color basado en la posición de la tarjeta
            const colorActual = coloresBorde[index % coloresBorde.length];

            // Intentar HD, si falla (error 404), cargar SD
            const thumbHD = `https://img.youtube.com/vi/${idVideo}/maxresdefault.jpg`;
            const thumbSD = `https://img.youtube.com/vi/${idVideo}/hqdefault.jpg`;

            // Construcción de la tarjeta con las clases exactas del carrusel
            const card = `
                <div class="flex-none w-full md:w-[calc(50%-12px)] snap-start bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-b-4 ${colorActual} flex flex-col group">
                    
                    <div class="aspect-video relative cursor-pointer bg-slate-900 overflow-hidden" 
                        id="container-${idVideo}"
                        onclick="loadVideo('${idVideo}')">
                        
                        <img src="${thumbHD}" 
                            onerror="this.onerror=null; this.src='${thumbSD}';" 
                            alt="${titulo}" 
                            class="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-500">
                        
                        <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                            <div class="bg-dark group-hover:bg-brand text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 ml-1">
                                    <path fill-rule="evenodd" d="M4.5 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold mb-2 text-dark group-hover:text-accent transition-colors">${titulo}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed line-clamp-2">${descripcion}</p>
                    </div>
                </div>
            `;
            
            // Usamos insertAdjacentHTML (Es más rápido y seguro que innerHTML +=)
            contenedor.insertAdjacentHTML('beforeend', card);
        });
    })
    .catch(err => {
        console.error(err);
        document.getElementById('contenedor-videos').innerHTML = '<p class="text-red-500 text-center w-full py-10 font-bold">Error al cargar los videos de la galería.</p>';
    });

// Función para inyectar el iframe al hacer clic
function loadVideo(id) {
    const container = document.getElementById(`container-${id}`);
    
    // Le agregamos ?autoplay=1 y ?rel=0 para mejorar la experiencia
    container.innerHTML = `
        <iframe 
            class="absolute inset-0 w-full h-full" 
            src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>`;
}

// ==========================================
// LÓGICA DE BOTONES DEL CARRUSEL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const contenedor = document.getElementById('contenedor-videos');

    if (btnPrev && btnNext && contenedor) {
        // Función para calcular cuánto desplazar (el ancho de una tarjeta + el espacio 'gap')
        const getScrollAmount = () => {
            // Buscamos la primera tarjeta inyectada para saber su ancho
            const primeraTarjeta = contenedor.querySelector('.flex-none');
            // Si hay tarjeta, tomamos su ancho + los 24px del gap-6. Si no, usamos la mitad del contenedor por defecto.
            return primeraTarjeta ? primeraTarjeta.offsetWidth + 24 : contenedor.clientWidth / 2;
        };

        btnNext.addEventListener('click', () => {
            contenedor.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        btnPrev.addEventListener('click', () => {
            contenedor.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });
    }
});


// CONTADOR PARA EL BANNER DE ALERTA
const targetDate = new Date("August 17, 2026 12:00:00").getTime();

setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = d < 10 ? "0"+d : d;
    document.getElementById("hours").innerText = h < 10 ? "0"+h : h;
    document.getElementById("minutes").innerText = m < 10 ? "0"+m : m;
    document.getElementById("seconds").innerText = s < 10 ? "0"+s : s;
}, 1000);

// -------
// MAPAS
//---------

document.addEventListener("DOMContentLoaded", () => {
        
        // 1. Configuración principal
        const configMapas = {
            rutaSVG: 'assets/mapas/mapa.svg', // Reemplaza con el nombre de tu archivo unificado
            peru: {
                colorClase: 'fill-brand', // Para fijar el color
                textColor: 'text-dark', // Color del texto del nombre
                regiones: ['amazonas', 'cajamarca', 'piura', 'tumbes', 'lambayeque', 'loreto']
            },
            ecuador: {
                colorClase: 'fill-accent', 
                textColor: 'text-dark', 
                regiones: ['sucumbios', 'orellana', 'pastaza', 'morona_santiago', 'el_oro', 'loja', 'zamora']
            }
        };

        const contenedorWrapper = document.getElementById('mapa-svg-wrapper');
        const etiquetaContenedor = document.getElementById('etiqueta-region');
        const contenedorMapa = document.getElementById('contenedor-mapa-binacional');
        
        let regionActiva = null; // Guarda la región a la que se le hizo clic

        // 2. Cargar el mapa SVG
        fetch(configMapas.rutaSVG)
            .then(response => response.text())
            .then(svgText => {
                contenedorWrapper.innerHTML = svgText;
                const svgElement = contenedorWrapper.querySelector('svg');
                
                if(!svgElement) return;

                svgElement.classList.add('w-full', 'h-full', 'max-h-[600px]');
                const paths = svgElement.querySelectorAll('path, g');

                paths.forEach(path => {
                    const regionId = (path.id || '').toLowerCase().replace(/\s+/g, '_');
                    const isPeru = configMapas.peru.regiones.includes(regionId);
                    const isEcuador = configMapas.ecuador.regiones.includes(regionId);
                    
                    if (isPeru || isEcuador) {
                        const configPais = isPeru ? configMapas.peru : configMapas.ecuador;
                        const regionName = path.getAttribute('name') || path.id || 'Región';

                        // Estilos base
                        path.classList.add('fill-slate-300', 'transition-colors', 'duration-300', 'cursor-pointer');

                        // Evento: Mouse Entra (Hover)
                        path.addEventListener('mouseenter', (e) => {
                            if (regionActiva !== path) {
                                path.classList.remove('fill-slate-300');
                                path.classList.add(configPais.colorClase, 'opacity-70');
                                
                                // Mostrar etiqueta solo si no hay una región fijada por clic
                                if (!regionActiva) {
                                    etiquetaContenedor.textContent = regionName;
                                    etiquetaContenedor.className = `absolute pointer-events-none z-20 text-xl font-extrabold drop-shadow-lg whitespace-nowrap ${configPais.textColor}`;
                                    etiquetaContenedor.style.opacity = '1';
                                }
                            }
                        });

                        // Evento: Mouse se Mueve (Seguir cursor en Hover)
                        path.addEventListener('mousemove', (e) => {
                            if (!regionActiva) {
                                const rect = contenedorMapa.getBoundingClientRect();
                                // Centrar ligeramente el texto respecto al cursor
                                etiquetaContenedor.style.left = `${e.clientX - rect.left}px`;
                                etiquetaContenedor.style.top = `${e.clientY - rect.top - 30}px`; 
                            }
                        });

                        // Evento: Mouse Sale
                        path.addEventListener('mouseleave', () => {
                            if (regionActiva !== path) {
                                path.classList.remove(configPais.colorClase, 'opacity-70');
                                path.classList.add('fill-slate-300');
                                
                                if (!regionActiva) {
                                    etiquetaContenedor.style.opacity = '0';
                                }
                            }
                        });

                        // Evento: Clic (Fijar región y centrar texto)
                        path.addEventListener('click', () => {
                            // 1. Limpiar la región anterior si existe
                            if (regionActiva && regionActiva !== path) {
                                const paisAnterior = configMapas.peru.regiones.includes(regionActiva.id) ? configMapas.peru : configMapas.ecuador;
                                regionActiva.classList.remove(paisAnterior.colorClase, 'opacity-100');
                                regionActiva.classList.add('fill-slate-300');
                            }

                            // 2. Establecer nueva región activa
                            regionActiva = path;
                            path.classList.remove('opacity-70', 'fill-slate-300');
                            path.classList.add(configPais.colorClase, 'opacity-100'); // Opacidad al 100% para resaltar

                            // 3. Calcular centro matemático de la región (Bounding Box)
                            const bbox = path.getBoundingClientRect();
                            const containerRect = contenedorMapa.getBoundingClientRect();
                            
                            const centerX = (bbox.left - containerRect.left) + (bbox.width / 2);
                            const centerY = (bbox.top - containerRect.top) + (bbox.height / 2);

                            // 4. Actualizar y posicionar etiqueta permanentemente en el centro
                            etiquetaContenedor.textContent = regionName;
                            etiquetaContenedor.className = `absolute pointer-events-none z-20 text-xl font-extrabold drop-shadow-md whitespace-nowrap ${configPais.textColor}`;
                            
                            // Ajustar transform para que el centro del texto quede exactamente en el centro de la región
                            etiquetaContenedor.style.left = `${centerX}px`;
                            etiquetaContenedor.style.top = `${centerY}px`;
                            etiquetaContenedor.style.transform = 'translate(-50%, -50%)'; 
                            etiquetaContenedor.style.opacity = '1';
                        });

                    } else {
                        // Regiones no convocadas (gris inactivo)
                        path.classList.add('fill-slate-100');
                    }
                });

                // Si se hace clic fuera del mapa (en el contenedor), deseleccionar todo
                contenedorMapa.addEventListener('click', (e) => {
                    if (e.target === contenedorWrapper || e.target === contenedorMapa) {
                        if (regionActiva) {
                            const paisAnterior = configMapas.peru.regiones.includes(regionActiva.id) ? configMapas.peru : configMapas.ecuador;
                            regionActiva.classList.remove(paisAnterior.colorClase, 'opacity-100');
                            regionActiva.classList.add('fill-slate-300');
                            regionActiva = null;
                            etiquetaContenedor.style.opacity = '0';
                        }
                    }
                });
            })
            .catch(error => console.error('Error cargando SVG binacional:', error));
    });


document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. LÓGICA DE BOTONES DEL CARRUSEL DE FOTOS
    // ==========================================
    const btnPrevFotos = document.getElementById('btn-prev-fotos');
    const btnNextFotos = document.getElementById('btn-next-fotos');
    const carruselFotos = document.getElementById('carrusel-fotos');

    if (btnPrevFotos && btnNextFotos && carruselFotos) {
        const getScrollAmountFotos = () => {
            const primeraFoto = carruselFotos.querySelector('.flex-none');
            // Ancho de la foto + 16px (que equivale a la clase gap-4 en Tailwind)
            return primeraFoto ? primeraFoto.offsetWidth + 16 : carruselFotos.clientWidth / 2;
        };

        btnNextFotos.addEventListener('click', () => {
            carruselFotos.scrollBy({ left: getScrollAmountFotos(), behavior: 'smooth' });
        });

        btnPrevFotos.addEventListener('click', () => {
            carruselFotos.scrollBy({ left: -getScrollAmountFotos(), behavior: 'smooth' });
        });
    }

    // ==========================================
    // 2. LÓGICA DEL LIGHTBOX (ZOOM DE FOTOS)
    // ==========================================
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImage');
    const body = document.body;

    if (carruselFotos && modal && modalImg) {
        // SOLUCIÓN: Seleccionamos el contenedor padre (.flex-none) en lugar de la etiqueta <img> directa
        const tarjetasFoto = carruselFotos.querySelectorAll('.flex-none');

        tarjetasFoto.forEach(tarjeta => {
            tarjeta.addEventListener('click', () => {
                // Una vez que hacemos clic en la tarjeta, buscamos la imagen que está adentro
                const img = tarjeta.querySelector('img');
                
                if (img) {
                    // Copiamos los datos al Lightbox
                    modalImg.src = img.src;
                    modalImg.alt = img.alt;
                    
                    // Mostramos el modal
                    modal.classList.remove('hidden');
                    body.classList.add('overflow-hidden'); // Bloqueamos el scroll de la página

                    // Pequeño delay para que la transición suave funcione
                    setTimeout(() => {
                        modal.classList.remove('opacity-0');
                        modalImg.classList.remove('scale-95'); 
                    }, 10);
                }
            });
        });
    }
});

// ==========================================
// 3. FUNCIONES PARA CERRAR EL LIGHTBOX
// ==========================================
function cerrarLightbox(event) {
    const modal = document.getElementById('lightboxModal');
    // Solo cierra si el clic fue exactamente en el fondo negro, no en la foto
    if (event.target === modal) {
        forzarCerrarLightbox();
    }
}

function forzarCerrarLightbox() {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImage');
    const body = document.body;

    // Iniciamos animaciones de salida (desvanecimiento y zoom out)
    modal.classList.add('opacity-0');
    modalImg.classList.add('scale-95');

    // Esperamos a que termine la animación de CSS (300ms) antes de ocultar el HTML
    setTimeout(() => {
        modal.classList.add('hidden');
        body.classList.remove('overflow-hidden'); // Reactivamos el scroll normal
        modalImg.src = ''; // Vaciamos la imagen
    }, 300);
}

// Permitir cerrar con la tecla 'Esc' en teclados
document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('lightboxModal');
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        forzarCerrarLightbox();
    }
});

/* =========================================
   HORARIOS DE EVALUACIÓN (Google Sheets)
========================================= */

// 1. Configuración de cada área (Ahora Tecnología está dividida en dos hojas/enlaces)
const configHorarios = {
    cientifica: {
        dia: "Lunes, 7 de septiembre",
        horarioGeneral: "02:00 PM - 04:30 PM",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBjBr7Z03U5fW1csmrZfoBJsmLK40LL0MzhiIgssqMAXtmezhBurFg0PnRCTo5NydkVsPta61_9_vH/pub?gid=0&single=true&output=csv"
    },
    ambiental: {
        dia: "Martes, 8 de septiembre",
        horarioGeneral: "09:00 AM - 01:00 PM",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBjBr7Z03U5fW1csmrZfoBJsmLK40LL0MzhiIgssqMAXtmezhBurFg0PnRCTo5NydkVsPta61_9_vH/pub?gid=1042302769&single=true&output=csv"
    },
    social: {
        dia: "Martes, 8 de septiembre",
        horarioGeneral: "09:00 AM - 01:00 PM",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBjBr7Z03U5fW1csmrZfoBJsmLK40LL0MzhiIgssqMAXtmezhBurFg0PnRCTo5NydkVsPta61_9_vH/pub?gid=1815878774&single=true&output=csv"
    },
    // Sub-áreas de Tecnología
    "tec-grupo1": {
        dia: "martes, 8 de septiembre",
        horarioGeneral: "02:00 PM - 04:30 PM",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBjBr7Z03U5fW1csmrZfoBJsmLK40LL0MzhiIgssqMAXtmezhBurFg0PnRCTo5NydkVsPta61_9_vH/pub?gid=556333468&single=true&output=csv"
    },
    "tec-grupo2": {
        dia: "Miércoles, 9 de septiembre",
        horarioGeneral: "09:00 PM - 01:00 PM",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBjBr7Z03U5fW1csmrZfoBJsmLK40LL0MzhiIgssqMAXtmezhBurFg0PnRCTo5NydkVsPta61_9_vH/pub?gid=1336803405&single=true&output=csv"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabsContainer = document.getElementById('sub-tabs-container');
    
    if (tabBtns.length === 0) return;

    // Lógica para pestañas principales
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const areaKey = e.target.getAttribute('data-area');
            
            // Reiniciar estilos de pestañas principales
            tabBtns.forEach(b => {
                b.classList.remove('bg-brand', 'text-white', 'shadow-md', 'active');
                b.classList.add('bg-slate-100', 'text-slate-600');
            });
            
            // Activar pestaña clickeada
            e.target.classList.remove('bg-slate-100', 'text-slate-600');
            e.target.classList.add('bg-brand', 'text-white', 'shadow-md', 'active');

            // Manejo especial para Tecnología e Ingeniería
            if (areaKey === 'tecnologia') {
                subTabsContainer.classList.remove('hidden');
                subTabsContainer.classList.add('flex');
                
                // Activar el grupo 1 visualmente por defecto
                resetSubTabs();
                subTabBtns[0].classList.remove('bg-slate-100', 'text-slate-600');
                subTabBtns[0].classList.add('bg-accent', 'text-white', 'shadow-sm', 'active');
                
                // Cargar datos del grupo 1
                cargarHorarios('tec-grupo1');
            } else {
                // Ocultar sub-pestañas
                subTabsContainer.classList.add('hidden');
                subTabsContainer.classList.remove('flex');
                
                // Cargar el área normal
                cargarHorarios(areaKey);
            }
        });
    });

    // Lógica para sub-pestañas (Grupos de Tecnología)
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const subKey = e.target.getAttribute('data-sub');
            
            resetSubTabs();
            
            // Activar sub-pestaña clickeada
            e.target.classList.remove('bg-slate-100', 'text-slate-600');
            e.target.classList.add('bg-accent', 'text-white', 'shadow-sm', 'active');
            
            cargarHorarios(subKey);
        });
    });

    function resetSubTabs() {
        subTabBtns.forEach(b => {
            b.classList.remove('bg-accent', 'text-white', 'shadow-sm', 'active');
            b.classList.add('bg-slate-100', 'text-slate-600');
        });
    }

    // Cargar la primera pestaña por defecto
    cargarHorarios('cientifica');
});

async function cargarHorarios(claveArea) {
    const config = configHorarios[claveArea];
    
    // Actualizar Información General (Día y Hora)
    document.getElementById('info-dia').textContent = config.dia;
    document.getElementById('info-horario').textContent = config.horarioGeneral;
    
    const tbody = document.getElementById('tabla-proyectos');
    const loader = document.getElementById('loader-tabla');
    
    // Mostrar Loader y limpiar tabla
    loader.classList.remove('hidden');
    loader.style.opacity = '1';
    tbody.innerHTML = '';

    try {
        const response = await fetch(config.csvUrl);
        if (!response.ok) throw new Error("Conexión fallida");
        
        const csvText = await response.text();
        const filas = parseCSV(csvText);
        
        filas.slice(1).forEach(fila => {
            if (!fila[0] || fila.length < 5) return; 

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors group border-b border-slate-100';
            
            tr.innerHTML = `
                <td class="py-4 px-6 font-black text-dark bg-slate-50/50 text-center">${fila[0]}</td>
                <td class="py-4 px-6 text-slate-600">${fila[1]}</td>
                <td class="py-4 px-6 text-slate-600">${fila[2]}</td>
                <td class="py-4 px-6 font-bold text-dark">${fila[3]}</td>
                <td class="py-4 px-2 font-extrabold text-accent bg-accent/5 text-center">${fila[4]}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-12 text-center">
                    <span class="text-4xl block mb-2">⚠️</span>
                    <p class="text-red-500 font-bold">No se pudieron cargar los horarios en este momento.</p>
                    <p class="text-slate-500 text-sm mt-1">Verifica el enlace de la hoja de cálculo o intenta recargar la página.</p>
                </td>
            </tr>
        `;
    } finally {
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 300);
    }
}

// Parseador de CSV 
function parseCSV(str) {
    const arr = [];
    let quote = false;
    let row = 0, col = 0;
    for (let c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        arr[row][col] += cc;
    }
    return arr;
}
