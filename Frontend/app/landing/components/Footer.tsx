"use client";

import { motion } from "framer-motion";

const footerLinks = [
  { label: "GitHub", href: "https://github.com" },
  { label: "Documentation", href: "#" },
  { label: "Support", href: "mailto:hello@studyroom.dev" },
  { label: "Privacy", href: "#" },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative border-t border-gray-200 pt-12 pb-8 mt-20"
    >
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="space-y-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Brand */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
              StudyRoom
            </h3>
            <p className="text-xs text-gray-500 max-w-md">
              Premium meeting experience. Built for teams who care about
              quality.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6">
            {footerLinks.map((link, idx) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="group relative text-xs text-gray-500 hover:text-blue-600 transition-colors duration-300"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-blue-600 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            © {new Date().getFullYear()} Study Room. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>Built with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="text-red-500"
            >
              ♥
            </motion.span>
            <span>By Suryanshu Nabheet</span>
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-t from-blue-100/50 to-transparent blur-3xl opacity-30 pointer-events-none" />
    </motion.footer>
  );
}
