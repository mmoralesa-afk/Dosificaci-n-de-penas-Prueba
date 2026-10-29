# ⚖️ IurisDosis Colombia — Dosificador Penal & Sistema de Cuartos

[![Pruebas Automatizadas](https://img.shields.io/badge/Tests-46%2F46%20Passing-10b981?style=for-the-badge&logo=checkmarx&logoColor=white)](./test-suite.html)
[![Ley 599 de 2000](https://img.shields.io/badge/C%C3%B3digo%20Penal-Ley%20599%20de%202000-0d1c2f?style=for-the-badge&logo=law&logoColor=white)](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=6388)
[![Ley 906 de 2004](https://img.shields.io/badge/C.P.P.-Ley%20906%20de%202004-9b4500?style=for-the-badge)](https://www.secretariasenado.gov.co/senado/basedoc/ley_0906_2004.html)
[![100% Client-Side](https://img.shields.io/badge/Arquitectura-100%25%20Client--Side-3b82f6?style=for-the-badge&logo=javascript&logoColor=white)](#-arquitectura-tecnol%C3%B3gica)
[![GitHub Pages Ready](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?style=for-the-badge&logo=githubpages&logoColor=white)](#-despliegue-en-github-pages)

> **IurisDosis Colombia** es una plataforma web judicial de grado profesional, 100% Client-Side (sin dependencias complejas ni backend forzoso), diseñada para el cálculo aritmético riguroso de la dosificación de la pena, la determinación imperativa del sistema de cuartos de punibilidad, la redacción motivada del dictamen judicial y la asistencia jurídica inteligente asistida por IA (Google Gemini) y base de datos comunitaria en la nube (Google Firebase Firestore).

---

## 📑 Tabla de Contenidos

1. [Las 4 Funciones Principales](#-las-4-funciones-principales)
2. [Espacio de Ayuda Inteligente (Gemini IA & Firebase)](#-espacio-de-ayuda-inteligente-gemini-ia--firebase)
3. [Arquitectura Tecnológica & Archivos](#-arquitectura-tecnol%C3%B3gica)
4. [Ejecución en Local (Paso a Paso)](#-ejecución-en-local)
5. [Suite de Pruebas Automatizadas (46 Pruebas)](#-suite-de-pruebas-automatizadas)
6. [Conexión de Google Firebase Firestore](#-conexión-de-google-firebase-firestore)
7. [Despliegue en GitHub Pages](#-despliegue-en-github-pages)
8. [Fundamento Jurídico & Jurisprudencial](#-fundamento-jur%C3%ADdico)

---

## ⚖️ Las 4 Funciones Principales

### 1. Ingreso y Análisis Fáctico del Caso Concreto
* **Metadatos judiciales completos:** Radicado SPOA (21 dígitos de Noticia Criminal), etapa procesal según Ley 906 de 2004 (Imputación Art. 286, Acusación Art. 336, Preparatoria Art. 355, Juicio Art. 443, Sentencia Art. 447), despacho fiscal, juzgado competente e imputado.
* **Control de legalidad temporal:** Fecha de ocurrencia de la conducta para vigencia y ultraactividad de la ley penal.
* **Núcleo fáctico y contador en vivo:** Conteo automático de palabras y caracteres en el relato fáctico.
* **Escáner inteligente de tipicidad:** Algoritmo heurístico que detecta patrones jurídicamente relevantes en la redacción fáctica (*sevicia*, *estado de indefensión*, *coparticipación criminal*, *empleo de arma cortopunzante o medio peligroso*).
* **Calificación típica:** Tipo penal base, agravante específico, forma de intervención (Art. 29 y 30 C.P.), grado de consumación (Art. 27 C.P.) y culpabilidad (dolo, culpa, preterintención).
* **Justicia negociada y allanamiento:** Tasación porcentual de la rebaja según la oportunidad procesal (hasta el 50% en imputación, 33% en acusación, 16.6% en juicio).
* **Control imperativo de prohibiciones:** Bloqueo algorítmico estricto al 0% de descuento si concurren prohibiciones del **Artículo 199 de la Ley 1098 de 2006** (delitos contra menores de edad) o del **Artículo 68A del C.P.**
* **Predictor del sistema de cuartos:** Selección interactiva de circunstancias de menor punibilidad (*Art. 55 C.P.*) y mayor punibilidad (*Art. 58 C.P.*) con subsunción legal inmediata.

### 2. Catálogo y Búsqueda de Delitos (Ley 599 de 2000)
* **Base de datos con más de 22 tipos penales emblemáticos:** Homicidio Simple (Art. 103), Homicidio Agravado (Art. 104 Num. 7), Homicidio por Piedad (Art. 106), Homicidio Culposo (Art. 109), Lesiones Personales (Arts. 111 y 112), Secuestro Simple y Extorsivo (Arts. 168 y 169), Acceso Carnal Violento (Art. 205), Acceso Carnal con Menor de 14 Años (Art. 208), Hurto Simple y Agravado (Arts. 239 a 241), Extorsión (Art. 244), Falsedad Ideológica (Art. 286), Porte de Armas (Art. 365), Tráfico de Estupefacientes (Art. 376), Peculado por Apropiación (Art. 397), Concusión (Art. 404), Cohecho (Art. 405), Prevaricato (Art. 413), entre otros.
* **Búsqueda instantánea:** Por número de artículo, denominación típica o palabra clave.
* **Filtros por bien jurídico tutelado:** Vida e Integridad Personal, Patrimonio Económico, Libertad Sexual, Salud Pública, Administración Pública, Seguridad Pública.
* **Ficha técnica legal expandida:** Texto legal exacto entrecomillado, extremos legales en meses y años/meses, ámbito punitivo, valor del cuarto, penas accesorias, sanciones patrimoniales (multas SMLMV) y circunstancias específicas.
* **Carga en un clic:** Botón directo para transferir el delito seleccionado a la Calculadora de Cuartos.

### 3. Calculadora de Dosificación y Sistema de Cuartos (Arts. 60 y 61 C.P.)
* **Fase 1 — Modificadores del Artículo 60 C.P.:** Cómputo matemático de dispositivos amplificadores:
  * *Tentativa acabada (Art. 27 inc. 1):* Rebaja de 1/3 del máximo a 1/2 del mínimo.
  * *Tentativa inacabada (Art. 27 inc. 2):* Rebaja de 1/2 a 2/3.
  * *Complicidad (Art. 30 inc. 3):* Rebaja de 1/6 a 1/2.
  * *Interviniente (Art. 30 inc. 4):* Rebaja de 1/4.
  * *Ira e intenso dolor (Art. 57):* Rebaja de 1/6 a 1/2.
  * *Marginalidad o ignorancia extrema (Art. 56):* Rebaja de 1/6 a 1/2.
* **Fase 2 — Cómputo del Ámbito Punitivo (Art. 61 inc. 1 C.P.):**
  $$\text{Ámbito Punitivo} = \text{Pena Máxima Modificada} - \text{Pena Mínima Modificada}$$
  $$\text{Amplitud de cada Cuarto} = \frac{\text{Ámbito Punitivo}}{4}$$
* **Fase 3 — División y Subsunción en los Cuatro Cuartos (Art. 61 inc. 2 C.P.):**
  * **Primer Cuarto (Mínimo):** Se activa exclusivamente cuando solo concurren causales de menor punibilidad (Art. 55).
  * **Cuartos Medios (Inferior y Superior):** Se activan cuando concurren simultáneamente circunstancias de atenuación y agravación, o ante la ausencia total de ambas.
  * **Cuarto Máximo:** Se activa obligatoriamente cuando solo concurren causales de mayor punibilidad (Art. 58).
* **Fase 4 — Ponderación Judicial del Quantum (Art. 59 y 61 inc. 3 C.P.):**
  * Slider milimétrico con paso de 0.5 meses dentro del cuarto operativo.
  * Criterios objetivos: gravedad de la conducta, daño real o potencial, intensidad del dolo y necesidad preventiva.
* **Fase 5 — Aplicación de Justicia Premial:**
  * Descuento porcentual pactado o bloqueo automático a 0% por prohibición expresa.
  * Cálculo final exacto de la pena privativa de la libertad en meses y en formato humanizado (*"X años y Y meses"*).

### 4. Auto de Dosificación y Memoria de Cálculo (Art. 59 C.P. & Art. 447 C.P.P.)
* **Estructura procesal de auto interlocutorio / fallo:** Encabezado oficial de la República de Colombia, radicado SPOA, identificación de partes y carátula procesal.
* **Memoria de cálculo tabulada y certificada:** Tabla formal con límites abstractos, límites modificados, ámbito punitivo y desglose de los cuatro cuartos con su fundamento normativo.
* **Motivación jurídica del cuarto seleccionado:** Redacción formal según la concurrencia probatoria de causales de los Arts. 55 y 58 C.P.
* **Evaluación de mecanismos sustitutivos de prisión:**
  * *Suspensión condicional de la ejecución de la pena (Art. 63 C.P.):* Condena impuesta $\le 48\text{ meses}$.
  * *Prisión domiciliaria como sustitutiva (Art. 38B C.P.):* Pena mínima legal $\le 96\text{ meses}$ y control de exclusiones del Art. 68A.
* **Acciones integradas:**
  * 📋 *Copiar Auto Completo* al portapapeles.
  * 💾 *Descargar Dictamen* en formato `.txt`.
  * 🖨️ *Imprimir / Guardar como PDF* con estilos optimizados para papel.

---

## 💡 Espacio de Ayuda Inteligente (Gemini IA & Firebase)

1. **Diagnóstico Estructurado en 5 Preguntas:**
   * *1. ¿Cuál es su error o duda?*
   * *2. ¿Qué quieren lograr?*
   * *3. ¿Para qué módulo?* (Calculadora, Hechos, Delitos, Dictamen o General).
   * *4. ¿Qué han intentado?*
   * *5. ¿Qué mensaje de error o inconsistencia aparece?*
2. **Generador de Prompt Especializado para Google Gemini:**
   * Diseña un prompt de alta precisión actuando con el rol de Magistrado de la Corte Suprema y especialista en ingeniería de software jurídico.
   * Incluye cita de normas aplicables y jurisprudencia obligatoria.
   * Botón de **Copiar Prompt con 1 clic** para usar en Gemini o ChatGPT.
3. **Resolución Directa con IA:**
   * Genera de forma inmediata un dictamen jurídico preliminar basado en las reglas del Código Penal.
4. **Banco Comunitario de Dudas:**
   * Repositorio interactivo de preguntas y respuestas jurídicas frecuentes.
   * Búsqueda en tiempo real y filtrado por módulo.
   * **Persistencia Híbrida Inteligente:** Opera automáticamente con almacenamiento local (`localStorage`) y, al ingresar las credenciales en `firebase-config.js`, se sincroniza en la nube en tiempo real mediante **Google Firebase Firestore**.

---

## 🛠️ Arquitectura Tecnológica

```
Dosificaci-n-de-penas-main/
│
├── index.html                   # Interfaz de usuario completa (Tailwind CSS + HTML5 semántico)
├── app.js                       # Estado global (AppState), Navegación (AppNav) y Módulo de Hechos
├── catalogo-y-calculadora.js    # Catálogo de Delitos, Calculadora de Cuartos, Dictamen y Ayuda IA
├── firebase-config.js           # Credenciales y controlador de Google Firebase Firestore
├── test-suite.html              # Suite interactiva de pruebas visuales para el navegador
├── test-suite.ps1               # Suite de pruebas automatizadas en CLI (PowerShell nativo)
├── local-server.ps1             # Servidor HTTP local ultraligero (.NET HttpListener)
├── .gitignore                   # Exclusiones de control de versiones
├── README.md                    # Documentación técnica y jurídica del repositorio
└── .github/
    └── workflows/
        └── deploy.yml           # Workflow automático de GitHub Actions para GitHub Pages
```

---

## 🚀 Ejecución en Local

Al ser una aplicación **100% Client-Side**, no requiere compilar, ni instalar `npm`, `node` ni entornos pesados:

### Opción A (La más rápida — Doble clic):
1. Abre directamente el archivo `index.html` en tu navegador favorito (Chrome, Edge, Firefox, Safari).
2. ¡Listo! Todo funciona de inmediato, sin conexión requerida.

### Opción B (Con servidor local PowerShell):
1. Abre una terminal de PowerShell en la carpeta del proyecto.
2. Ejecuta:
   ```powershell
   .\local-server.ps1
   ```
3. El script seleccionará el primer puerto libre (8080, 8081, etc.), levantará el servidor HTTP y abrirá automáticamente tu navegador en `http://localhost:8080/`.

---

## 🧪 Suite de Pruebas Automatizadas

El proyecto cuenta con **dos mecanismos de pruebas** que verifican el 100% de la lógica aritmética y legal:

### 1. Pruebas por Consola (CLI):
Ejecuta en PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-suite.ps1
```
*Salida esperada:*
```text
======================================================================
   IURISDOSIS COLOMBIA - EJECUTOR DE PRUEBAS AUTOMATIZADAS
   Validacion de Algoritmos de Dosimetria, Cuartos y Catalogo Legal
======================================================================
[1/6] Verificando integridad de estructura del repositorio...   [OK]
[2/6] Verificando sincronizacion de IDs...                       [OK]
[3/6] Verificando Catalogo de Delitos y Tipos Penales...        [OK]
[4/6] Verificando formulas matematicas del Sistema de Cuartos... [OK]
[5/6] Verificando Reglas de Subsuncion y Prohibiciones...        [OK]
[6/6] Verificando Arquitectura de Firebase y Ayuda IA...        [OK]
======================================================================
  Total de Pruebas Ejecutadas : 46
  Pruebas Superadas (PASS)    : 46 (100% OK)
======================================================================
```

### 2. Pruebas Visuales en el Navegador:
Abre el archivo `test-suite.html` en tu navegador o visita `http://localhost:8080/test-suite.html`. Verás una interfaz con métricas en tiempo real, resumen de ejecución y confirmación de todas las aserciones.

---

## ☁️ Conexión de Google Firebase Firestore

El sistema está configurado con **modo tolerante a fallos**: si aún no has conectado Firebase, funciona al 100% con almacenamiento local sin arrojar errores.

Cuando desees conectar tu base de datos comunitaria en la nube de Google Firebase:

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/) e inicia sesión con tu cuenta de Google.
2. Crea un nuevo proyecto (por ejemplo `iurisdosis-colombia`).
3. En el menú izquierdo, ve a **Compilación > Firestore Database**:
   * Haz clic en **Crear base de datos**.
   * Selecciona **Modo de prueba** (permite lectura y escritura inmediata).
   * Pulsa **Habilitar**.
4. Ve a la rueda dentada ⚙️ (**Configuración del proyecto**) > pestaña **General** > **Tus apps** > selecciona el ícono Web `</>`.
5. Copia el objeto `firebaseConfig` y pégalo en el archivo [`firebase-config.js`](./firebase-config.js):
   ```javascript
   const FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
6. Guarda el archivo y recarga `index.html`. La píldora superior del módulo de Ayuda cambiará inmediatamente a verde: **"Google Firebase Firestore Conectado (Nube)"**, y las dudas se sincronizarán en tiempo real.

---

## 🌐 Despliegue en GitHub Pages

Subir tu proyecto a Internet de forma gratuita en GitHub Pages toma menos de 1 minuto:

1. Crea un repositorio en [GitHub](https://github.com/new) (por ejemplo `Dosificaci-n-de-penas`).
2. Sube tus archivos al repositorio:
   ```bash
   git init
   git add .
   git commit -m "feat: IurisDosis Colombia v2.0 - Sistema de Cuartos y Dosimetria Penal"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
3. En la página de tu repositorio en GitHub:
   * Ve a **Settings** > pestaña **Pages** (en el menú lateral izquierdo).
   * En **Source**, selecciona: **Deploy from a branch**.
   * En **Branch**, elige **`main`** y carpeta **`/ (root)`**.
   * Haz clic en **Save**.
4. ¡Listo! En 1 minuto tu aplicación estará disponible públicamente en:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

*(Nota: También se incluye el archivo `.github/workflows/deploy.yml` por si prefieres activar despliegues automáticos con GitHub Actions).*

---

## 📚 Fundamento Jurídico & Jurisprudencial

* **Código Penal Colombiano (Ley 599 de 2000):**
  * *Artículo 27:* Tentativa inacabada y acabada.
  * *Artículo 29 y 30:* Autoría, coautoría, complicidad e interviniente.
  * *Artículo 55:* Circunstancias de menor punibilidad.
  * *Artículo 58:* Circunstancias de mayor punibilidad.
  * *Artículo 59:* Motivación del proceso individualizador de la pena.
  * *Artículo 60:* Parámetros para la determinación de los mínimos y máximos aplicables.
  * *Artículo 61:* Fundamentación para la individualización de la pena y regla estricta de cuartos de punibilidad.
  * *Artículo 63:* Suspensión condicional de la ejecución de la pena privativa de la libertad.
  * *Artículo 38B:* Prisión domiciliaria como sustitutiva de la prisión carcelaria.
* **Código de Procedimiento Penal (Ley 906 de 2004):**
  * *Artículos 286, 336, 355, 443 y 447:* Estadios de formulación de cargos y audiencia de individualización de pena y sentencia.
  * *Artículo 351:* Rebajas de pena por allanamiento a cargos y justicia premial.
* **Código de la Infancia y la Adolescencia (Ley 1098 de 2006):**
  * *Artículo 199:* Exclusión taxativa de beneficios y rebajas punitivas en delitos contra niños, niñas y adolescentes.
* **Corte Suprema de Justicia (Sala de Casación Penal):**
  * *Sentencia SP48801:* Rigor en el cómputo del sistema de cuartos y prohibición de desbordamiento punitivo (*Principio de Legalidad*).
  * *Sentencia SP1944-2021:* Criterios de determinación en modificadores concurrentes del Art. 60.

---

**IurisDosis Colombia** — Desarrollado con rigor técnico y normativo para jueces, fiscales, defensores y estudiantes de Derecho.
