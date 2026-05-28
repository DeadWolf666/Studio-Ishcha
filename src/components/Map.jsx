import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProjectsMenu from "./ProjectsMenu";
import testerGraphic from "../assets/tester image.png";

const MAP_WIDTH = 1122;
const MAP_HEIGHT = 1402;

const ENTRY_POINT = { x: 440, y: 1180 };

const destinations = [
  {
    id: "projects",
    label: "Projects",
    floor: 3,
    level: "Level 03",
    title: "Selected project rooms",
    body: "Campaigns, spatial systems, product studies, and installation notes live on this upper floor.",
    sections: [
      "Identity systems for cultural launches and independent brands.",
      "Spatial campaigns that move between print, web, installation, and film.",
      "Interface studies for archives, studios, and editorial experiences.",
    ],
    x: 720,
    y: 300,
  },
  {
    id: "about",
    label: "About",
    floor: 2,
    level: "Level 02",
    title: "Studio profile",
    body: "A compact landing for the people, process, and point of view behind Studio Ishcha.",
    sections: [
      "Studio Ishcha works across design direction, visual systems, spatial storytelling, and digital interfaces.",
      "The studio is interested in quiet structure: maps, rituals, rooms, material references, and precise interaction.",
      "Projects are approached as environments rather than isolated outputs.",
    ],
    x: 360,
    y: 650,
  },
  {
    id: "journal",
    label: "Journal",
    floor: 2,
    level: "Level 02",
    title: "Process archive",
    body: "Sketches, references, field observations, and loose experiments collected along the route.",
    sections: [
      "Notes from site visits, image research, layout tests, and production experiments.",
      "Short essays on visual culture, architecture, and studio process.",
      "A place for unfinished fragments that may later become projects.",
    ],
    x: 615,
    y: 740,
  },
  {
    id: "contact",
    label: "Contact",
    floor: 1,
    level: "Level 01",
    title: "Contact desk",
    body: "The ground-level point for inquiries, collaborations, and new conversations.",
    sections: [
      "For commissions, collaborations, editorial requests, or long-form conversations.",
      "Share a short note about the project, timeline, context, and what kind of help you need.",
      "Email: hello@studioishcha.example",
    ],
    x: 620,
    y: 1010,
  },
];

const stairLandings = {
  1: { x: 330, y: 1040 },
  2: { x: 330, y: 740 },
  3: { x: 420, y: 320 },
};

const toPercent = ({ x, y }) => ({
  left: `${(x / MAP_WIDTH) * 100}%`,
  top: `${(y / MAP_HEIGHT) * 100}%`,
});

const getRoute = (from, to) => {
  if (from.id === to.id) return [from];

  if (
    (from.id === "outside" && to.id === "door") ||
    (from.id === "door" && to.id === "contact")
  ) {
    return [from, to];
  }

  const route = [from];

  if (from.floor === to.floor) {
    route.push({
      x: (from.x + to.x) / 2,
      y: Math.min(from.y, to.y) - 24,
    });
    route.push(to);
    return route;
  }

  route.push(stairLandings[from.floor]);

  const step = from.floor < to.floor ? 1 : -1;

  for (let floor = from.floor + step; floor !== to.floor + step; floor += step) {
    route.push(stairLandings[floor]);
  }

  route.push(to);
  return route;
};

const getRouteDistance = (route) =>
  route.reduce((total, point, index) => {
    if (index === 0) return total;

    const previous = route[index - 1];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

const getTravelDuration = (route) =>
  Math.max(0.6, Math.min(4.8, getRouteDistance(route) / 170 - 0.5));

const getRouteFromHash = () => {
  const hash = window.location.hash.replace("#", "");

  if (destinations.some((destination) => destination.id === hash)) {
    return { activeId: hash, hasEntered: true };
  }

  return { activeId: "contact", hasEntered: false };
};

export default function Map() {
  const initialRoute = getRouteFromHash();
  const [hasEntered, setHasEntered] = useState(initialRoute.hasEntered);
  const [activeId, setActiveId] = useState(initialRoute.activeId);
  const [isPhoneLayout, setIsPhoneLayout] = useState(false);
  const [personPoint, setPersonPoint] = useState({
    id: "outside",
    floor: 1,
    x: 220,
    y: 1280,
  });
  const [entryTarget, setEntryTarget] = useState(null);
  const arrivalTimer = useRef(null);

  const activeDestination =
    destinations.find((destination) => destination.id === activeId) ??
    destinations[0];
  const route = useMemo(() => {
    if (!hasEntered) {
      return entryTarget ? getRoute(personPoint, entryTarget) : [personPoint];
    }

    return getRoute(personPoint, activeDestination);
  }, [hasEntered, personPoint, activeDestination, entryTarget]);
  const routePercents = route.map(toPercent);
  const travelDuration = getTravelDuration(route);

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = getRouteFromHash();
      const nextDestination =
        destinations.find((destination) => destination.id === nextRoute.activeId) ??
        destinations[3];

      window.clearTimeout(arrivalTimer.current);
      setActiveId(nextRoute.activeId);
      setHasEntered(nextRoute.hasEntered);

      if (nextRoute.hasEntered) {
        setPersonPoint(nextDestination);
      }
    };

    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.clearTimeout(arrivalTimer.current);
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const updateLayout = () => setIsPhoneLayout(query.matches);

    updateLayout();
    query.addEventListener("change", updateLayout);

    return () => query.removeEventListener("change", updateLayout);
  }, []);

  const handleDestinationClick = (event, destination) => {
    const nextRoute = getRoute(personPoint, destination);
    const nextDuration = getTravelDuration(nextRoute);

    event.preventDefault();
    window.clearTimeout(arrivalTimer.current);
    setActiveId(destination.id);
    window.history.replaceState(null, "", `#${destination.id}`);
    arrivalTimer.current = window.setTimeout(() => {
      setPersonPoint(destination);
    }, nextDuration * 1000);
  };

  const handleEnter = () => {
    const entry = { id: "door", floor: 1, x: ENTRY_POINT.x, y: ENTRY_POINT.y };
    const entryRoute = getRoute(personPoint, entry);
    const entryDuration = getTravelDuration(entryRoute);

    window.clearTimeout(arrivalTimer.current);
    setEntryTarget(entry);
    setActiveId("contact");
    window.history.pushState(null, "", "#contact");

    arrivalTimer.current = window.setTimeout(() => {
      const contactDestination =
        destinations.find((destination) => destination.id === "contact") ??
        entry;

      setEntryTarget(null);
      setPersonPoint(entry);
      setHasEntered(true);

      const contactRoute = getRoute(entry, contactDestination);
      const contactDuration = getTravelDuration(contactRoute);

      arrivalTimer.current = window.setTimeout(() => {
        setPersonPoint(contactDestination);
      }, contactDuration * 1000);
    }, entryDuration * 1000);
  };

  return (
    <main className={`map-shell ${hasEntered ? "entered" : "pre-entry"}`}>
      <section className="studio-panel" aria-hidden={!hasEntered}>
        <p>Studio Ishcha</p>
        <h1>A studio mapped in levels.</h1>
        <span>
          Spatial systems, campaigns, writing, and contact points arranged as a
          quiet architectural diagram.
        </span>
      </section>

      <motion.section
        animate={{
          x: 0,
          y: hasEntered ? 0 : "-5vh",
          scale: hasEntered && !isPhoneLayout ? 0.92 : 1,
        }}
        className="map-stage"
        aria-label="Multilevel site map"
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
      >
        <div className="floor-plan">
          <img
            src={testerGraphic}
            alt="Axonometric three-story office plan"
            aria-hidden="true"
          />
          <svg
            className="floor-plan-overlay"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="img"
            aria-labelledby="map-title map-description"
          >
            <title id="map-title">Axonometric multilevel floor plan</title>
            <desc id="map-description">
              A three-story office plan with a reception desk, staircase, desks,
              conference room, and wall display.
            </desc>
          </svg>

          <div className="map-nodes" aria-label="Page destinations">
          {!hasEntered ? (
            <button
              className="map-node enter-node"
              onClick={handleEnter}
              style={{
                "--x": `${(ENTRY_POINT.x / MAP_WIDTH) * 100}%`,
                "--y": `${(ENTRY_POINT.y / MAP_HEIGHT) * 100}%`,
              }}
              type="button"
            >
              <span className="node-dot" />
              <span className="node-label">Enter</span>
            </button>
          ) : (
            destinations.map((destination) => (
              <a
                aria-current={destination.id === activeId ? "page" : undefined}
                className="map-node"
                href={`#${destination.id}`}
                key={destination.id}
                onClick={(event) => handleDestinationClick(event, destination)}
                style={{
                  "--x": `${(destination.x / MAP_WIDTH) * 100}%`,
                  "--y": `${(destination.y / MAP_HEIGHT) * 100}%`,
                }}
              >
                <span className="node-dot" />
                <span className="node-label">{destination.label}</span>
              </a>
            ))
          )}

          <motion.div
            animate={{
              left: routePercents.map((point) => point.left),
              top: routePercents.map((point) => point.top),
            }}
            className="map-person"
            initial={false}
            transition={{
              duration: travelDuration,
              ease: "easeInOut",
              times: routePercents.map((_, index) =>
                routePercents.length === 1
                  ? 1
                  : index / (routePercents.length - 1),
              ),
            }}
          >
            <span className="person-head" />
            <span className="person-body" />
            <span className="person-shadow" />
          </motion.div>
          </div>
        </div>
      </motion.section>

      <aside className="destination-card" aria-live="polite" aria-hidden={!hasEntered}>
        {activeId === "projects" ? (
          <ProjectsMenu />
        ) : (
          <>
            <p>{activeDestination.level}</p>
            <h2>{activeDestination.title}</h2>
            <span>{activeDestination.body}</span>
            <div className="destination-details">
              {activeDestination.sections.map((section) => (
                <span key={section}>{section}</span>
              ))}
            </div>
          </>
        )}
      </aside>
    </main>
  );
}
