import { User, } from '../database/db.js';
import type { Request, Response } from 'express';

    export async function AuthController(req: Request, res: Response){
      const userId = req.session.userId;
    
      if (!userId) {
        return res.status(401).json({
          message: "Precisas de iniciar sessão",
        });
      }
    
      const utilizador = await User.findById(userId);
    
      if (!utilizador) {
        return res.status(401).json({
          message: "Utilizador não encontrado",
        });
      }
    
      return res.status(200).json({
        utilizador: {
          id: utilizador._id,
          nome: utilizador.nome,
          email: utilizador.email,
        },
      });
    }
