
import React, { useState } from 'react';
import { Image, MessageSquare, Mic } from 'lucide-react';
import { ImageGenerator } from './components/ImageGenerator';
import { Chatbot } from './components/Chatbot';
import { VoiceGenerator } from './components/VoiceGenerator';

type Tab = 'generator' | 'chatbot' | 'voice';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generator':
        return <ImageGenerator />;
      case 'voice':
        return <VoiceGenerator />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; icon: React.ReactNode; label: string }> = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`relative flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
        activeTab === tabName
          ? 'text-white'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {activeTab === tabName && (
        <span className="absolute inset-0 z-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans flex flex-col relative">
        <div className="fixed inset-0 -z-20 h-full w-full premium-background"></div>
        <div className="fixed inset-0 -z-10 h-full w-full background-grid-glow"></div>
        
        <header className="flex-shrink-0 pt-6 pb-4 z-10 sticky top-0 bg-[#0c0a09]/80 backdrop-blur-md border-b border-white/5">
           <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-50 to-gray-300 drop-shadow-lg">
                AI Character Factory
              </h1>
              <nav className="flex justify-center">
                <div className="flex items-center gap-2 p-1.5 glass-card rounded-full">
                  <TabButton tabName="generator" icon={<Image size={16} />} label="Image Generator" />
                  <TabButton tabName="voice" icon={<Mic size={16} />} label="Voice Generator" />
                  <TabButton tabName="chatbot" icon={<MessageSquare size={16} />} label="Chatbot" />
                </div>
              </nav>
           </div>
        </header>

        <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderTabContent()}
        </main>
    </div>
  );
};

export default App;
