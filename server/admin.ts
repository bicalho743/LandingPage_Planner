import express, { Request, Response } from 'express';
import { firebaseAuth } from './firebase';

const router = express.Router();

/**
 * Rota administrativa para excluir um usuário do Firebase pelo e-mail
 * Esta rota é apenas para uso administrativo e deve ser protegida em ambiente de produção
 */
router.delete('/api/admin/user', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "E-mail não fornecido"
    });
  }

  try {
    // Buscar o usuário pelo e-mail no Firebase
    const userRecord = await firebaseAuth.getUserByEmail(email);
    
    // Excluir o usuário do Firebase
    await firebaseAuth.deleteUser(userRecord.uid);
    
    console.log(`✅ Usuário ${email} (UID: ${userRecord.uid}) excluído com sucesso do Firebase`);
    
    return res.status(200).json({
      success: true,
      message: "Usuário excluído com sucesso do Firebase",
      uid: userRecord.uid
    });
  } catch (error: any) {
    console.error("❌ Erro ao excluir usuário do Firebase:", error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado no Firebase"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Erro ao excluir usuário: ${error.message}`
    });
  }
});

export default router;