import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/**
 * Light enter transition for full-screen public pages (auth, landing).
 * Dashboard routes use DashboardLayout’s own transition.
 */
export default function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[100dvh]"
    >
      {children}
    </motion.div>
  );
}
