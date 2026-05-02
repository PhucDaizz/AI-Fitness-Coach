import React from 'react';

import OnboardingLayout from '../../components/onBoarding/OnboardingLayout';
import Step1Personal from '../../components/onBoarding/Step1Personal';
import Step2Equipment from '../../components/onBoarding/Step2Equipment';
import Step3Schedule from '../../components/onBoarding/Step3Schedule';
import Step4Injuries from '../../components/onBoarding/Step4Injuries';
import { useOnboardingPage } from './useOnboarding';

const OnboardingPage: React.FC = () => {
  const {
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
  } = useOnboardingPage();

  const handleNext = () => {
    if (currentStep === 1) handleNextFromStep1();
    else if (currentStep === 2) handleNextFromStep2();
    else if (currentStep === 3) handleNextFromStep3();
    else if (currentStep === 4) handleFinish();
  };

  const getNextLabel = () => {
    if (currentStep === 4) return 'Finish';
    return 'Next Step';
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={getNextLabel()}
      isLoading={isSubmitting}
    >
      {/* Slide transition wrapper */}
      <div key={currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Submit error banner (Step 4 only) */}
        {currentStep === 4 && submitError && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-xl">
            <span className="material-symbols-outlined text-error" style={{ fontSize: 18 }}>
              error
            </span>
            <p className="text-[13px] text-error font-semibold">{submitError}</p>
          </div>
        )}

        {currentStep === 1 && (
          <Step1Personal data={step1} onChange={updateStep1} errors={step1Errors} />
        )}

        {currentStep === 2 && (
          <Step2Equipment data={step2} onChange={updateStep2} errors={step2Errors} />
        )}

        {currentStep === 3 && (
          <Step3Schedule data={step3} onChange={updateStep3} errors={step3Errors} />
        )}

        {currentStep === 4 && <Step4Injuries data={step4} onChange={updateStep4} />}
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingPage;
