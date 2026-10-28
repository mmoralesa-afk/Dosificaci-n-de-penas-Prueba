# Electiva de Inteligencia Artificial · Dosificador Penal Colombia

> Aplicación web 100% Client-Side (sin servidor y sin autenticación obligatoria) diseñada para funcionar fluidamente en navegadores móviles (iOS / Android) y computadores de escritorio.

🚀 **Sitio Web Público:** [https://yvgarcia-gif.github.io/electiva-ia/](https://yvgarcia-gif.github.io/electiva-ia/)

---

## 🏛️ Las 4 Funciones Principales

### 1. Preguntas Frecuentes y Banco de Dudas Colaborativo
* **Respuestas oficiales integradas:**
  * ¿Qué se pone en «hechos del caso» en el ingreso del caso concreto?
  * ¿El cálculo de los cuartos de punibilidad reemplaza la decisión final de un juez? (*Principio de Arbitrio Judicial*).
  * ¿Cuándo se entrega la primera versión funcional del proyecto?
* **Buscador en tiempo real:** Filtra preguntas al instante por palabras clave.
* **Banco colaborativo:** Permite a los estudiantes registrar nuevas preguntas que se almacenan automáticamente y muestran las respuestas del equipo docente.

### 2. Generador de Prompts Jurídicos con IA (Gemini)
* Formulario estructurado para resolver consultas de Derecho Penal:
  * *¿Cuál es el problema jurídico o duda del caso?*
  * *¿Para qué módulo o delito aplica?*
  * *¿Qué artículos o normas ya se han intentado aplicar?*
* Generación de prompts profesionales con contexto de la Ley 599 de 2000 y Ley 906 de 2004.
* Compatible con la **API de Google Gemini** y motor local offline.
* Botón de un solo clic para **Copiar Prompt** e historial de los últimos 10 prompts generados.

### 3. Calculadora de Cuartos y Dosificación Penal (Art. 61 C.P.)
* Catálogo de delitos colombianos precargados (Homicidio agravado, Homicidio simple, Hurto calificado, Tráfico de estupefacientes, Concierto para delinquir y Delito personalizado).
* Modificadores de grado automáticos: Tentativa (Art. 27), Complicidad (Art. 30) e Ira o Intenso Dolor (Art. 57).
* Cálculo matemático instantáneo de los 4 cuartos punitivos (Mínimo, Medio Inferior, Medio Superior y Máximo) con conversión a Años, Meses y Días.
* Matriz de circunstancias atenuantes (Art. 55) y agravantes (Art. 58) que resalta visualmente el cuarto legal aplicable.
* Tasación individual motivada mediante slider interactivo y liquidación de rebajas por allanamiento o preacuerdos (Art. 351 Ley 906).
* Generador y exportador del dictamen jurídico con memoria de cálculo.

### 4. Escribir al Profesor (Canal Rápido)
* Botón de acceso directo para abrir el cliente de correo (Gmail, Outlook) con asunto y plantilla de consulta prellenada.
* Botón de un solo toque para copiar el correo oficial al portapapeles.

---

## 🗄️ Base de Datos y Persistencia
* **Modo Local (Activo por defecto):** Guarda automáticamente preguntas, respuestas y prompts en el almacenamiento local del navegador (`LocalStorage`).
* **Conector Google Firebase Firestore:** Archivo [`firebase-config.js`](firebase-config.js) listo para sincronización multi-dispositivo en la nube.

---

## 📂 Estructura del Proyecto

```text
ELECTIVA IA/
├── index.html           # Interfaz principal completa y responsiva
├── app.js               # Lógica de las 4 funciones, cálculos y persistencia
├── firebase-config.js   # Conector preparado para Google Firebase Firestore
├── README.md            # Documentación del proyecto
└── .gitignore           # Exclusiones de archivos pesados y temporales
```
