// Script para executar o Stripe Webhook em um ambiente Node.js
// Este script executa o arquivo start-stripe.sh para iniciar o Stripe CLI

const { spawn } = require('child_process');
const path = require('path');

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