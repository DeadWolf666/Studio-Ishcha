import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProjectsMenu from "./ProjectsMenu";
import testerGraphic from "../assets/tester image.png";

const MAP_WIDTH = 1122;
const MAP_HEIGHT = 1402;

const ENTRY_POINT = { x: 420, y: 1210 };

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
    x: 700,
    y: 315,
  },
  {
    id: "about",
    label: "About",
    floor: 2,
    level: "Level 02-A",
    title: "Studio profile",
    body: "A compact landing for the people, process, and point of view behind Studio Ishcha.",
    sections: [
      "Studio Ishcha works across design direction, visual systems, spatial storytelling, and digital interfaces.",
      "The studio is interested in quiet structure: maps, rituals, rooms, material references, and precise interaction.",
      "Projects are approached as environments rather than isolated outputs.",
    ],
    x: 330,
    y: 675,
  },
  {
    id: "journal",
    label: "Journal",
    floor: 2,
    level: "Level 02-B",
    title: "Process archive",
    body: "Sketches, references, field observations, and loose experiments collected along the route.",
    sections: [
      "Notes from site visits, image research, layout tests, and production experiments.",
      "Short essays on visual culture, architecture, and studio process.",
      "A place for unfinished fragments that may later become projects.",
    ],
    x: 625,
    y: 720,
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
    x: 610,
    y: 1015,
  },
];

const railDestinations = [...destinations].sort((first, second) => {
  if (first.floor !== second.floor) return first.floor - second.floor;
  return first.level.localeCompare(second.level);
});

const stairLandings = {
  1: { x: 330, y: 1000 },
  2: { x: 315, y: 745 },
  3: { x: 345, y: 455 },
};

const floorCorridors = {
  1: { x: 470, y: 1040 },
  2: { x: 450, y: 735 },
  3: { x: 505, y: 455 },
};

const toPercent = ({ x, y }) => ({
  left: `${(x / MAP_WIDTH) * 100}%`,
  top: `${(y / MAP_HEIGHT) * 100}%`,
});

const getRoute = (from, to) => {
  if (from.id === to.id) return [from];

  if (from.id === "outside" && to.id === "door") {
    return [from, { x: 300, y: 1260 }, { x: 345, y: 1210 }, to];
  }

  if (from.id === "door" && to.id === "contact") {
    return [from, { x: 455, y: 1140 }, floorCorridors[1], to];
  }

  const route = [from];

  if (from.floor === to.floor) {
    const corridor = floorCorridors[from.floor];
    route.push({ x: from.x, y: corridor.y });
    route.push({ x: to.x, y: corridor.y });
    route.push(to);
    return route;
  }

  route.push({ x: from.x, y: floorCorridors[from.floor].y });
  route.push(stairLandings[from.floor]);

  const step = from.floor < to.floor ? 1 : -1;

  for (let floor = from.floor + step; floor !== to.floor + step; floor += step) {
    route.push(stairLandings[floor]);
  }

  route.push({ x: to.x, y: floorCorridors[to.floor].y });
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
  route.length < 2 ? 0 : Math.max(0.14, Math.min(2.15, getRouteDistance(route) / 340));

const getRouteTimes = (route) => {
  if (route.length < 2) return undefined;

  const totalDistance = getRouteDistance(route);
  if (totalDistance === 0) return route.map(() => 0);

  let travelled = 0;
  return route.map((point, index) => {
    if (index === 0) return 0;

    const previous = route[index - 1];
    travelled += Math.hypot(point.x - previous.x, point.y - previous.y);
    return travelled / totalDistance;
  });
};

const getRoutePoints = (route) =>
  route.map((point) => `${point.x},${point.y}`).join(" ");

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
  const routePoints = getRoutePoints(route);
  const routeTimes = getRouteTimes(route);
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
        <div>
          <p>Studio Ishcha</p>
          <h1>A studio mapped in levels.</h1>
          <span>
            Spatial systems, campaigns, writing, and contact points arranged as a
            quiet architectural diagram.
          </span>
        </div>

        {hasEntered && (
          <nav className="destination-rail" aria-label="Studio sections">
            {railDestinations.map((destination) => (
              <a
                aria-current={destination.id === activeId ? "page" : undefined}
                href={`#${destination.id}`}
                key={destination.id}
                onClick={(event) => handleDestinationClick(event, destination)}
              >
                <span>{destination.level}</span>
                {destination.label}
              </a>
            ))}
          </nav>
        )}
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
            <polyline className="travel-route route-shadow" points={routePoints} />
            <motion.polyline
              animate={{ points: routePoints }}
              className="travel-route route-line"
              initial={false}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
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
              x: "-50%",
              y: "-88%",
            }}
            className="map-person"
            initial={false}
            transition={{
              duration: travelDuration,
              ease: "easeInOut",
              times: routeTimes,
            }}
          >
            <svg viewBox="0 0 28 44" aria-hidden="true">
              <ellipse className="person-shadow" cx="14" cy="39" rx="9" ry="3.6" />
              <path
                className="person-body"
                fill="#fff"
                fillOpacity="1"
                stroke="#171717"
                d="M14 14.5c5.1 0 8.6 3.7 8.6 8.9v8.1c0 3-2 5.4-4.9 5.4H10.3c-2.9 0-4.9-2.4-4.9-5.4v-8.1c0-5.2 3.5-8.9 8.6-8.9Z"
              />
              <circle className="person-head" fill="#fff" stroke="#171717" cx="14" cy="8.2" r="5.7" />
              <path className="person-arm" d="M6.5 23.8 1.9 29" />
              <path className="person-arm" d="M21.5 23.8 26.1 29" />
              <path className="person-leg" d="M10.8 36.4 8.3 42" />
              <path className="person-leg" d="M17.2 36.4 19.7 42" />
            </svg>
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
