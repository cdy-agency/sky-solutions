"use client"

import { motion } from "framer-motion"
import { Mail, Facebook, Apple } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Ready to fund the future?</h2>
          <p className="text-gray-300 text-lg">Head to the business, products, and solutions you hear.</p>
        </motion.div>

        {/* Continue with Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h3 className="text-white font-semibold mb-4">Continue with email</h3>
          <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition">
            <Mail size={20} />
            Continue with Email
          </button>
        </motion.div>

        {/* Social Logins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-white font-semibold mb-4">Continue with other accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-6 py-3 bg-white bg-opacity-10 text-white rounded-lg font-semibold hover:bg-opacity-20 transition border border-white border-opacity-20">
              <Facebook size={20} />
              Continue with Facebook
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-3 bg-white bg-opacity-10 text-white rounded-lg font-semibold hover:bg-opacity-20 transition border border-white border-opacity-20">
              <Apple size={20} />
              Continue with Apple
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
