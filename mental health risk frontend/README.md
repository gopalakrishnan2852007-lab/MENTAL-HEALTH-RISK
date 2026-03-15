# MindGuard AI - Student Mental Health Early Warning System

An AI-driven platform for tracking student well-being, analyzing stress indicators, and providing early warnings for depression, anxiety, or burnout to school counselors.

![Counselor Dashboard UI](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6) *(Placeholder Image)*

## Features
- **Counselor Dashboard:** Monitor campus-wide stress trends and high priority students.
- **Digital Exhaust Analysis:** Simulates tracking of late-night logins and missed assignments to model invisible stress.
- **Anonymous Chatbot Check-in:** A secure area for students to log mood or find resources.
- **Intervention Action Plans:** Context-aware strategies generated for high-risk students.

## Backend Setup (Node.js/Express)
1. Navigate to `/mental health risk backend`
2. Run `npm install`
3. Make sure you have a `DATABASE_URL` for PostgreSQL set up in `.env` if utilizing real persistence. 
4. Run `npm run start` (Server runs on port 10000).

## Frontend Setup (React/Vite)
1. Navigate to `/mental health risk frontend`
2. Run `npm install`
3. Run `npm run dev`
