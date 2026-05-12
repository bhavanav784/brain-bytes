# Brain Bytes – Backend API

A RESTful backend for the Brain Bytes developer community platform.

## Tech Stack
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **bcryptjs** password hashing

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# 3. Start development server
npm run dev

# 4. Start production server
npm start
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/brainbytes` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |

---

## API Reference

### Auth  `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| GET | `/me` | Yes | Get current user |

**Register body:** `{ username, email, password, role? }`  
**Login body:** `{ email, password }`

---

### Users  `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List users (`?role=mentor&page=1&limit=20`) |
| GET | `/:id` | No | Get user profile |
| PUT | `/profile` | Yes | Update own profile |

**Update profile body:** `{ bio, skills, avatar, github }`

---

### Code Snippets  `/api/snippets`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List snippets (`?language=JavaScript`) |
| GET | `/:id` | No | Get single snippet |
| POST | `/` | Yes | Create snippet |
| PUT | `/:id` | Yes | Edit own snippet |
| DELETE | `/:id` | Yes | Delete own snippet |
| POST | `/:id/like` | Yes | Toggle like |
| POST | `/:id/bookmark` | Yes | Toggle bookmark |
| POST | `/:id/comments` | Yes | Add comment |

**Create/Update body:** `{ title, code, language, description }`

---

### Discussion Forum  `/api/forum`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List posts (`?tag=react&q=hooks`) |
| GET | `/:id` | No | Get post (increments views) |
| POST | `/` | Yes | Create post |
| POST | `/:id/answers` | Yes | Add answer |
| POST | `/:id/answers/:answerId/vote` | Yes | Vote on answer |
| POST | `/:id/answers/:answerId/accept` | Yes | Accept answer (author only) |

**Vote body:** `{ direction: "up" | "down" }`

---

### Projects  `/api/projects`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List projects (`?status=open`) |
| GET | `/:id` | No | Get project |
| POST | `/` | Yes | Create project |
| PUT | `/:id` | Yes | Update project (owner only) |
| POST | `/:id/invite` | Yes | Invite member by username |
| POST | `/:id/discussion` | Yes | Add discussion message |

**Invite body:** `{ username: "johndoe" }`  
**Status values:** `open | in-progress | completed`

---

### Problems  `/api/problems`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List problems (`?difficulty=easy`) |
| GET | `/:id` | No | Get problem with submissions |
| POST | `/` | Mentor | Create problem |
| POST | `/:id/submit` | Yes | Submit solution |
| PUT | `/:id/submissions/:subId/feedback` | Mentor | Add feedback |
| GET | `/user/:userId/solved` | Yes | Get solved problems for user |

**Submit body:** `{ code, language, explanation }`  
**Difficulty values:** `easy | medium | hard`

---

## User Roles
- **learner** – default role, can read and participate
- **developer** – can post snippets and projects
- **mentor** – can create problems and give feedback on submissions

## Authentication
All protected routes require the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```
