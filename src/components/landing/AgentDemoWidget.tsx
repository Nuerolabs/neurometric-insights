import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Bot, X, Send, Minimize2, Sparkles, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  card?: QuoteCard;
}

interface QuoteCard {
  volume: string;
  crm: string;
  budget: string;
  estimatedPrice: string;
  plan: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION ENGINE — Mock Intelligent Backend
// ─────────────────────────────────────────────────────────────────────────────

type ConversationState =
  | "idle"
  | "quote_q1"   // asking volume
  | "quote_q2"   // asking CRM
  | "quote_q3"   // asking budget
  | "quote_done"
  | "schedule_done";

interface QuoteContext {
  volume?: string;
  crm?: string;
  budget?: string;
}

const SUPPORT_KEYWORDS = [
  "servicio", "servicios", "tiempo", "entrega", "equipo", "hacen", "ofrecen",
  "quiénes son", "qué hacen", "soporte", "ayuda", "información", "info",
  "hola", "buenas", "hello", "hi",
];

const QUOTE_KEYWORDS = [
  "quiero", "bot", "agente", "cuánto", "cuanto", "precio", "vale", "cuesta",
  "cotización", "cotizacion", "presupuesto", "contratar", "comprar", "necesito",
];

const SCHEDULE_KEYWORDS = [
  "agendar", "agenda", "cita", "reunión", "reunion", "me interesa", "interesa",
  "quiero empezar", "comenzar", "contratar", "demo", "hablar",
];

function detectIntent(text: string): "support" | "quote" | "schedule" | "unknown" {
  const lower = text.toLowerCase();
  if (SCHEDULE_KEYWORDS.some((kw) => lower.includes(kw))) return "schedule";
  if (QUOTE_KEYWORDS.some((kw) => lower.includes(kw))) return "quote";
  if (SUPPORT_KEYWORDS.some((kw) => lower.includes(kw))) return "support";
  return "unknown";
}

function estimatePrice(budget: string, volume: string): { price: string; plan: string } {
  const budgetLower = budget.toLowerCase();
  const volumeLower = volume.toLowerCase();

  const isLarge =
    volumeLower.includes("000") ||
    volumeLower.includes("mil") ||
    volumeLower.includes("millon") ||
    volumeLower.includes("millón");

  const isHighBudget =
    budgetLower.includes("000") ||
    budgetLower.includes("millón") ||
    budgetLower.includes("millon") ||
    parseInt(budget.replace(/\D/g, "")) > 3000000;

  if (isHighBudget || isLarge) {
    return {
      price: "COP $4.800.000 – $9.000.000",
      plan: "Plan Corporativo Multi-Canal",
    };
  }
  return {
    price: "COP $1.200.000 – $2.800.000",
    plan: "Plan Empresarial Estándar",
  };
}

function buildResponse(
  text: string,
  state: ConversationState,
  ctx: QuoteContext
): {
  reply: string;
  nextState: ConversationState;
  card?: QuoteCard;
} {
  // ── Active quote flow ──────────────────────────────────────────────────────
  if (state === "quote_q1") {
    return {
      reply:
        "Perfecto, tomé nota del volumen de mensajes. Ahora dime: **¿qué CRM o sistemas internos usas actualmente?** Por ejemplo: HubSpot, Salesforce, SAP, WhatsApp Business, o ninguno por el momento.",
      nextState: "quote_q2",
    };
  }

  if (state === "quote_q2") {
    return {
      reply:
        "Excelente. Última pregunta para poder darte una estimación precisa: **¿con qué presupuesto mensual aproximado cuentas para esta automatización?** (puedes indicarlo en pesos colombianos o USD, no hay respuesta incorrecta).",
      nextState: "quote_q3",
    };
  }

  if (state === "quote_q3") {
    const { price, plan } = estimatePrice(text, ctx.volume ?? "");
    return {
      reply: "¡Listo! Con base en tus respuestas, generé tu **pre-cotización personalizada**:",
      nextState: "quote_done",
      card: {
        volume: ctx.volume ?? text,
        crm: ctx.crm ?? "No especificado",
        budget: text,
        estimatedPrice: price,
        plan,
      },
    };
  }

  // ── Intent detection ───────────────────────────────────────────────────────
  const intent = detectIntent(text);

  if (intent === "schedule") {
    return {
      reply:
        "¡Excelente decisión! 🎯 He generado un enlace de reserva **prioritario** para ti.\n\nTe he agendado una **Sesión Estratégica** con el Director de NeuroLabs para **mañana a las 3:00 PM (Hora Colombia)**.\n\nRecibirás en los próximos minutos la confirmación con el enlace de **Teams / Zoom** y el orden del día.\n\n¿Hay algo más en lo que pueda ayudarte antes de la reunión?",
      nextState: "schedule_done",
    };
  }

  if (intent === "quote") {
    return {
      reply:
        "¡Con gusto te preparo una cotización a medida! 📊 Necesito hacerte **3 preguntas rápidas** para darte el precio más preciso.\n\n**Pregunta 1 de 3:** ¿Cuál es el volumen aproximado de mensajes o interacciones mensuales que manejaría tu negocio?",
      nextState: "quote_q1",
    };
  }

  if (intent === "support") {
    return {
      reply:
        "¡Bienvenido a **NeuroLabs Tech Solutions SAS**! 🤖\n\nSomos un Centro de Investigación en Inteligencia Artificial especializado en:\n\n• **Agentes de IA Empresariales** — Automatización comercial, soporte y operaciones 24/7\n• **Gestión Documental** — Software para entidades públicas (Ley 594/2000)\n• **E-Commerce** — Plataformas con PSE, Wompi y PayU Colombia\n\nNuestros tiempos de entrega base son de **2 a 4 semanas** y contamos con ingenieros certificados en Colombia.\n\n¿Te gustaría recibir una **cotización** o **agendar una demo** con nuestro equipo?",
      nextState: "idle",
    };
  }

  // fallback
  return {
    reply:
      "Entiendo tu consulta. Para darte la mejor atención, puedo ayudarte con:\n\n• 💬 **Información** sobre nuestros servicios\n• 💰 **Cotización** personalizada de un agente de IA\n• 📅 **Agendar una demo** con nuestro equipo\n\n¿Con cuál de estas opciones puedo ayudarte hoy?",
    nextState: "idle",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const ThinkingIndicator = () => (
  <div className="flex items-end gap-3 mb-4">
    <Avatar className="w-8 h-8 flex-shrink-0 bg-zinc-700 border border-zinc-600">
      <AvatarFallback className="bg-zinc-800 text-zinc-300">
        <Bot className="w-4 h-4" />
      </AvatarFallback>
    </Avatar>
    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
    </div>
  </div>
);

const QuoteCardDisplay = ({ card }: { card: QuoteCard }) => (
  <div className="mt-3 bg-gradient-to-br from-indigo-900/60 to-zinc-900 border border-indigo-500/30 rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <Sparkles className="w-4 h-4 text-indigo-400" />
      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
        Pre-Cotización NeuroLabs
      </span>
    </div>
    <div className="space-y-1.5 text-xs">
      {[
        { label: "Volumen mensual", value: card.volume },
        { label: "Sistemas actuales", value: card.crm },
        { label: "Presupuesto estimado", value: card.budget },
      ].map((row) => (
        <div key={row.label} className="flex justify-between gap-2">
          <span className="text-zinc-400">{row.label}</span>
          <span className="text-zinc-200 text-right max-w-[55%] break-words">{row.value}</span>
        </div>
      ))}
    </div>
    <div className="border-t border-indigo-500/20 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Estimación</p>
          <p className="text-base font-bold text-white">{card.estimatedPrice}</p>
          <p className="text-[10px] text-indigo-300 mt-0.5">{card.plan}</p>
        </div>
        <a
          href="https://wa.me/573001234567?text=Hola%2C%20quiero%20confirmar%20mi%20cotizaci%C3%B3n%20de%20NeuroLabs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Confirmar
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>
);

const ChatBubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === "user";

  // Simple markdown-ish parser: bold (**text**)
  const formatContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      // Render newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split("\n").length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div className={`flex items-end gap-2.5 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0 border border-zinc-600">
          <AvatarFallback className="bg-zinc-800 text-zinc-300">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-sm"
              : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-sm"
          }`}
        >
          {formatContent(msg.content)}
          {msg.card && <QuoteCardDisplay card={msg.card} />}
        </div>
        <span className="text-[10px] text-zinc-600 px-1">
          {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0 border border-zinc-700">
          <AvatarFallback className="bg-indigo-700 text-white text-xs font-bold">TÚ</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content:
    "¡Hola! 👋 Soy el **Asistente de NeuroLabs Tech**.\n\nPuedo ayudarte con:\n• 💬 Información sobre nuestros servicios\n• 💰 Cotización personalizada de agentes de IA\n• 📅 Agendar una demo con nuestro equipo\n\n¿En qué te puedo ayudar hoy?",
  timestamp: new Date(),
};

export const AgentDemoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [convState, setConvState] = useState<ConversationState>("idle");
  const [quoteCtx, setQuoteCtx] = useState<QuoteContext>({});
  const [unread, setUnread] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    // Build updated quote context based on current state
    let updatedCtx = { ...quoteCtx };
    if (convState === "quote_q1") updatedCtx.volume = trimmed;
    if (convState === "quote_q2") updatedCtx.crm = trimmed;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    // Simulate AI reasoning delay (800-1600ms)
    const delay = 800 + Math.random() * 800;
    setTimeout(() => {
      const { reply, nextState, card } = buildResponse(trimmed, convState, updatedCtx);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
        card,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setConvState(nextState);
      setQuoteCtx(updatedCtx);
      setIsThinking(false);

      if (!isOpen) setUnread((n) => n + 1);
    }, delay);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
  };

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────────────── */}
      {!isOpen && (
        <button
          id="agent-demo-widget-trigger"
          onClick={handleOpen}
          aria-label="Abrir asistente de NeuroLabs"
          className="fixed bottom-6 right-6 z-[9999] group flex items-center gap-3 px-5 py-3.5 bg-black text-white rounded-full shadow-2xl shadow-black/30 hover:shadow-black/50 transition-all duration-300 hover:scale-105 border border-white/10"
        >
          {/* Animated glow ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-75 pointer-events-none" />

          <div className="relative flex items-center justify-center w-8 h-8">
            <Bot className="w-5 h-5 text-indigo-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-black" />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs font-bold leading-none">Habla con nuestra IA</span>
            <span className="text-[10px] text-zinc-400 leading-none mt-0.5">Responde al instante</span>
          </div>

          {unread > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Window ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex flex-col w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-300 ${
            isMinimized ? "h-auto" : "h-[580px] max-h-[80vh]"
          }`}
        >
          <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-zinc-900" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Asistente NeuroLabs</p>
                  <p className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    En línea · Respuesta inmediata
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-7 h-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                  aria-label={isMinimized ? "Expandir" : "Minimizar"}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                  aria-label="Cerrar chat"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            {!isMinimized && (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-0 scroll-smooth"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#3f3f46 transparent" }}
                >
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} />
                  ))}
                  {isThinking && <ThinkingIndicator />}
                </div>

                {/* Quick action chips */}
                {messages.length <= 1 && !isThinking && (
                  <div className="flex-shrink-0 px-4 pb-3 flex flex-wrap gap-2">
                    {[
                      "¿Qué servicios ofrecen?",
                      "Quiero una cotización",
                      "Agendar una demo",
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => {
                          setInput(chip);
                          setTimeout(() => handleSend(), 0);
                        }}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-medium rounded-full transition-all"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input area */}
                <div className="flex-shrink-0 p-4 pt-2 border-t border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-indigo-500/50 transition-colors">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        isThinking
                          ? "El agente está pensando..."
                          : "Escribe tu mensaje..."
                      }
                      disabled={isThinking}
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none disabled:opacity-50 min-w-0"
                      aria-label="Mensaje al asistente"
                      id="agent-widget-input"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!input.trim() || isThinking}
                      className="w-8 h-8 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                      aria-label="Enviar mensaje"
                      id="agent-widget-send"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-zinc-600 text-center mt-2">
                    Demo interactiva · NeuroLabs Tech Solutions SAS
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
