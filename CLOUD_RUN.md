# 🚀 Deploying DataForge BDH Lab to Google Cloud Run

This guide outlines the production deployment strategy for **DataForge BDH Lab** on **Google Cloud Run**, built by senior Cloud & System architects.

---

## 📋 Prerequisites
1. **Google Cloud Project** with billing enabled.
2. [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
3. Enabled GCP APIs: `run.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`.

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

---

## ⚡ Option 1: One-Command Source-to-Deployment (Recommended)

Google Cloud Run supports direct source deployments via Cloud Build:

```bash
gcloud run deploy dataforge-bdh-lab \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --set-env-vars NODE_ENV=production
```

---

## 📦 Option 2: Build & Push Container to Artifact Registry

### Step 1: Create Artifact Registry Repository
```bash
gcloud artifacts repositories create bdh-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for BDH Lab"
```

### Step 2: Build and Tag Image via Cloud Build
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/bdh-repo/dataforge-bdh-lab:v1
```

### Step 3: Deploy Image to Cloud Run
```bash
gcloud run deploy dataforge-bdh-lab \
  --image us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/bdh-repo/dataforge-bdh-lab:v1 \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production
```

---

## 🔍 Verification & Health Checks

Once deployed, Cloud Run will output a public URL (e.g. `https://dataforge-bdh-lab-xyz-uc.a.run.app`).

### Verify Endpoints:
- **Application UI**: `https://YOUR_SERVICE_URL/`
- **Health Check Probe**: `https://YOUR_SERVICE_URL/health`
- **API Metadata Info**: `https://YOUR_SERVICE_URL/api/info`

---

## 🛡️ Production Architecture Features
- **Stateless & Scalable**: Scales automatically from 0 to 10+ instances in response to traffic spikes.
- **Graceful Shutdown**: Listens to `SIGTERM` signals for clean connection teardown during scaling events.
- **Sub-100ms Cold Starts**: Single bundled `dist/server.cjs` and lightweight Alpine container.
- **Built-in Security Headers**: Pre-configured HTTP security headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`).
