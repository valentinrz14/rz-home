"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: { src: string; alt: string }[];
}

export function ProductImageGallery({ images }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      {/* Imagen principal */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={images[active].src}
          alt={images[active].alt}
          fill
          className="object-cover transition-all duration-300"
          priority={active === 0}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                active === i
                  ? "border-zinc-900 dark:border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
