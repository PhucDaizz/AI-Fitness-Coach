import { UserProfileRepository } from '../repositories/user.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import { CreateProfileDto, UpdateProfileDto } from '../validations/profile.valid';

const repo = new UserProfileRepository();

// ─── Helper: ghép profile + availableDays thành 1 object trả về client ──────────
function buildProfileResponse(
  profile: ReturnType<typeof Object.assign>,
  days: string[],
) {
  return {
    ...profile,
    availableDays: days,
  };
}

export class ProfileService {

  /**
   * Lấy hồ sơ người dùng kèm ngày rảnh
   */
  async getProfile(userId: string) {
    const profile = await repo.findByUserId(userId);

    if (!profile) {
      throw new AppError(
        'Chưa có hồ sơ — vui lòng hoàn thành onboarding qua POST /profile',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const availableDays = await repo.findAvailableDays(userId);

    return buildProfileResponse(
      profile.toObject(),
      availableDays.map((d) => d.dayOfWeek),
    );
  }

  /**
   * Tạo hồ sơ lần đầu (onboarding)
   * Ném CONFLICT nếu profile đã tồn tại
   */
  async createProfile(userId: string, dto: CreateProfileDto) {
    const existing = await repo.findByUserId(userId);

    if (existing) {
      throw new AppError(
        'Hồ sơ đã tồn tại — dùng PUT /profile để cập nhật',
        HTTP_STATUS.CONFLICT,
      );
    }

    const { availableDays, ...profileData } = dto;

    const profile = await repo.create({ userId, ...profileData });
    const days = await repo.replaceAvailableDays(userId, availableDays);

    return buildProfileResponse(
      profile.toObject(),
      days.map((d) => d.dayOfWeek),
    );
  }

  /**
   * Cập nhật hồ sơ (partial update)
   * Nếu availableDays được cung cấp → thay thế toàn bộ ngày cũ
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { availableDays, ...profileData } = dto;

    // Cập nhật profile nếu có fields liên quan
    let profile = await repo.findByUserId(userId);

    if (!profile) {
      throw new AppError(
        'Chưa có hồ sơ — vui lòng tạo profile trước qua POST /profile',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (Object.keys(profileData).length > 0) {
      profile = await repo.update(userId, profileData);
      if (!profile) {
        throw new AppError('Cập nhật thất bại', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    }

    // Cập nhật ngày rảnh nếu được cung cấp
    let currentDays = await repo.findAvailableDays(userId);
    if (availableDays && availableDays.length > 0) {
      currentDays = await repo.replaceAvailableDays(userId, availableDays);
    }

    return buildProfileResponse(
      profile.toObject(),
      currentDays.map((d) => d.dayOfWeek),
    );
  }
}