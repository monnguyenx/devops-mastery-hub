import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-linux-close-wait',
    pillar: 'linux-network',
    title: 'Phân biệt Socket Leak: TIME_WAIT vs CLOSE_WAIT',
    scenario: 'Hệ thống báo lỗi "Cannot assign requested address" hoặc "Too many open files". Bạn chạy lệnh `ss -s` hoặc `netstat -an` và thấy xuất hiện hàng chục nghìn socket ở trạng thái `CLOSE_WAIT`. Nguyên nhân sâu xa là do đâu?',
    options: [
      'Do Client chủ động ngắt kết nối và Server đang đợi 2*MSL (Maximum Segment Lifetime) trước khi giải phóng socket.',
      'Do Phía Client đã đóng kết nối (gửi FIN), Server OS đã ACK, nhưng ứng dụng trên Server chưa gọi hàm `close()` trên socket đó (Socket leak từ code).',
      'Do Firewall (iptables) chặn packet RST từ router khiến kết nối bị treo.',
      'Do Kernel Linux hết RAM và không thể cấp phát thêm TCP buffer.'
    ],
    correctIndex: 1,
    explanation: 'Trong chu trình 4-way TCP handshake termination: Khi bên đối diện (Client) gửi FIN, OS phía Server nhận được và tự động trả về ACK -> socket chuyển sang trạng thái `CLOSE_WAIT`. Nó sẽ ở nguyên trạng thái này cho đến khi TIẾN TRÌNH ỨNG DỤNG trên Server gọi lệnh `close(sockfd)`. Hàng nghìn kết nối CLOSE_WAIT là dấu hiệu rõ ràng của việc ứng dụng bị BUG leak socket (quên đóng connection pool, quên finally block).',
    middleDevOpsInsight: 'TIME_WAIT là bình thường ở phía chủ động đóng (chờ 2*MSL để bảo đảm gói tin cũ không lẫn vào kết nối mới). Ngược lại, CLOSE_WAIT là LỖI LẬP TRÌNH của chính ứng dụng đó trên server.',
    tags: ['TCP Handshake', 'Networking', 'Socket Leak', 'Linux Internals']
  },
  {
    id: 'q-k8s-cfs-throttling',
    pillar: 'k8s-containers',
    title: 'Hiện tượng CPU Throttling trong Kubernetes Cgroup',
    scenario: 'Bạn cấu hình Deployment với `resources.limits.cpu: "1000m"` (1 core). Khi chạy tải, Prometheus báo CPU Usage thực tế của Pod chỉ đạt khoảng 600m (60% core), nhưng độ trễ API lại tăng vọt và xuất hiện hiện tượng lag giật. Metric `container_cpu_cfs_throttled_periods_total` tăng rất nhanh. Tại sao lại xảy ra hiện tượng này?',
    options: [
      'Do Kubernetes Node thiếu CPU và bị tranh chấp với các Pod khác.',
      'Do CFS (Completely Fair Scheduler) quota chia CPU theo chu kỳ 100ms. Nếu app chạy đa luồng tiêu thụ hết quota 100ms chỉ trong 20ms đầu, app sẽ bị kernel đóng băng (throttle) 80ms còn lại.',
      'Do Garbage Collection của ứng dụng bị lỗi deadlock.',
      'Do Kubelet giới hạn tốc độ đọc ghi IOPS của ổ đĩa.'
    ],
    correctIndex: 1,
    explanation: 'Kubernetes giới hạn CPU bằng Linux CFS quota (mặc định chu kỳ period là 100ms). Với limit 1 CPU (1000m), Pod được cấp 100ms thời gian CPU cho mỗi chu kỳ 100ms. Nếu ứng dụng có 10 threads cùng chạy song song, 10 threads này sẽ "ngốn" sạch 100ms quota chỉ trong vòng 10ms! Trong 90ms còn lại của chu kỳ, Kernel CFS sẽ đóng băng hoàn toàn tiến trình, khiến độ trễ tăng vọt dù tính trung bình cả 1 giây CPU chỉ ăn 60%!',
    middleDevOpsInsight: 'Nhiều chuyên gia Kubernetes và SRE hàng đầu (như tại Uber, Zalando) khuyến nghị: KHÔNG NÊN đặt CPU Limits cho các ứng dụng latency-sensitive (hoặc chỉ đặt CPU Requests và bỏ CPU Limits), trừ khi bạn hiểu rõ CFS quota tuning.',
    tags: ['Kubernetes', 'Cgroups', 'CFS Quota', 'Performance Tuning']
  },
  {
    id: 'q-cicd-docker-cache',
    pillar: 'cicd-gitops',
    title: 'Tối ưu Docker Layer Cache trong CI Runner Ephemeral',
    scenario: 'Công ty bạn sử dụng Kubernetes Ephemeral Runners (mỗi job CI tạo ra một Pod runner mới và tự hủy sau khi xong). Do đó, cache local của Docker daemon bị mất hoàn toàn giữa các lần chạy, khiến thời gian build image mất hơn 12 phút. Giải pháp chuẩn Middle DevOps là gì?',
    options: [
      'Tạo một PersistentVolumeClaim (PVC) lớn gắn vào Docker daemon của tất cả các runner đồng thời.',
      'Sử dụng Docker Buildx với cache backend registry (`--cache-to type=registry` và `--cache-from type=registry`) để lưu và tải cache layer trực tiếp từ Container Registry từ xa.',
      'Tắt hoàn toàn bước docker build và chuyển sang chạy code trực tiếp trên production.',
      'Chỉ build container ở máy dev và push thủ công lên server.'
    ],
    correctIndex: 1,
    explanation: 'Với BuildKit và Docker Buildx, bạn có thể đẩy toàn bộ các intermediate cache layer lên container registry chuyên dụng (`--cache-to type=registry,ref=...`). Khi một runner ephemeral mới được sinh ra, nó chỉ cần kéo các cache manifest về (`--cache-from type=registry,ref=...`) mà không cần runner phải lưu state trên ổ cứng cục bộ.',
    middleDevOpsInsight: 'BuildKit cache registry backend giúp giảm thời gian build từ 10-15 phút xuống còn dưới 45 giây cho các commit chỉ thay đổi code ứng dụng mà không đổi dependencies.',
    tags: ['Docker', 'CI/CD', 'BuildKit', 'Performance']
  },
  {
    id: 'q-iac-for-each-vs-count',
    pillar: 'iac-terraform',
    title: 'Terraform: Vì sao nên ưu tiên `for_each` thay vì `count`?',
    scenario: 'Bạn định nghĩa 3 subnet AWS bằng `count = length(var.subnet_cidrs)`. Biến là `["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]`. Nếu bạn xóa phần tử ở giữa ("10.0.2.0/24"), chuyện gì sẽ xảy ra khi chạy `terraform apply`?',
    options: [
      'Terraform chỉ xóa đúng subnet "10.0.2.0/24" mà không ảnh hưởng gì khác.',
      'Terraform sẽ xóa subnet thứ 2 ("10.0.2.0/24") và sau đó THAY ĐỔI/RECREATE lại subnet thứ 3 ("10.0.3.0/24") vì chỉ mục index [2] bị lùi về index [1], có thể gây downtime nghiêm trọng.',
      'Terraform báo lỗi cú pháp và từ chối chạy.',
      'Terraform tự động chuyển sang dùng ID của resource để bảo toàn.'
    ],
    correctIndex: 1,
    explanation: 'Với `count`, Terraform gán địa chỉ tài nguyên theo số thứ tự mảng (`aws_subnet.this[0]`, `aws_subnet.this[1]`, `aws_subnet.this[2]`). Khi bạn xóa phần tử ở index 1, phần tử index 2 trở thành index 1. Terraform sẽ hiểu là subnet[1] bị thay đổi thuộc tính và subnet[2] bị xóa -> Nó sẽ hủy và tạo lại subnet[2]! Với `for_each` (dùng map hoặc set với key cố định), tài nguyên được định danh bằng string key (`aws_subnet.this["subnet_b"]`), việc xóa key này hoàn toàn không làm xáo trộn các key còn lại.',
    middleDevOpsInsight: 'Quy tắc vàng của Middle DevOps khi viết Terraform module: Luôn dùng `for_each` cho các tài nguyên có thể thêm/bớt độc lập để tránh hiệu ứng domino phá hủy hạ tầng.',
    tags: ['Terraform', 'IaC', 'State Management', 'Best Practices']
  },
  {
    id: 'q-promql-rate-vs-irate',
    pillar: 'observability-sre',
    title: 'PromQL: Phân biệt `rate()` vs `irate()`',
    scenario: 'Khi thiết lập cảnh báo (Alerting Rule) trong Prometheus để bắn thông báo cho On-call Engineer khi tỷ lệ lỗi HTTP 5xx tăng cao, bạn nên dùng hàm nào?',
    options: [
      'Bắt buộc dùng `irate()` vì nó phản ứng tức thời nhất với các lỗi chớp nhoáng.',
      'Nên dùng `rate()` vì nó tính giá trị trung bình trên toàn bộ time window (ví dụ [5m]), giúp làm mượt đồ thị và tránh spam cảnh báo ảo (alert flapping) do các spike đơn lẻ.',
      'Dùng `increase()` kết hợp với phép cộng lũy thừa.',
      'Không dùng hàm nào cả, chỉ cần đo giá trị raw của counter.'
    ],
    correctIndex: 1,
    explanation: '`irate()` chỉ tính đạo hàm giữa 2 điểm scrape data gần nhất trong khoảng thời gian chỉ định. Nó rất nhạy với các spike tức thời, cực kỳ thích hợp để quan sát realtime trên Grafana khi đang điều tra sự cố. Tuy nhiên, nếu dùng trong Alerting Rule, `irate()` sẽ gây ra "Alert Flapping" (bật tắt liên hồi) vì chỉ cần 1 giây có lỗi là alert bắn, giây sau hết lỗi alert resolve. `rate()` làm mượt trên cả cửa sổ thời gian (ví dụ 5 phút), bảo đảm chỉ cảnh báo khi vấn đề thực sự kéo dài.',
    middleDevOpsInsight: 'Quy tắc SRE: Dùng `irate()` cho Dashboard đồ thị chi tiết cao; Dùng `rate()` cho Alerting Rules và SLO/SLI calculation.',
    tags: ['Prometheus', 'PromQL', 'Alerting', 'SRE']
  },
  {
    id: 'q-sec-irsa-vs-keys',
    pillar: 'cloud-secops',
    title: 'Cấp quyền Cloud cho Kubernetes Workloads: IRSA / Workload Identity',
    scenario: 'Một team Dev yêu cầu DevOps tạo một IAM User với quyền `s3:PutObject` trên AWS rồi lưu `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` vào Kubernetes Secret để Pod đọc và upload ảnh. Là một Middle DevOps, bạn phản hồi và xử lý như thế nào?',
    options: [
      'Đồng ý ngay vì lưu trong Kubernetes Secret là đã được mã hóa an toàn 100%.',
      'Từ chối phương án static keys. Triển khai IRSA (IAM Roles for Service Accounts) bằng cách cấu hình OIDC provider cho cluster, gán IAM Role vào ServiceAccount của Pod để AWS STS tự cấp phát temporary credentials ngắn hạn.',
      'Gán quyền trực tiếp vào IAM Role của toàn bộ Worker Node EC2 để Pod nào cũng tự động upload được.',
      'Yêu cầu Dev mở public S3 bucket để không cần bất kỳ credential nào.'
    ],
    correctIndex: 1,
    explanation: 'Static Access Keys là một trong những nguyên nhân hàng đầu gây lộ lọt bảo mật (Dev commit nhầm lên git, log rò rỉ, không bao giờ xoay vòng key). Gán quyền vào Node Role thì vi phạm nguyên tắc Least Privilege (mọi Pod trên Node đều thừa hưởng quyền). IRSA (hoặc Workload Identity trên GCP) kết nối K8s ServiceAccount với Cloud IAM qua OIDC và WebIdentity Token, tự động cấp và xoay vòng temporary token trong 1 giờ, an toàn tuyệt đối và tuân thủ Zero-Trust.',
    middleDevOpsInsight: 'Không bao giờ cấp long-lived static credentials cho các dịch vụ chạy trong container. Hãy luôn sử dụng Federated Identity / OIDC STS.',
    tags: ['Cloud Security', 'Kubernetes', 'IAM', 'DevSecOps']
  }
];
