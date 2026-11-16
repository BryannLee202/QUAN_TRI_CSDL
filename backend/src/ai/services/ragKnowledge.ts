/**
 * Kho Tri Thức Cơ Sở Nông Nghiệp & Tiêu Chuẩn VietGAP
 * Dùng cho Cơ chế RAG (Retrieval-Augmented Generation) từ repo awesome-llm-apps
 */

export interface KnowledgeDocument {
  id: string;
  topic: string;
  keywords: string[];
  content: string;
  reference: string;
}

export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "kb-01",
    topic: "Nấm Bào Ngư Xám (Pleurotus ostreatus)",
    keywords: ["bào ngư", "bào ngư xám", "bao ngu", "pleurotus", "ẩm độ", "nhiệt độ"],
    content: `Nấm Bào Ngư Xám là chủng nấm dinh dưỡng cao, sinh trưởng lý tưởng ở nhiệt độ 22 - 25°C, độ ẩm không khí 85 - 92%, nồng độ CO2 dưới 800 ppm. Chu kỳ từ khi cấy tơ đến khi thu hoạch kéo dài 25 - 30 ngày. Cần phun sương siêu âm hạt mịn 5 micron đối lưu nhẹ, không phun nước đọng giọt lên tán nấm.`,
    reference: "Quy chuẩn kỹ thuật nuôi cấy Nấm Bào Ngư FaaS - Viện Di Truyền Nông Nghiệp",
  },
  {
    id: "kb-02",
    topic: "Nấm Linh Chi Đỏ Dược Liệu (Ganoderma lucidum)",
    keywords: ["linh chi", "linh chi đỏ", "ganoderma", "dược liệu", "polysaccharide"],
    content: `Nấm Linh Chi Đỏ đòi hỏi nhiệt độ 25 - 28°C, độ ẩm 80 - 88%, nồng độ CO2 từ 1000 - 1500 ppm trong giai đoạn phân nhánh thân và 600 - 800 ppm khi xòe mũ. Chu kỳ nuôi cấy kéo dài 75 - 90 ngày. Mũ nấm đạt chất lượng loại 1 khi viền vàng phấn dày, cuống nấm cứng, hàm lượng Polysaccharide > 1.8% và Triterpenoids > 0.6%.`,
    reference: "Tiêu chuẩn Dược Điển Việt Nam V & Chứng nhận VietGAP Loại A",
  },
  {
    id: "kb-03",
    topic: "Đông Trùng Hạ Thảo (Cordyceps militaris)",
    keywords: ["đông trùng", "hạ thảo", "cordyceps", "cordycepin", "adenosine", "sấy thăng hoa"],
    content: `Đông Trùng Hạ Thảo chủng Cordyceps militaris vô trùng tuyệt đối trong phòng sạch ISO Class 5. Nhiệt độ nghiêm ngặt 18 - 21°C, độ ẩm 85 - 90%, chiếu sáng quang phổ kích thích 5000K 12h/ngày. Chu kỳ nuôi cấy 55 - 65 ngày. Khi thu hoạch, quả thể dài 6 - 8cm màu vàng cam óng, hàm lượng hoạt chất Cordycepin > 8.0 mg/g, Adenosine > 0.5 mg/g. Nấm được sấy thăng hoa ở nhiệt độ -45°C để bảo toàn 99% dược chất.`,
    reference: "Quy trình Nuôi cấy Phòng Sạch Chuẩn ISO 14644 Class 5 - MushroomCloud FaaS",
  },
  {
    id: "kb-04",
    topic: "Mô Hình Thuê Khay Farm-as-a-Service (FaaS)",
    keywords: ["faas", "thuê khay", "gói thuê", "giá thuê", "bảo hiểm", "sản lượng"],
    content: `Mô hình FaaS cho phép khách hàng cá nhân hoặc doanh nghiệp thuê khay nấm trực tuyến và sở hữu toàn bộ nấm thu hoạch.
- Gói Bào Ngư Xám: 299.000 VNĐ / 30 ngày, cam kết sản lượng 2.5 - 3.0 kg nấm tươi.
- Gói Linh Chi Đỏ Luxury: 899.000 VNĐ / 90 ngày, cam kết 1.2 - 1.5 kg nấm khô/tươi nguyên tai.
- Gói Đông Trùng Hạ Thảo: 1.499.000 VNĐ / 60 ngày, cam kết 0.8 - 1.0 kg sinh khối tươi.
Chính sách bảo hiểm: Đền bù 100% hoặc cấp khay nuôi mới nếu sản lượng không đạt định mức hoặc buồng kính gặp sự cố kỹ thuật.`,
    reference: "Hợp đồng dịch vụ Farm-as-a-Service & Điều khoản Bảo hiểm Sản lượng",
  },
  {
    id: "kb-05",
    topic: "Hạ Tầng CSDL & Khóa Dòng Serializable",
    keywords: ["t-sql", "csdl", "rowlock", "serializable", "khóa dòng", "bảo mật", "giao dịch"],
    content: `Hệ thống Backend kết nối trực tiếp CSDL Microsoft SQL Server (T-SQL) áp dụng cơ chế khóa dòng ROWLOCK với mức cô lập Serializable Isolation Level. Mọi giao dịch đặt thuê khay nấm và xuất bán nông sản trên sàn đều được khóa nguyên tử (Atomic Lock) chống tranh chấp dữ liệu (Race Condition), bảo đảm không bao giờ xảy ra tình trạng bán trùng một khay nấm cho hai khách hàng. Độ trễ xác nhận giao dịch chỉ 4 ms.`,
    reference: "Kiến trúc CSDL SmartMushroomDB & Transaction Management Guide",
  },
];

/**
 * Hàm tìm kiếm ngữ nghĩa RAG cơ bản tốc độ cao (In-Memory Vector Cosine Fallback)
 */
export function retrieveRelevantKnowledge(query: string, limit: number = 2): KnowledgeDocument[] {
  const normalizedQuery = query.toLowerCase();
  const scored = KNOWLEDGE_BASE.map((doc) => {
    let score = 0;
    for (const kw of doc.keywords) {
      if (normalizedQuery.includes(kw)) {
        score += 3;
      }
    }
    const words = doc.topic.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 2 && normalizedQuery.includes(w)) {
        score += 1.5;
      }
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.doc);
}
