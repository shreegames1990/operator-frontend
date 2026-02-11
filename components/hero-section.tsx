'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const cards = [
  {
    id: 1,
    title: 'Card 1',
    description: 'This is the first card in the hero section',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Card 2',
    description: 'This is the second card in the hero section',
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Card 3',
    description: 'This is the third card in the hero section',
    color: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Card 4',
    description: 'This is the fourth card in the hero section',
    color: 'bg-red-500',
  },
  {
    id: 5,
    title: 'Card 5',
    description: 'This is the fifth card in the hero section',
    color: 'bg-yellow-500',
  },
  {
    id: 6,
    title: 'Card 6',
    description: 'This is the sixth card in the hero section',
    color: 'bg-indigo-500',
  },
  {
    id: 7,
    title: 'Card 7',
    description: 'This is the seventh card in the hero section',
    color: 'bg-pink-500',
  },
  {
    id: 8,
    title: 'Card 8',
    description: 'This is the eighth card in the hero section',
    color: 'bg-teal-500',
  },
];

export function HeroSection() {
  return (
    <section className="w-full py-12 bg-zinc-50 dark:bg-black">
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-swiper .swiper-pagination-bullet {
            width: 24px !important;
            height: 8px !important;
            border-radius: 9999px !important;
            background: rgba(0, 0, 0, 0.3) !important;
            opacity: 1 !important;
            transition: all 0.3s ease !important;
            margin: 0 4px !important;
          }
          .hero-swiper .swiper-pagination-bullet-active {
            width: 32px !important;
            background: rgba(0, 0, 0, 0.8) !important;
          }
          @media (prefers-color-scheme: dark) {
            .hero-swiper .swiper-pagination-bullet {
              background: rgba(255, 255, 255, 0.3) !important;
            }
            .hero-swiper .swiper-pagination-bullet-active {
              background: rgba(255, 255, 255, 0.8) !important;
            }
          }
        `
      }} />
      <div className="max-w-8/10 mx-auto px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={2}
          slidesPerGroup={2}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 24,
            },
          }}
          className="hero-swiper !pb-12"
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id}>
              <div
                className={`${card.color} rounded-3xl p-8 h-64 flex flex-col justify-center items-center text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-center text-white/90">{card.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

