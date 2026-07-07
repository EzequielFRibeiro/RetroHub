import { useState, useEffect } from 'react';
import GameCard from './components/GameCard';

const COLORS = {
  purple: 'border-purple-500 shadow-neon-purple',
  blue: 'border-blue-500 shadow-neon-blue',
  cyan: 'border-cyan-500 shadow-neon-cyan',
};

const SYSTEMS = [
  { id: 'nes', name: 'NES', icon: '🎮', color: 'purple' },
  { id: 'snes', name: 'Super Nintendo', icon: '🕹️', color: 'blue' },
  { id: 'gba', name: 'Game Boy Advance', icon: '📟', color: 'cyan' },
  { id: 'gb', name: 'Game Boy', icon: '📱', color: 'purple' },
  { id: 'genesis', name: 'Sega Genesis', icon: '🔵', color: 'blue' },
  { id: 'n64', name: 'Nintendo 64', icon: '⭐', color: 'cyan' },
  { id: 'psx', name: 'PlayStation', icon: '💿', color: 'purple' },
];

function App() {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [roms, setRoms] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSystem) {
      setLoading(true);
      fetch(`/api/roms/${selectedSystem}`)
        .then(r => r.json())
        .then(data => { setRoms(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setRoms([]);
    }
  }, [selectedSystem]);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-purple-900/30 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold animate-glow bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            RetroHub
          </h1>
          <span className="text-sm text-slate-500">Jogos Clássicos</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-300 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Selecionar Console
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {SYSTEMS.map(system => (
              <button
                key={system.id}
                onClick={() => setSelectedSystem(system.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                  selectedSystem === system.id
                    ? `${COLORS[system.color]} bg-slate-800/80`
                    : 'border-slate-800 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-3xl">{system.icon}</span>
                <span className="text-sm font-medium text-slate-300">{system.name}</span>
              </button>
            ))}
          </div>
        </section>

        {selectedSystem && (
          <section>
            <h2 className="text-xl font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Jogos de {SYSTEMS.find(s => s.id === selectedSystem)?.name}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : roms.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                <span className="text-5xl block mb-4">📂</span>
                <p className="text-lg">Nenhuma ROM encontrada para este sistema.</p>
                <p className="text-sm mt-2">As ROMs serão baixadas automaticamente na inicialização do servidor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {roms.map(rom => (
                  <GameCard
                    key={rom.name}
                    rom={rom}
                    onPlay={() => setPlaying(rom)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-full max-w-5xl mx-4 bg-slate-900 rounded-2xl border border-purple-800/40 shadow-neon-purple overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-purple-300 truncate">
                {playing.name.replace(/\.[^.]+$/, '')}
              </h3>
              <button
                onClick={() => setPlaying(null)}
                className="text-slate-500 hover:text-white transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center text-slate-600">
                <span className="text-6xl block mb-4">🎮</span>
                <p className="text-lg">Emulador WebAssembly</p>
                <p className="text-sm mt-2">{playing.downloadUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
