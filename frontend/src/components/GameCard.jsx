function GameCard({ rom, onPlay }) {
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const nameWithoutExt = rom.name.replace(/\.[^.]+$/, '');
  const displayName = nameWithoutExt.length > 28
    ? nameWithoutExt.slice(0, 25) + '...'
    : nameWithoutExt;

  return (
    <div
      onClick={onPlay}
      className="group relative bg-slate-900/70 border border-slate-800/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-neon-purple hover:border-purple-600/50"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="text-5xl group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all duration-300">
          🎮
        </span>
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-mono bg-black/60 text-purple-400 px-2 py-0.5 rounded-full border border-purple-800/30">
            {rom.system?.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors truncate">
          {displayName}
        </h3>
        <p className="text-[11px] text-slate-600 mt-1 font-mono">{formatSize(rom.size)}</p>
      </div>
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-purple-500/0 group-hover:ring-purple-500/30 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

export default GameCard;
