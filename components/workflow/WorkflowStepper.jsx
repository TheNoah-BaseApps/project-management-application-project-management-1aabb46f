'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

const steps = [
  { id: 'draft', label: 'Draft' },
  { id: 'budgeting', label: 'Budgeting' },
  { id: 'planning', label: 'Planning' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export default function WorkflowStepper({ currentStatus, className }) {
  const currentIndex = steps.findIndex(step => step.id === currentStatus);

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2',
                isCompleted ? 'bg-green-600 border-green-600' :
                isActive ? 'bg-blue-600 border-blue-600' :
                'bg-white border-gray-300'
              )}>
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <Circle className={cn(
                    'h-6 w-6',
                    isActive ? 'text-white' : 'text-gray-400'
                  )} />
                )}
              </div>
              <span className={cn(
                'text-sm font-medium mt-2',
                isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-1 mx-2',
                index < currentIndex ? 'bg-green-600' : 'bg-gray-300'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}