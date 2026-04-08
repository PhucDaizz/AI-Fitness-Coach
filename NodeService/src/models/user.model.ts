import mongoose, { Document, Schema } from 'mongoose';
import { GENDER, FITNESS_GOAL, FITNESS_LEVEL, ENVIRONMENT } from '../constants';

export interface IUserProfile extends Document {
  userId: string;         // UUID từ .NET Auth Service (không lưu password/account)
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

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // sub claim từ JWT payload (.NET Auth Service)
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: [20, 'Cân nặng tối thiểu 20 kg'],
      max: [300, 'Cân nặng tối đa 300 kg'],
    },
    heightCm: {
      type: Number,
      required: true,
      min: [50, 'Chiều cao tối thiểu 50 cm'],
      max: [250, 'Chiều cao tối đa 250 cm'],
    },
    environment: {
      type: String,
      enum: Object.values(ENVIRONMENT),
      required: true,
    },
    fitnessGoal: {
      type: String,
      enum: Object.values(FITNESS_GOAL),
      required: true,
    },
    fitnessLevel: {
      type: String,
      enum: Object.values(FITNESS_LEVEL),
      required: true,
    },
    sessionMinutes: {
      type: Number,
      default: 60,
      min: [15, 'Buổi tập tối thiểu 15 phút'],
      max: [180, 'Buổi tập tối đa 180 phút'],
    },
    equipment: {
      type: [String],
      default: [],
    },
    injuries: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
    // Không trả về __v trong response
    versionKey: false,
  },
);

export const UserProfileModel = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);