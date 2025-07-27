"use client"; // 如果是 app router，保留这一行；pages router 可以删掉

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

type Site = {
  id: string;
  name: string;
  description?: string;
  images?: string[];
};

export default function Cards() {
  const [sites, setSites] = useState<Site[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sites");
      if (stored) {
        setSites(JSON.parse(stored));
      }
    }
  }, []);

  const handleCardClick = (siteId: string) => {
    localStorage.setItem("selectedSiteId", siteId);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Explore Singapore Travel Sites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div
            key={site.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(site.id)}
          >
            {site.images?.[0] && (
              <Image
                src={site.images[0]}
                alt={site.name}
                width={600}
                height={300}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{site.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{site.description}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
