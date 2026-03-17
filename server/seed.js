import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Location from "./models/Location.js";
import Path from "./models/Path.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await Location.deleteMany({});
  await Path.deleteMany({});

  const locations = [
    // Admin Block
    {
      name: "Admin Block Entrance",
      block: "Admin Block",
      floor: "Ground Floor",
      type: "common",
      description: "Main campus entrance to the Admin Block",
      coords: { lat: 20.0005, lng: 72.0001 },
    },
    {
      name: "Reception / Security",
      block: "Admin Block",
      floor: "Ground Floor",
      type: "office",
      description: "Reception desk, security, and visitor waiting area",
      coords: { lat: 20.00085, lng: 72.00002 },
    },
    {
      name: "Admin Library",
      block: "Admin Block",
      floor: "Ground Floor",
      type: "facility",
      description: "Library and study area",
      coords: { lat: 20.00045, lng: 72.00025 },
    },
    {
      name: "Auditorium",
      block: "Admin Block",
      floor: "First Floor",
      type: "common",
      description: "Auditorium for events and presentations",
      coords: { lat: 20.0009, lng: 72.00016 },
    },
    {
      name: "CSE 1st Year (A)",
      block: "Admin Block",
      floor: "Ground Floor",
      type: "classroom",
      description: "First year CSE classroom (section A)",
      coords: { lat: 20.0007, lng: 72.00035 },
    },
    {
      name: "2nd Year CSE (A)",
      block: "Admin Block",
      floor: "First Floor",
      type: "classroom",
      description: "Second year CSE classroom (section A)",
      coords: { lat: 20.0009, lng: 72.0003 },
    },

    // Mechanical Block
    {
      name: "Mechanical Block Entrance",
      block: "Mechanical Block",
      floor: "Ground Floor",
      type: "common",
      description: "Main entrance for Mechanical Block",
      coords: { lat: 20.0026, lng: 72.0002 },
    },
    {
      name: "CAD Lab",
      block: "Mechanical Block",
      floor: "First Floor",
      type: "lab",
      description: "CAD lab for mechanical design",
      coords: { lat: 20.0027, lng: 72.0001 },
    },
    {
      name: "Fabrication Lab",
      block: "Mechanical Block",
      floor: "Second Floor",
      type: "lab",
      description: "Hands-on fabrication and prototyping lab",
      coords: { lat: 20.00265, lng: 72.0003 },
    },

    // AIML Block
    {
      name: "AIML Block Entrance",
      block: "AIML Block",
      floor: "Ground Floor",
      type: "common",
      description: "Entrance with displays and reception",
      coords: { lat: 20.0008, lng: 72.0025 },
    },
    {
      name: "AI Lab",
      block: "AIML Block",
      floor: "Ground Floor",
      type: "lab",
      description: "AI/ML lab with GPU workstations",
      coords: { lat: 20.0009, lng: 72.0027 },
    },
    {
      name: "Robo Space",
      block: "AIML Block",
      floor: "First Floor",
      type: "lab",
      description: "Robotics and automation lab",
      coords: { lat: 20.00095, lng: 72.00235 },
    },

    // Innovation Block
    {
      name: "Innovation Block Entrance",
      block: "Innovation Block",
      floor: "Ground Floor",
      type: "common",
      description: "Main entrance to Innovation Block",
      coords: { lat: 20.0024, lng: 72.0018 },
    },
    {
      name: "Smart Classroom 1",
      block: "Innovation Block",
      floor: "First Floor",
      type: "classroom",
      description: "Smart classroom with interactive board",
      coords: { lat: 20.0025, lng: 72.0019 },
    },

    // COE Block
    {
      name: "COE Block Entrance",
      block: "COE Block",
      floor: "Ground Floor",
      type: "common",
      description: "Entrance to the Exam Cell / COE Block",
      coords: { lat: 20.0018, lng: 72.0038 },
    },
    {
      name: "Exam Cell Office",
      block: "COE Block",
      floor: "Ground Floor",
      type: "office",
      description: "Exam cell and admin office",
      coords: { lat: 20.00185, lng: 72.00385 },
    },

    // Shared facilities
    {
      name: "Campus Café",
      block: "Common",
      floor: "Ground Floor",
      type: "facility",
      description: "Café and seating area",
      coords: { lat: 20.0012, lng: 72.0018 },
    },
    {
      name: "Playground",
      block: "Common",
      floor: "Ground Floor",
      type: "facility",
      description: "Outdoor playground and sports area",
      coords: { lat: 20.00135, lng: 72.0022 },
    },
  ];

  const created = await Location.create(locations);

  const find = (name) => created.find((loc) => loc.name === name)._id;

  const paths = [
    // Admin Block internal
    {
      from: find("Admin Block Entrance"),
      to: find("Reception / Security"),
      distance: 10,
      description: "Entrance to reception corridor",
      bidirectional: true,
    },
    {
      from: find("Reception / Security"),
      to: find("Admin Library"),
      distance: 15,
      description: "Corridor to library",
      bidirectional: true,
    },
    {
      from: find("Reception / Security"),
      to: find("CSE 1st Year (A)"),
      distance: 20,
      description: "Path to first-year CSE classroom",
      bidirectional: true,
    },
    {
      from: find("Reception / Security"),
      to: find("Auditorium"),
      distance: 25,
      description: "Stairs up to the auditorium",
      bidirectional: true,
    },
    {
      from: find("Auditorium"),
      to: find("2nd Year CSE (A)"),
      distance: 15,
      description: "Hall connecting auditorium to classrooms",
      bidirectional: true,
    },

    // Admin to Common
    {
      from: find("Reception / Security"),
      to: find("Campus Café"),
      distance: 30,
      description: "Walkway from admin reception to campus cafe",
      bidirectional: true,
    },

    // Campus general
    {
      from: find("Campus Café"),
      to: find("Playground"),
      distance: 35,
      description: "Outdoor path between cafe and playground",
      bidirectional: true,
    },

    // Connections to other blocks
    {
      from: find("Campus Café"),
      to: find("Mechanical Block Entrance"),
      distance: 60,
      description: "Walkway from cafe to mechanical block entrance",
      bidirectional: true,
    },
    {
      from: find("Campus Café"),
      to: find("AIML Block Entrance"),
      distance: 70,
      description: "Walkway from cafe to AIML block",
      bidirectional: true,
    },
    {
      from: find("Campus Café"),
      to: find("Innovation Block Entrance"),
      distance: 55,
      description: "Walkway from cafe to innovation block",
      bidirectional: true,
    },
    {
      from: find("Campus Café"),
      to: find("COE Block Entrance"),
      distance: 65,
      description: "Walkway from cafe to COE block",
      bidirectional: true,
    },

    // Mechanical internal
    {
      from: find("Mechanical Block Entrance"),
      to: find("CAD Lab"),
      distance: 20,
      description: "Path from mechanical entrance to CAD lab",
      bidirectional: true,
    },
    {
      from: find("CAD Lab"),
      to: find("Fabrication Lab"),
      distance: 25,
      description: "Internal stairs between labs",
      bidirectional: true,
    },

    // AIML internal
    {
      from: find("AIML Block Entrance"),
      to: find("AI Lab"),
      distance: 15,
      description: "Hallway to AI lab",
      bidirectional: true,
    },
    {
      from: find("AI Lab"),
      to: find("Robo Space"),
      distance: 20,
      description: "Stairs from AI lab to Robo Space",
      bidirectional: true,
    },

    // Innovation internal
    {
      from: find("Innovation Block Entrance"),
      to: find("Smart Classroom 1"),
      distance: 18,
      description: "Corridor to smart classroom",
      bidirectional: true,
    },

    // COE internal
    {
      from: find("COE Block Entrance"),
      to: find("Exam Cell Office"),
      distance: 12,
      description: "Short corridor to exam cell office",
      bidirectional: true,
    },
  ];

  await Path.create(paths);

  console.log("✅ Seed data created (locations + paths).");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
