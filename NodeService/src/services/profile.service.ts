import { UserProfileLean, userProfileRepository } from '../repositories/user.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import { CreateProfileDto, UpdateProfileDto } from '../validations/profile.valid';

// ─── Helper: ghép profile + availableDays thành 1 object trả về client ──────────
function buildProfileResponse(
  profile: UserProfileLean,
  availableDays: string[],
) {
  return {
    ...profile,
    availableDays,
  };
}

export class ProfileService {

  /**
   * Lấy hồ sơ người dùng kèm ngày rảnh
   */
  async getProfile(userId: string) {
    const [profile, availableDays] = await Promise.all([
      userProfileRepository.findByUserId(userId),
      userProfileRepository.findAvailableDays(userId),
    ]);

    if (!profile) {
      throw new AppError(
        'Chưa có hồ sơ — vui lòng hoàn thành onboarding qua POST /profile',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return buildProfileResponse(profile, availableDays);
  }

  /**
   * Tạo hồ sơ lần đầu (onboarding)
   * Ném CONFLICT nếu profile đã tồn tại
   */
  async createProfile(userId: string, dto: CreateProfileDto) {
    // Kiểm tra profile đã tồn tại chưa
    const existing = await userProfileRepository.findByUserId(userId);
    if (existing) {
      throw new AppError(
        'Hồ sơ đã tồn tại — dùng PUT /profile để cập nhật',
        HTTP_STATUS.CONFLICT,
      );
    }

    const { availableDays, ...profileData } = dto;

    // Tạo profile trước, sau đó tạo availableDays
    const profile = await userProfileRepository.createWithoutSession({ userId, ...profileData });
    const days = await userProfileRepository.replaceAvailableDaysWithoutSession(userId, availableDays);

    return buildProfileResponse(profile, days);
  }

  /**
   * Cập nhật hồ sơ (partial update)
   * Nếu availableDays được cung cấp → thay thế toàn bộ ngày cũ
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await userProfileRepository.findByUserId(userId);
    if (!existing) {
      throw new AppError(
        'Chưa có hồ sơ — vui lòng tạo profile trước qua POST /profile',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const { availableDays, ...profileData } = dto;

    // Cập nhật profile nếu có field thay đổi
    const updatedProfile =
      Object.keys(profileData).length > 0
        ? await userProfileRepository.updateWithoutSession(userId, profileData)
        : existing;

    if (!updatedProfile) {
      throw new AppError('Cập nhật thất bại', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Cập nhật availableDays nếu được truyền
    const updatedDays =
      availableDays && availableDays.length > 0
        ? await userProfileRepository.replaceAvailableDaysWithoutSession(userId, availableDays)
        : await userProfileRepository.findAvailableDays(userId);

    return buildProfileResponse(updatedProfile, updatedDays);
  }
}