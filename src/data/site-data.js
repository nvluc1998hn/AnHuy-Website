(function () {
  const cdn = "https://dytbw3ui6vsu6.cloudfront.net/media/wysiwyg/";
  const cdnAnhuy =
    "https://pub-adb46506c121483a813c92eba32ee898.r2.dev/hero-header/";
  const productCdn =
    "https://dytbw3ui6vsu6.cloudfront.net/media/catalog/product/resize/500x500/Hanoia/";

  const menuImages = [
    `${cdn}BlackFriday_GG_900x900_copy.png`,
    `${cdn}HNA_EOSS_R2_Website_900x900_1.png`,
    `${cdn}HNA_Menu_2504_NEW.png`,
    `${cdn}PC_Gift_guide_web_1.jpg`,
    `${cdn}HNA_Menu_2504.png`,
    `${cdn}HANOIA2-0205_5_11zon_1.jpg`,
    `${cdn}JW23_1.png`,
    `${cdn}5_15.png`,
    `${cdn}HANOIA2-0205_5_11zon_1.jpg`,
  ];

  const tileImages = [
    `https://pub-adb46506c121483a813c92eba32ee898.r2.dev/products/fake/1779960143857-art03977.webp`,
    `https://pub-adb46506c121483a813c92eba32ee898.r2.dev/products/fake-khay-003/1779960872828-rau04058.webp`,
    `${cdn}Hanoia_12__1.webp`,
    `${cdn}Anh_4_5_SNS_drop_2_FW26_5__1.JPG`,
    `${cdn}Anh_4_5_SNS_drop_2_FW26_3__1.JPG`,
    `${cdn}Anh_4_5_SNS_drop_2_FW26_7__1.webp`,
    `${cdn}z5759741905299_9cf931c944f68c76fa9cd79bf6f560bc_3.webp`,
  ];

  window.SiteData = {
    cdn,
    menuImages,
    tileImages,
    navGroups: [
      // { title: 'BUY MORE SAVE MORE', image: menuImages[0], items: [] },
      // { title: 'END OF SEASON SALE', image: menuImages[1], items: ['Trang trí nhà cửa', '-30%', '-40%', '-50%'] },
      {
        title: "Hàng mới",
        image: menuImages[2],
        columns: [
          [
            "Trang trí nhà",
            "FW2026 : Nét tỉ mỉ trong sơn mài",
            "FW2026 : Sắc độ phân tầng",
            "SS2026 : Mã khai niên",
          ],
          ["Thời trang", "AnHuyx COMAY | GIỮA HAI MIỀN SÁNG TẠO"],
        ],
      },
      {
        title: "Quà tặng",
        image: menuImages[3],
        items: [
          "Quà tặng theo dịp",
          "Quà tặng theo người nhận",
          "Quà tặng doanh nghiệp",
        ],
      },
      {
        title: "Trang trí nhà",
        image: menuImages[4],
        columns: [
          [
            "Đồ trang trí",
            "Bình hoa",
            "Hộp trà, Hộp mứt tết",
            "Khay",
            "Tranh, khung ảnh",
            "Dụng cụ pha trà cafe",
          ],
          ["Nội thất", "Bàn", "Ghế", "Tủ kệ giường", "Đèn bàn, Đèn treo tường"],
        ],
      },
      {
        title: "Về An Huy",
        image: menuImages[8],
        items: ["Niềm đam mê", "Nghệ thuật sơn mài"],
      },
    ],
    heroSlides: [
      {
        desktop: `${cdnAnhuy}hero-pic-anhuy-1.jpg`,
        mobile: `${cdnAnhuy}hero-pic-anhuy-1.jpg`,
      },
      {
        desktop: `${cdnAnhuy}hero-pic-anhuy-2.jpg`,
        mobile: `${cdnAnhuy}hero-pic-anhuy-2.jpg`,
      },
      {
        desktop: `${cdnAnhuy}hero-pic-anhuy-3.jpg`,
        mobile: `${cdnAnhuy}hero-pic-anhuy-3.jpg`,
      },
    ],
    products: [
      {
        name: "Khay Awakening",
        price: "7.500.000 ₫",
        tag: "Sale %",
        image: `${productCdn}HNA_A24AG01_19_1.webp`,
        collection: "FW2026",
        material: "Sơn mài thủ công trên vóc gỗ",
        size: "32 x 22 x 3 cm",
        description:
          "Khay trang trí với bề mặt sơn mài nhiều lớp, hoàn thiện bóng sâu và phù hợp làm điểm nhấn cho bàn trà hoặc tủ console.",
      },
      {
        name: "Bình hoa Lotus",
        price: "12.900.000 ₫",
        tag: "Best Seller",
        image: tileImages[1],
        collection: "Botanica",
        material: "Sơn mài, bạc thếp và hoàn thiện thủ công",
        size: "Cao 28 cm",
        description:
          "Bình hoa tạo hình mềm, lấy cảm hứng từ đường nét tự nhiên và sắc độ chuyển lớp đặc trưng của kỹ nghệ sơn mài.",
      },
      {
        name: "Hộp trà Botanica",
        price: "4.800.000 ₫",
        tag: "New",
        image: tileImages[2],
        collection: "Botanica",
        material: "Sơn mài trên gỗ, lót nhung",
        size: "18 x 18 x 9 cm",
        description:
          "Hộp trà nhỏ gọn dành cho nghi thức tiếp khách, phối màu trầm ấm và chi tiết thủ công tinh tế.",
      },
      {
        name: "Đèn bàn Mountain",
        price: "18.500.000 ₫",
        tag: "Top Pick",
        image: tileImages[3],
        collection: "Mountain",
        material: "Sơn mài, kim loại và chụp vải",
        size: "Cao 46 cm",
        description:
          "Đèn bàn mang dáng dấp điêu khắc, kết hợp ánh sáng ấm với thân đèn sơn mài có chiều sâu thị giác.",
      },
    ],
    topPicks: [
      {
        label: "ĐÈN",
        group: "MOUNTAIN",
        front: tileImages[0],
        back: tileImages[1],
      },
      {
        label: "HỘP TRÀ",
        group: "MOUNTAIN",
        front: tileImages[2],
        back: tileImages[3],
      },
      {
        label: "BÌNH NƯỚC",
        group: "MOUNTAIN",
        front: tileImages[4],
        back: tileImages[5],
      },
      {
        label: "HỘP VUÔNG",
        group: "ETHNIC",
        front: tileImages[6],
        back: tileImages[0],
      },
      {
        label: "KHUNG ẢNH",
        group: "BOTANICA",
        front: tileImages[1],
        back: tileImages[4],
      },
      {
        label: "HỘP TRÒN",
        group: "BOTANICA",
        front: tileImages[5],
        back: tileImages[6],
      },
    ],
    furnitureImages: [
      `${cdn}_nh_Homepage_1_Copy_.webp`,
      `${cdn}Homepage_2_Copy_.webp`,
      `${cdn}HANOIA2-0205_5_11zon_1.jpg`,
    ],
    capacityPage: {
      title: "Năng lực triển khai",
      description:
        "Với nền tảng hơn 25 năm kinh nghiệm trong lĩnh vực chế tác thủ công mỹ nghệ, An Huy sở hữu hệ thống sản xuất quy mô, đội ngũ nghệ nhân lành nghề cùng quy trình quản trị chuyên nghiệp, sẵn sàng đáp ứng mọi yêu cầu của các dự án từ nhỏ đến quy mô lớn.",
      image: `${cdn}Hanoia_12__1.webp`,
      imageCaption: "Xưởng sản xuất An Huy · Hà Nội",
      galleryImages: [
        `${cdn}Hanoia_12__1.webp`,
        `${cdn}HANOIA2-0205_5_11zon_1.jpg`,
        `${cdn}_nh_Homepage_1_Copy_.webp`,
      ],
      craftImage: tileImages[0],
      systemTitle: "Hệ thống sản xuất chuyên nghiệp",
      systemDescription:
        "An Huy đầu tư bài bản từ hạ tầng sản xuất, kho bãi, đội ngũ nhân sự đến quy trình tác nghiệp. Hệ thống này giúp An Huy tiếp nhận đơn hàng lớn, đảm bảo tính ổn định, đồng bộ và chính xác trong từng giai đoạn.",
      metrics: [
        {
          icon: "warehouse",
          value: "8.000m²",
          label: "Diện tích xưởng & kho",
          description:
            "Không gian sản xuất và lưu trữ rộng lớn, đáp ứng các đơn hàng quy mô lớn.",
        },
        {
          icon: "users",
          value: "120+",
          label: "Nhân viên & nghệ nhân",
          description:
            "Đội ngũ nghệ nhân tay nghề cao, giàu kinh nghiệm và tâm huyết với từng sản phẩm.",
        },
        {
          icon: "vase",
          value: "5.000+",
          label: "Sản phẩm / năm",
          description:
            "Năng lực sản xuất lớn, đảm bảo tiến độ và chất lượng cho mọi dự án.",
        },
        {
          icon: "handshake",
          value: "50+",
          label: "Đối tác chiến lược",
          description:
            "Hợp tác cùng các đối tác, khách sạn, resort và doanh nghiệp trong và ngoài nước.",
        },
        {
          icon: "clipboard",
          value: "100+",
          label: "Dự án đã triển khai",
          description:
            "Kinh nghiệm triển khai đa dạng các dự án từ khách sạn, resort đến không gian sống cao cấp.",
        },
        {
          icon: "shield",
          value: "100%",
          label: "Kiểm soát chất lượng",
          description:
            "Quy trình kiểm soát chất lượng nghiêm ngặt tại từng công đoạn sản xuất.",
        },
      ],
      processTitle: "Quy trình triển khai khép kín",
      processDescription:
        "Mỗi sản phẩm của An Huy đều trải qua quy trình khép kín, đảm bảo tính thẩm mỹ, độ bền và giá trị nghệ thuật cao nhất.",
      processSteps: [
        {
          title: "Thiết kế & phát triển mẫu",
          image: `${cdn}Homepage_2_Copy_.webp`,
          description:
            "Đội ngũ thiết kế sáng tạo, phát triển mẫu độc bản theo yêu cầu của dự án.",
        },
        {
          title: "Chế tác thủ công",
          image: tileImages[6],
          description:
            "Nghệ nhân lành nghề trực tiếp thực hiện từng công đoạn với sự tỉ mỉ và tinh tế.",
        },
        {
          title: "Kiểm định chất lượng",
          image: tileImages[2],
          description:
            "Kiểm tra nghiêm ngặt ở từng công đoạn trước khi hoàn thiện.",
        },
        {
          title: "Đóng gói & bàn giao",
          image: `${cdn}HNA_Menu_2504.png`,
          description:
            "Đóng gói chuyên nghiệp, vận chuyển an toàn và đúng tiến độ cam kết.",
        },
      ],
      projectsTitle: "Kinh nghiệm triển khai dự án",
      projectsDescription:
        "An Huy tự hào là đối tác tin cậy của nhiều khách sạn, resort, nhà hàng và không gian sống cao cấp trên toàn quốc và quốc tế.",
      projectStats: [
        { value: "100+", label: "Dự án đã triển khai" },
        { value: "50+", label: "Đối tác chiến lược" },
      ],
      projects: [
        {
          title: "Boutique Lacquer Multiplex",
          location: "Hà Nội",
          image: `${cdn}HNA_Menu_2504_NEW.png`,
          description:
            "Cung cấp tranh sơn mài và đồ decor cho khu vực lobby & lounge.",
        },
        {
          title: "Hotel Maison Resort",
          location: "Nha Trang",
          image: `${cdn}HANOIA2-0205_5_11zon_1.jpg`,
          description: "Thi công và bàn giao nội thất trang trí cao cấp.",
        },
        {
          title: "Capella Hanoi",
          location: "Hà Nội",
          image: `${cdn}PC_Gift_guide_web_1.jpg`,
          description:
            "Cung cấp vật phẩm trang trí nghệ thuật và quà tặng thủ công.",
        },
      ],
      services: [
        {
          icon: "tools",
          title: "Thiết kế & sản xuất",
          description:
            "Chủ động từ thiết kế đến sản xuất, đảm bảo tính độc bản.",
        },
        {
          icon: "truck",
          title: "Vận chuyển & lắp đặt",
          description:
            "Đội ngũ lắp đặt chuyên nghiệp, an toàn và đúng tiến độ.",
        },
        {
          icon: "headphones",
          title: "Hậu mãi & bảo hành",
          description:
            "Chế độ bảo hành rõ ràng, hỗ trợ tận tâm và nhanh chóng.",
        },
        {
          icon: "globe",
          title: "Phục vụ toàn quốc",
          description: "Hệ thống đối tác và kho vận phủ khắp 63 tỉnh thành.",
        },
      ],
    },
    passionPage: {
      eyebrow: "Niềm đam mê",
      title: "Tạo nên giá trị",
      heroImage: `${cdn}_nh_Homepage_1_Copy_.webp`,
      intro: [
        "Năm 1997, AnHuy ra đời tại Việt Nam dựa trên niềm đam mê sâu sắc với thủ công mỹ nghệ và nghệ thuật thiết kế vượt thời gian. Ngày nay, cùng chung tay với những người thợ lành nghề, AnHuyđã trở thành cái nôi hội tụ hàng loạt nghệ sĩ tài năng từ khắp nơi trên thế giới để làm nên các thiết kế tinh xảo.",
        "Ở AnHuy, mọi thiết kế đều được phó thác cho đôi bàn tay khéo léo của các thợ thủ công tại làng nghề sơn mài truyền thống. Ngày ngày hoàn thiện và đổi mới các kỹ thuật lâu đời được truyền lại suốt bao thế hệ, họ luôn không ngừng phát triển chung dựa trên những đổi mới đặc trưng của thời đại.",
      ],
      journeyTitle: "Hành trình tạo nên sản phẩm",
      steps: [
        {
          title: "Kết nối truyền thống",
          image: tileImages[6],
          icon: "hand",
          body: "Ở Hanoia, mọi thiết kế đều được phó thác cho đôi bàn tay khéo léo của các thợ thủ công tại làng nghề sơn mài truyền thống. Ngày ngày hoàn thiện và đổi mới các kỹ thuật lâu đời được truyền lại suốt bao thế hệ.",
        },
        {
          title: "Tận tụy với từng công đoạn",
          image: tileImages[1],
          icon: "brush",
          body: "Bằng sự tận tụy với nghề thuật thủ công, sơn mài vẫn luôn là điểm nhấn trong ngôn ngữ thiết kế của Hanoia. Từ khởi đầu khi chỉ là một nhóm nhỏ các nghệ sĩ và thợ thủ công trong nước cùng chế tác sơn mài cho các thương hiệu xa xỉ nổi tiếng thế giới.",
        },
        {
          title: "Sáng tạo không ngừng",
          image: tileImages[2],
          icon: "light",
          body: "Với mối quan tâm đặc biệt và sự cố gắng không ngừng nghỉ để sáng tạo những sản phẩm sơn mài chất lượng cao, AnHuytự hào mang tới một vũ trụ đa sắc màu của sự cao cấp cho không gian sống.",
        },
        {
          title: "Kỹ thuật chuyên sâu",
          image: tileImages[4],
          icon: "target",
          body: "Điều làm nên sức hấp dẫn đặc biệt của sơn mài AnHuylà khả năng chế tác tuyệt vời, sự am hiểu kỹ thuật chuyên sâu, cùng một con mắt nghệ thuật tinh tế với từng chi tiết nhỏ.",
        },
        {
          title: "Tinh hoa bền vững",
          image: tileImages[5],
          icon: "diamond",
          body: "Tất cả những nhân tố ấy đã định hình bản sắc riêng của thương hiệu và tạo nên sức hấp dẫn cho từng sản phẩm - bền bỉ với thời gian, nhưng vẫn không ngừng truyền cảm hứng cho tương lai.",
        },
      ],
      quote:
        "AnHuytin rằng, mỗi sản phẩm không chỉ là một vật dụng, mà còn là một tác phẩm nghệ thuật mang trong mình câu chuyện về con người, văn hóa và thời gian.",
      quoteImage: `${cdn}Homepage_2_Copy_.webp`,
    },
  };
})();
