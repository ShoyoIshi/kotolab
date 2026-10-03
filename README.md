
# KotoLab (言葉Lab) ⛩️

> **A Foundational Prototype & Experimentation Workspace for AI-Assisted Japanese Pragmatics.**  
> *Developed in support of a MEXT 2027 Master's Research Proposal.*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite/PostgreSQL](https://img.shields.io/badge/Database-SQLite%2FPostgres-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

---

## 📌 Overview & MEXT Research Alignment

**KotoLab** is an interactive web-based learning platform. Currently functioning as a **Phase 1 Minimum Viable Product (MVP)** for foundational Japanese (JLPT N5), the underlying hybrid microservice architecture was specifically engineered to scale into an advanced N3/N2 professional pragmatics tutor.

This codebase serves as the technical infrastructure for my graduate research proposal, temporarily titled *"Digital Sensei."* During my Master's research, this architecture will be upgraded to integrate **Retrieval-Augmented Generation (RAG)** and **Bayesian Knowledge Tracing (BKT)** to bridge the gap between classroom Japanese (*Kyōkasho no Nihongo*) and workplace Japanese (*Genba no Nihongo*).

---

## ✨ System Architecture (Current & Proposed)


[ Learner UI (React/TS + Tailwind) ]
│
▼ (REST API)
[ Express.js Gateway Service ]
├── [ Authentication & Session Routing ]
├── [ Python Microservice (Staging for RAG/MeCab) ]
└── [ Database Intermediary ]
│
▼
[ Relational DB (Users, Scenarios, Telemetry) ]

🛠️ Tech Stack
Frontend Architecture
Framework: React.js / Next.js with TypeScript
Styling: Tailwind CSS
State & UI: Lucide Icons, Framer Motion

Backend & NLP Infrastructure (Phase 1 & Staging)
API Gateway: Express.js (Node.js)
AI Microservice: Python 3 (Staging for LangChain/LlamaIndex)
Knowledge Store Concept: Open Knowledge Format (OKF) JSON bundles
Database: SQL (Relational modeling for user sessions)

🚀 Getting Started
Prerequisites
Node.js: v18.x or higher

Python: 3.10+ (for backend microservices)

1.Installation
Clone the repository:

Bash
git clone https://github.com/ShoyoIshi/kotolab.git
cd kotolab

2.Install Frontend Dependencies:

Bash
cd client
npm install

Install Backend Dependencies:

Bash
cd ../server
npm install

# For Python Microservice
cd python_engine
pip install -r requirements.txt
Run Development Servers:

Bash
# Start Backend (Terminal 1)
cd server
npm run dev

# Start Frontend (Terminal 2)
cd client
npm start

📂 Directory Structure
Plaintext
kotolab/
├── client/                 # React Frontend & PWA Wrapper
│   ├── public/             # Static Assets
│   └── src/
│       ├── components/     # UI components (Dashboard, Wireframes)
│       ├── pages/          # Application views
│       └── styles/         # Tailwind CSS configs
├── server/                 # Express.js API Gateway
│   ├── config/             # Environment setup
│   ├── controllers/        # Route logic
│   └── routes/             # API Endpoints
├── python_engine/          # Python AI Microservice (Staging)
│   ├── rag_retriever.py    # RAG pipeline logic (In Dev)
│   └── bkt_model.py        # Bayesian Analytics (In Dev)
└── README.md

Research & Development Roadmap
[x] Phase 1: Core UI/UX, Authentication, and Relational Database Schema setup (MVP Complete).
[x] Phase 1: Express.js and Python hybrid routing established.
[ ] Phase 2 (Proposed Graduate Research): Integration of RAG & OKF Sector Bundles for Honorific (Keigo) grounding.
[ ] Phase 2 (Proposed Graduate Research): Implementation of Bayesian Knowledge Tracing (BKT) adaptive scaffolding.
[ ] Phase 3 (Proposed Graduate Research): Speech Recognition & SSML Audio Feedback integration.


GitHub: @ShoyoIshi
Research Interests: Natural Language Processing (NLP), Computer-Assisted Language Learning (CALL), Educational Data Mining
