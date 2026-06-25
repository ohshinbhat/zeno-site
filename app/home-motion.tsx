"use client";

import * as React from "react";
import { motion, useReducedMotion, type Transition, type Variants } from "motion/react";

const smoothEase = [0.16, 1, 0.3, 1] as const;

const revealTransition: Transition = {
  duration: 0.72,
  ease: smoothEase
};

const staggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition
  }
};

type MotionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function MountReveal({ children, className, delay = 0 }: MotionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.985 }}
      transition={{ ...revealTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollReveal({ children, className, delay = 0 }: MotionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      transition={{ ...revealTransition, delay }}
      viewport={{ once: true, amount: 0.28, margin: "0px 0px -8% 0px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollSection({ children, className, delay = 0 }: MotionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34 }}
      transition={{ ...revealTransition, delay }}
      viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.section>
  );
}

export function Stagger({ children, className }: MotionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate="visible"
      className={className}
      initial={reduceMotion ? false : "hidden"}
      variants={staggerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: Omit<MotionProps, "delay">): React.ReactElement {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
