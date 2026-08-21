// Framer Motion Animation Constants & Spring Physics

export const springSnappy = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.8
};

export const springSmooth = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const springBouncy = {
  type: "spring",
  stiffness: 500,
  damping: 20
};

// Modal Variants (Scale + Fade with Spring)
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springSnappy },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } }
};

// Slide-Over Drawer Variants (Right to Left)
export const drawerRightVariants = {
  hidden: { x: '100%', opacity: 0.5 },
  visible: { x: 0, opacity: 1, transition: springSmooth },
  exit: { x: '100%', opacity: 0.5, transition: { duration: 0.25, ease: "easeInOut" } }
};

// Bottom Sheet Variants (Mobile)
export const bottomSheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: springSmooth },
  exit: { y: '100%', transition: { duration: 0.2, ease: "easeInOut" } }
};

// Staggered Container for Product Grids & Lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springSmooth }
};
