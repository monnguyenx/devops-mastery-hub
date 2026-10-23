# ⚡ DevOps Middle LevelUp Hub

Nền tảng web tương tác chuyên sâu được xây dựng để giúp kỹ sư chuyển giao năng lực từ **Junior lên Middle DevOps**.

---

## 🌟 6 Trụ Cột Năng Lực (The 6 Middle DevOps Pillars)

1. **Linux Internals & Deep Networking**: Hiểu cặn kẽ Kernel, TCP states (`TIME_WAIT` vs `CLOSE_WAIT`), Socket leak, `strace`, `tcpdump`, `vmstat`, D-state I/O wait, DNS `ndots:5`.
2. **Containers & Kubernetes Production Orchestration**: Pod Lifecycle, `preStop` Graceful Shutdown, CFS CPU Throttling, OOMKilled (Exit code 137), PodDisruptionBudget (PDB), NodeLocal DNSCache.
3. **CI/CD Pipelines & GitOps Architecture**: BuildKit remote cache registry backend, DevSecOps gating (Trivy, Gitleaks), ArgoCD Sync Waves & Drift Detection.
4. **Infrastructure as Code (IaC) & Terraform**: Distributed Concurrency Locking (S3 + DynamoDB), Reusable Modules, `create_before_destroy`, Zero-impact refactoring, `terraform force-unlock`.
5. **Observability & SRE Incident Management**: The 4 Golden Signals, PromQL (`rate()` vs `irate()`, `histogram_quantile`), Alert Fatigue Mitigation, Inhibition Rules, SLI/SLO.
6. **Cloud Architecture & DevSecOps**: IAM Least-Privilege, IRSA / Workload Identity (chống hardcode static keys), External Secrets Operator, Network Segmentation.

---

## 🛠️ Các Phân Hệ Trên Web

* 🚨 **Incident Drills (War Room mô phỏng sự cố thực tế)**:
  * Vào vai On-call Engineer khi có Prometheus Alert SEV-1/SEV-2.
  * Tương tác với Terminal chẩn đoán: chạy lệnh `kubectl logs`, `tcpdump`, `vmstat`, `ps -eo ...`, `dmesg`.
  * Khấu trừ nguyên nhân gốc rễ (Root Cause Deduction) kèm phân tích chuyên sâu.
  * Nhận cấu hình sửa vĩnh viễn (Permanent Fix) và bài học Post-mortem.
* 🎯 **Middle DevOps Skill Matrix**:
  * Đánh giá 30+ kỹ năng và checkpoints thực tế.
  * Theo dõi tỉ lệ sẵn sàng **Middle Readiness %** theo thời gian thực (lưu tự động vào LocalStorage).
* 🧠 **Deep-Dive Scenario Quizzes**:
  * Các câu hỏi tình huống hóc búa kèm code snippet và bẫy phỏng vấn.
  * Phân tích tại sao đáp án đúng và kinh nghiệm thực chiến đúc kết.
* 📦 **Production Lab Blueprints**:
  * Mẫu cấu hình Dockerfile multi-stage hardened với non-root & dumb-init.
  * K8s Zero-downtime deployment manifest tích hợp preStop sleep và PDB.
  * Terraform Remote Backend S3 + DynamoDB Distributed Lock.
  * Kernel Linux high-throughput sysctl tuning.
* 💼 **Mock Interview & Rubrics**:
  * Câu hỏi phỏng vấn System Design & SRE hay gặp nhất.
  * Rubric chấm điểm: Điểm cộng lớn, khung trả lời theo phương pháp STAR, các lỗi chết người (Red Flags) cần tránh.

---

## 🚀 Hướng Dẫn Chạy Web

### Cách 1: Chạy trực tiếp với Node.js (Khuyên dùng cho việc học và code tiếp)

```bash
cd devops-mastery-hub
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:5173`

### Cách 2: Chạy với Docker Compose

```bash
cd devops-mastery-hub
docker compose up -d --build
```

Mở trình duyệt truy cập: `http://localhost:3000`
