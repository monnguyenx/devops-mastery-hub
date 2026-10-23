import { LabBlueprint } from '../types';

export const LAB_BLUEPRINTS: LabBlueprint[] = [
  {
    id: 'lab-docker-hardened',
    pillar: 'k8s-containers',
    title: 'Dockerfile Multi-stage & Non-Root Hardened Template',
    tag: 'Container Security & Optimization',
    description: 'Khuôn mẫu Dockerfile tối ưu kích thước từ 1.2GB xuống dưới 60MB, chạy bằng non-root user (UID 10001), tích hợp init process (tini) để dọn zombie process.',
    productionWhy: 'Chạy container bằng root UID 0 là lỗ hổng bảo mật nghiêm trọng (container escape). Đồng thời không có PID 1 init process sẽ khiến container tích tụ tiến trình zombie (defunct processes).',
    filename: 'Dockerfile.production',
    language: 'dockerfile',
    code: `# STAGE 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Tận dụng triệt để Docker Layer Caching: Chỉ copy file dependencies trước
COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build && npm prune --production

# STAGE 2: Production Distroless / Hardened Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Cài đặt dumb-init hoặc tini để làm PID 1 xử lý tín hiệu SIGTERM và dọn zombie processes
RUN apk add --no-cache dumb-init

# Tạo user không đặc quyền (non-root) với UID cố định
RUN addgroup -g 10001 -S appgroup && \\
    adduser -u 10001 -S appuser -G appgroup

# Copy duy nhất các artifact cần thiết từ stage builder
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

# Chuyển quyền thực thi sang non-root user
USER 10001

EXPOSE 3000
ENV NODE_ENV=production

# Dùng dumb-init làm entrypoint để truyền đúng tín hiệu hệ điều hành
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]`,
    testInstructions: 'Chạy lệnh build: `docker build -t my-hardened-app .` và kiểm tra user: `docker run --rm my-hardened-app id` -> Output sẽ hiển thị uid=10001 (không phải root uid 0).'
  },
  {
    id: 'lab-k8s-zero-downtime',
    pillar: 'k8s-containers',
    title: 'Kubernetes Zero-Downtime Deployment & PodDisruptionBudget (PDB)',
    tag: 'Production Reliability',
    description: 'Cấu hình hoàn chỉnh cho một microservice với preStop hook 5s chống lỗi 502, Readiness/Liveness/Startup probes, Anti-affinity đa vùng và PDB bảo vệ khi cluster autoscaler drain node.',
    productionWhy: '90% sự cố gián đoạn dịch vụ khi release trong K8s xuất phát từ việc thiếu preStop hook, probe cấu hình sai hoặc thiếu PDB khi nhà cung cấp Cloud nâng cấp K8s version.',
    filename: 'production-deployment.yaml',
    language: 'yaml',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  namespace: production
  labels:
    app.kubernetes.io/name: api-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # Cho phép sinh thêm 25% pod mới trước khi hạ pod cũ
      maxUnavailable: 0     # Luôn bảo đảm 100% dung lượng sẵn sàng
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      # Phân tán Pod đều trên các Availability Zone khác nhau để chống sập data center
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: api-service
      containers:
        - name: app
          image: registry.example.com/api-service:v2.4.1
          lifecycle:
            preStop:
              exec:
                # Đợi 5s cho Endpoints/Ingress gỡ IP trước khi app tắt
                command: ["/bin/sh", "-c", "sleep 5"]
          terminationGracePeriodSeconds: 35
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 512Mi
          # Startup probe dành riêng cho lúc app khởi động chậm (load DB pool/cache)
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            failureThreshold: 30
            periodSeconds: 2
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 2
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
            failureThreshold: 3
---
# PodDisruptionBudget: Ngăn cản Kubelet drain node nếu làm số pod sẵn sàng < 2
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-service-pdb
  namespace: production
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: api-service`,
    testInstructions: 'Deploy manifest vào cluster minikube/k3s: `kubectl apply -f production-deployment.yaml`. Test rolling update không downtime bằng cách chạy script curl liên tục trong lúc apply image mới.'
  },
  {
    id: 'lab-tf-remote-backend',
    pillar: 'iac-terraform',
    title: 'Terraform Production State Backend (AWS S3 + DynamoDB Lock)',
    tag: 'IaC Concurrency & Safety',
    description: 'Thiết lập remote state bảo mật mã hóa AES-256, versioning để khôi phục khi state bị hỏng và DynamoDB table để khóa chống xung đột ghi đồng thời.',
    productionWhy: 'Nếu 2 kỹ sư hoặc 2 pipeline cùng chạy `terraform apply` một lúc mà không có cơ chế Locking, state file sẽ bị race condition dẫn đến hư hỏng hoàn toàn (corrupted state).',
    filename: 'backend-setup.tf',
    language: 'hcl',
    code: `# 1. Tạo S3 Bucket lưu State an toàn
resource "aws_s3_bucket" "terraform_state" {
  bucket        = "company-tfstate-production-ap-southeast-1"
  force_destroy = false

  lifecycle {
    prevent_destroy = true # Ngăn chặn tai nạn vô tình xóa bucket chứa state
  }
}

resource "aws_s3_bucket_versioning" "state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled" # Giúp rollback về version state trước đó nếu xảy ra lỗi
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state_crypto" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 2. Tạo DynamoDB Table để thực hiện Distributed Concurrency Locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "company-tf-locks-production"
  billing_mode = "PAY_PER_REQUEST" # Tiết kiệm chi phí tối đa (serverless on-demand)
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# 3. Cách cấu hình backend trong các dự án hạ tầng:
# terraform {
#   backend "s3" {
#     bucket         = "company-tfstate-production-ap-southeast-1"
#     key            = "infrastructure/vpc/terraform.tfstate"
#     region         = "ap-southeast-1"
#     dynamodb_table = "company-tf-locks-production"
#     encrypt        = true
#   }
# }`,
    testInstructions: 'Chạy `terraform init` và `terraform apply`. Kiểm tra trên AWS Console sẽ thấy bảng DynamoDB được tạo với partition key `LockID`.'
  },
  {
    id: 'lab-linux-sysctl-tuning',
    pillar: 'linux-network',
    title: 'High-Throughput Linux Kernel Tuning (`/etc/sysctl.conf`)',
    tag: 'OS & Performance Engineering',
    description: 'Tối ưu tham số mạng kernel của Linux cho các server API Gateway, Nginx và Kubernetes Worker Nodes phục vụ trên 100,000 connection đồng thời.',
    productionWhy: 'Cấu hình mặc định của Linux OS được thiết kế cho desktop/server thông thường. Khi tải cao, hệ thống sẽ bị tràn somaxconn, tràn conntrack hoặc nghẽn file descriptor (Too many open files).',
    filename: '99-production-sysctl.conf',
    language: 'ini',
    code: `# Tăng kích thước hàng đợi kết nối TCP (Listen Backlog)
# Tránh lỗi "connection reset by peer" khi lượng traffic dồn dập tới Nginx/HAProxy
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# Tối ưu socket TIME_WAIT: cho phép tái sử dụng các socket an toàn cho outbound connections
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# Tăng dải cổng Ephemeral Port (Outbound port range) để không bị cạn port khi gọi microservice
net.ipv4.ip_local_port_range = 10240 65535

# Tăng dung lượng bộ đệm TCP Read/Write Buffer (Hữu ích cho đường truyền mạng tốc độ cao)
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Tránh tình trạng server swap ra ổ cứng khi RAM vẫn còn trống
vm.swappiness = 10

# Tăng giới hạn số lượng kết nối Netfilter Connection Tracking (Chống lỗi nf_conntrack: table full)
net.netfilter.nf_conntrack_max = 1048576

# Tăng giới hạn File Descriptors tối đa toàn hệ thống
fs.file-max = 2097152`,
    testInstructions: 'Lưu vào `/etc/sysctl.d/99-production-sysctl.conf` và nạp vào kernel bằng lệnh: `sudo sysctl -p /etc/sysctl.d/99-production-sysctl.conf`.'
  }
];
