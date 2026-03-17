# Smart Campus Navigation System

The **Smart Campus Navigation System** is a full-stack web application developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) to solve navigation challenges in large and complex campus environments by providing an intelligent, interactive mapping solution. The system is built on a **custom-designed campus consisting of five major blocks: Admin Block, AIML Block, Mechanical Block, Innovation Block, and COE (Exam Cell) Block, each having three floors with lifts, staircases, and a square structure with a central inner OAT (open courtyard)**. The **Admin Block ground floor** contains entrance, reception/office, principal room, dean room, workspace, library, cashier place, café, placement cell, restrooms on both sides, and classrooms for 1st year CCE (A, B, C) and 1st year CSBS (A, B, C); the **first floor** includes an auditorium, restrooms on both sides, CSE department staff rooms, classrooms for 1st year CSE (A, B, C), 1st year ECE (A, B, C), 1st year Cybersecurity (A, B, C), two labs (CSE Lab and ECE Lab), two workspaces, and classrooms for 2nd year CSE, ECE, and Cybersecurity (A, B, C); the **second floor** includes ECE department, Cybersecurity department, CCE and CSBS departments, classrooms for 3rd and 4th year CSE, ECE, and Cybersecurity (A, B, C), labs including Cyber Lab, CSE Lab, and ECE Lab, two workspaces, and restrooms on opposite sides. Near the Admin Block there is a café and amenity area followed by the **Mechanical Block**, which also has three floors where one floor contains the Mechanical department, staff rooms, and seven labs such as CAD and fabrication labs; another floor contains 1st and 2nd year classrooms (A, B, C) along with two labs and one maker space; and the third floor includes 3rd and 4th year classrooms (A, B, C), two auditoriums, two labs, and restrooms, with a playground located nearby. After the playground is the **AIML Block**, which has a ground floor with entrance sofas, TVs, and robots, AIML department on one side and AIDS department opposite, along with four labs (AI Lab, Robo Space, Data Science Lab, and an additional lab), restrooms, lift, and staircase; the first floor includes classrooms for 1st and 2nd year AIML and AIDS (A, B, C), two labs (Machine Learning Lab and Special Lab), one maker space and one ignite workspace, and restrooms; the second floor includes classrooms for 3rd and 4th year AIML and AIDS (A, B, C), four labs, one maker space, Synapse Studio, Collaboration Studio, AI Studio, ML Studio, and seating areas, with a canteen (amenity area) nearby and a separate two-floor store building having a stationery shop on the ground floor and a merch shop on the first floor. The **Innovation Block ground floor** contains placement cell, admin room, network/Wi-Fi room, Physics, Maths, and Chemistry departments, restrooms, lift, staircase, and 3–4 open workspaces; the first floor includes 10–15 smart classrooms with smart boards, labs, workspaces, auditoriums, interview halls, and restrooms placed on opposite sides; the second floor includes 7–8 interview halls, guest rooms, 4–5 auditoriums, innovation studios, and restrooms. The **COE (Exam Cell) Block ground floor** contains entrance waiting area with sofas, exam cell office, admin space, and classrooms; the first floor includes CEO room, Centre of Examination room, head office room, two classrooms, and two auditoriums; and the second floor includes storage rooms for answer sheets and question papers, three discussion rooms, and one projector room. The overall campus also includes an outer OAT at the front, a cultural stage at the back, a stadium-like area, separate restroom building, vending machines, direction boards in each block, and open spaces. The system uses an interactive map powered by **Leaflet** (optionally enhanced with **Mapbox** tiles) to display all these locations as markers, allowing users to search any room, department, or facility and select a source and destination. The backend models this entire campus as a graph where each room, lab, and facility is a node and pathways between them are edges with distances, and implements Dijkstra’s algorithm to compute the shortest path for efficient navigation. All data is stored in MongoDB and accessed through Express and Node.js APIs, and an admin module allows dynamic addition, updating, and deletion of locations and paths, making the system scalable and flexible. The final output is an interactive map showing the shortest route between selected points along with distance, transforming a complex campus into an intelligent, user-friendly navigation system.

## Getting Started

### 1) Backend (Express + MongoDB)
1. From the project root, open a terminal in `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (or copy `.env.example`) and set `MONGO_URI`:
   ```bash
   cp .env.example .env
   # edit .env to point at your MongoDB instance
   ```
4. Seed the database with sample locations and paths (optional but recommended):
   ```bash
   npm run seed
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

### 2) Frontend (React + Leaflet)
1. In a separate terminal, go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) If your backend is not running on `http://localhost:5000`, create a `.env` file with:
   ```bash
   VITE_BACKEND_URL=http://localhost:5000
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

### 3) View the App
Open the URL shown by Vite (typically `http://localhost:5173`) to see the map, markers, and routing playground.
