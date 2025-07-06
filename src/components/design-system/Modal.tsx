import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showTrafficLights?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  title = 'Untitled',
  children,
  size = 'medium',
  showTrafficLights = true,
  className,
}) => {
  const sizes = {
    small: 'w-80',
    medium: 'w-96',
    large: 'w-[28rem]',
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </Dialog.Overlay>

            {/* Modal Content */}
            <Dialog.Content asChild>
              <motion.div
                className={twMerge(
                  clsx(
                    'fixed top-[10%] left-1/2 z-[51] max-h-[80vh] overflow-hidden',
                    'bg-white/95 rounded-lg border border-white/20',
                    'shadow-[0_0_0_0.5px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.15),0_25px_50px_rgba(0,0,0,0.25)]',
                    sizes[size],
                    className
                  )
                )}
                style={{
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  transform: 'translate(-50%, 0)',
                }}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -20,
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {/* macOS Title Bar */}
                <div
                  className="relative flex items-center h-11 px-4 bg-white/80 border-b border-black/10"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {showTrafficLights && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {/* Close Button */}
                      <button
                        className="flex items-center justify-center w-3 h-3 rounded-full border-[0.5px] border-black/10 bg-gradient-to-br from-[#ff6159] to-[#ff4d43] hover:from-[#ff5147] hover:to-[#ff3b31] transition-all duration-150 outline-none focus:ring-2 focus:ring-blue-300/30 group"
                        onClick={onClose}
                        aria-label="Close"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <svg
                            width="6"
                            height="6"
                            viewBox="0 0 6 6"
                            className="text-black/60"
                          >
                            <path
                              d="M1 1L5 5M5 1L1 5"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Minimize Button */}
                      <button
                        className="flex items-center justify-center w-3 h-3 rounded-full border-[0.5px] border-black/10 bg-gradient-to-br from-[#ffbd2e] to-[#ffab00] hover:from-[#ffb01c] hover:to-[#ff9f00] transition-all duration-150 outline-none focus:ring-2 focus:ring-blue-300/30 group disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={onMinimize}
                        aria-label="Minimize"
                        disabled={!onMinimize}
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <svg
                            width="8"
                            height="1"
                            viewBox="0 0 8 1"
                            className="text-black/60"
                          >
                            <path
                              d="M0 0H8"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Maximize Button (Disabled) */}
                      <button
                        className="flex items-center justify-center w-3 h-3 rounded-full border-[0.5px] border-black/10 bg-gradient-to-br from-[#00ca4e] to-[#28cd41] opacity-60 cursor-not-allowed"
                        disabled
                        aria-label="Maximize"
                      >
                        <div className="opacity-0">
                          <svg
                            width="6"
                            height="6"
                            viewBox="0 0 6 6"
                            className="text-black/60"
                          >
                            <path
                              d="M1 3L3 1L5 3"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </div>
                      </button>
                    </div>
                  )}

                  <Dialog.Title className="flex-1 text-center px-10 text-[13px] font-semibold text-black/85 font-sf leading-tight tracking-[-0.01em] select-none">
                    {title}
                  </Dialog.Title>
                </div>

                {/* Modal Body */}
                <div
                  className="p-5 bg-white/95 max-h-[calc(80vh-44px)] overflow-y-auto"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default Modal;
