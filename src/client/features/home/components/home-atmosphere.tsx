'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

export function HomeAtmosphere({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });
  const routeY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const lightY = useTransform(scrollYProgress, [0, 1], ['0%', '-16%']);

  return (
    <div ref={rootRef} className="home-atmosphere relative isolate overflow-hidden bg-[#f7f9fc]">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          style={{ y: reduceMotion ? 0 : lightY }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ['-5%', '4%', '-5%'],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10rem] -left-[18rem] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,.13)_0%,rgba(96,165,250,.055)_42%,transparent_72%)] blur-2xl will-change-transform"
        />
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ['6%', '-6%', '6%'],
                  y: ['0%', '8%', '0%'],
                  scale: [0.96, 1.07, 0.96],
                }
          }
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[22%] -right-[22rem] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,.09)_0%,rgba(59,130,246,.035)_48%,transparent_72%)] blur-3xl will-change-transform"
        />
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ['-3%', '7%', '-3%'],
                  y: ['4%', '-5%', '4%'],
                }
          }
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[4%] left-[8%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,.08)_0%,transparent_68%)] blur-3xl will-change-transform"
        />

        <motion.svg
          style={{ y: reduceMotion ? 0 : routeY }}
          viewBox="0 0 1600 2800"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-full w-full opacity-55 will-change-transform"
        >
          <motion.path
            d="M-140 260C260 50 390 520 790 300S1260 110 1740 420"
            fill="none"
            stroke="rgba(37,99,235,.12)"
            strokeWidth="1.3"
            strokeDasharray="7 13"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -160] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M-90 960C310 720 520 1210 900 990s520-160 820 40"
            fill="none"
            stroke="rgba(14,116,144,.09)"
            strokeWidth="1.1"
            strokeDasharray="3 16"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, 190] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M-120 1910C320 1640 560 2150 980 1880s510-30 760 150"
            fill="none"
            stroke="rgba(37,99,235,.1)"
            strokeWidth="1.2"
            strokeDasharray="10 18"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -220] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />
          {[
            [250, 196],
            [782, 305],
            [1270, 196],
            [430, 1020],
            [904, 987],
            [1318, 1058],
            [310, 1842],
            [980, 1880],
            [1380, 2010],
          ].map(([cx, cy], index) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="4"
              fill="rgba(37,99,235,.34)"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      r: [3, 6, 3],
                      opacity: [0.25, 0.65, 0.25],
                    }
              }
              transition={{
                duration: 3.8 + (index % 3),
                delay: index * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.svg>

        <div className="absolute inset-0 [background-image:radial-gradient(rgba(30,64,175,.18)_0.65px,transparent_0.65px)] [mask-image:linear-gradient(to_bottom,black,transparent_32%,transparent_68%,black)] [background-size:18px_18px] opacity-[0.17]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,249,252,.72),transparent_18%,transparent_82%,rgba(247,249,252,.72))]" />
      </div>

      <div className="home-atmosphere-content relative z-10">{children}</div>
    </div>
  );
}
