import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <section className="w-full max-w-5xl flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        <div className="text-center md:text-left">
          <h1 className="text-7xl md:text-8xl font-bold text-brand-red">
            404
          </h1>

          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-gray-900">
            Сторінку не знайдено
          </h2>

          <p className="mt-4 max-w-md text-gray-500 text-lg">
            Сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>

          <Link
            href="/"
            className="inline-flex mt-8 rounded-xl bg-brand-red px-6 py-3 text-white font-medium transition hover:bg-brand-red-hover"
          >
            На головну
          </Link>
        </div>

        <div className="relative w-full max-w-sm md:max-w-md aspect-square">
          <Image
            src="/icons/fox_404.png"
            alt="404 fox"
            fill
            priority
            className="object-contain"
          />
        </div>
      </section>
    </main>
  );
}