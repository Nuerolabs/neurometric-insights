import { useState, useEffect } from "react";
import { Terminal, Play, Loader2, Code2, ShieldAlert, FileJson } from "lucide-react";
import { useTranslation } from "react-i18next";

const SIMULATIONS = [
  {
    id: "finance",
    icon: ShieldAlert,
    key: "playground.sim_finance",
    payload: {
      client_id: "corp_8842",
      dataset: "q3_market_volatility.csv",
      model: "abia-risk-v4"
    },
    response: {
      status: "success",
      latency_ms: 142,
      risk_score: 0.84,
      classification: "CRITICAL_EXPOSURE",
      confidence: 0.98,
      recommended_action: "hedge_portfolio",
      affected_assets: ["TECH", "REAL_ESTATE"]
    }
  },
  {
    id: "edu",
    icon: Code2,
    key: "playground.sim_edu",
    payload: {
      institution_id: "edu_univ_09",
      dataset: "student_engagement_metrics.json",
      model: "abia-edu-predict-v2"
    },
    response: {
      status: "success",
      latency_ms: 89,
      dropout_probability: 0.72,
      risk_factors: ["low_attendance", "declining_grades"],
      intervention_required: true,
      confidence: 0.94
    }
  },
  {
    id: "data",
    icon: FileJson,
    key: "playground.sim_data",
    payload: {
      source: "unstructured_email_dump",
      extraction_target: "invoice_entities",
      model: "abia-parse-v5"
    },
    response: {
      status: "success",
      latency_ms: 210,
      entities_extracted: 450,
      accuracy: 0.99,
      anomalies_detected: 3,
      data_structure: "normalized_json"
    }
  }
];

export const Playground = () => {
  const { t } = useTranslation();
  const [activeSim, setActiveSim] = useState(SIMULATIONS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  const executeSimulation = () => {
    setIsExecuting(true);
    setStatus("processing");
    setOutput("");

    // Simulate network delay
    setTimeout(() => {
      const jsonString = JSON.stringify(activeSim.response, null, 2);
      let currentIndex = 0;
      
      // Typewriter effect for JSON
      const typingInterval = setInterval(() => {
        if (currentIndex <= jsonString.length) {
          setOutput(jsonString.slice(0, currentIndex));
          currentIndex += 5; // Type 5 chars at a time for speed
        } else {
          clearInterval(typingInterval);
          setStatus("success");
          setIsExecuting(false);
        }
      }, 20);
    }, 800);
  };

  useEffect(() => {
    // Reset when changing tabs
    setOutput("");
    setStatus("idle");
    setIsExecuting(false);
  }, [activeSim]);

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="playground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
              {t('playground.badge')}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#111827] mb-6 tracking-tight">
            {t('playground.title')}
          </h2>
          <p className="text-lg text-gray-500 font-light">
            {t('playground.subtitle')}
          </p>
        </div>

        {/* Terminal UI */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {SIMULATIONS.map((sim) => {
              const Icon = sim.icon;
              const isActive = activeSim.id === sim.id;
              return (
                <button
                  key={sim.id}
                  onClick={() => !isExecuting && setActiveSim(sim)}
                  disabled={isExecuting}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 ${
                    isActive 
                      ? "bg-[#111827] border-[#111827] text-white shadow-xl shadow-black/10" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  } ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-white/10" : "bg-gray-100"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{t(sim.key)}</h3>
                    <p className={`text-xs mt-1 ${isActive ? "text-gray-400" : "text-gray-400"}`}>
                      Model: {sim.payload.model}
                    </p>
                  </div>
                </button>
              );
            })}

            <button
              onClick={executeSimulation}
              disabled={isExecuting}
              className="mt-4 group relative flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold rounded-xl overflow-hidden transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {t('playground.run_btn')}
            </button>
          </div>

          {/* Code Window */}
          <div className="lg:col-span-8 relative rounded-2xl bg-[#0d1117] border border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[450px]">
            {/* Top Bar */}
            <div className="h-12 border-b border-gray-800 bg-[#161b22] flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <Terminal className="w-3 h-3" />
                abia-inference-node-01
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-6 font-mono text-sm overflow-y-auto">
              {/* Payload View */}
              <div className="mb-6 opacity-50">
                <span className="text-blue-400">POST</span> <span className="text-green-400">/api/v1/inference</span>
                <pre className="mt-2 text-gray-400">
                  {JSON.stringify(activeSim.payload, null, 2)}
                </pre>
              </div>

              {/* Status Output */}
              {status !== "idle" && (
                <div className="border-t border-gray-800 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-400">➜</span>
                    <span className="text-gray-400 text-xs uppercase tracking-widest">
                      {status === "processing" ? t('playground.status_processing') : t('playground.status_success')}
                    </span>
                  </div>
                  
                  <pre className="text-gray-300">
                    <code className="text-green-400">{output}</code>
                    {status === "processing" && (
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1 align-middle" />
                    )}
                  </pre>
                </div>
              )}
              
              {status === "idle" && (
                <div className="border-t border-gray-800 pt-6 flex items-center gap-2">
                  <span className="text-yellow-400">➜</span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest">{t('playground.status_idle')}</span>
                  <span className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-1 align-middle" />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
