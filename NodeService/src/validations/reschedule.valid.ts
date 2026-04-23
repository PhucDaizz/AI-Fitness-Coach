import { z } from 'zod';

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Body schema cho POST /workout-plans/:id/reschedule
 */
export const rescheduleSchema = z
  .object({
    currentDay: z
      .string()
      .regex(DATE_REGEX, 'currentDay phải có dạng YYYY-MM-DD'),
    targetDay: z
      .string()
      .regex(DATE_REGEX, 'targetDay phải có dạng YYYY-MM-DD'),
    strategy: z.enum(['SHIFT', 'SWAP'], {
      message: 'strategy phải là SHIFT hoặc SWAP',
    }),
  })
  .refine((d) => d.currentDay !== d.targetDay, {
    message: 'currentDay và targetDay không được giống nhau',
    path: ['targetDay'],
  });

export type ReschedulePlanDto = z.infer<typeof rescheduleSchema>;