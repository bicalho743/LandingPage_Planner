/**
 * Stripe Webhook Script
 * Este arquivo contém um script que pode ser executado para iniciar o CLI do Stripe
 * e encaminhar eventos do webhook para o servidor local.
 * 
 * Como usar:
 * 1. Execute `npm run stripe:webhook` para iniciar o encaminhamento de webhook
 * 2. O script detectará automaticamente a porta em que o servidor está rodando
 * 
 * OBS: Este script requer que o Stripe CLI esteja instalado no ambiente.
 */

import { spawn } from 'child_process';
import path from 'path';

// Executar o script bash
const scriptPath = path.resolve(process.cwd(), 'start-stripe.sh');
console.log(`Executando script: ${scriptPath}`);

const stripeCLI = spawn('bash', [scriptPath], {
  stdio: 'inherit', // Redireciona stdin/stdout/stderr para o processo pai
});

stripeCLI.on('error', (err) => {
  console.error('Erro ao iniciar o Stripe CLI:', err);
  process.exit(1);
});

stripeCLI.on('close', (code) => {
  console.log(`Stripe CLI encerrado com código: ${code}`);
  process.exit(code || 0);
});

// Lidar com sinais para encerramento limpo
process.on('SIGINT', () => {
  console.log('Encerrando Stripe CLI...');
  stripeCLI.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Encerrando Stripe CLI...');
  stripeCLI.kill('SIGTERM');
});