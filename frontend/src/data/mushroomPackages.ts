export type MushroomCategory = "ALL" | "CULINARY" | "MEDICINAL" | "PREMIUM";

export interface MushroomSpeciesDetail {
  id: string;
  packageId: number;
  name: string;
  scientificName: string;
  category: "CULINARY" | "MEDICINAL" | "PREMIUM";
  categoryLabel: string;
  badge: string;
  badgeTheme: "emerald" | "amber" | "sky" | "purple";
  price: string;
  rawPrice: number;
  expectedYield: string;
  duration: string;
  durationDays: number;
  imageUrl: string;
  isPopular?: boolean;
  shortDesc: string;
  origin: string;
  certification: string;
  flavorProfile: string;
  healthBenefits: string[];
  recommendedUses: string[];
  growingEnvironment: {
    temp: string;
    humidity: string;
    co2: string;
    lightSpectrum: string;
  };
  faasFeatures: string[];
}

export const MUSHROOM_PACKAGES: MushroomSpeciesDetail[] = [
  {
    id: "pkg-1",
    packageId: 1,
    name: "Nấm Bào Ngư Xám Nhật",
    scientificName: "Pleurotus ostreatus",
    category: "CULINARY",
    categoryLabel: "Nấm Ăn Dinh Dưỡng",
    badge: "VietGAP Chuẩn Sạch",
    badgeTheme: "emerald",
    price: "299.000 VNĐ",
    rawPrice: 299000,
    expectedYield: "2.5 - 3.0 kg",
    duration: "30 Ngày",
    durationDays: 30,
    imageUrl: "/images/real-farm/real-oyster-macro.jpg",
    shortDesc: "Thịt giòn dai tự nhiên, giàu protein thực vật và axit amin thiết yếu. Lựa chọn số một cho bữa ăn gia đình lành mạnh.",
    origin: "Chủng giống thuần F1 Nagano, Nhật Bản",
    certification: "VietGAP số VG-2026-M01 • An toàn VSTP",
    flavorProfile: "Ngọt thanh tự nhiên, giòn dai khi nấu chín, hậu vị béo nhẹ",
    healthBenefits: [
      "Hàm lượng protein thực vật tương đương thịt bò hữu cơ",
      "Giàu Lovastatin tự nhiên hỗ trợ hạ cholesterol máu",
      "Chứa beta-glucan tăng cường hệ thống miễn dịch tự nhiên",
      "Cung cấp dồi dào vitamin nhóm B (B1, B2, B12) và khoáng chất Kali"
    ],
    recommendedUses: [
      "Xào tỏi thảo mộc, nấu lẩu nấm dưỡng sinh",
      "Nấu canh sườn thanh nhiệt, làm chả nấm chay dinh dưỡng",
      "Nướng mỡ hành hoặc áp chảo sốt tiêu đen"
    ],
    growingEnvironment: {
      temp: "22 – 25 °C",
      humidity: "85 – 90 % RH",
      co2: "< 900 ppm",
      lightSpectrum: "Quang phổ tán xạ 5000K dịu nhẹ"
    },
    faasFeatures: [
      "Định danh khay nuôi bằng mã QR riêng biệt",
      "Giám sát nhiệt độ, độ ẩm vi khí hậu 24/7",
      "Xem Timelapse nấm bung dù từng ngày",
      "Miễn phí thu hoạch & giao nấm tươi tận nhà"
    ]
  },
  {
    id: "pkg-2",
    packageId: 2,
    name: "Nấm Hoàng Kim (Bào Ngư Vàng)",
    scientificName: "Pleurotus citrinopileatus",
    category: "CULINARY",
    categoryLabel: "Nấm Ăn Dinh Dưỡng",
    badge: "Giàu Kẽm & Selen",
    badgeTheme: "amber",
    price: "320.000 VNĐ",
    rawPrice: 320000,
    expectedYield: "2.2 - 2.8 kg",
    duration: "25 Ngày",
    durationDays: 25,
    imageUrl: "/images/real-farm/real-farm-racks-1.jpg",
    shortDesc: "Sắc vàng óng hoàng gia bắt mắt, hương bùi béo tựa hạt dẻ rang, giàu chất chống oxy hóa tự nhiên.",
    origin: "Trung tâm Nghiên cứu Giống Nấm Vùng Núi Bắc Bộ",
    certification: "VietGAP Cleanroom • Canh tác 100% không hóa chất",
    flavorProfile: "Hương bùi ngậy độc đáo, dai mềm vừa phải, mùi thơm dịu",
    healthBenefits: [
      "Chứa hàm lượng Ergothioneine chống lão hóa cực mạnh",
      "Giàu khoáng chất vi lượng: Kẽm, Selen và Magie",
      "Hỗ trợ ổn định đường huyết và điều hòa trao đổi chất",
      "Hàm lượng calo thấp, lý tưởng cho chế độ ăn kiêng Eat-Clean"
    ],
    recommendedUses: [
      "Làm món nấm chiên giòn sốt me hoàng kim",
      "Nấu cháo hạt sen nấm bồi bổ sức khỏe cho người lớn tuổi",
      "Trộn salad nấm tươi cùng dầu giấm ô-liu"
    ],
    growingEnvironment: {
      temp: "24 – 27 °C",
      humidity: "82 – 88 % RH",
      co2: "< 850 ppm",
      lightSpectrum: "LED quang phổ ấm 4000K"
    },
    faasFeatures: [
      "Định danh khay nuôi bằng mã QR riêng biệt",
      "Cảnh báo tự động vi khí hậu qua IoT LoRaWAN",
      "Theo dõi hình thái chùm nấm qua camera",
      "Bảo hiểm 100% sản lượng cam kết"
    ]
  },
  {
    id: "pkg-3",
    packageId: 3,
    name: "Nấm Mối Đen Thượng Hạng",
    scientificName: "Xerula radicata",
    category: "PREMIUM",
    categoryLabel: "Đặc Sản Cao Cấp",
    badge: "Vua Nấm Đặc Sản",
    badgeTheme: "purple",
    price: "490.000 VNĐ",
    rawPrice: 490000,
    expectedYield: "1.8 - 2.2 kg",
    duration: "40 Ngày",
    durationDays: 40,
    imageUrl: "/images/real-farm/real-farm-racks-2.jpg",
    shortDesc: "Thịt nấm đen bóng, thân dài chắc nịch, vị ngọt sâu đậm đà sánh ngang nấm mối thiên nhiên rừng tràm.",
    origin: "Tuyển chọn phối giống vi sinh bản địa Tây Nguyên",
    certification: "Chuẩn Hữu Cơ Sinh Học FaaS Class A",
    flavorProfile: "Giòn sần sật, ngọt sâu hậu vị, hương thơm thanh khiết",
    healthBenefits: [
      "Hàm lượng canxi và phốt-pho dồi dào giúp xương chắc khỏe",
      "Chứa hoạt chất Oudemansin hỗ trợ kháng viêm và tăng sức đề kháng",
      "Hỗ trợ hệ tiêu hóa hoạt động trơn tru, cải thiện giấc ngủ",
      "Bảo vệ tế bào gan khỏi tác nhân oxy hóa độc hại"
    ],
    recommendedUses: [
      "Kho tiêu nấm mối đen niêu đất",
      "Xào thịt bò phi lê cùng hành tây và tiêu xanh",
      "Nấu cháo gà nấm mối đen bồi bổ sau ốm"
    ],
    growingEnvironment: {
      temp: "23 – 26 °C",
      humidity: "88 – 92 % RH",
      co2: "< 800 ppm",
      lightSpectrum: "Ánh sáng tán xạ Cleanroom 4500K"
    },
    faasFeatures: [
      "Đặt khay ở kệ trung tâm với luồng gió vi khí hậu tối ưu",
      "Camera HD theo dõi tốc độ vươn lóng nấm",
      "Đóng gói hút chân không giữ trọn độ giòn",
      "Cam kết 1 đổi 1 nếu sản lượng dưới định mức"
    ]
  },
  {
    id: "pkg-4",
    packageId: 4,
    name: "Nấm Hương Hữu Cơ (Shiitake)",
    scientificName: "Lentinula edodes",
    category: "CULINARY",
    categoryLabel: "Nấm Ăn Dinh Dưỡng",
    badge: "Organic 100%",
    badgeTheme: "emerald",
    price: "380.000 VNĐ",
    rawPrice: 380000,
    expectedYield: "1.5 - 2.0 kg",
    duration: "45 Ngày",
    durationDays: 45,
    imageUrl: "/images/real-farm/real-mushroom-shelves.jpg",
    shortDesc: "Vị umami trứ danh của ẩm thực Á Đông, được nuôi cấy trên giá thể mùn cưa cây sồi hữu cơ chuẩn sạch.",
    origin: "Giống gốc thuần chủng Sapa ôn đới",
    certification: "Chứng nhận Organic tiêu chuẩn JAS Nhật Bản",
    flavorProfile: "Mùi hương gỗ thơm nồng, vị ngọt đậm đà, thịt nấm dẻo bùi",
    healthBenefits: [
      "Hợp chất Lentinan hỗ trợ hệ miễn dịch và ức chế tế bào lạ",
      "Eritadenine giúp thanh lọc mỡ máu và tốt cho tim mạch",
      "Chứa tiền vitamin D2 chuyển hóa tự nhiên dưới ánh sáng UV-B",
      "Cân bằng huyết áp và nâng cao sinh lực tổng thể"
    ],
    recommendedUses: [
      "Hầm gà ác thảo mộc, tiềm đông trùng bồi bổ",
      "Xào dầu hào sốt nấm hương bông cải xanh",
      "Phơi sấy tự nhiên làm gia vị hạt nêm nấm hữu cơ"
    ],
    growingEnvironment: {
      temp: "19 – 23 °C",
      humidity: "85 – 92 % RH",
      co2: "< 950 ppm",
      lightSpectrum: "Bổ sung phổ UV-B kích thích tổng hợp D2"
    },
    faasFeatures: [
      "Điều khiển chu kỳ tạo sốc nhiệt thúc đẩy ra hoa nấm",
      "Giám sát độ mở tán nấm đạt độ dày cực đại",
      "Miễn phí sấy đối lưu công nghệ nhiệt thấp theo yêu cầu",
      "Bảo hiểm rủi ro nuôi trồng 100%"
    ]
  },
  {
    id: "pkg-5",
    packageId: 5,
    name: "Nấm Hầu Thủ (Lion's Mane)",
    scientificName: "Hericium erinaceus",
    category: "MEDICINAL",
    categoryLabel: "Dược Liệu Quý",
    badge: "Bồi Bổ Não Bộ",
    badgeTheme: "sky",
    price: "590.000 VNĐ",
    rawPrice: 590000,
    expectedYield: "1.2 - 1.5 kg",
    duration: "45 Ngày",
    durationDays: 45,
    imageUrl: "/images/real-farm/real-lionsmane-macro.jpg",
    shortDesc: "Quả thể hình cầu trắng tuyết như bờm sư tử, được mệnh danh là siêu thực phẩm nuôi dưỡng não bộ và hệ thần kinh.",
    origin: "Viện Hàn lâm Khoa học Nông nghiệp Hokkaido",
    certification: "Chứng nhận Dược liệu Sạch ISO Class 5",
    flavorProfile: "Thịt nấm mềm ngọt thanh thoát, hương vị tinh tế tựa thịt cua/tôm hùm",
    healthBenefits: [
      "Hericenones & Erinacines kích thích sinh trưởng tế bào thần kinh NGF",
      "Tăng cường trí nhớ, nâng cao độ tập trung và minh mẫn",
      "Bảo vệ niêm mạc dạ dày, hỗ trợ điều trị viêm loét đường ruột",
      "Giảm lo âu, căng thẳng thần kinh và cải thiện chất lượng giấc ngủ"
    ],
    recommendedUses: [
      "Áp chảo bơ tỏi ăn kèm bít tết hoặc cơm gạo lứt",
      "Hãm trà nấm hầu thủ uống tĩnh tâm buổi sáng",
      "Sấy thăng hoa tán bột pha nước ấm bồi bổ trí não"
    ],
    growingEnvironment: {
      temp: "20 – 24 °C",
      humidity: "88 – 93 % RH",
      co2: "< 750 ppm",
      lightSpectrum: "LED 4500K khuếch tán bảo vệ tơ nấm"
    },
    faasFeatures: [
      "Đặt khay ở buồng vô trùng áp suất dương +20 Pa",
      "Camera 4K theo dõi độ phát triển của chùm tua trắng",
      "Hỗ trợ sấy thăng hoa nguyên dạng bảo lưu 99% dược chất",
      "Tặng kèm hũ thủy tinh tiệt trùng bảo quản cao cấp"
    ]
  },
  {
    id: "pkg-6",
    packageId: 6,
    name: "Nấm Linh Chi Đỏ Luxury",
    scientificName: "Ganoderma lucidum",
    category: "MEDICINAL",
    categoryLabel: "Dược Liệu Quý",
    badge: "Ưa Chuộng Nhất • FaaS VIP",
    badgeTheme: "amber",
    price: "899.000 VNĐ",
    rawPrice: 899000,
    expectedYield: "1.2 - 1.5 kg",
    duration: "90 Ngày",
    durationDays: 90,
    imageUrl: "/images/real-farm/real-reishi-macro.jpg",
    isPopular: true,
    shortDesc: "Vua thảo dược Đông y thượng đẳng, quả thể đỏ bóng như gỗ quý, tích tụ hàm lượng bào tử và dược chất đậm đặc.",
    origin: "Chủng giống Xích Chi thuần chủng Hàn Quốc",
    certification: "Đạt chuẩn Dược điển Việt Nam & ISO 22000",
    flavorProfile: "Vị đắng thanh thuần túy của Triterpenoid, hậu vị ngọt thảo mộc",
    healthBenefits: [
      "Polysaccharides & Germanium hữu cơ hỗ trợ giải độc gan, bổ thận",
      "Điều hòa huyết áp, bảo vệ tim mạch và giảm mỡ máu",
      "Làm chậm quá trình lão hóa, giữ gìn làn da tươi trẻ",
      "Tăng cường hệ miễn dịch tự nhiên, hỗ trợ phòng chống u bướu"
    ],
    recommendedUses: [
      "Thái lát hãm nước uống thanh lọc cơ thể hàng ngày",
      "Ngâm mật ong hoa rừng hoặc ngâm rượu nấm quý",
      "Nấu nước dùng gà hầm thuốc bắc bồi bổ thể lực"
    ],
    growingEnvironment: {
      temp: "24 – 28 °C",
      humidity: "85 – 90 % RH",
      co2: "< 800 ppm",
      lightSpectrum: "Quang phổ 3000K & bước sóng kích thích tán dù"
    },
    faasFeatures: [
      "Vị trí kệ vi khí hậu VIP đón luồng gió đối lưu vô trùng",
      "Thu gom trọn vẹn lớp bụi bào tử linh chi vàng quý giá",
      "Hỗ trợ cắt lát máy công nghiệp và đóng gói hút chân không",
      "Báo cáo sinh trưởng tự động bằng AI hình ảnh định kỳ"
    ]
  },
  {
    id: "pkg-7",
    packageId: 7,
    name: "Đông Trùng Hạ Thảo Cordyceps",
    scientificName: "Cordyceps militaris",
    category: "MEDICINAL",
    categoryLabel: "Dược Liệu Quý",
    badge: "Vô Trùng ISO Class 5",
    badgeTheme: "sky",
    price: "1.499.000 VNĐ",
    rawPrice: 1499000,
    expectedYield: "0.8 - 1.0 kg",
    duration: "60 Ngày",
    durationDays: 60,
    imageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
    shortDesc: "Nuôi cấy khép kín trong buồng vô trùng công nghệ cao, quả thể vàng cam rực rỡ, hàm lượng Cordycepin siêu cao.",
    origin: "Trung tâm Công nghệ Sinh học Tây Tạng & Việt Nam",
    certification: "Tiêu chuẩn Phòng Sạch ISO Class 5 • Kiểm định HPLC",
    flavorProfile: "Mùi thơm dịu thảo mộc đặc trưng, vị ngậy bùi thanh khiết",
    healthBenefits: [
      "Cordycepin & Adenosine hàm lượng cao phục hồi sinh lực vượt trội",
      "Tăng cường oxy trong máu, cải thiện chức năng hô hấp và phổi",
      "Hỗ trợ chức năng sinh lý và cân bằng nội tiết tố",
      "Chống mệt mỏi mãn tính, giảm suy nhược sau phẫu thuật hoặc ốm dậy"
    ],
    recommendedUses: [
      "Hãm trà đông trùng uống ấm vào mỗi sáng sớm",
      "Chưng cùng yến sào nguyên tổ và đường phèn",
      "Ngâm rượu nếp cái hoa vàng bồi bổ trượng phu"
    ],
    growingEnvironment: {
      temp: "18 – 22 °C",
      humidity: "80 – 85 % RH",
      co2: "< 600 ppm",
      lightSpectrum: "Chiếu sáng quang phổ đặc hiệu 12h sáng / 12h tối"
    },
    faasFeatures: [
      "Môi trường phòng sạch áp suất dương kiểm soát hạt bụi 0.3µm",
      "Camera 4K phân giải cao livestream độc quyền từng khay",
      "Hỗ trợ công nghệ sấy thăng hoa giữ nguyên 100% hình thái",
      "Bảo hiểm rủi ro nuôi trồng hoàn tiền 100%"
    ]
  },
  {
    id: "pkg-8",
    packageId: 8,
    name: "Nấm Vân Chi Hoàng Gia (Turkey Tail)",
    scientificName: "Trametes versicolor",
    category: "PREMIUM",
    categoryLabel: "Đặc Sản Cao Cấp",
    badge: "Dược Liệu Quý Hiếm",
    badgeTheme: "purple",
    price: "750.000 VNĐ",
    rawPrice: 750000,
    expectedYield: "1.0 - 1.3 kg",
    duration: "75 Ngày",
    durationDays: 75,
    imageUrl: "/images/real-farm/real-farm-racks-3.jpg",
    shortDesc: "Quả thể hình rẽ quạt nhiều tầng vân sắc kỳ ảo, chứa hàm lượng Polysaccharide Krestin (PSK) được y học thế giới đánh giá cao.",
    origin: "Giống nấm tự nhiên rừng nguyên sinh Cúc Phương",
    certification: "Tiêu chuẩn Dược thảo FaaS Premium",
    flavorProfile: "Vị đắng dịu mộc mạc, hương thảo mộc tự nhiên lưu luyến",
    healthBenefits: [
      "PSK và PSP kích hoạt mạnh mẽ tế bào bạch cầu và miễn dịch",
      "Thanh nhiệt, giải độc cơ thể và phục hồi chức năng gan",
      "Bảo vệ tế bào khỏe mạnh trước các gốc tự do có hại",
      "Tăng cường sức bền đường tiêu hóa và bảo vệ hệ vi sinh đường ruột"
    ],
    recommendedUses: [
      "Sắc nước uống hàng ngày cùng cam thảo hoặc táo đỏ",
      "Chiết xuất cao nấm cô đặc bồi dưỡng sức khỏe người bệnh",
      "Phối hợp cùng nấm linh chi để nhân đôi hiệu quả thanh lọc"
    ],
    growingEnvironment: {
      temp: "22 – 26 °C",
      humidity: "85 – 90 % RH",
      co2: "< 700 ppm",
      lightSpectrum: "Quang phổ tán xạ 4500K mô phỏng tán rừng"
    },
    faasFeatures: [
      "Giám sát chu kỳ vi khí hậu phân tầng theo từng tuần tuổi",
      "Kiểm tra hàm lượng hoạt chất trước ngày thu hoạch",
      "Đóng gói hộp quà tặng sang trọng lót nhung cao cấp",
      "Cam kết bảo hiểm sản lượng minh bạch"
    ]
  }
];
