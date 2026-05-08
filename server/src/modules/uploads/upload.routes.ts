import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendResponse } from '../../utils/apiResponse';
import { p } from '../../utils/params';
import { authenticate } from '../../middleware/auth';
import { uploadSingle } from '../../middleware/upload';

const router = Router();
router.use(authenticate);

router.post('/', uploadSingle, asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    sendResponse({ res, statusCode: 400, message: 'No file uploaded' });
    return;
  }
  sendResponse({ res, statusCode: 201, data: {
    id: file.filename,
    fileName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    fileSize: file.size,
  }});
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  // In a real system, you would delete the physical file and the DB record.
  sendResponse({ res, message: 'Upload deleted' });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  sendResponse({ res, data: { id: p(req.params.id) } });
}));

export default router;
