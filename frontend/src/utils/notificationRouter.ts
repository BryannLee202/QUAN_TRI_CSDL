/**
 * frontend/src/utils/notificationRouter.ts
 * Hệ thống điều hướng thông báo trọng điểm chuẩn Web App FaaS SmartMushroom
 * Đảm bảo 100% thông báo dẫn trực tiếp tới đúng trang chức năng cốt lõi
 * Tác giả: Lê Minh Tài (Lead Architect)
 */

export interface AppNotification {
  id: string;
  type: 'alert' | 'success' | 'info';
  category?: 'CLIMATE' | 'CONTRACT' | 'HARVEST' | 'TRAY' | 'MARKET' | 'PROFIT' | string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  link: string;
  badge: string;
}

export const INITIAL_APP_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    category: 'CLIMATE',
    title: 'Cảnh Báo Vi Khí Hậu Buồng B-02',
    desc: 'Nhiệt độ đạt ngưỡng 24.5°C. Rèm lạnh đối lưu tự động vận hành.',
    time: '2 phút trước',
    read: false,
    link: '/operator?room=RM02&alert=true',
    badge: 'Vào buồng B-02 & xử lý',
  },
  {
    id: 'notif-2',
    type: 'success',
    category: 'CONTRACT',
    title: 'Hợp Đồng Thuê Khay TRAY-04 Đã Khóa',
    desc: 'Giao dịch Serialized thành công trên CSDL SmartMushroomDB.',
    time: '15 phút trước',
    read: false,
    link: '/ho-so?highlight=TRAY-04',
    badge: 'Xem hợp đồng & chứng từ',
  },
  {
    id: 'notif-3',
    type: 'info',
    category: 'HARVEST',
    title: 'Nhắc Nhở Chu Kỳ Thu Hoạch',
    desc: 'Khay Đông Trùng Hạ Thảo của bạn đã sẵn sàng cắt nấm đợt 1.',
    time: '1 giờ trước',
    read: false,
    link: '/khay-cua-toi?action=harvest',
    badge: 'Yêu cầu thu hoạch ngay',
  },
];

/**
 * Điều hướng thông minh chuẩn hóa cho toàn bộ thông báo hiện tại và sau này
 * @param notif Thông báo cần chuyển hướng
 * @param router Đối tượng Next.js Router
 * @param onCompleted Callback thực hiện sau khi chuyển trang (đóng popup/sidebar, mark read)
 */
export function navigateToNotificationDestination(
  notif: AppNotification,
  router: { push: (url: string) => void },
  onCompleted?: () => void
) {
  if (onCompleted) {
    onCompleted();
  }

  // 1. Nếu thông báo đã có link chỉ định cụ thể hợp lệ
  if (notif.link && notif.link.trim() !== '') {
    router.push(notif.link);
    return;
  }

  // 2. Tự động suy luận trang chức năng trọng điểm dựa trên category hoặc từ khóa tiêu đề cho các thông báo mới sau này
  const cat = (notif.category || '').toUpperCase();
  const text = (notif.title + ' ' + notif.desc).toLowerCase();

  if (cat === 'CLIMATE' || text.includes('vi khí hậu') || text.includes('nhiệt độ') || text.includes('độ ẩm') || text.includes('buồng')) {
    if (text.includes('b-02') || text.includes('rm02')) {
      router.push('/operator?room=RM02&alert=true');
    } else if (text.includes('b-03') || text.includes('rm03')) {
      router.push('/operator?room=RM03&alert=true');
    } else {
      router.push('/operator?alert=true');
    }
    return;
  }

  if (cat === 'CONTRACT' || cat === 'PAYMENT' || text.includes('hợp đồng') || text.includes('giao dịch') || text.includes('thanh toán') || text.includes('biên lai')) {
    router.push('/ho-so?tab=contracts');
    return;
  }

  if (cat === 'HARVEST' || text.includes('thu hoạch') || text.includes('cắt nấm')) {
    router.push('/khay-cua-toi?action=harvest');
    return;
  }

  if (cat === 'TRAY' || text.includes('khay nấm') || text.includes('phôi nấm')) {
    router.push('/khay-cua-toi');
    return;
  }

  if (cat === 'MARKET' || text.includes('sàn nông sản') || text.includes('mua sỉ') || text.includes('sản phẩm')) {
    router.push('/san-nong-san');
    return;
  }

  if (cat === 'PROFIT' || text.includes('lợi nhuận') || text.includes('dự toán')) {
    router.push('/tinh-loi-nhuan');
    return;
  }

  // Mặc định về trang chủ nếu không phân loại được
  router.push('/');
}
