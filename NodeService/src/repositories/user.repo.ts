import { type ClientSession, Types } from 'mongoose';
import { UserProfileModel } from '../models/user.model';
import { AvailableDayModel } from '../models/available.model';

const WEEK_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type UserProfileLean = {
  _id: Types.ObjectId;
  userId: string;
  gender: string;
  dateOfBirth: Date;
  weightKg: number;
  heightCm: number;
  environment: string;
  fitnessGoal: string;
  fitnessLevel: string;
  sessionMinutes: number;
  equipment: string[];
  injuries?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PROFILE_SELECT = '-__v';

export class UserProfileRepository {
  // ─── Profile CRUD (with session — dùng khi có replica set) ───────────────────

  async findByUserId(
    userId: string,
    session?: ClientSession,
  ): Promise<UserProfileLean | null> {
    return UserProfileModel
      .findOne({ userId })
      .select(PROFILE_SELECT)
      .lean<UserProfileLean>()
      .session(session ?? null);
  }

  async create(
    data: Partial<UserProfileLean>,
    session: ClientSession,
  ): Promise<UserProfileLean> {
    const [doc] = await UserProfileModel.create([data], { session });
    return doc.toObject() as UserProfileLean;
  }

  async update(
    userId: string,
    data: Partial<UserProfileLean>,
    session: ClientSession,
  ): Promise<UserProfileLean | null> {
    return UserProfileModel
      .findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, runValidators: true, session },
      )
      .select(PROFILE_SELECT)
      .lean<UserProfileLean>();
  }

  // ─── Profile CRUD (without session — dùng khi MongoDB standalone) ─────────────

  async createWithoutSession(
    data: Partial<UserProfileLean>,
  ): Promise<UserProfileLean> {
    const doc = await UserProfileModel.create(data);
    return doc.toObject() as UserProfileLean;
  }

  async updateWithoutSession(
    userId: string,
    data: Partial<UserProfileLean>,
  ): Promise<UserProfileLean | null> {
    return UserProfileModel
      .findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, runValidators: true },
      )
      .select(PROFILE_SELECT)
      .lean<UserProfileLean>();
  }

  // ─── AvailableDay CRUD (with session) ─────────────────────────────────────────

  async findAvailableDays(
    userId: string,
    session?: ClientSession,
  ): Promise<string[]> {
    const docs = await AvailableDayModel
      .find({ userId })
      .select('dayOfWeek -_id')
      .lean<{ dayOfWeek: string }[]>()
      .session(session ?? null);
    return docs
      .map(doc => doc.dayOfWeek)
      .sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  }

  /**
   * Xoá toàn bộ available_days cũ rồi insert mới (with session)
   */
  async replaceAvailableDays(
    userId: string,
    days: string[],
    session: ClientSession,
  ): Promise<string[]> {
    await AvailableDayModel.deleteMany({ userId }, { session });

    if (days.length === 0) return [];

    const docs = days.map((dayOfWeek) => ({ userId, dayOfWeek }));
    await AvailableDayModel.insertMany(docs, { session });
    return [...days].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  }

  /**
   * Xoá toàn bộ available_days cũ rồi insert mới (without session)
   */
  async replaceAvailableDaysWithoutSession(
    userId: string,
    days: string[]
  ): Promise<string[]> {
    await AvailableDayModel.deleteMany({ userId });

    if (days.length === 0) return [];

    const docs = days.map((dayOfWeek: string) => ({ userId, dayOfWeek }));
    await AvailableDayModel.insertMany(docs);
    return [...days].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  }
}

export const userProfileRepository = new UserProfileRepository();