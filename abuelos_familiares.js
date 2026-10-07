// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const tarjetas = document.querySelectorAll('.tarjeta');       // las cuatro tarjetas
const botonesFiltro = document.querySelectorAll('.filtro');   // Todos / Favoritos
const contador = document.getElementById('contador');         // número de favoritos
const textoVacio = document.getElementById('vacio');          // mensaje "sin favoritos"
const resumen = document.getElementById('resumen');           // suma de edades
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'abuelos_estado';
// ===== ESTADO POR DEFECTO =====
// favoritos: ids marcados | recuerdos: texto por abuelo | filtro: vista actual
const estadoInicial = { favoritos: [], recuerdos: {}, filtro: 'todos' };
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== CALCULAR LAS EDADES =====
// La edad es el año actual menos el año de nacimiento (aproximada)
function calcularEdades() {
    const anioActual = new Date().getFullYear();
    let suma = 0;
    document.querySelectorAll('.edad').forEach(etiqueta => {
        const edad = anioActual - Number(etiqueta.dataset.nacimiento);
        etiqueta.textContent = edad;
        suma += edad;
    });
    resumen.textContent = `Entre los cuatro suman ${suma} años de historias.`;
}
// ===== MARCAR O QUITAR UN FAVORITO =====
function alternarFavorito(id) {
    if (estado.favoritos.includes(id)) {
        estado.favoritos = estado.favoritos.filter(f => f !== id);  // lo quitamos
    } else {
        estado.favoritos.push(id);                                   // lo agregamos
    }
    guardarEstado();
    dibujarPantalla();
}
// ===== CAMBIAR EL FILTRO (todos o favoritos) =====
function cambiarFiltro(filtro) {
    estado.filtro = filtro;
    guardarEstado();
    dibujarPantalla();
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    let visibles = 0;  // cuántas tarjetas se están mostrando
    tarjetas.forEach(tarjeta => {
        const esFavorita = estado.favoritos.includes(tarjeta.dataset.id);
        // Resalta la tarjeta y cambia el texto del botón
        tarjeta.classList.toggle('favorita', esFavorita);
        tarjeta.querySelector('[data-fav]').textContent =
            esFavorita ? '♥ Favorito' : '♡ Favorito';
        // Muestra u oculta la tarjeta según el filtro activo
        const mostrar = estado.filtro === 'todos' || esFavorita;
        tarjeta.hidden = !mostrar;
        if (mostrar) visibles++;
    });
    // Marca como activo el botón del filtro actual
    botonesFiltro.forEach(b => b.classList.toggle('activo', b.dataset.filtro === estado.filtro));
    contador.textContent = estado.favoritos.length;  // actualiza el contador
    textoVacio.hidden = visibles > 0;                // mensaje si no hay tarjetas
}
// ===== RESTAURAR LOS RECUERDOS EN LOS CAMPOS DE TEXTO =====
function cargarRecuerdos() {
    tarjetas.forEach(tarjeta => {
        tarjeta.querySelector('textarea').value = estado.recuerdos[tarjeta.dataset.id] || '';
    });
}
// ===== EVENTOS =====
// Un solo "click" en el documento detecta qué botón se pulsó
document.addEventListener('click', evento => {
    const botonFav = evento.target.closest('[data-fav]');
    const botonFiltro = evento.target.closest('[data-filtro]');
    if (botonFav) alternarFavorito(botonFav.closest('.tarjeta').dataset.id);
    if (botonFiltro) cambiarFiltro(botonFiltro.dataset.filtro);
});
// Cada vez que se escribe un recuerdo, se guarda al instante
document.addEventListener('input', evento => {
    if (!evento.target.matches('textarea')) return;
    estado.recuerdos[evento.target.closest('.tarjeta').dataset.id] = evento.target.value;
    guardarEstado();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
calcularEdades();   // calcula las edades y su suma
cargarRecuerdos();  // recupera los recuerdos escritos
dibujarPantalla();  // recupera favoritos y filtro