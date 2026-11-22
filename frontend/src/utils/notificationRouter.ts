/**
 * frontend/src/utils/notificationRouter.ts
 * Hệ thống quản lý & điều hướng thông báo FaaS SmartMushroom
 * - Phân quyền chuẩn xác: Khách hàng chỉ xem khay & hợp đồng cá nhân (/khay-cua-toi, /ho-so), không bao giờ vào dashboard quản trị (/operator).
 * - Lưu trạng thái ĐÃ ĐỌC vào localStorage & BroadcastChannel: Click là mất chấm đỏ vĩnh viễn, không bị hiện lại khi chuyển trang.
 * Tác giả: Lê Minh Tài (Lead Architect)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

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
  targetRole?: 'CUSTOMER' | 'STAFF' | 'ALL';
}

const STORAGE_KEY = 'smartmushroom_read_notification_ids';
const SYNC_CHANNEL_NAME = 'smartmushroom_notifs_sync';

// Danh sách thông báo gốc cho Khách Hàng (Customer)
const CUSTOMER_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-cust-1',
    type: 'alert',
    category: 'CLIMATE',
    title: 'Cảnh Báo Vi Khí Hậu Buồng Nuôi',
    desc: 'Nhiệt độ buồng nấm của bạn đạt ngưỡng 24.5°C. Hệ thống đối lưu tự động vận hành ổn định vi khí hậu.',
    time: '2 phút trước',
    read: false,
    link: '/khay-cua-toi?focus=climate',
    badge: 'Xem vi khí hậu khay của bạn',
    targetRole: 'CUSTOMER',
  },
  {
    id: 'notif-cust-2',
    type: 'success',
    category: 'CONTRACT',
    title: 'Hợp Đồng Thuê Khay TRAY-04 Đã Khóa',
    desc: 'Giao dịch Serialized thành công trên CSDL SmartMushroomDB.',
    time: '15 phút trước',
    read: false,
    link: '/ho-so?highlight=TRAY-04',
    badge: 'Xem hợp đồng & chứng từ',
    targetRole: 'CUSTOMER',
  },
  {
    id: 'notif-cust-3',
    type: 'info',
    category: 'HARVEST',
    title: 'Nhắc Nhở Chu Kỳ Thu Hoạch',
    desc: 'Khay Đông Trùng Hạ Thảo của bạn đã sẵn sàng cắt nấm đợt 1.',
    time: '1 giờ trước',
    read: false,
    link: '/khay-cua-toi?action=harvest',
    badge: 'Yêu cầu thu hoạch ngay',
    targetRole: 'CUSTOMER',
  },
];

// Danh sách thông báo gốc cho Quản Trị Viên & Kỹ Thuật Viên (Admin / Operator)
const STAFF_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-staff-1',
    type: 'alert',
    category: 'CLIMATE',
    title: 'Cảnh Báo Vi Khí Hậu Buồng B-02',
    desc: 'Nhiệt độ đạt ngưỡng 24.5°C. Rèm lạnh đối lưu tự động vận hành.',
    time: '2 phút trước',
    read: false,
    link: '/operator?room=RM02&alert=true',
    badge: 'Vào buồng B-02 & can thiệp',
    targetRole: 'STAFF',
  },
  {
    id: 'notif-staff-2',
    type: 'success',
    category: 'CONTRACT',
    title: 'Hợp Đồng Thuê Khay TRAY-04 Đã Khóa',
    desc: 'Giao dịch Serialized thành công trên CSDL SmartMushroomDB.',
    time: '15 phút trước',
    read: false,
    link: '/ho-so?highlight=TRAY-04',
    badge: 'Xem chứng từ hợp đồng',
    targetRole: 'STAFF',
  },
  {
    id: 'notif-staff-3',
    type: 'info',
    category: 'HARVEST',
    title: 'Yêu Cầu Thu Hoạch Khách Hàng',
    desc: 'Khay Đông Trùng Hạ Thảo đã đến chu kỳ thu hoạch đợt 1.',
    time: '1 giờ trước',
    read: false,
    link: '/khay-cua-toi?action=harvest',
    badge: 'Kiểm tra & đóng gói',
    targetRole: 'STAFF',
  },
];

/**
 * Đọc tập hợp các ID thông báo đã đọc từ localStorage
 */
export function getReadNotificationIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Lưu 1 thông báo vào danh sách đã đọc và phát sóng đồng bộ cho toàn bộ Tab & Component
 */
export function persistNotificationRead(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const currentSet = getReadNotificationIds();
    currentSet.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(currentSet)));

    // Phát sóng qua BroadcastChannel để Navbar, Sidebar, và các Tab khác tự động tắt chấm đỏ
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ action: 'READ', id });
      channel.close();
    }
  } catch {
    // Không chặn luồng nếu localStorage bị khóa
  }
}

/**
 * Đánh dấu toàn bộ thông báo là đã đọc
 */
export function persistAllNotificationsRead(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const currentSet = getReadNotificationIds();
    ids.forEach((id) => currentSet.add(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(currentSet)));

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ action: 'READ_ALL', ids });
      channel.close();
    }
  } catch {
    // Bỏ qua nếu lỗi
  }
}

/**
 * Lấy danh sách thông báo đã lọc theo vai trò người dùng và cập nhật trạng thái đã đọc từ localStorage
 */
export function getNotificationsByRole(isStaff: boolean): AppNotification[] {
  const baseList = isStaff ? STAFF_NOTIFICATIONS : CUSTOMER_NOTIFICATIONS;
  const readIds = getReadNotificationIds();

  return baseList.map((n) => ({
    ...n,
    read: readIds.has(n.id),
  }));
}

/**
 * Điều hướng thông minh phân quyền chuẩn xác:
 * - Khách hàng KHÔNG BAO GIỜ bị dẫn vào /operator
 * - Tự động lưu trạng thái đã đọc vào localStorage
 */
export function navigateToNotificationDestination(
  notif: AppNotification,
  router: { push: (url: string) => void },
  isStaff: boolean,
  onCompleted?: () => void
) {
  // 1. Lưu vĩnh viễn trạng thái đã đọc
  persistNotificationRead(notif.id);

  if (onCompleted) {
    onCompleted();
  }

  // 2. Kiểm tra nếu là Khách Hàng (Customer)
  if (!isStaff) {
    // Nếu link trỏ vào trang quản trị /operator, chuyển ngay về trang khay của khách hàng
    if (notif.link.startsWith('/operator') || notif.category === 'CLIMATE') {
      router.push('/khay-cua-toi');
      return;
    }
    if (notif.category === 'CONTRACT' || notif.link.startsWith('/ho-so')) {
      router.push('/ho-so?highlight=TRAY-04');
      return;
    }
    if (notif.category === 'HARVEST' || notif.link.includes('harvest')) {
      router.push('/khay-cua-toi?action=harvest');
      return;
    }
    router.push(notif.link || '/khay-cua-toi');
    return;
  }

  // 3. Nếu là Quản trị viên / Kỹ thuật viên (Staff: Admin/Operator)
  if (notif.link && notif.link.trim() !== '') {
    router.push(notif.link);
    return;
  }

  // 4. Fallback suy luận cho các thông báo mới trong tương lai
  const cat = (notif.category || '').toUpperCase();
  const text = (notif.title + ' ' + notif.desc).toLowerCase();

  if (cat === 'CLIMATE' || text.includes('vi khí hậu') || text.includes('buồng')) {
    if (isStaff) {
      router.push('/operator?room=RM02&alert=true');
    } else {
      router.push('/khay-cua-toi');
    }
    return;
  }

  if (cat === 'CONTRACT' || text.includes('hợp đồng') || text.includes('giao dịch')) {
    router.push('/ho-so?tab=contracts');
    return;
  }

  if (cat === 'HARVEST' || text.includes('thu hoạch')) {
    router.push('/khay-cua-toi?action=harvest');
    return;
  }

  router.push(isStaff ? '/operator' : '/khay-cua-toi');
}

/**
 * Custom React Hook dùng chung cho cả NotificationBell (Navbar) và RightControlHub (Drawer)
 * Đảm bảo đồng bộ 100% dữ liệu, trạng thái đã đọc và chấm đỏ biến mất tức thì
 */
export function useAppNotifications(isStaff: boolean) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Tải danh sách thông báo và đồng bộ trạng thái đã đọc từ localStorage
  useEffect(() => {
    setNotifications(getNotificationsByRole(isStaff));
  }, [isStaff]);

  // Lắng nghe BroadcastChannel để đồng bộ tức thì giữa Navbar, Drawer và các Tab
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.action === 'READ' && event.data?.id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === event.data.id ? { ...n, read: true } : n))
        );
      } else if (event.data?.action === 'READ_ALL') {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markItemAsRead = useCallback((id: string) => {
    persistNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    persistAllNotificationsRead(ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markItemAsRead,
    markAllAsRead,
  };
}
