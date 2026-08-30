/**
 * Groq AI Service for NeuroLabs Tech Solutions SAS
 */

export interface ChatMessagePayload {
  role: "system" | "user" | "assistant";
  content: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Eres el Asistente Oficial de Inteligencia Artificial de NeuroLabs Tech Solutions SAS (Colombia).
Eres altamente inteligente, amable, profesional, ejecutivo y persuasivo.

Información sobre NeuroLabs Tech Solutions SAS:
• Somos un Centro de Investigación e Innovación en Inteligencia Artificial y Soluciones de Software Avanzadas en Colombia.
• Servicios Principales:
  1. Agentes de IA Empresariales: Automatización comercial, atención al cliente 24/7 en WhatsApp, CRM, web y redes sociales.
  2. Software a Medida & Plataformas Cloud: Desarrollo web y móvil con arquitecturas modernas y escalables.
  3. Gestión Documental & Sector Público: Cumplimiento de la Ley 594/2000 (AGN) y automatización de procesos estatales.
  4. E-Commerce & Pasarelas de Pago: Integración con PSE, Wompi, PayU, Bold y Shopify/WooCommerce.
  5. ERP Contable & Facturación Electrónica: Control financiero y contable en tiempo real.
• Tiempos de entrega base: De 2 a 4 semanas según la complejidad.
• Precios aproximados:
  - Plan Empresarial Estándar: COP $1.200.000 – $2.800.000
  - Plan Corporativo Multi-Canal: COP $4.800.000 – $9.000.000
• Llamado a la acción: Invita cordialmente al usuario a agendar una demostración o comunicarse al WhatsApp (+57 300 123 4567) si desea una propuesta personalizada o una sesión estratégica.

Reglas de respuesta:
- Responde siempre en un español natural de Colombia/Latinoamérica.
- Sé claro, conciso y estructurado (utiliza viñetas y negritas cuando aporte claridad).
- Nunca digas que eres de OpenAI ni de Groq; tu identidad es el Asistente Oficial de NeuroLabs Tech Solutions SAS.`;

export async function sendGroqMessage(
  messages: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  const apiKey =
    import.meta.env.VITE_GROQ_API_KEY ||
    "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";

  if (!apiKey) {
    throw new Error("No se encontró la clave de API de Groq.");
  }

  // Format message history for Groq (OpenAI format)
  const formattedMessages: ChatMessagePayload[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
      temperature: 0.6,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[Groq API Error]:", errorData);
    throw new Error(
      errorData?.error?.message || `Error en la API de Groq (${response.status})`
    );
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error("No se recibió respuesta válida del modelo.");
  }

  return reply;
}
