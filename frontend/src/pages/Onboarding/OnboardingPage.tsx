import React from 'react';

import OnboardingLayout from '../../components/onBoarding/OnboardingLayout';
import Step1Personal from '../../components/onBoarding/Step1Personal';
import Step2Equipment from '../../components/onBoarding/Step2Equipment';
import Step3Schedule from '../../components/onBoarding/Step3Schedule';
import Step4Injuries from '../../components/onBoarding/Step4Injuries';
import ToastMessage from '../../components/shared/ToastMessage';
import { useOnboardingPage } from './useOnboarding';

const OnboardingPage: React.FC = () => {
  const {
    currentStep,
    isSubmitting,
    submitError,
    setSubmitError,
    step1,
    step1Errors,
    updateStep1,
    handleNextFromStep1,
    step2,
    step2Errors,
    updateStep2,
    handleNextFromStep2,
    step3,
    step3Errors,
    updateStep3,
    handleNextFromStep3,
    step4,
    updateStep4,
    handleFinish,
    handleBack,
  } = useOnboardingPage();

  const handleNext = () => {
    if (currentStep === 1) handleNextFromStep1();
    else if (currentStep === 2) handleNextFromStep2();
    else if (currentStep === 3) handleNextFromStep3();
    else if (currentStep === 4) handleFinish();
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={currentStep === 4 ? 'Finish' : 'Next Step'}
      isLoading={isSubmitting}
    >
      <div key={currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Dùng ToastMessage thay vì tự viết error div */}
        {currentStep === 4 && submitError && (
          <div className="mb-6">
            <ToastMessage type="error" message={submitError} onClose={() => setSubmitError(null)} />
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
