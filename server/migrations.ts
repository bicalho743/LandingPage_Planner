import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

// Endpoint para migrar o banco de dados
router.post('/api/migrate', async (req: Request, res: Response) => {
  try {
    console.log('⏳ Iniciando migração do banco de dados...');
    
    // 1. Verificar se a coluna 'status' existe na tabela 'users'
    const checkStatusColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'status'
    `;
    
    const statusExists = await pool.query(checkStatusColumn);
    
    if (statusExists.rows.length === 0) {
      console.log('⏳ Adicionando coluna status à tabela users...');
      // Adicionar coluna status
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente'
      `);
      console.log('✅ Coluna status adicionada com sucesso!');
    } else {
      console.log('✅ Coluna status já existe na tabela users.');
    }
    
    // 2. Verificar se a coluna 'senha_hash' existe na tabela 'users'
    const checkSenhaHashColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'senha_hash'
    `;
    
    const senhaHashExists = await pool.query(checkSenhaHashColumn);
    
    if (senhaHashExists.rows.length === 0) {
      console.log('⏳ Adicionando coluna senha_hash à tabela users...');
      // Adicionar coluna senha_hash
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN senha_hash TEXT DEFAULT ''
      `);
      console.log('✅ Coluna senha_hash adicionada com sucesso!');
    } else {
      console.log('✅ Coluna senha_hash já existe na tabela users.');
    }
    
    // 3. Verificar se a coluna 'trial_start' existe na tabela 'users'
    const checkTrialStartColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'trial_start'
    `;
    
    const trialStartExists = await pool.query(checkTrialStartColumn);
    
    if (trialStartExists.rows.length === 0) {
      console.log('⏳ Adicionando coluna trial_start à tabela users...');
      // Adicionar coluna trial_start
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN trial_start TIMESTAMP
      `);
      console.log('✅ Coluna trial_start adicionada com sucesso!');
    } else {
      console.log('✅ Coluna trial_start já existe na tabela users.');
    }
    
    // 4. Verificar se a coluna 'trial_end' existe na tabela 'users'
    const checkTrialEndColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'trial_end'
    `;
    
    const trialEndExists = await pool.query(checkTrialEndColumn);
    
    if (trialEndExists.rows.length === 0) {
      console.log('⏳ Adicionando coluna trial_end à tabela users...');
      // Adicionar coluna trial_end
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN trial_end TIMESTAMP
      `);
      console.log('✅ Coluna trial_end adicionada com sucesso!');
    } else {
      console.log('✅ Coluna trial_end já existe na tabela users.');
    }
    
    // 5. Criar o enum user_status se não existir
    try {
      console.log('⏳ Verificando se o enum user_status existe...');
      // Verificar se o enum existe
      const checkEnum = `
        SELECT typname FROM pg_type 
        JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_type.typnamespace
        WHERE typname = 'user_status' AND nspname = 'public'
      `;
      
      const enumExists = await pool.query(checkEnum);
      
      if (enumExists.rows.length === 0) {
        console.log('⏳ Criando enum user_status...');
        // Criar o enum
        await pool.query(`
          CREATE TYPE user_status AS ENUM ('pendente', 'ativo', 'bloqueado')
        `);
        console.log('✅ Enum user_status criado com sucesso!');
        
        // Alterar a coluna para usar o enum
        await pool.query(`
          ALTER TABLE users 
          ALTER COLUMN status TYPE user_status USING status::user_status
        `);
        console.log('✅ Coluna status alterada para usar enum com sucesso!');
      } else {
        console.log('✅ Enum user_status já existe.');
      }
    } catch (enumError) {
      console.error('⚠️ Erro ao verificar/criar enum:', enumError);
      // Não é crítico, continuamos com a migração
    }
    
    console.log('✅ Migração do banco de dados concluída com sucesso!');
    
    return res.status(200).json({
      success: true,
      message: 'Migração do banco de dados concluída com sucesso!'
    });
  } catch (error: any) {
    console.error('❌ Erro na migração do banco de dados:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na migração do banco de dados',
      error: error.message || 'Erro desconhecido'
    });
  }
});

export default router;