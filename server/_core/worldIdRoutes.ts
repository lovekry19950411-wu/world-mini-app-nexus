import { Express, Request, Response } from 'express';
import crypto from 'crypto';

/**
 * World ID 4.0 驗證路由
 * 處理 IDKit 驗證流程
 */

export function registerWorldIdRoutes(app: Express) {
  /**
   * 獲取 RP Context
   * IDKit 需要簽名的 rp_context 來進行驗證
   */
  app.post('/api/idkit/rp-context', async (req: Request, res: Response) => {
    try {
      // 生成隨機 nonce
      const nonce = crypto.randomBytes(32).toString('hex');
      
      // 在實際應用中，您需要從 Worldcoin 後端獲取簽名的 rp_context
      // 這是一個簡化的示例
      const rpContext = {
        nonce,
        timestamp: Date.now(),
      };

      res.json({
        success: true,
        rpContext,
      });
    } catch (error) {
      console.error('Failed to get RP context:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get RP context',
      });
    }
  });

  /**
   * 驗證 World ID 證明
   * 驗證來自 IDKit 的證明並返回結果
   */
  app.post('/api/v4/verify/app_f4bf6f2a1ca32e4f9af5f35b529f98f6', async (req: Request, res: Response) => {
    try {
      const { proof, merkle_root, nullifier_hash, verification_level } = req.body;

      // 驗證必要字段
      if (!proof || !merkle_root || !nullifier_hash) {
        return res.status(400).json({
          code: 'INVALID_PROOF',
          detail: 'Missing required fields: proof, merkle_root, nullifier_hash',
        });
      }

      // 在實際應用中，您需要調用 Worldcoin 後端 API 來驗證證明
      // 這是一個簡化的示例
      const isValid = true; // 在實際應用中應該驗證

      if (!isValid) {
        return res.status(400).json({
          code: 'INVALID_PROOF',
          detail: 'The provided proof is invalid',
        });
      }

      // 返回驗證成功
      res.json({
        success: true,
        verified: true,
        nullifier_hash,
        merkle_root,
        verification_level: verification_level || 'orb',
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({
        code: 'VERIFICATION_ERROR',
        detail: 'An error occurred during verification',
      });
    }
  });
}
