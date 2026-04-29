import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const MAP_WIDTH = 920;
const MAP_HEIGHT = 680;

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
    x: 626,
    y: 150,
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
    x: 331,
    y: 299,
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
      "Short essays on visual culture, architecture, interfaces, and studio process.",
      "A place for unfinished fragments that may later become projects.",
    ],
    x: 635,
    y: 347,
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
    x: 423,
    y: 496,
  },
];

const floorLines = [
  "M150 450 L410 320 L720 430 L465 585 Z",
  "M240 300 L475 185 L760 285 L530 420 Z",
  "M340 160 L545 62 L790 148 L585 265 Z",
];

const roomLines = [
  "M293 378 L548 493",
  "M408 320 L465 585",
  "M360 242 L645 343",
  "M475 185 L530 420",
  "M454 106 L690 190",
  "M545 62 L585 265",
];

const stairLines = [
  "M465 585 L496 530 L448 508 L418 562",
  "M496 530 L528 474 L479 453 L448 508",
  "M530 420 L560 365 L515 346 L486 399",
  "M560 365 L590 310 L548 292 L518 344",
];

const stairLandings = {
  1: { x: 448, y: 508 },
  2: { x: 530, y: 420 },
  3: { x: 585, y: 265 },
};

const toPercent = ({ x, y }) => ({
  left: `${(x / MAP_WIDTH) * 100}%`,
  top: `${(y / MAP_HEIGHT) * 100}%`,
});

const getRoute = (from, to) => {
  if (from.id === to.id) return [from];

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
  Math.min(4.8, Math.max(1.1, getRouteDistance(route) / 170));

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
    x: 260,
    y: 610,
  });
  const arrivalTimer = useRef(null);

  const activeDestination =
    destinations.find((destination) => destination.id === activeId) ??
    destinations[0];
  const route = useMemo(() => {
    if (!hasEntered) return [personPoint];

    return getRoute(personPoint, activeDestination);
  }, [hasEntered, personPoint, activeDestination]);
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
    const contact = destinations.find((destination) => destination.id === "contact");
    const nextRoute = getRoute(personPoint, contact);
    const nextDuration = getTravelDuration(nextRoute);

    window.clearTimeout(arrivalTimer.current);
    setHasEntered(true);
    setActiveId("contact");
    window.history.pushState(null, "", "#contact");
    arrivalTimer.current = window.setTimeout(() => {
      setPersonPoint(contact);
    }, nextDuration * 1000);
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
          x: hasEntered && !isPhoneLayout ? "18vw" : 0,
          scale: hasEntered && !isPhoneLayout ? 0.92 : 1,
        }}
        className="map-stage"
        aria-label="Multilevel site map"
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
      >
        <svg
          className="floor-plan"
          viewBox="0 0 920 680"
          role="img"
          aria-labelledby="map-title map-description"
        >
          <title id="map-title">Axonometric multilevel floor plan</title>
          <desc id="map-description">
            A minimal line drawing of three stacked building floors with rooms,
            stairs, and clickable destination nodes.
          </desc>

          <g className="verticals" aria-hidden="true">
            <path d="M150 450 L240 300 L340 160" />
            <path d="M410 320 L475 185 L545 62" />
            <path d="M720 430 L760 285 L790 148" />
            <path d="M465 585 L530 420 L585 265" />
          </g>

          <g className="floors" aria-hidden="true">
            {floorLines.map((line) => (
              <path d={line} key={line} />
            ))}
          </g>

          <g className="rooms" aria-hidden="true">
            {roomLines.map((line) => (
              <path d={line} key={line} />
            ))}
          </g>

          <g className="stairs" aria-hidden="true">
            {stairLines.map((line) => (
              <path d={line} key={line} />
            ))}
            <path d="M430 552 L479 575" />
            <path d="M444 526 L493 548" />
            <path d="M459 500 L508 522" />
            <path d="M500 388 L546 408" />
            <path d="M514 362 L560 383" />
            <path d="M529 336 L574 356" />
          </g>

          <polyline
            className="travel-route"
            aria-hidden={!hasEntered}
            points={route.map((point) => `${point.x},${point.y}`).join(" ")}
          />
        </svg>

        <div className="map-nodes" aria-label="Page destinations">
          {!hasEntered ? (
            <button
              className="map-node enter-node"
              onClick={handleEnter}
              style={{
                "--x": `${(destinations[3].x / MAP_WIDTH) * 100}%`,
                "--y": `${(destinations[3].y / MAP_HEIGHT) * 100}%`,
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
      </motion.section>

      <aside className="destination-card" aria-live="polite" aria-hidden={!hasEntered}>
        <p>{activeDestination.level}</p>
        <h2>{activeDestination.title}</h2>
        <span>{activeDestination.body}</span>
        <div className="destination-details">
          {activeDestination.sections.map((section) => (
            <span key={section}>{section}</span>
          ))}
        </div>
      </aside>
    </main>
  );
}
