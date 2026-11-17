
import Link from "next/link";
import { activeManagers } from "../../lib/managers";

export default function ManagersPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>

      <h1>MANAGER PROFILES</h1>

      <p className="muted">
        Every career has a story. Explore the lifetime records,
        scoring history, playoff success, and championship
        legacy of The Boys League managers.
      </p>

      <section
        style={{
          background: "#14251f",
          color: "white",
          padding: 26,
          borderRadius: 18,
          marginTop: 26,
        }}
      >
        <div
          style={{
            color: "#48d6a8",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE BOYS LEAGUE • MANAGER DIRECTORY
        </div>

        <h2 style={{ fontSize: 42, marginTop: 10 }}>
          THE LEAGUE'S LEGACY
        </h2>

        <p style={{ color: "#c5d4cd" }}>
          10 active managers • Historical records from 2020 onward
        </p>
      </section>

      <div className="grid">
        {activeManagers.map((manager) => (
          <section
            className="card span6"
            key={manager.slug}
            style={{
              borderTop: "5px solid #48d6a8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  background: "#14251f",
                  color: "#48d6a8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 23,
                  flexShrink: 0,
                }}
              >
                {manager.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>

              <div>
                <div className="label">ACTIVE MANAGER</div>
                <h3>{manager.name}</h3>
              </div>
            </div>

            <p className="muted">
              Career statistics, scoring records,
              championships, and season history.
            </p>

            <div
              style={{
                background: "#f4f8f5",
                padding: 13,
                borderRadius: 10,
                marginBottom: 18,
                color: "#68736d",
                fontSize: 12,
              }}
            >
              Historical statistics awaiting Yahoo import
            </div>

            <Link
              href={`/managers/${manager.slug}`}
              className="button"
            >
              View Career Profile
            </Link>
          </section>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
