/**
 * ELECTIVA IA - CONFIGURACIÓN DE FIREBASE FIRESTORE
 * 
 * ¿Cómo conectar tu base de datos gratuita de Google Firebase en 3 minutos?
 * -------------------------------------------------------------------------
 * 1. Ve a https://console.firebase.google.com/ e inicia sesión con tu cuenta de Google.
 * 2. Haz clic en "Crear un proyecto" y ponle el nombre "electiva-ia".
 * 3. En el menú de la izquierda, entra a "Compilación" -> "Firestore Database" y dale "Crear base de datos" en "Modo de prueba".
 * 4. Ve a la ruedita de configuración del proyecto (Configuración del proyecto) -> "Tus apps" -> Selecciona el icono Web (</>).
 * 5. Copia los valores de firebaseConfig y pégalos a continuación:
 */

const FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "electiva-ia.firebaseapp.com",
  projectId: "electiva-ia",
  storageBucket: "electiva-ia.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Variable para verificar si el usuario ya configuró sus credenciales
const isFirebaseConfigured = FIREBASE_CONFIG.apiKey !== "TU_API_KEY_AQUI";

// Exportar para que la app sepa el estado de la conexión
window.ElectivaFirebase = {
  isConfigured: isFirebaseConfigured,
  config: FIREBASE_CONFIG
};
