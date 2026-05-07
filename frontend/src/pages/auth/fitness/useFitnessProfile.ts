import { useCallback, useEffect, useState } from 'react';

import {
  type FitnessProfile,
  getFitnessProfile,
  updateFitnessProfile,
} from '../../../services/fitness.service';

// ── Types ──────────────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof FitnessProfile, string>>;

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

// ── Default state ──────────────────────────────────────────────────────────────

const DEFAULT_FORM: FitnessProfile = {
  gender: 'male',
  dateOfBirth: '',
  weightKg: 0,
  heightCm: 0,
  fitnessLevel: 'beginner',
  fitnessGoal: 'maintenance',
  environment: 'gym',
  equipment: [],
  availableDays: [],
  sessionMinutes: 60,
  injuries: '',
};

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(data: FitnessProfile): FormErrors {
  const errors: FormErrors = {};

  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Ngày sinh là bắt buộc';
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      errors.dateOfBirth = 'Ngày sinh không hợp lệ';
    }
  }

  if (!data.weightKg || data.weightKg < 20 || data.weightKg > 300) {
    errors.weightKg = 'Cân nặng phải từ 20–300 kg';
  }

  if (!data.heightCm || data.heightCm < 50 || data.heightCm > 250) {
    errors.heightCm = 'Chiều cao phải từ 50–250 cm';
  }

  if (!data.availableDays || data.availableDays.length < 1) {
    errors.availableDays = 'Chọn ít nhất 1 ngày rảnh';
  }

  return errors;
}

// ── isDirty check ──────────────────────────────────────────────────────────────
// So sánh deep equal đơn giản — chỉ dùng cho primitive + array of primitives

function isDirtyCheck(current: FitnessProfile, original: FitnessProfile): boolean {
  const keys = Object.keys(current) as Array<keyof FitnessProfile>;

  for (const key of keys) {
    const a = current[key];
    const b = original[key];

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return true;
      const sorted_a = [...a].sort();
      const sorted_b = [...b].sort();
      if (sorted_a.some((v, i) => v !== sorted_b[i])) return true;
    } else if (a !== b) {
      return true;
    }
  }

  return false;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useFitnessProfile() {
  const [formData, setFormData] = useState<FitnessProfile>(DEFAULT_FORM);
  const [originalData, setOriginalData] = useState<FitnessProfile>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // isDirty: true khi formData khác originalData
  const isDirty = isDirtyCheck(formData, originalData);

  // ── Load profile on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const profile = await getFitnessProfile();

        // Normalize dateOfBirth: "1995-08-15T00:00:00.000Z" → "1995-08-15"
        const normalized: FitnessProfile = {
          ...profile,
          dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
          injuries: profile.injuries ?? '',
        };

        setFormData(normalized);
        setOriginalData(normalized);
      } catch (err: any) {
        setToast({ type: 'error', message: err.message || 'Không thể tải hồ sơ' });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // ── Update một field bất kỳ ──────────────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof FitnessProfile>(key: K, value: FitnessProfile[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));

      // Xóa lỗi của field vừa chỉnh
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  // ── Discard: reset về originalData ──────────────────────────────────────────
  const handleDiscard = useCallback(() => {
    setFormData(originalData);
    setErrors({});
  }, [originalData]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    // Client-side validate trước
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll lên section đầu tiên có lỗi
      const firstErrorEl = document.querySelector('[data-error="true"]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsSaving(true);

      const updated = await updateFitnessProfile({
        ...formData,
        // Đảm bảo injuries undefined thay vì chuỗi rỗng khi user xóa hết
        injuries: formData.injuries?.trim() || undefined,
      });

      const normalized: FitnessProfile = {
        ...updated,
        dateOfBirth: updated.dateOfBirth ? String(updated.dateOfBirth).slice(0, 10) : '',
        injuries: updated.injuries ?? '',
      };

      setOriginalData(normalized);
      setFormData(normalized);
      setErrors({});
      setToast({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Cập nhật thất bại' });
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  // ── Dismiss toast ────────────────────────────────────────────────────────────
  const dismissToast = useCallback(() => setToast(null), []);

  return {
    formData,
    errors,
    isLoading,
    isSaving,
    isDirty,
    toast,
    updateField,
    handleDiscard,
    handleSave,
    dismissToast,
  };
}
