"use client"

import { motion } from "framer-motion"

export default function AngelSteps() {
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  // Array of steps
  const steps = [
    {
      step: 1,
      title: "Browse Community Rounds",
      desc: "We have the largest selection of startups and small businesses currently raising.",
      img: "/images/bag.png",
      imgWidth: "w-20",
    },
    {
      step: 2,
      title: "Do your own research",
      desc: "Review the company's financials, pitch, and what people say. Or don't—if you're here to support a friend or founder you believe in, that's cool too!",
      img: "/images/eye.png",
      imgWidth: "w-20",
    },
    {
      step: 3,
      title: "Invest in what you understand",
      desc: "Leverage your unique perspective and knowledge to invest in companies you genuinely believe in.",
      img: "/images/brain.png",
      imgWidth: "w-20",
    },
  ]

  return (
    <section className="bg-white py-28">
      <div className="max-w-275 mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-[34px] font-medium text-gray-900 mb-2">
            New to angel investing?
          </h2>
          <p className="text-gray-500">
            How it works on SkySolution.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map(({ step, title, desc, img, imgWidth }) => (
            <motion.div
              key={step}
              variants={item}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
            >
              <div>
                <p className="text-xs tracking-widest text-gray-400 mb-3">STEP {step}</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 max-w-md leading-relaxed">{desc}</p>
              </div>

              <div className="border rounded-xl bg-[#F7FAFC] p-10 flex justify-center">
                <img src={img} className={imgWidth} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
