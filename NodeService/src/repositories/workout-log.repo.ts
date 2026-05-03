import { ClientSession, Document, Types } from 'mongoose';
import {
  WorkoutLogModel,
  ExerciseLogModel,
  IWorkoutLog,
  IExerciseLog,
} from '../models/workout-log.model';

// ─── Lean types ─────────────────────────────────────────────────────────────────

export type WorkoutLogLean = Omit<IWorkoutLog, keyof Document> & {
  _id: Types.ObjectId;
};

export type ExerciseLogLean = Omit<IExerciseLog, keyof Document> & {
  _id: Types.ObjectId;
};

export type WorkoutLogWithExercises = WorkoutLogLean & {
  exercises: ExerciseLogLean[];
};

// ─── WorkoutLogRepository ────────────────────────────────────────────────────────

export class WorkoutLogRepository {
  // ─── Log ───────────────────────────────────────────────────────────────────────

  async findById(
    logId: string,
    session?: ClientSession,
  ): Promise<WorkoutLogLean | null> {
    return WorkoutLogModel
      .findById(logId)
      .lean<WorkoutLogLean>()
      .session(session ?? null);
  }

  /**
   * Kiểm tra user đã log ngày này + day này chưa (enforce 1 log / ngày / day)
   */
  async findByUserDayAndDate(
    userId: string,
    dayId: string,
    loggedDate: Date,
    session?: ClientSession,
  ): Promise<WorkoutLogLean | null> {
    return WorkoutLogModel
      .findOne({
        userId,
        dayId: new Types.ObjectId(dayId),
        loggedDate,
      })
      .lean<WorkoutLogLean>()
      .session(session ?? null);
  }
/**
 * Lấy log theo userId và dayId
 */
  async findByUserAndDayId(
  userId: string,
  dayId: string,
): Promise<WorkoutLogLean | null> {
  return WorkoutLogModel
    .findOne({
      userId,
      dayId: new Types.ObjectId(dayId),
    })
    .lean<WorkoutLogLean>();
}

  async create(
    data: Partial<WorkoutLogLean>,
    session?: ClientSession,
  ): Promise<WorkoutLogLean> {
    const doc = session
      ? (await WorkoutLogModel.create([data], { session }))[0]
      : await WorkoutLogModel.create(data);
    return doc.toObject() as WorkoutLogLean;
  }

  /**
   * Lấy danh sách log trong khoảng thời gian [from, to] có phân trang
   */
  async findByUserAndDateRange(
    userId: string,
    from: Date,
    to: Date,
    skip: number,
    limit: number,
  ): Promise<{ logs: WorkoutLogLean[]; total: number }> {
    const query = {
      userId,
      loggedDate: { $gte: from, $lte: to },
    };

    const [logs, total] = await Promise.all([
      WorkoutLogModel
        .find(query)
        .sort({ loggedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean<WorkoutLogLean[]>(),
      WorkoutLogModel.countDocuments(query),
    ]);

    return { logs, total };
  }

  // ─── ExerciseLog ───────────────────────────────────────────────────────────────

  async createExerciseLogs(
    records: Array<Partial<ExerciseLogLean>>,
    session?: ClientSession,
  ): Promise<void> {
    await ExerciseLogModel.insertMany(records, session ? { session } : {});
  }

  async findExercisesByLogId(
    logId: string,
    session?: ClientSession,
  ): Promise<ExerciseLogLean[]> {
    return ExerciseLogModel
      .find({ logId: new Types.ObjectId(logId) })
      .lean<ExerciseLogLean[]>()
      .session(session ?? null);
  }

  // ─── Compound: log kèm exercises ──────────────────────────────────────────────

  async findLogsWithExercises(
    userId: string,
    from: Date,
    to: Date,
    skip: number,
    limit: number,
  ): Promise<{ logs: WorkoutLogWithExercises[]; total: number }> {
    const { logs, total } = await this.findByUserAndDateRange(userId, from, to, skip, limit);

    const logsWithExercises = await Promise.all(
      logs.map(async (log) => {
        const exercises = await this.findExercisesByLogId(String(log._id));
        return { ...log, exercises };
      }),
    );

    return { logs: logsWithExercises, total };
  }
}

export const workoutLogRepository = new WorkoutLogRepository();