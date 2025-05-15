import { runProductionMigration } from './dist/production-migration.js';

async function main() {
  const success = await runProductionMigration();
  if (!success) {
    console.error('❌ Falha ao executar migrações de produção');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
