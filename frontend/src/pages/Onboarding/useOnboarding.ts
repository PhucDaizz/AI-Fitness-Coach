import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Step1Data } from '../../components/onBoarding/Step1Personal';

// ── Defaults ───────────────────────────────────────────────────────────────
const defaultStep1: Step1Data = {
  dateOfBirth: '',
  weightKg: 0,
  heightCm: 0,
  gender: 'male',
  fitnessLevel: 'intermediate',
  fitnessGoal: 'muscle_gain',
};

// ── Helper: load from localStorage ────────────────────────────────────────
function loadStep<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
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

  if (!data.weightKg || data.weightKg < 20 || data.weightKg > 300) {
    errors.weightKg = 'Weight must be between 20–300 kg';
  }

  if (!data.heightCm || data.heightCm < 50 || data.heightCm > 250) {
    errors.heightCm = 'Height must be between 50–250 cm';
  }

  if (!data.gender) {
    errors.gender = 'Please select a gender';
  }

  if (!data.fitnessLevel) {
    errors.fitnessLevel = 'Please select a fitness level';
  }

  if (!data.fitnessGoal) {
    errors.fitnessGoal = 'Please select a primary goal';
  }

  return errors;
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useOnboardingPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [step1, setStep1] = useState<Step1Data>(() => loadStep('onboarding_step1', defaultStep1));
  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof Step1Data, string>>>({});

  // ── Step 1 handlers ──────────────────────────────────────────────────
  const updateStep1 = useCallback((partial: Partial<Step1Data>) => {
    setStep1((prev) => {
      const next = { ...prev, ...partial };
      // Clear errors for changed fields
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
    // Persist to localStorage
    localStorage.setItem('onboarding_step1', JSON.stringify(step1));
    setCurrentStep(2);
    // navigate('/onboarding/step2');  ← will use when implementing step 2
  }, [step1]);

  // ── Back handler ─────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  }, [currentStep, navigate]);

  return {
    currentStep,
    // Step 1
    step1,
    step1Errors,
    updateStep1,
    handleNextFromStep1,
    // Shared
    handleBack,
  };
}
