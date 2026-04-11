import mongoose, { Document, Schema, Types } from 'mongoose';
import { DIFFICULTY_FEEDBACK } from '../constants';

// ─── WorkoutLog ─────────────────────────────────────────────────────────────────

export interface IWorkoutLog extends Document {
  userId: string;
  planId: Types.ObjectId;
  dayId: Types.ObjectId;
  loggedDate: Date;          // Ngày thực sự tập (YYYY-MM-DD, time = 00:00:00 UTC)
  durationMinutes?: number;
  difficultyFeedback?: 'easy' | 'ok' | 'hard';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      required: true,
    },
    dayId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutDay',
      required: true,
    },
    loggedDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      min: 1,
      default: undefined,
    },
    difficultyFeedback: {
      type: String,
      enum: Object.values(DIFFICULTY_FEEDBACK),
      default: undefined,
    },
    notes: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Đảm bảo mỗi user chỉ log 1 lần / ngày / day
workoutLogSchema.index({ userId: 1, dayId: 1, loggedDate: 1 }, { unique: true });

// Tìm nhanh log theo user + khoảng thời gian (dùng cho filter và streak)
workoutLogSchema.index({ userId: 1, loggedDate: -1 });

export const WorkoutLogModel = mongoose.model<IWorkoutLog>('WorkoutLog', workoutLogSchema);

// ─── ExerciseLog ────────────────────────────────────────────────────────────────

export interface IExerciseLog extends Document {
  logId: Types.ObjectId;

  // Tương tự ExerciseInDay — raw String cho đến khi Phase 2 hoàn thành.
  // Khi sẵn sàng, đổi thành: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true }
  exerciseId: string;

  setsDone: number;
  repsDone: string;          // VD: "10,10,8" — ghi thực tế từng set
  weightKg?: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseLogSchema = new Schema<IExerciseLog>(
  {
    logId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutLog',
      required: true,
      index: true,
    },

    // Raw string ID — đổi thành ObjectId ref khi Exercise model sẵn sàng (Phase 2)
    exerciseId: {
      type: String,
      required: true,
    },

    setsDone: {
      type: Number,
      required: true,
      min: 0,
    },
    repsDone: {
      type: String,
      required: true,
      trim: true,
    },
    weightKg: {
      type: Number,
      min: 0,
      default: undefined,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ExerciseLogModel = mongoose.model<IExerciseLog>('ExerciseLog', exerciseLogSchema);