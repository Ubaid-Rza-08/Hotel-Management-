# 🏨 Hotel Management System

<div align="center">

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.6-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EKS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)

**A production-grade, cloud-native hotel booking platform built with microservices architecture, deployed on AWS EKS with full CI/CD automation.**

[Live Demo](#) • [API Docs](#api-documentation) • [Architecture](#architecture) • [Getting Started](#getting-started)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Microservices](#microservices)
- [Tech Stack](#tech-stack)
- [Infrastructure](#infrastructure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Terraform IaC](#terraform-iac)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## 🌟 Overview

Hotel Management System is a full-stack, cloud-native application that provides a complete hotel booking experience — from hotel discovery and room selection to booking management and payment processing. Built using a **microservices architecture**, each service is independently deployable, scalable, and containerized.

The system is deployed on **AWS EKS** (Elastic Kubernetes Service) with automated deployments via **GitHub Actions CI/CD**, infrastructure provisioned through **Terraform**, and load-balanced through **AWS Elastic Load Balancers**.

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────────────────────┐
                          │              AWS EKS Cluster                 │
                          │                                              │
  User ──► ELB ──────────►│  ┌──────────┐    ┌─────────────────────┐   │
           (Port 80)      │  │ Frontend │    │   Auth Service       │   │
                          │  │  React   │    │   (Port 8080)        │   │
                          │  │  Nginx   │    └──────────────────────┘   │
                          │  └──────────┘                               │
                          │                  ┌─────────────────────┐   │
                          │                  │  Hotel Listing Svc   │   │
                          │  ┌────────────┐  │  (Port 8082)        │   │
                          │  │  Booking   │  └─────────────────────┘   │
                          │  │  Service   │                             │
                          │  │ (Port 8084)│  ┌─────────────────────┐   │
                          │  └────────────┘  │  Room Listing Svc    │   │
                          │                  │  (Port 8083)        │   │
                          │  ┌────────────┐  └─────────────────────┘   │
                          │  │  Payment   │                             │
                          │  │  Service   │  ┌─────────────────────┐   │
                          │  │ (Port 8085)│  │     Firebase         │   │
                          │  └────────────┘  │   (Firestore DB)    │   │
                          │                  └─────────────────────┘   │
                          └─────────────────────────────────────────────┘
                                        ▲
                          ┌─────────────┴───────────────┐
                          │     GitHub Actions CI/CD     │
                          │  Build → Push → Deploy       │
                          └─────────────────────────────┘
```

---

## 🔧 Microservices

### 1. 🔐 Auth Service `(Port 8080)`
Handles all authentication and authorization for the platform.
- JWT-based authentication (Access + Refresh tokens)
- Google OAuth2 integration
- User registration, login, OTP verification
- Role-based access control (ADMIN, USER)
- HTTP-only cookie token management

### 2. 🏨 Hotel Listing Service `(Port 8082)`
Manages hotel inventory and information.
- Hotel CRUD operations (Admin)
- Cloudinary image upload for hotel photos
- Hotel search and filtering
- Feign Client inter-service communication
- Multi-image support per hotel

### 3. 🛏️ Room Listing Service `(Port 8083)`
Manages room inventory within hotels.
- Room CRUD with multi-tier pricing
  - `BASE` — standard rate
  - `SINGLE_OCCUPANCY` — single guest rate
  - `DOUBLE_OCCUPANCY` — double guest rate
- Extra bed management
- Room availability tracking
- Real-time availability updates

### 4. 📅 Booking Service `(Port 8084)`
Core booking engine for the platform.
- Create, update, cancel bookings
- Date-based room availability checks
- Multi-room booking support
- Booking status management (PENDING, CONFIRMED, CANCELLED)
- Email notifications via SMTP
- Inter-service calls to Room & Auth services

### 5. 💳 Payment Service `(Port 8085)`
Handles all payment processing.
- Razorpay payment gateway integration
- Create payment orders
- Verify payment signatures
- Payment status tracking
- Webhook handling for payment events
- Refund management

---

## 💻 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** | Core programming language |
| **Spring Boot 3.5.6** | Microservices framework |
| **Spring Security** | Authentication & authorization |
| **Spring Cloud OpenFeign** | Inter-service HTTP communication |
| **Spring Mail** | Email notifications |
| **JWT (jjwt)** | Token-based auth |
| **Firebase Admin SDK** | Firestore NoSQL database |
| **Cloudinary** | Image storage & CDN |
| **Razorpay** | Payment gateway |
| **Swagger / OpenAPI 3** | API documentation |
| **ModelMapper** | DTO mapping |
| **Lombok** | Boilerplate reduction |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **Nginx** | Production web server |
| **Axios** | HTTP client |
| **React Router v6** | Client-side routing |

### Database
| Technology | Purpose |
|---|---|
| **Firebase Firestore** | Primary NoSQL database for all services |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Local multi-container orchestration |
| **Kubernetes** | Container orchestration |
| **AWS EKS** | Managed Kubernetes on AWS |
| **AWS ELB** | Load balancing (6 LoadBalancers) |
| **GitHub Actions** | CI/CD pipeline |
| **Terraform** | Infrastructure as Code |
| **eksctl** | EKS cluster management CLI |
| **Docker Hub** | Container image registry |

---

## 🏗️ Infrastructure

### AWS EKS Setup
- **Cluster:** `hello-hotel` on `ap-south-1` (Mumbai)
- **Node Type:** `m7i-flex.large` (2 vCPU, 8GB RAM)
- **Node Count:** 2 nodes (auto-scales 1–3)
- **Kubernetes Version:** 1.34
- **AMI:** Amazon Linux 2023

### Load Balancers (AWS ELB)
Each service gets its own AWS Elastic Load Balancer:

| Service | Port | Type |
|---|---|---|
| Frontend | 80 | Public LoadBalancer |
| Auth Service | 8080 | Public LoadBalancer |
| Hotel Listing | 8082 | Public LoadBalancer |
| Room Listing | 8083 | Public LoadBalancer |
| Booking Service | 8084 | Public LoadBalancer |
| Payment Service | 8085 | Public LoadBalancer |

### Kubernetes Resources
- **Namespace:** `hotel-management`
- **Deployments:** 6 (one per service)
- **Services:** 6 LoadBalancer services
- **ConfigMaps:** 1 (shared config)
- **Secrets:** 2 (`hotel-secrets`, `firebase-secret`)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
# Required
Java 21+
Maven 3.9+
Node.js 20+
Docker Desktop
Git

# For cloud deployment
AWS CLI
kubectl
eksctl
Terraform >= 1.3.0
```

### Clone the Repository

```bash
git clone https://github.com/ubaidrza/Hotel-Management-.git
cd Hotel-Management-
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_KEY_PATH=/app/firebase-service-account.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Also place your `firebase-service-account.json` in the root directory.

---

## 🐳 Docker Setup

### Run Locally with Docker Compose

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Services will be available at:
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Auth Service | http://localhost:8080 |
| Hotel Listing | http://localhost:8082 |
| Room Listing | http://localhost:8083 |
| Booking Service | http://localhost:8084 |
| Payment Service | http://localhost:8085 |

### Build & Push Images to Docker Hub

```bash
# Build all images
docker compose build

# Tag images
docker tag ubaidrza/mmv3-auth:latest ubaidrza/mmv3-auth:latest
docker tag ubaidrza/mmv3-hotel-listing-service:latest ubaidrza/mmv3-hotel-listing-service:latest
docker tag ubaidrza/mmv3-room-listing-service:latest ubaidrza/mmv3-room-listing-service:latest
docker tag ubaidrza/mmv3-booking-service:latest ubaidrza/mmv3-booking-service:latest
docker tag ubaidrza/mmv3-payment-service:latest ubaidrza/mmv3-payment-service:latest
docker tag ubaidrza/mmv3-frontend:latest ubaidrza/mmv3-frontend:latest

# Push all
docker push ubaidrza/mmv3-auth:latest
docker push ubaidrza/mmv3-hotel-listing-service:latest
docker push ubaidrza/mmv3-room-listing-service:latest
docker push ubaidrza/mmv3-booking-service:latest
docker push ubaidrza/mmv3-payment-service:latest
docker push ubaidrza/mmv3-frontend:latest
```

---

## ☸️ Kubernetes Deployment

### Option 1 — Using eksctl

```bash
# Create EKS cluster with nodes
eksctl create cluster \
  --name hello-hotel \
  --region ap-south-1 \
  --node-type m7i-flex.large \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed

# Connect kubectl
aws eks update-kubeconfig --region ap-south-1 --name hello-hotel

# Deploy all services
kubectl apply -f k8s/common/
kubectl apply -f k8s/auth/
kubectl apply -f k8s/hotel/
kubectl apply -f k8s/room/
kubectl apply -f k8s/booking/
kubectl apply -f k8s/payment/
kubectl apply -f k8s/frontend/

# Check status
kubectl get pods -n hotel-management
kubectl get svc -n hotel-management
```

### Option 2 — Using Terraform

```bash
cd terraform/

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Create cluster (~15 minutes)
terraform apply

# Connect kubectl
aws eks update-kubeconfig --region ap-south-1 --name hello-hotel
```

### Kubernetes Folder Structure

```
k8s/
├── common/
│   ├── namespace.yml
│   └── configmap.yml
├── auth/
│   ├── deployment.yml
│   └── service.yml
├── hotel/
│   ├── deployment.yml
│   └── service.yml
├── room/
│   ├── deployment.yml
│   └── service.yml
├── booking/
│   ├── deployment.yml
│   └── service.yml
├── payment/
│   ├── deployment.yml
│   └── service.yml
└── frontend/
    ├── deployment.yml
    └── service.yml
```

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflow

Every `git push` to `main` automatically:

```
Push to main
     │
     ▼
┌─────────────────────────┐
│   Build & Push Images    │
│  ┌─────────────────┐    │
│  │ Build auth       │    │
│  │ Build hotel      │    │
│  │ Build room       │    │
│  │ Build booking    │    │
│  │ Build payment    │    │
│  │ Build frontend   │    │
│  └─────────────────┘    │
│   Push to Docker Hub     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    Deploy to EKS         │
│  ┌─────────────────┐    │
│  │ Configure AWS    │    │
│  │ Apply Secrets    │    │
│  │ Apply Firebase   │    │
│  │ Deploy Services  │    │
│  │ Wait for Rollout │    │
│  │ Print URLs       │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `JWT_SECRET` | JWT signing secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full JSON content of service account |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `MAIL_USERNAME` | Gmail address |
| `MAIL_PASSWORD` | Gmail app password |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `FRONTEND_URL` | Public frontend URL |
| `VITE_AUTH_API` | Auth service public URL |
| `VITE_HOTEL_API` | Hotel service public URL |
| `VITE_ROOM_API` | Room service public URL |
| `VITE_BOOKING_API` | Booking service public URL |
| `VITE_PAYMENT_API` | Payment service public URL |

---

## 🏗️ Terraform IaC

The `terraform/` directory contains Infrastructure as Code to provision the entire AWS EKS cluster.

```
terraform/
├── main.tf          ← VPC + EKS cluster + Node Group
├── variables.tf     ← Configurable inputs
├── outputs.tf       ← Cluster endpoint, kubeconfig command
└── terraform.tfvars ← Your values (gitignored)
```

```bash
# Deploy infrastructure
terraform init
terraform plan
terraform apply

# Destroy everything (stop AWS charges)
terraform destroy
```

---

## 📁 Project Structure

```
Hotel-Management/
├── .github/
│   └── workflows/
│       └── ci-cd-eks.yml         ← GitHub Actions pipeline
│
├── Auth/                          ← Auth microservice (Port 8080)
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── hotel-listing-service/         ← Hotel service (Port 8082)
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── room-listing-service/          ← Room service (Port 8083)
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── booking-service/               ← Booking service (Port 8084)
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── payment-service/               ← Payment service (Port 8085)
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── booking-pro/                   ← React frontend (Port 3000)
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── k8s/                           ← Kubernetes manifests
│   ├── common/
│   ├── auth/
│   ├── hotel/
│   ├── room/
│   ├── booking/
│   ├── payment/
│   └── frontend/
│
├── terraform/                     ← Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── docker-compose.yml             ← Local development
├── docker-compose.prod.yml        ← Production compose
├── .env                           ← Environment variables (gitignored)
├── firebase-service-account.json  ← Firebase credentials (gitignored)
└── README.md
```

---

## 📖 API Documentation

Each service exposes Swagger UI when running:

| Service | Swagger URL |
|---|---|
| Auth | http://localhost:8080/swagger-ui.html |
| Hotel Listing | http://localhost:8082/swagger-ui.html |
| Room Listing | http://localhost:8083/swagger-ui.html |
| Booking | http://localhost:8084/swagger-ui.html |
| Payment | http://localhost:8085/swagger-ui.html |

---

## 🔒 Security

- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- HTTP-only cookies for token storage
- Spring Security with role-based access control
- Firebase service account stored as Kubernetes Secret
- All sensitive values stored in GitHub Secrets / K8s Secrets
- CORS configured per service

---

## 👨‍💻 Author

**Mo. Ubaid Rza**
- Java/Spring Boot Developer
- GitHub: [@ubaidrza](https://github.com/ubaidrza)

---

<div align="center">

⭐ **Star this repo if you found it helpful!** ⭐

</div>
