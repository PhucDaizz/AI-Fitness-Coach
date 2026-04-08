import { UserProfileModel, IUserProfile } from '../models/user.model';
import { AvailableDayModel, IAvailableDay } from '../models/available.model';

export class UserProfileRepository {

  // ─── Profile CRUD ─────────────────────────────────────────────────────────────

  async findByUserId(userId: string): Promise<IUserProfile | null> {
    return UserProfileModel.findOne({ userId });
  }

  async create(data: Partial<IUserProfile>): Promise<IUserProfile> {
    return UserProfileModel.create(data);
  }

  async update(
    userId: string,
    data: Partial<IUserProfile>,
  ): Promise<IUserProfile | null> {
    return UserProfileModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, runValidators: true },
    );
  }

  // ─── AvailableDay CRUD ────────────────────────────────────────────────────────

  async findAvailableDays(userId: string): Promise<IAvailableDay[]> {
    // Sắp xếp theo thứ tự trong tuần (Monday → Sunday)
    const ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = await AvailableDayModel.find({ userId });
    return days.sort((a, b) => ORDER.indexOf(a.dayOfWeek) - ORDER.indexOf(b.dayOfWeek));
  }

  /**
   * Xoá toàn bộ available_days cũ rồi insert mới — đơn giản hơn upsert nhiều records
   */
  async replaceAvailableDays(userId: string, days: string[]): Promise<IAvailableDay[]> {
    await AvailableDayModel.deleteMany({ userId });
    const docs = days.map((dayOfWeek) => ({ userId, dayOfWeek }));
    return AvailableDayModel.insertMany(docs) as unknown as IAvailableDay[];
  }
}