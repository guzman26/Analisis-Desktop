import React, { useEffect, useRef, useState } from 'react';
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
  onMinimize,
  title = 'Untitled',
  children,
  size = 'medium',
  showTrafficLights = true,
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
            <Dialog.Content
              asChild
              onEscapeKeyDown={(e) => e.stopPropagation()}
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <motion.div
                className={twMerge(
                  clsx(
                    'fixed left-[25%] top-[12%] -translate-x-0 translate-y-0 z-[51] overflow-hidden max-w-[75vw] max-h-[88vh]',
                    'bg-white/95 rounded-lg border border-white/20',
                    'shadow-[0_0_0_0.5px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.15),0_25px_50px_rgba(0,0,0,0.25)]',
                    !resizable && sizes[size],
                    className
                  )
                )}
                style={{
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
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
                  className={clsx(
                    'p-5 bg-white/95 overflow-y-auto',
                    !resizable && 'max-h-[calc(80vh-44px)]'
                  )}
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    height: resizable
                      ? `${Math.max(height - 44, minHeight - 44)}px`
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
                      className="text-black/30"
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
