export interface TraditionalAccessory {
  id: string;
  name: string;
  category: 'hat' | 'jewelry' | 'footwear' | 'fan_bag' | 'scarf';
  categoryLabel: string;
  gender: 'male' | 'female' | 'both';
  genderLabel: string; // 'Dành cho Nam' | 'Dành cho Nữ' | 'Phù hợp cả Nam & Nữ'
  dynastyOrEra: string;
  region: 'Bắc Bộ' | 'Trung Bộ' | 'Nam Bộ' | 'Toàn quốc';
  historicalOrigins: string;
  culturalMeaning: string;
  wearingGuide: string;
  matchingCostumeIds: string[];
  matchingCostumesText: string;
  image: string;
  photoUrl: string;
  badge: string;
  keyFeatures: string[];
}

export const OFFICIAL_TRADITIONAL_ACCESSORIES: TraditionalAccessory[] = [
  {
    id: 'acc-non-ba-tam',
    name: 'Nón Ba Tầm',
    category: 'hat',
    categoryLabel: 'Nón & Mũ truyền thống',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Thời Lý, Trần, Hậu Lê - Triều Nguyễn',
    region: 'Bắc Bộ',
    historicalOrigins: 'Nón Ba Tầm là dạng nón phẳng tròn truyền thống lâu đời của phụ nữ Đại Việt (từ thời Lý, Trần, Lê đến Nguyễn), lợp từ ba tầm lá gồi hoặc lá cọ phẳng dẹt, vành rộng khoảng 60-70cm. Khác biệt với Nón Quai Thao đi hội, Nón Ba Tầm dùng quai vải mộc hoặc lụa đen giản dị. Trong điển chế phục dựng cổ phong, nữ giới khi mặc Áo Ngũ Thân, Áo Viên Lĩnh và Áo Giao Lĩnh đều đội Nón Ba Tầm để tôn nét đoan trang thuần hậu.',
    culturalMeaning: 'Biểu tượng của nét đẹp thuần hậu, nền nã và chuẩn mực nữ tính truyền thống Việt Nam; gắn liền với tà áo Ngũ Thân, Viên Lĩnh, Giao Lĩnh.',
    wearingGuide: 'Nữ giới đội ngang hoặc hơi nghiêng nhẹ che nắng; khi đi dạo hoặc dự lễ khoan thai nâng nhẹ vành nón.',
    matchingCostumeIds: ['ao-ngu-than', 'ao-vien-linh', 'ao-giao-linh'],
    matchingCostumesText: 'Áo Ngũ Thân (nữ), Áo Viên Lĩnh (nữ), Áo Giao Lĩnh (nữ)',
    image: '/images/accessories/Nón ba tầm.png',
    photoUrl: '/images/accessories/Nón ba tầm.png',
    badge: 'Đoan Trang Cổ Phong',
    keyFeatures: [
      'Lợp từ ba tầm lá gồi phẳng dẹt chắc chắn, vành nan cật tre chuốt tròn',
      'Phụ nữ đội cùng Áo Ngũ Thân, Áo Viên Lĩnh và Áo Giao Lĩnh',
      'Khác biệt hoàn toàn với Nón Quai Thao (không có chùm tua rua quai thao tơ dài)',
      'Quai vải mộc hoặc lụa mềm giản dị, thanh lịch'
    ]
  },
  {
    id: 'acc-non-quai-thao',
    name: 'Nón Quai Thao',
    category: 'hat',
    categoryLabel: 'Nón & Mũ truyền thống',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Thế kỷ XVII - XX (Phát triển rực rỡ vùng Kinh Bắc)',
    region: 'Bắc Bộ',
    historicalOrigins: 'Nón Quai Thao là loại nón lễ hội đài các đặc thù của liền chị Quan họ vùng Kinh Bắc. Điểm phân biệt cốt lõi với Nón Ba Tầm là dải "quai thao" dệt bằng sợi tơ tằm dài buông rủ hai bên vai, gắn các chùm quả thao (tua rua) chỉ màu lộng lẫy rung rinh theo nhịp bước khi trẩy hội Lim, hội xuân.',
    culturalMeaning: 'Biểu tượng kinh điển của vẻ đẹp đoan trang, duyên dáng của người phụ nữ Quan họ Kinh Bắc trong không gian lễ hội mùa xuân dân ca.',
    wearingGuide: 'Khi đi hội hoặc hát quan họ, người phụ nữ đội nghiêng nhẹ hoặc hai tay nâng nhẹ vành nón che nửa khuôn mặt e ấp; khi hát đối đáp có thể tháo quai thao cầm hờ trên tay.',
    matchingCostumeIds: ['ao-tu-than'],
    matchingCostumesText: 'Áo Tứ Thân Kinh Bắc (Hát quan họ, trẩy hội xuân)',
    image: '/images/accessories/nón quai thao.jpg',
    photoUrl: '/images/accessories/nón quai thao.jpg',
    badge: 'Liền Chị Kinh Bắc',
    keyFeatures: [
      'Vành nón phẳng tròn rộng 70 - 80cm lợp lá gồi trắng ngà',
      'Đặc trưng phân biệt: Dải quai thao dệt bằng sợi tơ tằm buông rủ chấm eo',
      'Đầu quai thao đính chùm tua rua (quả thao) mượt mà rung rinh theo nhịp bước',
      'Chuyên dùng trong lễ hội Quan họ và trang phục Áo Tứ Thân Kinh Bắc'
    ]
  },
  {
    id: 'acc-non-la',
    name: 'Nón Lá',
    category: 'hat',
    categoryLabel: 'Nón & Mũ truyền thống',
    gender: 'both',
    genderLabel: 'Phù hợp cả Nam & Nữ',
    dynastyOrEra: 'Thời kỳ Cổ đại đến nay',
    region: 'Toàn quốc',
    historicalOrigins: 'Nón Lá là vật dụng truyền đời gắn liền với đời sống dân gian người Việt từ Bắc chí Nam. Nón được kết từ 16 vành tre uốn tròn dần từ đáy lên đỉnh chóp nhọn, lợp hai lớp lá cọ hoặc lá gồi nõn chằm khéo léo.',
    culturalMeaning: 'Quốc hồn quốc túy của trang phục dân tộc Việt Nam. Chiếc nón che chở người Việt qua nắng mưa, là nét e lệ, tinh khôi khi diện cùng Áo Yếm, Áo Tứ Thân hay Áo Bà Ba.',
    wearingGuide: 'Cài quai nón lụa nhẹ nhàng dưới cằm; vành nón che nghiêng nhẹ tạo nét duyên kín đáo e ấp.',
    matchingCostumeIds: ['ao-yem', 'ao-tu-than', 'ao-ba-ba'],
    matchingCostumesText: 'Áo Yếm, Áo Tứ Thân, Áo Bà Ba',
    image: '/images/accessories/nón lá.jpg',
    photoUrl: '/images/accessories/nón lá.jpg',
    badge: 'Quốc Hồn Dân Tộc',
    keyFeatures: [
      'Khung 16 vành tre chuốt nhẵn uốn hình chóp nón cân đối',
      'Lá gồi/lá cọ ủi phẳng trắng muốt chằm bằng sợi cước tơ tằm',
      'Phù hợp với Áo Yếm thôn dã, Áo Tứ Thân và Áo Bà Ba Nam Bộ',
      'Quai nón may từ dải lụa mềm buông thắt nơ dưới cằm'
    ]
  },
  {
    id: 'acc-khan-dong',
    name: 'Khăn Đóng',
    category: 'hat',
    categoryLabel: 'Khăn & Mũ truyền thống',
    gender: 'male',
    genderLabel: 'Dành cho Nam',
    dynastyOrEra: 'Triều Nguyễn (Thế kỷ XIX - nay)',
    region: 'Toàn quốc',
    historicalOrigins: 'Khăn Đóng (khăn xếp) là mũ đội truyền thống chuẩn mực của nam giới Việt Nam thời Nguyễn. Vải the hoặc lụa đen được quấn tỉ mỉ quanh cốt cứng thành nhiều lớp đều đặn, phần trước trán hai mép khăn bắt chéo nhau tạo thành hình chữ "Nhân" (人) biểu trưng cho lòng nhân ái và khí chất đĩnh đạc của đấng quân tử.',
    culturalMeaning: 'Đặc quyền tạo hình của nam phục cổ truyền. Nếp gấp chữ Nhân trên trán thể hiện đạo nghĩa Nho gia, tinh thần trượng phu, cương trực và trang trọng.',
    wearingGuide: 'Nam giới đội ngay ngắn trên trán, đỉnh nếp chữ Nhân nằm chính giữa trán; phối cùng Áo Ngũ Thân, Áo Tấc, Áo Viên Lĩnh hoặc Áo Giao Lĩnh của nam.',
    matchingCostumeIds: ['ao-ngu-than', 'ao-tac-ngu-than-tay-thung', 'ao-vien-linh', 'ao-nhat-binh', 'ao-giao-linh', 'ao-doi-kham'],
    matchingCostumesText: 'Áo Ngũ Thân (nam), Áo Tấc (nam), Áo Viên Lĩnh (nam), Áo Đối Khâm (nam), Áo Nhật Bình (chú rể), Áo Giao Lĩnh (nam)',
    image: '/images/accessories/khăn đóng.jpg',
    photoUrl: '/images/accessories/khăn đóng.jpg',
    badge: 'Lễ Điển Nam Nhân',
    keyFeatures: [
      'Nếp quấn trước trán tạo thành hình chữ Nhân (人) dõng dạc dành riêng cho Nam',
      'Chất liệu vải the, lụa tơ tằm hoặc gấm bóng dệt thủ công',
      'Thành khăn dựng cao, ôm khít vòng đầu, giữ tóc búi gọn gàng trang trọng',
      'Không dùng cho nữ giới (nữ giới dùng Khăn Lươn hoặc Khăn Vành)'
    ]
  },
  {
    id: 'acc-khan-van',
    name: 'Khăn Lươn',
    category: 'hat',
    categoryLabel: 'Khăn vấn truyền thống',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Thời Lê - Triều Nguyễn',
    region: 'Bắc Bộ',
    historicalOrigins: 'Khăn Lươn (còn gọi là khăn rí) là kiểu khăn vấn đầu truyền thống đặc trưng và thông dụng nhất của phụ nữ miền Bắc. Phụ nữ dùng vải quấn 1 đến 2 vòng quanh đầu tùy độ dài tóc để bọc tóc cho gọn gàng, để lộ phần đuôi gà phía sau («lộ đuôi gà khỏe tóc khỏe là mốt»). Khăn vấn đẹp là khăn vấn vừa vặn gọn đầu, không quá dày hay quá mỏng, hoàn toàn không có nếp gấp chữ Nhân của nam giới.',
    culturalMeaning: 'Nét đẹp dịu dàng, nề nếp gia phong và duyên dáng của phụ nữ Bắc Bộ xưa; mái tóc đuôi gà bọc khăn lươn êm ái tôn khuôn mặt thuần hậu, đoan trang.',
    wearingGuide: 'Dùng vải bọc tóc quấn 1-2 vòng quanh đầu vừa gọn trán, vén để lộ tóc đuôi gà khỏe khoắn phía sau; kết hợp cùng Áo Tứ Thân, Áo Giao Lĩnh, Áo Viên Lĩnh, Áo Ngũ Thân Bắc Bộ.',
    matchingCostumeIds: ['ao-tu-than', 'ao-giao-linh', 'ao-vien-linh', 'ao-ngu-than', 'ao-doi-kham'],
    matchingCostumesText: 'Áo Tứ Thân, Áo Giao Lĩnh (nữ), Áo Viên Lĩnh (nữ), Áo Ngũ Thân (nữ Bắc Bộ), Áo Đối Khâm (nữ)',
    image: '/images/accessories/khăn lươn.jpg',
    photoUrl: '/images/accessories/khăn lươn.jpg',
    badge: 'Duyên Dáng Bắc Bộ',
    keyFeatures: [
      'Dùng vải quấn 1-2 vòng quanh đầu bọc tóc gọn gàng tùy độ dài tóc',
      'Đặc trưng kinh điển: để lộ đuôi gà khỏe khoắn duyên dáng phía sau',
      'Khăn vấn đẹp là vừa gọn đầu, độ dày thanh thoát, không quá dày hay quá mỏng',
      'Thông dụng ở miền Bắc, dành riêng cho Nữ (hoàn toàn khác khăn đóng nam)'
    ]
  },
  {
    id: 'acc-khan-vanh-day',
    name: 'Khăn Vành',
    category: 'hat',
    categoryLabel: 'Khăn mấn lễ phục',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Triều Nguyễn (Huế thế kỷ XIX - XX)',
    region: 'Trung Bộ',
    historicalOrigins: 'Khăn Vành (hay mấn Huế/khăn vành dây) là kiểu khăn vấn đầu thông dụng ở miền Trung (xứ Huế) và chốn cung đình, mang tính trang trọng cao độ. Khăn được làm từ dải vải gấm hoặc lụa dày, quấn nhiều vòng đều nhau khít khao quanh đầu vút cao lên như một vầng hào quang rực rỡ, tôn vẻ quyền quý, đài các.',
    culturalMeaning: 'Đỉnh cao của sự tôn nghiêm, trang trọng và quý phái xứ cố đô; chiếc khăn vành quấn nhiều vòng đều nhau thể hiện sự chỉn chu, nề nếp gia giáo và vị thế cao quý của người phụ nữ.',
    wearingGuide: 'Đội hoặc quấn nhiều vòng đều nhau trên búi tóc cao, ôm sát trán vững chãi; dùng trong các dịp đại lễ, cưới hỏi khi diện cùng Áo Nhật Bình, Áo Tấc nữ hoặc Áo Ngũ Thân Huế.',
    matchingCostumeIds: ['ao-nhat-binh', 'ao-tac-ngu-than-tay-thung', 'ao-ngu-than'],
    matchingCostumesText: 'Áo Nhật Bình, Áo Tấc (nữ), Áo Ngũ Thân (nữ phong cách Huế)',
    image: '/images/accessories/khăn vành.jpg',
    photoUrl: '/images/accessories/khăn vành.jpg',
    badge: 'Trang Trọng Xứ Huế',
    keyFeatures: [
      'Dải vải hoặc gấm dày dặn, quấn nhiều vòng đều nhau quanh đầu',
      'Thông dụng ở miền Trung (Huế), mang tính trang trọng và lễ nghi bậc nhất',
      'Vành khăn tỏa đều đài các tôn khuôn mặt quý phái của người phụ nữ',
      'Quy chuẩn nghiêm ngặt đi liền với Áo Nhật Bình, Áo Tấc nữ và Áo Ngũ Thân'
    ]
  },
  {
    id: 'acc-kieng-bac',
    name: 'Kiềng Bạc',
    category: 'jewelry',
    categoryLabel: 'Trang sức cổ truyền',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Thế kỷ XVIII - XX',
    region: 'Toàn quốc',
    historicalOrigins: 'Vòng kiềng cổ bằng bạc nguyên khối đúc tay thủ công là trang sức gia bảo gắn liền với phụ nữ Việt xưa. Thân kiềng tròn đều, uốn cong ôm lấy cần cổ thanh tú; hai đầu kiềng thắt lại chạm khắc hoa mai năm cánh hoặc phụng vũ tinh xảo. Trong ngày cưới, kiềng bạc là món sính lễ gia đình trao cho con gái làm của hồi môn son sắt.',
    culturalMeaning: 'Tượng trưng cho sự thanh bạch, thủy chung và cốt cách trong sáng như ánh bạc. Vòng tròn viên mãn của chiếc kiềng cầu chúc gia đạo ấm êm, phúc lộc trường tồn.',
    wearingGuide: 'Đeo sát quanh chân cổ, phần mở quay ra phía trước ngực; phối hoàn hảo trên nền vải lụa gấm của áo ngũ thân, áo tấc, áo yếm.',
    matchingCostumeIds: ['ao-ngu-than', 'ao-tac-ngu-than-tay-thung', 'ao-nhat-binh', 'ao-dai-lemur', 'ao-yem', 'ao-giao-linh', 'ao-tu-than', 'ao-doi-kham', 'ao-vien-linh', 'ao-ba-ba'],
    matchingCostumesText: 'Áo Ngũ Thân, Áo Tấc, Áo Nhật Bình, Áo Dài, Áo Yếm, Áo Giao Lĩnh, Áo Tứ Thân, Áo Viên Lĩnh, Áo Đối Khâm, Áo Bà Ba (nữ)',
    image: '/images/accessories/kiềng bạc.jpg',
    photoUrl: '/images/accessories/kiềng bạc.jpg',
    badge: 'Bảo Vật Gia Truyền',
    keyFeatures: [
      'Bạc ta nguyên chất trắng sáng uốn tròn ôm sát xương quai xanh',
      'Hai đầu kiềng chạm khắc hoa mai hoặc phụng hoàng tinh tế',
      'Bề mặt đánh bóng gương bắt sáng lộng lẫy dưới ánh đèn lễ hội',
      'Tôn vinh cần cổ kiêu sa và vẻ đẹp dịu dàng của thiếu nữ Việt'
    ]
  },
  {
    id: 'acc-chuoi-ngoc-trai',
    name: 'Chuỗi Ngọc Trai',
    category: 'jewelry',
    categoryLabel: 'Trang sức cổ truyền',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Triều Nguyễn & Thời kỳ Tân thời 1930s',
    region: 'Toàn quốc',
    historicalOrigins: 'Ngọc trai nước ngọt và biển Đông từ lâu đã được các bậc mệnh phụ và thiếu nữ quý tộc Đông Dương chuộng làm trang sức đeo cổ. Dải gồm những viên ngọc tròn đều màu trắng ngà hoặc ánh kim, kết từ 1 đến 3 tầng so le rủ nhẹ trước ngực áo.',
    culturalMeaning: 'Biểu trưng của sự thuần khiết, thanh quý và đức hạnh vẹn toàn. Ánh xà cừ dịu dàng làm bừng sáng tà áo gấm màu son hoặc màu chàm thẫm.',
    wearingGuide: 'Đeo phủ ngoài cổ áo lập lĩnh hoặc viền cổ áo nhật bình; tạo điểm nhấn quý phái cho cả phong cách cổ phong lẫn tân thời.',
    matchingCostumeIds: ['ao-nhat-binh', 'ao-tac-ngu-than-tay-thung', 'ao-dai-lemur', 'ao-ngu-than', 'ao-giao-linh', 'ao-vien-linh', 'ao-doi-kham'],
    matchingCostumesText: 'Áo Nhật Bình, Áo Dài Le Mur, Áo Tấc, Áo Ngũ Thân, Áo Giao Lĩnh, Áo Viên Lĩnh, Áo Đối Khâm',
    image: '/images/accessories/Chuỗi Ngọc Trai.png',
    photoUrl: '/images/accessories/Chuỗi Ngọc Trai.png',
    badge: 'Trang Sức Quý Phái',
    keyFeatures: [
      'Ngọc trai tự nhiên tròn đều óng ả ánh xà cừ ngọc ngà',
      'Thiết kế chuỗi 2-3 tầng so le thả buông trước ngực',
      'Khóa cài chạm hoa văn hoa sen cổ điển',
      'Làm sáng bừng khuôn mặt và phong thái quý phái'
    ]
  },
  {
    id: 'acc-guoc-moc',
    name: 'Guốc Mộc',
    category: 'footwear',
    categoryLabel: 'Hài & Guốc truyền thống',
    gender: 'both',
    genderLabel: 'Phù hợp cả Nam & Nữ',
    dynastyOrEra: 'Thế kỷ XVII - XX',
    region: 'Toàn quốc',
    historicalOrigins: 'Guốc mộc là loại giày dép cổ xưa nhất của người Việt, được đẽo từ các loại gỗ nhẹ như gỗ mộc nhĩ, gỗ mít, gỗ xoan đào. Đế guốc uốn lượn theo vòm bàn chân, gót nâng cao nhẹ; quai guốc đóng đinh bằng đinh đồng bọc nhung the đỏ son hoặc da thuộc bóng.',
    culturalMeaning: 'Âm thanh "lách cách" của tiếng guốc mộc trên sân gạch làng quê hay thềm đá kinh thành là âm sắc quen thuộc trong thi ca Việt Nam. Guốc mộc giúp người mang đi đứng thẳng thớm, khoan thai và giữ dáng đi đoan chính.',
    wearingGuide: 'Xỏ chân vào quai nhung vừa vặn, bước đi nhẹ nhàng thanh thoát; phối cùng áo tứ thân, áo ngũ thân hay áo bà ba mang đậm hồn quê mộc mạc.',
    matchingCostumeIds: ['ao-tu-than', 'ao-ngu-than', 'ao-ba-ba', 'ao-yem'],
    matchingCostumesText: 'Áo Tứ Thân, Áo Ngũ Thân, Áo Bà Ba, Áo Yếm',
    image: '/images/accessories/Guốc mộc.png',
    photoUrl: '/images/accessories/Guốc mộc.png',
    badge: 'Hồn Quê Mộc Mạc',
    keyFeatures: [
      'Gỗ xoan/mít đẽo thủ công gót cao 4 - 6cm uốn lượn duyên dáng',
      'Quai nhung đỏ thắm hoặc the đen đính đinh đồng cổ',
      'Bề mặt giữ vân gỗ tự nhiên hoặc sơn then mài bóng',
      'Tạo nhịp bước khoan thai, êm ái trên các nền gạch cổ'
    ]
  },
  {
    id: 'acc-giay-cao-got',
    name: 'Giày Cao Gót',
    category: 'footwear',
    categoryLabel: 'Hài & Giày tân thời',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Thập niên 1930 (Thời kỳ Tân thời Le Mur)',
    region: 'Toàn quốc',
    historicalOrigins: 'Gắn liền với phong trào cách tân Áo Dài Le Mur của họa sĩ Cát Tường vào những năm 1930 tại Hà Nội, phụ nữ tân thời đã kết hợp tà áo dài thắt eo kiều diễm với giày cao gót mũi nhọn kiểu Pháp (Louis heel). Đôi giày cao gót thanh lịch thay thế hoàn toàn cho guốc mộc thôn quê, trở thành biểu tượng phong cách hiện đại của các nữ sinh và quý cô Đông Dương.',
    culturalMeaning: 'Biểu tượng của sự giải phóng hình thể, phong thái tự tin và nhịp sống đô thị văn minh giao thời đầu thế kỷ XX.',
    wearingGuide: 'Đi cùng Áo Dài Le Mur tân thời, bước đi uyển chuyển, kiêu sa và thanh thoát.',
    matchingCostumeIds: ['ao-dai-lemur'],
    matchingCostumesText: 'Áo Dài Le Mur (Tân thời 1930s)',
    image: '/images/accessories/giày cao gót.jpg',
    photoUrl: '/images/accessories/giày cao gót.jpg',
    badge: 'Tân Thời 1930s',
    keyFeatures: [
      'Gót cao thanh mảnh 5 - 7cm phong cách Art Deco thập niên 1930',
      'Mũi giày vát thanh nhã da bóng tôn vinh tà áo dài quét đất',
      'Khác biệt hoàn toàn với guốc mộc dân gian truyền thống',
      'Điểm nhấn chuẩn mực của phong cách Áo Dài Le Mur Cát Tường'
    ]
  },
  {
    id: 'acc-hai-theu',
    name: 'Hài Thêu',
    category: 'footwear',
    categoryLabel: 'Hài & Guốc truyền thống',
    gender: 'female',
    genderLabel: 'Dành cho Nữ',
    dynastyOrEra: 'Triều Lê - Triều Nguyễn (Nghi lễ Đại triều)',
    region: 'Trung Bộ',
    historicalOrigins: 'Hài Thêu là đôi hài lễ phục của nữ nhân quý tộc và cô dâu trong ngày hôn lễ. Đế hài làm từ nhiều lớp vải bồi dán keo da dẻo dai; mũi hài uốn cong nhẹ thanh thoát; mặt hài bọc gấm đỏ hoặc xanh thêu hình chim phụng, hoa mẫu đơn và mây ngũ sắc bằng chỉ kim tuyến.',
    culturalMeaning: 'Mũi hài cong hướng thiên tượng trưng cho sự thăng hoa, ước vọng cát tường và nét dịu dàng, uyển chuyển của người phụ nữ.',
    wearingGuide: 'Mang cùng tất lụa trắng mịn trong các buổi đại lễ, hôn lễ hoặc biểu diễn nghệ thuật truyền thống.',
    matchingCostumeIds: ['ao-nhat-binh', 'ao-tac-ngu-than-tay-thung', 'ao-vien-linh', 'ao-doi-kham', 'ao-giao-linh', 'ao-ngu-than'],
    matchingCostumesText: 'Áo Nhật Bình, Áo Tấc, Áo Viên Lĩnh, Áo Đối Khâm, Áo Giao Lĩnh, Áo Ngũ Thân (Nữ)',
    image: '/images/accessories/hài thêu.jpg',
    photoUrl: '/images/accessories/hài thêu.jpg',
    badge: 'Hài Thêu Cổ Truyền',
    keyFeatures: [
      'Mũi hài vuốt cong vút đặc trưng phong cách cổ truyền Việt Nam',
      'Mặt gấm đỏ son thêu hoa văn phụng vũ chỉ vàng rực rỡ',
      'Đế bồi nhiều lớp vải xơ êm ái, bọc viền tơ tằm trắng',
      'Điểm nhấn đỉnh cao hoàn thiện bộ lễ phục của nữ nhân'
    ]
  },
  {
    id: 'acc-hia-cung-dinh',
    name: 'Hia',
    category: 'footwear',
    categoryLabel: 'Hia & Hài cổ truyền',
    gender: 'male',
    genderLabel: 'Dành cho Nam',
    dynastyOrEra: 'Triều Lê - Triều Nguyễn (Thế kỷ XVII - XX)',
    region: 'Trung Bộ',
    historicalOrigins: 'Hia Mũi Vuông là loại giày ống cao cổ hoặc lửng cổ truyền của nam giới quý tộc, quan viên và chú rể Việt xưa. Thân hia may bằng vải the, nhung đen hoặc gấm bóng viền chỉ vàng; đế hia làm từ vải bồi nhiều lớp ép chặt phết sơn trắng; mũi hia vát góc vuông toát lên dáng dấp uy nghiêm, đĩnh đạc.',
    culturalMeaning: 'Tượng trưng cho phong thái đĩnh đạc, cương trực và vị thế tôn nghiêm của đấng nam nhi, quan chức và chú rể trong ngày đại hôn khi sánh đôi cùng cô dâu diện Áo Nhật Bình hay Áo Tấc.',
    wearingGuide: 'Mang cùng tất lụa trắng hoặc tất vải mịn, ống quần cổ phục nhét vào trong cổ hia hoặc buông phủ nhẹ ngang cổ chân; bước đi đĩnh đạc, vững chãi.',
    matchingCostumeIds: ['ao-nhat-binh', 'ao-tac-ngu-than-tay-thung', 'ao-ngu-than', 'ao-vien-linh', 'ao-giao-linh', 'ao-doi-kham'],
    matchingCostumesText: 'Áo Nhật Bình (Chú rể), Áo Tấc (Nam), Áo Ngũ Thân (Nam), Áo Viên Lĩnh (Nam), Áo Đối Khâm (Nam), Áo Giao Lĩnh (Nam)',
    image: '/images/accessories/hia.jpg',
    photoUrl: '/images/accessories/hia.jpg',
    badge: 'Lễ Điển Nam Nhân',
    keyFeatures: [
      'Thân hia nhung/the đen tuyền trang trọng may viền chỉ kim tuyến',
      'Đế bồi nhiều lớp vải trắng dày dặn, cách ẩm và tôn dáng đi uy nghiêm',
      'Mũi hia vát góc vuông chuẩn mực triều phục cổ truyền',
      'Phụ kiện kinh điển của nam nhân khi sánh đôi cùng Áo Nhật Bình và Áo Tấc'
    ]
  },
  {
    id: 'acc-quat-tram',
    name: 'Quạt Xếp Trầm Hương, Tranh Thủy Mặc',
    category: 'fan_bag',
    categoryLabel: 'Quạt xếp truyền thống',
    gender: 'both',
    genderLabel: 'Phù hợp cả Nam & Nữ',
    dynastyOrEra: 'Thế kỷ XVIII - XX',
    region: 'Toàn quốc',
    historicalOrigins: 'Quạt xếp là vật bất ly thân của các bậc tao nhân mặc khách và quý bà, quý cô xưa. Nan quạt được chế tác từ gỗ trầm hương quý tỏa ngát hương thơm dịu hoặc nan tre cật bồi giấy dó vẽ tranh sơn thủy hữu tình, phía đuôi trục kết tua rua ngũ sắc buông thả.',
    culturalMeaning: 'Tượng trưng cho sự phong nhã, thanh tao và nhàn tản. Động tác phe phẩy chiếc quạt trầm vừa xua đi cái nóng, vừa toát lên vẻ thong dong, đài các.',
    wearingGuide: 'Cầm hờ trên tay khi sải bước, mở quạt che nửa khuôn mặt khi trò chuyện e ấp hoặc xếp gọn cài ở đai lưng áo ngũ thân.',
    matchingCostumeIds: ['ao-giao-linh', 'ao-doi-kham', 'ao-ngu-than', 'ao-tac-ngu-than-tay-thung', 'ao-vien-linh', 'ao-nhat-binh'],
    matchingCostumesText: 'Áo Giao Lĩnh, Áo Đối Khâm, Áo Ngũ Thân, Áo Tấc, Áo Viên Lĩnh, Áo Nhật Bình',
    image: '/images/accessories/quạt xếp trầm hương, tranh thủy mặc.jpg',
    photoUrl: '/images/accessories/quạt xếp trầm hương, tranh thủy mặc.jpg',
    badge: 'Phong Nhã Trí Thức',
    keyFeatures: [
      'Nan gỗ chạm trổ rồng mây tinh xảo tỏa hương dịu nhẹ',
      'Mặt quạt lụa hoặc giấy dó vẽ tranh thủy mặc non nước hữu tình',
      'Đuôi trục gắn hạt ngọc và dải tua rua chỉ đỏ may mắn',
      'Tạo nên thần thái ung dung, nho nhã của người diện cổ phục'
    ]
  },
  {
    id: 'acc-khan-ran',
    name: 'Khăn Rằn',
    category: 'scarf',
    categoryLabel: 'Khăn truyền thống',
    gender: 'both',
    genderLabel: 'Phù hợp cả Nam & Nữ',
    dynastyOrEra: 'Thế kỷ XVIII đến nay',
    region: 'Nam Bộ',
    historicalOrigins: 'Khăn Rằn xuất hiện từ thời khai hoang mở cõi đất phương Nam, dệt từ sợi bông thiên nhiên mềm mại. Khăn có hoa văn kẻ ô vuông ca-rô đặc trưng đen - trắng hoặc đỏ - trắng đan xen, hai đầu thắt tua rua dài. Gắn bó keo sơn với chiếc Áo Bà Ba trong sinh hoạt lẫn lao động.',
    culturalMeaning: 'Biểu tượng bất hủ của lòng kiên trung, hào sảng, chất phác và tinh thần cần lao quật cường của con người Nam Bộ sông nước mênh mông.',
    wearingGuide: 'Quàng nhẹ quanh cổ buông hai vạt trước ngực, vấn tròn quanh đầu che nắng hoặc vắt hờ qua vai khi chèo xuồng dạo chơi miệt vườn.',
    matchingCostumeIds: ['ao-ba-ba'],
    matchingCostumesText: 'Áo Bà Ba',
    image: '/images/accessories/khăn rằn.jpg',
    photoUrl: '/images/accessories/khăn rằn.jpg',
    badge: 'Hào Sảng Phương Nam',
    keyFeatures: [
      'Vải bông dệt kẻ ca-rô hai màu đen-trắng hoặc đỏ-trắng kinh điển',
      'Chất vải thoáng khí, thấm hút mồ hôi và càng giặt càng mềm',
      'Hai đầu khăn kết tua rua sợi bông mộc mạc',
      'Linh hồn bất ly thân của tà Áo Bà Ba sông nước Nam Bộ'
    ]
  }
];

/**
 * Lấy danh sách các phụ kiện thường đi cùng đặc trưng của một cổ phục cụ thể
 */
export function getAccessoriesForCostume(costumeId?: string): TraditionalAccessory[] {
  if (!costumeId) return [];
  const normalizedId = costumeId.toLowerCase();
  return OFFICIAL_TRADITIONAL_ACCESSORIES.filter(acc =>
    acc.matchingCostumeIds.some(id => normalizedId.includes(id) || id.includes(normalizedId))
  );
}
