# Lab 02: Express and Mongoose

This lab introduces an Express service backed by Mongoose models for the Smart Campus service
request system. Part of [web-systems-lab](../../README.md).

## Data model

### Categories

| Field                    | Type   | Constraints                                |
| ------------------------ | ------ | ------------------------------------------ |
| `name`                   | String | Required, trimmed, unique, 2-50 characters |
| `description`            | String | Trimmed, at most 200 characters            |
| `createdAt`, `updatedAt` | Date   | Managed by Mongoose timestamps             |

### Users

| Field                    | Type   | Constraints                                                |
| ------------------------ | ------ | ---------------------------------------------------------- |
| `name`                   | String | Required, trimmed, 2-100 characters                        |
| `email`                  | String | Required, trimmed, lowercased, unique, simple email format |
| `role`                   | String | `student`, `staff`, or `admin`; defaults to `student`      |
| `createdAt`, `updatedAt` | Date   | Managed by Mongoose timestamps                             |

### Service requests

| Field                    | Type     | Constraints                                                        |
| ------------------------ | -------- | ------------------------------------------------------------------ |
| `requester`              | ObjectId | Required reference to `User`                                       |
| `category`               | ObjectId | Required reference to `Category`                                   |
| `description`            | String   | Required, trimmed, 10-1000 characters                              |
| `priority`               | String   | `low`, `medium`, or `high`; defaults to `medium`                   |
| `status`                 | String   | `Open`, `In Progress`, `Resolved`, or `Closed`; defaults to `Open` |
| `createdAt`, `updatedAt` | Date     | Managed by Mongoose timestamps                                     |

The `ServiceRequest` collection has a compound index on `{ category: 1, status: 1 }` for
aggregation queries. Unique constraints are enforced by MongoDB indexes, not by validation.

## Run and test

```powershell
npm install
Copy-Item .env.example .env
```

Copy `.env.example` to `.env` and set `MONGODB_URI` before starting the server. `PORT` defaults
to `3000`.

```powershell
npm start
npm run dev
npm test
npm run lint
npm run format:check
```
