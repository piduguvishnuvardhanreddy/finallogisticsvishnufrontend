import React from "react";
import { motion } from "framer-motion";

const transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

const variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={transition}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
