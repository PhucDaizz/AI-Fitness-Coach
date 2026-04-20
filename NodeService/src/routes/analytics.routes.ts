import { Router } from 'express';
import {
  getSummary,
  getWeeklySessions,
  getMuscleVolume,
  getHeatmap,
} from '../controllers/analytics.controller';

const router = Router();

/**
 * Tất cả routes đã được protect bởi authenticate middleware ở index.ts
 */

// GET /analytics/summary         — 4 metric tổng quan
router.get('/summary', getSummary);

// GET /analytics/weekly          — số buổi tập 4 tuần gần nhất
router.get('/weekly', getWeeklySessions);

// GET /analytics/muscle-volume   — volume theo nhóm cơ
router.get('/muscle-volume', getMuscleVolume);

// GET /analytics/heatmap         — heatmap theo ngày tập
router.get('/heatmap', getHeatmap);

export default router;