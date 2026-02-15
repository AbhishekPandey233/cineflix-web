import { MovieModel } from "../models/Movie";

export const seedMovies = async () => {
  try {
    const count = await MovieModel.countDocuments();
    if (count > 0) {
      console.log("✅ Movies already seeded, skipping...");
      return;
    }

    const movies = [
      {
        title: "Aa Bata Aama",
        genre: "Nepali | Family,Drama",
        rating: "PG-13",
        img: "/aabataahma.jpeg",
        year: 2026,
        score: 4.2,
        duration: "2h 12m",
        synopsis:
          "A heartfelt journey of family, sacrifice, and hope as a mother and son navigate life-changing decisions.",
        language: "Nepali",
        status: "now-showing",
      },
      {
        title: "Avengers: Doomsday",
        genre: "Sci-fi | Action",
        rating: "PG",
        img: "/doomsday.png",
        year: 2026,
        score: 4.0,
        duration: "2h 18m",
        synopsis:
          "Earth's mightiest heroes face their most dangerous cosmic threat yet as alliances are tested.",
        language: "English",
        status: "now-showing",
      },
      {
        title: "Avatar 3: Fire and Ash",
        genre: "Action | Adventure",
        rating: "PG-13",
        img: "/avatar.jpeg",
        year: 2025,
        score: 4.5,
        duration: "2h 32m",
        synopsis:
          "A new Na'vi clan emerges as old alliances fracture, igniting a battle for Pandora's future.",
        language: "English",
        status: "now-showing",
      },
      {
        title: "Alien Romulus",
        genre: "Sci-fi | Horror",
        rating: "R",
        img: "/alien.webp",
        year: 2026,
        score: 3.9,
        duration: "2h 06m",
        synopsis:
          "A salvage crew investigates a derelict station and awakens a nightmare beyond containment.",
        language: "English",
        status: "now-showing",
      },
      {
        title: "Velvet Storm",
        genre: "Drama | Thriller",
        rating: "PG-13",
        img: "/velvet-storm.jpeg",
        year: 2026,
        score: 4.3,
        duration: "2h 15m",
        synopsis: "A gripping tale of secrets, passion, and revenge in a glamorous setting.",
        language: "English",
        status: "coming-soon",
        releaseDate: new Date("2026-02-21"),
      },
      {
        title: "Neon Valley",
        genre: "Sci-fi | Adventure",
        rating: "PG",
        img: "/neon-valley.jpeg",
        year: 2026,
        score: 4.1,
        duration: "2h 20m",
        synopsis: "An epic journey through a neon-lit world of wonder and danger.",
        language: "English",
        status: "coming-soon",
        releaseDate: new Date("2026-03-08"),
      },
      {
        title: "River of Light",
        genre: "Fantasy | Adventure",
        rating: "PG",
        img: "/river-of-light.jpeg",
        year: 2026,
        score: 4.4,
        duration: "2h 28m",
        synopsis: "A magical adventure along an enchanted river with mystical beings.",
        language: "English",
        status: "coming-soon",
        releaseDate: new Date("2026-03-29"),
      },
      {
        title: "Monsoon City",
        genre: "Drama | Crime",
        rating: "R",
        img: "/monsoon-city.jpeg",
        year: 2026,
        score: 4.2,
        duration: "2h 25m",
        synopsis: "Dark secrets unfold in a rain-soaked metropolitan landscape.",
        language: "English",
        status: "coming-soon",
        releaseDate: new Date("2026-04-12"),
      },
    ];

    await MovieModel.insertMany(movies);
    console.log("✅ Movies seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding movies:", error);
  }
};
