"use client"

import { motion } from "framer-motion"

const cards = [
  { img: "/men1.png", amount: "$7,809,219", investors: "6,688 investors", scale: 1.15 },
  { img: "/men3.png", amount: "$2,987,382", investors: "1,112 investors", scale: 0.95 },
  { img: "/men2.png", amount: "$5,240,140", investors: "1,220 investors", scale: 0.9 },
  { img: "/men4.png", amount: "$4,537,310", investors: "6,948 investors", scale: 0.9 },
]

export default function HeroWall() {
  return (
    <div className="relative w-full p-5 flex justify-end pr-10">

      <div className="grid grid-cols-2 gap-x-4 gap-y-8">

        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            style={{ transform: `scale(${c.scale})` }}
            className="w-55 rounded bg-white shadow-[0_40px_90px_rgba(0,0,0,0.18)] overflow-hidden"
          >
            <img src={c.img} className="w-full h-33.75 object-cover" />

            <div className="p-3">
              <p className="text-sm font-semibold text-gray-900">{c.amount}</p>
              <p className="text-xs text-gray-500">{c.investors}</p>
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  )
}
