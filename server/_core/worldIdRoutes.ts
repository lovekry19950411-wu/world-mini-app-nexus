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

      const apiKey = process.env.WORLD_ID_API_KEY || 'rp_f3e265557bade5a0';
      
      // 調用 Worldcoin 後端 API 驗證證明
      try {
        const verifyResponse = await fetch('https://api.worldcoin.org/v1/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            proof,
            merkle_root,
            nullifier_hash,
            verification_level: verification_level || 'orb',
            action: 'nexus',
            signal: '',
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          console.error('Worldcoin verification failed:', verifyData);
          return res.status(verifyResponse.status).json({
            code: verifyData.code || 'verification_failed',
            detail: verifyData.detail || 'Verification failed',
          });
        }

        // 驗證成功
        res.json({
          success: true,
          verified: true,
          nullifier_hash,
          merkle_root,
          verification_level: verification_level || 'orb',
        });
      } catch (apiError: any) {
        console.error('Error calling Worldcoin API:', apiError);
        
        // 開發模式下允許驗證通過
        if (process.env.NODE_ENV === 'development') {
          console.warn('Development mode: accepting proof without Worldcoin verification');
          res.json({
            success: true,
            verified: true,
            nullifier_hash,
            merkle_root,
            verification_level: verification_level || 'orb',
          });
        } else {
          res.status(500).json({
            code: 'VERIFICATION_ERROR',
            detail: 'Failed to verify with Worldcoin backend',
          });
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({
        code: 'VERIFICATION_ERROR',
        detail: error.message || 'An error occurred during verification',
      });
    }
  });
}
