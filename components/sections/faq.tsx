"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Any tips for a first-time investor on Skysolution?",
    answer:
      "Start by researching startups thoroughly. Diversify your portfolio, only invest what you can afford to lose, and connect with experienced investors on our platform.",
  },
  {
    question: "Where does my money go after I invest?",
    answer:
      "Your investment is transferred directly to the startup through our secure platform. You receive updates and documentation about your investment.",
  },
  {
    question: "How do I know the worth of my investment?",
    answer:
      "The worth of your investment depends on the startup's progress and valuation changes. We provide regular updates and valuations through your investor dashboard.",
  },
  {
    question: "How long before I see a return?",
    answer:
      "Returns depend on the type of investment contract and the startup's growth trajectory. Most investments have a 5-10 year timeframe for returns.",
  },
]

export default function FAQ() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition"
              >
                <span className="text-left text-gray-900 font-semibold">{faq.question}</span>
                <motion.div animate={{ rotate: expanded === idx ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown size={20} className="text-gray-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 bg-gray-50"
                  >
                    <p className="px-6 py-4 text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* More FAQs Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            More Investor FAQs →
          </button>
        </motion.div>
      </div>
    </section>
  )
}
