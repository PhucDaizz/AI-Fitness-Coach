// ─── HTTP Status ────────────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ─── Response Messages ──────────────────────────────────────────────────────────
export const MESSAGES = {
  SUCCESS: 'Thành công',
  CREATED: 'Tạo mới thành công',
  UPDATED: 'Cập nhật thành công',
  DELETED: 'Xóa thành công',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  UNAUTHORIZED: 'Không có quyền truy cập — vui lòng đăng nhập',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này',
  VALIDATION_ERROR: 'Dữ liệu đầu vào không hợp lệ',
  SERVER_ERROR: 'Lỗi hệ thống — vui lòng thử lại sau',
  TOO_MANY_REQUESTS: 'Quá nhiều yêu cầu — vui lòng thử lại sau',
} as const;

// ─── User Roles ─────────────────────────────────────────────────────────────────
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Fitness Enums ──────────────────────────────────────────────────────────────
export const FITNESS_GOAL = {
  WEIGHT_LOSS: 'weight_loss',
  MUSCLE_GAIN: 'muscle_gain',
  ENDURANCE: 'endurance',
  FLEXIBILITY: 'flexibility',
  MAINTENANCE: 'maintenance',
} as const;

export const FITNESS_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const ENVIRONMENT = {
  GYM: 'gym',
  HOME: 'home',
  OUTDOOR: 'outdoor',
} as const;

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// ─── Workout Plan Status ────────────────────────────────────────────────────────
export const PLAN_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
} as const;

// ─── Difficulty Feedback ────────────────────────────────────────────────────────
export const DIFFICULTY_FEEDBACK = {
  EASY: 'easy',
  OK: 'ok',
  HARD: 'hard',
} as const;

// ─── RabbitMQ Queue Names ───────────────────────────────────────────────────────
export const QUEUES = {
  PLAN_GENERATED: 'plan.generated',
  PLAN_ADJUSTED: 'plan.adjusted',
  WORKOUT_FEEDBACK: 'workout.feedback',
} as const;

// ─── WebSocket Events ───────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  PLAN_READY: 'planReady',
  PLAN_UPDATED: 'planUpdated',
  NOTIFICATION: 'notification',
} as const;

// ─── Cache TTL (giây) ───────────────────────────────────────────────────────────
export const CACHE_TTL = {
  ANALYTICS_SUMMARY: 300, // 5 phút
  EXERCISE_LIST: 3600,    // 1 giờ
} as const;