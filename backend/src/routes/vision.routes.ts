// src/routes/vision.routes.ts
import { Router } from 'express';
import { visionService } from '../services/ai/visionService';
import { logger } from '../utils/logger';
import { authenticateUser } from '../middleware/authMiddleware';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

/**
 * POST /api/vision/analyze-workflow-image
 * Analyze a workflow image and extract structure
 */
router.post('/analyze-workflow-image', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { additionalContext } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert buffer to base64 data URL
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    logger.info('Analyzing workflow image', {
      userId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Validate that it's a workflow image
    const isValidWorkflow = await visionService.validateWorkflowImage(imageUrl);
    if (!isValidWorkflow) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded image does not appear to be an n8n workflow. Please upload a screenshot of an n8n workflow.'
      });
    }

    // Analyze the workflow image
    const analysis = await visionService.analyzeWorkflowImage({
      imageUrl,
      imageType: req.file.mimetype,
      userId,
      prompt: additionalContext
    });

    res.json({
      success: true,
      data: {
        analysis,
        imageInfo: {
          size: req.file.size,
          type: req.file.mimetype,
          originalName: req.file.originalname
        }
      }
    });

  } catch (error) {
    logger.error('Error analyzing workflow image:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to analyze workflow image'
    });
  }
});

/**
 * POST /api/vision/generate-workflow-from-image
 * Generate complete n8n workflow JSON from image
 */
router.post('/generate-workflow-from-image', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { additionalContext } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert buffer to base64 data URL
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    logger.info('Generating workflow from image', {
      userId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Validate that it's a workflow image
    const isValidWorkflow = await visionService.validateWorkflowImage(imageUrl);
    if (!isValidWorkflow) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded image does not appear to be an n8n workflow. Please upload a screenshot of an n8n workflow.'
      });
    }

    // Generate workflow from image
    const result = await visionService.generateWorkflowFromImage({
      imageUrl,
      imageType: req.file.mimetype,
      userId,
      additionalContext
    });

    if (result.status === 'failed') {
      return res.status(500).json({
        success: false,
        message: result.message,
        data: {
          analysis: result.analysis
        }
      });
    }

    res.json({
      success: true,
      data: {
        workflow: result.workflow,
        analysis: result.analysis,
        imageInfo: {
          size: req.file.size,
          type: req.file.mimetype,
          originalName: req.file.originalname
        },
        message: result.message
      }
    });

  } catch (error) {
    logger.error('Error generating workflow from image:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate workflow from image'
    });
  }
});

/**
 * POST /api/vision/validate-workflow-image
 * Check if uploaded image is a valid n8n workflow
 */
router.post('/validate-workflow-image', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert buffer to base64 data URL
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    logger.info('Validating workflow image', { 
      userId, 
      fileSize: req.file.size,
      mimeType: req.file.mimetype 
    });

    const isValidWorkflow = await visionService.validateWorkflowImage(imageUrl);

    res.json({
      success: true,
      data: {
        isValidWorkflow,
        imageInfo: {
          size: req.file.size,
          type: req.file.mimetype,
          originalName: req.file.originalname
        },
        message: isValidWorkflow 
          ? 'Valid n8n workflow image detected' 
          : 'Image does not appear to be an n8n workflow'
      }
    });

  } catch (error) {
    logger.error('Error validating workflow image:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to validate workflow image'
    });
  }
});

/**
 * GET /api/vision/capabilities
 * Get vision service capabilities and supported formats
 */
router.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    data: {
      supportedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxFileSize: '10MB',
      capabilities: [
        'Workflow image analysis',
        'Node extraction',
        'Connection mapping',
        'Parameter detection',
        'Complete workflow JSON generation',
        'n8n 1.100.1 compatibility'
      ],
      models: {
        vision: 'GPT-4o (OpenAI)',
        generation: 'Claude Sonnet 4 (Anthropic)'
      }
    }
  });
});

export default router;
