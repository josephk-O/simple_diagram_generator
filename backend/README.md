
# 🧠 n8n Backend Workflow – Simple Diagram Generator

This Folder contains the **n8n Backend workflow** that automates diagram generation based on text prompts.

## 🚀 Quick Start

1. Clone the repo

2. Build and run with Docker Compose:

   ```bash
   docker compose up -d
   ```

3. Open n8n in your browser:
   👉 [http://localhost:5678](http://localhost:5678)

   **Login:**

   * Username: `admin`
   * Password: `admin123`

4. The included workflow (`simpDrawGen.json`) is auto-imported at startup 

## 🧱 Project Structure

| File                 | Description                               |
| -------------------- | ----------------------------------------- |
| `Dockerfile`         | Custom image to auto-import the workflow  |
| `docker-compose.yml` | Spins up n8n with persistence             |
| `simpDrawGen.json`   | The n8n workflow definition               |
| `n8n_data/`          | Local persistent storage (ignored in Git) |

## 💾 Data Persistence

All workflows and credentials are stored in `./n8n_data`.


