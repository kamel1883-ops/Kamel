import React from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Renders the matched child route inside a keyed motion.div so that
 * route changes animate as a horizontal slide via AnimatePresence.
 * Including `location.state.refreshKey` in the key lets the bottom nav
 * force a remount (stack reset) when the active tab is re-selected.
 */
export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const refreshKey = location.state?.refreshKey;
  const key = location.pathname + (refreshKey ? `::${refreshKey}` : "");

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}