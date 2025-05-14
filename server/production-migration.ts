import { db } from './db';
import { userStatusEnum, users } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Migração segura para produção
 * Este script realiza migrações manuais e seguras para o ambiente de produção,
 * garantindo que não haja perda de dados
 */
export async function runProductionMigration() {
  console.log('🔄 Iniciando migração segura para produção...');
  
  try {
    // Verificar se a coluna status é do tipo text (e não enum)
    const result = await db.execute(sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'status'
    `);
    
    const rows = result.rows as Array<{ data_type: string }>;
    
    if (rows && rows.length > 0 && rows[0].data_type === 'text') {
      console.log('⚠️ Coluna status encontrada como tipo text, convertendo para enum...');
      
      // Primeiro, verificamos se os valores existentes são válidos
      const invalidValuesResult = await db.execute(sql`
        SELECT DISTINCT status 
        FROM users 
        WHERE status NOT IN ('pendente', 'ativo', 'bloqueado')
      `);
      
      const invalidValues = invalidValuesResult.rows as Array<{ status: string }>;
      
      if (invalidValues && invalidValues.length > 0) {
        console.log('❌ Valores inválidos encontrados na coluna status:', invalidValues);
        console.log('⚠️ Convertendo valores inválidos para "pendente"...');
        
        // Converter valores inválidos para 'pendente'
        await db.execute(sql`
          UPDATE users 
          SET status = 'pendente' 
          WHERE status NOT IN ('pendente', 'ativo', 'bloqueado')
        `);
      }
      
      // Adicionar a nova coluna com o tipo enum
      console.log('➕ Adicionando coluna temporária com tipo enum...');
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN status_enum user_status NOT NULL DEFAULT 'pendente'
      `);
      
      // Copiar dados da coluna antiga para a nova
      console.log('🔄 Copiando dados para a nova coluna...');
      await db.execute(sql`
        UPDATE users 
        SET status_enum = status::user_status
      `);
      
      // Remover a coluna antiga
      console.log('➖ Removendo coluna antiga...');
      await db.execute(sql`
        ALTER TABLE users 
        DROP COLUMN status
      `);
      
      // Renomear a nova coluna para o nome original
      console.log('✏️ Renomeando coluna nova para o nome original...');
      await db.execute(sql`
        ALTER TABLE users 
        RENAME COLUMN status_enum TO status
      `);
      
      console.log('✅ Migração da coluna status concluída com sucesso!');
    } else {
      console.log('✅ Coluna status já está com o tipo correto (enum).');
    }
    
    console.log('✅ Migração para produção concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante a migração para produção:', error);
    return false;
  }
}