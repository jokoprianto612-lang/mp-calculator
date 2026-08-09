# Sandbox Deployment Configuration

## Overview
Sandbox environments are ephemeral preview deployments created for each Pull Request to allow reviewers to test changes in a production-like environment.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                           │
│  PR Opened → Build Images → Deploy to Sandbox Namespace     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Namespace: pr-{number}-{branch-slug}                │   │
│  │                                                     │   │
│  │  ┌─────────────┐   ┌─────────────┐                  │   │
│  │  │ API Pod     │   │ Web Pod     │                  │   │
│  │  │ (1 replica) │   │ (1 replica) │                  │   │
│  │  └─────────────┘   └─────────────┘                  │   │
│  │                                                     │   │
│  │  ┌─────────────┐   ┌─────────────┐                  │   │
│  │  │ PostgreSQL  │   │ Redis       │                  │   │
│  │  │ (ephemeral) │   │ (ephemeral) │                  │   │
│  │  └─────────────┘   └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare DNS (Wildcard)                      │
│  *.pr-{number}.sandbox.mpcalculator.app → Ingress           │
└─────────────────────────────────────────────────────────────┘
```

## Sandbox Deployment Workflow

### GitHub Actions Workflow (`.github/workflows/sandbox.yml`)

```yaml
name: Sandbox Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main, develop]

env:
  REGISTRY: docker.io
  IMAGE_NAME_API: okongzinc/mp-calculator-api
  IMAGE_NAME_WEB: okongzinc/mp-calculator-web
  SANDBOX_DOMAIN: sandbox.mpcalculator.app

jobs:
  build-and-deploy-sandbox:
    name: Build & Deploy Sandbox
    runs-on: ubuntu-latest
    if: github.event.action != 'closed'
    timeout-minutes: 20
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate sandbox identifiers
        id: sandbox
        run: |
          PR_NUMBER=${{ github.event.pull_request.number }}
          BRANCH_SLUG=$(echo "${{ github.event.pull_request.head.ref }}" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]' | cut -c1-20)
          NAMESPACE="pr-${PR_NUMBER}-${BRANCH_SLUG}"
          HOST="pr-${PR_NUMBER}.${{ env.SANDBOX_DOMAIN }}"
          API_HOST="api.pr-${PR_NUMBER}.${{ env.SANDBOX_DOMAIN }}"
          
          echo "namespace=${NAMESPACE}" >> $GITHUB_OUTPUT
          echo "host=${HOST}" >> $GITHUB_OUTPUT
          echo "api_host=${API_HOST}" >> $GITHUB_OUTPUT
          echo "pr_number=${PR_NUMBER}" >> $GITHUB_OUTPUT

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.api
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_API }}:pr-${{ steps.sandbox.outputs.pr_number }}
          labels: |
            org.opencontainers.image.source=${{ github.repository }}
            org.opencontainers.image.revision=${{ github.sha }}
            sandbox.pr=${{ steps.sandbox.outputs.pr_number }}

      - name: Build and push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.web
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_WEB }}:pr-${{ steps.sandbox.outputs.pr_number }}
          labels: |
            org.opencontainers.image.source=${{ github.repository }}
            org.opencontainers.image.revision=${{ github.sha }}
            sandbox.pr=${{ steps.sandbox.outputs.pr_number }}

      - name: Configure kubectl
        uses: azure/k8s-set-context@v1
        with:
          kubeconfig: ${{ secrets.KUBECONFIG_SANDBOX }}

      - name: Create namespace
        run: |
          kubectl create namespace ${{ steps.sandbox.outputs.namespace }} --dry-run=client -o yaml | kubectl apply -f -

      - name: Create sandbox secrets
        run: |
          kubectl create secret generic mp-calculator-secrets \
            --namespace=${{ steps.sandbox.outputs.namespace }} \
            --from-literal=DATABASE_URL="postgresql://user:pass@postgres-${{ steps.sandbox.outputs.namespace }}:5432/mp_calculator" \
            --from-literal=REDIS_URL="redis://redis-${{ steps.sandbox.outputs.namespace }}:6379" \
            --from-literal=JWT_SECRET="${{ secrets.JWT_SECRET }}" \
            --from-literal=COOKIE_SECRET="${{ secrets.COOKIE_SECRET }}" \
            --from-literal=DEEPL_API_KEY="${{ secrets.DEEPL_API_KEY }}" \
            --dry-run=client -o yaml | kubectl apply -f -

      - name: Deploy PostgreSQL (ephemeral)
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: apps/v1
          kind: StatefulSet
          metadata:
            name: postgres
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            serviceName: postgres
            replicas: 1
            selector:
              matchLabels:
                app: postgres
            template:
              metadata:
                labels:
                  app: postgres
              spec:
                containers:
                - name: postgres
                  image: postgres:16-alpine
                  env:
                  - name: POSTGRES_DB
                    value: mp_calculator
                  - name: POSTGRES_USER
                    value: mp_calculator
                  - name: POSTGRES_PASSWORD
                    value: mp_calculator_sandbox
                  ports:
                  - containerPort: 5432
                  volumeMounts:
                  - name: postgres-data
                    mountPath: /var/lib/postgresql/data
                  resources:
                    requests:
                      memory: "128Mi"
                      cpu: "100m"
                    limits:
                      memory: "256Mi"
                      cpu: "250m"
            volumeClaimTemplates:
            - metadata:
                name: postgres-data
              spec:
                accessModes: ["ReadWriteOnce"]
                resources:
                  requests:
                    storage: 1Gi
          ---
          apiVersion: v1
          kind: Service
          metadata:
            name: postgres
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            ports:
            - port: 5432
              targetPort: 5432
            selector:
              app: postgres
          EOF

      - name: Deploy Redis (ephemeral)
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: redis
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            replicas: 1
            selector:
              matchLabels:
                app: redis
            template:
              metadata:
                labels:
                  app: redis
              spec:
                containers:
                - name: redis
                  image: redis:7-alpine
                  ports:
                  - containerPort: 6379
                  resources:
                    requests:
                      memory: "64Mi"
                      cpu: "50m"
                    limits:
                      memory: "128Mi"
                      cpu: "100m"
          ---
          apiVersion: v1
          kind: Service
          metadata:
            name: redis
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            ports:
            - port: 6379
              targetPort: 6379
            selector:
              app: redis
          EOF

      - name: Wait for databases
        run: |
          kubectl wait --for=condition=ready pod -l app=postgres -n ${{ steps.sandbox.outputs.namespace }} --timeout=120s
          kubectl wait --for=condition=ready pod -l app=redis -n ${{ steps.sandbox.outputs.namespace }} --timeout=60s

      - name: Run database migrations
        run: |
          kubectl run migrate-${{ steps.sandbox.outputs.pr_number }} \
            --image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME_API }}:pr-${{ steps.sandbox.outputs.pr_number }} \
            --namespace=${{ steps.sandbox.outputs.namespace }} \
            --restart=Never \
            --rm -i -- \
            pnpm db:migrate:deploy
            working-directory: /app/apps/api

      - name: Deploy API
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: mp-calculator-api
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            replicas: 1
            selector:
              matchLabels:
                app: mp-calculator-api
            template:
              metadata:
                labels:
                  app: mp-calculator-api
              spec:
                containers:
                - name: api
                  image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_API }}:pr-${{ steps.sandbox.outputs.pr_number }}
                  ports:
                  - containerPort: 3000
                  envFrom:
                  - configMapRef:
                      name: mp-calculator-config
                  - secretRef:
                      name: mp-calculator-secrets
                  resources:
                    requests:
                      memory: "128Mi"
                      cpu: "100m"
                    limits:
                      memory: "256Mi"
                      cpu: "250m"
                  livenessProbe:
                    httpGet:
                      path: /health
                      port: 3000
                    initialDelaySeconds: 30
                    periodSeconds: 10
                  readinessProbe:
                    httpGet:
                      path: /health
                      port: 3000
                    initialDelaySeconds: 5
                    periodSeconds: 5
          ---
          apiVersion: v1
          kind: Service
          metadata:
            name: mp-calculator-api
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            ports:
            - port: 3000
              targetPort: 3000
            selector:
              app: mp-calculator-api
          ---
          apiVersion: v1
          kind: ConfigMap
          metadata:
            name: mp-calculator-config
            namespace: ${{ steps.sandbox.outputs.namespace }}
          data:
            NODE_ENV: "development"
            LOG_LEVEL: "debug"
            CORS_ORIGIN: "https://${{ steps.sandbox.outputs.host }},https://${{ steps.sandbox.outputs.api_host }}"
            FRONTEND_URL: "https://${{ steps.sandbox.outputs.host }}"
          EOF

      - name: Deploy Web
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: mp-calculator-web
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            replicas: 1
            selector:
              matchLabels:
                app: mp-calculator-web
            template:
              metadata:
                labels:
                  app: mp-calculator-web
              spec:
                containers:
                - name: web
                  image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_WEB }}:pr-${{ steps.sandbox.outputs.pr_number }}
                  ports:
                  - containerPort: 80
                  resources:
                    requests:
                      memory: "64Mi"
                      cpu: "50m"
                    limits:
                      memory: "128Mi"
                      cpu: "100m"
          ---
          apiVersion: v1
          kind: Service
          metadata:
            name: mp-calculator-web
            namespace: ${{ steps.sandbox.outputs.namespace }}
          spec:
            ports:
            - port: 80
              targetPort: 80
            selector:
              app: mp-calculator-web
          EOF

      - name: Create Ingress
        run: |
          cat <<EOF | kubectl apply -f -
          apiVersion: networking.k8s.io/v1
          kind: Ingress
          metadata:
            name: mp-calculator-ingress
            namespace: ${{ steps.sandbox.outputs.namespace }}
            annotations:
              kubernetes.io/ingress.class: nginx
              cert-manager.io/cluster-issuer: letsencrypt-staging
              nginx.ingress.kubernetes.io/ssl-redirect: "true"
              nginx.ingress.kubernetes.io/proxy-body-size: "10m"
          spec:
            tls:
            - hosts:
              - ${{ steps.sandbox.outputs.host }}
              - ${{ steps.sandbox.outputs.api_host }}
              secretName: mp-calculator-tls
            rules:
            - host: ${{ steps.sandbox.outputs.host }}
              http:
                paths:
                - path: /
                  pathType: Prefix
                  backend:
                    service:
                      name: mp-calculator-web
                      port:
                        number: 80
            - host: ${{ steps.sandbox.outputs.api_host }}
              http:
                paths:
                - path: /
                  pathType: Prefix
                  backend:
                    service:
                      name: mp-calculator-api
                      port:
                        number: 3000
          EOF

      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/mp-calculator-api -n ${{ steps.sandbox.outputs.namespace }} --timeout=180s
          kubectl rollout status deployment/mp-calculator-web -n ${{ steps.sandbox.outputs.namespace }} --timeout=180s

      - name: Comment PR with sandbox URLs
        uses: actions/github-script@v7
        with:
          script: |
            const { host, api_host, pr_number } = ${{ toJson(steps.sandbox.outputs) }};
            const body = `## 🏗️ Sandbox Deployment Ready!\n\n**PR #${pr_number}**\n\n### URLs\n- **Frontend**: https://${host}\n- **API**: https://${api_host}\n- **API Docs**: https://${api_host}/docs\n\n### Info\n- Namespace: \`${{ steps.sandbox.outputs.namespace }}\`\n- Images: \`pr-${pr_number}\`\n- Auto-cleanup: 7 days after PR merge/close\n\n> ⚠️ This is a staging environment with test data. Do not use for production.`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });

  cleanup-sandbox:
    name: Cleanup Sandbox
    runs-on: ubuntu-latest
    if: github.event.action == 'closed'
    steps:
      - name: Generate sandbox identifiers
        id: sandbox
        run: |
          PR_NUMBER=${{ github.event.pull_request.number }}
          BRANCH_SLUG=$(echo "${{ github.event.pull_request.head.ref }}" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]' | cut -c1-20)
          NAMESPACE="pr-${PR_NUMBER}-${BRANCH_SLUG}"
          echo "namespace=${NAMESPACE}" >> $GITHUB_OUTPUT

      - name: Configure kubectl
        uses: azure/k8s-set-context@v1
        with:
          kubeconfig: ${{ secrets.KUBECONFIG_SANDBOX }}

      - name: Delete sandbox namespace
        run: |
          kubectl delete namespace ${{ steps.sandbox.outputs.namespace }} --ignore-not-found=true --wait=false
          echo "Sandbox namespace ${{ steps.sandbox.outputs.namespace }} deletion initiated"

      - name: Comment PR cleanup
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🧹 Sandbox environment cleaned up for PR #' + ${{ github.event.pull_request.number }}
            });
```

## DNS Configuration

### Cloudflare Setup
1. Create a wildcard DNS record: `*.sandbox.mpcalculator.app` → Load Balancer IP
2. Enable Cloudflare SSL/TLS (Full/Strict)
3. Configure cert-manager with Let's Encrypt staging for sandbox, production for prod

### Cert-manager ClusterIssuer
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@mpcalculator.app
    privateKeySecretRef:
      name: letsencrypt-staging-key
    solvers:
    - http01:
        ingress:
          class: nginx
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@mpcalculator.app
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Resource Limits for Sandbox

| Resource | API | Web | PostgreSQL | Redis |
|----------|-----|-----|------------|-------|
| CPU Request | 100m | 50m | 100m | 50m |
| CPU Limit | 250m | 100m | 250m | 100m |
| Memory Request | 128Mi | 64Mi | 128Mi | 64Mi |
| Memory Limit | 256Mi | 128Mi | 256Mi | 128Mi |
| Storage | - | - | 1Gi | - |

## Auto-cleanup Policy

- Sandboxes are automatically deleted when PR is closed/merged
- TTL: 7 days maximum (configured via Kubernetes namespace TTL controller)
- Manual cleanup: `kubectl delete namespace pr-{number}-{branch}`

## Testing in Sandbox

### Seed Test Data
```bash
# Run seed in sandbox
kubectl exec -it deploy/mp-calculator-api -n pr-{number}-{branch} -- pnpm db:seed
```

### Access Sandbox
```bash
# Port forward for local testing
kubectl port-forward -n pr-{number}-{branch} svc/mp-calculator-web 5173:80
kubectl port-forward -n pr-{number}-{branch} svc/mp-calculator-api 3000:3000
```

## Monitoring

- Grafana dashboard for sandbox namespace metrics
- Alert on sandbox deployment failures
- Log aggregation via Loki/Grafana