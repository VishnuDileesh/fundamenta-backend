#!/bin/bash
set -e

# ============================
# Configuration
# ============================
PROJECT_ID="fundamenta-backend"                           # GCP project ID
REGION="asia-south1"                                      # Cloud Run / Artifact Registry region
REPO="fundamenta-backend-repository"                     # Artifact Registry repo
IMAGE_NAME="fundamenta-backend-image"                    # Image name
PLATFORM="linux/amd64"                                   # Build platform

FULL_IMAGE_PATH="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$IMAGE_NAME"

# ============================
# Build Docker image locally
# ============================
echo "🔨 Building Docker image..."
docker buildx create --use --name localbuilder || true
docker buildx inspect localbuilder --bootstrap
docker buildx build --platform $PLATFORM -t $IMAGE_NAME . --load

# ============================
# Tag for Artifact Registry
# ============================
echo "🏷 Tagging image for Artifact Registry..."
docker tag $IMAGE_NAME $FULL_IMAGE_PATH

# ============================
# Push to Artifact Registry
# ============================
echo "🚀 Pushing image to Artifact Registry..."
docker push $FULL_IMAGE_PATH

# ============================
# Deploy to Cloud Run
# ============================
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME \
  --image $FULL_IMAGE_PATH \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "✅ Deployment complete!"
