import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Send, Paperclip, X, BrainCircuit, Activity, Database, FileBox, Settings, ShieldCheck, ChevronRight, Lock, Plus, Globe, Blocks, Workflow, Image as ImageIcon, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AttachedFile {
  name: string;
  type: string; // Mime type
  data: string; // Base64 data (without data:image/png;base64, prefix for Gemini API)
  url: string;  // Local blob url for thumbnail preview
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  attachments?: AttachedFile[];
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const PersonalAgent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "init",
    role: "model",
    content: "Sistema centralizado inicializado. Conexión segura establecida con el pool de modelos Gemini. ¿En qué te puedo ayudar, Administrador?",
    timestamp: new Date()
  }]);
  
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [model, setModel] = useState("gemini-3.1-pro-preview");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // File Handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: base64String,
          url: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Chat Submission
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    const currentAttachments = [...attachments];
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      attachments: currentAttachments,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setIsProcessing(true);

    try {
      // Build History for Gemini API (Convert from our state to Gemini format)
      // Note: We skip the immediate last message since we are sending it as the current 'message'
      const history = messages.slice(1).map(msg => {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        // NOTE: We don't send history attachments back to save tokens, only text history
        return {
          role: msg.role,
          parts
        };
      });

      // Prepare attachments payload for the API
      const inlineAttachments = currentAttachments.map(att => ({
        inlineData: {
          data: att.data,
          mimeType: att.type
        }
      }));

      // Call secure backend
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          attachments: inlineAttachments,
          model
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error de red en el endpoint");

      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: "model",
        content: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        content: `**[ERROR DEL SISTEMA]**\n${error.message}\nVerifica los logs del backend o la validez del POOL_DE_LLAVES.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple Markdown Parser
  const renderMessageContent = (content: string) => {
    let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br />');
    return html;
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 bg-white border border-zinc-700 rounded-xl overflow-hidden shadow-lg shadow-indigo-900/20">
            <img src="/logo.png" alt="NeuroLabs Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-tight">NeuroLabs Tech</h1>
            <p className="text-[10px] text-zinc-400">Admin Core AI</p>
          </div>
        </div>
        
        <div className="flex-1 p-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-2 h-auto text-xs font-medium">
            <BrainCircuit className="w-4 h-4 mr-3 text-indigo-400" /> Super Agente IA
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 px-3 py-2 h-auto text-xs font-medium">
            <Database className="w-4 h-4 mr-3" /> Base Vectorial
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 px-3 py-2 h-auto text-xs font-medium">
            <Activity className="w-4 h-4 mr-3" /> Telemetría
          </Button>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Modelo Activo</p>
          <select 
            value={model} 
            onChange={e => setModel(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-xs px-2 py-1.5 outline-none focus:border-indigo-500 text-zinc-300"
          >
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col relative bg-zinc-950">
        
        {/* Topbar */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-zinc-300">Conexión Privada Encriptada</span>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </header>

        {/* Scrollable Messages */}
        <ScrollArea className="flex-1 px-4 lg:px-8 py-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className={`w-8 h-8 flex-shrink-0 border ${msg.role === "user" ? "border-indigo-500/50" : "border-zinc-700"}`}>
                  <AvatarFallback className={msg.role === "user" ? "bg-indigo-600 text-white text-xs" : "bg-zinc-800 text-indigo-400"}>
                    {msg.role === "user" ? "ADM" : <BrainCircuit className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  
                  {/* Attachments UI */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-700 group">
                          {att.type.startsWith("image/") ? (
                            <img src={att.url} alt="attached" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-800 flex flex-col items-center justify-center p-2">
                              <FileBox className="w-6 h-6 text-zinc-400 mb-1" />
                              <span className="text-[9px] text-zinc-500 text-center break-all line-clamp-2">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Bubble */}
                  {msg.content && (
                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-sm" 
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm"
                    }`}>
                      <div dangerouslySetInnerHTML={{ __html: renderMessageContent(msg.content) }} />
                    </div>
                  )}
                  <span className="text-[10px] text-zinc-600 px-1">
                    {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 flex-shrink-0 border border-zinc-700">
                  <AvatarFallback className="bg-zinc-800 text-indigo-400">
                    <BrainCircuit className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-400">Procesando razonamiento avanzado</span>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto">
            
            {/* Thumbnail Preview Area */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 px-2 overflow-x-auto">
                {attachments.map((file, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-700 flex-shrink-0 group">
                    {file.type.startsWith("image/") ? (
                      <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <FileBox className="w-5 h-5 text-zinc-400" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeAttachment(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all flex items-end p-2 gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              {/* Advanced Claude-like Plus Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-2xl pb-2">
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-4 h-4 mr-2 text-zinc-400" /> Subir archivos o fotos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                    <ImageIcon className="w-4 h-4 mr-2 text-zinc-400" /> Tomar captura de pantalla
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  
                  <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500 tracking-wider">Herramientas</DropdownMenuLabel>
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                    <Blocks className="w-4 h-4 mr-2 text-indigo-400" /> Habilidades (Skills)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                    <Workflow className="w-4 h-4 mr-2 text-emerald-400" /> Añadir Conector
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  
                  <DropdownMenuItem 
                    className="py-2 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white justify-between"
                    onClick={(e) => {
                      e.preventDefault();
                      setWebSearchEnabled(!webSearchEnabled);
                    }}
                  >
                    <div className="flex items-center">
                      <Globe className={`w-4 h-4 mr-2 ${webSearchEnabled ? 'text-blue-400' : 'text-zinc-400'}`} />
                      Búsqueda Web
                    </div>
                    {webSearchEnabled && <Check className="w-4 h-4 text-blue-400" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <textarea  
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ingresa comandos avanzados para el agente multimodal..."
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none py-2.5 max-h-32 min-h-[44px]"
                rows={1}
                style={{ scrollbarWidth: "none" }}
              />

              <Button 
                size="icon"
                onClick={handleSend}
                disabled={isProcessing || (!input.trim() && attachments.length === 0)}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shrink-0 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-zinc-600 mt-3 flex items-center justify-center gap-1">
              NeuroLabs Internal Core <ChevronRight className="w-3 h-3" /> Vercel Serverless + Google AI Studio
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PersonalAgent;
