import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { downloadAll } from './download-roms.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROMS_DIR = process.env.ROMS_DIR || '/app/roms';
const DATA_DIR = process.env.DATA_DIR || '/app/data';

const app = Fastify({ logger: true });

await app.register(fastifyCors, { origin: true });

await app.register(fastifyStatic, {
  root: path.join(DATA_DIR, 'wasm'),
  prefix: '/wasm/',
  decorateReply: false,
});

app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

app.get('/api/systems', async () => {
  if (!fs.existsSync(ROMS_DIR)) return [];
  const entries = fs.readdirSync(ROMS_DIR, { withFileTypes: true });
  const systems = entries
    .filter(e => e.isDirectory())
    .map(e => ({
      id: e.name,
      name: getSystemName(e.name),
      icon: getSystemIcon(e.name),
      romCount: fs.readdirSync(path.join(ROMS_DIR, e.name)).filter(f => !f.startsWith('.')).length,
    }));
  return systems;
});

app.get('/api/roms/:system', async (req) => {
  const systemDir = path.join(ROMS_DIR, req.params.system);
  if (!fs.existsSync(systemDir)) return [];
  const files = fs.readdirSync(systemDir);
  const roms = files
    .filter(f => !f.startsWith('.'))
    .map(f => {
      const stats = fs.statSync(path.join(systemDir, f));
      return {
        name: f,
        size: stats.size,
        system: req.params.system,
        downloadUrl: `/api/roms/${req.params.system}/${f}`,
      };
    });
  return roms;
});

app.get('/api/roms/:system/:rom', async (req, reply) => {
  const romPath = path.join(ROMS_DIR, req.params.system, req.params.rom);
  if (!fs.existsSync(romPath)) {
    return reply.status(404).send({ error: 'ROM não encontrada' });
  }
  return reply.sendFile(req.params.rom, path.join(ROMS_DIR, req.params.system));
});

function getSystemName(id) {
  const map = {
    nes: 'Nintendo Entertainment System',
    snes: 'Super Nintendo',
    gba: 'Game Boy Advance',
    gb: 'Game Boy',
    genesis: 'Sega Genesis',
    n64: 'Nintendo 64',
    psx: 'PlayStation',
  };
  return map[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

function getSystemIcon(id) {
  const map = {
    nes: '🎮',
    snes: '🕹️',
    gba: '📟',
    gb: '📱',
    genesis: '🔵',
    n64: '⭐',
    psx: '💿',
  };
  return map[id] || '🕹️';
}

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
    downloadAll().catch(err => console.error('[server] Erro no download:', err.message));
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
