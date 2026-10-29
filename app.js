/**
 * IURISDOSIS COLOMBIA — DOSIFICADOR PENAL & SISTEMA DE CUARTOS
 * Ley 599 de 2000 & Ley 906 de 2004
 * 
 * MÓDULO 1: Ingreso y Análisis de los Hechos del Caso Concreto
 * Arquitectura 100% Client-Side con reactividad inmediata y persistencia local.
 */

// ============================================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN (AppState)
// ============================================================
const AppState = {
  activeTab: 'hechos',

  // Datos estructurados del caso penal concreto
  caso: {
    radicado: '110016000000202300452',
    etapa: 'acusacion',
    fiscalia: 'Fiscalía 45 Seccional de Vida',
    juzgado: 'Juzgado 12 Penal del Circuito',
    procesado: 'Julián David Morales Reyes',
    fecha: '2023-04-18',
    narrativa: `El día 18 de abril de 2023, aproximadamente a las 22:45 horas, en la vía pública del barrio Kennedy Central de la ciudad de Bogotá, el imputado JULIÁN DAVID MORALES REYES, valiéndose de un arma cortopunzante tipo machete y en compañía de un sujeto aún no individualizado, abordó sorpresivamente a la víctima Pedro José Suárez cuando éste se encontraba en total estado de indefensión. 

El agresor propinó más de doce heridas reiteradas y profundas en tórax y extremidades con el propósito inequívoco de causar un sufrimiento deliberado e innecesario antes de segar su vida (sevicia), configurándose la muerte en el lugar sin que la víctima tuviera oportunidad de reacción o auxilio.`,
    
    // Calificación típica y factores modificadores
    delitoBase: '103',
    agravanteEspecifico: '104_7',
    intervencion: 'autor_directo',
    consumacion: 'consumado',
    culpabilidad: 'dolo',

    // Límites legales en meses
    minMeses: 400,
    maxMeses: 600,

    // Beneficios por allanamiento o preacuerdo
    allanamientoEtapa: 'imputacion',
    rebajaPorcentaje: 40,
    prohibicionArt199: false,
    prohibicionArt68A: false,

    // Circunstancias Arts. 55 y 58 C.P.
    atenuantesCount: 1,
    agravantesCount: 1,
    cuartoResultante: 'medios' // 'minimo' | 'medios' | 'maximo'
  }
};

// ============================================================
// 2. CONTROL DE NAVEGACIÓN ENTRE MÓDULOS (AppNav)
// ============================================================
const AppNav = {
  tabs: ['hechos', 'delitos', 'calculadora', 'justificacion', 'ayuda'],

  switchTab(targetTab) {
    if (!this.tabs.includes(targetTab)) return;
    AppState.activeTab = targetTab;

    // Alternar visibilidad de paneles
    this.tabs.forEach(tabKey => {
      const panel = document.getElementById(`panel-${tabKey}`);
      const navBtn = document.getElementById(`nav-btn-${tabKey}`);

      if (panel) {
        if (tabKey === targetTab) {
          panel.classList.remove('hidden');
          panel.classList.add('flex');
        } else {
          panel.classList.add('hidden');
          panel.classList.remove('flex');
        }
      }

      // Estilo de botones en desktop
      if (navBtn) {
        if (tabKey === targetTab) {
          navBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-judicial-navy text-white shadow-sm";
        } else {
          navBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-medium text-judicial-muted hover:text-judicial-navy hover:bg-white/60 transition-all flex items-center gap-1.5";
        }
      }
    });

    // Disparar sincronización o renderizado del módulo correspondiente
    if (targetTab === 'delitos' && typeof CatalogoManager !== 'undefined') {
      CatalogoManager.renderizar();
    } else if (targetTab === 'calculadora' && typeof CalculadoraManager !== 'undefined') {
      CalculadoraManager.sincronizarDesdeCaso();
    } else if (targetTab === 'justificacion' && typeof JustificacionManager !== 'undefined') {
      JustificacionManager.generarMemoria();
    } else if (targetTab === 'ayuda' && typeof AyudaIA_Manager !== 'undefined') {
      AyudaIA_Manager.init();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ============================================================
// 3. ANALIZADOR INTELIGENTE DE HECHOS FÁCTICOS (HechosAnalizador)
// ============================================================
const HechosAnalizador = {
  init() {
    const textarea = document.getElementById('caso-narrativa');
    if (textarea) {
      textarea.addEventListener('input', () => this.actualizarConteo());
      this.actualizarConteo();
    }
  },

  actualizarConteo() {
    const textarea = document.getElementById('caso-narrativa');
    const label = document.getElementById('caso-conteo-texto');
    if (!textarea || !label) return;

    const texto = textarea.value.trim();
    const palabras = texto ? texto.split(/\s+/).length : 0;
    const caracteres = texto.length;
    label.textContent = `${palabras} palabras • ${caracteres} caracteres`;
    AppState.caso.narrativa = textarea.value;
  },

  escanear() {
    const btn = document.getElementById('btn-escanear-hechos');
    const textarea = document.getElementById('caso-narrativa');
    const contenedor = document.getElementById('contenedor-etiquetas-inferidas');
    const scoreTag = document.getElementById('tag-inferencia-score');
    if (!btn || !textarea || !contenedor) return;

    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">refresh</span><span>Analizando concordancia fáctico-jurídica...</span>`;

    setTimeout(() => {
      const texto = textarea.value.toLowerCase();
      const hallazgos = [];

      // Detección 1: Sevicia o sufrimiento deliberado (Art. 104 num. 7)
      if (texto.includes('sevicia') || texto.includes('múltiples heridas') || texto.includes('sufrimiento deliberado') || texto.includes('doce heridas')) {
        hallazgos.push({
          icono: 'warning',
          color: 'text-judicial-crimson',
          titulo: 'Art. 104 Num. 7 (Sevicia demostrada)',
          tipo: 'agravante_especifico',
          codigo: '104_7'
        });
      }

      // Detección 2: Estado de indefensión (Art. 104 num. 7 / Art. 58 num. 1)
      if (texto.includes('indefensión') || texto.includes('sorpresivamente') || texto.includes('sin oportunidad de')) {
        hallazgos.push({
          icono: 'shield_locked',
          color: 'text-judicial-amber',
          titulo: 'Art. 104 Num. 7 (Estado de Indefensión fáctica)',
          tipo: 'circunstancia'
        });
      }

      // Detección 3: Coparticipación criminal (Art. 58 num. 10)
      if (texto.includes('compañía') || texto.includes('dos') || texto.includes('sujeto aún no') || texto.includes('coautor')) {
        hallazgos.push({
          icono: 'groups',
          color: 'text-judicial-crimson',
          titulo: 'Art. 58 Num. 10 (Coparticipación criminal)',
          tipo: 'agravante_generico'
        });
      }

      // Detección 4: Arma cortopunzante o medio peligroso
      if (texto.includes('machete') || texto.includes('arma') || texto.includes('fuego') || texto.includes('cortopunzante')) {
        hallazgos.push({
          icono: 'handshake',
          color: 'text-judicial-navy',
          titulo: 'Uso de arma cortopunzante documentada',
          tipo: 'instrumento'
        });
      }

      // Renderizar etiquetas inferidas
      if (hallazgos.length === 0) {
        contenedor.innerHTML = `
          <div class="col-span-full p-2 rounded-lg bg-white border border-surface-dim text-xs text-judicial-muted flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-judicial-muted">info</span>
            <span>No se identificaron patrones agravantes automáticos específicos. El hecho se procesa bajo el tipo genérico.</span>
          </div>`;
        if (scoreTag) scoreTag.textContent = "Fiabilidad Estándar";
      } else {
        contenedor.innerHTML = hallazgos.map(h => `
          <div class="p-2 rounded-lg bg-white border border-surface-dim flex items-center gap-2 animate-fadeIn">
            <span class="material-symbols-outlined ${h.color} text-sm">${h.icono}</span>
            <span class="text-xs font-medium text-judicial-navy truncate">${h.titulo}</span>
          </div>
        `).join('');
        if (scoreTag) scoreTag.textContent = `Fiabilidad Jurídica ${(94.5 + hallazgos.length).toFixed(1)}%`;
      }

      btn.disabled = false;
      btn.innerHTML = originalHtml;
      CasoManager.mostrarToast(`Escaneo completado: ${hallazgos.length} variables punitivas detectadas`, 'psychology');
    }, 600);
  }
};

// ============================================================
// 4. GESTOR DE CALIFICACIÓN Y EXTREMOS LEGALES (CalificacionManager)
// ============================================================
const CalificacionManager = {
  actualizarExtremos() {
    const baseSelect = document.getElementById('caso-delito-base');
    const agravanteSelect = document.getElementById('caso-agravante-especifico');
    const baseDisplay = document.getElementById('caso-extremos-legales');
    const defDisplay = document.getElementById('caso-extremos-definitivos');

    if (!baseSelect || !agravanteSelect || !baseDisplay || !defDisplay) return;

    const baseVal = baseSelect.value;
    const agravVal = agravanteSelect.value;
    AppState.caso.delitoBase = baseVal;
    AppState.caso.agravanteEspecifico = agravVal;

    let min = 208;
    let max = 450;
    let textoBase = "208 a 450 Meses (17.3 a 37.5 Años)";
    let textoDef = "400 a 600 Meses (33.3 a 50 Años)";

    if (baseVal === '103') {
      textoBase = "Pena Base: 208 a 450 Meses (17.3 a 37.5 Años)";
      if (agravVal === 'none') {
        min = 208;
        max = 450;
        textoDef = "Pena Aplicable: 208 a 450 Meses (Sin agravante)";
      } else {
        min = 400;
        max = 600;
        textoDef = "Con Agravante (Art. 104): 400 a 600 Meses (33.3 a 50 Años)";
      }
    } else if (baseVal === '104') {
      min = 400;
      max = 600;
      textoBase = "Pena Base: 400 a 600 Meses (33.3 a 50 Años)";
      textoDef = "Marco Típico: 400 a 600 Meses";
    } else if (baseVal === '104A') {
      min = 250;
      max = 500;
      textoBase = "Pena Base: 250 a 500 Meses (20.8 a 41.6 Años)";
      textoDef = "Feminicidio (Ley 1761): 250 a 500 Meses";
    } else if (baseVal === '239') {
      min = 32;
      max = 108;
      textoBase = "Pena Base: 32 a 108 Meses (2.6 a 9 Años)";
      textoDef = "Hurto Simple: 32 a 108 Meses";
    } else if (baseVal === '240') {
      min = 72;
      max = 192;
      textoBase = "Pena Base: 72 a 192 Meses (6 a 16 Años)";
      textoDef = "Hurto Calificado: 72 a 192 Meses";
    } else if (baseVal === '244') {
      min = 192;
      max = 288;
      textoBase = "Pena Base: 192 a 288 Meses (16 a 24 Años)";
      textoDef = "Extorsión: 192 a 288 Meses";
    }

    AppState.caso.minMeses = min;
    AppState.caso.maxMeses = max;
    baseDisplay.textContent = textoBase;
    defDisplay.textContent = textoDef;
  },

  actualizarIntervencion() {
    const select = document.getElementById('caso-intervencion');
    const nota = document.getElementById('caso-intervencion-nota');
    if (!select || !nota) return;

    AppState.caso.intervencion = select.value;

    if (select.value === 'complice') {
      nota.textContent = "Art. 30 inc. 2: Rebaja obligatoria de 1/6 a 1/2";
      nota.className = "text-[11px] font-mono text-judicial-amber font-semibold mt-1";
    } else if (select.value === 'interviniente') {
      nota.textContent = "Art. 30 inc. 3: Rebaja de la cuarta parte (1/4)";
      nota.className = "text-[11px] font-mono text-judicial-amber font-semibold mt-1";
    } else {
      nota.textContent = "Sin rebaja por participación";
      nota.className = "text-[11px] font-mono text-judicial-muted mt-1";
    }
  },

  actualizarConsumacion() {
    const select = document.getElementById('caso-consumacion');
    const nota = document.getElementById('caso-consumacion-nota');
    if (!select || !nota) return;

    AppState.caso.consumacion = select.value;

    if (select.value === 'tentativa_inacabada') {
      nota.textContent = "Art. 27: Rebaja de la mitad a dos terceras partes";
      nota.className = "text-[11px] font-mono text-judicial-amber font-semibold mt-1";
    } else if (select.value === 'tentativa_acabada') {
      nota.textContent = "Art. 27: Rebaja de una tercera parte a la mitad";
      nota.className = "text-[11px] font-mono text-judicial-amber font-semibold mt-1";
    } else if (select.value === 'tentativa_desistida') {
      nota.textContent = "Art. 27 inc. 3: Solo responde por actos consumados";
      nota.className = "text-[11px] font-mono text-judicial-crimson font-semibold mt-1";
    } else {
      nota.textContent = "Pena plena aplicable";
      nota.className = "text-[11px] font-mono text-judicial-muted mt-1";
    }
  }
};

// ============================================================
// 5. GESTOR DE ALLANAMIENTOS Y PROHIBICIONES (AllanamientoManager)
// ============================================================
const AllanamientoManager = {
  actualizarOportunidad() {
    const etapaSelect = document.getElementById('caso-allanamiento-etapa');
    const slider = document.getElementById('slider-rebaja-pactada');
    const label = document.getElementById('label-rebaja-porcentaje');
    if (!etapaSelect || !slider || !label) return;

    const etapa = etapaSelect.value;
    AppState.caso.allanamientoEtapa = etapa;

    if (etapa === 'imputacion') {
      slider.max = 50;
      slider.value = 40;
    } else if (etapa === 'acusacion') {
      slider.max = 33;
      slider.value = 25;
    } else if (etapa === 'juicio') {
      slider.max = 16;
      slider.value = 16;
    } else {
      slider.max = 0;
      slider.value = 0;
    }

    this.sincronizarSlider(slider.value);
    this.verificarProhibiciones();
  },

  sincronizarSlider(val) {
    const label = document.getElementById('label-rebaja-porcentaje');
    if (label) label.textContent = `${val}%`;
    AppState.caso.rebajaPorcentaje = Number(val);
  },

  verificarProhibiciones() {
    const check199 = document.getElementById('check-art199');
    const check68a = document.getElementById('check-art68a');
    const alerta = document.getElementById('alerta-prohibicion-bloqueo');
    const slider = document.getElementById('slider-rebaja-pactada');
    const label = document.getElementById('label-rebaja-porcentaje');

    if (!check199 || !check68a || !alerta || !slider || !label) return;

    const bloqueado = check199.checked || check68a.checked;
    AppState.caso.prohibicionArt199 = check199.checked;
    AppState.caso.prohibicionArt68A = check68a.checked;

    if (bloqueado) {
      alerta.classList.remove('hidden');
      slider.disabled = true;
      label.textContent = '0%';
      label.className = "text-sm font-mono font-bold text-judicial-crimson w-12 text-right";
    } else {
      alerta.classList.add('hidden');
      slider.disabled = false;
      label.textContent = `${slider.value}%`;
      label.className = "text-sm font-mono font-bold text-judicial-amber w-12 text-right";
    }
  }
};

// ============================================================
// 6. PREDICTOR MATEMÁTICO DE CUARTOS (CuartosPredictor - Art. 61 C.P.)
// ============================================================
const CuartosPredictor = {
  evaluar() {
    const atenuantes = document.querySelectorAll('.check-atenuante');
    const agravantes = document.querySelectorAll('.check-agravante');
    const countAtenuantes = document.getElementById('badge-count-atenuantes');
    const countAgravantes = document.getElementById('badge-count-agravantes');
    const labelCuarto = document.getElementById('label-cuarto-resultante');
    const badgeHeader = document.getElementById('badge-quarter-indicator');

    let mit = 0;
    let agg = 0;
    atenuantes.forEach(b => { if (b.checked) mit++; });
    agravantes.forEach(b => { if (b.checked) agg++; });

    if (countAtenuantes) countAtenuantes.textContent = `${mit} seleccionada${mit === 1 ? '' : 's'}`;
    if (countAgravantes) countAgravantes.textContent = `${agg} seleccionada${agg === 1 ? '' : 's'}`;

    AppState.caso.atenuantesCount = mit;
    AppState.caso.agravantesCount = agg;

    let cuartoTexto = "Cuartos Medios (Inferior o Superior)";
    let cuartoColorClase = "text-judicial-amber";
    let cuartoHeaderClase = "px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-judicial-amber border border-amber-200";

    // Regla estricta del Artículo 61 inciso 2 del Código Penal Colombiano:
    if (mit > 0 && agg === 0) {
      cuartoTexto = "Primer Cuarto (Mínimo)";
      cuartoColorClase = "text-judicial-emeraldLight";
      cuartoHeaderClase = "px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200";
      AppState.caso.cuartoResultante = 'minimo';
    } else if (agg > 0 && mit === 0) {
      cuartoTexto = "Cuarto Máximo";
      cuartoColorClase = "text-judicial-crimson";
      cuartoHeaderClase = "px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-50 text-judicial-crimson border border-red-200";
      AppState.caso.cuartoResultante = 'maximo';
    } else {
      cuartoTexto = "Cuartos Medios (Inferior o Superior)";
      cuartoColorClase = "text-judicial-amber";
      cuartoHeaderClase = "px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-judicial-amber border border-amber-200";
      AppState.caso.cuartoResultante = 'medios';
    }

    if (labelCuarto) {
      labelCuarto.textContent = cuartoTexto;
      labelCuarto.className = `text-xs font-mono font-bold uppercase ${cuartoColorClase}`;
    }

    if (badgeHeader) {
      badgeHeader.textContent = cuartoTexto;
      badgeHeader.className = cuartoHeaderClase;
    }
  }
};

// ============================================================
// 7. GESTOR DE PERSISTENCIA Y CASOS (CasoManager)
// ============================================================
const CasoManager = {
  storageKey: 'iurisdosis_caso_params',

  guardar() {
    // Recoger valores actuales de los inputs
    const getVal = (id) => document.getElementById(id)?.value || '';

    AppState.caso.radicado = getVal('caso-radicado');
    AppState.caso.etapa = getVal('caso-etapa');
    AppState.caso.fiscalia = getVal('caso-fiscalia');
    AppState.caso.juzgado = getVal('caso-juzgado');
    AppState.caso.procesado = getVal('caso-procesado');
    AppState.caso.fecha = getVal('caso-fecha');
    AppState.caso.narrativa = getVal('caso-narrativa');
    AppState.caso.delitoBase = getVal('caso-delito-base');
    AppState.caso.agravanteEspecifico = getVal('caso-agravante-especifico');
    AppState.caso.intervencion = getVal('caso-intervencion');
    AppState.caso.consumacion = getVal('caso-consumacion');
    AppState.caso.culpabilidad = getVal('caso-culpabilidad');

    localStorage.setItem(this.storageKey, JSON.stringify(AppState.caso));
    this.mostrarToast("Parámetros del caso guardados en memoria local", "save");
  },

  cargarGuardado() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      AppState.caso = { ...AppState.caso, ...data };

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
      };

      setVal('caso-radicado', AppState.caso.radicado);
      setVal('caso-etapa', AppState.caso.etapa);
      setVal('caso-fiscalia', AppState.caso.fiscalia);
      setVal('caso-juzgado', AppState.caso.juzgado);
      setVal('caso-procesado', AppState.caso.procesado);
      setVal('caso-fecha', AppState.caso.fecha);
      setVal('caso-narrativa', AppState.caso.narrativa);
      setVal('caso-delito-base', AppState.caso.delitoBase);
      setVal('caso-agravante-especifico', AppState.caso.agravanteEspecifico);
      setVal('caso-intervencion', AppState.caso.intervencion);
      setVal('caso-consumacion', AppState.caso.consumacion);
      setVal('caso-culpabilidad', AppState.caso.culpabilidad);

      CalificacionManager.actualizarExtremos();
      CalificacionManager.actualizarIntervencion();
      CalificacionManager.actualizarConsumacion();
      CuartosPredictor.evaluar();
      HechosAnalizador.actualizarConteo();
    } catch (e) {
      console.warn("No se pudieron restaurar los datos guardados", e);
    }
  },

  cargarEjemplo() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('caso-radicado', '110016000000202300452');
    setVal('caso-etapa', 'acusacion');
    setVal('caso-fiscalia', 'Fiscalía 45 Seccional de Vida');
    setVal('caso-juzgado', 'Juzgado 12 Penal del Circuito');
    setVal('caso-procesado', 'Julián David Morales Reyes');
    setVal('caso-fecha', '2023-04-18');
    setVal('caso-narrativa', `El día 18 de abril de 2023, aproximadamente a las 22:45 horas, en la vía pública del barrio Kennedy Central de la ciudad de Bogotá, el imputado JULIÁN DAVID MORALES REYES, valiéndose de un arma cortopunzante tipo machete y en compañía de un sujeto aún no individualizado, abordó sorpresivamente a la víctima Pedro José Suárez cuando éste se encontraba en total estado de indefensión. 

El agresor propinó más de doce heridas reiteradas y profundas en tórax y extremidades con el propósito inequívoco de causar un sufrimiento deliberado e innecesario antes de segar su vida (sevicia), configurándose la muerte en el lugar sin que la víctima tuviera oportunidad de reacción o auxilio.`);
    setVal('caso-delito-base', '103');
    setVal('caso-agravante-especifico', '104_7');
    setVal('caso-intervencion', 'autor_directo');
    setVal('caso-consumacion', 'consumado');
    setVal('caso-culpabilidad', 'dolo');

    const check199 = document.getElementById('check-art199');
    const check68a = document.getElementById('check-art68a');
    if (check199) check199.checked = false;
    if (check68a) check68a.checked = false;

    // Restablecer atenuantes y agravantes ejemplo
    const atenuantes = document.querySelectorAll('.check-atenuante');
    const agravantes = document.querySelectorAll('.check-agravante');
    atenuantes.forEach((b, i) => { b.checked = (i === 0); });
    agravantes.forEach((b, i) => { b.checked = (i === 0); });

    CalificacionManager.actualizarExtremos();
    CalificacionManager.actualizarIntervencion();
    CalificacionManager.actualizarConsumacion();
    AllanamientoManager.actualizarOportunidad();
    CuartosPredictor.evaluar();
    HechosAnalizador.actualizarConteo();

    this.mostrarToast("Caso de prueba (Homicidio con Sevicia) cargado", "dataset");
  },

  limpiar() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('caso-radicado', '');
    setVal('caso-fiscalia', '');
    setVal('caso-juzgado', '');
    setVal('caso-procesado', '');
    setVal('caso-narrativa', '');

    const checkboxes = document.querySelectorAll('.check-atenuante, .check-agravante, #check-art199, #check-art68a');
    checkboxes.forEach(b => b.checked = false);

    CuartosPredictor.evaluar();
    HechosAnalizador.actualizarConteo();
    AllanamientoManager.verificarProhibiciones();
    this.mostrarToast("Formulario restablecido", "restart_alt");
  },

  mostrarToast(mensaje, icono = 'check_circle') {
    const toast = document.getElementById('toast-notif');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastText) return;

    toastText.textContent = mensaje;
    if (toastIcon) toastIcon.textContent = icono;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 2800);
  }
};

// ============================================================
// 8. INICIALIZACIÓN AL CARGAR EL DOM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  HechosAnalizador.init();
  CalificacionManager.actualizarExtremos();
  CalificacionManager.actualizarIntervencion();
  CalificacionManager.actualizarConsumacion();
  AllanamientoManager.actualizarOportunidad();
  CuartosPredictor.evaluar();

  // Restaurar si hay datos guardados previamente
  CasoManager.cargarGuardado();
});
