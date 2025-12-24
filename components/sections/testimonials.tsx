"use client"

import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      '"Great community of makers. Sharing for founder resources, raise the financial check"',
    author: 'James Chen',
    role: 'Venture Investor',
    image: 'JC',
    color: 'bg-purple-400',
  },
  {
    quote: '"Sky solution - a must have for every angel having the focus on growth"',
    author: 'Lisa Patel',
    role: 'Founder',
    image: 'LP',
    color: 'bg-green-400',
  },
  {
    quote:
      '"Started building here, raised $2M in funding from the investors on the platform"',
    author: 'David Kumar',
    role: 'Founder & CTO',
    image: 'DK',
    color: 'bg-yellow-400',
  },
  {
    quote: '"One of the best communities. Full support from beginning taking together and up"',
    author: 'Emma Rodriguez',
    role: 'Angel Investor',
    image: 'ER',
    color: 'bg-indigo-400',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What our community says</h2>
        </motion.div>

        {/* Testimonial Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200"
            >
              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">{testimonial.quote}</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                >
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
