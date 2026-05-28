# AI Fitness Coach Chatbot

![Version](https://img.shields.io/badge/version-1.0-blue)
![Year](https://img.shields.io/badge/year-2026-green)

AI Fitness Coach Chatbot is a microservice-based fitness coaching platform that combines a React frontend, Node.js business services, and a .NET AI service. The system personalizes workout plans, supports AI chat, retrieves exercise and nutrition knowledge through RAG, and tracks user progress over time.

---

## Docker Setup Notes

### 1. Run with Docker

```bash
docker compose up -d --build
```

After all containers are running, use the API Gateway as the single backend entrypoint:

```text
http://localhost:7000
```

For the frontend, create `frontend/.env` from `frontend/.env.example`:

```env
VITE_AUTH_API_URL=http://localhost:7000
VITE_WORKOUT_API_URL=http://localhost:7000
VITE_SIGNALR_CHAT_URL=http://localhost:7000/hubs/chat
VITE_PROGRESS_API_URL=http://localhost:7000
```

### 2. Swagger URLs

Gateway Swagger URLs:

| Service | URL |
|---|---|
| Auth Service | http://localhost:7000/auth/swagger/index.html |
| AI Service | http://localhost:7000/ai/swagger/index.html |
| Node Service | http://localhost:7000/node/docs/ |

Direct service Swagger URLs:

| Service | URL |
|---|---|
| Auth Service | http://localhost:7001/swagger/index.html |
| AI Service | http://localhost:7002/swagger/index.html |
| Node Service | http://localhost:7003/api/v1/docs |

### 3. Import Qdrant Collections From Snapshots

To avoid embedding all exercises and meals again, restore the prepared Qdrant snapshots after Docker is running.

Required Qdrant collection names:

- `exercises`
- `meals`

Put snapshot files in:

```text
qdrant-snapshots/
```

This folder is mounted into the Qdrant container as:

```text
/qdrant/snapshots
```

Open Qdrant Dashboard:

```text
http://localhost:6333/dashboard
```

Recover/import the snapshots into the correct collection names: `exercises` and `meals`.

You can also recover by API. Example, if the snapshot files are named `exercises.snapshot` and `meals.snapshot`:

```bash
curl -X PUT "http://localhost:6333/collections/exercises/snapshots/recover" \
  -H "Content-Type: application/json" \
  -d "{\"location\":\"file:///qdrant/snapshots/exercises.snapshot\"}"

curl -X PUT "http://localhost:6333/collections/meals/snapshots/recover" \
  -H "Content-Type: application/json" \
  -d "{\"location\":\"file:///qdrant/snapshots/meals.snapshot\"}"
```

If your snapshot filenames are different, replace the filenames in the commands.

### 4. Mark Embeddings As Completed In MySQL

Because the Qdrant collections were imported manually, update the embedding status in MySQL. Otherwise the app may still think the records are `pending`.

```sql
USE `AI.Fitness.Coach.Service`;

UPDATE exercises
SET EmbedStatus = 'embedded'
WHERE EmbedStatus <> 'embedded';

UPDATE meals
SET embed_status = 'embedded'
WHERE embed_status <> 'embedded';
```

Notes:

- Only run these SQL updates after the Qdrant snapshot restore succeeds.
- Qdrant collection names must be exactly `exercises` and `meals`.
- If you do not import snapshots, keep the records as `pending` so the app can embed them normally.

---

## Project Team

This project is built by a 2-member team:

| Member | Main Work |
|---|---|
| [Nguyễn Phúc Đai](https://github.com/PhucDaizz) | .NET AI Service, API Gateway, Frontend |
| [Nguyễn Cao Thành Đạt](https://github.com/ThanhDatis) | Node Service, Frontend |

Main languages and technologies used: C#/.NET 8, JavaScript/Node.js, JavaScript/TypeScript/React, MongoDB, and MySQL.

### Tech Stack At A Glance

<p>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/CS.svg" width="42" height="42" alt="C#" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/DotNet.svg" width="42" height="42" alt=".NET" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NodeJS-Dark.svg" width="42" height="42" alt="Node.js" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/JavaScript.svg" width="42" height="42" alt="JavaScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="42" height="42" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="42" height="42" alt="React" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="42" height="42" alt="Tailwind CSS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MySQL-Dark.svg" width="42" height="42" alt="MySQL" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MongoDB.svg" width="42" height="42" alt="MongoDB" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Redis-Dark.svg" width="42" height="42" alt="Redis" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/RabbitMQ-Dark.svg" width="42" height="42" alt="RabbitMQ" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Docker.svg" width="42" height="42" alt="Docker" />
</p>

---

## Table Of Contents

1. [Project Overview](#1-project-overview)
2. [Goals](#2-goals)
3. [System Architecture](#3-system-architecture)
4. [Core Features](#4-core-features)
5. [Data And Knowledge Base](#5-data-and-knowledge-base)
6. [Tech Stack](#6-tech-stack)
7. [Repository Structure](#7-repository-structure)
8. [Development Notes](#8-development-notes)

---

## 1. Project Overview

AI Fitness Coach Chatbot is a personalized fitness platform powered by large language models, retrieval-augmented generation, and tool calling. Instead of giving generic workout advice, the system uses each user's profile, available equipment, schedule, injuries, and training history to generate practical workout plans.

The application supports both direct UI workflows and AI chat workflows. Users can ask questions, generate plans, inspect exercises, log workouts, and review progress. The AI service uses Qdrant as a vector database for semantic search, Redis for transient state, RabbitMQ for asynchronous jobs, and SignalR for realtime user notifications.

One important workflow is the async workout plan generator. Because plan generation can take several minutes, the API no longer blocks the user until the plan is complete. It creates a background job, stores status in Redis, publishes the job to RabbitMQ, and notifies the frontend through SignalR when the plan is ready.

---

## 2. Goals

### Technical Goals

- Build a microservice system with separate responsibilities for AI, business logic, and frontend.
- Integrate LLMs for chat, workout planning, nutrition support, and fitness calculations.
- Use RAG with Qdrant to ground answers in exercise and nutrition data.
- Use RabbitMQ and Redis for long-running background jobs and job status tracking.
- Provide realtime updates through SignalR.
- Keep the frontend responsive while expensive AI workflows run in the background.

### Product Goals

- Help users create personalized workout plans from their fitness profile.
- Provide an AI coach that can answer training and nutrition questions.
- Track workout progress, completed sessions, volume, streaks, and calendar activity.
- Support exercise discovery and nutrition lookup.
- Reduce waiting time by turning slow plan generation into a background workflow.

---

## 3. System Architecture

The system is composed of independent services connected through HTTP, RabbitMQ, Redis, SignalR, MongoDB, MySQL, and Qdrant.

| Component | Responsibility |
|---|---|
| **React Frontend** | Customer UI, admin UI, workout plan pages, chat, dashboard, realtime notifications. |
| **API Gateway** | Single entrypoint for frontend requests in Docker setup. |
| **Auth Service** | Authentication, authorization, user identity, JWT handling. |
| **Node Service** | User profile, workout plans, workout logs, analytics, and business data persistence. |
| **AI Service (.NET 8)** | AI chat, workout generation, RAG, embeddings, tool calling, background consumers, SignalR notifications. |
| **RabbitMQ** | Message broker for async jobs such as workout plan generation and embedding tasks. |
| **Redis** | Cache, chat history, online users, job status, temporary job token storage. |
| **Qdrant** | Vector database for exercise, meal, and chat memory retrieval. |
| **MySQL** | Relational storage for structured AI service data, seed data, and embedding status. |
| **MongoDB** | Document storage used by the Node service for workout/business data. |

### Async Workout Plan Flow

1. User requests a new workout plan from the frontend.
2. AI Service validates the request and checks whether the user already has a running generation job.
3. AI Service stores job status in Redis and publishes a RabbitMQ event.
4. `WorkoutPlanGenerationConsumer` processes the job in the background.
5. The worker builds historical context, generates a workout blueprint, executes week details, and saves the final plan through Node Service.
6. Redis status changes from `Pending` to `InProgress`, then `Completed` or `Failed`.
7. SignalR notifies the frontend when the job status changes.
8. The frontend shows a notification bell update when the plan is completed.

---

## 4. Core Features

### 4.1 Onboarding And Fitness Profile

The system collects user profile data used by the AI planner:

- Gender, date of birth, height, and weight.
- Fitness goal and current training level.
- Training environment: gym, home, or outdoor.
- Available equipment.
- Available workout days and preferred session duration.
- Injuries or physical limitations.

### 4.2 AI Workout Plan Generation

The AI planner generates personalized workout plans based on the user profile and historical context.

Key capabilities:

- Creates weekly or multi-week workout plans.
- Builds a high-level blueprint before generating detailed workout days.
- Uses exercise search and RAG to select appropriate movements.
- Supports retry logic for LLM/API failures during blueprint and week generation.
- Runs in the background through RabbitMQ so users do not wait for several minutes.
- Saves the completed plan through Node Service.
- Notifies the frontend through SignalR when the plan is ready.

### 4.3 AI Chat Coach

The chat coach supports training and nutrition conversations with contextual awareness.

Capabilities include:

- Streaming AI responses.
- RAG-based exercise explanations.
- Context from recent chat and user profile.
- Tool calling for actions such as workout plan operations, schedule support, nutrition lookup, fitness calculations, difficulty adjustment, and changing training goals.

### 4.4 Exercise Search And Knowledge Base

Users can browse and search exercises. The AI can also retrieve exercise context from Qdrant to answer technique and muscle-targeting questions more accurately.

### 4.5 Workout Tracking

Users can track training execution through:

- Workout plan calendar.
- Workout day details.
- Completed workout logs.
- Difficulty feedback.
- Streak and progress tracking.

### 4.6 Progress Dashboard

The dashboard provides:

- Current streak.
- Weekly session count.
- Total workout volume.
- Completion rate.
- Muscle volume breakdown.
- Activity heatmap.

### 4.7 Nutrition Support

The nutrition module supports:

- Meal and food lookup.
- Nutrition search.
- Calorie and macro guidance.
- AI-assisted TDEE and nutrition recommendations.

---

## 5. Data And Knowledge Base

### Exercise Data

The exercise dataset is built from structured seed data and enriched descriptions. It is stored in MySQL for relational access and embedded into Qdrant for semantic search.

Qdrant collection:

- `exercises`

Typical exercise fields:

- Name.
- Description.
- Category.
- Primary and secondary muscles.
- Equipment.
- Environment.
- Embedding status.

### Meal Data

Meal data is stored in MySQL and embedded into Qdrant for nutrition-related retrieval.

Qdrant collection:

- `meals`

Typical meal fields:

- Name.
- Calories.
- Protein.
- Carbohydrate.
- Fat.
- Cuisine or tags when available.

### Chat Memory

Recent chat history can be cached in Redis, while longer-term messages can be persisted and embedded for contextual retrieval.

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, JavaScript, TypeScript |
| AI Backend | .NET 8, C#, MediatR, Semantic Kernel |
| Business Backend | Node.js, JavaScript |
| Database | MySQL, MongoDB |
| Cache | Redis |
| Vector Database | Qdrant |
| Message Broker | RabbitMQ |
| Realtime | SignalR |
| LLM Providers | Gemini, OpenAI-compatible providers, Ollama/OpenRouter depending on configuration |
| Containerization | Docker Compose |

---

## 7. Repository Structure

```text
AI-Fitness-Coach/
├── AIService/          # .NET AI service: RAG, LLM, background jobs, SignalR
├── frontend/           # React frontend
├── qdrant-snapshots/   # Optional local Qdrant snapshot imports
├── docker-compose.yml  # Local multi-service setup
└── README.md
```

Depending on the branch/environment, additional service folders may exist for authentication, Node APIs, or shared infrastructure.

---

## 8. Development Notes

- Use the API Gateway (`http://localhost:7000`) for frontend `.env` values when running through Docker Compose.
- Restore Qdrant snapshots before marking embeddings as completed in MySQL.
- Do not mark embeddings as completed if the matching Qdrant collection has not been restored.
- Workout plan generation is asynchronous. The frontend should rely on job status and SignalR notifications instead of waiting for the initial request to complete the full plan.
- If SignalR is disconnected, the frontend can recover job status through `GET /api/WorkoutPlan/generate-jobs/latest`.
