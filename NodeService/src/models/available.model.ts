import mongoose, { Document, Schema } from 'mongoose';
import { DAY_OF_WEEK, DayOfWeek } from '../constants';

export interface IAvailableDay extends Document {
  userId: string;
  dayOfWeek: DayOfWeek;
  createdAt: Date;
  updatedAt: Date;
}

const availableDaySchema = new Schema<IAvailableDay>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      enum: Object.values(DAY_OF_WEEK),
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ─── Composite unique: mỗi user chỉ có 1 record cho mỗi ngày ───────────────────
availableDaySchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

export const AvailableDayModel = mongoose.model<IAvailableDay>('AvailableDay', availableDaySchema);