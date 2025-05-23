import React, { useState, useEffect } from "react";

function App() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [team, setTeam] = useState([]);
  
  useEffect(() => {
    const savedTeamUrls = JSON.parse(localStorage.getItem("pokemonTeam") || "[]");
  
    const fetchSavedTeam = async () => {
      const teamData = await Promise.all(
        savedTeamUrls.map(async (url) => {
          const res = await fetch(url);
          const data = await res.json();
          return {
            name: data.name,
            sprite: data.sprites.front_default,
            url,
            types: data.types.map((t) => t.type.name),
            stats: data.stats.map((stat) => ({
              name: stat.stat.name,
              value: stat.base_stat,
            })),
          };
        })
      );
      setTeam(teamData);
    };
  
    if (savedTeamUrls.length > 0) {
      fetchSavedTeam();
    }
  }, []);

  useEffect(() => {
    const savedTeamUrls = team.map((p) => p.url);
    localStorage.setItem("pokemonTeam", JSON.stringify(savedTeamUrls));
  }, [team]);


  useEffect(() => {
    
    const fetchAllPokemon = async () => {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await res.json();

      const detailed = await Promise.all(
        data.results.map(async (p) => {
          const res = await fetch(p.url);
          const details = await res.json();
          return {
            name: p.name,
            url: p.url,
            sprite: details.sprites.front_default,
            types: details.types.map((t) => t.type.name),
            stats: details.stats.map((stat) => ({
              name: stat.stat.name,
              value: stat.base_stat,
            })),
          };
        })
      );

      setAllPokemon(detailed);
    };

    fetchAllPokemon();
  }, []);

  const typeWeaknessMap = {
    fire: ["water", "rock", "ground"],
    water: ["electric", "grass"],
    grass: ["fire", "ice", "poison", "flying", "bug"],
    electric: ["ground"],
    ice: ["fire", "fighting", "rock", "steel"],
    fighting: ["flying", "psychic", "fairy"],
    poison: ["ground", "psychic"],
    ground: ["water", "ice", "grass"],
    flying: ["electric", "ice", "rock"],
    psychic: ["bug", "ghost", "dark"],
    bug: ["fire", "flying", "rock"],
    rock: ["water", "grass", "fighting", "ground", "steel"],
    ghost: ["ghost", "dark"],
    dragon: ["ice", "dragon", "fairy"],
    dark: ["fighting", "bug", "fairy"],
    steel: ["fire", "fighting", "ground"],
    fairy: ["poison", "steel"],
    normal: ["fighting"],
  };

  const filteredPokemon = allPokemon.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.types.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddToTeam = async (url) => {
    if (team.length >= 6) {
      alert("Your team is full! Max 6 Pokémon.");
      return;
    }
    if (team.find((p) => p.url === url)) {
      alert("Already in team!");
      return;
    }
    const res = await fetch(url);
    const data = await res.json();
    setTeam([
      ...team,
      {
        name: data.name,
        sprite: data.sprites.front_default,
        url,
        types: data.types.map((t) => t.type.name),
        stats: data.stats.map((stat) => ({
          name: stat.stat.name,
          value: stat.base_stat,
        })),
      },
    ]);
  };

  const removeFromTeam = (name) => {
    setTeam(team.filter((p) => p.name !== name));
  };

  const totalStats = {
    hp: 0,
    attack: 0,
    defense: 0,
  };

  const weaknesses = new Set();

  team.forEach((p) => {
    p.stats.forEach((stat) => {
      if (["hp", "attack", "defense"].includes(stat.name)) {
        totalStats[stat.name] += stat.value;
      }
    });

    p.types.forEach((type) => {
      
      const weakTo = typeWeaknessMap[type];
      if (weakTo) {
        weakTo.forEach((w) => weaknesses.add(w));
      }
    });
  });

  return (
    <div style={styles.body}>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <div style={styles.container}>
        <h1 style={styles.heading}> Pokémon Team Builder</h1>

        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBox}
        />

<div style={styles.teamBox}>
          {team.length === 0 ? (
            <p>No Pokémon added to your team yet.</p>
          ) : (
            <>
              <div style={styles.teamSprites}>
                {team.map((p) => (
                  <div key={p.name} style={styles.spriteBlock}>
                    <img
                      src={p.sprite}
                      alt={p.name}
                      style={{ width: "80px", height: "80px" }}
                    />
                    <p style={styles.name}>{p.name}</p>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFromTeam(p.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {}
        <div
          style={{
            marginTop: "1rem",
            background: "#111",
            padding: "1rem",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Team Stats</h3>
          <p>HP: {totalStats.hp}</p>
          <p>Attack: {totalStats.attack}</p>
          <p>Defense: {totalStats.defense}</p>

          <h3 style={{ margin: "1rem 0 0.5rem" }}>Weaknesses</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[...weaknesses].map((w) => (
              <span
                key={w}
                style={{
                  ...styles.typeBadge,
                  backgroundColor: typeColors[w] || "#555",
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        <h2 style={styles.subheading}>Available Pokémon</h2>
        <div style={styles.grid}>
          {filteredPokemon.map((p) => (
            <PokemonCard
              key={p.name}
              name={p.name}
              sprite={p.sprite}
              types={p.types}
              stats={p.stats}
              onClick={() => handleAddToTeam(p.url)}
              onDragStart={(e) => e.dataTransfer.setData("pokemonUrl", p.url)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

function PokemonCard({ name, sprite, types, stats, onClick, onDragStart }) {
  const [hovered, setHovered] = useState(false);
  const displayedStats = stats.filter((stat) =>
    ["hp", "attack", "defense"].includes(stat.name)
  );

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
      }}
    >
      <img
        src={sprite}
        alt={name}
        style={{ width: "100px", height: "100px" }}
      />
      <p style={styles.name}>{name}</p>
      <div style={styles.types}>
        {types.map((type) => (
          <span
            key={type}
            style={{
              ...styles.typeBadge,
              backgroundColor: typeColors[type] || "#555",
            }}
          >
            {type}
          </span>
        ))}
      </div>
      <div style={styles.stats}>
        {displayedStats.map((stat) => (
          <div key={stat.name} style={styles.statRow}>
            <span style={styles.statName}>{stat.name}</span>
            <span>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const typeColors = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  normal: "#A8A878",
};


const styles = {
  body: {
    background:
      'url("https://mrwallpaper.com/images/hd/pokemon-saturn-wallpaper-aodycgoyaaci2pzd.jpg") no-repeat center center fixed',
    backgroundSize: "cover",
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  stats: {
    marginTop: "0.7rem",
    fontSize: "0.8rem",
    backgroundColor: "#1f1f1f", 
    borderRadius: "8px",
    padding: "0.5rem 0.7rem",
    color: "#ccc",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    boxSizing: "border-box",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#ddd",
    fontWeight: "600",
  },
  statName: {
    textTransform: "capitalize",
    color: "#aaa",
  },

  types: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.5rem",
  },
  teamBox: {
    backgroundColor: "#111",
    
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1rem",
  },

  teamSprites: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
  },

  spriteBlock: {
    textAlign: "center",
  },

  typeBadge: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "0.2rem 0.5rem",
    borderRadius: "8px",
    fontSize: "0.55rem",
    textTransform: "uppercase",
    fontWeight: "500",
  },

  container: {
    maxWidth: "10000px",
    width: "100%",
    background: "rgba(30, 30, 30, 0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
  },

  heading: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    textAlign: "center",
    textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
  },

  subheading: {
    fontSize: "1.5rem",
    margin: "2rem 0 1rem 0",
  },
  searchBox: {
    width: "100%",
    maxWidth: "300px",
    padding: "0.7rem 1rem",
    borderRadius: "10px",
    border: "none",
    fontSize: "1rem",
    background: "#1e1e1e",
    color: "#eee",
    marginBottom: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
    gap: "2.9rem",
  },

  card: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: "16px",
    padding: "1rem 1.2rem", 
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
    transition: "transform 0.2s, box-shadow 0.2s",
    userSelect: "none",
    maxWidth: "220px", 
    width: "100%",
    height: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    textTransform: "capitalize",
    marginTop: "0.5rem",
  },
  cardHover: {
    transform: "scale(1.05)",
  },
  teamContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  teamCard: {
    backgroundColor: "#222",
    padding: "1rem",
    borderRadius: "10px",
    textAlign: "center",
    minWidth: "120px",
  },
  removeBtn: {
    marginTop: "0.5rem",
    background: "#ff4444",
    color: "white",
    border: "none",
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default App;
