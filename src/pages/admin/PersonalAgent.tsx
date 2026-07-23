import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Send, Paperclip, X, BrainCircuit, Activity, Database, FileBox, Settings, ChevronRight, Lock, Plus, Globe, Blocks, Workflow, Image as ImageIcon, Check } from "lucide-react";
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

interface AttachedFile {
  name: string;
  type: string;
  data: string;
  url: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  attachments?: AttachedFile[];
  timestamp: Date;
}

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

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
      const history = messages.slice(1).map(msg => {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        return {
          role: msg.role,
          parts
        };
      });

      const inlineAttachments = currentAttachments.map(att => ({
        inlineData: {
          data: att.data,
          mimeType: att.type
        }
      }));

      // Hacemos el fetch enviando el flag webSearchEnabled al backend seguro
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          attachments: inlineAttachments,
          model,
          webSearchEnabled
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

  const renderMessageContent = (content: string) => {
    let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br />');
    return html;
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <img src="/logo.png" alt="NeuroLabs Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-tight text-gray-900">NeuroLabs Tech</h1>
            <p className="text-[10px] text-gray-500 font-medium">Admin Core AI</p>
          </div>
        </div>
        
        <div className="flex-1 p-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-black hover:bg-gray-100 px-3 py-2 h-auto text-xs font-medium bg-gray-50">
            <BrainCircuit className="w-4 h-4 mr-3 text-indigo-600" /> Super Agente IA
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 h-auto text-xs font-medium">
            <Database className="w-4 h-4 mr-3" /> Base Vectorial
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 h-auto text-xs font-medium">
            <Activity className="w-4 h-4 mr-3" /> Telemetría
          </Button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Modelo Activo</p>
          <select 
            value={model} 
            onChange={e => setModel(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-md text-xs px-2 py-1.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-700"
          >
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col relative bg-gray-50">
        
        {/* Topbar */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-gray-600">Conexión Privada Encriptada</span>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100">
            <Settings className="w-4 h-4" />
          </Button>
        </header>

        {/* Scrollable Messages */}
        <ScrollArea className="flex-1 px-4 lg:px-8 py-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className={`w-8 h-8 flex-shrink-0 border ${msg.role === "user" ? "border-indigo-100" : "border-gray-200 shadow-sm"}`}>
                  <AvatarFallback className={msg.role === "user" ? "bg-indigo-600 text-white text-xs" : "bg-white text-indigo-600"}>
                    {msg.role === "user" ? "ADM" : <BrainCircuit className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  
                  {/* Attachments UI */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group bg-white">
                          {att.type.startsWith("image/") ? (
                            <img src={att.url} alt="attached" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                              <FileBox className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-[9px] text-gray-500 text-center break-all line-clamp-2 font-medium">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Bubble */}
                  {msg.content && (
                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-sm" 
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
                    }`}>
                      <div dangerouslySetInnerHTML={{ __html: renderMessageContent(msg.content) }} />
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 px-1 font-medium">
                    {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 flex-shrink-0 border border-gray-200 shadow-sm">
                  <AvatarFallback className="bg-white text-indigo-600">
                    <BrainCircuit className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500">Procesando razonamiento avanzado</span>
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
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            
            {/* Thumbnail Preview Area */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 px-2 overflow-x-auto">
                {attachments.map((file, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-50 shadow-sm flex-shrink-0 group">
                    {file.type.startsWith("image/") ? (
                      <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileBox className="w-5 h-5 text-gray-400" />
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

            <div className="relative bg-white border border-gray-300 rounded-2xl shadow-sm hover:border-gray-400 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex items-end p-2 gap-2">
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
                    className="w-10 h-10 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white border-gray-200 text-gray-800 shadow-xl pb-2">
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-4 h-4 mr-2 text-gray-500" /> Subir archivos o fotos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900">
                    <ImageIcon className="w-4 h-4 mr-2 text-gray-500" /> Tomar captura de pantalla
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-gray-100" />
                  
                  <DropdownMenuLabel className="text-[10px] uppercase text-gray-500 tracking-wider font-bold">Herramientas</DropdownMenuLabel>
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900">
                    <Blocks className="w-4 h-4 mr-2 text-indigo-500" /> Habilidades (Skills)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900">
                    <Workflow className="w-4 h-4 mr-2 text-emerald-500" /> Añadir Conector
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-gray-100" />
                  
                  <DropdownMenuItem 
                    className="py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900 justify-between"
                    onClick={(e) => {
                      e.preventDefault();
                      setWebSearchEnabled(!webSearchEnabled);
                    }}
                  >
                    <div className="flex items-center font-medium">
                      <Globe className={`w-4 h-4 mr-2 ${webSearchEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                      Búsqueda Web
                    </div>
                    {webSearchEnabled && <Check className="w-4 h-4 text-blue-500" />}
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
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none resize-none py-2.5 max-h-32 min-h-[44px]"
                rows={1}
                style={{ scrollbarWidth: "none" }}
              />

              <Button 
                size="icon"
                onClick={handleSend}
                disabled={isProcessing || (!input.trim() && attachments.length === 0)}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shrink-0 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-medium mt-3 flex items-center justify-center gap-1">
              NeuroLabs Internal Core <ChevronRight className="w-3 h-3" /> Vercel Serverless + Google AI Studio
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PersonalAgent;
