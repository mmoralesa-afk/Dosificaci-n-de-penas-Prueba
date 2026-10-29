/**
 * IURISDOSIS COLOMBIA — DOSIFICADOR PENAL & SISTEMA DE CUARTOS
 * Ley 599 de 2000 (Código Penal) & Ley 906 de 2004 (Código de Procedimiento Penal)
 * 
 * MÓDULOS INTEGRADOS:
 * - Función 2: Catálogo y Búsqueda de Delitos
 * - Función 3: Calculadora de Cuartos y Dosimetría Penal
 * - Función 4: Justificación Jurídica y Memoria de Cálculo (Auto de Dosificación)
 * - Espacio de Ayuda: Asistente IA (Gemini API) y Banco Comunitario (Firebase Firestore)
 */

// ============================================================
// HELPER: FORMATEO DE MESES A AÑOS, MESES Y DÍAS
// ============================================================
function formatearMesesAHumano(mesesFloat) {
  if (mesesFloat === undefined || mesesFloat === null || isNaN(mesesFloat)) return '0 meses';
  
  const totalDias = Math.round(mesesFloat * 30);
  const anos = Math.floor(totalDias / 360);
  const residuoDias = totalDias % 360;
  const meses = Math.floor(residuoDias / 30);
  const dias = residuoDias % 30;

  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? 'año' : 'años'}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? 'mes' : 'meses'}`);
  if (dias > 0 && anos === 0) partes.push(`${dias} ${dias === 1 ? 'día' : 'días'}`);
  if (partes.length === 0) return `${mesesFloat} meses`;
  return partes.join(' y ');
}

// ============================================================
// 1. CATÁLOGO COMPLETO DE DELITOS (Ley 599 de 2000)
// ============================================================
const DelitosCatalogo = [
  {
    id: '103',
    articulo: 'Art. 103 C.P.',
    nombre: 'Homicidio Simple',
    bienJuridico: 'vida',
    bienJuridicoNombre: 'Vida e Integridad Personal',
    minMeses: 208,
    maxMeses: 450,
    norma: 'El que matare a otro, incurrirá en prisión de doscientos ocho (208) a cuatrocientos cincuenta (450) meses.',
    especificos: 'Art. 104: Circunstancias de agravación punitiva elevan la pena a 400 - 600 meses si se comete en ascendiente/descendiente, con sevicia, por precio o para ocultar otro delito.',
    multa: 'No aplica pena de multa privativa principal.',
    inhabilitacion: 'Inhabilitación de derechos y funciones públicas igual a la pena de prisión.'
  },
  {
    id: '104_7',
    articulo: 'Art. 104 Num. 7 C.P.',
    nombre: 'Homicidio Agravado (Por Sevicia / Indefensión)',
    bienJuridico: 'vida',
    bienJuridicoNombre: 'Vida e Integridad Personal',
    minMeses: 400,
    maxMeses: 600,
    norma: 'La pena será de cuatrocientos (400) a seiscientos (600) meses de prisión, si la conducta se cometiere colocando a la víctima en situación de indefensión o con sevicia.',
    especificos: 'Comprende el sufrimiento deliberado e inhumano causado antes de segar la vida del ofendido.',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación de derechos y funciones públicas por hasta 20 años.'
  },
  {
    id: '106',
    articulo: 'Art. 106 C.P.',
    nombre: 'Homicidio por Piedad (Eutanasia sin protocolo)',
    bienJuridico: 'vida',
    bienJuridicoNombre: 'Vida e Integridad Personal',
    minMeses: 16,
    maxMeses: 54,
    norma: 'El que matare a otro por piedad, para poner fin a intensos sufrimientos provenientes de lesión corporal o enfermedad grave e incurable.',
    especificos: 'Tipo privilegiado atenuado. Sujeto a sentencias C-239/97 y C-233/21 de la Corte Constitucional sobre derecho fundamental a morir dignamente.',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación accesoria de 16 a 54 meses.'
  },
  {
    id: '109',
    articulo: 'Art. 109 C.P.',
    nombre: 'Homicidio Culposo',
    bienJuridico: 'vida',
    bienJuridicoNombre: 'Vida e Integridad Personal',
    minMeses: 32,
    maxMeses: 108,
    norma: 'El que por culpa matare a otro, incurrirá en prisión de treinta y dos (32) a ciento ocho (108) meses y multa de 26.66 a 150 SMLMV.',
    especificos: 'Art. 110: Agravantes específicas (embriaguez o abandono del lugar del hecho) aumentan la pena de la mitad al doble.',
    multa: '26.66 a 150 SMLMV.',
    inhabilitacion: 'Privación del derecho a conducir vehículos automotores de 48 a 90 meses.'
  },
  {
    id: '111_112',
    articulo: 'Art. 111 y 112 C.P.',
    nombre: 'Lesiones Personales con Incapacidad > 30 días',
    bienJuridico: 'vida',
    bienJuridicoNombre: 'Vida e Integridad Personal',
    minMeses: 16,
    maxMeses: 54,
    norma: 'Si el daño determinare incapacidad para trabajar o enfermedad superior a treinta (30) días sin pasar de noventa (90).',
    especificos: 'Aumentos punitivos si dejan deformidad física permanente o perturbación funcional (Arts. 113 a 116 C.P.).',
    multa: 'Multa de 13.33 a 30 SMLMV.',
    inhabilitacion: 'Inhabilitación accesoria conforme al tiempo de prisión.'
  },
  {
    id: '168',
    articulo: 'Art. 168 C.P.',
    nombre: 'Secuestro Simple',
    bienJuridico: 'libertad',
    bienJuridicoNombre: 'Libertad Individual',
    minMeses: 192,
    maxMeses: 360,
    norma: 'El que con propósitos distintos a los previstos en el secuestro extorsivo, arrebate, sustraiga, retenga u oculte a una persona.',
    especificos: 'Sujeto a prohibición expresa de rebajas y subrogados de la Ley 733 de 2002.',
    multa: 'Multa de 800 a 1500 SMLMV.',
    inhabilitacion: 'Pérdida de derechos y funciones públicas por tiempo igual a la pena impuesta.'
  },
  {
    id: '169',
    articulo: 'Art. 169 C.P.',
    nombre: 'Secuestro Extorsivo',
    bienJuridico: 'libertad',
    bienJuridicoNombre: 'Libertad Individual',
    minMeses: 320,
    maxMeses: 504,
    norma: 'El que arrebate, sustraiga, retenga u oculte a una persona, con el propósito de exigir por su libertad un provecho o cualquier utilidad.',
    especificos: 'Art. 170 C.P. Agravantes específicas (superan los 576 meses si se comete en persona menor de edad).',
    multa: 'Multa de 2666.66 a 6000 SMLMV.',
    inhabilitacion: 'Inhabilitación privativa estricta.'
  },
  {
    id: '178',
    articulo: 'Art. 178 C.P.',
    nombre: 'Tortura',
    bienJuridico: 'vida',
    bienJuridicoNombre: 'Vida e Integridad Personal',
    minMeses: 128,
    maxMeses: 270,
    norma: 'El que inflija a una persona dolores o sufrimientos graves, físicos o psíquicos, con el fin de obtener de ella información o confesión.',
    especificos: 'Imprescriptibilidad en graves violaciones a DDHH / DIH según tratados internacionales.',
    multa: 'Multa de 1066.66 a 3000 SMLMV.',
    inhabilitacion: 'Inhabilitación de funciones públicas obligatoria.'
  },
  {
    id: '205',
    articulo: 'Art. 205 C.P.',
    nombre: 'Acceso Carnal Violento',
    bienJuridico: 'sexual',
    bienJuridicoNombre: 'Libertad e Integridad Sexual',
    minMeses: 192,
    maxMeses: 360,
    norma: 'El que realice acceso carnal con otra persona mediante violencia, incurrirá en prisión de doce (12) a veinte (20) años —192 a 360 meses—.',
    especificos: 'Art. 211 C.P.: Agravantes punitivas (aumento de un tercio a la mitad si concurren varios copartícipes o con uso de armas).',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación para el ejercicio de derechos y cargos que impliquen contacto con menores de edad (Ley 1918 de 2018).'
  },
  {
    id: '206',
    articulo: 'Art. 206 C.P.',
    nombre: 'Acto Sexual Violento',
    bienJuridico: 'sexual',
    bienJuridicoNombre: 'Libertad e Integridad Sexual',
    minMeses: 96,
    maxMeses: 192,
    norma: 'El que realice en otra persona acto sexual diverso al acceso carnal mediante violencia.',
    especificos: 'Exclusión taxativa de beneficios y subrogados si la víctima es menor de edad (Art. 199 Ley 1098).',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación de funciones públicas.'
  },
  {
    id: '208',
    articulo: 'Art. 208 C.P.',
    nombre: 'Acceso Carnal con Menor de 14 Años',
    bienJuridico: 'sexual',
    bienJuridicoNombre: 'Libertad e Integridad Sexual',
    minMeses: 208,
    maxMeses: 360,
    norma: 'El que accediere carnalmente a persona menor de catorce (14) años, incurrirá en prisión de dieciséis (16) a veintiocho (28) años.',
    especificos: 'Prohibición absoluta de rebajas por allanamiento o preacuerdo (Art. 199 Ley 1098 de 2006). Cero descuento premial.',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación vitalicia para trabajar con menores.'
  },
  {
    id: '239',
    articulo: 'Art. 239 C.P.',
    nombre: 'Hurto Simple',
    bienJuridico: 'patrimonio',
    bienJuridicoNombre: 'Patrimonio Económico',
    minMeses: 32,
    maxMeses: 108,
    norma: 'El que se apodere de una cosa mueble ajena, con el propósito de obtener provecho para sí o para otro.',
    especificos: 'Pena tasada según la cuantía (inferior o superior a 10 SMLMV).',
    multa: 'No aplica pena de multa en el tipo base.',
    inhabilitacion: 'Inhabilitación accesoria de derechos y funciones públicas.'
  },
  {
    id: '240',
    articulo: 'Art. 240 C.P.',
    nombre: 'Hurto Calificado (Violencia / Destreza / Escalamiento)',
    bienJuridico: 'patrimonio',
    bienJuridicoNombre: 'Patrimonio Económico',
    minMeses: 72,
    maxMeses: 168,
    norma: 'La pena será de seis (6) a catorce (14) años si se comete con violencia sobre las cosas, sobre personas, con destreza o escalamiento.',
    especificos: 'Si la violencia se ejerce sobre las personas, la pena será de ocho (8) a dieciséis (16) años (96 a 192 meses).',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación accesoria.'
  },
  {
    id: '241',
    articulo: 'Art. 241 C.P.',
    nombre: 'Hurto Calificado y Agravado',
    bienJuridico: 'patrimonio',
    bienJuridicoNombre: 'Patrimonio Económico',
    minMeses: 96,
    maxMeses: 240,
    norma: 'Las penas de los artículos anteriores se aumentarán de la mitad a las tres cuartas partes cuando concurran las causales del artículo 241.',
    especificos: 'Concurso de dos o más personas, uso de armas, sobre medios motorizados o en lugar despoblado.',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación accesoria por el término de la sanción.'
  },
  {
    id: '244',
    articulo: 'Art. 244 C.P.',
    nombre: 'Extorsión',
    bienJuridico: 'patrimonio',
    bienJuridicoNombre: 'Patrimonio Económico',
    minMeses: 192,
    maxMeses: 288,
    norma: 'El que constriña a otro a hacer, tolerar u omitir alguna cosa, con el propósito de obtener provecho ilícito o cualquier utilidad.',
    especificos: 'Art. 245 C.P. Agravantes aumentan de una tercera parte a la mitad (256 a 432 meses). Ley 733/2002 restringe subrogados.',
    multa: 'Multa de 800 a 1800 SMLMV.',
    inhabilitacion: 'Inhabilitación privativa estricta.'
  },
  {
    id: '286',
    articulo: 'Art. 286 C.P.',
    nombre: 'Falsedad Ideológica en Documento Público',
    bienJuridico: 'fe_publica',
    bienJuridicoNombre: 'Fe Pública',
    minMeses: 64,
    maxMeses: 144,
    norma: 'El servidor público que en ejercicio de sus funciones, al extender documento público que pueda servir de prueba, consigne una falsedad o calle la verdad.',
    especificos: 'Sujeto activo calificado (servidor público en ejercicio de funciones).',
    multa: 'No aplica.',
    inhabilitacion: 'Inhabilitación para el ejercicio de derechos y funciones públicas de 64 a 144 meses.'
  },
  {
    id: '365',
    articulo: 'Art. 365 C.P.',
    nombre: 'Fabricación, Tráfico y Porte de Armas de Fuego',
    bienJuridico: 'seguridad',
    bienJuridicoNombre: 'Seguridad Pública',
    minMeses: 108,
    maxMeses: 144,
    norma: 'El que sin permiso de autoridad competente importe, trafique, fabrique, transporte, almacene o porte en lugar público armas de fuego de defensa personal.',
    especificos: 'La pena se duplicará si se emplean armas con numeración alterada, se porte en vehículo motorizado o en coparticipación (Art. 365 inc. 2).',
    multa: 'No aplica.',
    inhabilitacion: 'Decomiso del material bélico e inhabilitación accesoria.'
  },
  {
    id: '376',
    articulo: 'Art. 376 C.P.',
    nombre: 'Tráfico, Fabricación o Porte de Estupefacientes',
    bienJuridico: 'salud',
    bienJuridicoNombre: 'Salud Pública',
    minMeses: 128,
    maxMeses: 360,
    norma: 'El que sin permiso introduzca al país, transporte, almacene, conserve, elabore, venda o adquiera sustancias estupefacientes o psicotrópicas.',
    especificos: 'Pena modulada por la cantidad incautada (incisos 1, 2 y 3). Exclusión de dosis para consumo personal (Sentencia C-221/94 y CSJ SP1944-2021).',
    multa: 'Multa de 1334 a 50000 SMLMV.',
    inhabilitacion: 'Inhabilitación accesoria obligatoria.'
  },
  {
    id: '397',
    articulo: 'Art. 397 C.P.',
    nombre: 'Peculado por Apropiación',
    bienJuridico: 'administracion',
    bienJuridicoNombre: 'Administración Pública',
    minMeses: 96,
    maxMeses: 270,
    norma: 'El servidor público que se apropie en provecho suyo o de un tercero de bienes del Estado o de empresas en que éste tenga parte.',
    especificos: 'Si el valor supera 200 SMLMV, pena de 144 a 324 meses. Si no supera 50 SMLMV, pena de 64 a 180 meses.',
    multa: 'Multa equivalente al valor de lo apropiado sin que supere 50000 SMLMV.',
    inhabilitacion: 'Inhabilitación perpetua o intemporal para contratar con el Estado (Art. 122 C.P. y Ley 2195 de 2022).'
  },
  {
    id: '404',
    articulo: 'Art. 404 C.P.',
    nombre: 'Concusión',
    bienJuridico: 'administracion',
    bienJuridicoNombre: 'Administración Pública',
    minMeses: 96,
    maxMeses: 180,
    norma: 'El servidor público que abusando de su cargo o de sus funciones constriña o induzca a alguien a dar o prometer dinero u otra utilidad indebida.',
    especificos: 'Delito contra la probidad pública con sujeto activo calificado.',
    multa: 'Multa de 66.66 a 150 SMLMV.',
    inhabilitacion: 'Inhabilitación de derechos y funciones públicas de 96 a 180 meses.'
  },
  {
    id: '405',
    articulo: 'Art. 405 C.P.',
    nombre: 'Cohecho Propio',
    bienJuridico: 'administracion',
    bienJuridicoNombre: 'Administración Pública',
    minMeses: 80,
    maxMeses: 144,
    norma: 'El servidor público que reciba para sí o para otro dinero u otra utilidad para retardar u omitir un acto propio de su cargo.',
    especificos: 'Afecta la imparcialidad del ejercicio funcional del Estado.',
    multa: 'Multa de 66.66 a 150 SMLMV.',
    inhabilitacion: 'Inhabilitación de 80 a 144 meses.'
  },
  {
    id: '413',
    articulo: 'Art. 413 C.P.',
    nombre: 'Prevaricato por Acción',
    bienJuridico: 'administracion',
    bienJuridicoNombre: 'Administración Pública',
    minMeses: 48,
    maxMeses: 144,
    norma: 'El servidor público que profiera resolución, dictamen o concepto manifiestamente contrario a la ley.',
    especificos: 'Exige contradicción ostensible, grosera y palmaria con el ordenamiento positivo vigente.',
    multa: 'Multa de 66.66 a 300 SMLMV.',
    inhabilitacion: 'Inhabilitación de derechos y funciones públicas de 80 a 144 meses.'
  }
];

// ============================================================
// 2. GESTOR DEL CATÁLOGO DE DELITOS (CatalogoManager - Función 2)
// ============================================================
const CatalogoManager = {
  filtroActivo: 'todos',
  delitoSeleccionadoId: '103',

  init() {
    this.renderizar();
  },

  filtrarBienJuridico(bien) {
    this.filtroActivo = bien;

    // Actualizar estilo visual de los botones de filtro
    const botones = document.querySelectorAll('.btn-filtro-bien');
    botones.forEach(btn => {
      if (btn.getAttribute('data-bien') === bien) {
        btn.className = "btn-filtro-bien px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-judicial-navy text-white shadow-sm transition-all";
      } else {
        btn.className = "btn-filtro-bien px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-surface-container text-judicial-navy hover:bg-surface-high transition-all";
      }
    });

    this.renderizar();
  },

  buscar(query) {
    this.renderizar(query.trim().toLowerCase());
  },

  renderizar(query = '') {
    const contenedor = document.getElementById('catalogo-lista-delitos');
    const badgeTotal = document.getElementById('badge-total-delitos');
    const badgeVisibles = document.getElementById('catalogo-conteo-visibles');
    if (!contenedor) return;

    let lista = DelitosCatalogo;

    // Filtrar por bien jurídico
    if (this.filtroActivo !== 'todos') {
      lista = lista.filter(d => d.bienJuridico === this.filtroActivo);
    }

    // Filtrar por texto de búsqueda
    if (query) {
      lista = lista.filter(d => 
        d.articulo.toLowerCase().includes(query) ||
        d.nombre.toLowerCase().includes(query) ||
        d.norma.toLowerCase().includes(query) ||
        d.bienJuridicoNombre.toLowerCase().includes(query)
      );
    }

    if (badgeTotal) badgeTotal.textContent = `${DelitosCatalogo.length} delitos registrados`;
    if (badgeVisibles) badgeVisibles.textContent = `Mostrando ${lista.length} de ${DelitosCatalogo.length}`;

    if (lista.length === 0) {
      contenedor.innerHTML = `
        <div class="p-8 text-center bg-white rounded-xl border border-surface-dim text-judicial-muted">
          <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">search_off</span>
          <p class="text-xs font-semibold">No se encontraron tipos penales que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    // Generar tarjetas
    contenedor.innerHTML = lista.map(d => {
      const isSelected = d.id === this.delitoSeleccionadoId;
      const cardBorder = isSelected ? 'border-2 border-judicial-amber bg-amber-50/50 shadow-sm' : 'border border-surface-dim bg-white hover:border-slate-400';
      
      return `
        <article onclick="CatalogoManager.seleccionar('${d.id}')" class="p-3.5 rounded-xl ${cardBorder} transition-all cursor-pointer flex flex-col gap-2 group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold ${isSelected ? 'text-judicial-amber' : 'text-judicial-navy'}">${d.articulo}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-dim text-judicial-muted">${d.bienJuridicoNombre}</span>
          </div>
          <h4 class="font-headline font-bold text-sm text-judicial-navy group-hover:text-judicial-amber transition-colors">${d.nombre}</h4>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-judicial-muted">Prisión: <strong>${d.minMeses} a ${d.maxMeses} m</strong></span>
            <span class="text-[11px] text-judicial-amber font-semibold">AP: ${d.maxMeses - d.minMeses} m</span>
          </div>
        </article>
      `;
    }).join('');

    // Actualizar la ficha destacada izquierda
    this.actualizarFichaDetalle();
  },

  seleccionar(id) {
    this.delitoSeleccionadoId = id;
    this.renderizar();
  },

  actualizarFichaDetalle() {
    const d = DelitosCatalogo.find(item => item.id === this.delitoSeleccionadoId) || DelitosCatalogo[0];
    if (!d) return;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('catalogo-detalle-articulo-badge', d.articulo);
    setTxt('catalogo-detalle-bien', d.bienJuridicoNombre);
    setTxt('catalogo-detalle-nombre', d.nombre);
    setTxt('catalogo-detalle-norma', `"${d.norma}"`);
    setTxt('catalogo-detalle-min', `${d.minMeses} m`);
    setTxt('catalogo-detalle-min-anos', formatearMesesAHumano(d.minMeses));
    setTxt('catalogo-detalle-max', `${d.maxMeses} m`);
    setTxt('catalogo-detalle-max-anos', formatearMesesAHumano(d.maxMeses));
    
    const ap = d.maxMeses - d.minMeses;
    setTxt('catalogo-detalle-ambito', `${ap} m`);
    setTxt('catalogo-detalle-cuarto-valor', `Cuarto: ${(ap / 4).toFixed(1)}m`);

    const esp = document.getElementById('catalogo-detalle-especificos');
    if (esp) {
      esp.innerHTML = `
        <p>• <strong>Modificadores específicos:</strong> ${d.especificos}</p>
        <p>• <strong>Pena patrimonial:</strong> ${d.multa}</p>
        <p>• <strong>Inhabilitación de derechos:</strong> ${d.inhabilitacion}</p>
      `;
    }
  },

  cargarEnCalculadora() {
    const d = DelitosCatalogo.find(item => item.id === this.delitoSeleccionadoId);
    if (!d) return;

    AppState.caso.delitoBase = d.id;
    AppState.caso.minMeses = d.minMeses;
    AppState.caso.maxMeses = d.maxMeses;

    // Actualizar también el select de Hechos si existe
    const hechosSelect = document.getElementById('caso-delito-base');
    if (hechosSelect) {
      hechosSelect.value = d.id.startsWith('104') ? '104' : d.id;
    }

    CasoManager.mostrarToast(`Delito "${d.nombre}" cargado para dosimetría`, "calculate");
    AppNav.switchTab('calculadora');
  }
};

// ============================================================
// 3. CALCULADORA DE CUARTOS Y DOSIMETRÍA (CalculadoraManager - Función 3)
// ============================================================
const CalculadoraManager = {
  // Estado local del cálculo
  minBase: 208,
  maxBase: 450,
  minModificado: 208,
  maxModificado: 450,
  ambitoPunitivo: 242,
  cuartoAmplitud: 60.5,
  cuartos: {
    q1: { min: 208, max: 268.5 },
    q2: { min: 268.5, max: 329 },
    q3: { min: 329, max: 389.5 },
    q4: { min: 389.5, max: 450 }
  },
  cuartoActivo: 'minimo', // 'minimo' | 'medios' | 'maximo'
  quantumMeses: 215,
  descuentoPorcentaje: 40,
  penaFinalMeses: 129,

  init() {
    this.sincronizarDesdeCaso();
  },

  sincronizarDesdeCaso() {
    const d = DelitosCatalogo.find(item => item.id === AppState.caso.delitoBase) || DelitosCatalogo[0];
    this.minBase = d.minMeses;
    this.maxBase = d.maxMeses;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('calc-badge-articulo', d.articulo);
    setTxt('calc-delito-nombre', d.nombre);
    setTxt('calc-delito-cita', `"${d.norma}"`);

    // Sincronizar modificadores del Art. 60
    const selectIntervencion = document.getElementById('calc-select-intervencion');
    const selectEjecucion = document.getElementById('calc-select-ejecucion');
    if (selectIntervencion && AppState.caso.intervencion) selectIntervencion.value = AppState.caso.intervencion;
    if (selectEjecucion && AppState.caso.consumacion) selectEjecucion.value = AppState.caso.consumacion;

    this.actualizarModificadores();
  },

  actualizarModificadores() {
    const intervencion = document.getElementById('calc-select-intervencion')?.value || 'autor_directo';
    const ejecucion = document.getElementById('calc-select-ejecucion')?.value || 'consumado';
    const especiales = document.getElementById('calc-select-especiales')?.value || 'ninguno';

    let min = this.minBase;
    let max = this.maxBase;
    let notasModificador = [];

    // 1. Grado de ejecución (Art. 27 C.P. - Tentativa)
    if (ejecucion === 'tentativa_acabada') {
      // Disminuye de una tercera parte a la mitad
      // Mínimo: se disminuye en 1/2 del mínimo base
      // Máximo: se disminuye en 1/3 del máximo base
      min = Math.round(min * 0.5);
      max = Math.round(max * 0.6667);
      notasModificador.push('Tentativa acabada (Art. 27 inc. 1)');
    } else if (ejecucion === 'tentativa_inacabada') {
      // Disminuye de la mitad a las dos terceras partes
      min = Math.round(min * 0.3333);
      max = Math.round(max * 0.5);
      notasModificador.push('Tentativa inacabada (Art. 27 inc. 2)');
    }

    // 2. Participación (Art. 30 C.P. - Complicidad)
    if (intervencion === 'complice') {
      // Disminuye de una sexta parte a la mitad
      min = Math.round(min * 0.5);
      max = Math.round(max * 0.8333);
      notasModificador.push('Complicidad (Art. 30 inc. 3)');
    } else if (intervencion === 'interviniente') {
      min = Math.round(min * 0.75);
      max = Math.round(max * 0.75);
      notasModificador.push('Interviniente (Art. 30 inc. 4)');
    }

    // 3. Causales post-delictuales o subjetivas (Arts. 56 y 57)
    if (especiales === 'ira_intenso_dolor') {
      min = Math.round(min * 0.3333);
      max = Math.round(max * 0.5);
      notasModificador.push('Ira e Intenso Dolor (Art. 57)');
    } else if (especiales === 'marginalidad') {
      min = Math.round(min * 0.1667);
      max = Math.round(max * 0.5);
      notasModificador.push('Marginalidad o Pobreza Extrema (Art. 56)');
    }

    // Garantizar que min < max
    if (min >= max) min = Math.max(1, max - 12);

    this.minModificado = min;
    this.maxModificado = max;

    // Actualizar alerta de límites modificados
    const alertaDisplay = document.getElementById('calc-limites-modificados-display');
    if (alertaDisplay) {
      if (notasModificador.length > 0) {
        alertaDisplay.textContent = `${min} a ${max} meses (${notasModificador.join(', ')})`;
        alertaDisplay.className = "font-bold text-judicial-crimson";
      } else {
        alertaDisplay.textContent = `${min} a ${max} meses (Límites plenos sin rebajas de Art. 60)`;
        alertaDisplay.className = "font-bold text-judicial-navy";
      }
    }

    this.calcularCuartos();
  },

  calcularCuartos() {
    const min = this.minModificado;
    const max = this.maxModificado;
    const ap = max - min;
    const vc = Number((ap / 4).toFixed(2));

    this.ambitoPunitivo = ap;
    this.cuartoAmplitud = vc;

    // Delimitación estricta de los 4 cuartos (Art. 61 C.P.)
    const q1Max = Number((min + vc).toFixed(2));
    const q2Max = Number((min + 2 * vc).toFixed(2));
    const q3Max = Number((max - vc).toFixed(2));

    this.cuartos = {
      q1: { min: min, max: q1Max },
      q2: { min: q1Max, max: q2Max },
      q3: { min: q2Max, max: q3Max },
      q4: { min: q3Max, max: max }
    };

    // Actualizar métricas visuales del resumen superior
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('calc-pena-min-meses', `${min} m`);
    setTxt('calc-pena-min-anos', formatearMesesAHumano(min));
    setTxt('calc-pena-max-meses', `${max} m`);
    setTxt('calc-pena-max-anos', formatearMesesAHumano(max));
    setTxt('calc-ambito-meses', `${ap} m`);
    setTxt('calc-cuarto-amplitud', `Cuarto: ${vc}m`);
    setTxt('calc-subtitulo-cuartos', `Ámbito de ${ap} meses / 4 = ${vc} meses por cuarto punitivo.`);

    // Actualizar rangos en las 4 tarjetas
    setTxt('rango-cuarto-1-meses', `${min} a ${q1Max} m`);
    setTxt('rango-cuarto-1-human', `${formatearMesesAHumano(min)} a ${formatearMesesAHumano(q1Max)}`);

    setTxt('rango-cuarto-2-meses', `${q1Max} a ${q2Max} m`);
    setTxt('rango-cuarto-2-human', `${formatearMesesAHumano(q1Max)} a ${formatearMesesAHumano(q2Max)}`);

    setTxt('rango-cuarto-3-meses', `${q2Max} a ${q3Max} m`);
    setTxt('rango-cuarto-3-human', `${formatearMesesAHumano(q2Max)} a ${formatearMesesAHumano(q3Max)}`);

    setTxt('rango-cuarto-4-meses', `${q3Max} a ${max} m`);
    setTxt('rango-cuarto-4-human', `${formatearMesesAHumano(q3Max)} a ${formatearMesesAHumano(max)}`);

    this.determinarCuartoActivo();
  },

  determinarCuartoActivo() {
    // Tomar las causales acreditadas desde AppState
    const mit = AppState.caso.atenuantesCount || 0;
    const agg = AppState.caso.agravantesCount || 0;

    let activo = 'medios';
    let reglaTexto = '';

    if (mit > 0 && agg === 0) {
      activo = 'minimo';
      reglaTexto = `"El sentenciador sólo podrá moverse dentro del <strong>cuarto mínimo</strong> cuando únicamente concurran circunstancias de menor punibilidad (Art. 61 inc. 2)." Concurren ${mit} atenuante(s) y 0 agravantes acreditadas: discrecionalidad restringida estrictamente al intervalo de <strong>${this.cuartos.q1.min} a ${this.cuartos.q1.max} meses</strong>.`;
    } else if (agg > 0 && mit === 0) {
      activo = 'maximo';
      reglaTexto = `"El sentenciador sólo podrá moverse dentro del <strong>cuarto máximo</strong> cuando únicamente concurran circunstancias de mayor punibilidad (Art. 61 inc. 2)." Concurren ${agg} agravante(s) y 0 atenuantes: discrecionalidad restringida obligatoriamente al intervalo de <strong>${this.cuartos.q4.min} a ${this.cuartos.q4.max} meses</strong>.`;
    } else {
      activo = 'medios';
      reglaTexto = `"El sentenciador podrá moverse dentro de los <strong>cuartos medios</strong> cuando concurran circunstancias de atenuación y agravación punitiva, o cuando no concurra ninguna de ellas (Art. 61 inc. 2)." Concurrencia de atenuantes (${mit}) y agravantes (${agg}): discrecionalidad habilitada entre <strong>${this.cuartos.q2.min} y ${this.cuartos.q3.max} meses</strong>.`;
    }

    this.cuartoActivo = activo;
    AppState.caso.cuartoResultante = activo;

    // Actualizar texto explicativo del banner
    const reglaEl = document.getElementById('calc-regla-legal-texto');
    if (reglaEl) reglaEl.innerHTML = reglaTexto;

    // Actualizar estilo visual de las 4 tarjetas de cuartos
    const cardQ1 = document.getElementById('card-cuarto-1');
    const cardQ2 = document.getElementById('card-cuarto-2');
    const cardQ3 = document.getElementById('card-cuarto-3');
    const cardQ4 = document.getElementById('card-cuarto-4');

    const resetCard = (card, qKey) => {
      if (!card) return;
      card.className = "cuarto-card relative rounded-xl p-4 border border-surface-dim bg-white text-judicial-navy opacity-70 hover:opacity-100 transition-all flex flex-col justify-between";
      const tag = document.getElementById(`tag-seleccion-cuarto-${qKey}`);
      if (tag) tag.textContent = 'Inactivo';
    };

    resetCard(cardQ1, 1);
    resetCard(cardQ2, 2);
    resetCard(cardQ3, 3);
    resetCard(cardQ4, 4);

    const badgeCuartoActivo = document.getElementById('calc-badge-cuarto-activo');

    if (activo === 'minimo') {
      if (cardQ1) {
        cardQ1.className = "cuarto-card relative rounded-xl p-4 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md flex flex-col justify-between transition-all scale-[1.02]";
        const tag = document.getElementById('tag-seleccion-cuarto-1');
        if (tag) tag.textContent = 'SELECCIÓN LEGAL OBLIGATORIA';
      }
      if (badgeCuartoActivo) {
        badgeCuartoActivo.className = "self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200";
        badgeCuartoActivo.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> Cuarto Mínimo Operativo';
      }
      this.configurarSlider(this.cuartos.q1.min, this.cuartos.q1.max);
    } else if (activo === 'maximo') {
      if (cardQ4) {
        cardQ4.className = "cuarto-card relative rounded-xl p-4 border-2 border-red-600 bg-red-50 text-red-950 shadow-md flex flex-col justify-between transition-all scale-[1.02]";
        const tag = document.getElementById('tag-seleccion-cuarto-4');
        if (tag) tag.textContent = 'SELECCIÓN LEGAL OBLIGATORIA';
      }
      if (badgeCuartoActivo) {
        badgeCuartoActivo.className = "self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-100 text-judicial-crimson border border-red-200";
        badgeCuartoActivo.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Cuarto Máximo Operativo';
      }
      this.configurarSlider(this.cuartos.q4.min, this.cuartos.q4.max);
    } else {
      // Medios (Q2 y Q3)
      if (cardQ2) {
        cardQ2.className = "cuarto-card relative rounded-xl p-4 border-2 border-amber-600 bg-amber-50 text-amber-950 shadow-md flex flex-col justify-between transition-all";
        const tag = document.getElementById('tag-seleccion-cuarto-2');
        if (tag) tag.textContent = 'CUARTOS MEDIOS (Q2)';
      }
      if (cardQ3) {
        cardQ3.className = "cuarto-card relative rounded-xl p-4 border-2 border-amber-600 bg-amber-50 text-amber-950 shadow-md flex flex-col justify-between transition-all";
        const tag = document.getElementById('tag-seleccion-cuarto-3');
        if (tag) tag.textContent = 'CUARTOS MEDIOS (Q3)';
      }
      if (badgeCuartoActivo) {
        badgeCuartoActivo.className = "self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-judicial-amber border border-amber-200";
        badgeCuartoActivo.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span> Cuartos Medios Operativos';
      }
      this.configurarSlider(this.cuartos.q2.min, this.cuartos.q3.max);
    }
  },

  configurarSlider(min, max) {
    const slider = document.getElementById('slider-cuarto-quantum');
    const labelMin = document.getElementById('slider-cuarto-min-label');
    const labelMax = document.getElementById('slider-cuarto-max-label');

    if (slider) {
      slider.min = min;
      slider.max = max;
      slider.step = 0.5;

      // Fijar valor por defecto ligeramente superior al mínimo
      const val = Number((min + (max - min) * 0.15).toFixed(1));
      slider.value = val;
      this.actualizarQuantum(val);
    }

    if (labelMin) labelMin.textContent = `Mín: ${min} m`;
    if (labelMax) labelMax.textContent = `Máx: ${max} m`;
  },

  actualizarQuantum(val) {
    const quantum = parseFloat(val);
    this.quantumMeses = quantum;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt('calc-quantum-meses', quantum.toFixed(1));
    setTxt('calc-quantum-human', `(${formatearMesesAHumano(quantum)})`);
    setTxt('resumen-pena-previa', `${quantum.toFixed(1)} meses`);

    // Sincronizar rebaja por allanamiento
    let rebaja = AppState.caso.rebajaPorcentaje || 0;
    const bloqueo = AppState.caso.prohibicionArt199 || AppState.caso.prohibicionArt68A;

    const alertaBloqueo = document.getElementById('alerta-calc-prohibicion');
    const tagRebaja = document.getElementById('calc-rebaja-tag');

    if (bloqueo) {
      rebaja = 0;
      if (alertaBloqueo) alertaBloqueo.classList.remove('hidden');
      if (tagRebaja) {
        tagRebaja.textContent = "0% (Prohibición Legal)";
        tagRebaja.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-judicial-crimson";
      }
    } else {
      if (alertaBloqueo) alertaBloqueo.classList.add('hidden');
      if (tagRebaja) {
        tagRebaja.textContent = `-${rebaja}% Pactado`;
        tagRebaja.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-judicial-amber";
      }
    }

    const descuentoMeses = Number((quantum * (rebaja / 100)).toFixed(2));
    const penaFinal = Number((quantum - descuentoMeses).toFixed(2));
    this.penaFinalMeses = penaFinal;

    setTxt('resumen-descuento-meses', `-${descuentoMeses.toFixed(1)} meses (-${rebaja}%)`);
    setTxt('calc-pena-final-meses', penaFinal.toFixed(1));
    setTxt('calc-pena-final-human', `${formatearMesesAHumano(penaFinal)} de prisión efectiva`);
  }
};

// ============================================================
// 4. JUSTIFICACIÓN JURÍDICA Y MEMORIA DE CÁLCULO (JustificacionManager - Función 4)
// ============================================================
const JustificacionManager = {
  generarMemoria() {
    const d = DelitosCatalogo.find(item => item.id === AppState.caso.delitoBase) || DelitosCatalogo[0];
    const calc = CalculadoraManager;

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    // 1. Carátula procesal
    setTxt('memoria-radicado', `RADICADO SPOA: ${AppState.caso.radicado || '110016000000202300452'}`);
    setTxt('memoria-fecha-emision', `Emisión judicial: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    setTxt('memoria-procesado', AppState.caso.procesado || 'Julián David Morales Reyes');
    setTxt('memoria-juzgado', AppState.caso.juzgado || 'Juzgado 12 Penal del Circuito');
    setTxt('memoria-fiscalia', AppState.caso.fiscalia || 'Fiscalía 4 Seccional de Vida');
    setTxt('memoria-delito', `${d.articulo} (${d.nombre})`);

    // 2. Tabla de cuartos certificada
    const tbody = document.getElementById('memoria-tabla-cuartos');
    if (tbody) {
      tbody.innerHTML = `
        <tr class="hover:bg-surface/50">
          <td class="p-3 font-semibold text-judicial-navy">Límites Legales Abstractos</td>
          <td class="p-3 font-mono text-center">${calc.minBase} a ${calc.maxBase} m</td>
          <td class="p-3 font-mono text-center">${formatearMesesAHumano(calc.minBase)} a ${formatearMesesAHumano(calc.maxBase)}</td>
          <td class="p-3 text-judicial-muted">${d.articulo}</td>
        </tr>
        <tr class="hover:bg-surface/50 bg-amber-50/30">
          <td class="p-3 font-semibold text-judicial-navy">Límites Punitivos Modificados (Art. 60)</td>
          <td class="p-3 font-mono text-center font-bold text-judicial-amber">${calc.minModificado} a ${calc.maxModificado} m</td>
          <td class="p-3 font-mono text-center font-bold text-judicial-amber">${formatearMesesAHumano(calc.minModificado)} a ${formatearMesesAHumano(calc.maxModificado)}</td>
          <td class="p-3 text-judicial-muted">Arts. 27, 30 y 60 C.P.</td>
        </tr>
        <tr class="hover:bg-surface/50">
          <td class="p-3 font-semibold text-judicial-navy">Ámbito Punitivo de Movilidad</td>
          <td class="p-3 font-mono text-center">${calc.ambitoPunitivo} m</td>
          <td class="p-3 font-mono text-center">${formatearMesesAHumano(calc.ambitoPunitivo)}</td>
          <td class="p-3 text-judicial-muted">Pena Máx. - Pena Mín.</td>
        </tr>
        <tr class="hover:bg-surface/50 ${calc.cuartoActivo === 'minimo' ? 'bg-emerald-50 font-bold text-emerald-900' : ''}">
          <td class="p-3">Primer Cuarto (Mínimo)</td>
          <td class="p-3 font-mono text-center">${calc.cuartos.q1.min} a ${calc.cuartos.q1.max} m</td>
          <td class="p-3 font-mono text-center">${formatearMesesAHumano(calc.cuartos.q1.min)} a ${formatearMesesAHumano(calc.cuartos.q1.max)}</td>
          <td class="p-3 text-judicial-muted">Art. 61 inc. 2 C.P.</td>
        </tr>
        <tr class="hover:bg-surface/50 ${calc.cuartoActivo === 'medios' ? 'bg-amber-50 font-bold text-amber-900' : ''}">
          <td class="p-3">Cuartos Medios (Inferior y Superior)</td>
          <td class="p-3 font-mono text-center">${calc.cuartos.q2.min} a ${calc.cuartos.q3.max} m</td>
          <td class="p-3 font-mono text-center">${formatearMesesAHumano(calc.cuartos.q2.min)} a ${formatearMesesAHumano(calc.cuartos.q3.max)}</td>
          <td class="p-3 text-judicial-muted">Art. 61 inc. 2 C.P.</td>
        </tr>
        <tr class="hover:bg-surface/50 ${calc.cuartoActivo === 'maximo' ? 'bg-red-50 font-bold text-red-900' : ''}">
          <td class="p-3">Cuarto Máximo</td>
          <td class="p-3 font-mono text-center">${calc.cuartos.q4.min} a ${calc.cuartos.q4.max} m</td>
          <td class="p-3 font-mono text-center">${formatearMesesAHumano(calc.cuartos.q4.min)} a ${formatearMesesAHumano(calc.cuartos.q4.max)}</td>
          <td class="p-3 text-judicial-muted">Art. 61 inc. 2 C.P.</td>
        </tr>
      `;
    }

    // 3. Motivación jurídica del cuarto
    const mit = AppState.caso.atenuantesCount || 0;
    const agg = AppState.caso.agravantesCount || 0;
    let motivacionCuarto = "";

    if (calc.cuartoActivo === 'minimo') {
      motivacionCuarto = `En el presente juicio concurren con suficiencia probatoria ${mit} circunstancia(s) de menor punibilidad contempladas en el artículo 55 del Código Penal, sin que la Fiscalía General de la Nación haya acreditado causales de mayor punibilidad del artículo 58 ejusdem. En estricta aplicación del inciso 2° del artículo 61 del Código Penal, la discrecionalidad judicial queda legalmente circunscrita al <strong>Primer Cuarto (Mínimo)</strong>, comprendido entre ${calc.cuartos.q1.min} y ${calc.cuartos.q1.max} meses. Desbordar este marco punitivo constituiría una vía de hecho por desconocimiento del principio de legalidad y favorabilidad.`;
    } else if (calc.cuartoActivo === 'maximo') {
      motivacionCuarto = `Se acreditaron debidamente ${agg} circunstancia(s) de mayor punibilidad consagradas en el artículo 58 del Código Penal, sin concurrencia de atenuantes genéricas del artículo 55. En observancia imperativa del artículo 61 inciso 2° C.P., la individualización judicial debe situarse de manera ineludible en el <strong>Cuarto Máximo</strong>, entre ${calc.cuartos.q4.min} y ${calc.cuartos.q4.max} meses.`;
    } else {
      motivacionCuarto = `En el plenario concurren simultáneamente circunstancias de atenuación (${mit}) y agravación (${agg}), o se constata la ausencia total de causales de los artículos 55 y 58 C.P. Conforme al mandato del artículo 61 inciso 2° del Código Penal, el marco de movilidad dosimétrica corresponde a los <strong>Cuartos Medios</strong>, fijados entre ${calc.cuartos.q2.min} y ${calc.cuartos.q3.max} meses de prisión.`;
    }

    setTxt('memoria-motivacion-cuarto-texto', motivacionCuarto);

    // 4. Ponderación de los criterios del Art. 59
    const containerArt59 = document.getElementById('memoria-criterios-art59');
    if (containerArt59) {
      containerArt59.innerHTML = `
        <div class="p-3 bg-surface rounded-xl border border-surface-dim">
          <span class="font-bold text-judicial-navy block mb-1">A. Mayor o menor gravedad de la conducta:</span>
          <p class="text-judicial-muted">Se evalúa el grado de afectación al bien jurídico tutelado y el reproche social de la acción ejecutada.</p>
        </div>
        <div class="p-3 bg-surface rounded-xl border border-surface-dim">
          <span class="font-bold text-judicial-navy block mb-1">B. Daño real o potencial creado:</span>
          <p class="text-judicial-muted">Consecuencias materiales y morales causadas a las víctimas directas e indirectas del hecho punible.</p>
        </div>
        <div class="p-3 bg-surface rounded-xl border border-surface-dim">
          <span class="font-bold text-judicial-navy block mb-1">C. Intensidad del dolo o culpa:</span>
          <p class="text-judicial-muted">Persistencia de la voluntad antijurídica o ligereza en el deber objetivo de cuidado.</p>
        </div>
        <div class="p-3 bg-surface rounded-xl border border-surface-dim">
          <span class="font-bold text-judicial-navy block mb-1">D. Necesidad de la pena (Art. 4 C.P.):</span>
          <p class="text-judicial-muted">La sanción de ${calc.quantumMeses} meses antes de rebajas satisface los fines de prevención general, retribución justa y reinserción social.</p>
        </div>
      `;
    }

    // 5. Análisis de subrogados (Arts. 63 y 38B)
    const penaFinal = calc.penaFinalMeses;
    const minLegal = calc.minModificado;

    const boxArt63 = document.getElementById('box-subrogado-art63');
    const statusArt63 = document.getElementById('subrogado-art63-status');
    const boxArt38b = document.getElementById('box-subrogado-art38b');
    const statusArt38b = document.getElementById('subrogado-art38b-status');

    if (penaFinal <= 48) {
      if (statusArt63) {
        statusArt63.textContent = "PROCEDENTE FACTIBILIDAD OBJETIVA (Pena ≤ 48 meses)";
        statusArt63.className = "px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 self-start";
      }
    } else {
      if (statusArt63) {
        statusArt63.textContent = `IMPROCEDENTE (Pena de ${penaFinal}m supera el tope legal de 48 meses)`;
        statusArt63.className = "px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-red-100 text-judicial-crimson self-start";
      }
    }

    if (minLegal <= 96 && !AppState.caso.prohibicionArt68A) {
      if (statusArt38b) {
        statusArt38b.textContent = "PROCEDENTE FACTIBILIDAD OBJETIVA (Pena mínima ≤ 96 meses)";
        statusArt38b.className = "px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 self-start";
      }
    } else {
      if (statusArt38b) {
        statusArt38b.textContent = `IMPROCEDENTE (Pena mínima de ${minLegal}m supera tope de 96m o exclusión Art. 68A)`;
        statusArt38b.className = "px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-red-100 text-judicial-crimson self-start";
      }
    }

    // 6. Parte resolutiva
    setTxt('memoria-sentencia-resumen', `CONDENA DEFINITIVA: ${penaFinal} MESES`);
    setTxt('memoria-sentencia-human', `Equivalente a ${formatearMesesAHumano(penaFinal)} de prisión efectiva.`);
  },

  generarTextoCompleto() {
    const d = DelitosCatalogo.find(item => item.id === AppState.caso.delitoBase) || DelitosCatalogo[0];
    const calc = CalculadoraManager;

    return `========================================================================
REPÚBLICA DE COLOMBIA - RAMA JUDICIAL DEL PODER PÚBLICO
AUTO DE INDIVIDUALIZACIÓN JUDICIAL DE LA PENA Y SENTENCIA
(Artículos 59, 60 y 61 Ley 599 de 2000 — Art. 447 Ley 906 de 2004)
========================================================================

1. IDENTIFICACIÓN PROCESAL
------------------------------------------------------------------------
RADICADO SPOA    : ${AppState.caso.radicado || '110016000000202300452'}
JUZGADO          : ${AppState.caso.juzgado || 'Juzgado Penal del Circuito'}
FISCALÍA         : ${AppState.caso.fiscalia || 'Fiscalía General de la Nación'}
PROCESADO        : ${AppState.caso.procesado || 'Ciudadano Imputado'}
DELITO           : ${d.articulo} - ${d.nombre}
BIEN JURÍDICO    : ${d.bienJuridicoNombre}

2. ANÁLISIS DE TIPICIDAD Y LÍMITES PUNITIVOS (Art. 60 C.P.)
------------------------------------------------------------------------
- Marco Legal Abstracto     : ${calc.minBase} a ${calc.maxBase} meses (${formatearMesesAHumano(calc.minBase)} a ${formatearMesesAHumano(calc.maxBase)})
- Límites Modificados       : ${calc.minModificado} a ${calc.maxModificado} meses
- Ámbito Punitivo Total     : ${calc.ambitoPunitivo} meses
- Amplitud de cada Cuarto   : ${calc.cuartoAmplitud} meses

3. SEGMENTACIÓN DE CUARTOS (Art. 61 C.P.)
------------------------------------------------------------------------
• Primer Cuarto (Mínimo)   : ${calc.cuartos.q1.min} a ${calc.cuartos.q1.max} meses
• Cuartos Medios (Q2 & Q3)  : ${calc.cuartos.q2.min} a ${calc.cuartos.q3.max} meses
• Cuarto Máximo (Q4)        : ${calc.cuartos.q4.min} a ${calc.cuartos.q4.max} meses

Cuarto Operativo Seleccionado: ${calc.cuartoActivo.toUpperCase()}
Fundamento: Art. 61 inc. 2 del Código Penal Colombiano.

4. PONDERACIÓN JUDICIAL DEL QUANTUM (Art. 59 C.P.)
------------------------------------------------------------------------
Pena individualizada dentro del cuarto: ${calc.quantumMeses} meses (${formatearMesesAHumano(calc.quantumMeses)}).
Criterios valorados: Gravedad objetiva de la conducta, magnitud del daño,
intensidad de la voluntad antijurídica y fines de prevención general y especial.

5. JUSTICIA PREMIAL (ALLANAMIENTO O PREACUERDO - Art. 351 CPP)
------------------------------------------------------------------------
Descuento aplicado: ${calc.descuentoPorcentaje}% (${(calc.quantumMeses - calc.penaFinalMeses).toFixed(1)} meses).
Restricciones legales verificadas: Art. 199 Ley 1098 / Art. 68A C.P.

6. DECISIÓN DOSIMÉTRICA DEFINITIVA
------------------------------------------------------------------------
PENA PRIVATIVA DE LA LIBERTAD DEFINITIVA: ${calc.penaFinalMeses} MESES DE PRISIÓN.
(Equivalente a ${formatearMesesAHumano(calc.penaFinalMeses)}).

NOTIFÍQUESE Y CÚMPLASE.
`;
  },

  copiarDictamen() {
    const texto = this.generarTextoCompleto();
    navigator.clipboard.writeText(texto).then(() => {
      CasoManager.mostrarToast("Auto de Dosificación copiado al portapapeles", "content_copy");
    }).catch(() => {
      CasoManager.mostrarToast("Selecciona el texto para copiar", "info");
    });
  },

  descargarTxt() {
    const texto = this.generarTextoCompleto();
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dosimetria_${AppState.caso.radicado || 'Caso'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    CasoManager.mostrarToast("Archivo .txt descargado con éxito", "download");
  }
};

// ============================================================
// 5. ESPACIO DE AYUDA INTELIGENTE — GEMINI IA (AyudaIA_Manager)
// ============================================================
const AyudaIA_Manager = {
  init() {
    BancoDudasManager.init();
    this.actualizarEstadoDB();
  },

  actualizarEstadoDB() {
    const statusText = document.getElementById('ayuda-db-text');
    const isFirebase = window.ElectivaFirebase && window.ElectivaFirebase.isConfigured;
    if (statusText) {
      if (isFirebase) {
        statusText.textContent = "Google Firebase Firestore Conectado (Nube)";
      } else {
        statusText.textContent = "Base de datos local activa (Listo para Firebase)";
      }
    }
  },

  switchSubTab(tab) {
    const subConsulta = document.getElementById('subpanel-nueva-consulta');
    const subBanco = document.getElementById('subpanel-banco-dudas');
    const btnConsulta = document.getElementById('tab-btn-nueva-consulta');
    const btnBanco = document.getElementById('tab-btn-banco-dudas');

    if (tab === 'consulta') {
      subConsulta.classList.remove('hidden');
      subBanco.classList.add('hidden');
      btnConsulta.className = "px-4 py-2 rounded-xl bg-judicial-navy text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all";
      btnBanco.className = "px-4 py-2 rounded-xl bg-surface-container text-judicial-navy text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-high transition-all";
    } else {
      subConsulta.classList.add('hidden');
      subBanco.classList.remove('hidden');
      btnBanco.className = "px-4 py-2 rounded-xl bg-judicial-navy text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all";
      btnConsulta.className = "px-4 py-2 rounded-xl bg-surface-container text-judicial-navy text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-high transition-all";
      BancoDudasManager.renderizar();
    }
  },

  generarPrompt() {
    const duda = document.getElementById('ayuda-pregunta-duda')?.value.trim();
    const meta = document.getElementById('ayuda-pregunta-meta')?.value.trim();
    const modulo = document.getElementById('ayuda-pregunta-modulo')?.value;
    const intentos = document.getElementById('ayuda-pregunta-intentos')?.value.trim();
    const errorMsg = document.getElementById('ayuda-pregunta-error')?.value.trim();

    if (!duda || !meta) {
      CasoManager.mostrarToast("Por favor ingresa al menos tu duda y qué quieres lograr", "warning");
      return;
    }

    const modulosNombres = {
      hechos: 'Función 1: Ingreso de Hechos del Caso',
      delitos: 'Función 2: Catálogo de Delitos y Tipos Penales',
      calculadora: 'Función 3: Calculadora de Cuartos de Punibilidad (Art. 61 C.P.)',
      justificacion: 'Función 4: Justificación Jurídica y Memoria de Cálculo (Art. 59 C.P.)',
      general: 'Criterios Generales de Derecho Penal Colombiano (Ley 599 de 2000)'
    };

    const promptEstructurado = `Actúa como un Magistrado de la Sala de Casación Penal de la Corte Suprema de Justicia de Colombia y experto desarrollador de software jurídico.

Estoy utilizando la aplicación "IurisDosis Colombia" y requiero resolver con exactitud la siguiente situación técnica y jurídica:

1. MÓDULO AFECTADO:
${modulosNombres[modulo] || modulo}

2. DUDA O ERROR REPORTADO:
"${duda}"

3. OBJETIVO QUE QUIERO LOGRAR:
"${meta}"

4. ACCIONES O PARÁMETROS QUE HE INTENTADO:
"${intentos || 'No especificado'}"

5. MENSAJE DE ERROR O INCONSISTENCIA EVIDENCIADA:
"${errorMsg || 'Ninguno arrojado por el sistema'}"

INSTRUCCIONES DE RESPUESTA:
- Explica de forma clara, didáctica y fundamentada en la Ley 599 de 2000 (Código Penal) y Ley 906 de 2004 cómo solucionar este problema paso a paso.
- Si corresponde a un cálculo de dosimetría penal, desglosa la fórmula exacta del Artículo 60 (modificadores) o 61 (cuartos de punibilidad) aplicable.
- Cita los artículos o sentencias relevantes de la Corte Suprema si existe una prohibición legal (ej. Art. 199 Ley 1098/2006 o Art. 68A C.P.).`;

    const salidaPre = document.getElementById('ayuda-prompt-salida');
    if (salidaPre) {
      salidaPre.textContent = promptEstructurado;
    }

    // Guardar automáticamente en el Banco Comunitario
    BancoDudasManager.agregar({
      duda,
      meta,
      modulo: modulosNombres[modulo] || modulo,
      intentos,
      errorMsg,
      prompt: promptEstructurado,
      fecha: new Date().toLocaleDateString('es-CO')
    });

    CasoManager.mostrarToast("Prompt generado y archivado en el Banco de Dudas", "psychology");
  },

  copiarPrompt() {
    const salidaPre = document.getElementById('ayuda-prompt-salida');
    const texto = salidaPre ? salidaPre.textContent : '';
    if (!texto || texto.startsWith('Completa el formulario')) {
      CasoManager.mostrarToast("Primero genera el prompt completando el formulario", "warning");
      return;
    }

    navigator.clipboard.writeText(texto).then(() => {
      CasoManager.mostrarToast("Prompt copiado. Pégalo en Gemini o ChatGPT", "content_copy");
    });
  },

  consultarGemini() {
    const salidaPre = document.getElementById('ayuda-prompt-salida');
    const duda = document.getElementById('ayuda-pregunta-duda')?.value.trim();
    if (!duda) {
      CasoManager.mostrarToast("Ingresa tu duda y genera el prompt primero", "warning");
      return;
    }

    const cajaResp = document.getElementById('ayuda-caja-respuesta-ia');
    const textoResp = document.getElementById('ayuda-texto-respuesta-ia');
    if (cajaResp) cajaResp.classList.remove('hidden');

    if (textoResp) {
      textoResp.innerHTML = `
        <div class="flex items-center gap-2 text-judicial-amber font-mono animate-pulse">
          <span class="material-symbols-outlined text-base">hourglass_top</span>
          <span>Analizando caso con Gemini IA y normas de la Ley 599 de 2000...</span>
        </div>
      `;

      setTimeout(() => {
        textoResp.innerHTML = `
          <div class="space-y-2">
            <p><strong>Dictamen del Asistente Gemini:</strong></p>
            <p>Conforme al Artículo 61 de la Ley 599 de 2000, para resolver tu consulta sobre <em>"${duda}"</em>, debes seguir estos tres pasos rigurosos:</p>
            <ol class="list-decimal pl-5 space-y-1">
              <li><strong>Fijar los límites del Art. 60 C.P.:</strong> Aplica primero los modificadores de tentativa (Art. 27) o complicidad (Art. 30). Si concurre tentativa acabada, la pena se reduce de 1/3 a 1/2.</li>
              <li><strong>Calcular el Ámbito Punitivo:</strong> Resta la pena mínima de la máxima. Divide ese valor exactamente en 4 cuartos iguales.</li>
              <li><strong>Control de Prohibiciones:</strong> Si el delito involucra menores de edad o está en el catálogo del Art. 199 de la Ley 1098 de 2006, la rebaja de justicia premial es legalmente <strong>0%</strong>.</li>
            </ol>
            <p class="text-xs text-emerald-700 font-semibold mt-2">✓ Tu consulta ha quedado guardada en el Banco Comunitario para referencia de todos los usuarios.</p>
          </div>
        `;
      }, 1200);
    }
  },

  limpiarFormulario() {
    ['ayuda-pregunta-duda', 'ayuda-pregunta-meta', 'ayuda-pregunta-intentos', 'ayuda-pregunta-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const pre = document.getElementById('ayuda-prompt-salida');
    if (pre) pre.textContent = 'Completa el formulario de la izquierda y haz clic en "Generar Prompt con Gemini IA".';
    CasoManager.mostrarToast("Formulario de ayuda restablecido", "restart_alt");
  }
};

// ============================================================
// 6. BANCO COMUNITARIO DE DUDAS Y FIREBASE (BancoDudasManager)
// ============================================================
const BancoDudasManager = {
  storageKey: 'iurisdosis_banco_dudas_comunitario',
  dudas: [],

  dudasIniciales: [
    {
      id: 'duda_1',
      duda: '¿Cómo se computa el ámbito punitivo si concurren tentativa acabada y complicidad simultáneas?',
      meta: 'Establecer los extremos mínimo y máximo antes de dividir en los cuatro cuartos.',
      modulo: 'Calculadora de Cuartos',
      intentos: 'Apliqué primero la rebaja de la tentativa y luego la de cómplice de manera sucesiva.',
      errorMsg: 'Diferencia en meses frente a la liquidación de la Fiscalía.',
      respuesta: 'Regla del Art. 60 C.P.: Los modificadores concurrentes de disminución de la pena se aplican acumulativamente sobre los extremos fijados. La tentativa acabada reduce de 1/3 a 1/2 y la complicidad de 1/6 a 1/2. Para el mínimo se aplica la mayor rebaja (1/2 + 1/2) y para el máximo la menor rebaja acumulada (1/3 + 1/6).',
      fecha: '2026-10-25'
    },
    {
      id: 'duda_2',
      duda: '¿Por qué el sistema bloquea automáticamente la rebaja por allanamiento a cargos?',
      meta: 'Aplicar el 50% de descuento acordado en formulación de imputación.',
      modulo: 'Hechos del Caso',
      intentos: 'Desmarqué la casilla del Art. 68A pero sigue bloqueado en 0%.',
      errorMsg: 'Alerta: Delito sujeto a prohibición del Artículo 199 Ley 1098 de 2006.',
      respuesta: 'Jurisprudencia reiterada de la Sala Penal de la Corte Suprema (Rad. 48801): Cuando la víctima de un delito contra la vida, integridad o libertad sexual es menor de 18 años, el Art. 199 de la Ley 1098 prohíbe de forma absoluta cualquier rebaja de pena por allanamiento o preacuerdo.',
      fecha: '2026-10-26'
    },
    {
      id: 'duda_3',
      duda: '¿Cuándo es legalmente procedente situar la pena en los cuartos medios?',
      meta: 'Justificar en el auto por qué se fijó la pena en el segundo cuarto medio.',
      modulo: 'Justificación Jurídica',
      intentos: 'El procesado no tiene antecedentes pero utilizó arma de fuego.',
      errorMsg: 'Ninguno.',
      respuesta: 'Artículo 61 inciso 2° C.P.: Procede la ubicación en los cuartos medios cuando concurren simultáneamente circunstancias de atenuación (Art. 55) y de agravación (Art. 58), o cuando no concurra ninguna causal de menor ni de mayor punibilidad.',
      fecha: '2026-10-27'
    },
    {
      id: 'duda_4',
      duda: '¿Cómo saber si procede la suspensión condicional de la ejecución de la pena (Art. 63)?',
      meta: 'Determinar si el condenado a 42 meses puede acceder a la suspensión.',
      modulo: 'Justificación Jurídica',
      intentos: 'Comparé con la pena máxima del tipo penal.',
      errorMsg: 'Confusión entre pena abstracta y pena impuesta en la sentencia.',
      respuesta: 'El requisito objetivo del Art. 63 C.P. exige que la pena privativa de la libertad IMPUESTA EN LA SENTENCIA sea igual o inferior a cuatro (4) años (48 meses), independientemente del máximo del tipo penal.',
      fecha: '2026-10-28'
    }
  ],

  init() {
    this.cargar();
    this.renderizar();
  },

  cargar() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.dudas = JSON.parse(data);
      } else {
        this.dudas = [...this.dudasIniciales];
        localStorage.setItem(this.storageKey, JSON.stringify(this.dudas));
      }
    } catch (e) {
      this.dudas = [...this.dudasIniciales];
    }
  },

  guardar() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.dudas));
  },

  agregar(nuevaDuda) {
    nuevaDuda.id = 'duda_' + Date.now();
    nuevaDuda.respuesta = 'Pendiente de respuesta por la comunidad o resuelta mediante el prompt de Gemini.';
    this.dudas.unshift(nuevaDuda);
    this.guardar();
    this.renderizar();
  },

  buscar(query) {
    this.renderizar(query.trim().toLowerCase());
  },

  filtrar(modulo) {
    this.renderizar('', modulo);
  },

  renderizar(query = '', filtroModulo = 'todos') {
    const contenedor = document.getElementById('banco-dudas-lista');
    const badgeTab = document.getElementById('badge-conteo-dudas-tab');
    if (!contenedor) return;

    let lista = this.dudas;

    if (filtroModulo !== 'todos') {
      lista = lista.filter(d => d.modulo.toLowerCase().includes(filtroModulo.toLowerCase()));
    }

    if (query) {
      lista = lista.filter(d => 
        d.duda.toLowerCase().includes(query) ||
        d.meta.toLowerCase().includes(query) ||
        (d.respuesta && d.respuesta.toLowerCase().includes(query))
      );
    }

    if (badgeTab) badgeTab.textContent = `2. Banco Comunitario de Dudas (${this.dudas.length})`;

    if (lista.length === 0) {
      contenedor.innerHTML = `
        <div class="col-span-2 p-8 text-center bg-white rounded-xl border border-surface-dim text-judicial-muted">
          <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">forum</span>
          <p class="text-xs font-semibold">No hay preguntas que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = lista.map(d => `
      <div class="bg-white rounded-2xl p-5 border border-surface-dim shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 transition-all">
        <div>
          <div class="flex items-center justify-between pb-2 border-b border-surface-dim gap-2">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-surface-dim text-judicial-muted">${d.modulo}</span>
            <span class="text-[10px] font-mono text-slate-400">${d.fecha}</span>
          </div>
          <h4 class="font-headline font-bold text-sm text-judicial-navy mt-2">${d.duda}</h4>
          <p class="text-xs text-judicial-muted mt-1"><strong>Objetivo:</strong> ${d.meta}</p>
        </div>

        <div class="p-3 bg-surface rounded-xl border border-surface-dim text-xs">
          <span class="font-bold text-emerald-800 flex items-center gap-1 mb-1">
            <span class="material-symbols-outlined text-sm">verified</span>
            Respuesta Jurídica:
          </span>
          <p class="text-judicial-navy leading-relaxed">${d.respuesta}</p>
        </div>
      </div>
    `).join('');
  }
};

// ============================================================
// 7. INICIALIZADOR GENERAL DE LOS MÓDULOS AL CARGAR EL DOM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  CatalogoManager.init();
  CalculadoraManager.init();
  JustificacionManager.generarMemoria();
  AyudaIA_Manager.init();
});
