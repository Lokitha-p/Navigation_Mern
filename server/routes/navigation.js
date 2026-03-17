import express from "express";
import Location from "../models/Location.js";
import Path from "../models/Path.js";

const router = express.Router();

// Compute the shortest path between two locations using Dijkstra's algorithm
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing required query parameters: from, to" });
    }

    const [locations, paths] = await Promise.all([
      Location.find().lean(),
      Path.find().lean(),
    ]);

    const locMap = new Map(locations.map((loc) => [loc._id.toString(), loc]));
    if (!locMap.has(from) || !locMap.has(to)) {
      return res.status(404).json({ error: "Source or destination location not found" });
    }

    // Build adjacency list
    const graph = new Map(); // id -> [{ to, distance, pathId }]
    const addEdge = (a, b, distance, pathId) => {
      if (!graph.has(a)) graph.set(a, []);
      graph.get(a).push({ to: b, distance, pathId });
    };

    for (const path of paths) {
      const fromId = path.from.toString();
      const toId = path.to.toString();
      addEdge(fromId, toId, path.distance, path._id.toString());
      if (path.bidirectional) {
        addEdge(toId, fromId, path.distance, path._id.toString());
      }
    }

    // Dijkstra
    const dist = new Map();
    const prev = new Map();
    const visited = new Set();

    for (const locId of locMap.keys()) {
      dist.set(locId, Infinity);
    }
    dist.set(from, 0);

    const getNext = () => {
      let minNode = null;
      let minDist = Infinity;
      for (const [node, d] of dist.entries()) {
        if (!visited.has(node) && d < minDist) {
          minNode = node;
          minDist = d;
        }
      }
      return minNode;
    };

    while (true) {
      const current = getNext();
      if (!current) break;
      if (current === to) break;
      visited.add(current);

      const edges = graph.get(current) || [];
      for (const edge of edges) {
        if (visited.has(edge.to)) continue;
        const newDist = dist.get(current) + edge.distance;
        if (newDist < dist.get(edge.to)) {
          dist.set(edge.to, newDist);
          prev.set(edge.to, { from: current, pathId: edge.pathId, distance: edge.distance });
        }
      }
    }

    const totalDistance = dist.get(to);
    if (!isFinite(totalDistance)) {
      return res.status(404).json({ error: "No route found between the selected locations" });
    }

    // Reconstruct path
    const routeIds = [];
    const steps = [];
    let cur = to;
    while (cur && cur !== from) {
      const step = prev.get(cur);
      if (!step) break;
      routeIds.unshift(cur);
      steps.unshift({
        from: step.from,
        to: cur,
        distance: step.distance,
        pathId: step.pathId,
      });
      cur = step.from;
    }
    routeIds.unshift(from);

    const route = routeIds.map((id) => locMap.get(id));

    res.json({ distance: totalDistance, route, steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute route" });
  }
});

export default router;
