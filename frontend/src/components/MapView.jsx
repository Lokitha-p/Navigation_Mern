import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";
import api from "../api";
import "leaflet/dist/leaflet.css";

// Fix default icon path issues in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCenter = [20.0008, 72.0003];

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
  }, [points, map]);

  return null;
}

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [paths, setPaths] = useState([]);
  const [view, setView] = useState("map");

  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [route, setRoute] = useState([]);
  const [routeNodes, setRouteNodes] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [newLocation, setNewLocation] = useState({
    name: "",
    block: "",
    floor: "",
    type: "room",
    description: "",
    lat: "",
    lng: "",
  });
  const [newPath, setNewPath] = useState({
    from: "",
    to: "",
    distance: "",
    bidirectional: true,
  });

  const refreshData = async () => {
    try {
      const [locRes, pathRes] = await Promise.all([
        api.get("/api/locations"),
        api.get("/api/paths"),
      ]);
      setLocations(locRes.data);
      setPaths(pathRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? locations.filter((loc) =>
          loc.name.toLowerCase().includes(normalized) ||
          loc.block.toLowerCase().includes(normalized) ||
          loc.floor.toLowerCase().includes(normalized)
        )
      : locations;

    return filtered.map((loc) => (
      <option key={loc._id} value={loc._id}>
        {loc.name} — {loc.block} ({loc.floor})
      </option>
    ));
  }, [locations, query]);

  const selectedSource = locations.find((loc) => loc._id === sourceId);
  const selectedDest = locations.find((loc) => loc._id === destId);

  const locationTypeToClass = {
    room: "building-marker",
    classroom: "building-marker",
    lab: "lab-marker",
    office: "office-marker",
    facility: "facility-marker",
    common: "common-marker",
    landing: "landing-marker",
    default: "building-marker",
  };

  const createMarkerIcon = (type = "default") => {
    const className = locationTypeToClass[type?.toLowerCase()] || locationTypeToClass.default;

    return L.divIcon({
      className: `custom-marker ${className}`,
      html: `<div class="marker-content"></div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });
  };

  const sourceIcon = createMarkerIcon("source");
  const destIcon = createMarkerIcon("destination");

  const getBuildingIcon = (loc) => {
    if (!loc) return createMarkerIcon("default", "B");
    const typeKey = (loc.type || "").toLowerCase();
    return createMarkerIcon(typeKey, typeKey.charAt(0).toUpperCase());
  };

  const haversine = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const R = 6371e3; // meters
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };

  const findNearestLocations = (target, count = 3) => {
    if (!target) return [];
    return locations
      .filter((loc) => loc._id !== target._id)
      .map((loc) => ({
        loc,
        dist: haversine(target.coords, loc.coords),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count)
      .map((item) => item.loc);
  };

  const [routeHints, setRouteHints] = useState([]);

  const onComputeRoute = async () => {
    setError("");
    setDistance(null);
    setRoute([]);
    setRouteNodes([]);
    setRouteSteps([]);
    setRouteHints([]);

    if (!selectedSource || !selectedDest) return;

    try {
      const res = await api.get("/api/route", {
        params: { from: sourceId, to: destId },
      });

      const routeCoords = res.data.route.map((loc) => [loc.coords.lat, loc.coords.lng]);
      setRoute(routeCoords);
      setRouteNodes(res.data.route);
      setRouteSteps(res.data.steps || []);
      setDistance(res.data.distance);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error || "Unable to compute route, please try a different pair."
      );

      // Suggest nearby alternate destinations when a route can't be found
      const nearDest = findNearestLocations(selectedSource, 4);
      setRouteHints(nearDest);
    }
  };


  const onCreateLocation = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: newLocation.name,
      block: newLocation.block,
      floor: newLocation.floor,
      type: newLocation.type,
      description: newLocation.description,
      coords: { lat: parseFloat(newLocation.lat), lng: parseFloat(newLocation.lng) },
    };

    try {
      await api.post("/api/locations", payload);
      setNewLocation({
        name: "",
        block: "",
        floor: "",
        type: "room",
        description: "",
        lat: "",
        lng: "",
      });
      await refreshData();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to create location");
    }
  };

  const onCreatePath = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      from: newPath.from,
      to: newPath.to,
      distance: parseFloat(newPath.distance),
      bidirectional: newPath.bidirectional,
    };

    try {
      await api.post("/api/paths", payload);
      setNewPath({ from: "", to: "", distance: "", bidirectional: true });
      await refreshData();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to create path");
    }
  };

  function RouteDecorator({ positions }) {
    const map = useMap();

    useEffect(() => {
      if (!positions || positions.length < 2) return;

      const base = L.polyline(positions, { interactive: false, opacity: 0 });
      const decorator = L.polylineDecorator(base, {
        patterns: [
          {
            offset: 18,
            repeat: 24,
            symbol: L.Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: {
                stroke: true,
                color: "#ffffff",
                weight: 2,
              },
            }),
          },
        ],
      });

      base.addTo(map);
      decorator.addTo(map);

      return () => {
        map.removeLayer(decorator);
        map.removeLayer(base);
      };
    }, [map, positions]);

    return null;
  }

  return (
    <div className="app">
      <header className="appHeader">
        <div className="navBar">
          <div className="brand">
            <h1>Smart Campus Navigation</h1>
            <p>
              Select a <strong>source</strong> and <strong>destination</strong> to see
              a route on the map.
            </p>
          </div>
          <div className="navActions">
            <button
              className={`navButton ${view === "map" ? "active" : ""}`}
              onClick={() => setView("map")}
            >
              Map
            </button>
            <button
              className={`navButton ${view === "admin" ? "active" : ""}`}
              onClick={() => setView("admin")}
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {view === "map" ? (
        <>
          <section className="controls">
            <div className="control">
              <label htmlFor="search">Search locations</label>
              <input
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a room, block, or floor..."
              />
            </div>

            <div className="control">
              <label htmlFor="source">Source</label>
              <select
                id="source"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                <option value="">Select source</option>
                {options}
              </select>
            </div>
            <div className="control">
              <label htmlFor="destination">Destination</label>
              <select
                id="destination"
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
              >
                <option value="">Select destination</option>
                {options}
              </select>
            </div>
            <div className="control">
              <button disabled={!sourceId || !destId} onClick={onComputeRoute}>
                Compute route
              </button>
            </div>
          </section>

          {distance !== null ? (
            <motion.div
              className="status"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <strong>Distance:</strong> {distance} meters
            </motion.div>
          ) : null}

          {error ? (
            <motion.div
              className="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {error}
            </motion.div>
          ) : null}

          {routeHints.length ? (
            <motion.div
              className="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <p>Try one of these nearby points:</p>
              <div className="hint-list">
                {routeHints.map((loc) => (
                  <button
                    key={loc._id}
                    className="hintButton"
                    onClick={() => setDestId(loc._id)}
                  >
                    {loc.name} — {loc.block}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}

          <div className="map">
            <MapContainer
              center={defaultCenter}
              zoom={17}
              style={{ height: "65vh", minHeight: 420 }}
              scrollWheelZoom={true}
            >
{import.meta.env.VITE_MAPBOX_TOKEN ? (
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
              tileSize={512}
              zoomOffset={-1}
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          )}

              <FitBounds
                points={
                  route.length > 1
                    ? route
                    : locations.map((loc) => [loc.coords.lat, loc.coords.lng])
                }
              />

              {(!route.length || route.length <= 1) &&
                locations.map((loc) => (
                  <Marker
                    key={loc._id}
                    position={[loc.coords.lat, loc.coords.lng]}
                    icon={getBuildingIcon(loc)}
                  >
                    <Popup>
                      <strong>{loc.name}</strong>
                      <br />
                      {loc.block} — {loc.floor}
                      <br />
                      {loc.description}
                    </Popup>
                  </Marker>
                ))}

              {route.length > 1 && (
                <>
                  <Marker
                    position={[selectedSource.coords.lat, selectedSource.coords.lng]}
                    icon={sourceIcon}
                  >
                    <Popup>
                      <strong>Start:</strong> {selectedSource.name}
                    </Popup>
                  </Marker>
                  <Marker
                    position={[selectedDest.coords.lat, selectedDest.coords.lng]}
                    icon={destIcon}
                  >
                    <Popup>
                      <strong>End:</strong> {selectedDest.name}
                    </Popup>
                  </Marker>
                </>
              )}

              {route.length > 1 && (
                <>
                  <Polyline
                    positions={route}
                    color="rgba(52, 179, 255, 0.35)"
                    weight={16}
                    opacity={0.65}
                  />
                  <Polyline
                    positions={route}
                    color="#34b3ff"
                    weight={6}
                    opacity={0.96}
                    className="animated-route"
                  />
                  <RouteDecorator positions={route} />
                </>
              )}
            </MapContainer>
          </div>

          {routeSteps.length ? (
            <section className="directions">
              <h2>Directions</h2>
              <ol>
                {routeSteps.map((step, idx) => {
                  const from = locations.find((loc) => loc._id === step.from);
                  const to = locations.find((loc) => loc._id === step.to);
                  return (
                    <li key={idx}>
                      <strong>{from?.name || "Unknown"}</strong> → <strong>{to?.name || "Unknown"}</strong>
                      <span> ({step.distance} m)</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}
        </>
      ) : (
        <div className="adminPage">
          <div className="adminHeader">
            <h2>Admin Tools</h2>
            <button className="navButton" onClick={() => setView("map")}>Back to map</button>
          </div>

          <div className="adminGrid">
            <section className="adminSection">
              <h2>Add location</h2>
              <form onSubmit={onCreateLocation}>
                <div className="formRow">
                  <input
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Name"
                    required
                  />
                  <input
                    value={newLocation.block}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, block: e.target.value }))
                    }
                    placeholder="Block"
                    required
                  />
                </div>
                <div className="formRow">
                  <input
                    value={newLocation.floor}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, floor: e.target.value }))
                    }
                    placeholder="Floor"
                    required
                  />
                  <input
                    value={newLocation.type}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, type: e.target.value }))
                    }
                    placeholder="Type (room, lab, etc.)"
                    required
                  />
                </div>
                <div className="formRow">
                  <input
                    value={newLocation.lat}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, lat: e.target.value }))
                    }
                    placeholder="Latitude"
                    required
                    type="number"
                    step="any"
                  />
                  <input
                    value={newLocation.lng}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, lng: e.target.value }))
                    }
                    placeholder="Longitude"
                    required
                    type="number"
                    step="any"
                  />
                </div>
                <div className="formRow">
                  <input
                    value={newLocation.description}
                    onChange={(e) =>
                      setNewLocation((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description"
                  />
                </div>
                <button type="submit">Add location</button>
              </form>
            </section>

            <section className="adminSection">
              <h2>Add path</h2>
              <form onSubmit={onCreatePath}>
                <div className="formRow">
                  <select
                    value={newPath.from}
                    onChange={(e) =>
                      setNewPath((prev) => ({ ...prev, from: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select source</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name} — {loc.block}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPath.to}
                    onChange={(e) =>
                      setNewPath((prev) => ({ ...prev, to: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select destination</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name} — {loc.block}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="formRow">
                  <input
                    value={newPath.distance}
                    onChange={(e) =>
                      setNewPath((prev) => ({ ...prev, distance: e.target.value }))
                    }
                    placeholder="Distance (meters)"
                    required
                    type="number"
                    min="0"
                    step="0.1"
                  />
                  <label className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={newPath.bidirectional}
                      onChange={(e) =>
                        setNewPath((prev) => ({
                          ...prev,
                          bidirectional: e.target.checked,
                        }))
                      }
                    />
                    Bidirectional
                  </label>
                </div>
                <button type="submit">Add path</button>
              </form>
            </section>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>
          Tip: Seed the backend with locations/paths and refresh to see markers on the map.
        </p>
      </footer>
    </div>
  );
}
