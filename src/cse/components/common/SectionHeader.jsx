// src/components/common/SectionHeader.jsx
import { motion } from "framer-motion";

const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-3xl md:text-4xl font-bold dept-text-primary drop-shadow-sm"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 mt-2 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}

      {/* Accent Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
        className="dept-card-bottom-line relative mx-auto mt-4 h-1 w-24 rounded-full"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full blur-md" style={{ background: "var(--dept-primary-soft)" }} />
      </motion.div>
    </div>
  );
};

export default SectionHeader;
