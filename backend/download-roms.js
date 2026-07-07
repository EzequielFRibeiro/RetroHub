import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { pipeline } from 'stream/promises';

const ROMS_DIR = process.env.ROMS_DIR || '/app/roms';
const DATA_DIR = process.env.DATA_DIR || '/app/data';

const ROM_SOURCES = [
  {
    system: 'nes',
    label: 'Nintendo Entertainment System',
    roms: [
      { name: 'supremacy.nes', url: 'https://archive.org/download/nointro.nes/10-Yard%20Fight%20%28USA%29.nes' },
    ],
  },
  {
    system: 'gba',
    label: 'Game Boy Advance',
    roms: [
      { name: 'supremacy.gba', url: 'https://archive.org/download/nointro.gba/Advance%20Wars%20%28USA%29.gba' },
    ],
  },
];

const EMULATOR_WASM = [
  {
    name: 'nes_emu.wasm',
    url: 'https://cdn.jsdelivr.net/npm/emulatorjs@latest/data/nes_emu.wasm',
  },
  {
    name: 'gba_emu.wasm',
    url: 'https://cdn.jsdelivr.net/npm/emulatorjs@latest/data/gba_emu.wasm',
  },
  {
    name: 'emulator.js',
    url: 'https://cdn.jsdelivr.net/npm/emulatorjs@latest/data/emulator.js',
  },
  {
    name: 'emulator.min.js',
    url: 'https://cdn.jsdelivr.net/npm/emulatorjs@latest/emulator.min.js',
  },
];

async function downloadFile(url, dest) {
  const writer = fs.createWriteStream(dest);
  const response = await axios({ method: 'get', url, responseType: 'stream', timeout: 30000 });
  await pipeline(response.data, writer);
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadRoms() {
  console.log('[download-roms] Iniciando verificação de ROMs...');

  for (const source of ROM_SOURCES) {
    const systemDir = path.join(ROMS_DIR, source.system);
    await ensureDir(systemDir);
    const existing = fs.readdirSync(systemDir);
    if (existing.length > 0) {
      console.log(`[download-roms] ROMs de ${source.label} já existem. Pulando.`);
      continue;
    }
    console.log(`[download-roms] Baixando ROMs de ${source.label}...`);
    for (const rom of source.roms) {
      const dest = path.join(systemDir, rom.name);
      try {
        await downloadFile(rom.url, dest);
        console.log(`[download-roms]   OK: ${rom.name}`);
      } catch (err) {
        console.error(`[download-roms]   FALHA: ${rom.name} - ${err.message}`);
      }
    }
  }
}

async function downloadWasmFiles() {
  const wasmDir = path.join(DATA_DIR, 'wasm');
  await ensureDir(wasmDir);

  const metadataPath = path.join(wasmDir, '.downloaded');
  if (fs.existsSync(metadataPath)) {
    console.log('[download-roms] WASM já baixados. Pulando.');
    return;
  }

  console.log('[download-roms] Baixando arquivos WebAssembly do emulador...');
  for (const file of EMULATOR_WASM) {
    const dest = path.join(wasmDir, file.name);
    try {
      await downloadFile(file.url, dest);
      console.log(`[download-roms]   OK: ${file.name}`);
    } catch (err) {
      console.error(`[download-roms]   FALHA: ${file.name} - ${err.message}`);
    }
  }
  fs.writeFileSync(metadataPath, new Date().toISOString());
}

export async function downloadAll() {
  try {
    await downloadRoms();
    await downloadWasmFiles();
    console.log('[download-roms] Processo concluído!');
  } catch (err) {
    console.error('[download-roms] Erro geral:', err.message);
  }
}
