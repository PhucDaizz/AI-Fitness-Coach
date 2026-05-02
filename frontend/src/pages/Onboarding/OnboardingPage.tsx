import React from 'react';

import OnboardingLayout from '../../components/onBoarding/OnboardingLayout';
import Step1Personal from '../../components/onBoarding/Step1Personal';
import { useOnboardingPage } from './useOnboarding';

const OnboardingPage: React.FC = () => {
  const { currentStep, step1, step1Errors, updateStep1, handleNextFromStep1, handleBack } =
    useOnboardingPage();

  const getNextLabel = () => {
    if (currentStep === 4) return 'Finish';
    return 'Next Step';
  };

  const handleNext = () => {
    if (currentStep === 1) handleNextFromStep1();
    // Steps 2–4 will be added when implemented
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onBack={currentStep > 1 ? handleBack : undefined}
      onNext={handleNext}
      nextLabel={getNextLabel()}
    >
      {/* Slide transition wrapper */}
      <div key={currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
        {currentStep === 1 && (
          <Step1Personal data={step1} onChange={updateStep1} errors={step1Errors} />
        )}

        {/* Step 2, 3, 4 placeholders — will be added in subsequent phases */}
        {currentStep === 2 && (
          <div className="text-on-surface-variant text-center py-16">
            Step 2 — Equipment (coming next)
          </div>
        )}
        {currentStep === 3 && (
          <div className="text-on-surface-variant text-center py-16">
            Step 3 — Schedule (coming next)
          </div>
        )}
        {currentStep === 4 && (
          <div className="text-on-surface-variant text-center py-16">
            Step 4 — Injuries (coming next)
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingPage;
