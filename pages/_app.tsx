import type { AppProps } from "next/app";
import { Montserrat as Inter } from "next/font/google";
import { useEffect } from "react";
import "src/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "900"],
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const backgrounds = [
      //
      "/bg/cup.svg",
      "/bg/leaves.svg",
      "/bg/computer.svg",
      "/bg/motorcycle.svg",
      "/bg/rocket.svg",
      "/bg/tulip.svg",
      "/bg/laptop.svg",
    ];

    const bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.style.backgroundImage = `url(${bg})`;
  }, []);

  return (
    <main className={`${inter.className}]`}>
      {/* <div
        className="w-100 place-items-center
        before:absolute before:h-[300px] before:w-full sm: before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 before:lg:h-[360px]
        after:absolute after:-z-20 after:h-[180px] after:w-full sm: after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] after:dark:from-sky-900 after:dark:via-[#0141ff]/40"
      ></div> */}

      <div className="relative z-10">
        <Component {...pageProps} />
      </div>
    </main>
  );
}
