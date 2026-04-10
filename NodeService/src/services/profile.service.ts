import { UserProfileLean, userProfileRepository, UserProfileRepository } from '../repositories/user.repo';
import { AppError } from '../middlewares/error.middleware';
import { HTTP_STATUS } from '../constants';
import { CreateProfileDto, UpdateProfileDto } from '../validations/profile.valid';
import mongoose, { Promise } from 'mongoose';

// const repo = new UserProfileRepository();

// ─── Helper: ghép profile + availableDays thành 1 object trả về client ──────────
function buildProfileResponse(
  profile: UserProfileLean,
  availableDays: string[],
  // days: string[],
) {
  return {
    ...profile,
    availableDays
  };
}

export class ProfileService {

  /**
   * Lấy hồ sơ người dùng kèm ngày rảnh
   */
  async getProfile(userId: string) {
    const [profile, availableDays] = await Promise.all([
      userProfileRepository.findByUserId(userId),
      userProfileRepository.findAvailableDays(userId)
    ]);

    if (!profile) {
      throw new AppError(
        'Chưa có hồ sơ — vui lòng hoàn thành onboarding qua POST /profile',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // const availableDays = await userProfileRepository.findAvailableDays(userId);

    return buildProfileResponse(
      profile,
      availableDays
    );
  }

  /**
   * Tạo hồ sơ lần đầu (onboarding)
   * Ném CONFLICT nếu profile đã tồn tại
   */
  async createProfile(
    userId: string, 
    dto: CreateProfileDto
  ) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const existing = await userProfileRepository
          .findByUserId(userId, session);
        
        if (existing) {
          throw new AppError(
            'Hồ sơ đã tồn tại — dùng PUT /profile để cập nhật',
            HTTP_STATUS.CONFLICT,
          );  
        }
          
        const { availableDays, ...profileData } = dto;
        const [profile, days] = await Promise.all([
          userProfileRepository.create({ userId, ...profileData }, session),
          userProfileRepository.replaceAvailableDays(userId, availableDays, session)
        ]);
        return buildProfileResponse( profile, days );
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Cập nhật hồ sơ (partial update)
   * Nếu availableDays được cung cấp → thay thế toàn bộ ngày cũ
   */
  async updateProfile(
    userId: string, 
    dto: UpdateProfileDto
  ) {
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const existing = await userProfileRepository.findByUserId(userId, session);
        if (!existing) {
          throw new AppError(
            'Chưa có hồ sơ — vui lòng tạo profile trước qua POST /profile',
            HTTP_STATUS.NOT_FOUND,
          );
        }
        
        const { availableDays, ...profileData } = dto;

        const [updatedProfile, updatedDays] = await Promise.all([
          Object.keys(profileData).length > 0
            ? userProfileRepository.update(userId, profileData, session)
            : Promise.resolve(existing),
          availableDays && availableDays.length > 0
            ? userProfileRepository.replaceAvailableDays(userId, availableDays, session)
            : userProfileRepository.findAvailableDays(userId, session)
        ]);

        if (!updatedProfile) {
          throw new AppError('Cập nhật thất bại', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return buildProfileResponse(
          updatedProfile,
          updatedDays
        );
      });
    } finally {
      await session.endSession();
    }
  }
}