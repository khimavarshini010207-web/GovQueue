import { Router } from 'express';
import { db } from '../db/database.js';
import { aiGuideInputSchema } from '../../shared/schemas.js';
import { askGovGuideAI } from '../ai/gemini.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { AIConversation, AIMessage } from '../../shared/types.js';

const router = Router();

// POST /api/ai/guide
router.post('/guide', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { query, conversationId } = aiGuideInputSchema.parse(req.body);
    const userId = req.user?.id || 'anonymous-citizen';
    const now = new Date().toISOString();

    // 1. Get or create conversation
    let convoId = conversationId;
    if (!convoId) {
      convoId = `convo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newConvo: AIConversation = {
        id: convoId,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      await db.createAIConversation(newConvo);
    }

    // 2. Save user message
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: convoId,
      role: 'user',
      content: query,
      createdAt: now,
    };
    await db.createAIMessage(userMsg);

    // 3. Ask GovGuide AI with server-side Gemini + fallback
    const guideResponse = await askGovGuideAI(query, userId);

    // 4. Save assistant response
    const assistantMsg: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: convoId,
      role: 'assistant',
      content: JSON.stringify(guideResponse),
      createdAt: new Date().toISOString(),
    };
    await db.createAIMessage(assistantMsg);

    // 5. Audit Log
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      action: 'AI_GUIDANCE',
      entityType: 'AI_CONVERSATION',
      entityId: convoId,
      metadata: {
        intent: guideResponse.intent,
        recommendedServiceName: guideResponse.recommendedServiceName,
        confidence: guideResponse.confidence,
      },
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        ...guideResponse,
        conversationId: convoId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/conversations
router.get('/conversations', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.json({ success: true, data: [] });
      return;
    }

    // Return conversations for user
    // Simple mock query or db fetch
    res.json({
      success: true,
      data: [],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/conversations/:id
router.get('/conversations/:id', authMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const messages = await db.getAIMessages(req.params.id);
    res.json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
