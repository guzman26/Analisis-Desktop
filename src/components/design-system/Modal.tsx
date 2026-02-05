import React, { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  // Resizable modal
  resizable?: boolean;
  defaultWidth?: number; // px
  defaultHeight?: number; // px
  minWidth?: number; // px
  minHeight?: number; // px
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title = 'Untitled',
  children,
  size = 'medium',
  className,
  resizable = false,
  defaultWidth,
  defaultHeight,
  minWidth = 360,
  minHeight = 240,
}) => {
  const sizes = {
    small: 'w-[28rem]',
    medium: 'w-[48rem]',
    large: 'w-[64rem]',
  };

  // Internal width/height state for resizable mode
  const toPxWidthFromSize = (s: typeof size): number => {
    switch (s) {
      case 'small':
        return 28 * 16; // 28rem
      case 'large':
        return 64 * 16; // 64rem
      case 'medium':
      default:
        return 48 * 16; // 48rem
    }
  };

  const clampToViewport = (w: number, h: number) => {
    const maxW = Math.floor(window.innerWidth * 0.95);
    const maxH = Math.floor(window.innerHeight * 0.9);
    return {
      w: Math.min(Math.max(w, minWidth), maxW),
      h: Math.min(Math.max(h, minHeight), maxH),
    };
  };

  const initialWidthRaw = defaultWidth ?? toPxWidthFromSize(size);
  const initialHeightRaw =
    defaultHeight ?? Math.min(Math.round(window.innerHeight * 0.7), 640);
  const { w: initialWidth, h: initialHeight } = clampToViewport(
    initialWidthRaw,
    initialHeightRaw
  );

  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);
  const resizingRef = useRef(false);
  const startPosRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // Clamp dimensions on window resize
  useEffect(() => {
    if (!resizable) return;
    const onResize = () => {
      const maxW = Math.floor(window.innerWidth * 0.95);
      const maxH = Math.floor(window.innerHeight * 0.9);
      setWidth((w) => Math.min(Math.max(w, minWidth), maxW));
      setHeight((h) => Math.min(Math.max(h, minHeight), maxH));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [resizable, minWidth, minHeight]);

  // Reset dimensions when (re)opening
  useEffect(() => {
    if (isOpen && resizable) {
      const maxW = Math.floor(window.innerWidth * 0.95);
      const maxH = Math.floor(window.innerHeight * 0.9);
      setWidth(Math.min(Math.max(initialWidth, minWidth), maxW));
      setHeight(Math.min(Math.max(initialHeight, minHeight), maxH));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resizable]);

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
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm pointer-events-none"
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
            <Dialog.Content
              asChild
              onEscapeKeyDown={(e: Event) => e.stopPropagation()}
              onPointerDownOutside={(e: Event) => e.preventDefault()}
            >
              <motion.div
                className={twMerge(
                  clsx(
                    'fixed left-[25%] top-[12%] -translate-x-0 translate-y-0 z-[51] overflow-hidden max-w-[75vw] max-h-[88vh] pointer-events-auto',
                    'bg-white rounded-lg border border-border',
                    'shadow-lg',
                    !resizable && sizes[size],
                    className
                  )
                )}
                style={{
                  width: resizable ? `${width}px` : undefined,
                  height: resizable ? `${height}px` : undefined,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {/* Title Bar */}
                <div className="relative flex items-center justify-between h-14 px-6 bg-background border-b border-border">
                  <Dialog.Title className="text-lg font-semibold text-foreground">
                    {title}
                  </Dialog.Title>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div
                  className={clsx(
                    'p-6 bg-background overflow-y-auto',
                    !resizable && 'max-h-[calc(80vh-56px)]'
                  )}
                  style={{
                    height: resizable
                      ? `${Math.max(height - 56, minHeight - 56)}px`
                      : undefined,
                  }}
                >
                  {children}
                </div>

                {/* Resize handle */}
                {resizable && (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      resizingRef.current = true;
                      startPosRef.current = {
                        x: e.clientX,
                        y: e.clientY,
                        w: width,
                        h: height,
                      };
                      const onMove = (ev: MouseEvent) => {
                        if (!resizingRef.current || !startPosRef.current)
                          return;
                        const dx = ev.clientX - startPosRef.current.x;
                        const dy = ev.clientY - startPosRef.current.y;
                        const maxW = Math.floor(window.innerWidth * 0.95);
                        const maxH = Math.floor(window.innerHeight * 0.9);
                        setWidth(
                          Math.min(
                            Math.max(startPosRef.current.w + dx, minWidth),
                            maxW
                          )
                        );
                        setHeight(
                          Math.min(
                            Math.max(startPosRef.current.h + dy, minHeight),
                            maxH
                          )
                        );
                      };
                      const onUp = () => {
                        resizingRef.current = false;
                        startPosRef.current = null;
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                      };
                      window.addEventListener('mousemove', onMove);
                      window.addEventListener('mouseup', onUp);
                    }}
                    className="absolute right-1.5 bottom-1.5 w-3 h-3 cursor-se-resize"
                    aria-label="Resize"
                    title="Resize"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      className="text-muted-foreground"
                    >
                      <path
                        d="M2 10h8M4 8h6M6 6h4"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default Modal;
