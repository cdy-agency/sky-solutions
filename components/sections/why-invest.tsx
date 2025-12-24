"use client"

import { motion } from "framer-motion"

export default function WhyInvest() {
  return (
    <motion.section
      className="bg-[#F1F9FF] py-28"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-300 mx-auto px-6 text-center">

        {/* Header */}
        <motion.h2
          className="text-[34px] font-medium text-gray-900 mb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why invest on SKYSOLUTION?
        </motion.h2>

        <motion.p
          className="text-gray-600 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Support founders, build your portfolio, and join a community.
        </motion.p>

        {/* 3 Columns */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
        >

          {/* COL 1 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <img src="images/Invest&Receive.png" className="w-27.5" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Invest and receive equity
            </h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
              Unlike Kickstarter or Indiegogo where you pledge money for products and perks,
              you invest money for equity on SkySolution.
            </p>
          </motion.div>

          {/* COL 2 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <img src="/images/buildWealth.png" className="w-27.5" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Build wealth over time
            </h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
              Build an investment portfolio for the long-term by leveraging your unique
              knowledge and the wisdom of the crowd.
            </p>
          </motion.div>

          {/* COL 3 */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <img src="/images/getFront.png" className="w-27.5" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Get front row seats
            </h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
              When you invest, you'll get exclusive investor updates and opportunities
              to contribute to the companies you love.
            </p>
          </motion.div>

        </motion.div>

        {/* WARNING BOX */}
        <motion.div
          className="bg-[#FFF2CC] border border-black/10 rounded-xl max-w-190 mx-auto py-10 px-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h4 className="font-semibold text-gray-900 mb-2">
            Never invest more than you can afford to lose
          </h4>
          <p className="text-sm text-gray-700 max-w-xl mx-auto leading-relaxed mb-6">
            Startups are riskier than public companies, and even the best founders fail.
            Plan to hold your investments for the long term. Expect to win big or lose all.
          </p>
          <motion.button
            className="bg-[#0F172A] text-white text-sm font-semibold px-6 py-2 rounded-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Learn more in our Investor FAQ
          </motion.button>
        </motion.div>

      </div>
    </motion.section>
  )
}
