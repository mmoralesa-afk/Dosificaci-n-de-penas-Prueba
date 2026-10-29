/**
 * ==============================================================================
 * IURISDOSIS COLOMBIA — CONFIGURACIÓN DE GOOGLE FIREBASE & FIRESTORE
 * ==============================================================================
 * 
 * GUÍA PASO A PASO PARA CONECTAR TU BASE DE DATOS GRATUITA EN LA NUBE (3 MINUTOS):
 * ------------------------------------------------------------------------------
 * 1. Ingresa a la consola de Google Firebase: https://console.firebase.google.com/
 * 2. Inicia sesión con tu cuenta de Google y haz clic en "Crear un proyecto" (o "Agregar proyecto").
 *    - Nombre sugerido: "iurisdosis-colombia" o "electiva-ia".
 * 3. En el menú lateral izquierdo, ve a "Compilación" -> "Firestore Database":
 *    - Haz clic en "Crear base de datos".
 *    - Selecciona "Modo de prueba" (para permitir lecturas/escrituras comunitarias durante pruebas).
 *    - Elige una ubicación cercana (ej. us-central o southamerica-east1) y pulsa "Habilitar".
 * 4. Ve a la rueda dentada ⚙️ (Configuración del proyecto) -> Pestaña "General" -> "Tus apps":
 *    - Haz clic en el ícono Web (</>).
 *    - Registra el nombre de la app (ej. "IurisDosis Web").
 * 5. Copia el objeto `firebaseConfig` que te entrega Firebase y reemplaza los valores abajo:
 * ==============================================================================
 */

const FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "electiva-ia.firebaseapp.com",
  projectId: "electiva-ia",
  storageBucket: "electiva-ia.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// ==============================================================================
// DETECCIÓN AUTOMÁTICA DEL ESTADO DE CONEXIÓN
// ==============================================================================
const isFirebaseConfigured = Boolean(
  FIREBASE_CONFIG.apiKey && 
  FIREBASE_CONFIG.apiKey !== "TU_API_KEY_AQUI" && 
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.projectId !== "electiva-ia" // O cualquier projectId real asignado por el usuario
);

let firestoreInstance = null;

// Inicialización segura si el SDK de Firebase está cargado y hay credenciales
if (typeof firebase !== 'undefined' && isFirebaseConfigured) {
  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    firestoreInstance = firebase.firestore();
    console.log("%c✓ Google Firebase Firestore conectado exitosamente a la nube", "color: #10b981; font-weight: bold;");
  } catch (err) {
    console.warn("Aviso al inicializar Google Firebase:", err);
  }
} else {
  console.log("%cℹ️ IurisDosis operando con Almacenamiento Local (Listo para conectar Firestore cuando configures tus credenciales)", "color: #f59e0b; font-weight: bold;");
}

// ==============================================================================
// EXPORTACIÓN GLOBAL PARA LA APLICACIÓN
// ==============================================================================
window.ElectivaFirebase = {
  isConfigured: isFirebaseConfigured,
  config: FIREBASE_CONFIG,
  getDb: () => firestoreInstance,
  coleccionDudas: "dudas_comunitarias"
};
