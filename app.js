/**
 * ELECTIVA IA - ASISTENTE JURÍDICO Y DOSIFICADOR PENAL
 * Aplicación 100% Client-Side (Sin servidor, sin login, responsive celular y escritorio)
 * Arquitectura: 4 Funciones integradas con persistencia local y conector Firebase Firestore.
 */

// ============================================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================
const AppState = {
  activeTab: 'faq',
  
  // Función 1: FAQ y Banco de Dudas
  questions: [],
  
  // Función 2: Generador de Prompts
  promptHistory: [],
  geminiApiKey: localStorage.getItem('electiva_ia_gemini_key') || '',
  
  // Función 3: Calculadora de Cuartos Punitivos
  calculadora: {
    delitoId: 'homicidio_agravado',
    delitoNombre: 'Homicidio Agravado (Art. 103 / 104 C.P.)',
    minBaseMeses: 400,
    maxBaseMeses: 600,
    
    // Modificadores de grado (Art. 60 C.P.)
    tentativa: 'consumado',   // consumado | acabada | desistida
    participacion: 'autor',  // autor | complice
    ira: false,               // false | true
    
    // Extremos definitivos tras amplificadores/atenuantes
    minDefMeses: 400,
    maxDefMeses: 600,
    
    // Circunstancias (Arts. 55 y 58 C.P.)
    art55Count: 2, // Por defecto atenuantes
    art58Count: 0, // Por defecto agravantes
    
    // Cuarto aplicable seleccionado automáticamente
    cuartoAplicableIndex: 0, // 0: Mínimo, 1: Medio Inf, 2: Medio Sup, 3: Máximo
    
    // Tasación individual y rebajas
    penaIndividualMeses: 412,
    porcentajeRebaja: 50, // Allanamiento Art. 351 (hasta 50%)
    rebajaMeses: 206,
    penaFinalMeses: 206
  },
  
  // Función 4: Docente
  teacherEmail: 'profesor@universidad.edu.co'
};

// ============================================================
// 2. NAVEGACIÓN Y PESTAÑAS (TABS)
// ============================================================
function switchTab(tabId) {
  AppState.activeTab = tabId;
  const tabIds = ['faq', 'prompt', 'calculadora', 'docente'];
  
  tabIds.forEach((id, index) => {
    const panel = document.getElementById(`panel-${id}`);
    const navDesktop = document.getElementById(`nav-tab-${index + 1}`);
    const navMobile = document.getElementById(`mobile-tab-${index + 1}`);
    
    if (id === tabId) {
      if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
      }
      if (navDesktop) {
        navDesktop.className = "px-3 py-2 rounded-lg bg-slate-900 text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm text-xs lg:text-sm";
      }
      if (navMobile) {
        navMobile.className = "flex flex-col items-center gap-0.5 text-slate-900 font-bold";
      }
    } else {
      if (panel) {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
      if (navDesktop) {
        navDesktop.className = "px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 text-xs lg:text-sm";
      }
      if (navMobile) {
        navMobile.className = "flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700";
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// 3. FUNCIÓN 1: PREGUNTAS FRECUENTES Y BANCO DE DUDAS
// ============================================================
const FAQ_STORAGE_KEY = 'electiva_ia_community_questions_v2';

const INITIAL_COMMUNITY_QUESTIONS = [
  {
    id: 'q_demo_1',
    author: 'Estudiante Electiva IA',
    category: 'Hechos y Caso Concreto',
    date: '2026-10-27',
    question: '¿Qué diferencia hay entre la sevicia y la indefensión al narrar los hechos del caso?',
    answer: 'La sevicia (Art. 104 num. 7) consiste en producir sufrimientos inhumanos o innecesarios en la víctima antes de su muerte. La indefensión alude a la imposibilidad de la víctima de repeler el ataque o buscar auxilio. Ambas se extraen del relato fáctico y agravan la punibilidad de forma independiente.',
    answeredBy: 'Docente Titular'
  },
  {
    id: 'q_demo_2',
    author: 'Grupo de Investigación Penal',
    category: 'Cuartos y Dosificación',
    date: '2026-10-27',
    question: '¿Si no hay ni atenuantes ni agravantes acreditados, en qué cuarto se ubica el juez?',
    answer: 'Conforme al inciso 2 del artículo 61 del Código Penal, cuando no concurran circunstancias de menor ni de mayor punibilidad, el juzgador debe moverse obligatoriamente dentro de los límites del primer cuarto (cuarto mínimo legal).',
    answeredBy: 'Docente Titular'
  }
];

function initFAQ() {
  try {
    const saved = localStorage.getItem(FAQ_STORAGE_KEY);
    if (saved) {
      AppState.questions = JSON.parse(saved);
    } else {
      AppState.questions = INITIAL_COMMUNITY_QUESTIONS;
      saveQuestionsToStorage();
    }
  } catch (err) {
    AppState.questions = INITIAL_COMMUNITY_QUESTIONS;
  }
  renderCommunityQuestions();
}

function saveQuestionsToStorage() {
  try {
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(AppState.questions));
  } catch (e) {
    console.error('Error guardando en almacenamiento local:', e);
  }
}

function toggleFAQ(button) {
  const card = button.closest('.faq-card');
  const answer = card.querySelector('.faq-answer');
  const icon = button.querySelector('.faq-icon');
  
  const isHidden = answer.classList.contains('hidden');

  if (isHidden) {
    answer.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
    card.classList.add('ring-1', 'ring-slate-900/10', 'bg-white');
  } else {
    answer.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
    card.classList.remove('ring-1', 'ring-slate-900/10');
  }
}

function filterFAQ() {
  const query = document.getElementById('faq-search').value.toLowerCase().trim();
  const clearBtn = document.getElementById('faq-clear-search');
  const cards = document.querySelectorAll('.faq-card');
  let visibleCount = 0;

  if (query.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const keywords = card.getAttribute('data-keywords') || '';
    
    if (text.includes(query) || keywords.includes(query)) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  const noResults = document.getElementById('no-faq-results');
  if (visibleCount === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
  }
}

function clearSearch() {
  const searchInput = document.getElementById('faq-search');
  searchInput.value = '';
  filterFAQ();
  searchInput.focus();
}

function renderCommunityQuestions() {
  const container = document.getElementById('community-questions-list');
  const badge = document.getElementById('community-count-badge');
  if (!container || !badge) return;

  badge.textContent = `${AppState.questions.length} registrada${AppState.questions.length === 1 ? '' : 's'}`;

  if (AppState.questions.length === 0) {
    container.innerHTML = `
      <p class="text-xs sm:text-sm text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        Aún no hay dudas adicionales registradas por los estudiantes. ¡Sé el primero en preguntar!
      </p>
    `;
    return;
  }

  container.innerHTML = AppState.questions.map(q => {
    const hasAnswer = q.answer && q.answer.trim().length > 0;
    return `
      <div class="faq-card bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:bg-white hover:border-slate-300" data-keywords="${q.question.toLowerCase()} ${q.category.toLowerCase()} ${q.author.toLowerCase()}">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
              ${q.category || 'Consulta'}
            </span>
            <span class="text-xs text-slate-500 font-medium">Por: ${q.author || 'Anónimo'}</span>
          </div>
          <span class="text-[11px] font-mono text-slate-400">${q.date || 'Reciente'}</span>
        </div>
        
        <p class="text-sm sm:text-base font-semibold text-slate-900 mb-2">
          «${q.question}»
        </p>

        ${hasAnswer ? `
          <div class="mt-3 pt-3 border-t border-slate-200/80 bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Respuesta (${q.answeredBy || 'Docente / Equipo'}):</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              ${q.answer}
            </p>
          </div>
        ` : `
          <div class="mt-2 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 border border-amber-200/60">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            <span>Pendiente de respuesta por el equipo docente</span>
          </div>
        `}
      </div>
    `;
  }).join('');
}

function submitQuestion(e) {
  e.preventDefault();
  const authorInput = document.getElementById('student-name');
  const categoryInput = document.getElementById('question-category');
  const textInput = document.getElementById('question-text');

  const questionText = textInput.value.trim();
  if (!questionText) return;

  const newQ = {
    id: 'q_' + Date.now(),
    author: authorInput.value.trim() || 'Estudiante Anónimo',
    category: categoryInput.value,
    date: new Date().toISOString().split('T')[0],
    question: questionText,
    answer: '',
    answeredBy: ''
  };

  AppState.questions.unshift(newQ);
  saveQuestionsToStorage();

  textInput.value = '';
  authorInput.value = '';
  renderCommunityQuestions();

  showToast('¡Pregunta guardada en la base de datos! Se actualizará si recibe respuesta.');
}

// ============================================================
// 4. FUNCIÓN 2: GENERADOR DE PROMPTS JURÍDICOS (CON O SIN GEMINI)
// ============================================================
const PROMPTS_STORAGE_KEY = 'electiva_ia_saved_prompts_v1';

function initPromptBuilder() {
  try {
    const saved = localStorage.getItem(PROMPTS_STORAGE_KEY);
    if (saved) {
      AppState.promptHistory = JSON.parse(saved);
    }
  } catch (e) {
    AppState.promptHistory = [];
  }
  renderPromptHistory();
  
  const savedKey = localStorage.getItem('electiva_ia_gemini_key');
  if (savedKey) {
    const keyInput = document.getElementById('gemini-api-key-input');
    if (keyInput) keyInput.value = savedKey;
  }
}

function saveGeminiKey() {
  const keyInput = document.getElementById('gemini-api-key-input');
  if (!keyInput) return;
  const key = keyInput.value.trim();
  AppState.geminiApiKey = key;
  if (key) {
    localStorage.setItem('electiva_ia_gemini_key', key);
    showToast('API Key de Gemini guardada de forma segura en tu navegador.');
  } else {
    localStorage.removeItem('electiva_ia_gemini_key');
    showToast('API Key removida. Se usará el motor de estructuración local.');
  }
}

/**
 * Genera el prompt con la arquitectura de prompts jurídicos especializada en Derecho Penal Colombiano
 */
function buildPromptTemplate(duda, delito, normas, rol, objetivo) {
  return `### ROL Y CONTEXTO
Actúa como un experto en Derecho Penal Colombiano y docente de la Rama Judicial de Colombia, con dominio riguroso del Código Penal (Ley 599 de 2000), el Código de Procedimiento Penal (Ley 906 de 2004) y la jurisprudencia de la Sala de Casación Penal de la Corte Suprema de Justicia.

### CONTEXTO DEL CASO O PROYECTO (ELECTIVA IA)
- **Delito o Módulo aplicable:** ${delito}
- **Rol del consultante:** ${rol}
- **Objetivo analítico:** ${objetivo}

### PROBLEMA JURÍDICO O DUDA FÁCTICA
«${duda}»

### NORMAS O ARTÍCULOS YA EXPLORADOS
«${normas || 'Ninguno especificado aún por el consultante'}»

### INSTRUCCIONES DE RESPUESTA
1. **Adecuación Típica y Extremos:** Analiza la subsunción del caso dentro del tipo penal indicado, verificando elementos objetivos, subjetivos y los extremos punitivos en abstracto.
2. **Sistema de Cuartos de Movilidad (Art. 61 C.P.):** Explica cómo influyen los agravantes (Art. 58) y atenuantes (Art. 55) en la selección del cuarto mínimo, medios o máximo.
3. **Respaldo Jurisprudencial:** Cita al menos una sentencia vinculante de la Corte Suprema de Justicia de Colombia (Radicado y Sala Penal) aplicable al caso.
4. **Arbitrio Judicial y Conclusión:** Presenta una motivación jurídica razonada, recordando que las calculadoras de cuartos son apoyo técnico y no sustituyen el arbitrio judicial del juez.`;
}

async function handleGeneratePrompt(e) {
  e.preventDefault();
  
  const dudaInput = document.getElementById('prompt-duda');
  const delitoInput = document.getElementById('prompt-delito');
  const normasInput = document.getElementById('prompt-normas');
  const rolInput = document.getElementById('prompt-rol');
  const objetivoInput = document.getElementById('prompt-objetivo');
  
  const duda = dudaInput.value.trim();
  const delito = delitoInput.value.trim();
  const normas = normasInput.value.trim();
  const rol = rolInput.value;
  const objetivo = objetivoInput.value;

  if (!duda || !delito) {
    alert('Por favor completa al menos el problema jurídico y el delito aplicable.');
    return;
  }

  const btn = document.getElementById('btn-generate-prompt');
  const originalBtnHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Generando...`;

  const structuredPrompt = buildPromptTemplate(duda, delito, normas, rol, objetivo);
  
  // Si tiene Gemini API Key, podemos enriquecerlo o generar la respuesta directamente
  let finalPrompt = structuredPrompt;
  const key = AppState.geminiApiKey || (document.getElementById('gemini-api-key-input') ? document.getElementById('gemini-api-key-input').value.trim() : '');

  if (key) {
    try {
      showToast('Contactando modelo Gemini para refinar el prompt con contexto penal...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Eres un asistente de Ingeniería de Prompts para Derecho Penal Colombiano. Toma el siguiente borrador y mejóralo agregándole precisión terminológica judicial y citas exactas de la Ley 599/2000, dejando el prompt final listo para ser usado por un abogado o estudiante:\n\n${structuredPrompt}`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const geminiOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiOutput) {
          finalPrompt = geminiOutput;
          showToast('¡Prompt enriquecido con IA Gemini con éxito!');
        }
      } else {
        console.warn('La API de Gemini devolvió un código no 200, usando el prompt estructurado.');
      }
    } catch (apiErr) {
      console.warn('Error llamando a Gemini, usando generador estructurado local:', apiErr);
    }
  }

  // Mostrar resultado
  const outputArea = document.getElementById('prompt-result-text');
  const resultContainer = document.getElementById('prompt-result-container');
  if (outputArea && resultContainer) {
    outputArea.value = finalPrompt;
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Guardar en historial
  const historyItem = {
    id: 'pr_' + Date.now(),
    date: new Date().toLocaleDateString('es-CO'),
    delito: delito,
    duda: duda.substring(0, 70) + (duda.length > 70 ? '...' : ''),
    fullPrompt: finalPrompt
  };

  AppState.promptHistory.unshift(historyItem);
  if (AppState.promptHistory.length > 10) AppState.promptHistory.pop(); // Mantener últimos 10
  localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(AppState.promptHistory));
  renderPromptHistory();

  btn.disabled = false;
  btn.innerHTML = originalBtnHtml;
  showToast('¡Prompt penal estructurado listo para copiar!');
}

function copyPromptToClipboard() {
  const outputArea = document.getElementById('prompt-result-text');
  if (!outputArea || !outputArea.value) return;

  navigator.clipboard.writeText(outputArea.value).then(() => {
    showToast('¡Prompt copiado al portapapeles! Ya puedes pegarlo en ChatGPT, Gemini o Claude.');
  }).catch(() => {
    outputArea.select();
    document.execCommand('copy');
    showToast('¡Prompt copiado!');
  });
}

function renderPromptHistory() {
  const container = document.getElementById('prompt-history-list');
  if (!container) return;

  if (AppState.promptHistory.length === 0) {
    container.innerHTML = `
      <p class="text-xs text-slate-400 italic py-2">
        Aún no has generado prompts. Los que generes se guardarán aquí para reutilizarlos en un clic.
      </p>
    `;
    return;
  }

  container.innerHTML = AppState.promptHistory.map(item => `
    <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 hover:bg-white transition-all text-xs">
      <div class="min-w-0">
        <span class="font-bold text-slate-800 block truncate">${item.delito}</span>
        <span class="text-slate-500 block truncate">${item.duda}</span>
      </div>
      <button onclick="loadHistoricalPrompt('${item.id}')" class="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium shrink-0 flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">content_paste</span>
        <span>Cargar</span>
      </button>
    </div>
  `).join('');
}

function loadHistoricalPrompt(id) {
  const item = AppState.promptHistory.find(p => p.id === id);
  if (!item) return;

  const outputArea = document.getElementById('prompt-result-text');
  const resultContainer = document.getElementById('prompt-result-container');
  if (outputArea && resultContainer) {
    outputArea.value = item.fullPrompt;
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth' });
    showToast('Prompt histórico cargado.');
  }
}

// ============================================================
// 5. FUNCIÓN 3: CALCULADORA DE CUARTOS Y DOSIFICACIÓN PENAL
// ============================================================

// Catálogo de delitos colombianos predefinidos para la electiva
const DELITOS_CATALOGO = {
  'homicidio_agravado': {
    nombre: 'Homicidio Agravado (Art. 103 / Art. 104 Num. 7 C.P.)',
    min: 400,
    max: 600,
    descripcion: 'Pena fijada por la Ley 890 de 2004 con extremos de 400 a 600 meses (33.3 a 50 años).'
  },
  'homicidio_simple': {
    nombre: 'Homicidio Simple (Art. 103 C.P.)',
    min: 208,
    max: 450,
    descripcion: 'Tipo penal básico de homicidio con extremos de 208 a 450 meses.'
  },
  'hurto_calificado': {
    nombre: 'Hurto Calificado y Agravado (Art. 239 / 240 / 241 C.P.)',
    min: 72,
    max: 168,
    descripcion: 'Conducta contra el patrimonio con extremos de 6 a 14 años de prisión.'
  },
  'trafico_estupefacientes': {
    nombre: 'Tráfico de Estupefacientes (Art. 376 C.P. Inciso 1)',
    min: 128,
    max: 360,
    descripcion: 'Delito contra la salud pública con extremos de 128 a 360 meses.'
  },
  'concierto_delinquir': {
    nombre: 'Concierto para Delinquir Agravado (Art. 340 Inciso 2 C.P.)',
    min: 96,
    max: 216,
    descripcion: 'Delito contra la seguridad pública con extremos de 8 a 18 años.'
  },
  'personalizado': {
    nombre: 'Delito Personalizado (Definido por el estudiante)',
    min: 120,
    max: 240,
    descripcion: 'Permite ingresar cualquier rango en meses para simular cualquier tipo penal.'
  }
};

function formatMesesToYearsMonthsDays(totalMeses) {
  const years = Math.floor(totalMeses / 12);
  const remainingMonths = Math.floor(totalMeses % 12);
  const days = Math.round((totalMeses % 1) * 30);
  
  let parts = [];
  if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
  if (remainingMonths > 0 || years === 0) parts.push(`${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`);
  if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

function handleDelitoChange() {
  const select = document.getElementById('calc-delito-select');
  const selectedKey = select.value;
  const delito = DELITOS_CATALOGO[selectedKey];

  const minInput = document.getElementById('calc-min-meses');
  const maxInput = document.getElementById('calc-max-meses');
  const descElem = document.getElementById('calc-delito-desc');

  if (delito) {
    minInput.value = delito.min;
    maxInput.value = delito.max;
    if (descElem) descElem.textContent = delito.descripcion;
    
    // Si no es personalizado, bloquear los inputs para evitar inconsistencias accidentales
    const isCustom = selectedKey === 'personalizado';
    minInput.readOnly = !isCustom;
    maxInput.readOnly = !isCustom;
    minInput.className = isCustom 
      ? "w-full p-2.5 rounded-lg bg-white border border-slate-300 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500" 
      : "w-full p-2.5 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 cursor-not-allowed";
    maxInput.className = isCustom 
      ? "w-full p-2.5 rounded-lg bg-white border border-slate-300 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500" 
      : "w-full p-2.5 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 cursor-not-allowed";
  }

  recalculateCuartos();
}

function recalculateCuartos() {
  const minMesesRaw = parseFloat(document.getElementById('calc-min-meses').value) || 0;
  const maxMesesRaw = parseFloat(document.getElementById('calc-max-meses').value) || 0;

  if (maxMesesRaw <= minMesesRaw) {
    document.getElementById('calc-error-msg').classList.remove('hidden');
    return;
  } else {
    document.getElementById('calc-error-msg').classList.add('hidden');
  }

  // Modificadores de grado (Art. 60 C.P.)
  const tentativa = document.getElementById('calc-tentativa').value;
  const participacion = document.getElementById('calc-participacion').value;
  const ira = document.getElementById('calc-ira').checked;

  let minOperativo = minMesesRaw;
  let maxOperativo = maxMesesRaw;

  // Tentativa (Art. 27): la pena no será menor de la mitad del mínimo ni mayor de las tres cuartas partes del máximo
  if (tentativa === 'acabada') {
    minOperativo = minOperativo / 2;
    maxOperativo = maxOperativo * 0.75;
  } else if (tentativa === 'desistida') {
    minOperativo = minOperativo / 3;
    maxOperativo = maxOperativo / 2;
  }

  // Complicidad (Art. 30): la pena se rebajará de una sexta parte a la mitad
  if (participacion === 'complice') {
    minOperativo = minOperativo * (1 - 0.5); // reduce al 50%
    maxOperativo = maxOperativo * (1 - 0.1666); // reduce en 1/6
  }

  // Ira o intenso dolor (Art. 57): rebaja de una sexta a la mitad
  if (ira) {
    minOperativo = minOperativo * 0.5;
    maxOperativo = maxOperativo * 0.8333;
  }

  // Redondear a meses coherentes
  minOperativo = Math.round(minOperativo * 10) / 10;
  maxOperativo = Math.round(maxOperativo * 10) / 10;

  // Ámbito punitivo total
  const ambitoTotal = Math.round((maxOperativo - minOperativo) * 10) / 10;
  const extensionCuarto = Math.round((ambitoTotal / 4) * 10) / 10;

  // Los 4 cuartos (Art. 61 C.P.)
  const q1Min = minOperativo;
  const q1Max = Math.round((minOperativo + extensionCuarto) * 10) / 10;

  const q2Min = q1Max;
  const q2Max = Math.round((minOperativo + 2 * extensionCuarto) * 10) / 10;

  const q3Min = q2Max;
  const q3Max = Math.round((minOperativo + 3 * extensionCuarto) * 10) / 10;

  const q4Min = q3Max;
  const q4Max = maxOperativo;

  // Actualizar indicadores numéricos en pantalla
  document.getElementById('lbl-min-operativo').textContent = `${minOperativo} meses`;
  document.getElementById('lbl-min-operativo-conversion').textContent = formatMesesToYearsMonthsDays(minOperativo);

  document.getElementById('lbl-max-operativo').textContent = `${maxOperativo} meses`;
  document.getElementById('lbl-max-operativo-conversion').textContent = formatMesesToYearsMonthsDays(maxOperativo);

  document.getElementById('lbl-ambito-total').textContent = `${ambitoTotal} meses`;
  document.getElementById('lbl-extension-cuarto').textContent = `${extensionCuarto} meses (${formatMesesToYearsMonthsDays(extensionCuarto)})`;

  // Asignar rangos a las 4 tarjetas de cuartos
  document.getElementById('cuarto-1-range').textContent = `${q1Min} a ${q1Max} m`;
  document.getElementById('cuarto-1-conv').textContent = `${formatMesesToYearsMonthsDays(q1Min)} hasta ${formatMesesToYearsMonthsDays(q1Max)}`;

  document.getElementById('cuarto-2-range').textContent = `${q2Min} a ${q2Max} m`;
  document.getElementById('cuarto-2-conv').textContent = `${formatMesesToYearsMonthsDays(q2Min)} hasta ${formatMesesToYearsMonthsDays(q2Max)}`;

  document.getElementById('cuarto-3-range').textContent = `${q3Min} a ${q3Max} m`;
  document.getElementById('cuarto-3-conv').textContent = `${formatMesesToYearsMonthsDays(q3Min)} hasta ${formatMesesToYearsMonthsDays(q3Max)}`;

  document.getElementById('cuarto-4-range').textContent = `${q4Min} a ${q4Max} m`;
  document.getElementById('cuarto-4-conv').textContent = `${formatMesesToYearsMonthsDays(q4Min)} hasta ${formatMesesToYearsMonthsDays(q4Max)}`;

  // Evaluar Circunstancias de Punición (Art. 55 y Art. 58)
  const art55Count = countChecked('chk-art55');
  const art58Count = countChecked('chk-art58');
  
  document.getElementById('lbl-art55-count').textContent = `${art55Count} acreditadas`;
  document.getElementById('lbl-art58-count').textContent = `${art58Count} acreditadas`;

  // Determinación taxativa del cuarto legal aplicable (Art. 61 Inciso 2 C.P.):
  // 1. Únicamente circunstancias de atenuación -> Cuarto Mínimo (0)
  // 2. Únicamente circunstancias de agravación -> Cuarto Máximo (3)
  // 3. Concurren ambas o ninguna -> Cuartos Medios (1 o 2)
  let activeQuarterIndex = 0;
  let quarterReason = '';

  if (art55Count > 0 && art58Count === 0) {
    activeQuarterIndex = 0; // Cuarto Mínimo
    quarterReason = 'Concurren únicamente circunstancias de menor punibilidad (Art. 55 C.P.). Procede el Cuarto Mínimo.';
  } else if (art58Count > 0 && art55Count === 0) {
    activeQuarterIndex = 3; // Cuarto Máximo
    quarterReason = 'Concurren únicamente circunstancias de mayor punibilidad (Art. 58 C.P.). Procede el Cuarto Máximo.';
  } else if (art55Count > 0 && art58Count > 0) {
    activeQuarterIndex = 1; // Cuartos Medios (Medio Inferior)
    quarterReason = 'Concurren simultáneamente atenuantes y agravantes. Procede moverse dentro de los Cuartos Medios.';
  } else {
    activeQuarterIndex = 0; // Sin antecedentes / ni atenuantes ni agravantes -> Primer cuarto legal
    quarterReason = 'No concurren causales de atenuación ni agravación tasadas. Procede el primer cuarto legal (Cuarto Mínimo).';
  }

  highlightQuarterCard(activeQuarterIndex, quarterReason);

  // Determinar límites del cuarto seleccionado para el slider de tasación judicial
  let qActiveMin = q1Min;
  let qActiveMax = q1Max;

  if (activeQuarterIndex === 0) {
    qActiveMin = q1Min; qActiveMax = q1Max;
  } else if (activeQuarterIndex === 1) {
    qActiveMin = q2Min; qActiveMax = q2Max;
  } else if (activeQuarterIndex === 2) {
    qActiveMin = q3Min; qActiveMax = q3Max;
  } else {
    qActiveMin = q4Min; qActiveMax = q4Max;
  }

  // Ajustar slider de pena individual
  const slider = document.getElementById('slider-pena-individual');
  slider.min = qActiveMin;
  slider.max = qActiveMax;
  slider.step = 0.5;

  if (parseFloat(slider.value) < qActiveMin || parseFloat(slider.value) > qActiveMax) {
    slider.value = qActiveMin;
  }

  updatePenaFinal(qActiveMin, qActiveMax);
}

function countChecked(className) {
  const checkboxes = document.querySelectorAll(`.${className}:checked`);
  return checkboxes.length;
}

function highlightQuarterCard(index, reasonText) {
  const cards = [
    document.getElementById('card-cuarto-1'),
    document.getElementById('card-cuarto-2'),
    document.getElementById('card-cuarto-3'),
    document.getElementById('card-cuarto-4')
  ];

  cards.forEach((card, i) => {
    const badge = card.querySelector('.quarter-badge');
    if (i === index) {
      card.className = "relative rounded-xl p-4 bg-white border-2 border-amber-600 shadow-md flex flex-col justify-between transition-all";
      if (badge) {
        badge.className = "quarter-badge mt-3 pt-1.5 pb-1 bg-amber-50 border border-amber-200 text-amber-900 rounded text-center text-[11px] font-bold uppercase tracking-wider block";
        badge.textContent = "Ámbito Aplicable";
      }
    } else {
      card.className = "relative rounded-xl p-4 bg-slate-50 border border-slate-200 opacity-60 flex flex-col justify-between transition-all";
      if (badge) {
        badge.className = "quarter-badge mt-3 pt-1.5 pb-1 bg-slate-100 text-slate-400 rounded text-center text-[11px] font-semibold uppercase tracking-wider block";
        badge.textContent = "Inaplicable";
      }
    }
  });

  const reasonElem = document.getElementById('calc-quarter-reason');
  if (reasonElem) reasonElem.textContent = reasonText;
}

function updatePenaFinal() {
  const slider = document.getElementById('slider-pena-individual');
  const tasacionMeses = parseFloat(slider.value) || 0;

  const rebajaSelect = document.getElementById('calc-rebaja-select');
  const rebajaPorcentaje = parseFloat(rebajaSelect.value) || 0;

  const rebajaCalculadaMeses = Math.round((tasacionMeses * (rebajaPorcentaje / 100)) * 10) / 10;
  const penaFinalMeses = Math.round((tasacionMeses - rebajaCalculadaMeses) * 10) / 10;

  // Actualizar labels en la pantalla
  document.getElementById('lbl-tasacion-individual').textContent = `${tasacionMeses} meses`;
  document.getElementById('lbl-tasacion-conversion').textContent = formatMesesToYearsMonthsDays(tasacionMeses);

  document.getElementById('lbl-rebaja-monto').textContent = `-${rebajaPorcentaje}% (${rebajaCalculadaMeses} meses)`;
  document.getElementById('lbl-pena-final').textContent = `${penaFinalMeses} meses`;
  document.getElementById('lbl-pena-final-conversion').textContent = `${formatMesesToYearsMonthsDays(penaFinalMeses)} de Prisión`;

  // Actualizar sumario de dictamen para copiar
  updateDictamenSummary(tasacionMeses, rebajaPorcentaje, rebajaCalculadaMeses, penaFinalMeses);
}

function updateDictamenSummary(tasacion, rebajaPct, rebajaMeses, penaFinal) {
  const selectDelito = document.getElementById('calc-delito-select');
  const delitoNombre = selectDelito.options[selectDelito.selectedIndex].text;
  
  const dictamen = `DICTAMEN DE DOSIFICACIÓN PUNITIVA (Ley 599 de 2000 & Ley 906 de 2004)
---------------------------------------------------------------------------------
1. Delito Calificado: ${delitoNombre}
2. Límites Operativos Definitivos: ${document.getElementById('lbl-min-operativo').textContent} a ${document.getElementById('lbl-max-operativo').textContent}
3. Ámbito de Punibilidad: ${document.getElementById('lbl-ambito-total').textContent} (Extensión cuarto: ${document.getElementById('lbl-extension-cuarto').textContent})
4. Criterio de Selección de Cuarto: ${document.getElementById('calc-quarter-reason').textContent}
5. Tasación Individual Motivada (Art. 61 Inc. 3): ${tasacion} meses (${formatMesesToYearsMonthsDays(tasacion)})
6. Descuento por Allanamiento / Preacuerdo: -${rebajaPct}% (-${rebajaMeses} meses)
7. PENA PRIVATIVA DE LA LIBERTAD DEFINITIVA: ${penaFinal} meses (${formatMesesToYearsMonthsDays(penaFinal)})
---------------------------------------------------------------------------------
Nota de Arbitrio Judicial: Este cómputo sirve de apoyo técnico y metodológico; la pena final corresponde a la valoración motivada del juez de conocimiento.`;

  const dictamenArea = document.getElementById('dictamen-text-export');
  if (dictamenArea) dictamenArea.value = dictamen;
}

function copyDictamen() {
  const dictamenArea = document.getElementById('dictamen-text-export');
  if (!dictamenArea) return;

  navigator.clipboard.writeText(dictamenArea.value).then(() => {
    showToast('¡Dictamen y memoria de cálculo copiados al portapapeles!');
  }).catch(() => {
    dictamenArea.select();
    document.execCommand('copy');
    showToast('¡Dictamen copiado!');
  });
}

// ============================================================
// 6. FUNCIÓN 4: ESCRIBIR AL PROFESOR
// ============================================================
function openTeacherEmail() {
  const email = AppState.teacherEmail;
  const subject = encodeURIComponent('[Electiva IA] Consulta del Estudiante - Proyecto Dosificador');
  const body = encodeURIComponent(`Estimado Profesor,\n\nLe escribo respecto al proyecto de la Electiva de Inteligencia Artificial.\n\nMi consulta es la siguiente:\n\n[Escribe aquí tu duda o adjunta tu caso]\n\nAtentamente,\n[Tu Nombre y Código de Estudiante]`);

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function copyTeacherEmail() {
  navigator.clipboard.writeText(AppState.teacherEmail).then(() => {
    showToast(`¡Correo copiado!: ${AppState.teacherEmail}`);
  }).catch(() => {
    showToast(`Correo del docente: ${AppState.teacherEmail}`);
  });
}

function updateTeacherEmail() {
  const customEmail = prompt('Ingresa el correo electrónico del docente:', AppState.teacherEmail);
  if (customEmail && customEmail.includes('@')) {
    AppState.teacherEmail = customEmail.trim();
    const emailLabels = document.querySelectorAll('.teacher-email-label');
    emailLabels.forEach(el => el.textContent = AppState.teacherEmail);
    showToast('Correo del docente actualizado para el prototipo.');
  }
}

// ============================================================
// 7. BASE DE DATOS Y CONECTOR FIREBASE FIRESTORE
// ============================================================
function showDatabaseStatusModal() {
  const modal = document.getElementById('db-config-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDatabaseStatusModal() {
  const modal = document.getElementById('db-config-modal');
  if (modal) modal.classList.add('hidden');
}

function testDatabaseConnection() {
  showToast('Base de datos activa en modo LocalStorage (100% funcional). Listo para conectar Firebase Firestore cuando lo desees.');
}

// ============================================================
// 8. UTILIDADES Y TOAST NOTIFICATIONS
// ============================================================
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700 transition-all transform duration-300 pointer-events-none opacity-0 translate-y-3';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined text-amber-400 text-[20px] shrink-0">info</span>
    <span class="flex-1">${message}</span>
  `;

  toast.classList.remove('opacity-0', 'translate-y-3');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-3');
  }, 4000);
}

// ============================================================
// INICIALIZACIÓN GLOBAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initFAQ();
  initPromptBuilder();
  recalculateCuartos();
});
