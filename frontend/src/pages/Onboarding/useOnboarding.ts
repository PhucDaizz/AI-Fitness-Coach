import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Step1Data } from '../../components/onBoarding/Step1Personal';
import type { Step2Data } from '../../components/onBoarding/Step2Equipment';
import type { Step3Data } from '../../components/onBoarding/Step3Schedule';
import type { Step4Data } from '../../components/onBoarding/Step4Injuries';
import { createUserProfile } from '../../services/profile.service';

// ── Defaults ───────────────────────────────────────────────────────────────
const defaultStep1: Step1Data = {
  dateOfBirth: '',
  weightKg: 0,
  heightCm: 0,
  gender: 'male',
  fitnessLevel: 'intermediate',
  fitnessGoal: 'muscle_gain',
};

const defaultStep2: Step2Data = {
  environment: 'gym',
  equipment: [],
};

const defaultStep3: Step3Data = {
  availableDays: [],
  sessionMinutes: 60,
  trainingWindow: 'morning',
};

const defaultStep4: Step4Data = {
  injuries: '',
};

// ── localStorage helpers ──────────────────────────────────────────────────
function loadStep<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

function clearOnboardingStorage() {
  ['onboarding_step1', 'onboarding_step2', 'onboarding_step3', 'onboarding_step4'].forEach((k) =>
    localStorage.removeItem(k),
  );
}

// ── Validation ─────────────────────────────────────────────────────────────
function validateStep1(data: Step1Data): Partial<Record<keyof Step1Data, string>> {
  const errors: Partial<Record<keyof Step1Data, string>> = {};
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      errors.dateOfBirth = 'Must be a valid past date';
    }
  }
  if (!data.weightKg || data.weightKg < 20 || data.weightKg > 300)
    errors.weightKg = 'Weight must be between 20–300 kg';
  if (!data.heightCm || data.heightCm < 50 || data.heightCm > 250)
    errors.heightCm = 'Height must be between 50–250 cm';
  if (!data.gender) errors.gender = 'Please select a gender';
  if (!data.fitnessLevel) errors.fitnessLevel = 'Please select a fitness level';
  if (!data.fitnessGoal) errors.fitnessGoal = 'Please select a primary goal';
  return errors;
}

function validateStep2(data: Step2Data): Partial<Record<keyof Step2Data, string>> {
  const errors: Partial<Record<keyof Step2Data, string>> = {};
  if (!data.environment) errors.environment = 'Please select a workout environment';
  return errors;
}

function validateStep3(data: Step3Data): Partial<Record<keyof Step3Data, string>> {
  const errors: Partial<Record<keyof Step3Data, string>> = {};
  if (!data.availableDays || data.availableDays.length < 1)
    errors.availableDays = 'Please select at least one training day';
  if (!data.sessionMinutes) errors.sessionMinutes = 'Please select session duration';
  return errors;
}

// ── Payload builder ────────────────────────────────────────────────────────
function buildPayload(s1: Step1Data, s2: Step2Data, s3: Step3Data, s4: Step4Data) {
  const payload: Parameters<typeof createUserProfile>[0] = {
    ...s1,
    ...s2,
    availableDays: s3.availableDays,
    sessionMinutes: s3.sessionMinutes,
    // trainingWindow is FE-only — not sent
  };

  if (s4.injuries?.trim()) {
    payload.injuries = s4.injuries.trim();
  }

  return payload;
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useOnboardingPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Step states ──────────────────────────────────────────────────────
  const [step1, setStep1] = useState<Step1Data>(() => loadStep('onboarding_step1', defaultStep1));
  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof Step1Data, string>>>({});

  const [step2, setStep2] = useState<Step2Data>(() => loadStep('onboarding_step2', defaultStep2));
  const [step2Errors, setStep2Errors] = useState<Partial<Record<keyof Step2Data, string>>>({});

  const [step3, setStep3] = useState<Step3Data>(() => loadStep('onboarding_step3', defaultStep3));
  const [step3Errors, setStep3Errors] = useState<Partial<Record<keyof Step3Data, string>>>({});

  const [step4, setStep4] = useState<Step4Data>(() => loadStep('onboarding_step4', defaultStep4));

  // ── Step 1 ───────────────────────────────────────────────────────────
  const updateStep1 = useCallback((partial: Partial<Step1Data>) => {
    setStep1((prev) => {
      const next = { ...prev, ...partial };
      setStep1Errors((errs) => {
        const cleared = { ...errs };
        (Object.keys(partial) as Array<keyof Step1Data>).forEach((k) => delete cleared[k]);
        return cleared;
      });
      return next;
    });
  }, []);

  const handleNextFromStep1 = useCallback(() => {
    const errors = validateStep1(step1);
    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      return;
    }
    localStorage.setItem('onboarding_step1', JSON.stringify(step1));
    setCurrentStep(2);
  }, [step1]);

  // ── Step 2 ───────────────────────────────────────────────────────────
  const updateStep2 = useCallback((partial: Partial<Step2Data>) => {
    setStep2((prev) => {
      const next = { ...prev, ...partial };
      setStep2Errors((errs) => {
        const cleared = { ...errs };
        (Object.keys(partial) as Array<keyof Step2Data>).forEach((k) => delete cleared[k]);
        return cleared;
      });
      return next;
    });
  }, []);

  const handleNextFromStep2 = useCallback(() => {
    const errors = validateStep2(step2);
    if (Object.keys(errors).length > 0) {
      setStep2Errors(errors);
      return;
    }
    localStorage.setItem('onboarding_step2', JSON.stringify(step2));
    setCurrentStep(3);
  }, [step2]);

  // ── Step 3 ───────────────────────────────────────────────────────────
  const updateStep3 = useCallback((partial: Partial<Step3Data>) => {
    setStep3((prev) => {
      const next = { ...prev, ...partial };
      setStep3Errors((errs) => {
        const cleared = { ...errs };
        (Object.keys(partial) as Array<keyof Step3Data>).forEach((k) => delete cleared[k]);
        return cleared;
      });
      return next;
    });
  }, []);

  const handleNextFromStep3 = useCallback(() => {
    const errors = validateStep3(step3);
    if (Object.keys(errors).length > 0) {
      setStep3Errors(errors);
      return;
    }
    localStorage.setItem('onboarding_step3', JSON.stringify(step3));
    setCurrentStep(4);
  }, [step3]);

  // ── Step 4 + Submit ──────────────────────────────────────────────────
  const updateStep4 = useCallback((partial: Partial<Step4Data>) => {
    setStep4((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleFinish = useCallback(async () => {
    localStorage.setItem('onboarding_step4', JSON.stringify(step4));
    const payload = buildPayload(step1, step2, step3, step4);

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createUserProfile(payload);
      clearOnboardingStorage();
      navigate('/chat');
    } catch (err: unknown) {
      // Handle 409 Conflict — profile already exists
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        clearOnboardingStorage();
        navigate('/chat');
        return;
      }
      setSubmitError((err as Error)?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [step1, step2, step3, step4, navigate]);

  // ── Shared back ──────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  }, [currentStep, navigate]);

  return {
    currentStep,
    isSubmitting,
    submitError,
    // Step 1
    step1,
    step1Errors,
    updateStep1,
    handleNextFromStep1,
    // Step 2
    step2,
    step2Errors,
    updateStep2,
    handleNextFromStep2,
    // Step 3
    step3,
    step3Errors,
    updateStep3,
    handleNextFromStep3,
    // Step 4
    step4,
    updateStep4,
    handleFinish,
    // Shared
    handleBack,
  };
}
