# IurisDosis Colombia — Dosificador Penal & Sistema de Cuartos

> Aplicación web 100% Client-Side (sin servidor y sin registro obligatorio) para el cálculo riguroso de la dosificación penal y el sistema de cuartos de punibilidad en el Derecho Penal Colombiano (Código Penal — Ley 599 de 2000 y Ley 906 de 2004).

🔗 **Repositorio Oficial:** [https://github.com/yvgarcia-gif/Dosificaci-n-de-penas](https://github.com/yvgarcia-gif/Dosificaci-n-de-penas)

---

## ⚖️ Las 4 Funciones Principales de la Aplicación

### 1. Ingreso y Análisis de los Hechos del Caso Concreto *(Completada y Activa)*
* **Metadatos judiciales:** Número de radicado SPOA (21 dígitos), etapa procesal (Arts. 286, 336, 355, 443, 447 C.P.P.), fiscalía y juzgado de conocimiento, imputado y defensa técnica.
* **Núcleo fáctico imputable:** Transcripción de los hechos con fecha de ocurrencia (principio de legalidad y vigencia de la ley en el tiempo).
* **Contador en vivo:** Control en tiempo real de palabras y caracteres.
* **Escaneo inteligente de tipicidad:** Algoritmo que detecta patrones fácticos clave (*sevicia*, *indefensión*, *coparticipación*, *arma cortopunzante*).
* **Calificación jurídica preliminar:** Tipo penal base, agravante específico, forma de intervención (Art. 29 y 30 C.P.), grado de consumación (Art. 27 C.P.) y modalidad de la conducta.
* **Justicia negociada y allanamiento:** Tasación de rebajas por oportunidad procesal (hasta el 50%) con filtro imperativo de prohibiciones (*Art. 199 Ley 1098/2006* y *Art. 68A C.P.*).
* **Predictor del sistema de cuartos (Art. 61 C.P.):** Selección interactiva de circunstancias de menor (Art. 55) y mayor punibilidad (Art. 58) con cálculo automático del cuarto resultante.

### 2. Búsqueda de Delitos y Consulta de Penas Legales *(Fase Siguiente)*
* Catálogo de delitos del Código Penal Colombiano.
* Búsqueda ágil por nombre o número de artículo.
* Visualización de penas mínimas y máximas en meses y años, y tipo de pena principal y accesoria.

### 3. Calculadora de Dosificación y Sistema de Cuartos *(Fase Siguiente)*
* Parámetros de determinación de mínimos y máximos aplicables (Art. 60 C.P.).
* Cálculo matemático exacto del Ámbito Punitivo de Movilidad y su división en 4 partes iguales:
  * Primer Cuarto (Mínimo).
  * Cuartos Medios (Inferior y Superior).
  * Cuarto Máximo.
* Fijación de la pena en meses y días.

### 4. Justificación Jurídica y Memoria de Cálculo *(Fase Siguiente)*
* Dictamen jurídico formal motivado y exportable.
* Detalle de las fórmulas matemáticas aplicadas y fundamentación normativa paso a paso.

---

## 💡 Espacio de Ayuda Inteligente (Gemini IA & Firebase)
* Formulario estructurado para resolver dudas técnicas y jurídicas del usuario:
  * *¿Cuál es su error o duda?*
  * *¿Qué quieren lograr?*
  * *¿Para qué módulo?*
  * *¿Qué han intentado?*
  * *¿Qué mensaje de error aparece?*
* Generador de prompt especializado con la **API de Gemini** para copiar con 1 clic.
* Base de datos comunitaria en **Firebase Firestore** para consultar preguntas frecuentes resueltas.

---

## 🚀 Cómo Ejecutar en Local

Al ser una aplicación 100% Client-Side, no requiere compilar ni instalar dependencias pesadas:
1. Abre el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Firefox, Edge, Safari).
2. Es totalmente responsiva: se adapta automáticamente a teléfonos celulares, tablets y computadores de escritorio.
