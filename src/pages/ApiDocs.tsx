import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";
import { Terminal, Shield, Code, Server } from "lucide-react";

const ApiDocs = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white selection:bg-[#111827] selection:text-white font-sans text-black">
      <Navbar />
      
      <main className="pt-24 pb-24">
        
        {/* Header Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16 border-b border-gray-100 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">
              {t('docs.title')}
            </h1>
            <p className="text-lg text-gray-500 font-light">
              {t('docs.subtitle')}
            </p>
          </div>
        </section>

        {/* Docs Layout */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="sticky top-32 flex flex-col gap-2">
              <a href="#intro" className="px-4 py-2 text-sm font-semibold text-black bg-gray-50 rounded-md">
                {t('docs.menu_intro')}
              </a>
              <a href="#auth" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md transition-colors">
                {t('docs.menu_auth')}
              </a>
              <a href="#endpoints" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md transition-colors">
                {t('docs.menu_endpoints')}
              </a>
              <a href="#sdks" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md transition-colors">
                {t('docs.menu_sdks')}
              </a>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-gray max-w-none">
              <h2 id="intro" className="text-3xl font-bold tracking-tight mb-6">
                {t('docs.content_title')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('docs.content_p1')}
              </p>
              <p className="text-gray-600 leading-relaxed mb-12">
                {t('docs.content_p2')}
              </p>

              {/* Code Example Block */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-16">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    Authentication
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Authenticate your API requests by including your secret API key in the request header. You can manage your API keys in the Developer Dashboard.
                  </p>
                </div>
                
                {/* Code Snippet */}
                <div className="bg-[#0d1117] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                  <div className="h-10 border-b border-gray-800 bg-[#161b22] flex items-center px-4">
                    <span className="text-xs font-mono text-gray-400">cURL</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <span className="text-blue-400">curl</span> https://api.neurolabs.com.co/v1/inference \<br/>
                      <span className="text-gray-500">  -H</span> <span className="text-green-400">"Authorization: Bearer abia_live_sk_..."</span> \<br/>
                      <span className="text-gray-500">  -d</span> <span className="text-green-400">"model=risk-v4"</span>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Endpoints Block */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-16 border-t border-gray-100 pt-16">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-gray-400" />
                    Create Inference Task
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Send a payload to our secure inference nodes to receive an immediate analytical response encoded in JSON.
                  </p>
                </div>
                
                <div className="bg-[#0d1117] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                  <div className="h-10 border-b border-gray-800 bg-[#161b22] flex items-center px-4">
                    <span className="text-xs font-mono text-gray-400">Response (JSON)</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
{`{
  "id": "inf_99x2m4",
  "object": "inference",
  "created": 1715061600,
  "model": "abia-risk-v4",
  "status": "success",
  "data": {
    "risk_score": 0.12,
    "classification": "SAFE"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs;
