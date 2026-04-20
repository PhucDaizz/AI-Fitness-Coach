import mongoose, { Document, Schema, Types } from 'mongoose';
import { DAY_OF_WEEK, DayOfWeek, PLAN_STATUS } from '../constants';

// ─── WorkoutPlan ────────────────────────────────────────────────────────────────

export interface IWorkoutPlan extends Document {
  userId: string;
  title: string;
  planType: 'weekly' | 'monthly';
  weekNumber: number;
  status: 'active' | 'completed' | 'archived';
  aiModelUsed: string;
  startsAt: Date;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    planType: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    status: {
      type: String,
      enum: Object.values(PLAN_STATUS),
      default: PLAN_STATUS.ACTIVE,
    },
    aiModelUsed: {
      type: String,
      required: true,
      trim: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    generatedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index tìm nhanh plan active của user
workoutPlanSchema.index({ userId: 1, status: 1 });

export const WorkoutPlanModel = mongoose.model<IWorkoutPlan>('WorkoutPlan', workoutPlanSchema);

// ─── WorkoutDay ─────────────────────────────────────────────────────────────────

export interface IWorkoutDay extends Document {
  planId: Types.ObjectId;
  dayOfWeek: DayOfWeek;
  muscleFocus: string;
  orderIndex: number;
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workoutDaySchema = new Schema<IWorkoutDay>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      enum: Object.values(DAY_OF_WEEK),
      required: true,
    },
    muscleFocus: {
      type: String,
      required: true,
      trim: true,
    },
    orderIndex: {
      type: Number,
      required: true,
      min: 1,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

workoutDaySchema.index({ planId: 1, scheduledDate: 1 }, { unique: true });

export const WorkoutDayModel = mongoose.model<IWorkoutDay>('WorkoutDay', workoutDaySchema);

// ─── ExerciseInDay ──────────────────────────────────────────────────────────────

export interface IExerciseInDay extends Document {
  dayId: Types.ObjectId;
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseInDaySchema = new Schema<IExerciseInDay>(
  {
    dayId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutDay',
      required: true,
      index: true,
    },
    exerciseId: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: String,
      required: true,
      trim: true,
    },
    restSeconds: {
      type: Number,
      default: 60,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: undefined,
    },
    orderIndex: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ExerciseInDayModel = mongoose.model<IExerciseInDay>('ExerciseInDay', exerciseInDaySchema);