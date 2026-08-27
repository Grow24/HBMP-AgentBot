import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@librechat/client';

interface WelcomeModalProps {
  welcomeMessage: string;
}

export default function WelcomeModal({ welcomeMessage }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Always show the modal on mount, ignore welcomeMessage check
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Hardcoded steps instead of parsing
  const title = "Welcome to HBMP AgentBot!";
  const steps = [
    'Click on "My Agents" in the left sidebar',
    'Select "Google" as your provider',
    'Choose "gemini-2.5-flash" model',
    'Start your conversation!'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-md backdrop-blur-sm bg-white dark:bg-gray-800"
        showCloseButton={true}
      >
        <div className="flex flex-col gap-4 p-6">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg 
              className="h-10 w-10 text-green-600 dark:text-green-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleClose}
            className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-600"
          >
            Got it, let's start!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
