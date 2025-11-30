"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";

export default function DeveloperSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 bg-white/50 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Photo Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative max-w-md mx-auto overflow-hidden rounded-2xl bg-white">
                <Image
                  src="/Suryanshu_Nabheet.png"
                  alt="Suryanshu Nabheet"
                  width={300} // <-- increased size
                  height={300} // <-- increased size
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Info Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Meet the Developer
                </h2>
                <p className="mt-2 text-lg text-blue-600 font-medium">
                  Suryanshu Nabheet
                </p>
              </div>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Built with passion by{" "}
                <span className="font-semibold text-gray-900">
                  Suryanshu Nabheet
                </span>
                , a developer focused on creating seamless real-time
                communication experiences with cutting-edge WebRTC technology.
                Dedicated to creating intuitive and powerful web applications
                that solve real-world problems.
              </p>

              <div className="flex gap-4 pt-4">
                <a
                  href="https://github.com/Suryanshu-Nabheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com/in/suryanshu-nabheet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a
                  href="https://x.com/suryanshuxdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
