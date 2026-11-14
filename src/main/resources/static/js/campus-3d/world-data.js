// Spatial coordinates, 5-corner OBB colliders, 17 HUSC landmarks matching Official Plan 61a14ecc, trivia, and trees

export const CAMPUS_START_POSE = {
    x: -12.5,
    z: 78.8,
    yaw: 0.02,
    locationId: 'cong-chinh'
};

// Walkable 5-corner campus boundary plus 77 Nguyen Hue and 38 Dong Da gate street aprons
export const CAMPUS_BOUNDS_POLY = [
    [-103.5, 71.8],
    [-107.2, -27.5],
    [13.8, -85.5],
    [12.2, -88.8],
    [19.4, -92.2],
    [21.0, -89.0],
    [29.8, -93.2],
    [83.0, -31.5],
    [83.0, 71.8],
    [1.0, 71.8],
    [1.0, 80.5],
    [-26.0, 80.5],
    [-26.0, 71.8]
];

// Oriented Bounding Box (OBB) colliders synchronized 1:1 with husc-campus.glb geometry
export const CAMPUS_COLLIDERS = [
    { id: 'col_A', cx: -13.0, cz: 10.0, halfW: 24.5, halfD: 6.0, angle: 0 },
    { id: 'col_A_portico', cx: -13.0, cz: 17.8, halfW: 6.8, halfD: 2.5, angle: 0 },
    { id: 'col_A_conn', cx: 15.6, cz: 10.0, halfW: 4.6, halfD: 3.9, angle: 0 },
    { id: 'col_A1A2', cx: 33.8, cz: 10.0, halfW: 13.8, halfD: 5.9, angle: 0 },
    { id: 'col_E', cx: 7.5, cz: -28.0, halfW: 33.2, halfD: 6.8, angle: 0 },
    { id: 'col_M', cx: 4.0, cz: -39.2, halfW: 14.2, halfD: 2.9, angle: 0 },
    { id: 'col_C', cx: -46.5, cz: -6.0, halfW: 4.8, halfD: 15.2, angle: 0 },
    { id: 'col_N', cx: -46.5, cz: -33.0, halfW: 4.8, halfD: 10.2, angle: 0 },
    { id: 'col_D', cx: -74.0, cz: -25.5, halfW: 11.2, halfD: 6.0, angle: 0.06 },
    { id: 'col_B', cx: 56.5, cz: -14.5, halfW: 5.4, halfD: 14.7, angle: 0 },
    { id: 'col_F', cx: 56.5, cz: 10.0, halfW: 5.0, halfD: 8.5, angle: 0 },
    { id: 'col_G', cx: 56.5, cz: 40.5, halfW: 5.6, halfD: 15.2, angle: 0 },
    { id: 'col_H', cx: -11.48, cz: -53.10, halfW: 23.2, halfD: 5.9, angle: 0.4461 },
    { id: 'col_H_elbow', cx: -35.2, cz: -41.5, halfW: 5.7, halfD: 5.3, angle: 0.10 },
    { id: 'col_K_lower', cx: 56.5, cz: -36.5, halfW: 5.6, halfD: 6.4, angle: 0 },
    { id: 'col_K', cx: 46.2, cz: -55.4, halfW: 5.5, halfD: 12.7, angle: 0.72 },
    { id: 'col_guesthouse', cx: 47.73, cz: -68.01, halfW: 2.8, halfD: 11.2, angle: 0.7165 },
    { id: 'col_gate_left', cx: -25.4, cz: 72.5, halfW: 7.2, halfD: 1.4, angle: 0 },
    { id: 'col_gate_right', cx: -3.2, cz: 72.0, halfW: 6.2, halfD: 2.2, angle: 0 },
    { id: 'col_gate_dd_w', cx: 13.60, cz: -85.49, halfW: 2.3, halfD: 1.9, angle: 0.4461 },
    { id: 'col_gate_dd_e', cx: 20.92, cz: -89.66, halfW: 0.85, halfD: 0.85, angle: 0.4461 },
    { id: 'col_fence_sw', cx: -67.9, cz: 72.5, halfW: 36.2, halfD: 0.5, angle: 0 },
    { id: 'col_fence_se', cx: 42.9, cz: 72.5, halfW: 41.2, halfD: 0.5, angle: 0 },
    { id: 'col_fence_dd_w', cx: -47.2, cz: -57.08, halfW: 67.2, halfD: 0.5, angle: 0.4461 },
    { id: 'col_fence_dd_e', cx: 25.78, cz: -91.98, halfW: 4.8, halfD: 0.5, angle: 0.4461 },
    { id: 'col_garage_west', cx: -64.0, cz: 67.5, halfW: 22.1, halfD: 3.2, angle: 0 },
    { id: 'col_garage_east', cx: 34.0, cz: 67.5, halfW: 28.1, halfD: 3.2, angle: 0 },
    { id: 'col_parking_dd1', cx: -29.21, cz: -61.80, halfW: 18.1, halfD: 2.4, angle: 0.4461 },
    { id: 'col_parking_dd2', cx: -59.01, cz: -46.11, halfW: 7.1, halfD: 2.2, angle: 0.4461 },
    { id: 'col_parking_nhad', cx: -74.6, cz: -34.8, halfW: 10.6, halfD: 2.3, angle: 0.06 },
    { id: 'col_garden_basin_l', cx: -38.5, cz: 41.5, halfW: 2.2, halfD: 2.2, angle: 0 },
    { id: 'col_garden_basin_r', cx: 13.5, cz: 41.5, halfW: 2.2, halfD: 2.2, angle: 0 }
];

// 17 check-inable HUSC landmarks matching every labeled building, gate, and sport field in Plan 61a14ecc
export const CAMPUS_LOCATIONS = [
    {
        id: 'cong-chinh',
        code: '77 NH',
        name: 'Cổng Chính 77 Nguyễn Huệ',
        shortName: 'Cổng Chính',
        category: 'gate',
        x: -13.0,
        z: 72.5,
        checkinRadius: 9.5,
        teleportTarget: { x: -12.5, z: 76.5, yaw: 0 },
        color: '#c24127',
        rect: { cx: -13.0, cz: 72.5, w: 18, d: 3.5, angle: 0 },
        description: 'Cổng chính Trường Đại học Khoa học - ĐH Huế trên trục đường Nguyễn Huệ với tháp gạch gốm kem, cửa lùa inox và bia đá granite.',
        departments: 'Cổng chính 77 Nguyễn Huệ, Phòng Bảo vệ, Trạm đón tân sinh viên'
    },
    {
        id: 'cong-dong-da',
        code: '38 ĐỐNG ĐA',
        name: 'Cổng Phụ 38 Đống Đa',
        shortName: 'Cổng 38 Đống Đa',
        category: 'gate',
        x: 19.5,
        z: -80.5,
        checkinRadius: 10.5,
        teleportTarget: { x: 20.8, z: -78.5, yaw: -0.45 },
        color: '#c24127',
        rect: { cx: 17.58, cz: -88.06, w: 12, d: 3.5, angle: 0.4461 },
        description: 'Cổng sau mặt đường Đống Đa kết nối thẳng ra khu Nhà để xe sinh viên, Nhà H, Nhà K và Nhà Khách Chuyên Gia.',
        departments: 'Cổng phụ 38 Đống Đa, Nhà để xe Đống Đa, Lối ra bùng binh Đống Đa - Hùng Vương'
    },
    {
        id: 'nha-a',
        code: 'NHÀ A',
        name: 'Nhà A · Hiệu bộ & Tiền sảnh',
        shortName: 'Nhà A',
        category: 'admin',
        x: -13.0,
        z: 22.0,
        checkinRadius: 11.5,
        teleportTarget: { x: -13.0, z: 25.0, yaw: 0 },
        color: '#e5be63',
        rect: { cx: -13.0, cz: 10.0, w: 48.4, d: 11.4, angle: 0 },
        description: 'Tòa nhà biểu tượng 3 tầng với tiền sảnh 4 cột cổ điển, ban công gạch đỏ, cửa chớp nâu đỏ và dòng chữ nổi trên mái tôn xanh.',
        departments: 'Ban Giám hiệu, Phòng Đào tạo Đại học, Phòng Công tác Sinh viên, Hành chính'
    },
    {
        id: 'nha-a1-a2',
        code: 'A1-A2',
        name: 'Nhà A1 - A2 · Hội trường A2',
        shortName: 'Hội trường A2',
        category: 'academic',
        x: 33.8,
        z: 20.5,
        checkinRadius: 10.5,
        teleportTarget: { x: 33.8, z: 22.5, yaw: 0 },
        color: '#f4e38c',
        rect: { cx: 33.8, cz: 10.0, w: 27.2, d: 11.4, angle: 0 },
        description: 'Cụm Nhà A1 - Hội trường A2 nối tiếp phía Đông Nhà A qua cầu hành lang 2 tầng, tổ chức hội thảo và sự kiện sinh viên.',
        departments: 'Hội trường A2, Phòng Hội thảo, Giảng đường A1-A2, Phòng Khảo thí'
    },
    {
        id: 'nha-b',
        code: 'NHÀ B',
        name: 'Nhà B · Giảng đường & Lab',
        shortName: 'Nhà B',
        category: 'academic',
        x: 47.0,
        z: -14.5,
        checkinRadius: 11.5,
        teleportTarget: { x: 47.0, z: -14.5, yaw: -1.55 },
        color: '#f4e38c',
        rect: { cx: 56.5, cz: -14.5, w: 10.4, d: 29.0, angle: 0 },
        description: 'Dãy nhà cánh Đông với nhiều phòng thực hành máy tính và giảng đường chuyên ngành (VD: phòng [B202 - Lab]).',
        departments: 'Phòng Lab Thực hành, Giảng đường Khoa Kỹ thuật & Công nghệ'
    },
    {
        id: 'nha-c',
        code: 'NHÀ C',
        name: 'Nhà C · Thư viện & Giảng đường',
        shortName: 'Nhà C',
        category: 'academic',
        x: -38.0,
        z: -1.0,
        checkinRadius: 11.5,
        teleportTarget: { x: -37.5, z: 2.2, yaw: 1.85 },
        color: '#f4e38c',
        rect: { cx: -46.5, cz: -6.0, w: 9.2, d: 30.0, angle: 0 },
        description: 'Dãy nhà dọc cánh Tây nhìn thẳng ra Sân bóng rổ, kết nối trực tiếp lên Khối Nhà Thí Nghiệm phía Bắc.',
        departments: 'Không gian Tự học, Giảng đường C, Khu Thực tập Cơ sở'
    },
    {
        id: 'nha-d',
        code: 'NHÀ D',
        name: 'Nhà D · Khoa Hóa học',
        shortName: 'Nhà D',
        category: 'academic',
        x: -60.0,
        z: -22.5,
        checkinRadius: 11.5,
        teleportTarget: { x: -58.5, z: -22.5, yaw: 1.2 },
        color: '#f4e38c',
        rect: { cx: -74.0, cz: -25.5, w: 22.0, d: 11.5, angle: 0.06 },
        description: 'Khối nhà 4 tầng độc lập góc Tây Bắc với tầng trệt ốp đá nâu cùng dãy nhà để xe riêng phía trước mặt Bắc.',
        departments: 'Khoa Hóa học, Khoa Địa lý - Địa chất, Môi trường & Phòng Thí nghiệm Chuyên sâu'
    },
    {
        id: 'nha-e',
        code: 'NHÀ E',
        name: 'Nhà E · Giảng đường Trung tâm',
        shortName: 'Nhà E',
        category: 'academic',
        x: 7.5,
        z: -18.5,
        checkinRadius: 12.5,
        teleportTarget: { x: 7.5, z: -18.5, yaw: 0 },
        color: '#f4e38c',
        rect: { cx: 7.5, cz: -28.0, w: 66.0, d: 12.2, angle: 0 },
        description: 'Tòa giảng đường 4 tầng bề thế với hệ hành lang mở dài suốt mặt sân trong — trái tim học tập của sinh viên HUSC.',
        departments: 'Khoa Công nghệ Thông tin, Toán học, Văn học, Báo chí - Truyền thông'
    },
    {
        id: 'nha-f',
        code: 'NHÀ F',
        name: 'Nhà F · Cánh Đông',
        shortName: 'Nhà F',
        category: 'academic',
        x: 47.0,
        z: 10.0,
        checkinRadius: 10.5,
        teleportTarget: { x: 47.5, z: 18.5, yaw: -1.1 },
        color: '#f4e38c',
        rect: { cx: 56.5, cz: 10.0, w: 9.6, d: 16.5, angle: 0 },
        description: 'Dãy phòng thí nghiệm và học tập nằm liền kề giữa Nhà B và Nhà G ở cánh Đông khuôn viên.',
        departments: 'Phòng Thí nghiệm Sinh học, Hóa học, Khoa học Vật liệu'
    },
    {
        id: 'nha-g',
        code: 'NHÀ G',
        name: 'Nhà G · Góc Đông Nam',
        shortName: 'Nhà G',
        category: 'academic',
        x: 47.5,
        z: 40.5,
        checkinRadius: 11.5,
        teleportTarget: { x: 48.0, z: 40.5, yaw: -1.55 },
        color: '#ffffff',
        rect: { cx: 56.5, cz: 40.5, w: 10.6, d: 30.0, angle: 0 },
        description: 'Tòa nhà nổi bật với hệ lam kiến trúc nâu đỏ kết hợp tường trắng ngay bên phải Sân vườn trước.',
        departments: 'Trung tâm Học liệu, Khoa Kiến trúc & Phòng Đồ án'
    },
    {
        id: 'nha-h',
        code: 'NHÀ H',
        name: 'Nhà H · Cánh Bắc (Đống Đa)',
        shortName: 'Nhà H',
        category: 'academic',
        x: 0.0,
        z: -50.0,
        checkinRadius: 13.5,
        teleportTarget: { x: 20.5, z: -46.5, yaw: 1.0 },
        color: '#f4e38c',
        rect: { cx: -11.48, cz: -53.10, w: 46.0, d: 10.6, angle: 0.4461 },
        description: 'Dãy nhà cao tầng phía Bắc chạy chéo theo đường Đống Đa với hành lang dài mở ra sân trong phía sau Nhà E.',
        departments: 'Khoa Vật lý, Điện tử Viễn thông & Giảng đường H'
    },
    {
        id: 'nha-k',
        code: 'NHÀ K',
        name: 'Nhà K · Khối Đông Bắc',
        shortName: 'Nhà K',
        category: 'academic',
        x: 38.0,
        z: -48.0,
        checkinRadius: 12.0,
        teleportTarget: { x: 37.5, z: -46.5, yaw: -1.1 },
        color: '#f4e38c',
        rect: { cx: 46.2, cz: -55.4, w: 9.8, d: 25.0, angle: 0.72 },
        description: 'Khối nhà 4 tầng dáng chữ L gập góc ở phía Đông Bắc, tạo cùng Nhà H và Nhà E cụm sân trong hình tròn đặc trưng.',
        departments: 'Hội trường Lớn, Trung tâm Nghiên cứu & Khoa Xã hội'
    },
    {
        id: 'nha-m',
        code: 'MỸ THUẬT',
        name: 'Nhà M · Phòng học Mỹ thuật',
        shortName: 'Phòng Mỹ thuật',
        category: 'academic',
        x: 20.5,
        z: -39.2,
        checkinRadius: 12.0,
        teleportTarget: { x: 21.0, z: -39.2, yaw: 1.57 },
        color: '#e5be63',
        rect: { cx: 4.0, cz: -39.2, w: 28.0, d: 5.4, angle: 0 },
        description: 'Dãy phòng học Mỹ thuật nằm song song ngay phía sau lưng Nhà E trong sân nội khu giữa E và H.',
        departments: 'Phòng học Mỹ thuật, Xưởng Vẽ & Thiết kế Kiến trúc'
    },
    {
        id: 'nha-n',
        code: 'THÍ NGHIỆM',
        name: 'Khu Nhà Thí Nghiệm (Nhà N)',
        shortName: 'Khu Thí nghiệm',
        category: 'academic',
        x: -38.5,
        z: -33.0,
        checkinRadius: 10.5,
        teleportTarget: { x: -37.5, z: -31.5, yaw: 1.57 },
        color: '#f4e38c',
        rect: { cx: -46.5, cz: -33.0, w: 9.2, d: 20.0, angle: 0 },
        description: 'Khối Nhà Thí Nghiệm nối tiếp thẳng trục từ Nhà C lên khu vực Tây Bắc gần Nhà D và đường Đống Đa.',
        departments: 'Khu Nhà Thí Nghiệm Trung tâm, Phòng Thực hành Khoa Tự nhiên'
    },
    {
        id: 'nha-khach',
        code: 'NHÀ KHÁCH',
        name: 'Nhà Khách Chuyên Gia',
        shortName: 'Nhà Khách',
        category: 'admin',
        x: 35.5,
        z: -74.0,
        checkinRadius: 13.0,
        teleportTarget: { x: 35.5, z: -76.5, yaw: -2.1 },
        color: '#e5be63',
        rect: { cx: 47.73, cz: -68.01, w: 5.2, d: 22.0, angle: 0.7165 },
        description: 'Khu Nhà Khách Chuyên Gia 2 tầng mái xanh nằm yên tĩnh bên góc Đông Bắc, ngay gần lối vào Cổng 38 Đống Đa.',
        departments: 'Nhà Khách Chuyên Gia & Cán bộ Thỉnh giảng Quốc tế'
    },
    {
        id: 'san-bong-da',
        code: 'BÓNG ĐÁ',
        name: 'Sân Bóng Đá HUSC',
        shortName: 'Sân Bóng Đá',
        category: 'sport',
        x: -57.5,
        z: 36.5,
        checkinRadius: 18.0,
        teleportTarget: { x: -57.0, z: 36.5, yaw: 1.57 },
        color: '#2e6f40',
        rect: { cx: -75.5, cz: 36.5, w: 30.0, d: 43.0, angle: 0 },
        description: 'Sân bóng đá rộng lớn chạy thẳng dọc đường Lý Thường Kiệt, nơi diễn ra giải truyền thống sinh viên HUSC.',
        departments: 'Hoạt động Giáo dục Thể chất & Giải Bóng đá Sinh viên'
    },
    {
        id: 'san-bong-ro',
        code: 'BÓNG RỔ',
        name: 'Sân Bóng Rổ · Sân Thể Thao',
        shortName: 'Sân Bóng Rổ',
        category: 'sport',
        x: -31.0,
        z: 1.5,
        checkinRadius: 11.5,
        teleportTarget: { x: -31.0, z: 1.8, yaw: 0 },
        color: '#64748b',
        rect: { cx: -31.0, cz: -7.5, w: 18.0, d: 14.0, angle: 0 },
        description: 'Sân thể thao bóng rổ nằm giữa dãy Nhà C và hai khu vườn sân trong phía sau Nhà A.',
        departments: 'Câu lạc bộ Bóng rổ HUSC & Giáo dục Thể chất'
    }
];

// Illuminated in-world teleport pads connecting main plaza, central courtyard, sports field, and 38 Dong Da
export const TELEPORT_PADS = [
    { id: 'tp_gate', label: 'TRẠM DỊCH CHUYỂN', sublabel: 'Cổng Chính 77 Nguyễn Huệ', x: -22.5, z: 58.0, destId: 'nha-a' },
    { id: 'tp_a', label: 'TRẠM DỊCH CHUYỂN', sublabel: 'Quảng trường Nhà A', x: 3.0, z: 21.5, destId: 'nha-e' },
    { id: 'tp_e', label: 'TRẠM DỊCH CHUYỂN', sublabel: 'Sân Giữa Nhà E', x: 7.5, z: -18.8, destId: 'cong-dong-da' },
    { id: 'tp_dongda', label: 'TRẠM DỊCH CHUYỂN', sublabel: 'Cổng 38 Đống Đa', x: 24.5, z: -74.0, destId: 'san-bong-da' },
    { id: 'tp_field', label: 'TRẠM DỊCH CHUYỂN', sublabel: 'Sân Bóng Đá & Vườn Trái', x: -57.0, z: 42.5, destId: 'cong-chinh' }
];

// Interactive quiz trivia about Hue University of Sciences (HUSC)
export const CAMPUS_TRIVIA = [
    {
        id: 'q1',
        question: 'Địa chỉ chính thức của Trường Đại học Khoa học - Đại học Huế (Cổng chính) nằm trên tuyến đường nào?',
        options: ['77 Nguyễn Huệ, TP. Huế', '27 Phan Đình Phùng, TP. Huế', '01 Điện Biên Phủ, TP. Huế', '54 Hai Bà Trưng, TP. Huế'],
        correctIndex: 0,
        explanation: 'Cổng chính Trường ĐHKH Huế đặt tại số 77 Nguyễn Huệ, hai mặt còn lại giáp đường Lý Thường Kiệt và Đống Đa (Cổng 38 Đống Đa).'
    },
    {
        id: 'q2',
        question: 'Trên thời khóa biểu HUSC, ký hiệu phòng học [E403] có nghĩa là gì?',
        options: ['Dãy E, Tầng 3, Phòng 04', 'Dãy E, Tầng 4, Phòng 03', 'Giảng đường E4, bàn 03', 'Tầng hầm E, Phòng 403'],
        correctIndex: 1,
        explanation: 'Chữ cái chỉ tòa nhà (E), chữ số đầu chỉ tầng (Tầng 4), hai chữ số cuối chỉ số thứ tự phòng (Phòng 03).'
    },
    {
        id: 'q3',
        question: 'Tòa nhà biểu tượng 3 tầng nhìn thẳng từ Cổng chính 77 Nguyễn Huệ vào mang tên gọi nào?',
        options: ['Nhà E', 'Nhà K', 'Nhà A (Hiệu bộ)', 'Nhà G'],
        correctIndex: 2,
        explanation: 'Nhà A với tiền sảnh 4 cột cổ điển và bảng tên TRƯỜNG ĐẠI HỌC KHOA HỌC là diện mạo đầu tiên đón chào sinh viên.'
    },
    {
        id: 'q4',
        question: 'Trong ký hiệu phòng thực hành [B202 - Lab], cụm từ "Lab" biểu thị điều gì?',
        options: ['Phòng học Lý thuyết lớn', 'Hội trường Văn nghệ', 'Phòng thực hành / có trang bị máy tính', 'Phòng tự học ngoài trời'],
        correctIndex: 2,
        explanation: 'Các phòng kèm nhãn Lab (thường tập trung ở dãy B, F, Khu Thí Nghiệm...) là phòng máy tính hoặc phòng thí nghiệm thực hành.'
    },
    {
        id: 'q5',
        question: 'Tên giao dịch tiếng Anh khắc trang trọng trên bia đá tại Cổng chính HUSC là gì?',
        options: ['Hue College of Technology', 'Hue University of Sciences', 'Central Vietnam Science Institute', 'Hue Academy of Natural Science'],
        correctIndex: 1,
        explanation: 'Bia đá hoa cương ngay bên trái cổng khắc dòng chữ vàng: ĐẠI HỌC HUẾ - TRƯỜNG ĐẠI HỌC KHOA HỌC - HUE UNIVERSITY OF SCIENCES.'
    }
];

// Three hidden architectural landmarks around campus to discover
export const CAMPUS_DETAILS = [
    {
        id: 'det_monument',
        name: 'Bia Đá Granite Cổng 77 Nguyễn Huệ',
        hint: 'Tìm bức tường đá nâu đỏ khắc chữ vàng nằm bên trái cổng vào đường Nguyễn Huệ.',
        x: -25.4,
        z: 74.2,
        radius: 6.5,
        fact: 'Công trình nhận diện biểu tượng bên cạnh cột tháp gạch gốm, lưu dấu tên trường ĐẠI HỌC HUẾ · TRƯỜNG ĐẠI HỌC KHOA HỌC.'
    },
    {
        id: 'det_portico',
        name: 'Tiền Sảnh 4 Cột Cổ Điển Nhà A',
        hint: 'Tiến lại sát bậc tam cấp tiền sảnh 4 cột trước mặt tiền chính Nhà A.',
        x: -13.0,
        z: 20.5,
        radius: 6.5,
        fact: 'Tiền sảnh Nhà A là nơi check-in tốt nghiệp quen thuộc của biết bao thế hệ sinh viên Khoa học Huế.'
    },
    {
        id: 'det_nha_truong',
        name: 'Biển Hiệu Mái "NHÀ TRƯỜNG" (Khu Đống Đa)',
        hint: 'Đi ra khu vực sân trong phía sau giữa Nhà E, Nhà H và Nhà K để quan sát điểm giao phía Bắc.',
        x: 24.0,
        z: -56.0,
        radius: 13.0,
        fact: 'Tại khu vực cao nhất phía Bắc hướng đường Đống Đa giữa hai dãy H và K đặt biển chữ đỏ nổi NHÀ TRƯỜNG nhìn bao quát toàn khuôn viên.'
    }
];

// Symmetric branching tree placements synchronized cleanly outside all OBB buildings, pitches, and paths
export const TREE_PLACEMENTS = [
    // Front Left Garden (San vuon trai - center -38.5, 41.5): 4 symmetric quadrant canopy trees
    { x: -46.5, z: 31.0, scale: 1.05, kind: 'canopy' },
    { x: -30.5, z: 31.0, scale: 1.08, kind: 'canopy' },
    { x: -46.5, z: 52.0, scale: 1.06, kind: 'canopy' },
    { x: -30.5, z: 52.0, scale: 1.02, kind: 'canopy' },

    // Front Right Garden (San vuon phai - center 13.5, 41.5): 7 trees across islands & NE diagonal grass
    { x: 5.5, z: 30.5, scale: 1.05, kind: 'canopy' },
    { x: 5.5, z: 52.0, scale: 1.06, kind: 'canopy' },
    { x: 21.5, z: 30.5, scale: 0.98, kind: 'canopy' },
    { x: 21.5, z: 52.0, scale: 1.06, kind: 'canopy' },
    { x: 35.5, z: 30.0, scale: 1.04, kind: 'canopy' },
    { x: 38.5, z: 46.5, scale: 1.00, kind: 'canopy' },
    { x: 39.5, z: 53.5, scale: 0.95, kind: 'canopy' },

    // Inner Left & Right Courtyard Gardens between Nha A/A2 and Nha E
    { x: -13.5, z: -2.0, scale: 1.02, kind: 'canopy' },
    { x: -13.5, z: -13.5, scale: 1.06, kind: 'canopy' },
    { x: 0.5, z: -2.0, scale: 1.04, kind: 'canopy' },
    { x: 0.5, z: -13.5, scale: 1.04, kind: 'canopy' },
    { x: 16.5, z: -2.5, scale: 1.05, kind: 'canopy' },
    { x: 16.5, z: -14.0, scale: 1.08, kind: 'canopy' },
    { x: 38.0, z: -2.5, scale: 1.06, kind: 'canopy' },
    { x: 38.0, z: -14.0, scale: 1.02, kind: 'canopy' },

    // Back E-H-K Courtyard Circular Garden trees (centered around 32, -46)
    { x: 24.5, z: -51.5, scale: 0.98, kind: 'canopy' },
    { x: 39.0, z: -40.5, scale: 0.98, kind: 'canopy' },

    // Conifer / ornamental evergreen trees flanking Building A facade (Photos 4 & 5)
    { x: -30.5, z: 16.5, scale: 1.02, kind: 'conifer' },
    { x: -23.5, z: 16.5, scale: 0.92, kind: 'conifer' },
    { x: -1.8, z: 16.5, scale: 0.95, kind: 'conifer' },
    { x: 5.8, z: 16.5, scale: 1.04, kind: 'conifer' },

    // Flanking avenue foliage near Main Gate & Northwest Entrance Plaza
    { x: -34.0, z: 68.5, scale: 1.15, kind: 'canopy' },
    { x: -39.5, z: 60.5, scale: 1.10, kind: 'canopy' },
    { x: 6.5, z: 60.5, scale: 1.10, kind: 'canopy' },
    { x: 26.0, z: -83.5, scale: 1.05, kind: 'canopy' },

    // Perimeter street shade trees outside campus along Nguyen Hue, Ly Thuong Kiet & Dong Da
    { x: -64.0, z: 75.5, scale: 1.14, kind: 'canopy' },
    { x: -45.0, z: 75.5, scale: 1.12, kind: 'canopy' },
    { x: 16.0, z: 75.5, scale: 1.14, kind: 'canopy' },
    { x: 38.0, z: 75.5, scale: 1.10, kind: 'canopy' },
    { x: 60.0, z: 75.5, scale: 1.12, kind: 'canopy' },
    { x: -106.1, z: 48.0, scale: 1.12, kind: 'canopy' },
    { x: -107.4, z: 16.0, scale: 1.14, kind: 'canopy' },
    { x: -108.6, z: -15.0, scale: 1.10, kind: 'canopy' },

    // West sidewalk along Ly Thuong Kiet synchronized with East sidewalk canopy trees
    { x: -127.0, z: -14.0, scale: 1.10, kind: 'canopy' },
    { x: -127.0, z: 0.0, scale: 1.10, kind: 'canopy' },
    { x: -127.0, z: 14.0, scale: 1.10, kind: 'canopy' },
    { x: -127.0, z: 28.0, scale: 1.10, kind: 'canopy' },
    { x: -127.0, z: 42.0, scale: 1.10, kind: 'canopy' },
    { x: -127.0, z: 54.0, scale: 1.10, kind: 'canopy' }
];
