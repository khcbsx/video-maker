// ==============================================================================
// TRỢ LÝ KỊCH BẢN AI - SCRIPT MAKER ENGINE (Giai đoạn 1 & 2: Phân vai & Đọc Word)
// ==============================================================================

'use strict';

// ── CẤU HÌNH GIỌNG ĐỌC MẶC ĐỊNH CHO TAB KỊCH BẢN ──────────────────────────────
const SCRIPT_TAB_VOICES = [
  // --- NHÓM GIỌNG EDGE TTS (TIẾNG VIỆT CHUẨN - XỊN NHẤT) ---
  { n: 'Người Dẫn Truyện (Edge)', g: 'male',   isEdge: true,  apiCode: 'vi-VN-NamMinhNeural', defaultRate: 0.82 },
  { n: 'Nam Minh (Edge)',         g: 'male',   isEdge: true,  apiCode: 'vi-VN-NamMinhNeural', defaultRate: 1.00 },
  { n: 'Hoài My (Edge)',          g: 'female', isEdge: true,  apiCode: 'vi-VN-HoaiMyNeural',  defaultRate: 1.00 },
   
  // --- NHÓM GIỌNG GOOGLE (TIẾNG VIỆT MIỄN PHÍ 100%) ---
  { n: 'Chị Google (Free)',       g: 'female', isEdge: false, apiCode: 'google_vi',           defaultRate: 1.00 },

  // --- NHÓM GIỌNG TIKTOK (TIẾNG ANH CHUẨN) ---
  { n: 'Nữ Mỹ Chuẩn 1 (TikTok)',  g: 'female', isEdge: false, apiCode: 'en_us_001',           defaultRate: 1.00 },
  { n: 'Nữ Mỹ Chuẩn 2 (TikTok)',  g: 'female', isEdge: false, apiCode: 'en_us_002',           defaultRate: 1.00 },
  { n: 'Nam Mỹ Chuẩn (TikTok)',   g: 'male',   isEdge: false, apiCode: 'en_us_006',           defaultRate: 1.00 },
  { n: 'Nam Narration (TikTok)',  g: 'male',   isEdge: false, apiCode: 'en_male_narration',   defaultRate: 1.00 },
  { n: 'Nữ Bestie (TikTok)',      g: 'female', isEdge: false, apiCode: 'en_female_richgirl',  defaultRate: 1.00 },

  // --- NHÓM GIỌNG TIKTOK (HÀI HƯỚC & NHÂN VẬT) ---
  { n: 'Giọng Siêu Hài (TikTok)', g: 'male',   isEdge: false, apiCode: 'en_male_funny',       defaultRate: 1.00 },
  { n: 'Sát thủ Ghostface',       g: 'male',   isEdge: false, apiCode: 'en_us_ghostface',     defaultRate: 1.00 },
  { n: 'Chewbacca (Star Wars)',   g: 'male',   isEdge: false, apiCode: 'en_us_chewbacca',     defaultRate: 1.00 },
  { n: 'Robot C3PO (Star Wars)',  g: 'male',   isEdge: false, apiCode: 'en_us_c3po',          defaultRate: 1.00 }
];

// Biến quản lý trạng thái hệ thống kịch bản
var scriptQueue = [];
var isProcessingScript = false;
var isStopRequested = false;
var globalScriptChapters = [];

// Các thông số Pitch lưu trữ cục bộ cho từng vai
var pitchRateNarrator = 0.82;
var pitchRateMale     = 1.00;
var pitchRateFemale   = 1.00;

// ══════════════════════════════════════════════════════
// TỪ ĐIỂN GIỚI TÍNH — Đa thể loại truyện (BẢN GỐC ĐẦY ĐỦ)
// ══════════════════════════════════════════════════════
const GENDER_DICT = {

   // ───────────────────────────────────────────────────
  // NAM — trong lời thoại, tự xưng / mẫu câu nam
  // ───────────────────────────────────────────────────
  dialogMALE: [
    // Tự xưng nam
    'huynh','đệ','bổn tọa',
    'tiểu đệ','tại hạ','tiểu nhân',
    'lão tử','ta đây','bổn vương','bổn tôn',
    'bổn thiếu gia','bổn công tử','bổn tướng quân',

    // Gọi người khác (người nói là nam)
    'hiền muội','tiểu muội','muội muội','nàng ơi',
    'phu nhân của ta','vợ ta','nàng ta',

    // Hiện đại
    'anh nói','anh nghĩ','anh muốn','anh cần',
    'tôi là đàn ông','mình là con trai',
    
    // Tự xưng nam rõ
    'ta là nam nhân','ta là đàn ông','ta là con trai',
    'ta là nam tử','ta là nam nhi','ta là chồng nàng',
    'ta là phu quân của nàng','ta là tướng công của nàng',
    'anh là đàn ông','anh là con trai','anh là chồng em',
    'anh là bạn trai em','anh là người yêu của em',
    'chồng em đây','phu quân của nàng đây',
    'tướng công của nàng đây','vi phu','vi phu đây',
    'lão gia ta','ông đây','bố mày','cha mày',
    'anh đây','ca đây','đại ca đây','tiểu gia ta',
    'bổn thiếu','bổn thiếu đây','bổn thế tử',
    'bổn điện hạ','bổn thái tử','bổn hầu',
    'bổn quốc công','bổn vương đây','cô vương',
    'quả nhân','trẫm đây','trẫm nói','trẫm muốn',
    'trẫm không','bản vương','bản công tử','bản thiếu gia',
    'bản tướng','bản tọa','bản tôn','bản quân',
    'lão phu đây','lão đạo đây','bần tăng đây',
    'bần đạo đây','tại hạ là nam nhân',

    // Nam gọi nữ / cách nói thường gặp
    'nương tử','nương tử à','nương tử của ta',
    'ái thê','ái thê của ta','hiền thê','hiền thê của ta',
    'phu nhân à','phu nhân của bổn vương',
    'nàng à','nàng nghe ta nói','nàng đừng khóc',
    'nàng đừng sợ','nàng yên tâm','nàng tin ta',
    'nàng là của ta','muội à','muội nghe huynh nói',
    'tiểu muội à','hiền muội à','em yêu',
    'em nghe anh nói','em đừng khóc','em đừng sợ',
    'em là của anh','vợ à','vợ yêu','bà xã à',

    // Hiện đại — mẫu câu nam hay dùng khi tự xưng anh/chú/bố
    'anh sẽ','anh biết','anh không','anh đã',
    'anh chưa','anh xin lỗi','anh thương em',
    'anh yêu em','anh nhớ em','anh bảo rồi',
    'anh đã nói','anh hỏi em','anh đưa em',
    'anh chở em','anh đợi em','anh cưới em',
    'anh chịu trách nhiệm','anh nuôi em',
    'chú nói','chú biết','chú sẽ','chú không',
    'bác trai nói','ba nói','bố nói','cha nói',
    'tía nói','ông xã nói','chồng nói',

    // Tự xưng nam hiện đại
    'anh đây mà','anh ở đây','anh về rồi','anh tới rồi',
    'anh đến rồi','anh đi đây','anh đi trước',
    'anh qua đón em','anh đưa em về','anh đưa em đi',
    'anh gọi cho em','anh nhắn cho em','anh nhớ em lắm',
    'anh yêu em nhiều','anh thích em','anh muốn gặp em',
    'anh muốn cưới em','anh muốn bảo vệ em',
    'anh sẽ bảo vệ em','anh không bỏ em đâu',
    'anh không rời xa em','anh là của em',
    'anh thuộc về em','anh chịu thua em rồi',
    'anh sai rồi','anh xin lỗi em','anh thương em mà',
    'anh lo cho em','anh ghen đấy','anh ghen rồi',
    'anh là bạn trai của em','anh là chồng của em',
    'anh là vị hôn phu của em','anh là ba của con',
    'anh là bố của con','ba là đàn ông','bố là đàn ông',

    // Tự xưng theo tuổi/vai vế nam
    'chú đây','chú tới rồi','chú về rồi','chú biết rồi',
    'chú hiểu rồi','chú xin lỗi','chú giúp cháu',
    'bác trai đây','bác tới rồi','bác biết rồi',
    'ông đây mà','ông biết rồi','ông nói thật',
    'ông không lừa cháu','ba đây','bố đây','cha đây',
    'tía đây','thầy đây','ba về rồi','bố về rồi',
    'cha về rồi','tía về rồi','ba thương con',
    'bố thương con','cha thương con','tía thương con',
    'ba xin lỗi con','bố xin lỗi con','cha xin lỗi con',

    // Tự xưng cổ đại / quyền lực nam
    'bổn vương đã nói','bổn vương không cho phép',
    'bổn vương muốn nàng','bổn vương sẽ bảo vệ nàng',
    'bản vương đã nói','bản vương không cho phép',
    'bản vương muốn nàng','bản vương sẽ bảo vệ nàng',
    'bản thái tử','bổn điện hạ đã nói',
    'bản điện hạ đã nói','cô gia đã nói',
    'quả nhân đã nói','trẫm đã nói','trẫm không cho phép',
    'trẫm muốn nàng','trẫm muốn khanh','trẫm phong nàng',
    'trẫm tha tội cho nàng','trẫm không trách nàng',
    'bổn công tử đã nói','bản công tử đã nói',
    'bổn thiếu gia đã nói','bản thiếu gia đã nói',
    'bổn hầu đã nói','bổn quốc công đã nói',
    'bản tướng quân','bổn tướng quân đã nói',
    'bản tướng đã nói','bổn soái đã nói',
    'vi thần là nam nhân','thần là nam nhân',
    'mạt tướng đã rõ','mạt tướng tuân lệnh',
    'mạt tướng lĩnh mệnh','mạt tướng không dám',

    // Tự xưng giang hồ / tiên hiệp nam
    'tại hạ xin hỏi','tại hạ cáo từ','tại hạ bái kiến',
    'tiểu sinh xin hỏi','tiểu sinh bái kiến',
    'ngu huynh','vi huynh','vi huynh biết',
    'vi huynh sai rồi','huynh sai rồi','huynh biết rồi',
    'huynh sẽ bảo vệ muội','huynh không bỏ muội',
    'huynh thích muội','huynh yêu muội',
    'lão phu biết rồi','lão phu không tin',
    'lão phu đã nói','lão phu cáo từ',
    'lão đạo biết rồi','bần đạo xin hỏi',
    'bần đạo cáo từ','bần tăng xin hỏi',
    'bần tăng cáo từ','lão nạp biết rồi',
    'lão nạp xin hỏi','lão nạp cáo từ',
    'bổn tọa đã nói','bản tọa đã nói',
    'bổn tôn đã nói','bản tôn đã nói',
    'bổn quân đã nói','bản quân đã nói',
    'bổn đế đã nói','bản đế đã nói',
    'bổn ma quân','bản ma quân','bổn ma tôn',
    'bản ma tôn','bổn tiên quân','bản tiên quân',
    'bổn thần quân','bản thần quân',

    // Nam gọi nữ
    'nương tử nghe ta nói','nương tử đừng giận',
    'nương tử đừng khóc','nương tử yên tâm',
    'nương tử tin ta','nương tử là của ta',
    'phu nhân nghe ta nói','phu nhân đừng giận',
    'phu nhân đừng khóc','phu nhân yên tâm',
    'ái phi nghe trẫm nói','ái phi đừng sợ',
    'ái phi bình thân','hoàng hậu nghe trẫm nói',
    'mẫu hậu yên tâm','mẫu phi yên tâm',
    'muội muội nghe huynh nói','tiểu sư muội',
    'sư muội nghe huynh nói','sư tỷ nghe đệ nói',
    'cô nương xin dừng bước','cô nương đừng sợ',
    'tiểu thư xin dừng bước','tiểu thư đừng sợ',
    'em gái à','bé ngoan của anh','cô bé ngốc',
    'vợ yêu nghe anh nói','bà xã nghe anh nói',

    // Đam mỹ / BL — thường vẫn là nam
    'anh yêu em, bảo bối','ông xã của em đây',
    'lão công của em đây','chồng của em đây',
    'anh là lão công của em','anh là công của em',
    'ta là phu quân của ngươi','ta là đạo lữ của ngươi',
    'vi phu sẽ bảo vệ em','vi phu sẽ bảo vệ ngươi',
    'ca thương đệ','huynh thương đệ','sư huynh thương đệ',
    'đệ là của huynh'
  ],

  // ───────────────────────────────────────────────────
  // NỮ — trong lời thoại, tự xưng / mẫu câu nữ
  // ───────────────────────────────────────────────────
  dialogFEMALE: [
    // Tự xưng nữ
    'thiếp','tiện thiếp','tiểu nữ','nô tỳ','tỳ nữ',
    'muội','tỷ tỷ','tiểu tỷ','bổn cô nương','bổn công chúa',
    'bổn tiểu thư','tiểu muội đây','ta là nữ',

    // Gọi người khác (người nói là nữ)
    'ca ca ơi','huynh ơi','lang quân','phu quân',
    'chàng ơi','anh ơi','tướng quân ơi','vương gia ơi',

    // Hiện đại
    'em nói','em nghĩ','em muốn','em cần',
    'tôi là phụ nữ','mình là con gái','chị nói','chị nghĩ',

    // Tự xưng nữ rõ
    'ta là nữ nhân','ta là phụ nữ','ta là con gái',
    'ta là nữ tử','ta là nữ nhi','ta là vợ chàng',
    'ta là thê tử của chàng','ta là nương tử của chàng',
    'em là con gái','em là phụ nữ','em là vợ anh',
    'em là bạn gái anh','em là người yêu của anh',
    'vợ anh đây','nương tử của chàng đây',
    'thiếp thân','thiếp thân đây','thần thiếp',
    'thần thiếp biết tội','thần nữ','dân nữ',
    'nô gia','nô gia đây','nô tỳ biết tội',
    'nô tỳ không dám','tỳ thiếp','tiện nữ',
    'bổn cung','bản cung','bổn cung đây',
    'ai gia','ai gia đây','bổn phi','bản phi',
    'bổn hậu','bản hậu','bổn công chúa đây',
    'bổn quận chúa','bản quận chúa','bổn tiểu thư đây',
    'bổn cô nương đây','tiểu nữ không dám',
    'tiểu nữ xin phép','muội đây','tỷ đây',
    'chị đây','em đây','bà đây','mẹ đây','má đây',

    // Nữ gọi nam / cách nói thường gặp
    'phu quân à','phu quân ơi','tướng công à',
    'tướng công ơi','quan nhân à','quan nhân ơi',
    'lang quân à','lang quân ơi','chàng à',
    'chàng ơi','chàng nghe thiếp nói',
    'chàng đừng đi','chàng đừng giận',
    'chàng tin thiếp','chàng có yêu thiếp không',
    'huynh à','huynh nghe muội nói',
    'ca ca à','ca ca đừng đi','vương gia à',
    'vương gia tha mạng','điện hạ tha mạng',
    'tướng quân tha mạng','anh à','anh nghe em nói',
    'anh đừng đi','anh đừng giận','anh tin em',
    'anh yêu em không','chồng à','chồng yêu',
    'ông xã à',

    // Hiện đại — mẫu câu nữ hay dùng khi tự xưng em/chị/mẹ
    'em sẽ','em biết','em không','em đã',
    'em chưa','em xin lỗi','em thương anh',
    'em yêu anh','em nhớ anh','em bảo rồi',
    'em đã nói','em hỏi anh','em đợi anh',
    'em muốn anh','em cần anh','em cưới anh',
    'chị sẽ','chị biết','chị không','chị đã',
    'chị chưa','chị xin lỗi','chị thương em',
    'chị bảo rồi','chị đã nói','chị hỏi em',
    'mẹ nói','má nói','u nói','bu nói',
    'mợ nói','dì nói','cô nói','thím nói',
    'bà xã nói','vợ nói',

    // Tự xưng nữ hiện đại
    'em đây mà','em ở đây','em về rồi','em tới rồi',
    'em đến rồi','em đi đây','em đi trước',
    'em chờ anh','em đợi anh','em gọi cho anh',
    'em nhắn cho anh','em nhớ anh lắm',
    'em yêu anh nhiều','em thích anh','em muốn gặp anh',
    'em muốn cưới anh','em muốn ở bên anh',
    'em không bỏ anh đâu','em không rời xa anh',
    'em thuộc về anh',
    'em chịu thua anh rồi','em sai rồi',
    'em xin lỗi anh','em thương anh mà',
    'em lo cho anh','em ghen đấy','em ghen rồi',
    'em là bạn gái của anh','em là vợ của anh',
    'em là vị hôn thê của anh','em là mẹ của con',
    'em là má của con','mẹ là phụ nữ','má là phụ nữ',

    // Tự xưng theo tuổi/vai vế nữ
    'chị tới rồi','chị về rồi','chị biết rồi',
    'chị hiểu rồi','chị xin lỗi','chị giúp em',
    'cô đây','cô tới rồi','cô biết rồi',
    'dì đây','dì tới rồi','dì biết rồi',
    'mợ đây','mợ tới rồi','mợ biết rồi',
    'thím đây','thím tới rồi','thím biết rồi',
    'bác gái đây','bác biết rồi',
    'bà đây mà','bà biết rồi','bà nói thật',
    'bà không lừa cháu','mạ đây',
    'u đây','bu đây','mẹ về rồi','má về rồi',
    'mạ về rồi','u về rồi','mẹ thương con',
    'má thương con','mạ thương con','u thương con',
    'mẹ xin lỗi con','má xin lỗi con','mạ xin lỗi con',

    // Tự xưng cổ đại / cung đình nữ
    'thiếp biết rồi','thiếp hiểu rồi','thiếp không dám',
    'thiếp sai rồi','thiếp xin lỗi chàng',
    'thiếp nhớ chàng','thiếp yêu chàng','thiếp thương chàng',
    'thiếp là thê tử của chàng','thiếp là nương tử của chàng',
    'thần thiếp đã biết','thần thiếp không dám',
    'thần thiếp biết tội','thần thiếp cáo lui',
    'thần thiếp tham kiến hoàng thượng',
    'thần thiếp tham kiến bệ hạ',
    'thần thiếp tham kiến thái hậu',
    'thần thiếp oan uổng','thần thiếp không có',
    'bổn cung đã nói','bản cung đã nói',
    'bổn cung không cho phép','bản cung không cho phép',
    'bổn cung mệt rồi','bản cung mệt rồi',
    'bổn cung tha cho ngươi','bản cung tha cho ngươi',
    'ai gia đã nói','ai gia mệt rồi',
    'ai gia không cho phép','ai gia tha cho ngươi',
    'bổn hậu đã nói','bản hậu đã nói',
    'bổn phi đã nói','bản phi đã nói',
    'bổn công chúa đã nói','bản công chúa đã nói',
    'bổn quận chúa đã nói','bản quận chúa đã nói',
    'bổn tiểu thư đã nói','bản tiểu thư đã nói',
    'bổn cô nương đã nói','bản cô nương đã nói',
    'dân nữ không dám','dân nữ biết tội',
    'dân nữ cáo lui','tiểu nữ biết tội',
    'tiểu nữ không hiểu','tiểu nữ xin cáo lui',
    'nô tỳ biết sai','nô tỳ đáng chết',
    'nô tỳ cáo lui','nô tỳ tuân mệnh',
    'nô tỳ không biết','nô tỳ oan uổng',
    'nô gia biết rồi','nô gia không dám',
    'nô gia xin hỏi','nô gia cáo lui',

    // Tự xưng giang hồ / tiên hiệp nữ
    'tiểu muội xin hỏi','tiểu muội cáo từ',
    'ngu muội xin hỏi','ngu muội cáo từ',
    'muội biết rồi','muội sai rồi','muội xin lỗi',
    'muội nhớ huynh','muội thích huynh','muội yêu huynh',
    'muội sẽ chờ huynh','muội không bỏ huynh',
    'tỷ biết rồi','tỷ sai rồi','tỷ xin lỗi',
    'tỷ sẽ bảo vệ muội','tỷ sẽ bảo vệ đệ',
    'sư muội biết rồi','sư muội xin lỗi',
    'sư tỷ biết rồi','sư tỷ xin lỗi',
    'bổn tiên tử đã nói','bản tiên tử đã nói',
    'bổn nữ vương đã nói','bản nữ vương đã nói',
    'bổn nữ đế đã nói','bản nữ đế đã nói',
    'bổn thánh nữ đã nói','bản thánh nữ đã nói',
    'bổn ma nữ đã nói','bản ma nữ đã nói',
    'bổn yêu nữ đã nói','bản yêu nữ đã nói',

    // Nữ gọi nam
    'phu quân nghe thiếp nói','phu quân đừng giận',
    'phu quân đừng đi','phu quân tin thiếp',
    'tướng công nghe thiếp nói','tướng công đừng giận',
    'tướng công đừng đi','tướng công tin thiếp',
    'chàng đừng bỏ thiếp',
    'chàng đừng rời xa thiếp','chàng là phu quân của thiếp',
    'chàng là tướng công của thiếp',
    'vương gia nghe thiếp nói','vương gia tha cho thiếp',
    'vương gia đừng giận','vương gia tin thiếp',
    'hoàng thượng tha tội','bệ hạ tha tội',
    'bệ hạ nghe thần thiếp nói',
    'điện hạ nghe thiếp nói','điện hạ tha tội',
    'ca ca nghe muội nói','huynh nghe muội nói',
    'sư huynh nghe muội nói','sư đệ nghe tỷ nói',
    'anh đừng bỏ em',
    'anh đừng rời xa em',
    'anh là người đàn ông của em',
    'chồng nghe em nói','ông xã nghe em nói',
    'lão công nghe em nói',

    // Bách hợp / GL — thường là nữ
    'chị yêu em','em yêu chị','tỷ yêu muội',
    'muội yêu tỷ','ta là của nàng',
    'em là bạn gái của chị','chị là bạn gái của em',
    'em là vợ của chị','chị là vợ của em',
    'nữ vương của em','chị đại của em',
    'tỷ tỷ của muội','muội muội của tỷ'
  ],

  // ───────────────────────────────────────────────────
  // TỪ KHÔNG CHẮC / PHỤ THUỘC NGỮ CẢNH
  // Nên cho điểm thấp hoặc dùng API/LLM fallback
  // ───────────────────────────────────────────────────
  uncertain: [
    'ta','ngươi','người','ai','đó','kẻ','vị','bọn','chúng',
    'họ','mình','tự','bản thân','chính','đây','này',

    // Đại từ / danh xưng trung tính
    'tôi','tớ','tao','mày','mi','ngài',
    'quý vị','mọi người','chư vị','chư quân','chúng ta',
    'chúng tôi','chúng mình','bọn ta','bọn tôi','bọn họ',
    'người ấy','người đó','người nọ','kẻ ấy','kẻ đó',
    'tên ấy','tên kia','đối phương','đối thủ',
    'nhân vật ấy','nhân vật đó','người trẻ tuổi',
    'đứa trẻ','đứa bé','tiểu hài tử','hài tử',
    'đứa nhỏ','con nít','trẻ con',

    // Xưng hô tu tiên / giang hồ trung tính
    'đạo hữu','tiền bối','hậu bối','vãn bối',
    'đồng môn','đồng đạo','bằng hữu','huynh đệ',
    'tỷ muội','sư tôn',
    'sư cô','sư nương',
    'sư công','sư trượng','đồ nhi','đệ tử',
    'môn đồ','đệ tử thân truyền','ký danh đệ tử',
    'chủ nhân','chủ tử','tôn chủ','đại nhân vật',
    'cao thủ','cường giả','tu sĩ','võ giả',
    'luyện khí sĩ','pháp sư','thuật sĩ','phù sư',
    'trận pháp sư','luyện đan sư','luyện khí sư',
    'ngự thú sư','khôi lỗi sư','thầy thuốc',
    'y sư','đại phu','lang y',

    // Cổ đại / cung đình có thể nam hoặc nữ tùy truyện
    'bệ hạ','điện hạ','thánh giá','hoàng thân',
    'quý tộc','vương thất','hoàng tộc','quân chủ',
    'người trong cung','cung nhân','nội thị',
    'thái giám','hoạn quan', // giới tính sinh học nam nhưng vai xã hội đặc biệt, nên tùy code xử lý
    'quan viên','quan lại','triều thần','thần tử',
    'thần','hạ quan','vi thần','ty chức',
    'thuộc hạ','hạ nhân','người hầu','gia nhân',
    'nô bộc','nô tài',

    // Hiện đại trung tính
    'bạn','cậu','ấy','đằng ấy','người ta',
    'sếp','boss','leader','trưởng phòng','quản lý',
    'bác sĩ','y tá','luật sư','giáo viên',
    'cảnh sát','thám tử','phóng viên','nhân viên',
    'trợ lý','thư ký','diễn viên','ca sĩ',
    'idol','minh tinh','người mẫu','streamer',
    'game thủ','sát thủ','vệ sĩ','quân nhân',
    'binh sĩ','đội trưởng','thuyền trưởng',

    // Cụm dễ gây nhầm nếu chỉ match đơn giản
    'người thương','người tình',
    'bạn đời','vợ chồng','phu thê','tình nhân',
    'hôn phu hôn thê','ý trung nhân','người trong lòng',
    'vị ấy','vị đại nhân',
    'vị tiền bối','vị đạo hữu','vị khách',
    'khách nhân','người lạ','ân nhân','cứu tinh',

    // Đại từ cực kỳ phụ thuộc ngữ cảnh
    'nó','hắn ấy','y ấy',
    'đứa ấy','đứa kia','tên ấy','tên nọ',
    'kẻ nọ','kẻ kia','bóng người','thân ảnh',
    'người áo đen','người áo trắng','người áo xanh',
    'người áo đỏ','người bịt mặt','kẻ bịt mặt',
    'người lạ mặt','người thần bí','người xa lạ',
    'người trung niên','người già',
    'lão ấy','lão ta', // thường nam nhưng có khi chỉ người già chung
    'tiểu tử', // thường nam, nhưng có lúc mắng chung
    'nhóc','nhóc con','bé con','cục cưng',
    'bảo bối','bé yêu','cưng','cưng à',

    // Chức danh trung tính
    'sư trưởng','giáo sư','tiến sĩ','bác sĩ trưởng',
    'viện trưởng','hiệu trưởng','chủ nhiệm',
    'lớp trưởng','lớp phó',
    'đội phó','trưởng nhóm','nhóm trưởng',
    'thủ lĩnh','lãnh đạo','chỉ huy','tư lệnh',
    'thống soái','nguyên thủ','đại biểu',
    'đại diện','người đại diện',
    'người quản lý','trợ lý riêng','thư ký riêng',
    'người hầu thân cận','cận vệ','hộ vệ',
    'thị vệ','ám vệ','người canh cửa',
    'người dẫn đường','người đưa tin',
    'sứ giả','đặc sứ','sứ thần',

    // Xưng hô cổ đại trung tính hoặc cần ngữ cảnh
    'chủ thượng',
    'lão gia', // nam nhiều, nhưng có khi gọi chủ nhà
    'tiểu chủ','chủ cung',
    'cốc chủ','phong chủ',
    'giáo chủ',
    'trại chủ',
    'trưởng lão','hộ pháp','đàn chủ',
    'chưởng quỹ','ông chủ bà chủ', // nếu match phrase lẫn lộn
    'khách quan','khách nhân','vị khách',
    'ân công','ân nhân','cứu mạng ân nhân',

    // Tu tiên / võ hiệp trung tính
    'tiên hữu','ma hữu','yêu hữu',
    'đồng tu','tu giả','tu tiên giả',
    'người tu hành','người luyện võ','cao nhân',
    'đại năng','thần linh',
    'chân thần','thần minh','thánh giả',
    'thánh nhân','đế giả',
    'bán thần','bán thánh','bán đế',
    'chân quân','đạo quân',
    'yêu quân','quỷ quân',
    'tiên tôn',
    'yêu tôn','quỷ tôn','thần tôn',
    'đan sư','khí sư','phù sư','trận sư',
    'ngự thú sư','hồn sư','triệu hồi sư',
    'kiếm tu','đao tu','pháp tu','thể tu',
    'ma tu','yêu tu','quỷ tu','tán tu',

    // Gia đình nhưng không đủ biết giới tính người nói
    'con','cháu','bé','em bé','đứa con',
    'con nuôi','con riêng','con cả','con thứ',
    'con út','đứa cháu','cháu nội','cháu ngoại',
    'anh em','chị em','huynh đệ tỷ muội',
    'vợ chồng','phụ mẫu','cha mẹ','song thân',
    'nhạc phụ nhạc mẫu','thông gia',
    'người thân','thân nhân','bà con',

    // Lời thoại xưng hô không xác định giới người nói
    'tôi nói','tôi nghĩ','tôi muốn','tôi cần',
    'tôi biết','tôi không','tôi đã','tôi sẽ',
    'tớ nói','tớ nghĩ','tớ muốn','tớ cần',
    'mình nói','mình nghĩ','mình muốn','mình cần',
    'ta nói','ta nghĩ','ta muốn','ta cần',
    'ta biết','ta không','ta đã','ta sẽ',
    'tao nói','tao nghĩ','tao muốn','tao cần',
    'ngươi nói','ngươi nghĩ','ngươi muốn','ngươi cần',
    'cậu nói','cậu nghĩ','cậu muốn','cậu cần',
    'bạn nói','bạn nghĩ','bạn muốn','bạn cần',

    // Nhật/Hàn/Trung trung tính hoặc phụ thuộc người nói
    'senpai','sempai','sensei','san','sama','kun','chan',
    'shifu','sư phụ trung quốc','laoshi','老師',
    'xuezhang','xuejie','sunbae','hoobae',
    'dongsaeng','chingu','ya','aish',
    'alpha','beta','omega','enigma',
    'alpha ấy','beta ấy','omega ấy',
    'abo alpha','abo beta','abo omega',

    // Nên xử lý bằng ngữ cảnh đặc biệt
    'công','thụ','top','bottom',
    'lão công', // trong đam mỹ có thể nam, ngôn tình thường nam/nữ
    'ông xã','vợ yêu','chồng yêu',
    'đạo lữ','song tu đạo lữ',
    'tình lang',
    'crush','người yêu cũ','người yêu mới'
  ]
};


// ── PHẦN 1: KHỞI TẠO DROPDOWNS & ĐỌC VĂN BẢN WORD (.DOCX) ────────────────────

// Khởi tạo danh sách giọng đọc khi trang web tải xong
window.onload = function() {
  initScriptVoiceDropdowns();
  bindUIEvents();
};

function initScriptVoiceDropdowns() {
  ['voiceNarrator', 'voiceMale', 'voiceFemale'].forEach(function(id) {
    var sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';

    // Thêm option trống cho giọng lựa chọn nâng cao
    if (id === 'voiceMale' || id === 'voiceFemale') {
      var emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- Không chọn (Trống) --';
      sel.appendChild(emptyOpt);
    }

    SCRIPT_TAB_VOICES.forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v.n;
      opt.textContent = v.n;
      sel.appendChild(opt);
    });

    // Gán giá trị mặc định giống hệ thống cũ của bạn
    if (id === 'voiceNarrator') sel.value = 'Người Dẫn Truyện (Edge)';
    if (id === 'voiceMale')      sel.value = 'Nam Minh (Edge)';
    if (id === 'voiceFemale')    sel.value = '';
    
    // Cập nhật nhãn Pitch ban đầu
    updatePitchLabel(id);
  });
}

function updatePitchLabel(id) {
  var slider = document.getElementById('pitch-range-' + id);
  var label = document.getElementById('pitch-label-' + id);
  if (!slider || !label) return;
  
  var rate = parseFloat(slider.value);
  var text = '▶ Giọng gốc (' + rate.toFixed(2) + ')';
  if (rate <= 0.70)      text = '🔉 Rất trầm (' + rate.toFixed(2) + ')';
  else if (rate <= 0.80) text = '🔉 Trầm (' + rate.toFixed(2) + ')';
  else if (rate <= 0.90) text = '🔉 Hơi trầm (' + rate.toFixed(2) + ')';
  else if (rate > 1.05 && rate <= 1.15) text = '🔊 Hơi cao (' + rate.toFixed(2) + ')';
  else if (rate > 1.15 && rate <= 1.25) text = '🔊 Cao (' + rate.toFixed(2) + ')';
  else if (rate > 1.25)  text = '🔊 Rất cao (' + rate.toFixed(2) + ')';
  
  label.textContent = text;
  
  // Đồng bộ giá trị vào biến toàn cục
  if (id === 'voiceNarrator') pitchRateNarrator = rate;
  if (id === 'voiceMale')     pitchRateMale = rate;
  if (id === 'voiceFemale')   pitchRateFemale = rate;
}

// Lắng nghe và thiết lập các sự kiện giao diện
function bindUIEvents() {
  ['voiceNarrator', 'voiceMale', 'voiceFemale'].forEach(function(id) {
    var slider = document.getElementById('pitch-range-' + id);
    if (slider) {
      slider.addEventListener('input', function() { updatePitchLabel(id); });
    }
    var resetBtn = document.querySelector('#pitch-wrap-' + id + ' .pitch-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (slider) {
          slider.value = (id === 'voiceNarrator') ? 0.82 : 1.00;
          updatePitchLabel(id);
        }
      });
    }
  });

  // Đăng ký sự kiện nạp file Word gốc cho luồng Kịch bản tự động
  var fileInputScript = document.getElementById('wordFileInputScript');
  if (fileInputScript) {
    fileInputScript.addEventListener('change', handleWordUploadScript);
  }
  
  // Đăng ký xử lý nút Phân vai tại Khu vực thủ công
  var manualBuildBtn = document.getElementById('manualBuildBtn');
  if (manualBuildBtn) {
    manualBuildBtn.addEventListener('click', buildScriptManual);
  }
}


// ==============================================================================
// GIAO DIỆN POPUP & LOGIC QUÉT TÊN TỰ ĐỘNG
// ==============================================================================
var modal = document.getElementById('nameFilterModal');
var btnOpen = document.getElementById('btnOpenNameFilter');
var btnClose = document.getElementById('btnCloseModal');
var btnSave = document.getElementById('btnSaveTempNames');

// Mở Popup
if (btnOpen) {
    btnOpen.addEventListener('click', function() {
        modal.classList.add('active');
    });
}
// Đóng Popup
if (btnClose) {
    btnClose.addEventListener('click', function() {
        modal.classList.remove('active');
    });
}
// Lưu tên (Tạm thời chỉ hiển thị Toast đóng, logic nhồi vào engine tính sau)
if (btnSave) {
    btnSave.addEventListener('click', function() {
        modal.classList.remove('active');
        showToast('success', 'Đã lưu tạm tên nhân vật vào bộ nhớ AI!');
    });
}

// ── Hàm quét tên tự động (BẢN CHUẨN + CLICK TỰ NHẢY VÀO Ô) ──
function extractNamesFromText(rawText) {
    var tagContainer = document.getElementById('scannedNamesTags');
    if (!tagContainer) return;
    
    // Thuật toán Regex chỉ bắt chữ viết hoa
    var nameRegex = /(?:[A-Z\p{Lu}][a-z\p{Ll}]*\s+){1,3}[A-Z\p{Lu}][a-z\p{Ll}]*/gu;
    var matches = rawText.match(nameRegex) || [];
    
    var nameCounts = {};
    var stopWords = ["Nhưng Mà", "Tuy Nhiên", "Lúc Này", "Mặc Dù", "Bởi Vì", "Thế Nhưng", "Ngoài Ra", "Hơn Nữa", "Thật Ra", "Sau Khi", "Trước Khi", "Bỗng Nhiên", "Đột Nhiên", "Kỳ Thật"];
    
    matches.forEach(function(name) {
        var cleanName = name.trim();
        if (cleanName.length > 3 && !stopWords.includes(cleanName)) {
            nameCounts[cleanName] = (nameCounts[cleanName] || 0) + 1;
        }
    });
    
    var validNames = Object.keys(nameCounts)
        .filter(name => nameCounts[name] > 1)
        .sort((a, b) => nameCounts[b] - nameCounts[a])
        .slice(0, 40);
        
    tagContainer.innerHTML = ''; 
    if (validNames.length === 0) {
        tagContainer.innerHTML = '<span style="color:var(--text-muted); font-size: 13px;">Không quét được tên nào rõ ràng.</span>';
        return;
    }

    // Đổ thẻ tên vào giao diện
    validNames.forEach(function(name) {
        var tag = document.createElement('span');
        tag.className = 'name-tag';
        tag.innerText = name + ' (' + nameCounts[name] + ')';
        
        // SỰ KIỆN: Kiểm tra xem user đang chọn chế độ nào để xử lý
        tag.addEventListener('click', function() {
            var mode = document.querySelector('input[name="clickMode"]:checked').value;
            
            if (mode === 'copy') {
                navigator.clipboard.writeText(name).then(() => { showToast('info', 'Đã copy: ' + name); });
            } 
            else if (mode === 'male') {
                var txtMale = document.getElementById('tempMaleNames');
                if (txtMale.value.trim() === '') txtMale.value = name;
                else txtMale.value += ', ' + name;
                tag.style.display = 'none'; // Ẩn thẻ tên đi cho gọn
            } 
            else if (mode === 'female') {
                var txtFemale = document.getElementById('tempFemaleNames');
                if (txtFemale.value.trim() === '') txtFemale.value = name;
                else txtFemale.value += ', ' + name;
                tag.style.display = 'none'; // Ẩn thẻ tên đi cho gọn
            }
        });
        
        tagContainer.appendChild(tag);
    });
}

// Hàm đọc file .docx và tách danh sách chương truyện (ĐÃ TỐI ƯU SIÊU TỐC & TÍCH HỢP LỌC TÊN)
function handleWordUploadScript(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    window.mammoth.extractRawText({ arrayBuffer: e.target.result })
      .then(function(result) {
        var rawText = result.value;
        // Tách chương theo biểu thức chính quy chuẩn xác của bạn
        var chapters = rawText.split(/\n(?=Chương\s+\d+)/i).filter(function(c) { return c.trim().length > 100; });
        if (chapters.length === 0) {
          showToast('error', 'Không tìm thấy chương nào đúng định dạng "Chương [số]". Vui lòng kiểm tra lại file Word.');
          return;
        }
        
        globalScriptChapters = chapters;
        var fromSel = document.getElementById('chapFromScript');
        var toSel = document.getElementById('chapToScript');
        if (!fromSel || !toSel) return;
        
        // TỐI ƯU HÓA: Gộp chuỗi HTML thay vì vẽ lại nhiều lần
        var optionsHTML = '';
        chapters.forEach(function(ch, idx) {
          var label = ch.substring(0, 40).trim() + '...';
          optionsHTML += '<option value="' + idx + '">[' + (idx + 1) + '] ' + label + '</option>';
        });
        
        // Dán 1 lần duy nhất vào DOM (Chống đơ trình duyệt)
        fromSel.innerHTML = optionsHTML;
        toSel.innerHTML = optionsHTML;
        
        toSel.selectedIndex = chapters.length - 1;
        fromSel.disabled = false;
        toSel.disabled = false;
        
        // Bật và gán giá trị ô nhập số
        var inFrom = document.getElementById('inputChapFrom');
        var inTo = document.getElementById('inputChapTo');
        if (inFrom && inTo) {
            inFrom.disabled = false;
            inTo.disabled = false;
            inFrom.max = chapters.length;
            inTo.max = chapters.length;
            inFrom.value = 1; 
            inTo.value = chapters.length; 
        }
        
        var btnAdd = document.getElementById('btnAddScriptQueue');
        if (btnAdd) {
          btnAdd.disabled = false;
          btnAdd.style.opacity = '1';
        }

        // ========================================================
        // BẬT NÚT LỌC TÊN & QUÉT VĂN BẢN (ĐÃ TỐI ƯU HIỆU SUẤT)
        // ========================================================
        var btnFilter = document.getElementById('btnOpenNameFilter');
        if (btnFilter) {
          btnFilter.disabled = false;
          btnFilter.style.opacity = '1';
          
          // Tối ưu: Chỉ cắt 10 000 000 ký tự đầu tiên để quét tên (Khoảng 15-20 chương)
          // Đảm bảo không bị treo app khi file Word quá dài (1500+ chương)
          var sampleTextForNames = rawText.substring(0, 10000000); 
          
          // Gọi hàm quét tên (Hàm này bạn đã chèn ở bước trước)
          if (typeof extractNamesFromText === 'function') {
              extractNamesFromText(sampleTextForNames); 
          }
        }
        // ========================================================

        showToast('success', 'Đã nạp thành công ' + chapters.length + ' chương từ file Word!');
      })
      .catch(function(err) {
        showToast('error', 'Lỗi giải nén tài liệu Word: ' + err.message);
      });
  };
  reader.readAsArrayBuffer(file);
}

// ==============================================================================
// BỘ MÁY DÒ TÌM GIỚI TÍNH CỤC BỘ (BẢN CHUẨN: ƯU TIÊN THOẠI TRƯỚC -> DẪN TRUYỆN SAU)
// ==============================================================================
function detectGenderLocal(dialogText, proseContext) {
    var text = (dialogText || '').toLowerCase();
    var prose = (proseContext || '').toLowerCase();
    
    // Hàm tìm vị trí xuất hiện GẦN NHẤT (cuối cùng) của từ khóa trong chuỗi
    function findLastIndex(src, wordList) {
        if (!wordList) return -1;
        var maxIdx = -1;
        for (var i = 0; i < wordList.length; i++) {
            var w = wordList[i].toLowerCase();
            var regex = new RegExp('(^|[\\s,\\.!?;:\\-"\'`\\[\\](){}])' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?=[\\s,\\.!?;:\\-"\'`\\[\\](){}]|$)', 'gi');
            var match;
            while ((match = regex.exec(src)) !== null) {
                if (match.index > maxIdx) {
                    maxIdx = match.index;
                }
            }
        }
        return maxIdx;
    }

    // ── TẦNG 1 (ƯU TIÊN 1): TÌM TỪ KHÓA MẠNH (NAM/NỮ) TRONG LỜI THOẠI (DIALOG) ──
    // Nếu nhân vật tự xưng rõ ràng (thiếp, phu quân, trẫm...) thì chốt luôn, không cần nhìn lời dẫn
    var lastMaleDlg = findLastIndex(text, GENDER_DICT.dialogMALE);
    var lastFemaleDlg = findLastIndex(text, GENDER_DICT.dialogFEMALE);
    
    if (lastMaleDlg !== -1 || lastFemaleDlg !== -1) {
        if (lastFemaleDlg > lastMaleDlg) return { gender: 'female' };
        return { gender: 'male' };
    }

    // ── TẦNG 2 (ƯU TIÊN 2): NẾU LỜI THOẠI KHÔNG RÕ, TÌM TRONG LỜI DẪN (PROSE) ──
    // Dùng cho các câu thoại cộc lốc (VD: "Đi thôi!", "Được."), lúc này mới cần nhìn ngữ cảnh
    if (prose.length > 0) {
        var lastMaleIdx = findLastIndex(prose, GENDER_DICT.proseMALE);
        var lastFemaleIdx = findLastIndex(prose, GENDER_DICT.proseFEMALE);

        if (lastMaleIdx !== -1 || lastFemaleIdx !== -1) {
            if (lastFemaleIdx > lastMaleIdx) return { gender: 'female' };
            return { gender: 'male' };
        }
    }
    
    // ── TẦNG 3 (MẶC ĐỊNH): RỚT CẢ 2 TẦNG TRÊN -> BẮT TOÀN BỘ LÀ GIỌNG NAM MINH ──
    // Gom chung mọi trường hợp mập mờ, không chắc chắn về đây
    return { gender: 'male' }; 
}

// ── PHẦN 2: ĐỘNG CƠ PHÂN VAI NỘI BỘ (LOCAL AI AUDIO AUTOMATION) ────────────────

// Hàm bóc tách lời thoại và lời kể trong cùng một hàng dòng văn bản
function splitLineToParts(line) {
  var trimmed = line.trim();
  var results = [];
  var lastIndex = 0;

  // Hỗ trợ quét chính xác cả 6 định dạng dấu ngoặc kép thẳng và cong của Word
  var dialogRegex = /("[\s\S]+?"|'[\s\S]+?'|\u201C[\s\S]+?\u201D|\u2018[\s\S]+?\u2019)/g;
  var match;

  while ((match = dialogRegex.exec(trimmed)) !== null) {
    var proseBefore = trimmed.slice(lastIndex, match.index).trim();
    if (proseBefore.length > 0) results.push({ type: 'prose', text: proseBefore });
    results.push({ type: 'dialog', text: match[0].trim() });
    lastIndex = match.index + match[0].length;
  }
  
  var proseAfter = trimmed.slice(lastIndex).trim();
  if (proseAfter.length > 0) results.push({ type: 'prose', text: proseAfter });
  if (results.length === 0) results.push({ type: 'prose', text: trimmed });
  
  return results;
}

// Bộ máy tính toán phân tích ngữ cảnh để gán giọng đọc tương ứng
function resolveVoiceForDialog(contextText, dialogText, voiceMale, voiceFemale) {
  var result = detectGenderLocal(dialogText || '', contextText || '');
  if (result.gender === 'female') return voiceFemale ? voiceFemale : voiceMale;
  return voiceMale;
}

// Hàm cốt lõi vận hành luồng phân vai + AUTO RẢI NHẠC NỀN (CHUẨN THẺ VAI TRÒ)
async function runScriptAutomation(rawText, taskId, skipBgm) { // 🌟 THÊM BIẾN skipBgm VÀO ĐÂY
    // THAY ĐỔI LỚN NHẤT Ở ĐÂY: Gán chết 3 Thẻ Vai Trò thay vì lấy từ Giao diện
    var voiceNarrator = 'Dẫn Truyện';
    var voiceMale     = 'Giọng Nam';
    var voiceFemale   = 'Giọng Nữ';
    
    var lines = rawText.split('\n');
    var taggedLines = [];
    var contextWindow = ''; 
    
    // Bộ đếm chữ để rải nhạc
    var wordCount = 0; 

    // 🌟 SỬA Ở ĐÂY: Chỉ chèn Nhạc Dạo nếu không bị yêu cầu bỏ qua (skipBgm = false)
    if (!skipBgm) {
        taggedLines.push('[BGM: Nhạc Dạo]');
        taggedLines.push('');
    }

    for (var i = 0; i < lines.length; i++) {
        if (isStopRequested) throw new Error('⛔ Tiến trình đã bị dừng theo lệnh người dùng.');
        var line = lines[i].trim();

        if (line === '') {
            taggedLines.push('');
            continue;
        }

        // Đếm số lượng chữ trong dòng hiện tại và cộng dồn
        var currentLineWords = line.split(/\s+/).filter(w => w.length > 0).length;
        wordCount += currentLineWords;

        var parts = splitLineToParts(line);

        for (var k = 0; k < parts.length; k++) {
            var part = parts[k];

            if (part.type === 'prose') {
                taggedLines.push('[' + voiceNarrator + ']: ' + part.text);
                contextWindow = (contextWindow + ' ' + part.text).slice(-300);
            } else {
                var localContext = contextWindow;
                for (var m = 0; m < k; m++) {
                    if (parts[m].type === 'prose') localContext += ' ' + parts[m].text;
                }
                for (var m = k + 1; m < parts.length; m++) {
                    if (parts[m].type === 'prose') localContext += ' ' + parts[m].text;
                }

                var assignedVoice = resolveVoiceForDialog(localContext, part.text, voiceMale, voiceFemale);
                taggedLines.push('[' + assignedVoice + ']: ' + part.text);
            }
        }

        // AUTO BGM: Nếu đã đọc được khoảng 350 chữ (tương đương ~3-4 phút audio)
        if (wordCount >= 350) {
            // 🌟 NÂNG CẤP: Kiểm tra xem có đang ở quá gần cuối chương không
            var linesRemaining = lines.length - i;
            
            // Chỉ chèn Nhạc Trung Tính nếu còn cách xa cuối chương (trên 15 dòng)
            // Nếu dưới 15 dòng thì âm thầm bỏ qua để nhường chỗ cho Nhạc Dạo (Outro)
            if (linesRemaining > 15) {
                taggedLines.push(''); 
                taggedLines.push('[BGM: Nhạc Trung Tính]');
                taggedLines.push('');
            }
            
            // Dù có được chèn nhạc hay không, vẫn phải reset bộ đếm để đếm vòng mới
            wordCount = 0; 
        }
    }

    return taggedLines.join('\n');
}

// Trình kích hoạt Phân vai thủ công từ giao diện hộp văn bản dưới cùng
async function buildScriptManual() {
  var inputArea = document.getElementById('rawStoryInput');
  var outputArea = document.getElementById('processedScriptOutput');
  if (!inputArea || !inputArea.value.trim()) {
    showToast('error', 'Vui lòng điền hoặc dán văn bản truyện vào ô Văn bản gốc trước!');
    return;
  }

  var btn = document.getElementById('manualBuildBtn');
  var origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = '⏳ Đang phân vai...';
  isStopRequested = false;

  setTimeout(async function() {
    try {
      var processedText = await runScriptAutomation(inputArea.value, null);
      outputArea.value = processedText;
      showToast('success', 'Phân vai hoàn tất!');
    } catch (err) {
      showToast('error', 'Lỗi: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }, 200);
}

// ==============================================================================
// TẠO AUDIO THỦ CÔNG TỪ KỊCH BẢN AI (ĐÃ TÍCH HỢP XUẤT TXT TẠO ẢNH)
// ==============================================================================
var manualAudioBtn = document.getElementById('manualAudioBtn');
if (manualAudioBtn) {
    manualAudioBtn.addEventListener('click', async function() {
        // Lấy kịch bản từ ô Textarea
        const scriptText = document.getElementById('processedScriptOutput').value;
        const resultDiv = document.getElementById('manual-audio-result');
        const audioPlayer = document.getElementById('manual-audio-player');
        const downloadBtn = document.getElementById('manual-audio-download');

        if (!scriptText || !scriptText.trim()) {
            showToast("error", "Kịch bản trống! Vui lòng Phân vai AI hoặc dán kịch bản vào trước.");
            return;
        }

        const originalText = this.innerHTML;
        this.innerHTML = "⏳ Đang kết nối API...";
        this.disabled = true;
        resultDiv.style.display = "none"; // Ẩn trình phát nhạc cũ

        // Hàm nội bộ: Đọc cấu hình giọng từ 3 Dropdown trên giao diện
        function getVoiceConfig(roleTag) {
            var selectId = 'voiceNarrator';
            var pitchVal = window.pitchRateNarrator || 0.82;

            if (roleTag === 'Giọng Nam') { selectId = 'voiceMale'; pitchVal = window.pitchRateMale || 1.0; }
            if (roleTag === 'Giọng Nữ') { selectId = 'voiceFemale'; pitchVal = window.pitchRateFemale || 1.0; }

            var dropdown = document.getElementById(selectId);
            var selectedValue = dropdown ? dropdown.value.trim() : '';

            // SỬA Ở ĐÂY: Tìm chính xác theo Name (n) hoặc API Code
            var found = SCRIPT_TAB_VOICES.find(v => v.n === selectedValue || v.apiCode === selectedValue);
            
            // Nếu không tìm thấy, mặc định là Nam Minh
            if (!found) {
                found = { isEdge: true, apiCode: 'vi-VN-NamMinhNeural' };
            }

            // Ép kiểu pitch sang số SSML (VD: +0, -18)
            var percent = Math.round((parseFloat(pitchVal) - 1.0) * 100);
            var pitchStr = percent >= 0 ? "+" + percent : "" + percent;

            return { config: found, pitch: pitchStr };
        }

        try {
            const lines = scriptText.split('\n');
            let audioBlobs = [];
            
            // --- MỚI THÊM VÀO: Khởi tạo biến lưu thời gian ---
            let timestampLog = [];
            let runningTime = 0;
            const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
            // --------------------------------------------------

            // 1. Kiểm tra nhanh xem toàn bộ kịch bản có phải là văn bản thuần không
            const isPlainText = !scriptText.includes('[');

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                
                // Bỏ qua dòng trống và nhạc nền (Thủ công chỉ cần test giọng đọc)
                if (!line || line.startsWith('[BGM:')) continue; 

                // 2. TỰ ĐỘNG GẮN THẺ NẾU LÀ VĂN BẢN THUẦN HOẶC DÒNG THIẾU THẺ
                if (isPlainText || !line.startsWith('[')) {
                    // --- ĐÃ ĐỔI: Đồng bộ dùng [Dẫn Truyện] ---
                    line = `[Dẫn Truyện]: ${line}`;
                }

                // Tận dụng hàm parseScriptLine đã có sẵn trong code của bạn
                let parsed = parseScriptLine(line);
                
                if (parsed && !parsed.isBgm && parsed.text.trim() !== '') {
                    this.innerHTML = `⏳ Đang đọc dòng ${i + 1}/${lines.length}...`;

                    // Lấy cấu hình giọng tương ứng với Tag (Dẫn Truyện, Giọng Nam, Giọng Nữ)
                    let voiceInfo = getVoiceConfig(parsed.voice); 
                    
                    // Gọi trạm Cloudflare (Dùng hàm fetchAudioFromCloudflare cũ của bạn)
                    let arrayBuffer = await fetchAudioFromCloudflare(parsed.text, voiceInfo.config, voiceInfo.pitch, "+0");

                    // Nếu lấy được file MP3, nhét vào mảng chờ
                    if (arrayBuffer) {
                        audioBlobs.push(new Blob([arrayBuffer]));
                        
                        // --- MỚI THÊM VÀO: Đo thời lượng và ghi Log ---
                        let audioData = arrayBuffer.slice(0);
                        let decodedData = await tempCtx.decodeAudioData(audioData);
                        let segmentDuration = decodedData.duration;

                        timestampLog.push({
                            voice: parsed.voice,
                            text: parsed.text,
                            duration: segmentDuration,
                            startTime: runningTime
                        });
                        runningTime += segmentDuration; // Cộng dồn thời gian cho câu tiếp theo
                        // --------------------------------------------------
                    }
                }
            }

            if (audioBlobs.length === 0) {
                showToast("error", "Không tạo được dữ liệu âm thanh nào! Kiểm tra lại định dạng thẻ.");
                this.innerHTML = originalText;
                this.disabled = false;
                return;
            }

            this.innerHTML = "⏳ Đang gộp file...";

            // Nối trực tiếp các cục MP3 lại với nhau thành 1 file MP3 dài duy nhất
            const finalMergedBlob = new Blob(audioBlobs, { type: 'audio/mpeg' });
            const finalAudioUrl = URL.createObjectURL(finalMergedBlob);

            // Bơm nhạc vào Trình phát và Nút Tải
            audioPlayer.src = finalAudioUrl;
            downloadBtn.href = finalAudioUrl;

            // Tạo tên file có ngày giờ để không bị lưu đè
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            downloadBtn.download = `Audio_ThuCong_${dateStr}.mp3`;

            // Bật sáng khu vực kết quả lên
            resultDiv.style.display = "block";
            showToast("success", "Tạo audio thủ công hoàn tất! Bấm nút Play để nghe thử.");
            
            // --- MỚI THÊM VÀO: Kích hoạt tải 2 file TXT ---
            if (typeof exportTimestampTxtFiles === 'function') {
                exportTimestampTxtFiles(timestampLog, runningTime, "ThuCong_" + dateStr);
            }
            // --------------------------------------------------

        } catch (error) {
            console.error(error);
            showToast("error", "Lỗi tạo audio: " + error.message);
        } finally {
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
}


// ==============================================================================
// HỆ THỐNG HÀNG ĐỢI KỊCH BẢN (SCRIPT QUEUE) - PHỤC VỤ TEST TÁCH CHƯƠNG
// ==============================================================================

// Bắt sự kiện bấm nút "Thêm vào mẻ chờ"
document.getElementById('btnAddScriptQueue').addEventListener('click', function() {
    var fromIdx = parseInt(document.getElementById('chapFromScript').value);
    var toIdx = parseInt(document.getElementById('chapToScript').value);
    
    if (fromIdx > toIdx) {
        showToast('error', 'Chương bắt đầu phải nhỏ hoặc bằng chương kết thúc!');
        return;
    }

    // Tạo một mẻ (batch) mới
    var batch = {
        id: Date.now(),
        from: fromIdx,
        to: toIdx,
        status: 'Chờ xử lý'
    };
    
    scriptQueue.push(batch);
    renderScriptQueue();
    document.getElementById('btnStartScript').style.display = 'inline-flex'; // Hiện nút chạy
});

function renderScriptQueue() {
    var tbody = document.getElementById('scriptQueueBody');
    tbody.innerHTML = '';
    
    if (scriptQueue.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Chưa có mẻ nào. Tải Word và thêm vào hàng đợi.</td></tr>';
        document.getElementById('btnStartScript').style.display = 'none';
        return;
    }
    
    // Đảm bảo nút Chạy Kịch Bản hiện lên khi có mẻ
    document.getElementById('btnStartScript').style.display = 'flex';
    
    scriptQueue.forEach(function(b, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Mẻ ${index + 1}</td>
            <td>Chương ${b.from + 1} đến Chương ${b.to + 1}</td>
            <td id="status-script-${b.id}" style="color: #eab308; font-weight: 600;">${b.status}</td>
            <td id="download-script-${b.id}">--</td>
            <td style="text-align:center; display:flex; justify-content:center; gap:15px; align-items:center;">
                <span class="material-icons" style="color:#3b82f6; cursor:pointer; font-size: 22px;" onclick="filterScriptBatchNames(${b.id})" title="Quét tên nhân vật chỉ trong mẻ này">person_search</span>
                
                <span class="material-icons" style="color:#ef4444; cursor:pointer; font-size: 22px;" onclick="removeScriptBatch(${b.id})" title="Xóa mẻ này">delete</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Hàm mới: Quét và lọc tên riêng cho một mẻ cụ thể
window.filterScriptBatchNames = function(id) {
    // Tìm mẻ tương ứng bằng id
    var batch = scriptQueue.find(function(b) { return b.id === id; });
    if (!batch) return;
    
    // Lấy đúng văn bản từ chương bắt đầu đến kết thúc của mẻ đó
    var batchChaptersText = globalScriptChapters.slice(batch.from, batch.to + 1).join('\n\n');
    
    // Đẩy vào hàm quét tên
    if (typeof extractNamesFromText === 'function') {
        extractNamesFromText(batchChaptersText);
    }
    
    // Cập nhật tiêu đề Popup và mở lên
    var modalHeader = document.querySelector('#nameFilterModal h3');
    if (modalHeader) {
        var mIndex = scriptQueue.findIndex(function(b) { return b.id === id; });
        modalHeader.innerHTML = `<span class="material-icons">manage_accounts</span> Tên Mẻ ${mIndex + 1} (Chương ${batch.from + 1} - ${batch.to + 1})`;
    }
    document.getElementById('nameFilterModal').classList.add('active');
}

// Xóa một mẻ khỏi hàng đợi
window.removeScriptBatch = function(id) {
    scriptQueue = scriptQueue.filter(function(b) { return b.id !== id; });
    renderScriptQueue();
}

// Nút "CHẠY DỰNG KỊCH BẢN" (Tích hợp nạp tên nhân vật & xuất file .docx)
document.getElementById('btnStartScript').addEventListener('click', async function() {
    this.disabled = true;
    this.innerHTML = '<span class="material-icons">hourglass_top</span> ĐANG XỬ LÝ...';
    
    // ==============================================================
    // BƠM TÊN NHÂN VẬT TỪ GIAO DIỆN VÀO TỪ ĐIỂN AI (CHỈ LƯU TẠM TRÊN RAM)
    // ==============================================================
    if (!GENDER_DICT.proseMALE) GENDER_DICT.proseMALE = [];
    if (!GENDER_DICT.proseFEMALE) GENDER_DICT.proseFEMALE = [];
    
    var maleTxt = document.getElementById('tempMaleNames');
    if (maleTxt && maleTxt.value.trim() !== '') {
        var mNames = maleTxt.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
        mNames.forEach(n => {
            if(!GENDER_DICT.dialogMALE.includes(n)) GENDER_DICT.dialogMALE.push(n);
            if(!GENDER_DICT.proseMALE.includes(n)) GENDER_DICT.proseMALE.push(n);
        });
    }
    
    var femaleTxt = document.getElementById('tempFemaleNames');
    if (femaleTxt && femaleTxt.value.trim() !== '') {
        var fNames = femaleTxt.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
        fNames.forEach(n => {
            if(!GENDER_DICT.dialogFEMALE.includes(n)) GENDER_DICT.dialogFEMALE.push(n);
            if(!GENDER_DICT.proseFEMALE.includes(n)) GENDER_DICT.proseFEMALE.push(n);
        });
    }
    // ==============================================================
    
    for (var i = 0; i < scriptQueue.length; i++) {
        var batch = scriptQueue[i];
        if (batch.status === 'Đã xong ✅') continue;

        document.getElementById('status-script-' + batch.id).innerText = 'Đang phân vai...';
        document.getElementById('status-script-' + batch.id).style.color = '#3b82f6';
        
        var combinedScript = '';

        // 🌟 NÂNG CẤP: TỰ ĐỘNG BẮC KÍNH LÚP TÌM SỐ CHƯƠNG THẬT TRONG VĂN BẢN
        var firstChapText = globalScriptChapters[batch.from] || "";
        var lastChapText = globalScriptChapters[batch.to] || "";
        
        // Quét tìm chữ "Chương XXX" và bóc lấy số XXX
        var matchFrom = firstChapText.match(/Chương\s+(\d+)/i);
        var matchTo = lastChapText.match(/Chương\s+(\d+)/i);
        
        // Nếu tìm thấy thì lấy số đó (VD: 501), nếu file lỗi không có thì xài tạm vị trí
        var realStartChap = matchFrom ? matchFrom[1] : (batch.from + 1);
        var realEndChap = matchTo ? matchTo[1] : (batch.to + 1);
        
        // 🌟 1. CHÈN ĐOẠN MỞ ĐẦU (INTRO) CÓ SỐ CHƯƠNG CHUẨN XÁC
        combinedScript += '[BGM: Nhạc Dạo]\n';
        combinedScript += '[Dẫn Truyện]: Chào mừng các bạn đã đến với kênh truyện audio của chúng tôi. Hôm nay, chúng ta sẽ tiếp tục nghe từ Chương ' + realStartChap + '. Chúc các bạn có một buổi nghe truyện thật thư giãn và vui vẻ!\n\n';
        
        // Vòng lặp xử lý từng chương trong mẻ
        for (var c = batch.from; c <= batch.to; c++) {
            var chapText = globalScriptChapters[c];
            
            // 🌟 KIỂM TRA: Nếu là chương ĐẦU TIÊN của mẻ thì báo true để KHÔNG chèn trùng Nhạc Dạo
            var isFirstInBatch = (c === batch.from); 
            
            // Truyền cờ isFirstInBatch vào hàm
            var processedText = await runScriptAutomation(chapText, null, true);
            combinedScript += processedText + '\n\n'; 
        }

        // 🌟 2. CHÈN ĐOẠN KẾT THÚC (OUTRO) VÀ BẬT LẠI NHẠC DẠO
        combinedScript += '[BGM: Nhạc Dạo]\n';
        combinedScript += '[Dẫn Truyện]: Đến đây là kết thúc Chương ' + realEndChap + ', cũng là chương cuối của phần này. Cảm ơn các bạn đã chú ý lắng nghe. Xin chào và hẹn gặp lại các bạn ở những phần tiếp theo!\n\n';

        // Tự động tải file dưới dạng .docx chuẩn (Tên file cũng lấy số chuẩn luôn)
        var fileName = 'KichBan_Tu_Chuong_' + realStartChap + '_Den_' + realEndChap + '.docx';
        await downloadDocxFile(fileName, combinedScript);
        
        batch.status = 'Đã xong ✅';
        document.getElementById('status-script-' + batch.id).innerText = batch.status;
        document.getElementById('status-script-' + batch.id).style.color = '#10b981';
    }
    
    this.disabled = false;
    this.innerHTML = '<span class="material-icons">play_circle</span> CHẠY DỰNG KỊCH BẢN';
    showToast('success', 'Đã phân vai xong và tải file Word (.docx) về máy!');
});

// Hàm hỗ trợ TẠO VÀ TẢI file .docx (Dùng thư viện docx.js)
async function downloadDocxFile(filename, textContent) {
    const { Document, Packer, Paragraph, TextRun } = docx;

    // Tách văn bản thành từng dòng dựa trên ký tự xuống dòng
    const lines = textContent.split('\n');
    
    // Biến mỗi dòng thành một Paragraph (Đoạn văn) trong Word
    const paragraphs = lines.map(line => {
        return new Paragraph({
            children: [
                new TextRun({
                    text: line,
                    size: 28, // Kích thước font chữ (28 nửa point = 14pt)
                    font: "Times New Roman" // Có thể đổi thành "Arial" hoặc font khác nếu muốn
                })
            ],
            spacing: {
                after: 120 // Tạo khoảng cách nhỏ sau mỗi đoạn (xuống dòng đẹp mắt)
            }
        });
    });

    // Khởi tạo file Word
    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }]
    });

    // Đóng gói thành file Blob và kích hoạt tải về
    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// ==============================================================================
// GIAO DIỆN: CÀI ĐẶT SÁNG/TỐI & MÀU CHỦ ĐẠO
// ==============================================================================

document.getElementById('btnToggleSettings').addEventListener('click', function() {
    document.getElementById('settingsPanel').classList.toggle('active');
});

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    document.getElementById('btnThemeLight').classList.toggle('active', theme === 'light');
    document.getElementById('btnThemeDark').classList.toggle('active', theme === 'dark');
}

function setColor(color) {
    document.body.setAttribute('data-color', color);
    // Đổi viền active cho nút màu
    var circles = document.querySelectorAll('.color-circle');
    circles.forEach(function(c, idx) {
        c.classList.remove('active');
        if(c.getAttribute('onclick').includes(color)) c.classList.add('active');
    });
}

// Liên kết Input Number và Dropdown Select
function syncChapSelect(inputId, selectId) {
    var input = document.getElementById(inputId);
    var select = document.getElementById(selectId);
    
    if (!input || !select) return;

    // Khi gõ số -> Dropdown tự chuyển
    input.addEventListener('input', function() {
        var val = parseInt(this.value) - 1; // Select bắt đầu từ 0
        if (val >= 0 && val < select.options.length) {
            select.value = val;
        }
    });

    // Khi chọn Dropdown -> Ô số tự cập nhật
    select.addEventListener('change', function() {
        input.value = parseInt(this.value) + 1;
    });
}

// Gọi hàm đồng bộ này trong window.onload
syncChapSelect('inputChapFrom', 'chapFromScript');
syncChapSelect('inputChapTo', 'chapToScript');

// Hàm hiển thị Toast thông báo
function showToast(type, message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    
    // Đặt class màu sắc (success, error, info)
    toast.className = "toast " + type;
    
    // Chọn icon tương ứng
    var icon = "info";
    if (type === "success") icon = "check_circle";
    if (type === "error") icon = "error";
    
    // Chèn nội dung
    toast.innerHTML = `<span class="material-icons">${icon}</span> ${message}`;
    
    // Bật hiệu ứng hiển thị
    toast.classList.add("show");
    
    // Tự động tắt sau 3 giây
    setTimeout(function(){ 
        toast.classList.remove("show"); 
    }, 3000);
}

// ==============================================================================
// GIAO TIẾP VỚI CLOUDFLARE WORKER (TẠO AUDIO MP3 TỪ EDGE TTS)
// ==============================================================================

// BẠN HÃY DÁN ĐƯỜNG LINK CLOUDFLARE WORKER CỦA BẠN VÀO ĐÂY
const CLOUDFLARE_TTS_URL = 'https://edgeproxy.khcbsx.workers.dev/tts';
const CLOUDFLARE_TIKTOK_URL = 'https://tiktok-tts-proxy.khcbsx.workers.dev/';

// Hàm lấy âm thanh (Hỗ trợ định tuyến thông minh: Edge hoặc TikTok)
async function fetchAudioFromCloudflare(text, voiceConfig, pitchValue, rateValue) {
    if (!text || text.trim() === '') return null;
    
    // Tự động chọn đúng đường link dựa vào cấu hình giọng
    var targetUrl = voiceConfig.isEdge ? CLOUDFLARE_TTS_URL : CLOUDFLARE_TIKTOK_URL;
    
    // Đóng gói dữ liệu gửi đi (TikTok thường không nhận SSML pitch/rate như Edge)
    var payload = {
        text: text,
        voice: voiceConfig.apiCode
    };
    
    // Nếu là Edge thì nhét thêm thông số cao độ vào
    if (voiceConfig.isEdge) {
        payload.pitch = pitchValue + '%';
        payload.rate = rateValue + '%';
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Lỗi từ API Cloudflare: ' + response.statusText);
        }

        return await response.arrayBuffer();
        
    } catch (error) {
        console.error("Lỗi khi tải Audio: ", error);
        return null;
    }
}

// ==============================================================================
// LOGIC QUẢN LÝ NHẠC NỀN (BGM) VÀ ÂM LƯỢNG
// ==============================================================================
var bgmModal = document.getElementById('bgmConfigModal');
var btnOpenBgm = document.getElementById('btnOpenBgmConfig');
var btnCloseBgm = document.getElementById('btnCloseBgmModal');
var btnSaveBgm = document.getElementById('btnSaveBgmConfig');

// Khai báo biến toàn cục (RAM) lưu trữ file nhạc và mức âm lượng
window.globalThemeFile = null;
window.globalAmbientFiles = [];
window.globalBgmVolume = 0.15; // Mặc định 15%

// Mở & Đóng Popup
if (btnOpenBgm) btnOpenBgm.addEventListener('click', () => bgmModal.classList.add('active'));
if (btnCloseBgm) btnCloseBgm.addEventListener('click', () => bgmModal.classList.remove('active'));
if (btnSaveBgm) {
    btnSaveBgm.addEventListener('click', () => {
        bgmModal.classList.remove('active');
        showToast('success', 'Đã lưu cấu hình nhạc tạm thời vào trình duyệt!');
    });
}

// Xử lý thanh trượt âm lượng
var volumeSlider = document.getElementById('bgmVolumeSlider');
var volumeDisplay = document.getElementById('bgmVolumeDisplay');
if (volumeSlider && volumeDisplay) {
    volumeSlider.addEventListener('input', function() {
        volumeDisplay.innerText = this.value + '%';
        window.globalBgmVolume = parseInt(this.value) / 100;
    });
}

// Xử lý nạp Nhạc Dạo (Theme)
var inputTheme = document.getElementById('inputFileTheme');
var txtThemeName = document.getElementById('themeFileName');
if (inputTheme) {
    inputTheme.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            window.globalThemeFile = e.target.files[0];
            txtThemeName.innerText = "✅ " + window.globalThemeFile.name;
            txtThemeName.style.color = "#10b981";
        }
    });
}

// Xử lý nạp Nhạc Trung Tính (Ambient)
var inputAmbient = document.getElementById('inputFileAmbient');
var txtAmbientNames = document.getElementById('ambientFileNames');
if (inputAmbient) {
    inputAmbient.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            window.globalAmbientFiles = Array.from(e.target.files);
            txtAmbientNames.innerText = "✅ Đã tải lên " + window.globalAmbientFiles.length + " bài nhạc.";
            txtAmbientNames.style.color = "#10b981";
        }
    });
}

// ==============================================================================
// LOGIC QUẢN LÝ HÀNG ĐỢI TẠO AUDIO TỰ ĐỘNG
// ==============================================================================

// Biến toàn cục lưu trữ danh sách file kịch bản đã nạp
var globalAudioScripts = []; 
var audioQueue = [];

// Bắt sự kiện người dùng tải file Word kịch bản lên
var fileInputAudio = document.getElementById('wordFileInputAudio');
var chapSelectAudio = document.getElementById('chapFromAudio');
var btnAddAudioQueue = document.getElementById('btnAddAudioQueue');

if (fileInputAudio) {
    fileInputAudio.addEventListener('change', async function(event) {
        var files = event.target.files;
        if (!files || files.length === 0) return;

        showToast('info', 'Đang đọc nội dung file Word...');

        // Đọc từng file được chọn
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            try {
                var arrayBuffer = await file.arrayBuffer();
                var result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                
                // Lưu tên file và nội dung vào RAM
                globalAudioScripts.push({
                    fileName: file.name,
                    content: result.value
                });
            } catch (err) {
                console.error("Lỗi đọc file: " + file.name, err);
                showToast('error', 'Lỗi khi đọc file: ' + file.name);
            }
        }

        // Cập nhật Dropdown hiển thị danh sách file
        updateAudioDropdown();
        showToast('success', 'Đã nạp thành công ' + files.length + ' file kịch bản!');
    });
}

// Cập nhật danh sách file vào thẻ <select>
function updateAudioDropdown() {
    if (!chapSelectAudio) return;
    
    chapSelectAudio.innerHTML = '';
    
    if (globalAudioScripts.length === 0) {
        chapSelectAudio.disabled = true;
        btnAddAudioQueue.disabled = true;
        btnAddAudioQueue.style.opacity = '0.5';
        return;
    }

    globalAudioScripts.forEach(function(script, index) {
        var opt = document.createElement('option');
        opt.value = index;
        opt.textContent = script.fileName;
        chapSelectAudio.appendChild(opt);
    });

    chapSelectAudio.disabled = false;
    btnAddAudioQueue.disabled = false;
    btnAddAudioQueue.style.opacity = '1';
}

// Bắt sự kiện bấm nút "Thêm vào mẻ chờ" (Audio)
if (btnAddAudioQueue) {
    btnAddAudioQueue.addEventListener('click', function() {
        var selectedIdx = chapSelectAudio.value;
        if (selectedIdx === "" || selectedIdx === null) return;
        
        var selectedScript = globalAudioScripts[selectedIdx];
        
        // Tạo một mẻ (batch) tạo Audio mới
        var batch = {
            id: Date.now(),
            fileIndex: selectedIdx,
            fileName: selectedScript.fileName,
            status: 'Chờ xử lý'
        };
        
        audioQueue.push(batch);
        renderAudioQueue();
        
        // Hiện nút "CHẠY TẠO AUDIO" nếu có mẻ chờ
        var btnStartAudio = document.getElementById('btnStartAudio');
        if (btnStartAudio) btnStartAudio.style.display = 'inline-flex';
    });
}

// ==============================================================================
// NÚT BẤM KÍCH HOẠT HỆ THỐNG TẠO AUDIO (TÍCH HỢP PAUSE/STOP & LIVE TEXT)
// ==============================================================================
var isAudioPaused = false;
var isAudioStopped = false;

var btnStartAudio = document.getElementById('btnStartAudio');
var btnPauseAudio = document.getElementById('btnPauseAudio');
var btnStopAudio = document.getElementById('btnStopAudio');
var liveMonitor = document.getElementById('liveTextMonitor');

// Hàm Helper để hệ thống chờ đợi nếu bị bấm Tạm Dừng
async function checkPauseState() {
    while (isAudioPaused && !isAudioStopped) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Xử lý sự kiện nút Tạm dừng / Tiếp tục
if (btnPauseAudio) {
    btnPauseAudio.addEventListener('click', function() {
        isAudioPaused = !isAudioPaused;
        if (isAudioPaused) {
            this.innerHTML = '<span class="material-icons">play_circle</span> TIẾP TỤC';
            this.style.backgroundColor = '#10b981'; // Đổi màu xanh lá
            showToast('info', 'Đã tạm dừng tiến trình tạo Audio.');
        } else {
            this.innerHTML = '<span class="material-icons">pause_circle</span> TẠM DỪNG';
            this.style.backgroundColor = '#f59e0b'; // Trả về màu cam
            showToast('success', 'Tiếp tục tạo Audio...');
        }
    });
}

// Xử lý sự kiện nút Dừng Lại (Hủy bỏ hoàn toàn)
if (btnStopAudio) {
    btnStopAudio.addEventListener('click', function() {
        if(confirm('Bạn có chắc chắn muốn HỦY BỎ tiến trình tạo Audio hiện tại? Dữ liệu đang chạy sẽ bị mất.')) {
            isAudioStopped = true;
            isAudioPaused = false;
        }
    });
}

// Cập nhật lại hàm renderAudioQueue để hiển thị đúng khung nút
function renderAudioQueue() {
    var tbody = document.getElementById('audioQueueBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (audioQueue.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Chưa có mẻ nào. Tải Word và thêm vào hàng đợi.</td></tr>';
        document.getElementById('audioControlGroup').style.display = 'none';
        return;
    }
    
    document.getElementById('audioControlGroup').style.display = 'flex';
    
    audioQueue.forEach(function(b, index) {
        var tr = document.createElement('tr');
        var statusHtml = `<div id="status-audio-${b.id}" style="color: #eab308; font-weight: 600;">${b.status}</div>`;
        if (b.status.includes('Đang thu âm') || b.status.includes('Đang trộn') || b.status.includes('Đang nén')) {
            statusHtml += `
                <div style="width: 100%; height: 6px; background-color: var(--border); border-radius: 4px; margin-top: 5px; overflow: hidden;">
                    <div id="progress-bar-${b.id}" style="height: 100%; background-color: #3b82f6; width: ${b.progress || 0}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;" id="progress-text-${b.id}">
                    ${b.progressText || ''}
                </div>
            `;
        }

        tr.innerHTML = `
            <td>Mẻ ${index + 1}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${b.fileName}">${b.fileName}</td>
            <td style="min-width: 150px;">${statusHtml}</td>
            <td id="download-audio-${b.id}">--</td>
            <td style="text-align:center; display:flex; justify-content:center; gap:15px; align-items:center;">
                <span class="material-icons" style="color:#ef4444; cursor:pointer; font-size: 22px;" onclick="removeAudioBatch(${b.id})" title="Xóa mẻ này">delete</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Xóa mẻ tạo Audio
window.removeAudioBatch = function(id) {
    audioQueue = audioQueue.filter(function(b) { return b.id !== id; });
    renderAudioQueue();
}

// ==============================================================================
// BỘ MÁY XỬ LÝ ÂM THANH (WEB AUDIO API & LAME.JS)
// ==============================================================================

// Hàm tiện ích: Đọc file gốc (.mp3) thành dữ liệu nhị phân
function readFileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

// Hàm ép Sóng âm (AudioBuffer) thành file MP3 tải về
function encodeAudioBufferToMp3(audioBuffer) {
    var channels = 1; // Nén Mono để file nhẹ và ghép nhanh
    var sampleRate = audioBuffer.sampleRate;
    var kbps = 128; // Chất lượng âm thanh chuẩn
    var mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    var mp3Data = [];

    var rawData = audioBuffer.getChannelData(0); 
    var sampleBlockSize = 1152;
    var int16Array = new Int16Array(rawData.length);
    
    // Chuyển hệ sóng Float32 sang Int16 cho Lame.js hiểu
    for (var i = 0; i < rawData.length; i++) {
        var s = Math.max(-1, Math.min(1, rawData[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Băm nhỏ dữ liệu và tiến hành nén
    for (var i = 0; i < int16Array.length; i += sampleBlockSize) {
        var sampleChunk = int16Array.subarray(i, i + sampleBlockSize);
        var mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }
    var mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

// Hàm bóc tách kịch bản để phân biệt Đâu là Thoại, Đâu là Nhạc Nền
function parseScriptLine(line) {
    var match = line.match(/^\[(.*?)\]:?\s*(.*)$/);
    if (!match) return null;
    var tag = match[1].trim();
    var text = match[2] ? match[2].trim() : '';

    if (tag.startsWith('BGM:')) {
        return { isBgm: true, bgmType: tag.includes('Nhạc Dạo') ? 'theme' : 'ambient' };
    }
    return { isBgm: false, voice: tag, text: text };
}

// ==============================================================================
// NÚT NGHE THỬ BẢN NHÁP 3 PHÚT (PREVIEW AUDIO ĐỘC LẬP)
// ==============================================================================
var btnPreviewAudio = document.getElementById('btnPreviewAudio');
if (btnPreviewAudio) {
    btnPreviewAudio.addEventListener('click', async function() {
        if (audioQueue.length === 0) {
            showToast('error', 'Vui lòng thêm ít nhất 1 mẻ vào hàng đợi để nghe thử!');
            return;
        }

        var originalText = this.innerHTML;
        this.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">sync</span> ĐANG DỰNG BẢN NHÁP...';
        this.disabled = true;

        document.getElementById('previewAudioContainer').style.display = 'none';
        if (liveMonitor) liveMonitor.value = 'Đang tiến hành dựng bản nháp 3 phút (Khoảng 30 câu đầu tiên)...\n\n';

        try {
            // Lấy kịch bản của file ĐẦU TIÊN trong hàng đợi
            var batch = audioQueue[0];
            var scriptText = globalAudioScripts[batch.fileIndex].content;
            var lines = scriptText.split('\n').filter(l => l.trim() !== '');
            var segments = lines.map(parseScriptLine).filter(s => s !== null);

            // CẮT LẤY ĐÚNG 30 CÂU ĐẦU TIÊN (Để máy tính xử lý siêu nhanh)
            var previewSegments = segments.slice(0, 30);

            var tempAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var timeline = [];
            var currentTime = 0;

            // Hàm SSML
            function toSSMLPercent(val) {
                if (!val) return "+0";
                var percent = Math.round((parseFloat(val) - 1.0) * 100);
                return percent >= 0 ? "+" + percent : "" + percent;
            }

            // Đọc UI
            var uiNameNarrator = document.getElementById('voiceNarrator') ? document.getElementById('voiceNarrator').value.trim() : 'Người Dẫn Truyện (Edge)';
            var uiNameMale     = document.getElementById('voiceMale') ? document.getElementById('voiceMale').value.trim() : 'Nam Minh (Edge)';
            var uiNameFemale   = document.getElementById('voiceFemale') ? document.getElementById('voiceFemale').value.trim() : '';

            function getDynamicVoiceTarget(voiceTag) {
                function findVoiceConfig(displayName) {
                    var found = SCRIPT_TAB_VOICES.find(v => v.n === displayName);
                    return found ? found : { isEdge: true, apiCode: 'vi-VN-NamMinhNeural' };
                }
                if (voiceTag === 'Dẫn Truyện') return { config: findVoiceConfig(uiNameNarrator), pitch: toSSMLPercent(window.pitchRateNarrator) };
                if (voiceTag === 'Giọng Nam') return { config: findVoiceConfig(uiNameMale), pitch: toSSMLPercent(window.pitchRateMale) };
                if (voiceTag === 'Giọng Nữ') return { config: findVoiceConfig(uiNameFemale), pitch: toSSMLPercent(window.pitchRateFemale) };
                return { config: findVoiceConfig(voiceTag), pitch: "+0" };
            }

            // KÉO AUDIO CHO 30 CÂU NÀY
            for (var k = 0; k < previewSegments.length; k++) {
                var seg = previewSegments[k];

                if (liveMonitor) {
                    if (seg.isBgm) liveMonitor.value += `\n[BGM: ${seg.bgmType === 'theme' ? 'Nhạc Dạo' : 'Nhạc Trung Tính'}]`;
                    else liveMonitor.value += `\n[${seg.voice}]: ${seg.text}`;
                    liveMonitor.scrollTop = liveMonitor.scrollHeight;
                }

                if (seg.isBgm) {
                    var file = null;
if (seg.bgmType === 'theme') {
    file = window.globalThemeFile;
} else if (window.globalAmbientFiles && window.globalAmbientFiles.length > 0) {
    var previewNextIndex = Math.floor(Math.random() * window.globalAmbientFiles.length);
    if (window.globalAmbientFiles.length > 1) {
        while (previewNextIndex === window.lastAmbientIndex) {
            previewNextIndex = Math.floor(Math.random() * window.globalAmbientFiles.length);
        }
    }
    window.lastAmbientIndex = previewNextIndex;
    file = window.globalAmbientFiles[previewNextIndex];
}
                    if (file) {
                        try {
                            var ab = await readFileToArrayBuffer(file);
                            var decodedBgm = await tempAudioCtx.decodeAudioData(ab);
                            timeline.push({ buffer: decodedBgm, startTime: currentTime, isBgm: true });
                        } catch (e) {}
                    }
                } else {
                    var cleanText = seg.text.trim();
                    var hasContent = /[a-zA-Z0-9\u00C0-\u1EF9]/.test(cleanText);

                    if (hasContent && cleanText.length >= 2) {
                        var targetProps = getDynamicVoiceTarget(seg.voice);

                        // 🌟 TÍCH HỢP EPIC MODE ĐỂ TEST NHÁP LUÔN
                        var isEpicMode = cleanText.match(/^Chương\s+\d+/i) && seg.voice === 'Dẫn Truyện';
                        var finalPitch = isEpicMode ? "-10" : targetProps.pitch;
                        var finalRate = isEpicMode ? "-15" : "+0";

                        var mp3Buffer = await fetchAudioFromCloudflare(cleanText, targetProps.config, finalPitch, finalRate);

                        if (mp3Buffer && mp3Buffer.byteLength > 100) {
                            try {
                                var audioData = mp3Buffer.slice(0);
                                var decodedTts = await tempAudioCtx.decodeAudioData(audioData);
                                timeline.push({ buffer: decodedTts, startTime: currentTime, isBgm: false });

                                // NHỊP THỞ THÔNG MINH
                                var pauseDuration = 0.3;
                                if (isEpicMode) pauseDuration = 1.5;
                                else if (cleanText.endsWith('...') || cleanText.endsWith('…')) pauseDuration = 0.8;
                                else if (cleanText.endsWith('.') || cleanText.endsWith('!') || cleanText.endsWith('?')) pauseDuration = 0.5;

                                if (seg.voice !== 'Dẫn Truyện') pauseDuration += 0.2;

                                currentTime += decodedTts.duration + pauseDuration;
                            } catch (e) {}
                        }
                    }
                }
            }

            // TRỘN AUDIO BẢN NHÁP 
            if (timeline.length > 0 && currentTime > 0) {
                var totalDuration = currentTime + 2; // Thêm 2s ngân đuôi cho nháp
                var sampleRate = 44100;
                var offlineCtx = new OfflineAudioContext(1, sampleRate * totalDuration, sampleRate);

                var bgmItems = timeline.filter(t => t.isBgm);
                bgmItems.sort((a, b) => a.startTime - b.startTime);
                for (var b = 0; b < bgmItems.length; b++) {
                    if (bgmItems[b + 1]) bgmItems[b].stopTime = bgmItems[b + 1].startTime;
                    else bgmItems[b].stopTime = totalDuration;
                }

                timeline.forEach(item => {
                    var source = offlineCtx.createBufferSource();
                    source.buffer = item.buffer;

                    if (item.isBgm) {
                        var gainNode = offlineCtx.createGain();
                        // Ưu tiên đọc âm lượng nhạc từ slider, nếu không có mặc định là 0.15
                        var volumeSlider = document.getElementById('bgmVolumeSlider');
                        var vol = volumeSlider ? (parseInt(volumeSlider.value) / 100) : 0.15;
                        
                        var effectiveEnd = Math.min(item.startTime + item.buffer.duration, item.stopTime || totalDuration, totalDuration);

                        gainNode.gain.setValueAtTime(vol, item.startTime);
                        var fadeOutStart = Math.max(item.startTime, effectiveEnd - 2.5);
                        gainNode.gain.setValueAtTime(vol, fadeOutStart);
                        gainNode.gain.linearRampToValueAtTime(0, effectiveEnd);

                        source.connect(gainNode);
                        gainNode.connect(offlineCtx.destination);
                        source.start(item.startTime);
                        source.stop(effectiveEnd);
                    } else {
                        source.connect(offlineCtx.destination);
                        source.start(item.startTime);
                    }
                });

                var renderedBuffer = await offlineCtx.startRendering();
                var mp3Blob = encodeAudioBufferToMp3(renderedBuffer);
                var url = URL.createObjectURL(mp3Blob);

                // Kích hoạt Player
                var player = document.getElementById('previewAudioPlayer');
                player.src = url;
                document.getElementById('previewAudioContainer').style.display = 'flex';
                
                showToast('success', 'Đã tải xong bản nháp! Bạn có thể nghe ngay.');
            }

        } catch (error) {
            console.error(error);
            showToast('error', 'Có lỗi xảy ra khi tạo bản nháp!');
        } finally {
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
}

// ----------------------------------------------------
// NÚT CHẠY AUDIO CHÍNH THỨC (CƠ CHẾ "CUỐN CHIẾU" CHỐNG TRÀN RAM)
// ----------------------------------------------------
btnStartAudio.addEventListener('click', async function() {
    if (audioQueue.length === 0) return;
    
    isAudioStopped = false;
    isAudioPaused = false;

    // Hiển thị giao diện 3 nút
    btnStartAudio.innerHTML = '<span class="material-icons">hourglass_top</span> ĐANG TẠO AUDIO...';
    btnStartAudio.disabled = true;
    btnPauseAudio.style.display = 'inline-flex';
    btnStopAudio.style.display = 'inline-flex';
    
    if (liveMonitor) liveMonitor.value = '';

    // Hàm quy đổi từ số thập phân (1.00) sang phần trăm chuẩn SSML (+0)
    function toSSMLPercent(val) {
        if (!val) return "+0";
        var percent = Math.round((parseFloat(val) - 1.0) * 100);
        return percent >= 0 ? "+" + percent : "" + percent;
    }

    // ĐỌC THÔNG SỐ ĐANG CHỌN TRÊN 3 CỘT GIAO DIỆN
    var uiNameNarrator = document.getElementById('voiceNarrator') ? document.getElementById('voiceNarrator').value.trim() : 'Người Dẫn Truyện (Edge)';
    var uiNameMale     = document.getElementById('voiceMale') ? document.getElementById('voiceMale').value.trim() : 'Nam Minh (Edge)';
    var uiNameFemale   = document.getElementById('voiceFemale') ? document.getElementById('voiceFemale').value.trim() : '';

    // BỘ ĐỊNH TUYẾN THÔNG MINH (Hỗ trợ đa nguồn Edge/TikTok)
    function getDynamicVoiceTarget(voiceTag) {
        function findVoiceConfig(displayName) {
            var found = SCRIPT_TAB_VOICES.find(v => v.n === displayName);
            return found ? found : { isEdge: true, apiCode: 'vi-VN-NamMinhNeural' };
        }

        // 1. Ánh xạ Thẻ Vai Trò (Chuẩn mới)
        if (voiceTag === 'Dẫn Truyện') return { config: findVoiceConfig(uiNameNarrator), pitch: toSSMLPercent(window.pitchRateNarrator) };
        if (voiceTag === 'Giọng Nam') return { config: findVoiceConfig(uiNameMale), pitch: toSSMLPercent(window.pitchRateMale) };
        if (voiceTag === 'Giọng Nữ') return { config: findVoiceConfig(uiNameFemale), pitch: toSSMLPercent(window.pitchRateFemale) };

        // 2. Kế hoạch dự phòng (Chuẩn cũ)
        return { config: findVoiceConfig(voiceTag), pitch: "+0" };
    }

    var tempAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // VÒNG LẶP XỬ LÝ TỪNG MẺ CHỜ
    for (var i = 0; i < audioQueue.length; i++) {
        if (isAudioStopped) break;

        var batch = audioQueue[i];
        if (batch.status === 'Đã xong ✅') continue;

        var scriptText = globalAudioScripts[batch.fileIndex].content;
        var lines = scriptText.split('\n').filter(l => l.trim() !== '');
        var segments = lines.map(parseScriptLine).filter(s => s !== null);
        
        var totalSegments = segments.length;
        
        // ⚙️ THIẾT LẬP KÍCH THƯỚC KHÚC (CHUNK) CHỐNG TRÀN RAM
        var CHUNK_SIZE = 40; 
        var finalMp3Blobs = []; 
        
        // 🛡️ LÍNH GÁC BẢO VỆ NHẠC NỀN
        var lastBgmIndex = -999; // Nhớ vị trí câu thoại chèn nhạc cuối cùng để chống dính
        if (typeof window.lastAmbientIndex === 'undefined') window.lastAmbientIndex = -1; // Nhớ bài hát cuối cùng để chống lặp
        var timestampLog = [];
        var globalRunningTime = 0;
                        
        // ========================================================
        // BẮT ĐẦU CHIẾN THUẬT "CUỐN CHIẾU" (CHIA ĐỂ TRỊ)
        // ========================================================
        for (var chunkStart = 0; chunkStart < totalSegments; chunkStart += CHUNK_SIZE) {
            if (isAudioStopped) break;

            var chunkSegments = segments.slice(chunkStart, chunkStart + CHUNK_SIZE);
            var timeline = []; 
            var currentTime = 0;

            var currentChunkIndex = Math.floor(chunkStart / CHUNK_SIZE) + 1;
            var totalChunks = Math.ceil(totalSegments / CHUNK_SIZE);

            // --- BƯỚC 1: KÉO ÂM THANH CHO RIÊNG KHÚC NÀY ---
            for (var k = 0; k < chunkSegments.length; k++) {
                await checkPauseState(); 
                if (isAudioStopped) break; 

                var seg = chunkSegments[k];
                var actualIndex = chunkStart + k;
                
                // Cập nhật UI Progress
                batch.status = `Đang xử lý Khúc ${currentChunkIndex}/${totalChunks}`;
                batch.progress = Math.round(((actualIndex) / totalSegments) * 100);
                batch.progressText = `Kéo dữ liệu: ${actualIndex + 1}/${totalSegments} đoạn`;
                renderAudioQueue();

                if (liveMonitor) {
                    if (seg.isBgm) liveMonitor.value += `\n[BGM: ${seg.bgmType === 'theme' ? 'Nhạc Dạo' : 'Nhạc Trung Tính'}]`;
                    else liveMonitor.value += `\n[${seg.voice}]: ${seg.text}`;
                    liveMonitor.scrollTop = liveMonitor.scrollHeight;
                }

                if (seg.isBgm) {
                    // --- LUẬT 1: NHƯỜNG ĐƯỜNG CHO NHẠC DẠO ---
                    // Nhìn trước tương lai: Nếu định phát Nhạc Nền, mà thấy 3 câu tới có thẻ Nhạc Dạo -> Bắt buộc tự hủy.
                    if (seg.bgmType !== 'theme') {
                        var clashAhead = false;
                        for (var lookAhead = 1; lookAhead <= 3; lookAhead++) {
                            if (actualIndex + lookAhead < totalSegments) {
                                var futureSeg = segments[actualIndex + lookAhead];
                                if (futureSeg.isBgm && futureSeg.bgmType === 'theme') {
                                    clashAhead = true; break;
                                }
                            }
                        }
                        if (clashAhead) continue; // Tự hủy, không kéo Nhạc Nền nữa
                    }

                    // --- LUẬT 2: CÁCH LY AN TOÀN ---
                    // Bất kỳ 2 thẻ nhạc nào (dù do kịch bản in lỗi dính sát nhau) cũng phải cách nhau tối thiểu 3 câu thoại.
                    if (actualIndex - lastBgmIndex < 3) {
                        continue; // Bỏ qua thẻ này
                    }
                    lastBgmIndex = actualIndex;

                    // --- LUẬT 3: RANDOM KHÔNG LẶP LẠI BÀI VỪA HÁT ---
                    var file = null;
                    if (seg.bgmType === 'theme') {
                        file = window.globalThemeFile; // Nhạc dạo thì luôn là bài cố định
                    } else {
                        if (window.globalAmbientFiles.length > 0) {
                            var nextIndex = Math.floor(Math.random() * window.globalAmbientFiles.length);
                            // Nếu kho nhạc có nhiều hơn 1 bài, bắt vòng lặp chạy đến khi bốc được bài MỚI thì thôi
                            if (window.globalAmbientFiles.length > 1) {
                                while (nextIndex === window.lastAmbientIndex) {
                                    nextIndex = Math.floor(Math.random() * window.globalAmbientFiles.length);
                                }
                            }
                            window.lastAmbientIndex = nextIndex;
                            file = window.globalAmbientFiles[nextIndex];
                        }
                    }

                    // Kéo Audio và đưa lên Timeline
                    if (file) {
                        try {
                            var ab = await readFileToArrayBuffer(file);
                            var decodedBgm = await tempAudioCtx.decodeAudioData(ab);
                            timeline.push({ buffer: decodedBgm, startTime: currentTime, isBgm: true });
                        } catch (e) {} 
                    }
                } else {
                    var cleanText = seg.text.trim();
                    var hasContent = /[a-zA-Z0-9\u00C0-\u1EF9]/.test(cleanText);
                    
                    if (hasContent && cleanText.length >= 2) {
                        // Ánh xạ linh hoạt bằng hàm Bộ định tuyến vừa tạo
                        var targetProps = getDynamicVoiceTarget(seg.voice);
                        
                        // 🌟 KÍCH HOẠT EPIC MODE (TIÊU ĐỀ CHƯƠNG)
                        // Quét xem dòng này có bắt đầu bằng "Chương + Số" và do Dẫn Truyện đọc không
                        var isEpicMode = cleanText.match(/^Chương\s+\d+/i) && seg.voice === 'Dẫn Truyện';
                        
                        // Chỉnh thông số: Nếu là Tiêu đề Chương thì trầm giọng (-8%) và đọc chậm lại (-15%)
                        var finalPitch = isEpicMode ? "-15" : targetProps.pitch;
                        var finalRate = isEpicMode ? "-15" : "+0";

                        // Truyền thông số đặc biệt này lên Cloudflare
                        var mp3Buffer = await fetchAudioFromCloudflare(cleanText, targetProps.config, finalPitch, finalRate);
                        
                        if (mp3Buffer && mp3Buffer.byteLength > 100) {
                            try {
                                var audioData = mp3Buffer.slice(0); 
                                var decodedTts = await tempAudioCtx.decodeAudioData(audioData);
                                timeline.push({ buffer: decodedTts, startTime: currentTime, isBgm: false });
                                
                                // 🌟 BỘ TÍNH TOÁN NHỊP THỞ THÔNG MINH
                                var pauseDuration = 0.3; // Mặc định nghỉ 0.3s
                                
                                if (isEpicMode) {
                                    // BẮT BUỘC NGHỈ 1.5 GIÂY ĐỂ TẠO SỰ HOÀNH TRÁNG CHO NHẠC DẠO ĐÁNH LÊN
                                    pauseDuration = 1.5; 
                                }
                                else if (cleanText.endsWith('...') || cleanText.endsWith('…')) {
                                    pauseDuration = 0.8;
                                } 
                                else if (cleanText.endsWith('.') || cleanText.endsWith('!') || cleanText.endsWith('?')) {
                                    pauseDuration = 0.5;
                                }

                                if (seg.voice !== 'Dẫn Truyện') {
                                    pauseDuration += 0.2;
                                }

                                timestampLog.push({
                                    voice: seg.voice,
                                    text: cleanText,
                                    duration: decodedTts.duration + pauseDuration,
                                    startTime: globalRunningTime + currentTime
                                });                              
                                
                                currentTime += decodedTts.duration + pauseDuration; 
                            } catch (e) {}
                        }
                    }
                }
            } // Hết vòng lặp kéo âm thanh của 1 khúc

            if (isAudioStopped) break;

            // --- BƯỚC 2: TRỘN VÀ NÉN GỌN GÀNG KHÚC NÀY ---
            if (timeline.length > 0 && currentTime > 0) {
                batch.progressText = `Trộn & Nén MP3 Khúc ${currentChunkIndex}... (Chống tràn RAM)`;
                renderAudioQueue();

                // 🌟 NÂNG CẤP: NẾU LÀ KHÚC CUỐI CÙNG, ĐỂ NHẠC NGÂN THÊM 10 GIÂY RỒI MỚI TẮT
                var isLastChunk = (currentChunkIndex === totalChunks);
                var tailTime = isLastChunk ? 10 : 1; 
                
                var totalDuration = currentTime + tailTime; 
                var sampleRate = 44100;
                var offlineCtx = new OfflineAudioContext(1, sampleRate * totalDuration, sampleRate);

                // 🌟 THÊM MỚI: TÍNH TOÁN ĐIỂM DỪNG (STOP TIME) CHO NHẠC NỀN CHỐNG CHỒNG CHÉO
                var bgmItems = timeline.filter(function(t) { return t.isBgm; });
                // Sắp xếp lại các thẻ nhạc theo đúng thứ tự thời gian xuất hiện
                bgmItems.sort(function(a, b) { return a.startTime - b.startTime; });
                
                for (var b = 0; b < bgmItems.length; b++) {
                    var currentBgm = bgmItems[b];
                    var nextBgm = bgmItems[b + 1];
                    
                    // Nếu có bài nhạc tiếp theo xuất hiện, bài hiện tại PHẢI DỪNG khi bài mới bắt đầu
                    if (nextBgm) {
                        currentBgm.stopTime = nextBgm.startTime;
                    } else {
                        // Nếu là bài nhạc cuối cùng, cho phép phát đến hết độ dài của Khúc này
                        currentBgm.stopTime = totalDuration; 
                    }
                }

                // BẮT ĐẦU ĐỔ ÂM THANH VÀO BỘ TRỘN
                timeline.forEach(item => {
                    var source = offlineCtx.createBufferSource();
                    source.buffer = item.buffer;

                    if (item.isBgm) {
                        var gainNode = offlineCtx.createGain();
                        var vol = window.globalBgmVolume || 0.15;
                        var actualDuration = item.buffer.duration;
                        
                        // 🌟 XÁC ĐỊNH ĐIỂM KẾT THÚC THỰC TẾ CỦA BÀI NHẠC NÀY
                        // Nó sẽ dừng lại ở 1 trong 3 trường hợp sớm nhất:
                        // 1. Tự hết bài (startTime + actualDuration)
                        // 2. Bị bài nhạc tiếp theo chèn lên (stopTime)
                        // 3. Bị giới hạn bởi thời gian tối đa của khúc này (totalDuration)
                        var effectiveEnd = Math.min(
                            item.startTime + actualDuration, 
                            item.stopTime || totalDuration,
                            totalDuration
                        );

                        // Thiết lập âm lượng chuẩn lúc bắt đầu
                        gainNode.gain.setValueAtTime(vol, item.startTime);
                        
                        // 🌟 KỸ THUẬT FADE-OUT ÁP DỤNG CHO MỌI TRƯỜNG HỢP
                        // Bắt đầu nhỏ tiếng trước khi kết thúc 2.5 giây
                        var fadeOutStart = Math.max(item.startTime, effectiveEnd - 2.5); 
                        
                        // Giữ nguyên âm lượng đến điểm bắt đầu Fade-out
                        gainNode.gain.setValueAtTime(vol, fadeOutStart);
                        // Vuốt mượt mà về 0 tại điểm kết thúc
                        gainNode.gain.linearRampToValueAtTime(0, effectiveEnd); 

                        source.connect(gainNode);
                        gainNode.connect(offlineCtx.destination);
                        
                        source.start(item.startTime);
                        // Ép dừng chính xác tại effectiveEnd để dọn sạch RAM và không bị rác âm thanh
                        source.stop(effectiveEnd); 

                    } else {
                        // Xử lý Voice (Giọng đọc) bình thường, không Fade-out
                        source.connect(offlineCtx.destination);
                        source.start(item.startTime);
                    }
                });

                var renderedBuffer = await offlineCtx.startRendering();
                
                // Nhả luồng 1 chút cho UI thở
                await new Promise(resolve => setTimeout(resolve, 100)); 

                // Nén bằng Lame.js cho khúc này và ném vào Túi dự trữ
                var mp3ChunkBlob = encodeAudioBufferToMp3(renderedBuffer);
                finalMp3Blobs.push(mp3ChunkBlob);
                globalRunningTime += (currentTime + 1);
                
                // THAO TÁC CỨU SINH: Dọn sạch rác RAM ngay lập tức!
                timeline = null;
                renderedBuffer = null;
                offlineCtx = null;
            }
          }

        // ========================================================
        if (isAudioStopped) {
            batch.status = 'Đã hủy ⛔';
            batch.progressText = 'Người dùng đã dừng tiến trình.';
            renderAudioQueue();
            continue; 
        }

        // --- BƯỚC 3: TUNG TUYỆT CHIÊU "NỐI BLOB" VÀ TẢI VỀ ---
        batch.status = 'Đang đóng gói...';
        batch.progress = 100;
        batch.progressText = 'Gộp các khúc thành file Audio siêu tốc...';
        renderAudioQueue();

        // Gộp tất cả các cục MP3 nhỏ thành 1 file khổng lồ mà không tốn RAM giải mã
        var masterBlob = new Blob(finalMp3Blobs, { type: 'audio/mp3' });
        var url = URL.createObjectURL(masterBlob);

        var a = document.createElement('a');
        a.href = url;
        var cleanFileName = batch.fileName.replace('.docx', '');
        a.download = `AudioBook_${cleanFileName}.mp3`;
        a.click(); 
        exportTimestampTxtFiles(timestampLog, globalRunningTime, cleanFileName);

        // Xóa đường dẫn tạm để giải phóng bộ nhớ
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        batch.status = 'Đã xong ✅';
        batch.progressText = 'Hoàn tất! File đã được lưu vào máy tính.';
        renderAudioQueue();
    }

    // RESET GIAO DIỆN
    btnStartAudio.disabled = false;
    btnStartAudio.innerHTML = '<span class="material-icons">play_circle</span> CHẠY TẠO AUDIO';
    btnPauseAudio.style.display = 'none';
    btnStopAudio.style.display = 'none';
    
    if (isAudioStopped) {
        showToast('error', 'Đã hủy quá trình tạo Audio!');
        if (liveMonitor) liveMonitor.value += '\n\n⛔ TIẾN TRÌNH ĐÃ BỊ HỦY!';
    } else {
        showToast('success', 'Toàn bộ mẻ Audio đã xử lý xong!');
        if (liveMonitor) liveMonitor.value += '\n\n✅ HOÀN TẤT TẠO AUDIO!';
    }
});


// ============================================================================
// TÍNH NĂNG NGHE THỬ GIỌNG ĐỌC (CHỐNG NGỐN RAM & LỖI TRÙNG LẶP)
// ============================================================================
let previewAudioCtx = null;
let currentPreviewSource = null;

async function playPreviewVoice(selectId, buttonElement) {
    if (!previewAudioCtx) {
        previewAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (currentPreviewSource) {
        currentPreviewSource.stop();
        currentPreviewSource.disconnect();
        currentPreviewSource = null;
    }

    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;
    const displayName = selectEl.value.trim();

    const voiceConfig = SCRIPT_TAB_VOICES.find(v => v.n === displayName) 
                        || { isEdge: true, apiCode: 'vi-VN-NamMinhNeural' };

    const originalBtnHTML = buttonElement.innerHTML;
    buttonElement.innerHTML = '<span class="material-icons" style="animation: spin 1s linear infinite;">sync</span>';
    buttonElement.disabled = true;

    try {
        let sampleText = "Chào bạn, đây là giọng đọc thử. Chúc bạn một ngày tốt lành.";
        if (voiceConfig.apiCode.includes('en_')) {
            sampleText = "Hello! I am your test voice. Have a wonderful day.";
        }

        const mp3Buffer = await fetchAudioFromCloudflare(sampleText, voiceConfig, "+0", "+0");

        if (mp3Buffer && mp3Buffer.byteLength > 100) {
            const audioData = mp3Buffer.slice(0);
            const decodedData = await previewAudioCtx.decodeAudioData(audioData);

            currentPreviewSource = previewAudioCtx.createBufferSource();
            currentPreviewSource.buffer = decodedData;
            currentPreviewSource.connect(previewAudioCtx.destination);
            currentPreviewSource.start(0);
        }
    } catch (error) {
        console.error("Lỗi nghe thử:", error);
        alert("API đang bận, vui lòng chờ vài giây rồi thử lại!");
    } finally {
        buttonElement.innerHTML = originalBtnHTML;
        buttonElement.disabled = false;
    }
}

// ==============================================================================
// XUẤT 2 FILE TXT — COLAB ANIMAGINE XL 3.1 + AI FULL DETAIL
// Smart Scene Grouping: ~30s mềm, 60s cứng, không cắt giữa câu
// Bỏ qua block mở đầu kênh và kết thúc chương
// ==============================================================================
async function exportTimestampTxtFiles(timestampLog, runningTime, taskId) {
    if (!timestampLog || timestampLog.length === 0) {
        console.warn('⚠️ Không có dữ liệu timestampLog để xuất file.');
        return;
    }

    var SEP80 = '================================================================================';
    var SEP50 = '────────────────────────────────────────────────────';

    // ══════════════════════════════════════════════════════════════════════════
    // HEADER COLAB — ANIMAGINE XL 3.1 DANBOORU TAG FORMAT (CHUẨN OFFICIAL)
    // ══════════════════════════════════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════════════
    // HEADER COLAB — ANIMAGINE XL 4.0-Opt DANBOORU TAG FORMAT (CHUẨN OFFICIAL)
    // ══════════════════════════════════════════════════════════════════════════
    var headerColab = [
        SEP80,
        '╔══════════════════════════════════════════════════════════════════════════════╗',
        '║   IMAGE PROMPT — COLAB ANIMAGINE XL 4.0-Opt (DANBOORU TAG FORMAT)         ║',
        '║   ⚡ CHUẨN OFFICIAL: TAG ORDER → SUBJECT → DETAIL → QUALITY CUỐI CÙNG    ║',
        '║   📖 ĐỌC [Giọng Nam]/[Giọng Nữ] ĐỂ HIỂU NGỮ CẢNH — KHÔNG TẠO PROMPT    ║',
        '╚══════════════════════════════════════════════════════════════════════════════╝',
        SEP80,
        '',
        '★★★ ANIMAGINE XL 4.0-Opt — OFFICIAL PROMPT GUIDE (CAGLIOSTRO LAB) ★★★',
        '',
        '⚠️  MODEL NÀY DÙNG DANBOORU TAGS — KHÔNG PHẢI NATURAL LANGUAGE',
        '    Natural language như "A young warrior standing in a bamboo forest"',
        '    sẽ cho kết quả KÉM hơn nhiều so với Danbooru tag format.',
        '',
        SEP50,
        'THỨ TỰ TAG BẮT BUỘC (OFFICIAL — TRAIN THEO THỨ TỰ NÀY):',
        SEP50,
        '',
        '  [1] GENDER TAG      : 1boy / 1girl / 2boys / 1boy 1girl / ...',
        '  [2] CHARACTER NAME  : tên nhân vật (nếu có) — ví dụ: xu fan',
        '  [3] SERIES/SOURCE   : tên bộ truyện — ví dụ: xianxia novel',
        '  [4] CONTENT TAGS    : tất cả mô tả chi tiết (tóc, mắt, trang phục, hành động, bối cảnh, ánh sáng)',
        '  [5] RATING TAG      : safe (BẮT BUỘC — giữ ảnh sạch)',
        '  [6] QUALITY TAGS    : year 2025, masterpiece, high score, great score, absurdres  ← LUÔN Ở CUỐI',
        '',
        '⚠️  QUALITY TAGS Ở CUỐI — KHÔNG ĐẶT Ở ĐẦU',
        '    Nếu đặt quality tags ở đầu → artist tags và concept tags không trigger đúng',
        '    → kết quả mất style, mất nhân vật, mất bối cảnh',
        '',
        SEP50,
        'RECOMMENDED SETTINGS (COLAB PIPELINE):',
        SEP50,
        '  • CFG Scale   : 5',
        '  • Steps       : 28',
        '  • Sampler     : Euler Ancestral (Euler a)',
        '  • Resolution  : 1344 x 768  (16:9 landscape — cho video YouTube)',
        '  • Alt 16:9    : 1536 x 640  (12:5 — wider cinematic)',
        '',
        SEP50,
        'NEGATIVE PROMPT CHUẨN OFFICIAL (ANIMAGINE XL 4.0):',
        SEP50,
        '  lowres, blurry, worst quality, bad anatomy, bad hands,',
        '  extra fingers, missing fingers, deformed face, mutated limbs,',
        '  duplicate, multiple views, watermark, logo, text, subtitle,',
        '  frame border, cropped, oversaturated, flat lighting,',
        '  modern objects, chibi',
        '',
        SEP80,
        'PHẦN 1 — CẤU TRÚC FILE VÀ QUY TẮC ĐỌC',
        SEP80,
        '',
        'FILE NÀY CHỨA 3 LOẠI DÒNG:',
        '',
        '  [Dẫn Truyện]: nội dung  → CÓ [IMAGE PROMPT] → BẮT BUỘC VIẾT PROMPT',
        '  [Giọng Nam]: nội dung   → KHÔNG có prompt → CHỈ ĐỌC ĐỂ HIỂU NGỮ CẢNH',
        '  [Giọng Nữ]: nội dung    → KHÔNG có prompt → CHỈ ĐỌC ĐỂ HIỂU NGỮ CẢNH',
        '',
        'MỖI SCENE GROUP = 1 ẢNH, gom nhiều dòng lại để đủ ngữ cảnh (~30 giây)',
        '',
        'QUY TẮC CỨNG:',
        '  ✅ Thay [IMAGE PROMPT: CHƯA TẠO] bằng prompt Danbooru tags tiếng Anh',
        '  ✅ GIỮ NGUYÊN dòng [FILE: scene_xxxxx.xxxs.jpg] — KHÔNG SỬA',
        '  ✅ Đọc [Giọng Nam]/[Giọng Nữ] bên dưới để hiểu cảm xúc + hành động',
        '  ❌ KHÔNG tạo prompt cho dòng [Giọng Nam] hay [Giọng Nữ]',
        '  ❌ KHÔNG dùng natural language — chỉ dùng Danbooru tags',
        '',
        '⚠️  CHỐNG LỖI PORTRAIT BIAS (Animagine hay tạo chân dung thay vì action):',
        '  → Scene chiến đấu/hành động BẮT BUỘC thêm: dynamic_pose, wide shot, full body',
        '  → KHÔNG dùng: portrait / close-up / bust khi muốn cảnh toàn thân/hành động',
        '  → Thêm vào [NEGATIVE]: portrait, static pose, looking at viewer, simple background',
        '',
        SEP80,
        'PHẦN 2 — TEMPLATE PROMPT DANBOORU (ANIMAGINE XL 4.0-Opt)',
        SEP80,
        '',
        'TEMPLATE CHUẨN:',
        '  1boy/1girl, [character name], [series],',
        '  [hair color] hair, [hair length], [hair style],',
        '  [eye color] eyes, [expression],',
        '  [clothing tags], [accessories],',
        '  [action/pose tags], [location tags],',
        '  [lighting tags], [atmosphere tags],',
        '  [camera/composition tags],',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres',
        '',
        '  [NEGATIVE: lowres, blurry, worst quality, bad anatomy, bad hands,',
        '  extra fingers, missing fingers, deformed face, mutated limbs,',
        '  duplicate, multiple views, watermark, logo, text, subtitle,',
        '  frame border, cropped, oversaturated, flat lighting, modern objects, chibi]',
        '',
        SEP50,
        'VÍ DỤ 1 — TIÊN HIỆP NAM (xianxia male cultivator):',
        SEP50,
        '',
        '  [IMAGE PROMPT: 1boy, xu fan, xianxia,',
        '  black hair, medium length, half-tied, jade hairpin,',
        '  dark brown eyes, calm expression, beauty mark under left eye,',
        '  white hanfu, pale blue trim, silver embroidery, flowing sleeves,',
        '  jade ring, standing, arms behind back, slight smile,',
        '  bamboo courtyard, stone pathway, tea table, carved railings,',
        '  afternoon, warm golden sunlight through bamboo leaves,',
        '  soft rim light on hair, cool green shadow,',
        '  medium shot, full body, eye level, shallow depth of field,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: lowres, blurry, worst quality, bad anatomy, bad hands,',
        '  extra fingers, missing fingers, deformed face, mutated limbs,',
        '  duplicate, watermark, logo, text, modern objects, chibi]',
        '',
        SEP50,
        'VÍ DỤ 2 — CHIẾN ĐẤU KIẾM HIỆP (battle scene):',
        SEP50,
        '',
        '  [IMAGE PROMPT: 1boy, wuxia, chinese fantasy,',
        '  black hair, topknot, white ribbon, disheveled,',
        '  dark brown eyes, battle fury, intense focus,',
        '  white hanfu, blue embroidery, torn right sleeve, bandaged forearm,',
        '  longsword, qi energy slash, dynamic_pose, fighting stance,',
        '  stone ruins battlefield, broken pillars, debris mid-air,',
        '  golden afternoon backlight, harsh rim light, volumetric dust,',
        '  warm amber vs cool blue contrast,',
        '  wide shot, full body, extreme low angle, diagonal composition,',
        '  motion blur on sword,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: portrait, close-up face, static pose, looking at viewer,',
        '  simple background, lowres, blurry, worst quality, bad anatomy,',
        '  bad hands, extra fingers, watermark, logo, text, chibi]',
        '',
        SEP50,
        'VÍ DỤ 3 — TIÊN CẢNH TU LUYỆN (cultivation scene):',
        SEP50,
        '',
        '  [IMAGE PROMPT: 1girl, xianxia, chinese cultivation,',
        '  silver white hair, long, elegant bun, golden phoenix hairpin,',
        '  closed eyes, serene expression, slight smile,',
        '  white translucent cultivation robes, silver crane embroidery,',
        '  lotus mudra, meditation, floating platform,',
        '  sea of clouds, floating islands, jade pavilion distant,',
        '  golden dawn sunbeams, divine rim light halo, soft blue ambient,',
        '  spiritual energy ribbons, glowing spirit particles,',
        '  wide shot, full body, slightly below eye level, deep depth of field,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: lowres, blurry, worst quality, bad anatomy, bad hands,',
        '  extra fingers, missing fingers, deformed face, mutated limbs,',
        '  duplicate, watermark, logo, text, modern objects, chibi]',
        '',
        SEP80,
        'PHẦN 3 — DANBOORU TAG REFERENCE (COPY & PASTE)',
        SEP80,
        '',
        SEP50,
        'HAIR TAGS:',
        SEP50,
        '  Màu: black hair / white hair / silver hair / blonde hair / brown hair',
        '       blue hair / red hair / purple hair / green hair / grey hair',
        '  Dài: very long hair / long hair / medium hair / short hair',
        '  Kiểu: straight hair / wavy hair / curly hair / twin tails / ponytail',
        '        topknot / bun / braided hair / loose hair / half updo',
        '  Phụ kiện: jade hairpin / golden hairpin / hair ribbon / hair ornament',
        '',
        SEP50,
        'EYE TAGS:',
        SEP50,
        '  Màu: black eyes / dark brown eyes / brown eyes / blue eyes / red eyes',
        '       purple eyes / green eyes / golden eyes / grey eyes',
        '  Biểu cảm: determined eyes / gentle eyes / cold eyes / fierce eyes',
        '            calm expression / angry expression / sad eyes / teary eyes',
        '',
        SEP50,
        'CLOTHING — XIANXIA/WUXIA:',
        SEP50,
        '  hanfu / daoist robes / cultivation robes / battle armor / light armor',
        '  white robes / black robes / blue robes / red robes',
        '  flowing sleeves / wide sleeves / embroidered robes / silk robes',
        '  jade pendant / jade ring / spiritual treasure / longsword / flying sword',
        '',
        SEP50,
        'ACTION/POSE TAGS:',
        SEP50,
        '  standing / sitting / walking / running / flying',
        '  sword slash / qi release / meditation / lotus position',
        '  arms crossed / arms behind back / reaching out / pointing',
        '  dynamic_pose / battle stance / relaxed pose / elegant pose',
        '',
        SEP50,
        'SETTING — XIANXIA:',
        SEP50,
        '  bamboo forest / ancient ruins / mountain peak / sea of clouds',
        '  floating island / jade pavilion / stone courtyard / temple hall',
        '  waterfall / spirit lake / immortal realm / mortal world',
        '',
        SEP50,
        'LIGHTING TAGS:',
        SEP50,
        '  sunlight / golden hour / dawn light / moonlight / candlelight',
        '  backlight / rim light / god rays / volumetric light / soft light',
        '  warm lighting / cool lighting / dramatic lighting / ethereal glow',
        '  spiritual energy glow / magical particles / glowing effects',
        '',
        SEP50,
        'COMPOSITION TAGS:',
        SEP50,
        '  wide shot / medium shot / close-up / extreme close-up',
        '  low angle / high angle / eye level / bird\'s eye view',
        '  depth of field / shallow focus / bokeh / blurry background',
        '  cowboy shot / upper body / full body / portrait',
        '',
        SEP80,
        'PHẦN 4 — QUY TẮC NHÂN VẬT NHẤT QUÁN',
        SEP80,
        '',
        'BẮT BUỘC: Mỗi nhân vật PHẢI có CÙNG tags xuyên suốt toàn bộ file.',
        '',
        '  B1: Đọc lướt toàn bộ file — liệt kê tên nhân vật xuất hiện',
        '  B2: Xây CHARACTER TAG SET cho mỗi nhân vật:',
        '      → hair color, hair length, hair style, eye color, clothing color/style',
        '      → special features (scar, beauty mark, weapon)',
        '  B3: COPY y chang tag set đó vào mọi scene nhân vật đó xuất hiện',
        '  B4: CHỈ ĐỔI: action tags, expression tags, setting tags',
        '  B5: KHÔNG BAO GIỜ đổi: hair color, eye color, clothing color, features',
        '',
        '  VÍ DỤ NHẤT QUÁN:',
        '  Scene 1: 1boy, xu fan, xianxia, black hair, dark brown eyes,',
        '           white hanfu, jade ring, standing, bamboo courtyard, safe, ...',
        '  Scene 2: 1boy, xu fan, xianxia, black hair, dark brown eyes,',
        '           white hanfu, jade ring, battle stance, ruins, safe, ...',
        '           ↑ hair/eyes/clothing GIỐNG HỆT — chỉ đổi pose và setting',
        '',
        SEP80,
        'PHẦN 5 — PHÂN LOẠI SCENE VÀ TAGS BẮT BUỘC THEO TỪNG LOẠI',
        SEP80,
        '',
        'ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT — ĐỌC KỸ TRƯỚC KHI VIẾT PROMPT',
        '',
        'Dựa vào [Dẫn Truyện] + [Giọng Nam/Nữ] xung quanh, xác định LOẠI SCENE',
        'rồi áp dụng ĐÚNG BỘ TAGS bắt buộc theo loại đó.',
        '',
        SEP50,
        'LOẠI A — COMBAT / ACTION (chiến đấu, tung chiêu, truy đuổi):',
        SEP50,
        '',
        '  TAGS BẮT BUỘC THÊM VÀO CONTENT:',
        '    → Pose  : dynamic_pose, action_pose, mid-air / jumping / leaping / lunging',
        '    → Camera: wide shot, full body, dutch_angle / from_below / extreme_angle',
        '    → FX    : speed_lines, motion_blur, emphasis_lines, aura',
        '    → Vũ khí: slashing, weapon_energy, glowing_weapon, attack_trail',
        '    → Bố cục: diagonal_composition, dynamic_angle',
        '',
        '  NEGATIVE BẮT BUỘC THÊM:',
        '    portrait, upper body only, standing still, looking at viewer,',
        '    facing viewer, simple background, centered composition, symmetry',
        '',
        '  VÍ DỤ COMBAT:',
        '  [IMAGE PROMPT: 1boy, xianxia,',
        '  black hair, topknot, white hanfu, torn sleeve,',
        '  dark brown eyes, battle fury,',
        '  longsword, slashing, weapon_energy, glowing_sword,',
        '  dynamic_pose, mid-air, leaping forward,',
        '  stone ruins, broken pillars, debris mid-air,',
        '  speed_lines, motion_blur, emphasis_lines, aura,',
        '  backlighting, golden dust, volumetric light,',
        '  wide shot, full body, dutch_angle, from_below,',
        '  diagonal_composition,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: portrait, standing still, looking at viewer, simple background,',
        '  centered composition, symmetry, upper body only,',
        '  lowres, bad anatomy, watermark, chibi]',
        '',
        SEP50,
        'LOẠI B — DRAMATIC MOMENT (đối đầu, nhìn thẳng địch, cao trào cảm xúc):',
        SEP50,
        '',
        '  TAGS BẮT BUỘC THÊM VÀO CONTENT:',
        '    → Pose  : tense stance, battle ready, facing away, clenched fist',
        '    → Camera: cowboy shot / medium shot, from_below / from_side',
        '    → FX    : emphasis_lines, aura, wind, hair blowing',
        '    → Bố cục: negative_space, depth of field',
        '',
        '  VÍ DỤ DRAMATIC:',
        '  [IMAGE PROMPT: 1boy, xianxia,',
        '  black hair, long, windswept, dark brown eyes, cold expression,',
        '  white hanfu, silver embroidery,',
        '  tense stance, battle ready, sword at side, clenched fist,',
        '  cliff edge, stormy sky, lightning distant,',
        '  emphasis_lines, aura, hair blowing in wind,',
        '  from_below, cowboy shot, depth of field, negative_space,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: portrait, simple background, looking at viewer,',
        '  lowres, bad anatomy, watermark, chibi]',
        '',
        SEP50,
        'LOẠI C — DIALOGUE / EMOTION (nói chuyện, cảm xúc, nội tâm):',
        SEP50,
        '',
        '  TAGS BẮT BUỘC THÊM VÀO CONTENT:',
        '    → Pose  : standing / sitting / kneeling + expression rõ ràng',
        '    → Camera: medium shot / cowboy shot, eye level',
        '    → FX    : depth of field, bokeh, soft lighting',
        '',
        '  VÍ DỤ EMOTION:',
        '  [IMAGE PROMPT: 1boy, xianxia,',
        '  black hair, dark brown eyes, sad expression, looking down,',
        '  white hanfu, jade ring,',
        '  standing, arms at sides, slight bow,',
        '  stone courtyard, moonlight, fallen petals,',
        '  soft lighting, depth of field, bokeh background,',
        '  medium shot, cowboy shot, eye level,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: lowres, bad anatomy, watermark, chibi, nsfw]',
        '',
        SEP50,
        'LOẠI D — SCENERY / ESTABLISHING SHOT (phong cảnh, cảnh mở đầu):',
        SEP50,
        '',
        '  TAGS BẮT BUỘC:',
        '    → Subject: no humans (nếu không có nhân vật)',
        '    → Camera : wide shot / very wide shot / panorama / aerial view',
        '    → FX     : fog, atmospheric perspective, god rays, bloom',
        '',
        '  VÍ DỤ SCENERY:',
        '  [IMAGE PROMPT: no humans, xianxia, chinese fantasy,',
        '  mountain peaks, floating islands, ancient temple,',
        '  sea of clouds, cherry blossom trees,',
        '  golden dawn, god rays, bloom, fog, atmospheric_perspective,',
        '  very wide shot, panorama, aerial view,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: lowres, blurry, watermark, humans, chibi]',
        '',
        SEP50,
        'LOẠI E — CULTIVATION / POWER-UP (tu luyện, đột phá cảnh giới):',
        SEP50,
        '',
        '  TAGS BẮT BUỘC:',
        '    → Pose  : meditation, lotus_position / floating / kneeling',
        '    → FX    : aura, energy, glowing, particles, spiritual energy,',
        '               light rays, emphasis_lines',
        '    → Camera: wide shot / medium shot, slightly below eye level',
        '',
        '  VÍ DỤ CULTIVATION:',
        '  [IMAGE PROMPT: 1boy, xianxia,',
        '  black hair, dark brown eyes, serene expression,',
        '  white hanfu, jade ring,',
        '  lotus_position, floating, eyes closed,',
        '  mountain peak, sea of clouds, night sky, full moon,',
        '  aura, energy, glowing, particles, light rays, emphasis_lines,',
        '  wide shot, full body, slightly below eye level,',
        '  safe,',
        '  year 2025, masterpiece, high score, great score, absurdres]',
        '  [NEGATIVE: portrait, looking at viewer, simple background,',
        '  lowres, bad anatomy, watermark, chibi]',
        '',
        SEP80,
        'TÓM TẮT NHANH — CHỌN LOẠI SCENE:',
        SEP80,
        '',
        '  Đọc [Dẫn Truyện] → thấy từ khoá:',
        '  ⚔️  đánh / chém / tung chiêu / truy sát    → LOẠI A (Combat)',
        '  😤  đối đầu / nhìn thẳng / cao trào         → LOẠI B (Dramatic)',
        '  💬  nói chuyện / hỏi / đáp / buồn vui       → LOẠI C (Dialogue)',
        '  🏔️  mô tả cảnh vật / địa điểm mới           → LOẠI D (Scenery)',
        '  ✨  ngồi thiền / đột phá / năng lượng tỏa   → LOẠI E (Cultivation)',
        '',
        'NGUYÊN TẮC VÀNG:',
        '  Loại A + B → LUÔN có: wide shot, full body, dynamic_pose/tense stance',
        '  Loại A + B → LUÔN có trong NEGATIVE: portrait, standing still,',
        '               looking at viewer, simple background',
        '',
        SEP80,
        'BẮT ĐẦU XỬ LÝ — ĐỌC NGỮ CẢNH → VIẾT DANBOORU TAGS → QUALITY TAGS Ở CUỐI',
        SEP80,
        ''
      
    ];
  
var headerAI = [
    SEP80,
    '╔══════════════════════════════════════════════════════════════════════════════╗',
    '║   IMAGE PROMPT — AI FULL DETAIL (GEMINI · GENSPARK · CHATGPT)            ║',
    '║   🌟 NATURAL LANGUAGE 150-200 TỪ — KHÔNG GIỚI HẠN TOKEN 🌟               ║',
    '║   📖 ĐỌC [Giọng Nam]/[Giọng Nữ] ĐỂ HIỂU NGỮ CẢNH — KHÔNG TẠO PROMPT    ║',
    '╚══════════════════════════════════════════════════════════════════════════════╝',
    SEP80,
    '',
    'FILE NÀY DÙNG CHO: Gemini (Imagen 3) · Genspark AI Agent · ChatGPT (GPT Image)',
    'KHÔNG GIỚI HẠN TOKEN — Viết đầy đủ natural language 150-200 từ mỗi prompt',
    '',
    '┌─────────────────────────────────────────────────────────────────────────────┐',
    '│  CHỌN NỀN TẢNG TẠO ẢNH — ĐỌC TRƯỚC KHI BẮT ĐẦU                         │',
    '├─────────────────────────────────────────────────────────────────────────────┤',
    '│  GENSPARK AI AGENT hoặc CHATGPT (GPT Image):                              │',
    '│    → Thay TẤT CẢ model tag → [MODEL:gpt-image-2]                         │',
    '│    → Genspark/ChatGPT tự bỏ qua dòng [NEGATIVE:]                         │',
    '│    → Đọc PHẦN 8 để biết workflow chi tiết với Genspark                   │',
    '├─────────────────────────────────────────────────────────────────────────────┤',
    '│  GEMINI (Imagen 3):                                                        │',
    '│    → Thay TẤT CẢ model tag → [MODEL:imagen3]                             │',
    '│    → Gemini tự bỏ qua dòng [NEGATIVE:]                                   │',
    '└─────────────────────────────────────────────────────────────────────────────┘',
    '',
    '┌──────────────────────────────────────────────────────────────────────────┐',
    '│  BẢNG CHỌN MODEL TAG                                                    │',
    '├──────────────────────────────────┬─────────────────────────────────────┤',
    '│  [MODEL:imagen3]                 │  [MODEL:gpt-image-2]               │',
    '├──────────────────────────────────┼─────────────────────────────────────┤',
    '│  Tiên hiệp / Tu tiên             │  Hiện đại / Đô thị / Giang hồ      │',
    '│  Kiếm hiệp / Võ hiệp            │  Chiến tranh / Quân sự              │',
    '│  Cổ đại / Cung đấu               │  Kinh dị / Ma quỷ / Dark Fantasy   │',
    '│  Lãng mạn / Ngôn tình           │  Sci-fi / Cyberpunk / Zombie        │',
    '│  Slice of life / Học đường      │  Trinh thám / Tội phạm              │',
    '│  Isekai (fantasy style)          │  Hành động / Giang hồ              │',
    '└──────────────────────────────────┴─────────────────────────────────────┘',
    '',
    'NHIỆM VỤ: Viết IMAGE PROMPT tiếng Anh cho từng SCENE GROUP trong file TXT',
    'MỤC ĐÍCH: Tạo ảnh minh họa cho video đọc truyện YouTube/TikTok',
    '',
    '🌟 PHIÊN BẢN MỚI: Prompts CỰC KỲ CHI TIẾT 150-200 từ',
    '★ TRỌNG TÂM: Mô tả ánh sáng, ngoại hình nhân vật, composition CỰC KỲ CỤ THỂ ★',
    '',
    SEP80,
    'PHẦN 1 — CẤU TRÚC FILE TXT VÀ QUY TẮC XỬ LÝ',
    SEP80,
    '',
    'FILE NÀY CHỨA 3 LOẠI DÒNG:',
    '',
    '  [Dẫn Truyện]: nội dung  → CÓ [IMAGE PROMPT] → BẮT BUỘC VIẾT PROMPT',
    '  [Giọng Nam]: nội dung   → KHÔNG có prompt    → CHỈ ĐỌC ĐỂ HIỂU NGỮ CẢNH',
    '  [Giọng Nữ]: nội dung    → KHÔNG có prompt    → CHỈ ĐỌC ĐỂ HIỂU NGỮ CẢNH',
    '',
    'MỖI SCENE GROUP = 1 ẢNH, đã được gom ~30 giây để đủ ngữ cảnh.',
    'Mỗi SCENE GROUP có cấu trúc:',
    '',
    '  [SCENE GROUP]',
    '  startTime: 21.820s',
    '  → duration: 32.450s →',
    '  [IMAGE PROMPT: CHƯA TẠO]',
    '  [FILE: scene_00021.820s.jpg]',
    '  [Dẫn Truyện]: Một thanh đạo khí linh kiếm...',
    '  [Dẫn Truyện]: Từ Phàm gật đầu nói:',
    '  [Giọng Nam]: Hai món này ta tặng cho ngươi...',
    '  [Giọng Nữ]: Đệ tử tuân mệnh sư huynh.',
    '',
    'QUY TẮC XỬ LÝ:',
    '1. Đọc TẤT CẢ dòng [Dẫn Truyện] + [Giọng Nam] + [Giọng Nữ] trong scene để hiểu ngữ cảnh',
    '2. Chỉ thay [IMAGE PROMPT: CHƯA TẠO] bằng prompt tiếng Anh — không đổi gì khác',
    '3. Đọc các scene trước/sau để giữ nhân vật nhất quán xuyên suốt file',
    '4. Dòng [FILE: scene_xxxxx.xxxs.jpg] — KHÔNG XÓA, KHÔNG SỬA, giữ nguyên 100%',
    '5. KHÔNG thêm dòng mới, KHÔNG xóa dòng nào, KHÔNG dùng markdown hay ngoặc kép',
    '6. KHÔNG tạo prompt cho dòng [Giọng Nam] hay [Giọng Nữ]',
    '',
    SEP80,
    'PHẦN 2 — CẤU TRÚC PROMPT NÂNG CAO (CHI TIẾT CỰC ĐỘ - 150-200 TỪ)',
    SEP80,
    '',
    'MỖI PROMPT PHẢI CÓ ĐỦ 10 THÀNH PHẦN (viết thành 1 đoạn liền mạch 150-200 từ):',
    '',
    '  [1] MODEL TAG       — Bắt buộc đầu tiên: [MODEL:imagen3] hoặc [MODEL:gpt-image-2]',
    '',
    '  [2] SUBJECT         — Chủ thể CỰC KỲ CHI TIẾT (30-40 từ):',
    '                        • Nhân vật: giới tính, độ tuổi, tư thế cụ thể',
    '                        • Cảnh quan: mô tả từng chi tiết địa hình, kiến trúc',
    '                        • Vật thể: hình dạng, kích thước, vị trí trong không gian',
    '',
    '  [3] ACTION/POSE     — Hành động CỤ THỂ (15-25 từ):',
    '                        ❌ SAI: "standing"',
    '                        ✅ ĐÚNG: "standing in dynamic battle-ready stance, right arm',
    '                        extended forward gripping sword hilt, left arm pulled back',
    '                        for balance, body weight shifted onto front leg"',
    '',
    '  [4] APPEARANCE      — Mô tả ĐẦY ĐỦ 7 ĐIỂM (40-50 từ):',
    '                        (1) Tóc: màu + độ dài + kiểu tóc + phụ kiện',
    '                            VD: "medium-length jet-black hair tied in high topknot',
    '                            with ornate jade hairpin, loose strands framing face"',
    '                        (2) Mắt: màu + biểu cảm + hình dạng',
    '                            VD: "sharp determined dark brown eyes blazing with',
    '                            battle fury, pupils contracted in intense focus"',
    '                        (3) Biểu cảm: mô tả cụ thể cảm xúc trên khuôn mặt',
    '                            VD: "furrowed brow, clenched jaw, sweat drops on temple"',
    '                        (4) Vóc dáng: chiều cao + thể hình',
    '                            VD: "lean muscular athletic build, broad shoulders"',
    '                        (5) Trang phục: màu + chất liệu + chi tiết + trạng thái',
    '                            VD: "white flowing hanfu with blue embroidery along',
    '                            collar and sleeves, torn at right shoulder from combat,',
    '                            fabric billowing dramatically in wind"',
    '                        (6) Phụ kiện/Vũ khí: vị trí + chi tiết',
    '                            VD: "silver-sheathed longsword at left hip, jade pendant',
    '                            glowing at chest, leather arm guards"',
    '                        (7) Đặc điểm nhận diện: scar, tattoo, birthmark',
    '                            VD: "thin scar crossing left eyebrow"',
    '',
    '  [5] SETTING         — Địa điểm CỰC KỲ CỤ THỂ (25-35 từ):',
    '                        • Địa điểm chính + chi tiết kiến trúc/địa hình',
    '                        • Thời gian trong ngày: dawn/noon/dusk/night/golden hour',
    '                        • Thời tiết: clear/rainy/foggy/snowy/stormy',
    '                        • Các yếu tố môi trường: cây cối, nước, đá, tàn tích',
    '                        VD: "ancient crumbling stone ruins battlefield with broken',
    '                        marble pillars and scattered rusted weapons, overgrown with',
    '                        moss and vines, late afternoon storm clouds gathering"',
    '',
    '  [6] LIGHTING        — ★★★ CỰC KỲ QUAN TRỌNG ★★★ (30-45 từ):',
    '                        CÔNG THỨC 4 BƯỚC:',
    '                        B1: Nguồn sáng (sun/moon/fire/magic/neon)',
    '                        B2: Hướng sáng (from above/behind/below/side)',
    '                        B3: Hiệu ứng (god rays/rim light/volumetric fog/shadows)',
    '                        B4: Màu sắc + mood (golden/blue/warm/cold/vivid)',
    '',
    '                        XIANXIA/TIÊN HIỆP (soft, painterly):',
    '                        ✅ "soft ethereal mist rolling through scene,',
    '                        dramatic painted lighting with radiant golden dawn sunbeams',
    '                        breaking through clouds from behind and above,',
    '                        creating divine rim light halo around figure,',
    '                        cool blue ambient light mixing with warm golden highlights,',
    '                        bright clean tones, vivid watercolor colors"',
    '',
    '                        WUXIA/CHIẾN ĐẤU (realistic, dramatic):',
    '                        ✅ "volumetric dust and smoke illuminated by dramatic backlight,',
    '                        intense dramatic lighting with golden late-afternoon sunlight',
    '                        cutting sharply through debris clouds from right side,',
    '                        creating harsh rim light on figure edge,',
    '                        warm amber highlights contrasting with cool blue shadow areas,',
    '                        bright clean tones, vivid colors"',
    '',
    '  [7] ATMOSPHERE      — Không khí tổng thể (10-15 từ):',
    '                        VD: "explosive high-stakes battle atmosphere, adrenaline-fueled',
    '                        climax moment" / "transcendent peaceful breakthrough',
    '                        cultivation atmosphere, divine serenity"',
    '',
    '  [8] COMPOSITION     — Góc máy CỤ THỂ (15-20 từ):',
    '                        • Camera angle: wide/close-up/medium/extreme low angle/',
    '                          bird eye/dutch tilt/over-the-shoulder',
    '                        • Framing: subject position (left-third/centered/right-third)',
    '                        • Depth of field: deep (tất cả rõ) / shallow (chỉ chủ thể rõ)',
    '                        VD: "extreme low angle camera looking up at 30 degrees,',
    '                        diagonal dynamic composition, subject dominant in left-third',
    '                        frame, shallow depth of field with blurred background"',
    '',
    '  [9] PARTICLE FX     — Hiệu ứng hạt và chuyển động (10-15 từ):',
    '                        • dust particles in sunbeam / falling sakura petals',
    '                        • floating embers / swirling mist / motion blur on weapon',
    '                        • glowing spirit particles / snowflakes / rain droplets',
    '                        VD: "thousands of tiny glowing cyan spirit particles floating',
    '                        everywhere like fireflies, motion blur streaks on sword"',
    '',
    '  [10] STYLE+QUALITY  — Art style + quality tags (25-35 từ):',
    '                        XIANXIA/TIÊN HIỆP:',
    '                        "Chinese xianxia illustration style, soft delicate brushwork,',
    '                        hand-painted watercolor details, luminous ethereal glow effects,',
    '                        masterpiece, best quality, ultra-detailed, 8K resolution,',
    '                        horizontal landscape orientation, 16:9 aspect ratio"',
    '',
    '                        WUXIA/KIẾM HIỆP:',
    '                        "Chinese wuxia manhua digital art style, dynamic action',
    '                        illustration, bold ink-wash brush accents, kinetic energy lines,',
    '                        masterpiece, best quality, ultra-detailed, 8K resolution,',
    '                        horizontal landscape orientation, 16:9 aspect ratio"',
    '',
    '                        + BẮT BUỘC KẾT THÚC:',
    '                        "NO text, NO watermark, NO letters, NO words,',
    '                        NO Chinese characters, NO Japanese characters,',
    '                        NO Korean characters, NO subtitles, NO UI elements,',
    '                        NO logo, NO signature, pure illustration only"',
    '',
    '★★★ TỔNG ĐỘ DÀI: 150-200 TỪ CHO MỖI PROMPT ★★★',
    '',
    SEP80,
    'PHẦN 2.5 — TỪ KHÓA ÁNH SÁNG QUYẾT ĐỊNH (70% CHẤT LƯỢNG ẢNH)',
    SEP80,
    '',
    '★ ÁNH SÁNG LÀ LINH HỒN CỦA ẢNH — PHẢI MÔ TẢ 30-45 TỪ RIÊNG CHO LIGHTING ★',
    '',
    '┌─────────────────────────────────────────────────────────────────────────┐',
    '│ ÁNH SÁNG TIÊN HIỆP / XIANXIA (Soft, Ethereal, Painterly)              │',
    '├─────────────────────────────────────────────────────────────────────────┤',
    '│ SÁNG/TRUNG TÍNH:                                                        │',
    '│  • soft ethereal mist rolling through scene                            │',
    '│  • dramatic painted lighting with soft sunbeams filtering through      │',
    '│  • warm golden hour sunlight breaking gently through clouds            │',
    '│  • radiant morning light casting soft long shadows                     │',
    '│  • gentle moonlight with delicate silver glow                          │',
    '│                                                                         │',
    '│ MA THUẬT/TU LUYỆN:                                                      │',
    '│  • luminous ethereal glow radiating from spiritual energy              │',
    '│  • soft volumetric fog with glowing particles                          │',
    '│  • delicate rim light outlining character from divine source           │',
    '│  • watercolor wash lighting, dreamy atmosphere                         │',
    '│  • cool blue spiritual light mixing with warm golden accents           │',
    '└─────────────────────────────────────────────────────────────────────────┘',
    '',
    '┌─────────────────────────────────────────────────────────────────────────┐',
    '│ ÁNH SÁNG WUXIA / CHIẾN ĐẤU (Realistic, Dramatic, Cinematic)           │',
    '├─────────────────────────────────────────────────────────────────────────┤',
    '│ HÀNH ĐỘNG/CHIẾN ĐẤU:                                                    │',
    '│  • intense dramatic lighting with golden god rays piercing clouds      │',
    '│  • volumetric fog with visible sharp light shafts cutting through      │',
    '│  • harsh rim lighting from below creating ominous silhouette           │',
    '│  • explosive orange firelight illuminating smoke and debris            │',
    '│  • warm amber highlights contrasting with cool blue shadow side        │',
    '│                                                                         │',
    '│ KINH DỊ/TỐI TĂM:                                                        │',
    '│  • cold blue moonlight with deep dramatic shadows                      │',
    '│  • high contrast chiaroscuro lighting (extreme light vs dark)          │',
    '│  • single overhead spotlight creating interrogation atmosphere         │',
    '│  • dim green phosphorescent glow from unknown source                   │',
    '│                                                                         │',
    '│ ĐÔ THỊ/HIỆN ĐẠI:                                                        │',
    '│  • neon city lights reflecting on wet rainy pavement                   │',
    '│  • warm indoor amber light contrasting with cool blue night outside    │',
    '│  • bokeh city lights creating romantic blur effect                     │',
    '└─────────────────────────────────────────────────────────────────────────┘',
    '',
    'CÔNG THỨC ÁNH SÁNG 4 BƯỚC (BẮT BUỘC):',
    '  B1: NGUỒN     → golden afternoon sunlight / cold moonlight / magical blue glow',
    '  B2: HƯỚNG     → from behind and above / from right side / from below',
    '  B3: HIỆU ỨNG  → creating rim light halo / piercing through mist / with god rays',
    '  B4: MÀU+MOOD  → warm amber tones / cool blue atmosphere / vivid clean colors',
    '',
    'VÍ DỤ ÁNH SÁNG HOÀN CHỈNH (40 từ):',
    '  "soft ethereal volumetric mist rolling through entire scene like silk,',
    '  dramatic painted lighting with radiant golden dawn sunbeams breaking',
    '  majestically through clouds from behind and above, creating stunning',
    '  divine rim light halo around entire figure, cool soft blue ambient light',
    '  from clouds mixing beautifully with warm golden highlights on hair and',
    '  robe edges, magical color temperature contrast, bright clean tones,',
    '  vivid watercolor colors, ultra sharp"',
    '',
    SEP80,
    'PHẦN 3 — VÍ DỤ MẪU NÂNG CAO (150-200 TỪ)',
    SEP80,
    '',
    SEP50,
    'VÍ DỤ 1: KIẾM HIỆP CHIẾN ĐẤU — 185 từ',
    SEP50,
    '',
    '[IMAGE PROMPT: [MODEL:gpt-image-2] A young male warrior frozen in explosive',
    'mid-combat dynamic stance, right arm completing powerful horizontal sword slash',
    'with visible crescent-shaped cyan qi energy blade erupting from gleaming',
    'silver longsword, left arm extended back for perfect balance, body twisted',
    'in coiled spring combat form generating visible kinetic force,',
    'medium-length jet-black hair tied with torn white silk ribbon whipping',
    'violently in self-generated wind pressure, loose strands covering half face,',
    'sharp determined dark brown eyes blazing with absolute battle fury,',
    'furrowed brow and clenched jaw revealing warrior resolve, lean muscular',
    'athletic warrior build, traditional white flowing hanfu with intricate blue',
    'geometric embroidery torn at right sleeve, fabric billowing from energy',
    'shockwave, debris explosion radiating outward with stone fragments mid-air,',
    'ground cracking violently beneath feet, dust clouds erupting upward,',
    'ancient crumbling stone ruins battlefield with broken marble pillars,',
    'explosive high-stakes battle atmosphere capturing adrenaline-fueled climax,',
    'intense dramatic lighting with golden late-afternoon sunlight cutting sharply',
    'through dust clouds from right side creating harsh rim light along figure edge,',
    'warm amber highlights contrasting dramatically with cool blue shadow side,',
    'bright clean tones, vivid colors, ultra sharp, extreme low angle camera',
    'looking up at 30-degree hero angle, diagonal dynamic composition,',
    'subject dominant in left-third frame, shallow depth of field,',
    'motion blur speed streaks on sword trajectory,',
    'Chinese wuxia manhua digital art style, dynamic action illustration,',
    'bold ink-wash brush accents, masterpiece, best quality, ultra-detailed,',
    '8K resolution, horizontal landscape orientation, 16:9 aspect ratio,',
    'NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
    'NO Japanese characters, NO Korean characters, NO subtitles,',
    'NO UI elements, NO logo, NO signature, pure illustration only]',
    '[NEGATIVE: lowres, bad anatomy, bad hands, text, error, missing fingers,',
    'worst quality, low quality, jpeg artifacts, watermark, blurry, ugly,',
    'deformed face, extra limbs, dark muddy background, static boring pose]',
    '',
    SEP50,
    'VÍ DỤ 2: TIÊN HIỆP TU LUYỆN — 195 từ',
    SEP50,
    '',
    '[IMAGE PROMPT: [MODEL:imagen3] A celestial female cultivator sitting gracefully',
    'in perfect cross-legged lotus meditation on a massive floating jade-green platform',
    'suspended impossibly high above endless sea of fluffy white clouds, both delicate',
    'hands gracefully forming intricate ethereal lotus seal mudra at chest level,',
    'eyes gently closed in deep spiritual trance showing complete inner peace,',
    'serene expression with slight blissful smile, long flowing silver-white hair',
    'cascading down back like luminous waterfall, elaborate high bun secured by',
    'ornate golden phoenix-shaped hairpins inlaid with jade, delicate oval face',
    'with flawless porcelain skin, slender graceful immortal physique, wearing',
    'pristine white translucent cultivation robes with intricate silver crane',
    'embroidery along flowing wide sleeves, silk fabric rippling in spiritual breeze,',
    'surrounded by dozens of swirling cyan spiritual energy ribbons spiraling upward',
    'from glowing blue-white spirit stones in perfect ritual circle, endless ocean',
    'of fluffy white clouds stretching infinitely to horizon, distant floating',
    'mountain peaks as dark silhouettes through morning mist,',
    'transcendent peaceful cultivation atmosphere radiating divine serenity,',
    'soft ethereal volumetric mist rolling through scene like silk,',
    'radiant golden dawn sunbeams piercing majestically through clouds from above',
    'creating divine rim light halo around entire figure, cool soft blue ambient',
    'mixing beautifully with warm golden highlights, magical color temperature contrast,',
    'bright clean tones, vivid watercolor colors, ultra sharp,',
    'epic wide shot from slightly below eye level looking up reverently,',
    'subject centered, deep depth of field capturing vast infinite heavenly scale,',
    'thousands of tiny glowing cyan spirit particles floating like fireflies,',
    'Chinese xianxia illustration style, soft delicate brushwork, hand-painted',
    'watercolor details, luminous ethereal glow effects, masterpiece, best quality,',
    'ultra-detailed, 8K resolution, horizontal landscape orientation, 16:9 aspect ratio,',
    'NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
    'NO Japanese characters, NO Korean characters, NO subtitles,',
    'NO UI elements, NO logo, NO signature, pure illustration only]',
    '[NEGATIVE: lowres, bad anatomy, text, watermark, worst quality, low quality,',
    'blurry, deformed face, dark muddy background, dull colors, flat lighting]',
    '',
    SEP50,
    'VÍ DỤ 3: KINH DỊ MA QUỶ — 170 từ',
    SEP50,
    '',
    '[IMAGE PROMPT: [MODEL:gpt-image-2] An abandoned three-story Victorian mansion',
    'standing ominously at dead-end road surrounded by rusted iron fence with broken',
    'gates, decaying grey wooden exterior with peeling paint and cracked windows,',
    'all windows pitch black except one on third floor glowing with sickly pale',
    'green phosphorescent light, bare twisted dead trees surrounding property like',
    'skeletal hands, thick supernatural fog crawling slowly along ground obscuring',
    'lower half of building, small silhouette of young child standing completely',
    'motionless at rusted gate staring directly at viewer with unnatural stillness,',
    'suffocating dread atmosphere heavy with malevolent presence,',
    'cold blue-green moonlight filtering weakly through fog creating long ominous shadows,',
    'volumetric mist illuminated by eerie green window glow,',
    'high contrast chiaroscuro lighting with deep dramatic shadows,',
    'cold desaturated color palette with green and blue tones,',
    'wide establishing shot with low horizon line, symmetrical composition centering mansion,',
    'deep depth of field keeping everything sharp and threatening,',
    'dark gothic horror illustration style, painterly brush texture,',
    'masterpiece, best quality, ultra-detailed, 8K resolution,',
    'horizontal landscape orientation, 16:9 aspect ratio,',
    'NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
    'NO Japanese characters, NO Korean characters, NO subtitles,',
    'NO UI elements, NO logo, NO signature, pure illustration only]',
    '[NEGATIVE: lowres, bad anatomy, text, watermark, worst quality, low quality,',
    'blurry, daylight, bright cheerful colors, happy atmosphere]',
    '',
    SEP50,
    'VÍ DỤ 4: LÃNG MẠN HIỆN ĐẠI — 160 từ',
    SEP50,
    '',
    '[IMAGE PROMPT: [MODEL:imagen3] A beautiful young woman in early twenties sitting',
    'alone gracefully at cozy wooden cafe table next to large rain-streaked window',
    'at night, chin resting delicately on her right hand with elbow on table,',
    'gazing melancholically through rain-covered glass at glowing city lights with',
    'distant wistful expression, long straight dark brown hair falling gently over',
    'shoulders, big expressive sad brown eyes reflecting window lights showing inner',
    'emotional turmoil, delicate features with slight frown, slender graceful build,',
    'wearing oversized cream-colored knit sweater with rolled-up sleeves,',
    'warm amber cafe interior with soft bokeh background from hanging Edison bulbs,',
    'outside window showing blurred colorful city lights and neon signs through rain,',
    'nostalgic bittersweet longing atmosphere heavy with unspoken emotion,',
    'soft warm indoor lighting from overhead pendant lamp creating gentle glow on face,',
    'cool blue night light from window contrasting beautifully with warm interior,',
    'raindrops on glass catching and refracting lights,',
    'medium close-up shot from slightly right side, shallow depth of field,',
    'subject off-center following rule of thirds,',
    'modern Korean webtoon art style, soft delicate brushwork, romantic pastel colors,',
    'masterpiece, best quality, ultra-detailed, 8K resolution, 16:9 aspect ratio,',
    'NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
    'NO Japanese characters, NO Korean characters, NO subtitles,',
    'NO UI elements, NO logo, NO signature, pure illustration only]',
    '[NEGATIVE: lowres, bad anatomy, text, watermark, worst quality, low quality,',
    'blurry, ugly, deformed face, multiple people, bright daylight]',
    '',
    SEP80,
    'PHẦN 4 — HƯỚNG DẪN THEO 12 THỂ LOẠI TRUYỆN',
    SEP80,
    '',
    SEP50,
    'A. KIẾM HIỆP / VÕ HIỆP (Wuxia)',
    SEP50,
    'Nhận biết: giang hồ, võ lâm, môn phái, kiếm pháp, nội công, đại hiệp, sư phụ',
    'Model: [MODEL:gpt-image-2] cho chiến đấu — [MODEL:imagen3] cho phong cảnh/cảm xúc',
    '',
    'Art style: Chinese wuxia manhua digital art style, dynamic action illustration,',
    '          bold ink-wash brush accents, kinetic energy lines',
    'Màu sắc: đỏ thẫm, vàng đồng, xanh ngọc, trắng, đen — bright clean tones',
    'Trang phục: hanfu, áo bào, áo vải thô, giáp trụ, đai lưng, kiếm đeo hông',
    'Bối cảnh: núi non hiểm trở, thác nước, trúc lâm, quán rượu cổ, đấu trường',
    'Đặc biệt: visible qi energy aura glow, sword energy slash trails,',
    '          robes flowing dramatically in wind, motion blur on weapons',
    '',
    'Ánh sáng PHONG CẢNH:',
    '  "soft ethereal mist rolling through bamboo forest, warm golden hour sunlight',
    '  filtering through leaves, delicate rim light on character, cool blue shadows"',
    '',
    'Ánh sáng CHIẾN ĐẤU:',
    '  "volumetric dust illuminated by dramatic backlight, golden afternoon sunlight',
    '  cutting sharply through debris, harsh rim light on figure, warm amber vs cool blue"',
    '',
    SEP50,
    'B. TIÊN HIỆP / TU TIÊN (Xianxia / Cultivation)',
    SEP50,
    'Nhận biết: tu luyện, linh khí, đột phá cảnh giới, tiên giới, linh đan, tông môn',
    'Model: [MODEL:imagen3] cho tất cả cảnh tiên hiệp',
    '',
    'Art style: Chinese xianxia illustration style, soft delicate brushwork,',
    '          hand-painted watercolor details, luminous ethereal glow effects',
    'Màu sắc: xanh lam thiên thanh, vàng kim, trắng tinh khiết, tím huyền bí',
    'Trang phục: tiên y mỏng manh, đạo bào, áo trắng thêu hạc, mão quan, phù lục',
    'Bối cảnh: tiên cảnh mây trắng, đảo nổi trên không, đại điện, linh tuyền',
    'Đặc biệt: swirling spiritual energy ribbons, glowing spirit stones,',
    '          floating meditation platforms, tiny glowing particles everywhere',
    '',
    'Ánh sáng (BẮT BUỘC 40 từ):',
    '  "soft ethereal volumetric mist rolling through scene, dramatic painted lighting',
    '  with radiant golden dawn sunbeams breaking majestically through clouds from',
    '  behind and above, creating divine rim light halo around figure, cool soft',
    '  blue ambient light mixing beautifully with warm golden highlights, magical',
    '  color temperature contrast, bright clean tones, vivid watercolor colors"',
    '',
    SEP50,
    'C. HỆ THỐNG / ISEKAI / NHẬP VÀO TRUYỆN',
    SEP50,
    'Nhận biết: hệ thống, level up, nhiệm vụ, rương thưởng, dị giới, dungeon',
    'Model: [MODEL:imagen3] isekai fantasy — [MODEL:gpt-image-2] isekai action',
    '',
    'Art style: Japanese light novel illustration style, vibrant colors,',
    '          clean anime linework, fantasy RPG aesthetic',
    'Màu sắc: xanh điện holographic, vàng hệ thống, tím huyền, ánh sáng trắng xanh',
    'Trang phục: đồng phục học sinh hoặc áo giáp fantasy, áo choàng phiêu lưu',
    'Bối cảnh: dungeon tối tăm, vùng hoang dã fantasy, hầm ngục boss',
    'Đặc biệt: glowing holographic UI panels (NO actual text/numbers),',
    '          skill activation glow, summoning magic circles, level-up aura',
    '',
    'Ánh sáng:',
    '  "magical holographic blue-green glow from status window illuminating face,',
    '  dramatic dungeon lighting with torch firelight casting dancing shadows,',
    '  mystical particle effects glowing in darkness, high contrast lighting"',
    '',
    SEP50,
    'D. LÃNG MẠN / NGÔN TÌNH HIỆN ĐẠI',
    SEP50,
    'Nhận biết: CEO, tình yêu, hôn nhân, tình tam giác, ký ức, gặp lại người xưa',
    'Model: [MODEL:imagen3] cho tất cả cảnh lãng mạn hiện đại',
    '',
    'Art style: modern Korean webtoon art style, soft pastel colors,',
    '          delicate brushwork, romantic lighting, luminous skin rendering',
    'Màu sắc: pastel ấm (hồng, be, vàng nhạt, lavender), bokeh lấp lánh',
    'Trang phục: thời trang đô thị hiện đại, vest nam lịch lãm, váy nữ thanh lịch',
    'Bối cảnh: café ấm cúng, văn phòng cao tầng, công viên mùa anh đào, ban công',
    'Đặc biệt: sakura petals floating, bokeh city lights, rain droplets on glass,',
    '          soft lens flare romantic effect',
    '',
    'Ánh sáng:',
    '  "soft warm indoor lighting from overhead pendant lamp creating gentle glow,',
    '  cool blue night light from window contrasting with warm amber interior,',
    '  raindrops catching lights, dreamy bokeh effect"',
    '',
    SEP50,
    'E. CỔ ĐẠI / LỊCH SỬ / CUNG ĐẤU',
    SEP50,
    'Nhận biết: hoàng cung, hậu cung, phi tần, thái tử, âm mưu, tranh sủng',
    'Model: [MODEL:imagen3] hậu cung/cảm xúc — [MODEL:gpt-image-2] chiến trường',
    '',
    'Art style: Chinese ancient court painting style, delicate brushwork,',
    '          elegant composition, historical accuracy, rich detail',
    'Màu sắc: đỏ cung đình, vàng hoàng gia, xanh ngọc bích, tím cao quý',
    'Trang phục: phụng bào, long bào, trâm cài tóc phức tạp, kiềng ngọc',
    'Bối cảnh: hậu cung lộng lẫy, thái hòa điện, vườn ngự, hành lang cột đỏ',
    'Đặc biệt: candle flame glow, incense smoke rising, peony petals falling',
    '',
    'Ánh sáng:',
    '  "warm golden candlelight from ornate bronze lamp holders casting soft',
    '  flickering shadows on silk curtains, gentle rim light from moonlight,',
    '  intimate palace atmosphere, warm amber tones"',
    '',
    SEP50,
    'F. KINH DỊ / LIÊU TRAI / MA QUỶ',
    SEP50,
    'Nhận biết: hồn ma, ám ảnh, ngôi nhà bỏ hoang, bóng tối, thực thể không tên',
    'Model: [MODEL:gpt-image-2] cho tất cả cảnh kinh dị',
    '',
    'Art style: dark gothic horror illustration style, high contrast chiaroscuro,',
    '          painterly texture, dramatic shadows, supernatural atmosphere',
    'Màu sắc: xám tro, xanh lạnh, đỏ máu, trắng xương — KHÔNG pitch black hoàn toàn',
    'Trang phục: quần áo cũ rách, váy trắng ma nữ, đồ tang, áo mưa ướt',
    'Bối cảnh: nhà hoang Victorian, nghĩa địa sương mù, hành lang bệnh viện',
    'Đặc biệt: shadow entity distorted form, pale green phosphorescent glow,',
    '          supernatural fog crawling on ground, mirror showing wrong reflection',
    '',
    'Ánh sáng:',
    '  "cold blue-green moonlight filtering weakly through fog, single window',
    '  glowing with sickly pale green light, high contrast chiaroscuro,',
    '  deep dramatic shadows, minimal lighting creating maximum dread"',
    '',
    SEP50,
    'G. HÀNH ĐỘNG / CHIẾN TRANH / QUÂN SỰ',
    SEP50,
    'Nhận biết: chiến trận, binh lính, vũ khí, chỉ huy, chiến lược, hy sinh',
    'Model: [MODEL:gpt-image-2] cho tất cả cảnh chiến tranh',
    '',
    'Art style: hyper-realistic digital painting, dramatic cinematic lighting,',
    '          photorealistic details, epic scale, war documentary aesthetic',
    'Màu sắc: xám thép, nâu đất, đỏ máu, khói đen, sáng sớm lạnh lẽo',
    'Trang phục: áo giáp kim loại/quân phục, mũ giáp, vũ khí hiện đại/cổ',
    'Bối cảnh: chiến trường tan hoang, pháo đài bị vây, biển người xung trận',
    'Đặc biệt: explosion debris mid-air, motion blur on charging soldiers,',
    '          god-ray sunlight piercing smoke, battlefield carnage',
    '',
    'Ánh sáng:',
    '  "volumetric smoke and dust illuminated by dramatic backlight, intense orange',
    '  explosion light mixing with cold morning blue atmosphere, god rays cutting',
    '  through smoke, high contrast battle lighting"',
    '',
    SEP50,
    'H. TRINH THÁM / TỘI PHẠM / GIẬT GÂN',
    SEP50,
    'Nhận biết: thám tử, vụ án, manh mối, nghi phạm, điều tra, bí ẩn, lật mặt',
    'Model: [MODEL:gpt-image-2] cho tất cả cảnh trinh thám',
    '',
    'Art style: noir detective graphic novel style, dramatic shadows,',
    '          high contrast film noir, sharp angular composition',
    'Màu sắc: đen trắng với điểm nhấn đỏ/vàng, ánh đèn đường ướt mưa',
    'Trang phục: áo dạ dài cổ điển, áo vest thám tử, đồng phục cảnh sát',
    'Bối cảnh: phòng thẩm vấn đèn đơn, hiện trường vụ án, phố đêm mưa',
    'Đặc biệt: single interrogation light deep face shadows, neon on wet pavement',
    '',
    'Ánh sáng:',
    '  "single harsh overhead spotlight creating deep dramatic face shadows,',
    '  cold blue-white fluorescent interrogation lighting, high contrast',
    '  chiaroscuro with half face in complete darkness"',
    '',
    SEP50,
    'I. KHOA HỌC VIỄN TƯỞNG / SCI-FI / CYBERPUNK',
    SEP50,
    'Nhận biết: tương lai, robot, AI, tàu vũ trụ, du hành thời gian, ngoài hành tinh',
    'Model: [MODEL:imagen3] sci-fi sáng — [MODEL:gpt-image-2] cyberpunk tối',
    '',
    'Art style: futuristic sci-fi concept art, neon cyberpunk aesthetic',
    '          or clean hard sci-fi cinematic rendering',
    'Màu sắc: neon xanh/tím/hồng (cyberpunk) hoặc trắng bạc lạnh (hard sci-fi)',
    'Trang phục: exo-suit, bộ đồ chiến đấu tương lai, áo lab, kính AR',
    'Bối cảnh: thành phố tương lai, trạm vũ trụ, hành lang tàu không gian',
    'Đặc biệt: holographic panels (NO text), particle engine trails,',
    '          neon reflecting on wet surfaces, nebula background',
    '',
    'Ánh sáng CYBERPUNK:',
    '  "vibrant neon lights in cyan, magenta, yellow reflecting on wet streets,',
    '  harsh artificial lighting from holographic billboards, colorful glow vs dark shadows"',
    '',
    'Ánh sáng HARD SCI-FI:',
    '  "cold sterile white-blue LED lighting from overhead panels, clean clinical',
    '  atmosphere, minimal shadows, futuristic aesthetic"',
    '',
    SEP50,
    'J. GIA ĐÌNH / ĐỜI THƯỜNG / SLICE OF LIFE',
    SEP50,
    'Nhận biết: gia đình, cuộc sống thường ngày, nấu ăn, học đường, tình cảm bình dị',
    'Model: [MODEL:imagen3] cho tất cả cảnh đời thường',
    '',
    'Art style: warm slice-of-life anime illustration, soft lighting,',
    '          cozy natural colors, peaceful atmosphere',
    'Màu sắc: ấm áp (vàng nắng, cam, nâu gỗ, xanh trời nhạt)',
    'Trang phục: quần áo thường ngày, tạp dề nấu ăn, đồng phục học sinh',
    'Bối cảnh: căn bếp ấm cúng, phòng khách, trường học, làng quê',
    'Đặc biệt: golden hour sunlight through curtains, steam from hot food,',
    '          dust particles in sunbeam, cozy domestic details',
    '',
    'Ánh sáng:',
    '  "warm golden hour sunlight streaming through window creating long soft shadows,',
    '  dust particles floating in sunbeam, gentle natural lighting, cozy warm atmosphere"',
    '',
    SEP50,
    'K. MA HỌC / PHÉP THUẬT / DARK FANTASY',
    SEP50,
    'Nhận biết: pháp sư, ma thuật, nghi lễ, lời nguyền, tháp pháp sư, bóng tối',
    'Model: [MODEL:gpt-image-2] dark magic — [MODEL:imagen3] light magic',
    '',
    'Art style: dark fantasy digital art, dramatic magical lighting,',
    '          painterly effects, mystical atmosphere',
    'Màu sắc: đen tím thẫm, xanh đêm, ánh sáng ma thuật tương phản mạnh',
    'Trang phục: áo choàng với rune, mũ phù thủy, enchanted armor',
    'Bối cảnh: tháp ma thuật, nghi trận summoning, rừng chết, lâu đài',
    'Đặc biệt: glowing ritual circle, dark shadow tendrils, spell light burst,',
    '          mystical runes floating, magical particles',
    '',
    'Ánh sáng DARK MAGIC:',
    '  "glowing purple-black energy illuminating ritual circle from below,',
    '  harsh upward lighting creating ominous shadows, dark tendrils swirling"',
    '',
    'Ánh sáng LIGHT MAGIC:',
    '  "radiant white-gold divine magic glow, soft ethereal holy light particles floating"',
    '',
    SEP50,
    'L. ZOMBIE / TẬN THẾ / POST-APOCALYPTIC',
    SEP50,
    'Nhận biết: zombie, tận thế, sống sót, nhóm sinh tồn, thế giới hoang tàn, bunker',
    'Model: [MODEL:gpt-image-2] cho tất cả cảnh tận thế',
    '',
    'Art style: post-apocalyptic survival art, gritty realism,',
    '          desaturated palette, harsh environmental storytelling',
    'Màu sắc: xám hoang tàn, nâu bụi đất, đỏ rỉ sét, xanh lạnh',
    'Trang phục: quần áo rách nát tự vá, giáp tự chế từ phế liệu, balo sinh tồn',
    'Bối cảnh: thành phố đổ nát cây leo, siêu thị bỏ hoang, đường cao tốc xe bỏ',
    'Đặc biệt: overgrown vines on buildings, ash falling like snow,',
    '          broken glass everywhere, distant fires, abandoned vehicles',
    '',
    'Ánh sáng:',
    '  "harsh cold overcast daylight through ash-filled atmosphere,',
    '  desaturated apocalyptic lighting, dust and ash particles suspended in air,',
    '  gritty survival atmosphere with minimal warm tones"',
    '',
    SEP80,
    'PHẦN 5 — QUY TẮC NHÂN VẬT NHẤT QUÁN (CHARACTER CONSISTENCY)',
    SEP80,
    '',
    'NGUYÊN TẮC BẮT BUỘC: Mỗi nhân vật PHẢI được mô tả GIỐNG HỆT trong TOÀN BỘ file.',
    '',
    '7 ĐIỂM GIỮ NHẤT QUÁN TUYỆT ĐỐI (40-50 từ mỗi lần xuất hiện):',
    '  (1) Giới tính + tuổi ngoại hình  (2) Màu tóc + kiểu tóc + phụ kiện',
    '  (3) Màu mắt + biểu cảm           (4) Đặc điểm nhận diện (scar, beauty mark)',
    '  (5) Trang phục màu + chi tiết    (6) Vũ khí / đạo cụ cố định',
    '  (7) Vóc dáng',
    '',
    'QUY TRÌNH 4 BƯỚC BẮT BUỘC:',
    '  B1: Đọc lướt toàn bộ file TXT — liệt kê TẤT CẢ nhân vật xuất hiện',
    '  B2: Xây dựng CHARACTER SHEET chi tiết cho từng nhân vật',
    '  B3: Lần đầu xuất hiện → mô tả ĐẦY ĐỦ NHẤT cả 7 điểm (40-50 từ)',
    '  B4: Lần sau → COPY y chang 7 điểm, CHỈ đổi action/pose/facial expression',
    '',
    '★ TUYỆT ĐỐI KHÔNG đổi màu tóc, màu mắt, màu trang phục giữa các scene ★',
    '',
    SEP80,
    'PHẦN 6 — QUY TẮC CỨNG TUYỆT ĐỐI (HARD RULES)',
    SEP80,
    '',
    '━━ RULE 1: KHÔNG CÓ CHỮ TRÊN ẢNH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Mọi prompt PHẢI kết thúc:',
    '  NO text, NO watermark, NO letters, NO words, NO numbers,',
    '  NO dialogue bubbles, NO subtitles, NO Chinese characters,',
    '  NO Japanese characters, NO Korean characters,',
    '  NO UI elements, NO logo, NO signature, pure illustration only',
    '',
    '━━ RULE 2: TỶ LỆ 16:9 VÀ QUALITY TAGS BẮT BUỘC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Luôn thêm: masterpiece, best quality, ultra-detailed, 8K resolution,',
    '           horizontal landscape orientation, 16:9 aspect ratio',
    '',
    '━━ RULE 3: NEGATIVE PROMPT (cho pipeline có hỗ trợ) ━━━━━━━━━━━━━━━━━━━━━━━━',
    '  [NEGATIVE: lowres, bad anatomy, bad hands, text, error, missing fingers,',
    '  worst quality, low quality, jpeg artifacts, watermark, blurry, ugly,',
    '  deformed face, extra limbs, bad proportions, dark muddy background]',
    '',
    '━━ RULE 4: MÀU SẮC BẮT BUỘC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'LUÔN THÊM: bright clean tones, vivid colors, ultra sharp',
    'CHỈ TRỪ: cảnh kinh dị/zombie dùng "desaturated colors, cold tones"',
    '',
    '━━ RULE 5: ĐỘ DÀI PROMPT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Tối thiểu 120 từ — lý tưởng 150-200 từ — toàn bộ tiếng Anh',
    '  • Subject + Action : 30-40 từ',
    '  • Appearance       : 40-50 từ (7 điểm)',
    '  • Setting          : 25-35 từ',
    '  • Lighting ★★★     : 30-45 từ (QUAN TRỌNG NHẤT)',
    '  • Composition      : 15-20 từ',
    '  • Style + Quality  : 25-35 từ',
    '',
    '━━ RULE 6: ÁNH SÁNG PHẢI CỤ THỂ 30-45 TỪ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '❌ SAI: "good lighting, bright"',
    '✅ ĐÚNG: "soft ethereal volumetric mist rolling through scene, dramatic painted',
    'lighting with radiant golden dawn sunbeams breaking through clouds from above,',
    'creating divine rim light halo, cool blue ambient mixing with warm golden highlights"',
    '',
    SEP80,
    'PHẦN 7 — TEMPLATE PROMPT ĐỂ COPY',
    SEP80,
    '',
    '  [IMAGE PROMPT: [MODEL:imagen3 hoặc gpt-image-2]',
    '  [SUBJECT 30-40 từ: nhân vật/cảnh quan + hành động cụ thể],',
    '  [APPEARANCE 40-50 từ: tóc, mắt, biểu cảm, vóc dáng, trang phục, vũ khí, đặc điểm],',
    '  [SETTING 25-35 từ: địa điểm, kiến trúc, thời gian, thời tiết, môi trường],',
    '  [ATMOSPHERE 10-15 từ: không khí và cảm xúc tổng thể],',
    '  [LIGHTING 30-45 từ ★★★: nguồn + hướng + hiệu ứng + màu + bright clean tones],',
    '  [COMPOSITION 15-20 từ: góc máy + framing + depth of field],',
    '  [PARTICLE FX 10-15 từ: hiệu ứng hạt nếu có],',
    '  [ART STYLE + masterpiece, best quality, ultra-detailed, 8K, 16:9],',
    '  NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
    '  NO Japanese characters, NO Korean characters, NO subtitles,',
    '  NO UI elements, NO logo, NO signature, pure illustration only]',
    '  [NEGATIVE: lowres, bad anatomy, bad hands, text, error, missing fingers,',
    '  worst quality, low quality, jpeg artifacts, watermark, blurry, ugly,',
    '  deformed face, extra limbs, dark muddy background]',
    '  [FILE: scene_xxxxx.xxxs.jpg]',
    '',
    SEP80,
    'PHẦN 8 — WORKFLOW THEO TỪNG NỀN TẢNG',
    SEP80,
    '',
    '━━ WORKFLOW A: GENSPARK AI AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'B1: Thay TẤT CẢ model tag → [MODEL:gpt-image-2]',
    'B2: Mở Genspark AI Agent (genspark.ai/agents) — đăng nhập tài khoản Plus',
    'B3: Paste lệnh này vào ĐẦU TIÊN:',
    '    -------------------------------------------------------',
    '    Read this TXT file carefully.',
    '    For each [IMAGE PROMPT] block, generate an image using GPT Image 2,',
    '    then save it to AI Drive with the EXACT filename from [FILE:] tag.',
    '    Do NOT use Export button — save directly to Drive.',
    '    Process all scenes in order. Confirm each save before next scene.',
    '    Ignore all [NEGATIVE: ...] lines.',
    '    -------------------------------------------------------',
    'B4: Paste toàn bộ nội dung file TXT ngay sau lệnh trên',
    'B5: Chờ Agent tạo và lưu ảnh vào Drive (tự động)',
    'B6: Vào AI Drive → chọn tất cả ảnh → Download → giải nén',
    '',
    '━━ WORKFLOW B: GEMINI (Imagen 3) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'B1: Thay TẤT CẢ model tag → [MODEL:imagen3]',
    'B2: Mở Gemini Advanced (Google One AI Premium)',
    'B3: Paste từng block [IMAGE PROMPT] — đặt tên theo [FILE:]',
    'B4: Download và đổi tên thủ công theo [FILE:] tag',
    '',
    '━━ WORKFLOW C: CHATGPT (GPT Image) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'B1: Thay TẤT CẢ model tag → [MODEL:gpt-image-2]',
    'B2: Paste file TXT + yêu cầu generate + đặt tên theo [FILE:]',
    'B3: Download ảnh, đổi tên đúng theo [FILE:] tag nếu cần',
    '',
    SEP80,
    'PHẦN 9 — CHECKLIST TRƯỚC KHI GỬI',
    SEP80,
    '',
    '☑ Mỗi prompt có đủ 150-200 từ?',
    '☑ Đã đọc [Giọng Nam]/[Giọng Nữ] để hiểu ngữ cảnh trước khi viết?',
    '☑ Ánh sáng được mô tả CỤ THỂ 30-45 từ (nguồn + hướng + hiệu ứng + màu)?',
    '☑ Nhân vật được mô tả ĐẦY ĐỦ 7 điểm (40-50 từ)?',
    '☑ Nhân vật NHẤT QUÁN xuyên suốt file (copy y chang 7 điểm)?',
    '☑ Có "bright clean tones, vivid colors, ultra sharp"?',
    '☑ Có góc máy CỤ THỂ (wide/close-up/low angle)?',
    '☑ Có depth of field (deep/shallow)?',
    '☑ Có kết thúc "NO text, NO watermark..." đầy đủ?',
    '☑ Có "16:9 aspect ratio"?',
    '☑ Dòng [FILE: ...] GIỮ NGUYÊN không sửa?',
    '',
    SEP80,
    'TÓM TẮT NHANH — 5 ĐIỂM QUAN TRỌNG NHẤT',
    SEP80,
    '',
    '1. ĐỘ DÀI: 150-200 từ mỗi prompt (KHÔNG được ngắn hơn 120 từ)',
    '2. ÁNH SÁNG: 30-45 từ riêng — nguồn + hướng + hiệu ứng + màu',
    '3. NHÂN VẬT: 40-50 từ đủ 7 điểm — NHẤT QUÁN tuyệt đối xuyên suốt',
    '4. COMPOSITION: góc máy CỤ THỂ + framing + depth of field',
    '5. QUALITY: bright clean tones + vivid colors + NO text đầy đủ + 16:9',
    '',
    SEP80,
    'BẮT ĐẦU XỬ LÝ — ĐỌC TOÀN BỘ FILE, XÂY CHARACTER SHEET, VIẾT PROMPT 150-200 TỪ',
    SEP80,
    ''
];

// ══════════════════════════════════════════════════════════════════════════
// HÀM HELPER
// ══════════════════════════════════════════════════════════════════════════
function isSkipBlock(text) {
    if (!text) return false;
    var t = text.toLowerCase();
    return t.indexOf('chào mừng các bạn đã đến với kênh') >= 0 ||
           t.indexOf('đến đây là kết thúc chương') >= 0;
}

function isNarratorVoice(v) {
    return (v || '').toLowerCase().indexOf('dẫn truyện') >= 0;
}

function isDialogueVoice(v) {
    var lv = (v || '').toLowerCase();
    return lv === 'giọng nam' || lv === 'giọng nữ';
}

function makeFileName(startTime) {
    var ts    = startTime.toFixed(3);
    var parts = ts.split('.');
    return 'scene_' + parts[0].padStart(5, '0') + '.' + (parts[1] || '000') + 's.jpg';
}

// ══════════════════════════════════════════════════════════════════════════
// SMART SCENE GROUPING — 30s mềm, 60s cứng, không cắt giữa câu
// GIỮ NGUYÊN THỨ TỰ: dẫn truyện xen kẽ lời thoại như câu chuyện thật
// ══════════════════════════════════════════════════════════════════════════
var SOFT_LIMIT = 20;
var HARD_LIMIT = 40;

var scenes       = [];
var currentScene = null;

function flushScene() {
    // Chỉ lưu scene nếu có ít nhất 1 dòng dẫn truyện thật sự
    if (currentScene && currentScene.hasNarrator) {
        scenes.push(currentScene);
    }
    currentScene = null;
}

function newScene(entry) {
    return {
        startTime    : entry.startTime,
        endTime      : entry.startTime + entry.duration,
        totalDuration: entry.duration,
        hasNarrator  : true,
        // ✅ 1 mảng duy nhất — giữ nguyên thứ tự xuất hiện
        lines        : [ '[Dẫn Truyện]: ' + entry.text ]
    };
}

for (let i = 0; i < timestampLog.length; i++) {
    let entry = timestampLog[i];

    // ── Giọng Nam / Giọng Nữ ──
    if (isDialogueVoice(entry.voice)) {
        if (currentScene) {
            // ✅ Đẩy vào đúng vị trí trong lines — giữ thứ tự tự nhiên
            currentScene.lines.push('[' + entry.voice + ']: ' + entry.text);
            currentScene.endTime       = entry.startTime + entry.duration;
            currentScene.totalDuration = currentScene.endTime - currentScene.startTime;
        }
        // Nếu không có scene hiện tại thì bỏ qua — thoại không có dẫn truyện đi kèm
        continue;
    }

    // ── Không phải Dẫn Truyện → bỏ qua ──
    if (!isNarratorVoice(entry.voice)) continue;

    // ── Block SKIP ──
    if (isSkipBlock(entry.text)) {
        flushScene();
        continue;
    }

    // ── Dẫn Truyện bình thường ──
    if (!currentScene) {
        currentScene = newScene(entry);
    } else {
        if (currentScene.totalDuration >= HARD_LIMIT) {
            // Vượt hard limit → đóng scene cũ, bắt đầu mới
            flushScene();
            currentScene = newScene(entry);
        } else if (currentScene.totalDuration >= SOFT_LIMIT) {
            // Đạt soft limit → đóng scene cũ, bắt đầu mới
            flushScene();
            currentScene = newScene(entry);
        } else {
            // Chưa đủ 30s → gom tiếp vào lines theo đúng thứ tự
            currentScene.lines.push('[Dẫn Truyện]: ' + entry.text);
            currentScene.endTime       = entry.startTime + entry.duration;
            currentScene.totalDuration = currentScene.endTime - currentScene.startTime;
        }
    }
}
flushScene();

// ══════════════════════════════════════════════════════════════════════════
// BUILD NỘI DUNG 2 FILE TXT
// ══════════════════════════════════════════════════════════════════════════
var txtColab = headerColab.slice();
var txtAI    = headerAI.slice();

for (let s = 0; s < scenes.length; s++) {
    let scene    = scenes[s];
    let fileName = makeFileName(scene.startTime);

    // ── Header của scene ──
    txtColab.push('[SCENE GROUP]');
    txtColab.push('startTime: '  + scene.startTime.toFixed(3) + 's');
    txtColab.push('→ duration: ' + scene.totalDuration.toFixed(3) + 's →');
    txtColab.push('[IMAGE PROMPT: CHƯA TẠO]');
    txtColab.push('[FILE: ' + fileName + ']');
    txtColab.push('');

    txtAI.push('[SCENE GROUP]');
    txtAI.push('startTime: '  + scene.startTime.toFixed(3) + 's');
    txtAI.push('→ duration: ' + scene.totalDuration.toFixed(3) + 's →');
    txtAI.push('[IMAGE PROMPT: CHƯA TẠO]');
    txtAI.push('[FILE: ' + fileName + ']');
    txtAI.push('');

    // ✅ Đẩy lines theo đúng thứ tự tự nhiên — dẫn truyện xen kẽ lời thoại
    for (let li = 0; li < scene.lines.length; li++) {
        txtColab.push(scene.lines[li]);
        txtAI.push(scene.lines[li]);
    }

    txtColab.push('');
    txtAI.push('');
}

// ── Footer ──
let footer = '=== TỔNG THỜI LƯỢNG: ' + runningTime.toFixed(3) + 's'
           + ' | TỔNG SCENE: ' + scenes.length + ' ảnh ===';
txtColab.push(footer);
txtAI.push(footer);

// ══════════════════════════════════════════════════════════════════════════
// DOWNLOAD 2 FILE
// ══════════════════════════════════════════════════════════════════════════
let safeId = (taskId || 'chuong').toString().replace(/[^a-zA-Z0-9_\-]/g, '_');

function downloadTxt(lines, filename) {
    let blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    let url  = URL.createObjectURL(blob);
    let a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 3000);
}

downloadTxt(txtColab, 'ImagePrompt_COLAB_' + safeId + '.txt');
setTimeout(function() {
    downloadTxt(txtAI, 'ImagePrompt_AI_' + safeId + '.txt');
    console.log('✅ Đã xuất 2 file TXT:');
    console.log('   → ImagePrompt_COLAB_' + safeId + '.txt');
    console.log('   → ImagePrompt_AI_'    + safeId + '.txt');
    console.log('   → Tổng scenes: ' + scenes.length + ' ảnh');
}, 800);
}
