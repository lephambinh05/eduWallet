# ABSTRACT - EduWallet: NFT Learning Passport Platform

## Tóm tắt dự án

EduWallet là một nền tảng quản lý chứng chỉ học tập và danh tính số tiên tiến, được xây dựng dựa trên công nghệ blockchain và NFT (Non-Fungible Token). Dự án này giải quyết các thách thức hiện tại trong việc quản lý, xác thực và chia sẻ chứng chỉ học tập trong hệ thống giáo dục hiện đại.

## Bối cảnh và vấn đề

Trong thời đại số hóa, việc quản lý chứng chỉ học tập truyền thống gặp nhiều hạn chế như khó xác thực, dễ bị giả mạo, thiếu tính minh bạch và khó chia sẻ giữa các tổ chức giáo dục. Hơn nữa, sinh viên thường gặp khó khăn trong việc quản lý và trình bày các thành tích học tập của mình một cách có hệ thống.

## Giải pháp đề xuất

EduWallet cung cấp một giải pháp toàn diện thông qua việc số hóa chứng chỉ học tập thành NFT trên blockchain Polygon Mumbai Testnet. Nền tảng này cho phép:

- Quản lý danh tính số học tập: Mỗi người dùng sở hữu một LearnPass NFT duy nhất, chứa đựng toàn bộ lịch sử học tập, chứng chỉ, kỹ năng và thành tích được mã hóa và lưu trữ bất biến trên blockchain.

- Hệ thống xác thực minh bạch: Tất cả chứng chỉ được xác thực và lưu trữ trên blockchain, đảm bảo tính xác thực và không thể bị giả mạo. Các tổ chức giáo dục có thể dễ dàng xác minh tính hợp lệ của chứng chỉ.

- Marketplace phần thưởng: Tích hợp hệ thống token EDU để khuyến khích học tập thông qua việc đổi điểm học tập lấy các phần thưởng thực tế như voucher, coupon và các ưu đãi khác.

- Giao diện người dùng hiện đại: Thiết kế responsive với giao diện glassmorphism, hỗ trợ đầy đủ trên các thiết bị di động, tablet và desktop.

## Kiến trúc kỹ thuật

Dự án được xây dựng với kiến trúc full-stack hiện đại:

- Frontend: Sử dụng React 18 với Context API để quản lý state, React Router cho navigation, Styled Components cho styling, và Framer Motion cho animations. Tích hợp MetaMask để tương tác với blockchain.

- Backend: Express.js server với Socket.io để xử lý real-time notifications, hỗ trợ CORS và RESTful API.

- Blockchain Integration: Tích hợp với Polygon Mumbai Testnet thông qua Ethers.js, hỗ trợ MetaMask wallet và quản lý giao dịch ERC-20 tokens.

- Real-time Communication: Sử dụng WebSocket để gửi thông báo tức thời về giao dịch, chuyển tiền và cập nhật trạng thái.

## Tính năng chính

- Hệ thống xác thực: Đăng ký, đăng nhập với form validation, protected routes và session management thông qua localStorage.

- Quản lý ví blockchain: Kết nối MetaMask, tự động chuyển đổi network, quản lý địa chỉ ví và theo dõi số dư.

- LearnPass NFT: Tạo và quản lý hộ chiếu học tập dưới dạng NFT, chứa metadata về khóa học, điểm số, kỹ năng và lịch sử tín chỉ.

- Hệ thống chứng chỉ: Upload, quản lý và hiển thị chứng chỉ học tập với thông tin chi tiết về tổ chức cấp, ngày cấp và điểm số.

- Badge và thành tích: Hệ thống huy hiệu để ghi nhận các thành tích đặc biệt và khuyến khích học tập.

- Marketplace: Nền tảng đổi thưởng sử dụng EDU token, cho phép sinh viên đổi điểm học tập lấy voucher, coupon và các phần thưởng khác.

- Hệ thống chuyển tiền: Chuyển EDU token giữa các người dùng với thông báo real-time và xác thực giao dịch.

## Đóng góp và ý nghĩa

Dự án EduWallet đóng góp vào việc cách mạng hóa hệ thống giáo dục thông qua:

- Tính minh bạch: Tất cả chứng chỉ được lưu trữ trên blockchain, đảm bảo tính minh bạch và không thể bị thao túng.

- Tính bảo mật: Sử dụng công nghệ blockchain để bảo vệ dữ liệu học tập khỏi việc giả mạo và mất mát.

- Tính khả dụng: Giao diện thân thiện và responsive, dễ sử dụng trên mọi thiết bị.

- Tính khuyến khích: Hệ thống token và marketplace tạo động lực học tập cho sinh viên.

- Tính tương tác: Real-time notifications và social features tăng cường trải nghiệm người dùng.

## Kết luận

EduWallet đại diện cho một bước tiến quan trọng trong việc số hóa và blockchain hóa hệ thống giáo dục. Dự án không chỉ giải quyết các vấn đề hiện tại trong quản lý chứng chỉ mà còn mở ra những khả năng mới cho việc học tập và phát triển cá nhân trong thời đại số. Với kiến trúc mở rộng và công nghệ tiên tiến, EduWallet có tiềm năng trở thành nền tảng tiêu chuẩn cho việc quản lý danh tính học tập trong tương lai.

## Từ khóa

Blockchain, NFT, Education Technology, Digital Identity, Smart Contracts, Web3, Learning Management System, Token Economy, MetaMask, Polygon Network, React.js, Real-time Communication
