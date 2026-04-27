import { ClientSession, Document, Types } from 'mongoose';
import {
  WorkoutPlanModel,
  WorkoutDayModel,
  ExerciseInDayModel,
  IWorkoutPlan,
  IWorkoutDay,
  IExerciseInDay,
} from '../models/workout-plan.model';

// ─── Lean types ─────────────────────────────────────────────────────────────────

export type WorkoutPlanLean = Omit<IWorkoutPlan, keyof Document> & {
  _id: Types.ObjectId;
};

export type WorkoutDayLean = Omit<IWorkoutDay, keyof Document> & {
  _id: Types.ObjectId;
};

export type ExerciseInDayLean = Omit<IExerciseInDay, keyof Document> & {
  _id: Types.ObjectId;
};

// WorkoutDay kèm danh sách bài tập — dùng cho GET /days
export type WorkoutDayWithExercises = WorkoutDayLean & {
  exercises: ExerciseInDayLean[];
};

// ─── WorkoutPlanRepository ───────────────────────────────────────────────────────

export class WorkoutPlanRepository {
  // ─── Plan ──────────────────────────────────────────────────────────────────────

  async findById(
    planId: string,
    session?: ClientSession,
  ): Promise<WorkoutPlanLean | null> {
    return WorkoutPlanModel
      .findById({ _id: planId, isDeleted: false })
      .lean<WorkoutPlanLean>()
      .session(session ?? null);
  }

  async findActiveByUserId(
    userId: string,
    session?: ClientSession,
  ): Promise<WorkoutPlanLean | null> {
    return WorkoutPlanModel
      .findOne({ userId, status: 'active', isDeleted: false })
      .lean<WorkoutPlanLean>()
      .session(session ?? null);
  }

  async findManyByUserId(
    userId: string,
    filter: { status?: string },
    skip: number,
    limit: number,
  ): Promise<{ plans: WorkoutPlanLean[]; total: number }> {
    const query = { 
      userId, 
      isDeleted: false, 
      ...(filter.status 
        ? { status: filter.status } 
        : {}
      ), 
    };

    const [plans, total] = await Promise.all([
      WorkoutPlanModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<WorkoutPlanLean[]>(),
      WorkoutPlanModel.countDocuments(query),
    ]);

    return { plans, total };
  }

  async create(
    data: Partial<WorkoutPlanLean>,
    session?: ClientSession,
  ): Promise<WorkoutPlanLean> {
    const doc = session
      ? (await WorkoutPlanModel.create([data], { session }))[0]
      : await WorkoutPlanModel.create(data);
    return doc.toObject() as WorkoutPlanLean;
  }

  async updateStatus(
    planId: string,
    status: string,
    session?: ClientSession,
  ): Promise<WorkoutPlanLean | null> {
    return WorkoutPlanModel
      .findByIdAndUpdate(
        planId,
        { $set: { status } },
        { new: true, ...(session ? { session } : {}) },
      )
      .lean<WorkoutPlanLean>();
  }

  // ─── Day ───────────────────────────────────────────────────────────────────────

  async findDaysByPlanId(
    planId: string,
    session?: ClientSession,
  ): Promise<WorkoutDayLean[]> {
    return WorkoutDayModel
      .find({ planId: new Types.ObjectId(planId) })
      .sort({ orderIndex: 1 })
      .lean<WorkoutDayLean[]>()
      .session(session ?? null);
  }

  async findDayById(
    dayId: string,
    session?: ClientSession,
  ): Promise<WorkoutDayLean | null> {
    return WorkoutDayModel
      .findById(dayId)
      .lean<WorkoutDayLean>()
      .session(session ?? null);
  }

  async createDay(
    data: Partial<WorkoutDayLean>,
    session?: ClientSession,
  ): Promise<WorkoutDayLean> {
    const doc = session
      ? (await WorkoutDayModel.create([data], { session }))[0]
      : await WorkoutDayModel.create(data);
    return doc.toObject() as WorkoutDayLean;
  }

  // ─── ExerciseInDay ─────────────────────────────────────────────────────────────

  async findExercisesByDayId(
    dayId: string,
    session?: ClientSession,
  ): Promise<ExerciseInDayLean[]> {
    return ExerciseInDayModel
      .find({ dayId: new Types.ObjectId(dayId) })
      .sort({ orderIndex: 1 })
      .lean<ExerciseInDayLean[]>()
      .session(session ?? null);
  }

  async createExercisesInDay(
    records: Array<Partial<ExerciseInDayLean>>,
    session?: ClientSession,
  ): Promise<void> {
    await ExerciseInDayModel.insertMany(records, session ? { session } : {});
  }

  // ─── Compound: lấy days kèm exercises (dùng cho GET /:id/days) ─────────────────

  async findDaysWithExercises(
    planId: string,
  ): Promise<WorkoutDayWithExercises[]> {
    const days = await this.findDaysByPlanId(planId);

    const daysWithExercises = await Promise.all(
      days.map(async (day) => {
        const exercises = await this.findExercisesByDayId(String(day._id));
        return { ...day, exercises };
      }),
    );

    return daysWithExercises;
  }

  // ─── Reschedule ────────────────────────────────────────────────────────────────

  async findDayByScheduledDate(
    planId: string,
    scheduledDate: Date,
    session?: ClientSession,
  ): Promise<WorkoutDayLean | null> {
    return WorkoutDayModel
      .findOne({
        planId: new Types.ObjectId(planId),
        scheduledDate,
      })
      .lean<WorkoutDayLean>()
      .session(session ?? null);
  }

  async findDaysSortedByDate(
    planId: string,
    session?: ClientSession,
  ): Promise<WorkoutDayLean[]> {
    return WorkoutDayModel
      .find({ planId: new Types.ObjectId(planId) })
      .sort({ scheduledDate: 1 })
      .lean<WorkoutDayLean[]>()
      .session(session ?? null);
  }

  async updateDaySchedule(
    dayId: string,
    scheduledDate: Date,
    dayOfWeek: string,
    session?: ClientSession,
  ): Promise<void> {
    await WorkoutDayModel.findByIdAndUpdate(
      dayId,
      { $set: { scheduledDate, dayOfWeek } },
      session ? { session } : {},
    );
  }

  async deletePlanById(planId: string): Promise<boolean> {
    const result = await WorkoutPlanModel.deleteOne({ _id: planId });
    return result.deletedCount === 1;
  }

  async hasAnyLog(
    userId: string, 
    planId: string
  ): Promise<boolean> {
    const { WorkoutLogModel } = await import('../models/workout-log.model');
    const exists = await WorkoutLogModel.exists({
      userId,
      planId: new Types.ObjectId(planId),
    });
    return exists !== null;
  }

  async softDeletePlan(planId: string): Promise<void> {
    await WorkoutPlanModel.findByIdAndUpdate(
      planId,
      { $set: { isDeleted: true } },
    );
    
    const days = await WorkoutPlanModel.find(
      { planId: new Types.ObjectId(planId) },
      { _id: 1 },
    ).lean();

    const dayIds = days.map((d) => d._id);
    if (dayIds.length > 0) {
    await ExerciseInDayModel.deleteMany({ dayId: { $in: dayIds } } );
    }
    await WorkoutDayModel.deleteMany({ planId: new Types.ObjectId(planId) });
  }
}

export const workoutPlanRepository = new WorkoutPlanRepository();