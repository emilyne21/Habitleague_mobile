import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
}) => {
  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.stepDot,
                index < currentStep && styles.stepDotCompleted,
                index === currentStep - 1 && styles.stepDotCurrent,
              ]}
            />
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep - 1 && styles.stepLineCompleted,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Step Labels */}
      {stepLabels.length > 0 && (
        <View style={styles.labelsContainer}>
          {stepLabels.map((label, index) => (
            <Text
              key={index}
              style={[
                styles.stepLabel,
                index < currentStep && styles.stepLabelCompleted,
                index === currentStep - 1 && styles.stepLabelCurrent,
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  stepDotCurrent: {
    backgroundColor: '#2563EB',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  stepLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: '#2563EB',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default StepProgress; 