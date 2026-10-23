import { InterviewScenario } from '../types';

export const INTERVIEW_SCENARIOS: InterviewScenario[] = [
  {
    id: 'int-troubleshoot-incident',
    pillar: 'observability-sre',
    title: 'Phỏng vấn Troubleshooting: "Sự cố Production nghiêm trọng nhất bạn từng xử lý?"',
    scenario: 'Người phỏng vấn muốn kiểm tra tư duy giải quyết vấn đề (Troubleshooting Methodology), khả năng giữ bình tĩnh dưới áp lực, và việc bạn có thực sự làm việc thực chiến hay chỉ học lý thuyết.',
    expectedQuestions: [
      'Bạn phát hiện sự cố bằng cách nào (Alerting vs Khách hàng báo)?',
      'Các bước bạn điều tra theo thứ tự là gì?',
      'Làm thế nào bạn cô lập được nguyên nhân gốc rễ (Root Cause)?',
      'Hành động khắc phục tạm thời (Mitigation) và giải pháp lâu dài (Post-mortem action) là gì?'
    ],
    middleLevelRubric: {
      whatInterviewersLookFor: [
        'Sử dụng phương pháp tiếp cận có hệ thống (Top-down từ Ingress/Load Balancer -> App -> OS/DB, hoặc The 4 Golden Signals).',
        'Phân biệt rõ ràng giữa "Mitigation" (dập tắt đám cháy ngay để user dùng được) và "Permanent Fix" (sửa tận gốc).',
        'Có tư duy Blameless Post-mortem và rút ra bài học tự động hóa phòng ngừa tái diễn.'
      ],
      sampleAnswerStructure: [
        '1. Bối cảnh (Context): Hệ thống là gì, quy mô RPS bao nhiêu, triệu chứng ban đầu (ví dụ: alert Error Rate > 5% lúc 10h sáng).',
        '2. Triage & Mitigate: Kiểm tra Grafana/Datadog, rollback version mới nhất hoặc scale thêm replica để cứu người dùng trước.',
        '3. Điều tra sâu (Deep Dive): Dùng kubectl logs/describe, dmesg, strace hoặc truy vết trace ID trong Jaeger để tìm ra điểm nghẽn.',
        '4. Kết quả & Đúc kết: Viết tài liệu Post-mortem, bổ sung alert rule và cải tiến pipeline CI/CD để bắt lỗi này trước khi lên prod.'
      ],
      commonMistakesOrRedFlags: [
        'Nói chung chung: "Em lên server restart lại là hết lỗi" (Tư duy Junior không chịu tìm root-cause).',
        'Đổ lỗi cho Dev ("Do dev code ẩu") thay vì nhìn nhận dưới góc độ quy trình và system design.',
        'Không nhớ được các câu lệnh hoặc công cụ cụ thể đã dùng để điều tra.'
      ]
    }
  },
  {
    id: 'int-zero-downtime-db-migration',
    pillar: 'cicd-gitops',
    title: 'System Design: "Chiến lược Zero-Downtime Database Migration khi Deploy Code mới"',
    scenario: 'Hệ thống có phiên bản v1 đang chạy. Phiên bản v2 cần đổi tên cột `phone_number` thành `contact_mobile` trong bảng Users có 10 triệu dòng. Làm sao để deploy phiên bản mới mà không làm downtime dù chỉ 1 giây và có thể rollback an toàn bất cứ lúc nào?',
    expectedQuestions: [
      'Nếu bạn chạy `ALTER TABLE` đổi tên cột trực tiếp, chuyện gì sẽ xảy ra với các Pod v1 đang chạy?',
      'Làm sao bảo đảm tính tương thích ngược (Backward Compatibility)?',
      'Chiến lược Rollback sẽ như thế nào nếu bản v2 phát sinh bug nghiêm trọng?'
    ],
    middleLevelRubric: {
      whatInterviewersLookFor: [
        'Hiểu nguyên tắc "Expand and Contract Pattern" (Phình to rồi co lại) trong Database Migration.',
        'Nhận thức được table lock khi chạy DDL trên bảng lớn (dùng gh-ost / pt-online-schema-change hoặc Postgres concurrent index).',
        'Tách biệt bước chạy Migration khỏi bước Deploy App để có thể rollback độc lập.'
      ],
      sampleAnswerStructure: [
        'Giai đoạn 1 (Expand): Tạo cột mới `contact_mobile`. Code v1 vẫn đọc/ghi `phone_number`. DB trigger hoặc code v1.5 ghi đồng thời vào cả 2 cột (Dual-write).',
        'Giai đoạn 2 (Backfill): Chạy background worker copy dữ liệu cũ từ `phone_number` sang `contact_mobile`.',
        'Giai đoạn 3 (Deploy v2): Deploy ứng dụng v2 chuyển sang đọc và ghi trên `contact_mobile`. Nếu có lỗi, rollback về v1 vẫn an toàn vì dữ liệu ở cả 2 cột đều khớp.',
        'Giai đoạn 4 (Contract): Sau 1-2 tuần hệ thống v2 chạy ổn định, tạo migration xóa cột cũ `phone_number`.'
      ],
      commonMistakesOrRedFlags: [
        'Cho rằng chỉ cần bảo trì ban đêm tắt web 30 phút để chạy migration.',
        'Không tính đến chuyện rollback: nếu đổi tên cột ngay lập tức, khi v2 có bug thì v1 không thể chạy lại được nữa vì schema đã bị phá vỡ.'
      ]
    }
  },
  {
    id: 'int-k8s-pod-disappeared',
    pillar: 'k8s-containers',
    title: 'Troubleshooting K8s: "Một Pod đột nhiên biến mất, không có log crash, không thấy trong kubectl get pods"',
    scenario: 'Developer thông báo: Một Pod chạy tác vụ batch job chạy được nửa đường thì đột nhiên biến mất không dấu vết. Kiểm tra `kubectl logs` thì báo Pod không tồn tại. Bạn sẽ bắt đầu điều tra từ đâu?',
    expectedQuestions: [
      'Làm sao để tìm lại vết tích của một Pod đã bị xóa khỏi etcd?',
      'Những nguyên nhân nào từ phía Kubernetes cluster có thể khiến Pod bị xóa mà không phải do ứng dụng tự thoát?',
      'Các câu lệnh và nguồn thông tin bạn sẽ kiểm tra?'
    ],
    middleLevelRubric: {
      whatInterviewersLookFor: [
        'Biết kiểm tra `kubectl get events --sort-by=.metadata.creationTimestamp` hoặc Kube-event exporter.',
        'Hiểu cơ chế Kubelet Eviction do Node Pressure (DiskPressure, MemoryPressure).',
        'Kiểm tra Audit Logs của Kubernetes API Server để xem ai hoặc Controller nào đã gửi HTTP DELETE request tới Pod.',
        'Kiểm tra Spot Instance Termination (nếu chạy trên AWS Spot / GCP Preemptible).'
      ],
      sampleAnswerStructure: [
        '1. Kubernetes Audit Logs: Kiểm tra CloudWatch/Stackdriver logs của Kube-apiserver với filter `verb=delete` và `resource=pods` để xác định User/ServiceAccount đã xóa Pod.',
        '2. Node Events & Kubelet logs: Kiểm tra xem Node có bị `DiskPressure` dẫn đến eviction tự động hay không (`journalctl -u kubelet -S "1 hour ago"`).',
        '3. Spot Interruption: Nếu dùng Spot node, kiểm tra xem Node có nhận được cảnh báo 2-minute interruption notice từ Cloud provider hay không.',
        '4. dmesg & Host OOM: Kiểm tra `dmesg -T` trên Node xem có phải kernel OOM killer đã bắn hạ cả Docker/Containerd shim hay không.'
      ],
      commonMistakesOrRedFlags: [
        'Chỉ gõ lại `kubectl get pods` và chịu thua vì Pod không còn nữa.',
        'Không biết đến sự tồn tại của Kubernetes API Audit Logs.'
      ]
    }
  }
];
