import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  showCloseButton = true,
  className,
}) => {
  const sizes = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-[90vw] max-h-[90vh]',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className={twMerge(
                  clsx(
                    'fixed left-1/2 top-1/2 z-50',
                    'bg-white rounded-macos-lg shadow-macos-lg',
                    'w-full p-6',
                    sizes[size],
                    className
                  )
                )}
                initial={{ 
                  opacity: 0, 
                  scale: 0.95,
                  x: '-50%',
                  y: '-48%'
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: '-50%',
                  y: '-50%'
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95,
                  x: '-50%',
                  y: '-48%'
                }}
                transition={{ 
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                {showCloseButton && (
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-4 top-4 p-1.5 rounded-macos-sm
                                 text-macos-text-secondary hover:text-macos-text
                                 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                )}
                
                {title && (
                  <Dialog.Title className="text-xl font-semibold text-macos-text mb-2">
                    {title}
                  </Dialog.Title>
                )}
                
                {description && (
                  <Dialog.Description className="text-sm text-macos-text-secondary mb-4">
                    {description}
                  </Dialog.Description>
                )}
                
                <div className="mt-4">
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