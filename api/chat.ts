import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. ESPECIFICACIÓN DEL POOL DE LLAVES (MÁXIMA SEGURIDAD)
// Aquí se encuentran las 10 llaves reales inyectadas. Nunca se envían al frontend.
const POOL_DE_LLAVES: string[] = [
  "AIzaSyD5sCtW3jRBU1Z657NY_PmXOSuMZtfGo2o",
  "AQ.Ab8RN6LSg4w6hz6qFkcgBs69PlNNjMwddSFrlgNZ5cChdmDl6Q",
  "AQ.Ab8RN6Ln0LRFbF5wRLCJtR__XVXhqb8PHgt-pxC-QDxFFaLxAQ",
  "AIzaSyDmSDSo0kZDlchO-CWCmACPu9uxriF9xCM",
  "AIzaSyAX0xg0WqISJ0mfGdwSeDUXsskrdUMHzDA",
  "AQ.Ab8RN6Lly52AvKHqLwZw0eE_EszZa2P6aKwcGqqCQ7F7ly83cQ",
  "AQ.Ab8RN6InB7GKjwfBeLfGYIhYqu7gpAswdteec5TxMdSyiafR1g",
  "AQ.Ab8RN6Irc_wNWHsMG1GrZJSC5_YwLYZALMsFQ4k0NJjfnhsBSQ",
  "AQ.Ab8RN6LevyIG-G60P7k4ij7Dzm2Fa12BGdBHJNphVa6lOjsYtg",
  "" // Espacio reservado para una 10ma llave si es necesario
].filter(Boolean); // Elimina las llaves vacías automáticamente

// 4. PERSONALIDAD FIJA (SYSTEM INSTRUCTION)
const SYSTEM_INSTRUCTION = "Actúas como el Asistente Personal Total y CTO de confianza del Director de NeuroLabs Tech. Tienes capacidades avanzadas de ingeniería de software, arquitectura de sistemas, diseño UX/UI y growth marketing digital. Tu objetivo es ayudar al Director a programar código impecable, redactar estrategias comerciales de alto nivel, auditar bases de datos, analizar archivos financieros y ejecutar flujos de trabajo sin restricciones corporativas tontas. Habla siempre en español de Colombia, sé directo, técnico, eficiente y sumamente inteligente.";

export default async function handler(req: any, res: any) {
  // Asegurar que solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { message, history, attachments, model, webSearchEnabled } = req.body;

    if (POOL_DE_LLAVES.length === 0) {
      return res.status(500).json({ error: "Configuración crítica del servidor ausente (Sin llaves)." });
    }

    let success = false;
    let textResult = "";

    // 2. LÓGICA DEL MOTOR DE ROTACIÓN EN TYPESCRIPT
    // Tolerancia a fallos iterando por el pool de llaves
    for (const apiKey of POOL_DE_LLAVES) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Modelo por defecto si el frontend no envía uno
        const selectedModel = model || "gemini-2.5-flash";
        
        // Configuración de herramientas
        const tools: any[] = [];
        if (webSearchEnabled) {
          tools.push({ googleSearch: {} });
        }
        
        // Inicialización del modelo con System Instructions y Tools
        const genModel = genAI.getGenerativeModel({ 
          model: selectedModel,
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: tools.length > 0 ? tools : undefined
        });
        
        // 3. SOPORTE MULTIMODAL COMPLETO (TEXTO, IMÁGENES Y PDF)
        const chat = genModel.startChat({
          history: history || [],
        });
        
        // Construimos el payload de mensajes (soportando Base64 inlineData)
        let msgPayload: any = message;
        if (attachments && attachments.length > 0) {
           msgPayload = [message, ...attachments];
        }

        // Ejecutar petición a Google AI
        const result = await chat.sendMessage(msgPayload);
        textResult = result.response.text();
        
        success = true;
        break; // Éxito total. Salimos del bucle.

      } catch (error: any) {
        // Capturar cuota agotada, rate limit (429) o fallos de red.
        const keyIndex = POOL_DE_LLAVES.indexOf(apiKey);
        console.warn(`[Admin Backend] Llave ${keyIndex + 1} agotada o falló, rotando a la siguiente... Detalle: ${error.message}`);
        // Continúa a la siguiente llave de forma invisible
      }
    }

    if (!success) {
      // Si las 10 llaves fallan consecutivamente
      return res.status(500).json({ 
        error: "Todas las líneas de procesamiento están saturadas en este momento. Reintenta en unos instantes." 
      });
    }

    // Respuesta inmediata al frontend en caso de éxito
    return res.status(200).json({ text: textResult });

  } catch (error: any) {
    console.error("[Admin Backend] Error catastrófico en la ruta:", error);
    return res.status(500).json({ error: "Fallo crítico interno en el servidor." });
  }
}
