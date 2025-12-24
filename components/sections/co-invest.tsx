"use client"

import { motion } from "framer-motion"

export default function CoInvest() {
  return (
    <section className="py-28 bg-white overflow-hidden">
      <div className="max-w-300 mx-auto px-6 text-center">
        <h2 className="text-[42px] leading-tight font-medium text-gray-900 mb-3">
          Co-invest with VCs and <br /> professional angels
        </h2>
        <p className="text-gray-500 mb-20">
          On the same terms, using the same tools.
        </p>

        <div className="relative flex items-center justify-center">
          {/* LEFT FLOATING CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-105 h-60 rounded-xl shadow-xl bg-[#0A7C64] text-white overflow-hidden"
          >
            <div className="absolute inset-0">
              <img
                src="/images/card.png"
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* <div className="absolute bottom-5 left-5">
              <p className="text-sm opacity-80">Raised</p>
              <p className="text-lg font-semibold">$7,809,219</p>
            </div> */}

            <div className="absolute bottom-5 right-5 text-right">
              <p className="text-sm opacity-80">Investors</p>
              <p className="text-lg font-semibold">6,688</p>
            </div>
          </motion.div>

          {/* RIGHT SEARCH PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-20 -ml-15 bg-white rounded-xl border border-gray-200 shadow-lg w-85 p-5 text-left"
          >
            <p className="text-xs text-gray-500 mb-2">Cap Table</p>

            <input
              placeholder="aldz   CDY AGENCY"
              className="w-full border rounded-md px-3 py-2 text-sm mb-3"
            />

            <input
              placeholder="Y Combinator"
              className="w-full border rounded-md px-3 py-2 text-sm mb-3"
            />

            <p className="text-sm text-gray-700 font-medium">
              +6,688 <span className="text-gray-500 font-normal">Sky Solutions Investors</span>
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-20">
          <button className="bg-[#0F172A] text-white px-10 py-3 rounded-md text-sm font-semibold">
            Explore Investors
          </button>
        </div>
      </div>
    </section>
  )
}
