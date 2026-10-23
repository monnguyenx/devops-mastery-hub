import { Pillar } from '../types';

export const PILLARS: Pillar[] = [
  {
    id: 'linux-network',
    title: 'Linux Internals & Deep Networking',
    shortTitle: 'Linux & Network',
    icon: 'Terminal',
    color: '#10B981', // Emerald
    summary: 'Hiểu cặn kẽ OS Kernel, tiến trình, socket, file descriptor và packet flow thực tế thay vì chỉ biết gõ lệnh cơ bản.',
    whyMiddleNeedsThis: 'Khi có sự cố high load, socket leak, packet drop hay DNS delay 5s, Junior thường reboot server hoặc tăng RAM. Middle DevOps dùng strace, lsof, tcpdump, ss, sysctl để pinpoint chính xác nguyên nhân gốc rễ.',
    competencies: [
      {
        id: 'ln-1',
        name: 'Process & System Resource Troubleshooting',
        levelTarget: 'Middle',
        description: 'Phân tích Load Average, I/O Wait (D-state processes), zombie process, OOM killer triggers.',
        checkpoints: [
          'Phân biệt được High Load Average do CPU bound vs I/O bound (D-state) qua vmstat và iostat',
          'Sử dụng strace -p <pid> để xem syscall bị block hoặc lsof -p để kiểm tra file descriptor leak',
          'Hiểu cách Linux OOM Killer tính toán oom_score và oom_score_adj'
        ]
      },
      {
        id: 'ln-2',
        name: 'Linux Networking & Packet Flow',
        levelTarget: 'Middle',
        description: 'Nắm vững TCP 3-way handshake, TCP states (TIME_WAIT, CLOSE_WAIT) và iptables/nftables packet traversal.',
        checkpoints: [
          'Debug sự cố TIME_WAIT connection pool exhaustion với net.ipv4.tcp_tw_reuse và sysctl',
          'Bắt và phân tích packet với tcpdump -nnvv -i any port 443 hoặc port 53',
          'Hiểu flow của Netfilter: PREROUTING -> FORWARD/INPUT -> POSTROUTING'
        ]
      },
      {
        id: 'ln-3',
        name: 'DNS Resolution & System Tuning',
        levelTarget: 'Middle',
        description: 'Cơ chế giải quyết tên miền trong Linux, ndots:5, nsswitch.conf, tuning kernel parameters.',
        checkpoints: [
          'Giải thích được vì sao ndots:5 trong /etc/resolv.conf gây overhead DNS 5x cho external domain',
          'Tối ưu somaxconn, file-max, nofile limits cho các Nginx/Database servers chịu tải cao'
        ]
      }
    ]
  },
  {
    id: 'k8s-containers',
    title: 'Containers & Kubernetes Production Orchestration',
    shortTitle: 'K8s & Containers',
    icon: 'Cpu',
    color: '#06B6D4', // Cyan
    summary: 'Làm chủ Pod Lifecycle, CNI/CSI, Cgroups v2, Resource requests/limits, HPA, PDB và Zero-downtime Rollout.',
    whyMiddleNeedsThis: 'Junior chỉ biết `kubectl apply -f` và `kubectl get pods`. Middle DevOps phải nắm sâu cơ chế Controller Manager reconciliation loop, CNI packet routing, troubleshooting CrashLoopBackOff/OOMKilled và bảo đảm zero-downtime khi node drain/upgrade.',
    competencies: [
      {
        id: 'k8s-1',
        name: 'Production Pod Lifecycle & Graceful Shutdown',
        levelTarget: 'Middle',
        description: 'Xử lý SIGTERM, preStop hooks, terminationGracePeriodSeconds và readiness/liveness probes.',
        checkpoints: [
          'Hiểu vì sao 502/504 Bad Gateway xuất hiện khi rolling update nếu không có preStop sleep 5s',
          'Thiết lập PodDisruptionBudget (PDB) và topologySpreadConstraints để chống downtime khi cluster auto-scaling hoặc node drain',
          'Phân biệt Liveness (restart pod) vs Readiness (cắt traffic) vs Startup Probe (khởi động chậm)'
        ]
      },
      {
        id: 'k8s-2',
        name: 'K8s Networking, Ingress & DNS Debugging',
        levelTarget: 'Middle',
        description: 'Packet flow từ Ingress Controller -> Kube-proxy (iptables/IPVS) -> CNI -> Pod, CoreDNS performance.',
        checkpoints: [
          'Troubleshoot CoreDNS throttling, CoreDNS cache tuning và NodeLocal DNSCache',
          'Phân biệt ClusterIP, NodePort, LoadBalancer và cơ chế rewrite/rate-limit của Ingress-Nginx'
        ]
      },
      {
        id: 'k8s-3',
        name: 'Resource Optimization & OOM Killer Deep-Dive',
        levelTarget: 'Middle',
        description: 'K8s QoS classes (Guaranteed, Burstable, BestEffort), cgroups memory throttling vs OOMKilled exit code 137.',
        checkpoints: [
          'Hiểu cơ chế CPU CFS quota throttling khi đặt CPU limit quá thấp dù host CPU còn thừa',
          'Setup HPA v2 kết hợp custom metrics từ Prometheus (ví dụ: HTTP requests per second)'
        ]
      }
    ]
  },
  {
    id: 'cicd-gitops',
    title: 'CI/CD Pipelines & GitOps Architecture',
    shortTitle: 'CI/CD & GitOps',
    icon: 'GitBranch',
    color: '#F59E0B', // Amber
    summary: 'Xây dựng pipeline tốc độ cao, Docker layer caching, Security scanning và triển khai chuẩn GitOps qua ArgoCD.',
    whyMiddleNeedsThis: 'Junior tạo pipeline chạy tuần tự mất 15-20 phút và lưu plain text secret. Middle DevOps thiết kế pipeline chạy dưới 3 phút với dynamic matrix, remote caching, automated security gating (Trivy, SonarQube) và triển khai GitOps declarative.',
    competencies: [
      {
        id: 'ci-1',
        name: 'High Performance Pipeline & Caching Strategy',
        levelTarget: 'Middle',
        description: 'Tối ưu Docker multi-stage builds, BuildKit cache-from, dependency caching (npm/go/pip).',
        checkpoints: [
          'Áp dụng Docker Buildx cache registry backend để tái sử dụng layer cache giữa các runner khác nhau',
          'Chia tách CI thành các stage song song (lint, test, build, scan) với DAG (Directed Acyclic Graph)'
        ]
      },
      {
        id: 'ci-2',
        name: 'DevSecOps Pipeline Gating',
        levelTarget: 'Middle',
        description: 'Tích hợp SAST, SCA, Secret Scanning và Container Image scanning vào pipeline có chặn commit/PR.',
        checkpoints: [
          'Cấu hình Trivy chặn build nếu có CVE Critical hoặc High có fix version',
          'Sử dụng Gitleaks hoặc TruffleHog để ngăn chặn rò rỉ credential vào git history'
        ]
      },
      {
        id: 'ci-3',
        name: 'GitOps with ArgoCD / Flux',
        levelTarget: 'Middle',
        description: 'Triển khai hạ tầng và ứng dụng declarative, Sync wave, Self-healing, Rollback và Drift Detection.',
        checkpoints: [
          'Hiểu cơ chế Git as Single Source of Truth và Sync Window trong ArgoCD',
          'Sử dụng Argo Rollouts để thực hiện Blue/Green và Canary Deployment tự động phân tích Prometheus metric'
        ]
      }
    ]
  },
  {
    id: 'iac-terraform',
    title: 'Infrastructure as Code (IaC) & Terraform',
    shortTitle: 'IaC & Terraform',
    icon: 'Layers',
    color: '#8B5CF6', // Purple
    summary: 'Module hóa kiến trúc hạ tầng, Remote State Locking, State Drift Reconciliation và Zero-Impact refactoring.',
    whyMiddleNeedsThis: 'Junior viết file main.tf dài 1000 dòng, lưu state local và sợ `terraform apply`. Middle DevOps thiết kế reusable modules, quản lý state an toàn với S3 + DynamoDB locking, xử lý state drift và terraform import trơn tru.',
    competencies: [
      {
        id: 'iac-1',
        name: 'State Management & Concurrency Locking',
        levelTarget: 'Middle',
        description: 'Cơ chế remote state backend, DynamoDB/Consul lock, xử lý Deadlock và State Disaster Recovery.',
        checkpoints: [
          'Giải quyết sự cố Terraform State Lock bị kẹt sau khi pipeline bị cancel đột ngột bằng `force-unlock` an toàn',
          'Thao tác thuần thục `terraform state mv`, `terraform state rm`, `terraform import` mà không recreate tài nguyên'
        ]
      },
      {
        id: 'iac-2',
        name: 'Modular Architecture & DRY Principles',
        levelTarget: 'Middle',
        description: 'Xây dựng module production-ready với dynamic blocks, lifecycle management và version pin.',
        checkpoints: [
          'Sử dụng `lifecycle { create_before_destroy = true }` để tránh downtime khi cập nhật SSL/Security Groups',
          'Cấu trúc repo theo Multi-Environment (dev/staging/prod) dùng Terragrunt hoặc Directory layout chuẩn'
        ]
      },
      {
        id: 'iac-3',
        name: 'Drift Detection & Compliance Policy as Code',
        levelTarget: 'Middle',
        description: 'Tự động phát hiện ai đó sửa tay trên Cloud Console và áp dụng Checkov / TFLint / OPA.',
        checkpoints: [
          'Lên cronjob chạy `terraform plan -detailed-exitcode` định kỳ để phát hiện infrastructure drift',
          'Áp dụng TFLint và Checkov quét lỗi bảo mật IaC trước khi apply'
        ]
      }
    ]
  },
  {
    id: 'observability-sre',
    title: 'Observability & SRE Incident Management',
    shortTitle: 'Observability & SRE',
    icon: 'Activity',
    color: '#EC4899', // Pink
    summary: 'Thuần thục The 4 Golden Signals, PromQL vector matching, Centralized Logging và thiết lập Alerting chống Alert Fatigue.',
    whyMiddleNeedsThis: 'Junior chỉ xem dashboard khi server chết và setup alert CPU > 80% spam Telegram. Middle DevOps xây dựng SLI/SLO theo người dùng (User-facing metrics), viết PromQL histogram_quantile tính p95/p99 latency và setup alert thông minh theo Burn Rate.',
    competencies: [
      {
        id: 'sre-1',
        name: 'PromQL & The 4 Golden Signals',
        levelTarget: 'Middle',
        description: 'Nắm vững Latency, Traffic, Errors, Saturation và các hàm PromQL rate(), irate(), histogram_quantile().',
        checkpoints: [
          'Hiểu sự khác biệt giữa rate() (smooth trung bình theo window) và irate() (nhanh, bắt spike tức thì)',
          'Tính toán chính xác Error Rate percentage: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100`',
          'Đo lường P99 Latency bằng histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))'
        ]
      },
      {
        id: 'sre-2',
        name: 'Alerting Hygiene & Alert Fatigue Mitigation',
        levelTarget: 'Middle',
        description: 'Cấu hình Alertmanager routing, inhibition rules, deduplication và multi-window burn rate alerts.',
        checkpoints: [
          'Thiết lập Inhibition Rules: Nếu Cluster Node Down thì mute toàn bộ alert Pod Crash trên node đó',
          'Phân biệt Ticket Alert (thông báo Slack) vs Pager Alert (đánh thức On-call lúc 2h sáng theo SLO)'
        ]
      },
      {
        id: 'sre-3',
        name: 'Distributed Tracing & Context Propagation',
        levelTarget: 'Middle',
        description: 'Triển khai OpenTelemetry Collector, trace spans qua Microservices và tìm bottleneck database query.',
        checkpoints: [
          'Hiểu traceparent HTTP header (W3C standard) và cách trace ID liên kết giữa các service',
          'Tích hợp OTel Collector thu thập Metrics, Logs và Traces với batching và retry processor'
        ]
      }
    ]
  },
  {
    id: 'cloud-secops',
    title: 'Cloud Architecture & DevSecOps',
    shortTitle: 'Cloud & Security',
    icon: 'ShieldCheck',
    color: '#3B82F6', // Blue
    summary: 'Kiến trúc bảo mật Least Privilege, IAM Role for Service Accounts, Network isolation, Vault & Secret management.',
    whyMiddleNeedsThis: 'Junior thường gắn quyền AdministratorAccess/Owner hoặc hardcode access key trong config. Middle DevOps áp dụng Zero-Trust, IAM federated roles (IRSA/Workload Identity), HashiCorp Vault dynamic secrets và Private VPC networking.',
    competencies: [
      {
        id: 'sec-1',
        name: 'IAM Least Privilege & Workload Identity',
        levelTarget: 'Middle',
        description: 'Cấp quyền Cloud cho K8s Pods không dùng static AWS_ACCESS_KEY_ID / GCP service-account.json.',
        checkpoints: [
          'Thiết lập IRSA (IAM Roles for Service Accounts) trong EKS hoặc Workload Identity trong GKE',
          'Viết IAM Policy có Condition keys giới hạn theo IP, VPC endpoint hoặc tag của resource'
        ]
      },
      {
        id: 'sec-2',
        name: 'Production Secret Lifecycle (Vault / External Secrets)',
        levelTarget: 'Middle',
        description: 'Tự động hóa rotation secret, đồng bộ từ AWS Secrets Manager/Vault vào K8s secrets an toàn.',
        checkpoints: [
          'Sử dụng External Secrets Operator (ESO) để kéo secrets từ Cloud Provider an toàn vào Kubernetes',
          'Không bao giờ commit file `.env` hoặc Base64 K8s secret lên Git repo'
        ]
      },
      {
        id: 'sec-3',
        name: 'Network Isolation & Defense in Depth',
        levelTarget: 'Middle',
        description: 'VPC Peering, Transit Gateway, Private Subnets, NAT Gateways và K8s NetworkPolicy.',
        checkpoints: [
          'Phân biệt Security Group (Stateful, compute level) vs NACL (Stateless, subnet level)',
          'Viết Kubernetes NetworkPolicy chặn traffic giữa các namespace và chỉ cho phép egress ra port cần thiết'
        ]
      }
    ]
  }
];
