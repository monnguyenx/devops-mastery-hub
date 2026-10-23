import { Incident } from '../types';

export const INCIDENTS: Incident[] = [
  {
    id: 'inc-k8s-ndots-timeout',
    title: 'Độ trễ API tăng đột biến 5 giây định kỳ khi gọi Third-Party Payment Gateway',
    severity: 'SEV-1 (CRITICAL)',
    pillar: 'k8s-containers',
    system: 'Production EKS Cluster / Checkout Service Pods',
    alertMessage: 'FIRING: HighLatencyAlert - CheckoutService p99 latency > 5200ms (Normal: 120ms)',
    description: 'Sau đợt release mới, dịch vụ checkout bị khách hàng phàn nàn là thanh toán rất chậm hoặc thỉnh thoảng timeout. Dashboard APM cho thấy lệnh HTTP POST sang `api.payment-gateway.com` thỉnh thoảng mất đúng 5.000 giây (5s timeout) trước khi thành công.',
    symptoms: [
      'P99 latency nhảy lên 5050ms, trong khi CPU và RAM của Pod đều dưới 30%',
      'Sự cố chỉ xảy ra khi Pod gọi ra các domain bên ngoài internet (external API)',
      'Khi curl thử từ local máy Dev thì tốc độ vẫn dưới 100ms bình thường'
    ],
    investigationCommands: [
      {
        command: 'kubectl exec -it checkout-service-789bfb-xyz -- cat /etc/resolv.conf',
        label: '1. Kiểm tra cấu hình DNS của Pod trong container',
        output: `nameserver 10.100.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5`,
        insight: 'Lưu ý `ndots:5`! Khi container resolve domain có ít hơn 5 dấu chấm (như api.payment-gateway.com có 2 dấu chấm), resolver glibc sẽ append lần lượt các search domain trước khi thử domain gốc!'
      },
      {
        command: 'kubectl exec -it checkout-service-789bfb-xyz -- tcpdump -nn -i any port 53',
        label: '2. Bắt packet DNS query gửi tới CoreDNS (10.100.0.10)',
        output: `14:02:01.100 IP 10.0.2.14.45123 > 10.100.0.10.53: 1234+ A? api.payment-gateway.com.default.svc.cluster.local. (68)
14:02:01.101 IP 10.100.0.10.53 > 10.0.2.14.45123: 1234 NXDomain 0/1/0 (161)
14:02:01.102 IP 10.0.2.14.45124 > 10.100.0.10.53: 1235+ A? api.payment-gateway.com.svc.cluster.local. (60)
14:02:01.103 IP 10.100.0.10.53 > 10.0.2.14.45124: 1235 NXDomain 0/1/0 (153)
14:02:01.104 IP 10.0.2.14.45125 > 10.100.0.10.53: 1236+ A? api.payment-gateway.com.cluster.local. (56)
14:02:01.105 IP 10.100.0.10.53 > 10.0.2.14.45125: 1236 NXDomain 0/1/0 (149)
14:02:01.106 IP 10.0.2.14.45126 > 10.100.0.10.53: 1237+ A? api.payment-gateway.com. (43)
[... UDP Packet dropped / CoreDNS rate-limited / 5s timeout waiting for AAAA response ...]`,
        insight: 'CoreDNS bị quá tải vì mỗi request ra ngoài sinh ra tới 4-5 truy vấn DNS thừa thãi. Đồng thời Linux resolver chờ phản hồi UDP IPv6 (AAAA), nếu bị drop gói thì phải chờ đúng timeout mặc định 5s mới retry IPv4!'
      },
      {
        command: 'kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20',
        label: '3. Kiểm tra log của CoreDNS pods',
        output: `[WARNING] plugin/errors: 2 api.payment-gateway.com.default.svc.cluster.local. A: NXDOMAIN
[WARNING] plugin/errors: 2 api.payment-gateway.com.svc.cluster.local. A: NXDOMAIN
[WARNING] plugin/errors: 2 api.payment-gateway.com.cluster.local. A: NXDOMAIN
[INFO] CoreDNS dropping excess concurrent UDP queries from 10.0.2.14 (conntrack table full or UDP buffer overflow)`,
        insight: 'CoreDNS bị nghẽn do bão truy vấn NXDomain và conntrack table trên Linux kernel node bị quá tải với các UDP socket DNS ngắn hạn.'
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-1',
        text: 'Do CoreDNS thiếu tài nguyên CPU và cần tăng replica từ 2 lên 50 pod ngay lập tức.',
        isCorrect: false,
        feedback: 'Tăng replica CoreDNS chỉ là giải pháp tạm thời chữa cháy ngọn, không giải quyết được nguồn gốc lãng phí DNS query và lỗi thiết kế ndots:5.'
      },
      {
        id: 'rc-2',
        text: 'Do cấu hình mặc định `ndots:5` trong Kubernetes khiến mọi external domain phải thử 4 lần truy vấn nội bộ bị NXDOMAIN + UDP timeout 5s khi bị drop gói, kết hợp thiếu NodeLocal DNSCache.',
        isCorrect: true,
        feedback: 'Chính xác! Đây là bài toán kinh điển của Middle/Senior DevOps trong K8s. Với `ndots:5`, domain `api.payment-gateway.com` có 2 dấu chấm (< 5), nên hệ điều hành bắt buộc phải nối các suffix search path vào trước.'
      },
      {
        id: 'rc-3',
        text: 'Do dịch vụ Payment Gateway bên thứ 3 bị sập mạng hoặc đang chặn ddos IP của Pod.',
        isCorrect: false,
        feedback: 'Nếu bên thứ 3 sập mạng thì lệnh ping/curl từ máy dev cũng sẽ lỗi hoặc trả về 502/504, trong khi gói tin chưa ra khỏi cluster vì nghẽn ngay tầng DNS.'
      }
    ],
    permanentFix: {
      action: 'Cấu hình dnsConfig với ndots: 2 trong Deployment hoặc thêm dấu chấm tuyệt đối (.) vào domain trong code / Triển khai NodeLocal DNSCache.',
      configSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-service
spec:
  template:
    spec:
      dnsConfig:
        options:
          - name: ndots
            value: "2"
          - name: single-request-reopen  # Khắc phục bug glibc chờ đồng thời A và AAAA
          - name: timeout
            value: "1"
      containers:
        - name: app
          image: checkout-service:v2.1
# Hoặc trong code gọi domain FQDN có dấu chấm ở cuối: api.payment-gateway.com.`,
      configLang: 'yaml',
      explanation: 'Khi đặt `ndots: 2`, domain `api.payment-gateway.com` (có 2 dấu chấm) sẽ được gửi thẳng tới upstream DNS server ngay lần query đầu tiên mà không qua chuỗi 3 search domains nội bộ. Đồng thời `single-request-reopen` ngăn ngừa việc Linux glibc gửi A và AAAA trên cùng socket gây mất gói.'
    },
    postMortemTakeaway: 'Luôn hiểu sâu cơ chế DNS trong K8s. Với các cụm K8s lớn (>50 nodes), bắt buộc phải bật NodeLocal DNSCache DaemonSet để giảm tải cho CoreDNS và loại bỏ hoàn toàn conntrack race condition.'
  },
  {
    id: 'inc-linux-high-load-low-cpu',
    title: 'Server Load Average vọt lên 52.0 nhưng CPU Usage chỉ có 4%',
    severity: 'SEV-1 (CRITICAL)',
    pillar: 'linux-network',
    system: 'Production File Processing Node (Ubuntu 22.04 LTS)',
    alertMessage: 'FIRING: NodeHighLoadAverage - Node app-worker-03 LoadAvg1m=52.4 (Cores: 8, Threshold: 8.0)',
    description: 'Hệ thống cảnh báo Server Load Average vượt gấp 6 lần số CPU Core. Đội Dev khẳng định app không chạy gì nặng vì top chỉ thấy CPU nhàn rỗi (idle 96%). Nhưng các request xử lý ảnh/file mới gửi đến đều bị treo (hang) vô tận.',
    symptoms: [
      'Load Average 1m = 52.4, 5m = 48.1, 15m = 35.0 (Server chỉ có 8 vCPU)',
      'CPU utilization: %usr=2.1%, %sys=1.8%, %idle=96.1%',
      'Gõ lệnh `ls` hoặc thao tác terminal trên một số thư mục bị treo cứng (unresponsive)'
    ],
    investigationCommands: [
      {
        command: 'vmstat 1 5',
        label: '1. Kiểm tra trạng thái hàng đợi tiến trình (r và b) bằng vmstat',
        output: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in    cs us sy id wa st
 0 49      0 421032  12400 892010    0    0     0     0  230   410  2  2 96  0  0
 0 51      0 420990  12400 892010    0    0     0     0  221   398  1  2 97  0  0
 0 52      0 420910  12400 892010    0    0     0     0  245   405  2  1 97  0  0`,
        insight: 'Cột `b` (blocked processes / uninterruptible sleep) lên tới 49 - 52 tiến trình! Linux tính Load Average = (Tiến trình đang chạy trên CPU [r]) + (Tiến trình ở trạng thái D-state chờ I/O [b]).'
      },
      {
        command: 'ps -eo pid,stat,cmd | grep " D "',
        label: '2. Liệt kê các tiến trình đang ở trạng thái D (Uninterruptible Sleep)',
        output: ` 14210 D    /usr/bin/python3 process_upload.py --file /mnt/nfs_storage/2026/img_01.jpg
 14211 D    /usr/bin/python3 process_upload.py --file /mnt/nfs_storage/2026/img_02.jpg
 14212 D    /usr/bin/python3 process_upload.py --file /mnt/nfs_storage/2026/img_03.jpg
 14215 D    ls -la /mnt/nfs_storage/uploads
 [...] 48 more python3 processes in D state`,
        insight: 'Tất cả các tiến trình D state đều đang cố gắng đọc/ghi vào mount point `/mnt/nfs_storage`!'
      },
      {
        command: 'dmesg -T | grep -i "nfs\\|timeout"',
        label: '3. Kiểm tra kernel ring buffer log',
        output: `[Fri Oct 23 14:10:02 2026] nfs: server 10.0.10.50 not responding, still trying
[Fri Oct 23 14:10:32 2026] nfs: server 10.0.10.50 not responding, still trying
[Fri Oct 23 14:11:02 2026] nfs: server 10.0.10.50 not responding, still trying`,
        insight: 'NFS server ở địa chỉ 10.0.10.50 bị mất kết nối hoặc sập dịch vụ. Cấu hình mount NFS đang ở chế độ `hard` mount khiến mọi syscall read/write/stat bị kernel lock cứng ở chế độ D-state (không thể kill bằng `kill -9`).'
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-1',
        text: 'Do server bị dính cryptominer ẩn danh xóa tên khỏi bảng `top`.',
        isCorrect: false,
        feedback: 'Nếu có miner thì CPU utilization (%usr) sẽ là 100%, đằng này CPU idle tới 96% và vmstat chỉ ra cột blocked (b) rất cao.'
      },
      {
        id: 'rc-2',
        text: 'Do mount point NFS từ xa bị mất mạng/sập, các tiến trình bị kẹt ở trạng thái D-state (Uninterruptible Sleep) khi gọi syscall I/O, đẩy Load Average tăng vọt.',
        isCorrect: true,
        feedback: 'Chính xác! Đây là kiến thức cốt lõi phân biệt Junior và Middle Linux admin: Load average của Linux đo cả runnable threads VÀ uninterruptible I/O wait threads (D state). Khi NFS server không phản hồi trong hard mount, tiến trình không thể nhận SIGKILL và nằm chờ kernel lock.'
      },
      {
        id: 'rc-3',
        text: 'Do RAM bị phân mảnh nghiêm trọng cần chạy `sync && echo 3 > /proc/sys/vm/drop_caches`.',
        isCorrect: false,
        feedback: 'drop_caches chỉ xóa pagecache/dentries trong RAM, không giải quyết được syscall đang bị nghẽn ở tầng network filesystem NFS.'
      }
    ],
    permanentFix: {
      action: 'Unmount cưỡng bức với `umount -l /mnt/nfs_storage` (lazy unmount) để giải phóng D-state, đồng thời cấu hình NFS mount options với soft/intr hoặc chuyển sang S3/Object Storage.',
      configSnippet: `# Khôi phục nhanh tức thì:
umount -f -l /mnt/nfs_storage

# Cấu hình lại fstab an toàn hơn với timeout và intr (hoặc timeout cụ thể):
# /etc/fstab:
10.0.10.50:/exports /mnt/nfs_storage nfs rw,soft,timeo=50,retrans=3,actimeo=10,_netdev 0 0`,
      configLang: 'bash',
      explanation: 'Tùy chọn `soft` và `timeo=50` (5 giây) giúp kernel trả về I/O error (EIO) cho ứng dụng thay vì treo vĩnh viễn trong D-state khi NFS server gặp sự cố mạng.'
    },
    postMortemTakeaway: 'Khi thấy Load Average cao bất thường mà CPU thấp, hãy nghĩ ngay đến vmstat cột `b` và các tiến trình `D` state đang chờ ổ cứng hoặc Network Filesystem (NFS/CIFS).'
  },
  {
    id: 'inc-k8s-oomkilled-exit-137',
    title: 'Pod Java Microservice CrashLoopBackOff liên tục với Exit Code 137',
    severity: 'SEV-1 (CRITICAL)',
    pillar: 'k8s-containers',
    system: 'Kubernetes Cluster / User Service (Spring Boot 3)',
    alertMessage: 'FIRING: KubePodCrashLooping - Pod user-service-65b7c7f-94p2q in namespace prod restarting repeatedly',
    description: 'Dịch vụ xác thực người dùng vừa mới tăng memory limit từ 1Gi lên 2Gi nhưng Pod vẫn bị restart liên tục cứ sau 2 phút chạy. Khi kiểm tra `kubectl describe pod` thấy `Last State: Terminated, Reason: OOMKilled, Exit Code: 137`.',
    symptoms: [
      'Pod chạy được khoảng 90-120 giây sau đó đột ngột chết với Exit Code 137',
      'Trong log ứng dụng hoàn toàn không có Exception `java.lang.OutOfMemoryError`',
      'Memory limit của Pod đặt là `2Gi`, memory request đặt là `1Gi`'
    ],
    investigationCommands: [
      {
        command: 'kubectl describe pod user-service-65b7c7f-94p2q -n prod',
        label: '1. Kiểm tra chi tiết trạng thái Pod',
        output: `Containers:
  user-service:
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
      Started:      Fri, 23 Oct 2026 14:20:00 +0700
      Finished:     Fri, 23 Oct 2026 14:22:15 +0700
    Limits:
      memory:  2Gi
    Requests:
      memory:  1Gi`,
        insight: 'Exit code 137 = 128 + 9 (SIGKILL). Reason là OOMKilled do Linux CGroup OOM killer can thiệp và bắn hạ tiến trình vì vượt quá memory limit 2Gi.'
      },
      {
        command: 'kubectl get pod user-service-65b7c7f-94p2q -n prod -o jsonpath="{.spec.containers[0].env}"',
        label: '2. Kiểm tra biến môi trường Java JVM options',
        output: `[{"name":"JAVA_OPTS","value":"-Xmx2048m -Xms2048m"}]`,
        insight: 'BẮT ĐƯỢC VẤN ĐỀ! Dev đặt `-Xmx2048m` (2048MB Heap), đúng bằng K8s memory limit 2Gi (2048MB)!'
      },
      {
        command: 'kubectl logs user-service-65b7c7f-94p2q -n prod --previous --tail=30',
        label: '3. Kiểm tra log trước khi pod bị kill',
        output: `2026-10-23 14:22:10.123 [main] INFO  c.c.u.UserServiceApplication - Loading user cache into memory...
2026-10-23 14:22:14.891 [main] INFO  c.c.u.UserServiceApplication - Cached 250,000 entries.
command terminated with exit code 137`,
        insight: 'JVM không chỉ dùng Heap Memory. JVM còn cần Non-Heap Memory (Metaspace, Thread Stacks, Code Cache, Direct Memory buffer, GC overhead) khoảng 300MB-500MB! Khi Heap đạt 1.8GB + Non-Heap 300MB = 2.1GB > Cgroup 2Gi Limit -> Kernel lập tức kill Pod!'
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-1',
        text: 'Do Java code bị memory leak ở class UserServiceApplication và cần Dev fix code.',
        isCorrect: false,
        feedback: 'Nếu là Java code memory leak thuần túy trong Heap, JVM sẽ bắn ra ngoại lệ `java.lang.OutOfMemoryError: Java heap space` trước khi chết. Ở đây không hề có log này vì Kernel can thiệp từ bên ngoài qua Cgroup.'
      },
      {
        id: 'rc-2',
        text: 'Do đặt `-Xmx` (Heap size) bằng 100% K8s Memory Limit (2Gi), không chừa chỗ cho Non-Heap (Metaspace, Threads, GC overhead, JNI), khiến tổng memory container vượt ngưỡng Cgroup limit.',
        isCorrect: true,
        feedback: 'Chính xác! Quy tắc vàng khi chạy JVM trên Kubernetes: JVM Heap chỉ nên chiếm 70% - 75% memory limit của container, phần còn lại dành cho JVM overhead và OS buffer.'
      },
      {
        id: 'rc-3',
        text: 'Do Kubernetes Node bị cạn kiệt RAM và Kubelet chủ động evict Pod.',
        isCorrect: false,
        feedback: 'Nếu Kubelet evict do node pressure thì reason sẽ là `Evicted`, chứ không phải `OOMKilled` với Exit Code 137 từ container runtime.'
      }
    ],
    permanentFix: {
      action: 'Bỏ tham số cố định `-Xmx2048m`, thay bằng `-XX:MaxRAMPercentage=75.0` để JVM tự động tính toán kích thước Heap dựa trên CGroup limit của container.',
      configSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  template:
    spec:
      containers:
        - name: app
          image: user-service:v2.2
          resources:
            requests:
              memory: "1536Mi"
              cpu: "500m"
            limits:
              memory: "2048Mi"
              cpu: "1000m"
          env:
            # Sử dụng cgroup awareness của JDK 17/21 hiện đại:
            - name: JAVA_TOOL_OPTIONS
              value: "-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"`,
      configLang: 'yaml',
      explanation: 'Với `-XX:MaxRAMPercentage=75.0`, container có limit 2048Mi thì JVM sẽ cấp tối đa 1536Mi cho Heap, chừa lại 512Mi cho Metaspace, GC threads và Direct Memory. Pod sẽ không bao giờ bị Kernel OOMKilled bất ngờ.'
    },
    postMortemTakeaway: 'Exit code 137 = 128 + 9 (SIGKILL do OOM). Luôn nhớ tổng RAM của container = App Runtime (Heap) + Overhead (Off-heap, Metaspace, OS process). Không bao giờ đặt Xmx bằng Memory Limit.'
  },
  {
    id: 'inc-nginx-502-rolling-update',
    title: 'Người dùng gặp lỗi 502 Bad Gateway mỗi khi CI/CD triển khai phiên bản mới',
    severity: 'SEV-2 (HIGH)',
    pillar: 'k8s-containers',
    system: 'Ingress-Nginx / Web Frontend Service',
    alertMessage: 'WARNING: Ingress5xxRateSpike - Ingress controller reporting 4.8% 502 errors during deployment rollout',
    description: 'Mặc dù đã cấu hình `RollingUpdate` với `maxUnavailable: 0` và `readinessProbe` đầy đủ, mỗi lần merge code lên nhánh main để deploy lên production, khách hàng truy cập website vẫn bị dính lỗi `502 Bad Gateway` chớp nhoáng trong khoảng 5-10 giây.',
    symptoms: [
      'Lỗi 502 xuất hiện đúng vào thời điểm Pod cũ bị terminate',
      'Pod mới đã ở trạng thái `Running` và `1/1 Ready`',
      'Tải hệ thống bình thường, không có server crash'
    ],
    investigationCommands: [
      {
        command: 'kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=20 | grep "502"',
        label: '1. Kiểm tra log của Ingress Nginx Controller',
        output: `2026/10/23 14:35:12 [error] 48#48: *982121 connect() failed (111: Connection refused) while connecting to upstream, client: 203.113.1.5, server: app.example.com, request: "GET /api/v1/products HTTP/1.1", upstream: "http://10.244.2.85:8080/api/v1/products"`,
        insight: 'IP 10.244.2.85 là IP của Pod CŨ vừa mới bị xóa! Nginx vẫn đang cố gắng gửi traffic tới một Pod đã chết!'
      },
      {
        command: 'kubectl describe pod web-app-old-pod -n prod',
        label: '2. Kiểm tra chu trình shutdown của Pod cũ',
        output: `Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Killing    15s   kubelet            Stopping container web-app
[Container received SIGTERM and exited immediately in 50ms]`,
        insight: 'Khi nhận tín hiệu SIGTERM từ kubelet, container web app tắt ngay lập tức. Nhưng việc xóa IP của Pod ra khỏi Kubernetes Endpoints / iptables / Ingress Nginx upstream là chu trình BẤT ĐỒNG BỘ (asynchronous) mất từ 1 đến 3 giây!'
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-1',
        text: 'Do Ingress Nginx bị crash và tự restart lại.',
        isCorrect: false,
        feedback: 'Ingress Nginx không hề restart, nó chỉ báo lỗi `111: Connection refused` từ upstream.'
      },
      {
        id: 'rc-2',
        text: 'Do quá trình deregister Pod khỏi Endpoint diễn ra bất đồng bộ: Container dừng ngay khi nhận SIGTERM trong khi Ingress chưa kịp cập nhật bảng định tuyến, tiếp tục forward traffic vào Pod đã chết.',
        isCorrect: true,
        feedback: 'Chính xác! Đây là câu hỏi phân loại ứng viên Middle/Senior DevOps rất phổ biến. Kubelet gửi SIGTERM tới Pod đồng thời báo cho API Server gỡ Endpoints. Hai luồng này chạy song song. Nếu app chết ngay lập tức, traffic vẫn sẽ tới Pod cũ trong 1-3 giây tiếp theo gây 502!'
      },
      {
        id: 'rc-3',
        text: 'Do `readinessProbe` của Pod mới cấu hình thời gian `initialDelaySeconds` quá ngắn.',
        isCorrect: false,
        feedback: 'Lỗi 502 xảy ra ở Pod CŨ (IP 10.244.2.85 bị connection refused), không liên quan đến thời điểm Pod mới sẵn sàng.'
      }
    ],
    permanentFix: {
      action: 'Thêm `preStop` hook sleep 5-10 giây vào Pod spec và xử lý Graceful Shutdown trong ứng dụng.',
      configSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  template:
    spec:
      containers:
        - name: app
          image: web-app:v1.5
          lifecycle:
            preStop:
              exec:
                # Trì hoãn gửi SIGTERM 5s để Ingress & Kube-proxy kịp thời gỡ IP khỏi bảng định tuyến
                command: ["/bin/sh", "-c", "sleep 5"]
          terminationGracePeriodSeconds: 30`,
      configLang: 'yaml',
      explanation: 'Khi K8s chuẩn bị terminate Pod, `preStop` hook sẽ chạy trước. Nó giữ container tiếp tục sống và phục vụ các request đang dở trong 5 giây, tạo đủ thời gian cho Ingress Controller gỡ IP của Pod ra khỏi upstream pool. Sau 5 giây mới gửi SIGTERM.'
    },
    postMortemTakeaway: 'Zero-downtime trên Kubernetes không chỉ cần readinessProbe mà BẮT BUỘC phải có `preStop` hook delay 3-5s để đồng bộ với sự trễ của iptables/Endpoints propagation.'
  },
  {
    id: 'inc-terraform-state-lock-deadlock',
    title: 'Pipeline CI/CD bị block vĩnh viễn: "Error acquiring the state lock"',
    severity: 'SEV-2 (HIGH)',
    pillar: 'iac-terraform',
    system: 'GitLab CI / Terraform Remote State (AWS S3 + DynamoDB)',
    alertMessage: 'BUILD_FAILED: Job #98421 failed with exit code 1: Error acquiring the state lock in DynamoDB',
    description: 'Một kỹ sư DevOps trước đó đang chạy `terraform apply` thì mạng chập chờn hoặc pipeline CI bị hủy đột ngột (cancelled). Kể từ đó, toàn bộ các job deploy hạ tầng của cả team đều bị đứng khựng với thông báo lock state không thể release.',
    symptoms: [
      'Thông báo lỗi: `Error: Error acquiring the state lock: ConditionalCheckFailedException: The conditional request failed`',
      'Kèm theo Lock Info: ID: `e742c388-d2bf-4632-a5d2-1c25fba0b991`, Path: `terraform-states/production.tfstate`, Who: `gitlab-runner@runner-01`',
      'Không ai trong team đang chạy terraform nhưng không ai apply được'
    ],
    investigationCommands: [
      {
        command: 'aws dynamodb get-item --table-name terraform-locks --key \'{"LockID": {"S": "terraform-states/production.tfstate-md5"}}\'',
        label: '1. Kiểm tra trạng thái lock trong DynamoDB table',
        output: `{
  "Item": {
    "LockID": {"S": "terraform-states/production.tfstate-md5"},
    "Info": {
      "S": "{\"ID\":\"e742c388-d2bf-4632-a5d2-1c25fba0b991\",\"Operation\":\"OperationTypeApply\",\"Who\":\"gitlab-runner@ip-10-0-1-55\",\"Created\":\"2026-10-23T06:12:00Z\"}"
    }
  }
}`,
        insight: 'Lock đã tồn tại từ nhiều tiếng trước (`Created: 06:12:00Z`). Runner `ip-10-0-1-55` đã bị hủy hoặc chết nhưng lock không được giải phóng tự động.'
      }
    ],
    rootCauseOptions: [
      {
        id: 'rc-1',
        text: 'Do S3 bucket chứa state file đã bị xoá hoặc sai IAM permission.',
        isCorrect: false,
        feedback: 'Nếu sai permission S3 thì lỗi sẽ là `AccessDenied` từ S3. Ở đây là lỗi `ConditionalCheckFailedException` từ DynamoDB do khóa lock bị kẹt.'
      },
      {
        id: 'rc-2',
        text: 'Do tiến trình Terraform trước đó bị kill đột ngột (runner crash, timeout hoặc user bấm cancel trên UI), để lại bản ghi lock mồ côi trong DynamoDB.',
        isCorrect: true,
        feedback: 'Chính xác! DynamoDB State Lock là cơ chế chống race condition của Terraform. Khi một tiến trình bị ngắt đột ngột (SIGKILL), nó không có cơ hội gọi hook unlock, khiến DynamoDB giữ nguyên Lock ID.'
      },
      {
        id: 'rc-3',
        text: 'Do version Terraform trên runner không tương thích với version của state file.',
        isCorrect: false,
        feedback: 'Nếu version không tương thích thì lỗi sẽ là `State file was created by a newer version of Terraform`.'
      }
    ],
    permanentFix: {
      action: 'Xác minh không có ai đang apply thật, sau đó dùng `terraform force-unlock <LOCK_ID>` để mở khóa an toàn.',
      configSnippet: `# Bước 1: Mở khóa bằng Lock ID được ghi rõ trong thông báo lỗi:
terraform force-unlock e742c388-d2bf-4632-a5d2-1c25fba0b991

# Bước 2: Thiết lập timeout và graceful shutdown trong CI/CD pipeline
# .gitlab-ci.yml / .github/workflows:
# Tránh kill runner bằng SIGKILL, thiết lập timeout hợp lý.`,
      configLang: 'bash',
      explanation: 'Lệnh `terraform force-unlock` chỉ gỡ bỏ khóa mà không làm hỏng dữ liệu state. Tuyệt đối không tự ý xóa DynamoDB item thủ công nếu không nắm rõ cấu trúc.'
    },
    postMortemTakeaway: 'Luôn bảo đảm CI/CD runner gửi tín hiệu SIGINT trước khi SIGTERM/SIGKILL để Terraform kịp thời dọn dẹp state lock.'
  }
];
