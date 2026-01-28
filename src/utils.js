export { themeCategories, themes };

const themeCategories = [
  {
    id: 100,
    name: "Japan",
    images: [
      {
        id: 101,
        title: "Traditional Garden",
        thumbnail: "/images/thumbnails/sunset-bridge.jpeg",
        imgUrl: "/images/sunset-bridge.jpeg",
        theme: "ganbaru-rose",
      },
      {
        id: 102,
        title: "Fuji",
        thumbnail: "/images/thumbnails/fuji-snow.png",
        imgUrl: "/images/fuji-snow.png",
        theme: "ganbaru-rose",
      },
    ],
    totalCount: 79,
  },
  {
    id: 200,
    name: "Nature",
    images: [
      {
        id: 201,
        title: "Cornfield (sunrise)",
        thumbnail: "/images/thumbnails/cornfield-pastel.png",
        imgUrl: "/images/cornfield-pastel.png",
        theme: "ganbaru-rose",
      },
      {
        id: 202,
        title: "Cornfield (sunset)",
        thumbnail: "/images/thumbnails/cornfield-accent.png",
        imgUrl: "/images/cornfield-accent.png",
        theme: "ganbaru-forest",
      },
      {
        id: 203,
        title: "Beach",
        thumbnail: "/images/thumbnails/beach.png",
        imgUrl: "/images/beach.png",
        theme: "ganbaru-rose",
      },
    ],
    totalCount: 30,
  },
  {
    id: 300,
    name: "Aesthetic",
    images: [
      {
        id: 301,
        title: "Swan Lake",
        thumbnail: "/images/thumbnails/swans-2.png",
        imgUrl: "/images/swans-2.png",
        theme: "ganbaru-forest",
      },
      {
        id: 302,
        title: "Treehouse",
        thumbnail: "/images/thumbnails/treehouse.jpg",
        imgUrl: "/images/treehouse.jpg",
        theme: "ganbaru-forest",
      },
      {
        id: 303,
        title: "Frogs",
        thumbnail: "/images/thumbnails/frogs.png",
        imgUrl: "/images/frogs.png",
        theme: "ganbaru-forest",
      },
      {
        id: 304,
        title: "Farm",
        thumbnail: "/images/thumbnails/farm.jpg",
        imgUrl: "/images/farm.jpg",
        theme: "ganbaru-forest",
      },
    ],
    totalCount: 21,
  },
];

const themes = themeCategories.flatMap((category) => category.images);
