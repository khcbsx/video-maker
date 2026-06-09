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
async function runScriptAutomation(rawText, taskId) {
    // THAY ĐỔI LỚN NHẤT Ở ĐÂY: Gán chết 3 Thẻ Vai Trò thay vì lấy từ Giao diện
    var voiceNarrator = 'Dẫn Truyện';
    var voiceMale     = 'Giọng Nam';
    var voiceFemale   = 'Giọng Nữ';
    
    var lines = rawText.split('\n');
    var taggedLines = [];
    var contextWindow = ''; 
    
    // Bộ đếm chữ để rải nhạc
    var wordCount = 0; 

    // AUTO BGM: Chèn nhạc dạo êm dịu ngay đầu mỗi chương
    taggedLines.push('[BGM: Nhạc Dạo]');
    taggedLines.push('');

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

        // AUTO BGM: Nếu đã đọc được khoảng 800 chữ (tương đương ~4-5 phút audio)
        // Hệ thống sẽ chèn 1 thẻ nhạc trung tính vào giữa các đoạn văn
        if (wordCount >= 800) {
            taggedLines.push(''); 
            taggedLines.push('[BGM: Nhạc Trung Tính]');
            taggedLines.push('');
            wordCount = 0; // Reset bộ đếm về 0 để đếm vòng mới
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
        
        // Vòng lặp xử lý từng chương trong mẻ
        for (var c = batch.from; c <= batch.to; c++) {
            var chapText = globalScriptChapters[c];
            var processedText = await runScriptAutomation(chapText, null);
            combinedScript += processedText + '\n\n'; 
        }

        // Tự động tải file dưới dạng .docx chuẩn
        var fileName = 'KichBan_Tu_Chuong_' + (batch.from + 1) + '_Den_' + (batch.to + 1) + '.docx';
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
                        
                        var mp3Buffer = await fetchAudioFromCloudflare(cleanText, targetProps.config, targetProps.pitch, "+0");
                        
                        if (mp3Buffer && mp3Buffer.byteLength > 100) {
                            try {
                                var audioData = mp3Buffer.slice(0); 
                                var decodedTts = await tempAudioCtx.decodeAudioData(audioData);
                                timeline.push({ buffer: decodedTts, startTime: currentTime, isBgm: false });
                                  timestampLog.push({
                                    voice: seg.voice,
                                    text: cleanText,
                                    duration: decodedTts.duration + 0.2,
                                    startTime: globalRunningTime + currentTime
                                });                              
                                currentTime += decodedTts.duration + 0.2; 
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

                var totalDuration = currentTime + 1; // Cộng dư 1 giây tránh cắt đuôi
                var sampleRate = 44100; 
                var offlineCtx = new OfflineAudioContext(1, sampleRate * totalDuration, sampleRate);

                timeline.forEach(item => {
                    var source = offlineCtx.createBufferSource();
                    source.buffer = item.buffer;

                    if (item.isBgm) {
                        var gainNode = offlineCtx.createGain();
                        gainNode.gain.value = window.globalBgmVolume || 0.15; 
                        source.connect(gainNode);
                        gainNode.connect(offlineCtx.destination);
                    } else {
                        source.connect(offlineCtx.destination);
                    }
                    source.start(item.startTime);
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
        } // Hết vòng lặp cuốn chiếu (Tất cả các khúc đã được nén)

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
// XUẤT 2 FILE TXT TIMESTAMP (POLLINATIONS + GENSPARK) BẢN PROMPT ĐẦY ĐỦ
// ==============================================================================
async function exportTimestampTxtFiles(timestampLog, runningTime, taskId) {
    if (!timestampLog || timestampLog.length === 0) {
        console.warn('⚠️ Không có dữ liệu timestampLog để xuất file.');
        return;
    }

    var SEP80 = '================================================================================';
    var SEP50 = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    var SEP40 = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    // ── HEADER POLLINATIONS (FULL) ──
    var headerPolina = [
        SEP80,
        'NHIỆM VỤ: Viết IMAGE PROMPT tiếng Anh cho từng cảnh [Dẫn Truyện] trong file TXT',
        'DÀNH CHO: Pollinations AI — model [MODEL:flux] hoặc [MODEL:flux-realism]',
        SEP80,
        '',
        'MỤC ĐÍCH:',
        '- Điền vào vị trí [IMAGE PROMPT: CHƯA TẠO] trong file TXT',
        '- Mỗi prompt dùng để tạo ảnh minh họa trên Pollinations AI',
        '- Ảnh dùng làm khung hình trong video đọc truyện YouTube/TikTok',
        '- Chỉ viết prompt cho [IMAGE PROMPT: CHƯA TẠO] — KHÔNG thay đổi nội dung nào khác',
        '',
        SEP80,
        'PHẦN 1 — CẤU TRÚC FILE TXT VÀ QUY TẮC XỬ LÝ',
        SEP80,
        '',
        'CẤU TRÚC FILE TXT CÓ DẠNG:',
        '  [Dẫn Truyện]',
        '  startTime: 0.00s',
        '  → 12.50s →',
        '  [IMAGE PROMPT: CHƯA TẠO]',
        '  [FILE: scene_00000.000s.jpg]',
        '  Văn bản tường thuật của Dẫn Truyện tại đây...',
        '',
        '  [Giọng Nam]: Lời thoại của nhân vật nam — KHÔNG có ảnh',
        '  [Giọng Nữ]: Lời thoại của nhân vật nữ — KHÔNG có ảnh',
        '',
        'QUY TẮC XỬ LÝ QUAN TRỌNG:',
        '1. CHỈ xử lý dòng [IMAGE PROMPT: CHƯA TẠO] — bỏ qua mọi dòng khác',
        '2. Đọc văn bản tường thuật ngay bên dưới [FILE: ...] để hiểu nội dung cảnh',
        '3. Đọc context các cảnh trước/sau để đảm bảo nhân vật nhất quán',
        '4. Giữ nguyên cấu trúc file — chỉ thay CHƯA TẠO bằng prompt tiếng Anh',
        '5. KHÔNG thêm dòng mới, KHÔNG xóa dòng nào',
        '6. KHÔNG đặt prompt trong dấu ngoặc kép hay markdown',
        '7. Thoại nhân vật (dòng có [Giọng Nam]:, [Giọng Nữ]:) — BỎ QUA, không tạo ảnh',
        '',
        SEP80,
        'PHẦN 2 — CẤU TRÚC CHUẨN CỦA MỘT IMAGE PROMPT HOÀN CHỈNH',
        SEP80,
        '',
        'MỖI PROMPT PHẢI CÓ ĐỦ 8 THÀNH PHẦN (viết thành 1 đoạn liền, không xuống dòng):',
        '',
        '  [1. MODEL TAG]     — Bắt buộc đầu tiên: [MODEL:flux] hoặc [MODEL:flux-realism]',
        '  [2. SUBJECT]       — Chủ thể chính: nhân vật, vật thể, hoặc cảnh quan',
        '  [3. ACTION/POSE]   — Hành động, tư thế, biểu cảm của nhân vật',
        '  [4. APPEARANCE]    — Ngoại hình: tóc, mắt, trang phục, đặc điểm nhận diện',
        '  [5. SETTING]       — Bối cảnh không gian: địa điểm, thời gian, thời tiết',
        '  [6. ATMOSPHERE]    — Không khí, cảm xúc, ánh sáng, màu sắc chủ đạo',
        '  [7. COMPOSITION]   — Góc máy, framing, tiêu điểm, bố cục',
        '  [8. ART STYLE + QUALITY TAGS] — Phong cách + tags chất lượng + NO text rules',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện kiếm hiệp):',
        '  [MODEL:flux] A young male warrior standing tall on a misty mountain cliff at dusk,',
        '  right hand gripping a slender silver longsword raised toward the sky,',
        '  medium-length black hair flowing in wind, sharp determined dark eyes,',
        '  wearing white flowing hanfu robe with blue embroidery,',
        '  surrounded by ancient pine trees, crimson sunset sky with dramatic clouds,',
        '  heroic and awe-inspiring atmosphere, warm golden-red lighting,',
        '  low-angle dramatic shot looking up, subject centered in frame,',
        '  Chinese wuxia manhua art style, ink-wash brush texture, bright clean tones,',
        '  cinematic 16:9, masterpiece, ultra-detailed, 8K resolution,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện lãng mạn hiện đại):',
        '  [MODEL:flux] A beautiful young woman sitting alone at a rainy cafe window at night,',
        '  chin resting on hand, gazing melancholically at raindrops on the glass,',
        '  long straight dark brown hair, big expressive eyes with a hint of sadness,',
        '  wearing a cream-colored oversized knit sweater,',
        '  warm amber cafe interior with bokeh city lights through the window,',
        '  nostalgic and bittersweet atmosphere, soft warm lighting with cool rain contrast,',
        '  medium close-up shot, shallow depth of field, subject slightly off-center,',
        '  modern Korean webtoon art style, soft brushwork, bright vivid colors,',
        '  cinematic 16:9, masterpiece, ultra-detailed, 8K resolution,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện tiên hiệp):',
        '  [MODEL:flux] A celestial female cultivator sitting cross-legged on a floating jade island,',
        '  in deep meditation, hands forming lotus seal mudra on her lap,',
        '  silver-white hair pinned with golden phoenix hairpins, serene closed-eye expression,',
        '  wearing layered translucent white immortal robes with crane motif embroidery,',
        '  surrounded by swirling spiritual energy clouds, glowing spirit stones nearby,',
        '  transcendent ethereal atmosphere, cool blue-white glow with golden accents,',
        '  birds eye wide shot, vast sky composition, subject small against infinite heavens,',
        '  Chinese xianxia illustration style, soft watercolor wash, luminous glow, bright clean tones,',
        '  cinematic 16:9, masterpiece, ultra-detailed, 8K resolution,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện kinh dị):',
        '  [MODEL:flux-realism] An abandoned Victorian mansion at the end of a dead road on a moonless night,',
        '  all windows dark except one glowing pale green on the third floor,',
        '  bare twisted trees surrounding the building, thick fog crawling on the ground,',
        '  a small silhouette of a child standing motionless at the gate,',
        '  suffocating dread and supernatural atmosphere, cold blue-green moonlight through fog,',
        '  wide establishing shot, low horizon line, symmetrical composition,',
        '  dark gothic horror illustration style, high contrast chiaroscuro, NOT pitch black,',
        '  cinematic 16:9, masterpiece, ultra-detailed, 8K resolution,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        SEP80,
        'PHẦN 3 — HƯỚNG DẪN THEO 9 THỂ LOẠI TRUYỆN',
        SEP80,
        '',
        SEP50,
        'A. CỔ TRANG / TIÊN HIỆP / KIẾM HIỆP / VÕ HIỆP',
        SEP50,
        'Nhận biết: môn phái, bang hội, kiếm pháp, nội công, tu luyện, linh khí, đan dược,',
        '           cảnh giới, tông môn, sư phụ, đại hiệp, giang hồ, hoàng cung, võ lâm',
        'Model: [MODEL:flux] cho phong cảnh/tu luyện — [MODEL:flux-realism] cho chiến đấu',
        'Art style: Chinese wuxia manhua art style, ink-wash brush texture, dynamic action lines',
        'Màu sắc: đỏ thẫm, vàng đồng, xanh ngọc, trắng, đen — LUÔN bright clean tones',
        'Trang phục: hanfu, áo bào, áo vải thô, giáp trụ, đai lưng, kiếm đeo hông',
        'Bối cảnh: núi non hiểm trở, thác nước, trúc lâm, quán rượu cổ, tuyết phủ',
        'Đặc biệt: aura glow (khí công), sword energy slash (kiếm khí), robes flowing in wind',
        '',
        SEP50,
        'B. HIỆN ĐẠI / ĐÔ THỊ / VĂN PHÒNG / HỌC ĐƯỜNG',
        SEP50,
        'Nhận biết: điện thoại, xe hơi, văn phòng, trường học, cà phê, CEO, mạng xã hội',
        'Model: [MODEL:flux-realism] cho nhân vật — [MODEL:flux] cho phong cảnh thành phố',
        'Art style: modern cinematic photography style, realistic lighting, contemporary fashion',
        'Màu sắc: tự nhiên sống động, neon đêm, ánh đèn đường, bokeh thành phố',
        'Trang phục: thời trang đô thị, suit văn phòng, đồng phục học sinh, casual streetwear',
        'Bối cảnh: văn phòng cao tầng, trường học, café, phố đi bộ, chung cư hiện đại',
        'Đặc biệt: city bokeh lights, rain-wet streets reflection, neon signs, glass buildings',
        '',
        SEP50,
        'C. NGÔN TÌNH / LÃNG MẠN / HỌC ĐƯỜNG',
        SEP50,
        'Nhận biết: tình yêu, hẹn hò, ghen tuông, nhớ nhung, chia tay, tái hợp, tam giác tình cảm',
        'Model: [MODEL:flux] cho mọi cảnh lãng mạn',
        'Art style: soft romantic Korean webtoon art style, warm pastel colors, clean linework',
        'Màu sắc: pastel ấm (hồng, be, vàng nhạt), bokeh lấp lánh, ánh sáng ban mai/hoàng hôn',
        'Trang phục: thời trang đô thị thanh lịch, váy nữ nhẹ nhàng, áo sơ mi nam lịch lãm',
        'Bối cảnh: café, công viên mùa anh đào, ban công nhìn ra thành phố, bãi biển hoàng hôn',
        'Đặc biệt: sakura petals flying, rain on window reflection, soft lens flare, golden bokeh',
        '',
        SEP50,
        'D. FANTASY / PHÉP THUẬT / ISEKAI / HỆ THỐNG',
        SEP50,
        'Nhận biết: phép thuật, rồng, yêu quái, dị giới, triệu hồi, dungeon, level, hệ thống, boss',
        'Model: [MODEL:flux] cho cảnh huyền ảo — [MODEL:flux-realism] cho chiến đấu boss',
        'Art style: epic fantasy digital art, vibrant magical effects, Japanese light novel style',
        'Màu sắc: xanh điện holographic, vàng ma thuật, tím huyền, ánh sáng trắng xanh sống động',
        'Trang phục: đồng phục học sinh (isekai), áo giáp fantasy, áo choàng phiêu lưu, mage robe',
        'Bối cảnh: dungeon ánh sáng ma thuật, vùng hoang dã fantasy, hầm ngục boss, summoning circle',
        'Đặc biệt: UI holographic window (NO số/chữ thực), skill glow, portal swirl, magic circle',
        '',
        SEP50,
        'E. KINH DỊ / MA QUỶ / LIÊU TRAI / HUYỀN BÍ',
        SEP50,
        'Nhận biết: ma, quỷ, âm hồn, ám, rùng rợn, lời nguyền, ngôi nhà bỏ hoang, thực thể',
        'Model: [MODEL:flux-realism] cho mọi cảnh kinh dị',
        'Art style: dark gothic horror illustration style, high contrast chiaroscuro, eerie atmosphere',
        'Màu sắc: xám tro, xanh lạnh tử thi, đỏ máu, trắng xương — KHÔNG pitch black hoàn toàn',
        'Trang phục: quần áo cũ rách, váy trắng ma nữ, đồ tang, áo mưa ướt đẫm',
        'Bối cảnh: nhà hoang Victorian, nghĩa địa sương mù, hành lang bệnh viện bỏ hoang, gương cổ',
        'Đặc biệt: shadow entity méo mó, bàn tay từ bóng tối, gương phản chiếu khác thực tế, fog',
        '',
        SEP50,
        'F. HÀNH ĐỘNG / GIANG HỒ / XÃ HỘI ĐEN',
        SEP50,
        'Nhận biết: băng đảng, anh hùng, giang hồ, huynh đệ, trả thù, thanh toán, lãnh thổ',
        'Model: [MODEL:flux-realism] cho hầu hết cảnh',
        'Art style: gritty cinematic action illustration, high contrast lighting, intense expressions',
        'Màu sắc: tối contrast cao, xanh đêm, ánh đèn đường vàng, đỏ neon, bóng tối đô thị',
        'Trang phục: áo khoác da đen, hoodie, suit đen, quần áo giang hồ, vết thương rách',
        'Bối cảnh: hẻm tối đêm mưa, nhà kho hoang, bãi đỗ xe ngầm, quán bar ánh đèn mờ',
        'Đặc biệt: rain-soaked urban grit, cigarette smoke, neon reflection on wet road',
        '',
        SEP50,
        'G. LỊCH SỬ / CHIẾN TRANH / CUNG ĐẤU',
        SEP50,
        'Nhận biết: chiến trường, quân đội, vua, triều đại, hậu cung, phi tần, mưu kế, tranh sủng',
        'Model: [MODEL:flux-realism] cho chiến trường — [MODEL:flux] cho cung đình',
        'Art style: historical epic illustration, period-accurate costumes, grand palace or battlefield',
        'Màu sắc: đỏ cung đình, vàng hoàng gia, xanh ngọc, xám thép chiến trường',
        'Trang phục: long bào, phụng bào, trâm cài tóc, kiềng ngọc, áo giáp chiến binh',
        'Bối cảnh: chiến trường khói lửa, thái hòa điện, hậu cung lộng lẫy, hành lang cột đỏ',
        'Đặc biệt: candle flame glow, incense smoke, army formation, royal ceremony grandeur',
        '',
        SEP50,
        'H. KHOA HỌC VIỄN TƯỞNG / SCI-FI / CYBERPUNK',
        SEP50,
        'Nhận biết: robot, vũ trụ, AI, tàu vũ trụ, thực tế ảo, ngoài hành tinh, mạng thần kinh',
        'Model: [MODEL:flux] cho sci-fi đẹp — [MODEL:flux-realism] cho cyberpunk tối',
        'Art style: futuristic sci-fi concept art, neon cyberpunk or hard sci-fi cinematic lighting',
        'Màu sắc: neon xanh/tím/hồng (cyberpunk) hoặc trắng bạc lạnh sạch (hard sci-fi)',
        'Trang phục: exo-suit, bộ giáp tương lai, áo lab scientist, kính AR holographic',
        'Bối cảnh: thành phố tương lai siêu cao, trạm vũ trụ, hành lang tàu không gian, nebula',
        'Đặc biệt: holographic interface, particle trails, nebula background, zero-gravity environment',
        '',
        SEP50,
        'I. THỂ THAO / NẤU ĂN / TÀI NĂNG / SLICE OF LIFE',
        SEP50,
        'Nhận biết: thi đấu, luyện tập, nấu ăn, âm nhạc, hội họa, biểu diễn, gia đình bình dị',
        'Model: [MODEL:flux-realism] cho thể thao — [MODEL:flux] cho slice of life',
        'Art style: dynamic sports illustration hoặc warm cozy slice-of-life anime style',
        'Màu sắc: ấm áp sống động (vàng nắng, cam, nâu gỗ, xanh trời nhạt) hoặc vibrant action',
        'Trang phục: đồng phục thi đấu, quần áo thường ngày giản dị, tạp dề nấu ăn',
        'Bối cảnh: sân thi đấu, căn bếp ấm cúng, phòng nhạc, sân trường, cánh đồng làng',
        'Đặc biệt: golden hour sunlight, steam from food, motion blur on sports action, crowd cheering',
        '',
        SEP80,
        'PHẦN 4 — HƯỚNG DẪN 10 LOẠI CẢNH VÀ GÓC MÁY',
        SEP80,
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 1 - TOÀN CẢNH / PHONG CẢNH / THIÊN NHIÊN [MODEL:flux]     │',
        '│ epic wide establishing shot, detailed environment,              │',
        '│ atmospheric lighting, vivid natural colors,                     │',
        '│ Cổ trang: misty mountains, ancient pavilion, ink-wash sky      │',
        '│ Hiện đại: cityscape, golden hour photography, skyline          │',
        '│ Fantasy: magical floating islands, aurora-colored sky          │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 2 - CHIẾN ĐẤU / HÀNH ĐỘNG [MODEL:flux-realism]           │',
        '│ dynamic action pose, explosive motion blur, impact shockwave,  │',
        '│ dramatic diagonal composition, debris and energy flying,        │',
        '│ Cổ trang: sword qi slash, flowing combat robes, dust cloud     │',
        '│ Fantasy: spell cast explosion, magical combat glow              │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 3 - HỘI THOẠI / ĐỐI ĐẦU / GẶP GỠ [MODEL:flux-realism]  │',
        '│ medium shot or close-up, sharp expressive faces,                │',
        '│ dramatic rim lighting, shallow depth of field,                 │',
        '│ two-character framing, body language showing relationship,      │',
        '│ NO blur on faces, ultra sharp character details                 │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 4 - TÌNH CẢM / LÃNG MẠN / XÚC ĐỘNG [MODEL:flux]         │',
        '│ soft romantic illustration, warm pastel palette,               │',
        '│ golden soft light, gentle bokeh, emotional close-up,            │',
        '│ cherry blossom or rain accent, intimate framing                 │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 5 - HUYỀN THUẬT / TU LUYỆN / ĐỘT PHÁ [MODEL:flux]       │',
        '│ xianxia mystical art, ethereal aura glowing outward,           │',
        '│ luminous spiritual light burst, magical particle effects,      │',
        '│ low angle looking up, environment reacting to power             │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 6 - SINH HOẠT / CHỢ / PHỐ / ĂN UỐNG [MODEL:flux-realism]│',
        '│ lively crowd scene, warm ambient lighting,                      │',
        '│ Cổ trang: ancient market, red lanterns, vivid red-gold          │',
        '│ Hiện đại: busy street, restaurant, night market neon            │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 7 - NỘI TÂM / CÔ ĐƠN / SUY TƯ / ĐÊM [MODEL:flux]         │',
        '│ solitary figure silhouette, pale moonlit night,                 │',
        '│ soft blue-white light, minimalist composition,                  │',
        '│ contemplative mood, NOT pitch black — use moonlit mist          │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 8 - KINH DỊ / MA / ÁM / RÙNG RỢN [MODEL:flux-realism]   │',
        '│ eerie atmospheric lighting, cold blue-green tones,              │',
        '│ pale ghost figure with distorted features, fog on ground,       │',
        '│ NOT completely black — dim moonlight through heavy fog          │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 9 - HOÀNG CUNG / CHIẾN TRƯỜNG [MODEL:flux-realism]         │',
        '│ grand imperial palace, golden throne room, red-gold decor,     │',
        '│ epic battlefield panorama, dramatic war sky, smoke and fire,   │',
        '│ heroic scale, period-accurate costumes                          │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        '┌─────────────────────────────────────────────────────────────────┐',
        '│ LOẠI 10 - MỞ ĐẦU / KẾT CHƯƠNG [MODEL:flux]                     │',
        '│ cinematic establishing shot, symbolic mood-setting imagery,     │',
        '│ dramatic wide shot, atmospheric depth, title-card quality,      │',
        '│ powerful visual storytelling, captures chapter emotional tone  │',
        '└─────────────────────────────────────────────────────────────────┘',
        '',
        SEP80,
        'PHẦN 5 — QUY TẮC NHÂN VẬT NHẤT QUÁN (CHARACTER CONSISTENCY)',
        SEP80,
        '',
        'NGUYÊN TẮC QUAN TRỌNG NHẤT — PHẢI TUÂN THỦ TUYỆT ĐỐI:',
        'Mỗi nhân vật PHẢI được mô tả GIỐNG HỆT nhau trong TOÀN BỘ file TXT.',
        'Nếu cảnh 1 nhân vật A có: medium-length black hair, sharp dark eyes, red scar on left cheek',
        '→ Thì cảnh 50 nhân vật A VẪN PHẢI CÓ: medium-length black hair, sharp dark eyes, red scar on left cheek',
        '',
        'DANH SÁCH 7 ĐIỂM PHẢI GIỮ NHẤT QUÁN:',
        '  (1) Giới tính + tuổi ngoại hình: young male, teenage female, middle-aged man',
        '  (2) Màu tóc + kiểu tóc: long wavy silver hair, short spiky black hair',
        '  (3) Màu mắt: golden amber eyes, cold grey eyes, heterochromia left-blue right-red',
        '  (4) Đặc điểm nhận diện: sẹo, nốt ruồi, birthmark, tattoo, dị dạng',
        '  (5) Trang phục đặc trưng: màu sắc, kiểu dáng, phụ kiện đặc biệt',
        '  (6) Vũ khí/đạo cụ: silver-sheathed longsword at left hip, worn leather backpack',
        '  (7) Vóc dáng: tall and lean, petite and delicate, muscular broad-shouldered',
        '',
        'QUY TRÌNH 4 BƯỚC:',
        '  Bước 1: Đọc lướt toàn bộ file — liệt kê tất cả nhân vật có [IMAGE PROMPT]',
        '  Bước 2: Xây dựng character sheet riêng cho mỗi nhân vật trong đầu',
        '  Bước 3: Lần đầu xuất hiện → mô tả đầy đủ nhất cả 7 điểm',
        '  Bước 4: Lần sau → COPY y chang 7 điểm, chỉ đổi action/pose/background',
        '',
        'VÍ DỤ NHẤT QUÁN ĐÚNG — Nhân vật Minh qua 3 cảnh:',
        '  Cảnh 1: ...young male warrior, medium-length black hair tied with white ribbon,',
        '  sharp determined dark brown eyes, lean athletic build, white hanfu with blue trim...',
        '',
        '  Cảnh 2: ...same young male warrior, medium-length black hair untied flowing in wind,',
        '  sharp determined dark brown eyes blazing with intensity, lean athletic build,',
        '  white hanfu with blue trim torn at sleeve...',
        '',
        '  Cảnh 3: ...same young male warrior, medium-length black hair loose,',
        '  sharp dark brown eyes now carrying sadness, lean athletic build, white hanfu with blue trim...',
        '',
        'VÍ DỤ SAI — TUYỆT ĐỐI KHÔNG LÀM:',
        '  Cảnh 1: ...black hair, dark eyes...',
        '  Cảnh 2: ...brown hair, blue eyes...  ← SAI! Đổi màu tóc và mắt',
        '  Cảnh 3: ...golden hair... ← SAI HOÀN TOÀN!',
        '',
        SEP80,
        'PHẦN 6 — QUY TẮC CỨNG TUYỆT ĐỐI (HARD RULES)',
        SEP80,
        '',
        '━━ RULE #1: MODEL TAG BẮT BUỘC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Mọi prompt PHẢI bắt đầu bằng [MODEL:flux] hoặc [MODEL:flux-realism]',
        '  [MODEL:flux]         → phong cảnh, tiên hiệp, lãng mạn, slice of life',
        '  [MODEL:flux-realism] → chiến đấu, hội thoại, kinh dị, hiện đại, giang hồ',
        '',
        '━━ RULE #2: KHÔNG CÓ CHỮ TRÊN ẢNH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Mọi prompt PHẢI kết thúc bằng:',
        '  NO text, NO watermark, NO letters, NO words, NO numbers,',
        '  NO dialogue bubbles, NO subtitles, NO captions,',
        '  NO Chinese characters, NO Japanese characters, NO Korean characters,',
        '  NO UI elements, NO logo, NO signature, pure illustration only',
        '',
        '━━ RULE #3: MÀU SẮC BẮT BUỘC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'LUÔN THÊM: bright clean tones, high key lighting, vivid colors, ultra sharp detailed',
        'TUYỆT ĐỐI KHÔNG: dark muddy background, pitch black darkness, blurry faces',
        '',
        '━━ RULE #4: TỶ LỆ 16:9 VÀ QUALITY TAGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Luôn thêm: cinematic 16:9, masterpiece, highly detailed, ultra sharp focus, 8K resolution',
        '',
        '━━ RULE #5: ĐỘ DÀI TỐI THIỂU ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Mỗi prompt tối thiểu 60 từ tiếng Anh — quá ngắn = ảnh generic xấu',
        '',
        SEP80,
        'PHẦN 7 — QUY TẮC OUTPUT VÀ VÍ DỤ HOÀN CHỈNH',
        SEP80,
        '',
        'QUY TẮC OUTPUT:',
        '1. CHỈ điền vào [IMAGE PROMPT: CHƯA TẠO] của [Dẫn Truyện]',
        '2. Dòng thoại [Giọng Nam]: / [Giọng Nữ]: GIỮ NGUYÊN 100%, không chỉnh sửa gì',
        '3. Giữ NGUYÊN cấu trúc: timestamp, format, thứ tự dòng',
        '4. Prompt BẮT BUỘC bắt đầu bằng [MODEL:flux] hoặc [MODEL:flux-realism]',
        '5. Dòng [FILE: scene_xxxxx.xxxs.jpg] — KHÔNG XÓA, KHÔNG SỬA',
        '6. KHÔNG thêm giải thích, chú thích, hay markdown ngoài prompt',
        '',
        'INPUT MẪU:',
        '  [Dẫn Truyện]',
        '  startTime: 45.20s',
        '  → 18.30s →',
        '  [IMAGE PROMPT: CHƯA TẠO]',
        '  [FILE: scene_04520.452s.jpg]',
        '  Minh đứng trên đỉnh núi nhìn xuống thành trì đang bốc khói,',
        '  lòng nặng trĩu vì sư phụ đang bị giam cầm ở đó.',
        '',
        'OUTPUT ĐÚNG:',
        '  [IMAGE PROMPT: [MODEL:flux] A young male warrior standing alone atop a jagged mountain peak,',
        '  body slightly turned, fierce wind billowing white hanfu robe and hair dramatically,',
        '  medium-length black hair tied with white ribbon loosened by wind,',
        '  sharp dark brown eyes gazing with heavy sorrow at distant burning fortress below,',
        '  lean athletic build, white hanfu with blue embroidery trim, silver sword at left hip,',
        '  stone fortress visible below with rising smoke and orange fire glow,',
        '  dramatic storm clouds gathering, crimson and grey sky at late afternoon,',
        '  heavy resolve and painful duty atmosphere, cold mountain wind,',
        '  wide shot from behind-right, subject lower-left third, panoramic landscape,',
        '  Chinese wuxia manhua art style, ink-wash brush texture, bright clean tones,',
        '  cinematic 16:9, masterpiece, ultra-detailed, 8K resolution,',
        '  NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
        '  NO subtitles, NO UI elements, NO logo, pure illustration only]',
        '  [FILE: scene_04520.452s.jpg]',
        '',
        SEP80,
        'BẮT ĐẦU XỬ LÝ FILE TXT — ĐỌC TOÀN BỘ FILE TRƯỚC, SAU ĐÓ VIẾT PROMPT',
        SEP80,
        ''
    ];

    // ── HEADER GENSPARK (FULL) ──
    var headerGenspark = [
      '-------------------------------------------------------',
        'Read this TXT file carefully. For each [IMAGE PROMPT] ',
        'belonging to [Dẫn Truyện], generate an image ',
        'using GPT Image 2, then immediately save it to AI Drive ',
        'with the EXACT filename from the [FILE:] tag below it.',
        'Do NOT use Export button — save directly to Drive.',
        '',
        'Process all scenes one by one in order.',
        'Confirm each save before moving to next scene.',
        '',
        'CRITICAL OUTPUT RULE:',
        'When you reply, you MUST output the ENTIRE script exactly as provided.',
        'DO NOT delete, skip, summarize, or hide ANY dialogue lines like [Giọng Nam]: or [Giọng Nữ]:.',
        'Replace ONLY the [IMAGE PROMPT: CHƯA TẠO] text. You MUST keep all dialogue lines 100% intact in your output.',
        SEP80,
        'NHIỆM VỤ: Viết IMAGE PROMPT tiếng Anh cho từng cảnh [Dẫn Truyện] trong file TXT',
        'DÀNH CHO: Genspark AI Agent — model [MODEL:gpt-image-1]',
        SEP80,
        '',
        'MỤC ĐÍCH:',
        '- Điền vào vị trí [IMAGE PROMPT: CHƯA TẠO] trong file TXT',
        '- Mỗi prompt dùng để tạo ảnh bằng Genspark AI (GPT Image 2 / Flux 2 / Seedream)',
        '- Ảnh dùng làm khung hình trong video đọc truyện YouTube/TikTok',
        '- Chỉ viết prompt cho [IMAGE PROMPT: CHƯA TẠO] — KHÔNG thay đổi nội dung nào khác',
        '',
        SEP80,
        'PHẦN 1 — CẤU TRÚC FILE TXT VÀ QUY TẮC XỬ LÝ',
        SEP80,
        '',
        'CẤU TRÚC FILE TXT CÓ DẠNG:',
        '  [Dẫn Truyện]',
        '  startTime: 0.00s',
        '  → 12.50s →',
        '  [IMAGE PROMPT: CHƯA TẠO]',
        '  [FILE: scene_00000.000s.jpg]',
        '  Văn bản tường thuật của Dẫn Truyện tại đây...',
        '',
        '  [Giọng Nam]: Lời thoại của nhân vật nam — KHÔNG có ảnh',
        '  [Giọng Nữ]: Lời thoại của nhân vật nữ — KHÔNG có ảnh',
        '',
        'QUY TẮC XỬ LÝ QUAN TRỌNG:',
        '1. CHỈ xử lý dòng [IMAGE PROMPT: CHƯA TẠO] — bỏ qua mọi dòng khác',
        '2. Đọc văn bản tường thuật ngay bên dưới [FILE: ...] để hiểu nội dung cảnh',
        '3. Đọc context các cảnh trước/sau để đảm bảo nhân vật nhất quán',
        '4. Giữ nguyên cấu trúc file — chỉ thay CHƯA TẠO bằng prompt tiếng Anh',
        '5. KHÔNG thêm dòng mới, KHÔNG xóa dòng nào',
        '6. KHÔNG đặt prompt trong dấu ngoặc kép hay markdown',
        '7. Thoại nhân vật (dòng có [Giọng Nam]:, [Giọng Nữ]:) — BỎ QUA, không tạo ảnh',
        '8. Dòng thoại [Giọng Nam]: / [Giọng Nữ]: GIỮ NGUYÊN 100%, không chỉnh sửa gì',
        '',
        SEP80,
        'PHẦN 2 — CẤU TRÚC CHUẨN CỦA MỘT IMAGE PROMPT HOÀN CHỈNH',
        SEP80,
        '',
        'MỖI PROMPT PHẢI CÓ ĐỦ 8 THÀNH PHẦN (viết thành 1 đoạn liền, không xuống dòng):',
        '',
        '  [1. MODEL TAG]     — Bắt buộc đầu tiên: [MODEL:gpt-image-1]',
        '  [2. SUBJECT]       — Chủ thể chính: nhân vật, vật thể, hoặc cảnh quan',
        '  [3. ACTION/POSE]   — Hành động, tư thế, biểu cảm của nhân vật',
        '  [4. APPEARANCE]    — Ngoại hình: tóc, mắt, trang phục, đặc điểm nhận diện',
        '  [5. SETTING]       — Bối cảnh không gian: địa điểm, thời gian, thời tiết',
        '  [6. ATMOSPHERE]    — Không khí, cảm xúc, ánh sáng, màu sắc chủ đạo',
        '  [7. COMPOSITION]   — Góc máy, framing, tiêu điểm, bố cục',
        '  [8. ART STYLE + QUALITY TAGS] — Phong cách + tags chất lượng + NO text rules',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện kiếm hiệp):',
        '  [MODEL:gpt-image-1] A young male warrior standing tall on a misty mountain cliff at dusk,',
        '  right hand gripping a slender silver longsword raised toward the sky,',
        '  medium-length black hair flowing in wind, sharp determined dark eyes,',
        '  wearing white flowing hanfu robe with blue embroidery,',
        '  surrounded by ancient pine trees, crimson sunset sky with dramatic clouds,',
        '  heroic and awe-inspiring atmosphere, warm golden-red lighting,',
        '  low-angle dramatic shot looking up, subject centered in frame,',
        '  Chinese wuxia manhua art style, ink-wash brush texture, cinematic quality,',
        '  masterpiece, ultra-detailed, 8K resolution, 16:9 landscape,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện lãng mạn hiện đại):',
        '  [MODEL:gpt-image-1] A beautiful young woman sitting alone at a rainy cafe window at night,',
        '  chin resting on hand, gazing melancholically at raindrops on the glass,',
        '  long straight dark brown hair, big expressive eyes with a hint of sadness,',
        '  wearing a cream-colored oversized knit sweater,',
        '  warm amber cafe interior with bokeh city lights through the window,',
        '  nostalgic and bittersweet atmosphere, soft warm lighting with cool rain contrast,',
        '  medium close-up shot, shallow depth of field, subject slightly off-center,',
        '  modern Korean webtoon art style, soft brushwork, cinematic color grading,',
        '  masterpiece, ultra-detailed, 8K resolution, 16:9 landscape,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện kinh dị):',
        '  [MODEL:gpt-image-1] An abandoned Victorian mansion at the end of a dead road on a moonless night,',
        '  all windows pitch black except one glowing pale green on the third floor,',
        '  bare twisted trees surrounding the building, thick fog crawling on the ground,',
        '  a small silhouette of a child standing motionless at the gate,',
        '  suffocating dread and supernatural atmosphere, cold blue-green moonlight,',
        '  wide establishing shot, low horizon line, symmetrical composition,',
        '  dark gothic horror illustration style, high contrast chiaroscuro,',
        '  masterpiece, ultra-detailed, 8K resolution, 16:9 landscape,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện tiên hiệp):',
        '  [MODEL:gpt-image-1] A celestial female cultivator sitting cross-legged on a floating jade island,',
        '  in deep meditation, hands forming lotus seal mudra on her lap,',
        '  silver-white hair pinned with golden phoenix hairpins, serene closed-eye expression,',
        '  wearing layered translucent white immortal robes with crane motif embroidery,',
        '  surrounded by swirling spiritual energy clouds, glowing spirit stones nearby,',
        '  transcendent and ethereal atmosphere, cool blue-white glow with golden accents,',
        '  birds eye wide shot, vast sky, subject small against infinite heavens,',
        '  Chinese xianxia illustration style, soft watercolor wash, luminous glow effects,',
        '  masterpiece, ultra-detailed, 8K resolution, 16:9 landscape,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        'VÍ DỤ PROMPT ĐẦY ĐỦ (truyện hệ thống/isekai):',
        '  [MODEL:gpt-image-1] A teenage male protagonist standing in glowing magical summoning circle,',
        '  expression shocked and wide-eyed, arms slightly spread for balance,',
        '  messy brown hair, wearing modern school uniform white shirt dark pants,',
        '  dark void surrounding circle with floating glowing runes and particles,',
        '  translucent blue holographic status window hovering in front of him,',
        '  overwhelming surreal otherworld atmosphere, electric blue and white light,',
        '  eye-level straight-on shot, subject centered, dramatic lighting from below,',
        '  Japanese light novel illustration style, vibrant colors, clean linework,',
        '  masterpiece, ultra-detailed, 8K resolution, 16:9 landscape,',
        '  NO text, NO watermark, NO letters, NO Chinese characters, NO subtitles, NO UI elements',
        '',
        SEP80,
        'PHẦN 3 — HƯỚNG DẪN THEO 12 THỂ LOẠI TRUYỆN',
        SEP80,
        '',
        SEP50,
        'A. KIẾM HIỆP / VÕ HIỆP (Wuxia)',
        SEP50,
        'Nhận biết: giang hồ, võ lâm, môn phái, kiếm pháp, nội công, đại hiệp, sư phụ, sư đệ',
        'Art style: Chinese wuxia manhua art style, ink-wash brush texture, dynamic action lines',
        'Màu sắc: đỏ thẫm, vàng đồng, xanh ngọc, trắng, đen tuyền',
        'Trang phục: hanfu, áo bào, áo vải thô, giáp trụ, đai lưng, kiếm đeo hông',
        'Bối cảnh: núi non hiểm trở, thác nước, trúc lâm, quán rượu cổ, đấu trường giang hồ',
        'Cảm xúc: hùng tráng, bi tráng, ân oán giang hồ, cô độc hiệp khách',
        'Đặc biệt: aura glow (khí công), sword energy slash (kiếm khí), robes flowing in wind',
        '',
        SEP50,
        'B. TIÊN HIỆP / TU TIÊN (Xianxia / Cultivation)',
        SEP50,
        'Nhận biết: tu luyện, linh khí, đột phá cảnh giới, tiên giới, linh đan, pháp bảo, tông môn',
        'Art style: Chinese xianxia illustration style, luminous glow, soft watercolor wash, ethereal',
        'Màu sắc: xanh lam thiên thanh, vàng kim, trắng tinh khiết, tím huyền bí, linh quang ngũ sắc',
        'Trang phục: tiên y mỏng manh, đạo bào, áo trắng thêu hạc, mão quan, phù lục',
        'Bối cảnh: tiên cảnh mây trắng, đảo nổi trên không, đại điện, linh tuyền, động phủ tu luyện',
        'Cảm xúc: siêu thoát, huyền ảo, áp bức của thiên địa, cô độc đường tu tiên',
        'Đặc biệt: linh khí xoáy vào đan điền, ngũ hành hào quang, đột phá thiên lôi, pháp trận sáng',
        '',
        SEP50,
        'C. HỆ THỐNG / ISEKAI / NHẬP VÀO TRUYỆN',
        SEP50,
        'Nhận biết: hệ thống, level up, nhiệm vụ, rương thưởng, dị giới, xuyên không, dungeon',
        'Art style: Japanese light novel illustration style, vibrant colors, clean anime linework',
        'Màu sắc: xanh điện holographic, vàng hệ thống, tím huyền, ánh sáng trắng xanh',
        'Trang phục: đồng phục học sinh (isekai) hoặc áo giáp fantasy, áo choàng phiêu lưu',
        'Bối cảnh: dungeon tối tăm ánh sáng ma thuật, vùng hoang dã fantasy, hầm ngục boss',
        'Cảm xúc: hào hứng phiêu lưu, căng thẳng chiến đấu, shock khi gặp điều kỳ lạ',
        'Đặc biệt: UI holographic window, skill glow effect, summoning circle, portal swirl',
        '',
        SEP50,
        'D. LÃNG MẠN / NGÔN TÌNH HIỆN ĐẠI',
        SEP50,
        'Nhận biết: CEO, tình yêu, hôn nhân, tình tam giác, ký ức, gặp lại người xưa, ngọt ngào',
        'Art style: modern Korean webtoon art style, soft pastel colors, romantic lighting, clean linework',
        'Màu sắc: pastel ấm (hồng, be, vàng nhạt), bokeh lấp lánh, ánh sáng ban mai hoặc hoàng hôn',
        'Trang phục: thời trang đô thị hiện đại, vest nam lịch lãm, váy nữ thanh lịch, casual style',
        'Bối cảnh: café sang trọng, văn phòng cao tầng, công viên mùa anh đào, ban công thành phố',
        'Cảm xúc: ngọt ngào, bồi hồi, nhớ nhung, bướm trong bụng, khoảnh khắc lãng mạn',
        'Đặc biệt: sakura petals flying, city bokeh lights, rain on window reflection, soft lens flare',
        '',
        SEP50,
        'E. CỔ ĐẠI / LỊCH SỬ / CUNG ĐẤU',
        SEP50,
        'Nhận biết: hoàng cung, hậu cung, phi tần, thái tử, âm mưu, tranh sủng, thế gia, lễ nghi',
        'Art style: Chinese ancient court painting style, delicate brushwork, elegant composition',
        'Màu sắc: đỏ cung đình, vàng hoàng gia, xanh ngọc bích, tím cao quý',
        'Trang phục: phụng bào, long bào, áo tứ hợp như ý, trâm cài tóc, kiềng ngọc',
        'Bối cảnh: hậu cung lộng lẫy, thái hòa điện, vườn ngự, hành lang cột đỏ, phòng tẩm cung',
        'Cảm xúc: mưu tính thâm sâu, vẻ đẹp nguy hiểm, quyền lực ẩn giấu sau nụ cười',
        'Đặc biệt: candle light glow, incense smoke, peony petals falling, tears on powdered cheek',
        '',
        SEP50,
        'F. KINH DỊ / LIÊU TRAI / MA QUỶ',
        SEP50,
        'Nhận biết: hồn ma, ám ảnh, ngôi nhà bỏ hoang, bóng tối, điều kỳ dị, thực thể không tên',
        'Art style: dark gothic horror illustration style, high contrast chiaroscuro, unsettling atmosphere',
        'Màu sắc: đen, xám tro, xanh lạnh tử thi, đỏ máu tươi, trắng xương — KHÔNG pitch black',
        'Trang phục: quần áo cũ rách, váy trắng ma nữ, đồ tang, áo mưa ướt',
        'Bối cảnh: nhà hoang Victorian, nghĩa địa sương mù, hành lang bệnh viện bỏ hoang, gương cổ',
        'Cảm xúc: kinh sợ đến liệt, bầu không khí ngạt thở, điều gì đó sai sai không thể giải thích',
        'Đặc biệt: shadow entity méo mó, bàn tay từ bóng tối, gương phản chiếu khác thực tế',
        '',
        SEP50,
        'G. HÀNH ĐỘNG / CHIẾN TRANH / QUÂN SỰ',
        SEP50,
        'Nhận biết: chiến trận, binh lính, vũ khí, chỉ huy, chiến lược, hy sinh, quân đội',
        'Art style: hyper-realistic digital painting style, dramatic lighting, cinematic composition',
        'Màu sắc: xám thép, nâu đất, đỏ máu, khói đen, sáng sớm lạnh lẽo trước trận chiến',
        'Trang phục: áo giáp kim loại (fantasy) hoặc quân phục cổ đại/hiện đại, mũ giáp, vũ khí',
        'Bối cảnh: chiến trường tan hoang, pháo đài bị vây, biển người xung trận, bầu trời lửa khói',
        'Cảm xúc: adrenaline tột độ, quyết tử, nặng nề sinh tử, hùng tráng bi ai',
        'Đặc biệt: explosion debris flying, motion blur charging soldiers, god-ray through smoke',
        '',
        SEP50,
        'H. TRINH THÁM / TỘI PHẠM / GIẬT GÂN',
        SEP50,
        'Nhận biết: thám tử, vụ án, manh mối, nghi phạm, tội phạm, điều tra, bí ẩn, lật mặt',
        'Art style: noir detective graphic novel style, dramatic shadows, high contrast film noir',
        'Màu sắc: đen trắng với điểm nhấn đỏ/vàng, ánh đèn đường ướt mưa, contrast cao',
        'Trang phục: áo dạ dài cổ điển noir, áo vest thám tử, đồng phục cảnh sát, ngụy trang',
        'Bối cảnh: phòng thẩm vấn đèn đơn, hiện trường vụ án, phố đêm mưa, văn phòng thám tử',
        'Cảm xúc: căng thẳng mặc cả trên dao, bí ẩn cuốn hút, đô thị tội phạm lạnh lẽo',
        'Đặc biệt: single overhead light deep shadows, rain reflection wet pavement, cigarette smoke',
        '',
        SEP50,
        'I. KHOA HỌC VIỄN TƯỞNG / SCI-FI / CYBERPUNK',
        SEP50,
        'Nhận biết: tương lai, robot, AI, tàu vũ trụ, du hành thời gian, ngoài hành tinh',
        'Art style: futuristic sci-fi concept art style, neon cyberpunk or hard sci-fi cinematic',
        'Màu sắc: neon xanh/tím/hồng (cyberpunk) hoặc trắng bạc lạnh sạch (hard sci-fi)',
        'Trang phục: bộ đồ chiến đấu tương lai, exo-suit, áo lab scientist, kính AR',
        'Bối cảnh: thành phố tương lai siêu cao, trạm vũ trụ, hành lang tàu không gian, nebula',
        'Cảm xúc: kỳ diệu công nghệ, cô đơn vũ trụ bao la, dystopian áp bức, khám phá vô tận',
        'Đặc biệt: holographic interface, particle engine trails, nebula background, zero-gravity',
        '',
        SEP50,
        'J. GIA ĐÌNH / ĐỜI THƯỜNG / SLICE OF LIFE',
        SEP50,
        'Nhận biết: gia đình, cuộc sống thường ngày, nấu ăn, làm việc, học đường, tình cảm bình dị',
        'Art style: warm slice-of-life anime illustration style, soft lighting, cozy natural colors',
        'Màu sắc: ấm áp (vàng nắng, cam, nâu gỗ, xanh trời nhạt), tông màu tự nhiên dịu nhẹ',
        'Trang phục: quần áo thường ngày giản dị, tạp dề nấu ăn, đồng phục học sinh, đồ mặc nhà',
        'Bối cảnh: căn bếp ấm cúng, phòng khách gia đình, trường học, tiệm tạp hóa nhỏ, làng quê',
        'Cảm xúc: ấm lòng, bình yên, nhẹ nhàng cảm xúc, khoảnh khắc nhỏ đáng trân trọng',
        'Đặc biệt: golden hour sunlight through curtains, steam from food, dust particles in sunbeam',
        '',
        SEP50,
        'K. MA HỌC / PHÉP THUẬT / DARK FANTASY',
        SEP50,
        'Nhận biết: pháp sư, ma thuật, nghi lễ, lời nguyền, tháp pháp sư, bóng tối nguyên thủy',
        'Art style: dark fantasy digital art style, dramatic magical lighting, painterly sorcery effects',
        'Màu sắc: đen tím thẫm, xanh đêm, ánh sáng ma thuật trắng/vàng/đỏ tương phản mạnh',
        'Trang phục: áo choàng ma pháp dài với rune, mũ phù thủy, trang phục bóng tối, enchanted armor',
        'Bối cảnh: tháp ma thuật tối tăm, nghi trận summoning, rừng chết cây khô, lâu đài trên vách đá',
        'Cảm xúc: huyền bí ám ảnh, quyền năng vượt giới hạn, cái giá của sức mạnh tối thượng',
        'Đặc biệt: magical ritual circle glowing floor, dark tendrils shadow magic, spell light burst',
        '',
        SEP50,
        'L. ZOMBIE / TẬN THẾ / POST-APOCALYPTIC',
        SEP50,
        'Nhận biết: zombie, tận thế, sống sót, nhóm sinh tồn, thế giới hoang tàn, dịch bệnh, bunker',
        'Art style: post-apocalyptic survival art style, gritty realism, desaturated palette',
        'Màu sắc: xám hoang tàn, nâu bụi đất, đỏ rỉ sét, xanh lạnh sấm sét, mất bão hòa màu',
        'Trang phục: quần áo rách nát tự may vá, giáp tự chế từ phế liệu, balo sinh tồn, vũ khí tự chế',
        'Bối cảnh: thành phố đổ nát cây leo, siêu thị bỏ hoang, đường cao tốc xe bỏ, bầu trời đỏ ối',
        'Cảm xúc: sinh tử trong từng giây, hy vọng mong manh cuối đường, mất mát không thể bù đắp',
        'Đặc biệt: overgrown vines on buildings, ash falling like snow, broken glass, distant fire glow',
        '',
        SEP80,
        'PHẦN 4 — HƯỚNG DẪN 14 LOẠI CẢNH VÀ GÓC MÁY',
        SEP80,
        '',
        '1. CẢNH GIỚI THIỆU NHÂN VẬT LẦN ĐẦU:',
        '   → Full body shot, rõ ngoại hình từ đầu đến chân, pose ấn tượng khắc họa tính cách',
        '   → Mô tả chi tiết: màu tóc, màu mắt, chiều cao, trang phục đặc trưng, vũ khí/đạo cụ',
        '   → Background phù hợp thể loại, lighting tôn tượng nhân vật',
        '   Tag thêm: full body portrait, character introduction shot, iconic pose',
        '',
        '2. CẢNH CHIẾN ĐẤU / HÀNH ĐỘNG CAO TRÀO:',
        '   → Dynamic angle (low angle hoặc dutch tilt), motion lines, impact effects',
        '   → Nhân vật mid-action: kiếm vung lên, đấm tung ra, skill đang nổ',
        '   → Particle effects, energy aura, debris flying, dust cloud',
        '   Tag thêm: explosive action scene, dynamic diagonal composition, motion blur, impact shockwave',
        '',
        '3. CẢNH TÂM TÌNH / CẢM XÚC / NỘI TÂM:',
        '   → Close-up hoặc medium close-up mặt nhân vật, biểu cảm rõ ràng',
        '   → Ánh mắt là trọng tâm: buồn, quyết tâm, yêu thương, tức giận, đau đớn',
        '   → Shallow depth of field, bokeh background, soft lighting',
        '   Tag thêm: emotional close-up portrait, expressive eyes, shallow depth of field, soft bokeh',
        '',
        '4. CẢNH PHONG CẢNH / THIÊN NHIÊN / KHÔNG GIAN:',
        '   → Wide panoramic shot, bầu trời ấn tượng chiếm 60% khung hình',
        '   → Nhân vật nhỏ so với cảnh quan, nhấn mạnh sự bé nhỏ của con người',
        '   → Thời điểm đặc biệt: hoàng hôn rực rỡ, bình minh trong trẻo, bão tố đang đến',
        '   Tag thêm: epic landscape wide shot, panoramic view, dramatic sky, tiny figure in vast nature',
        '',
        '5. CẢNH HỘI THOẠI / GẶP GỠ GIỮA CÁC NHÂN VẬT:',
        '   → Over-the-shoulder shot hoặc two-shot framing',
        '   → Cả hai nhân vật trong khung, body language nói lên quan hệ của họ',
        '   → Khoảng cách giữa hai người: gần thân mật hay xa lạnh nhạt',
        '   Tag thêm: two characters facing each other, over-the-shoulder framing, body language',
        '',
        '6. CẢNH BÍ ẨN / CÚ TWIST / LỘ DIỆN:',
        '   → Dramatic lighting từ dưới lên hoặc từ bên cạnh (rim light)',
        '   → Nhân vật che mặt, quay lưng, hoặc chỉ thấy một phần',
        '   → Không khí nặng nề, màu tối, shadows bao phủ',
        '   Tag thêm: mysterious reveal shot, dramatic rim lighting, half-shadow face, ominous atmosphere',
        '',
        '7. CẢNH ĐỘT PHÁ / THĂNG CẤP / KHOẢNH KHẮC VĨ ĐẠI:',
        '   → Light explosion từ nhân vật ra ngoài, energy radiating outward',
        '   → Low angle cực thấp nhìn lên — cực kỳ awe-inspiring',
        '   → Môi trường phản ứng: đất rung, cây cỏ bay, người xung quanh lùi lại',
        '   Tag thêm: power awakening scene, radiant light burst, low angle looking up, awe-inspiring',
        '',
        '8. CẢNH ĐAU THƯƠNG / BI KỊCH / TỬ VONG:',
        '   → Mưa rơi hoặc tuyết rơi chậm, ánh sáng mờ nhạt',
        '   → Nhân vật gục xuống, ôm người khác, hoặc đứng một mình trong mưa',
        '   → Màu lạnh desaturated, high contrast tinh tế',
        '   Tag thêm: tragic farewell scene, rain falling, cold desaturated tones, heartbreaking',
        '',
        '9. CẢNH HỒI ỨC / QUÁ KHỨ / KÝ ỨC:',
        '   → Ánh sáng vàng ấm vintage, vignette viền tối xung quanh',
        '   → Hiệu ứng hơi mờ nhẹ, grain film, màu sắc wash qua filter hoài niệm',
        '   → Có thể thêm hiệu ứng đang tan biến của ký ức (edges fading)',
        '   Tag thêm: nostalgic memory scene, warm golden vintage tone, soft vignette, dreamlike blur',
        '',
        '10. CẢNH ÁC NHÂN / PHẢN DIỆN XUẤT HIỆN:',
        '    → Camera thấp nhìn lên — villain looks imposing and threatening',
        '    → Darkness behind, chỉ có rim light hoặc evil glow chiếu từ dưới',
        '    → Nụ cười lạnh, ánh mắt tàn nhẫn, aura đen áp đảo',
        '    Tag thêm: villain introduction, low angle intimidating, evil aura, dark oppressive atmosphere',
        '',
        '11. CẢNH LÃNG MẠN / TÌNH YÊU:',
        '    → Warm soft lighting, bokeh, hoa tươi hoặc cánh hoa bay',
        '    → Hai nhân vật gần nhau, ánh mắt nhìn nhau, không gian riêng tư',
        '    → Pastel colors, magical atmosphere, time feels frozen',
        '    Tag thêm: romantic intimate scene, warm soft lighting, floating petals, magical atmosphere',
        '',
        '12. CẢNH HÀI HƯỚC / NHẸ NHÀNG:',
        '    → Bright cheerful colors, expressive cartoony face reactions',
        '    → Chibi-style có thể dùng, sweat drops hoặc reaction symbols',
        '    → Light và airy atmosphere, không nặng nề',
        '    Tag thêm: lighthearted comedic scene, bright cheerful colors, expressive reactions',
        '',
        '13. CẢNH THIÊN NHIÊN THUẦN TÚY (không nhân vật):',
        '    → Dùng khi cần cảnh nghỉ/chuyển cảnh không có nhân vật',
        '    → Focus 100% vào vẻ đẹp thiên nhiên: rừng, biển, núi, bầu trời',
        '    → Atmospheric photography style, golden hour or blue hour',
        '    Tag thêm: breathtaking nature scenery, no characters, atmospheric photography, cinematic',
        '',
        '14. CẢNH VẬT PHẨM / VẬT THỂ ĐẶC BIỆT:',
        '    → Dùng khi cần nhấn mạnh một vật phẩm quan trọng trong truyện',
        '    → Close-up macro shot, dramatic lighting, vật nằm trên bề mặt phù hợp',
        '    → Ánh sáng chiếu vào vật tạo hào quang hoặc bí ẩn',
        '    Tag thêm: dramatic close-up of important item, macro detail shot, moody lighting, glowing',
        '',
        SEP80,
        'PHẦN 5 — QUY TẮC NHÂN VẬT NHẤT QUÁN (CHARACTER CONSISTENCY)',
        SEP80,
        '',
        'NGUYÊN TẮC QUAN TRỌNG NHẤT — PHẢI TUÂN THỦ TUYỆT ĐỐI:',
        'Mỗi nhân vật PHẢI được mô tả GIỐNG HỆT nhau về ngoại hình trong TOÀN BỘ file TXT.',
        'Nếu cảnh 1 nhân vật A có: medium-length black hair, sharp dark eyes, red scar on left cheek',
        '→ Thì cảnh 50 nhân vật A VẪN PHẢI CÓ: medium-length black hair, sharp dark eyes, red scar on left cheek',
        '',
        'DANH SÁCH 7 ĐIỂM PHẢI GIỮ NHẤT QUÁN:',
        '  (1) Giới tính + tuổi ngoại hình: young male, teenage female, middle-aged man',
        '  (2) Màu tóc + kiểu tóc: long wavy silver hair, short spiky black hair',
        '  (3) Màu mắt: golden amber eyes, cold grey eyes, heterochromia left-blue right-red',
        '  (4) Đặc điểm nhận diện: sẹo, nốt ruồi, birthmark, tattoo, dị dạng',
        '  (5) Trang phục đặc trưng: màu sắc, kiểu dáng, phụ kiện đặc biệt',
        '  (6) Vũ khí/đạo cụ: silver-sheathed longsword at left hip, worn leather backpack',
        '  (7) Vóc dáng: tall and lean, petite and delicate, muscular broad-shouldered',
        '',
        'QUY TRÌNH 4 BƯỚC:',
        '  Bước 1: Đọc lướt toàn bộ file — liệt kê tất cả nhân vật có [IMAGE PROMPT]',
        '  Bước 2: Xây dựng character sheet riêng cho mỗi nhân vật trong đầu',
        '  Bước 3: Lần đầu xuất hiện → mô tả đầy đủ nhất cả 7 điểm',
        '  Bước 4: Lần sau → COPY y chang 7 điểm, chỉ đổi action/pose/background',
        '',
        'VÍ DỤ NHẤT QUÁN ĐÚNG — Nhân vật Minh qua 3 cảnh:',
        '  Cảnh 1: ...young male warrior, medium-length black hair tied with white ribbon,',
        '  sharp determined dark brown eyes, lean athletic build, white hanfu with blue trim...',
        '',
        '  Cảnh 2: ...same young male warrior, medium-length black hair untied flowing in wind,',
        '  sharp determined dark brown eyes blazing with intensity, lean athletic build,',
        '  white hanfu with blue trim torn at sleeve...',
        '',
        '  Cảnh 3: ...same young male warrior, medium-length black hair loose,',
        '  sharp dark brown eyes now carrying sadness, lean athletic build, white hanfu with blue trim...',
        '',
        'VÍ DỤ SAI — TUYỆT ĐỐI KHÔNG LÀM:',
        '  Cảnh 1: ...black hair, dark eyes...',
        '  Cảnh 2: ...brown hair, blue eyes...  ← SAI! Đổi màu tóc và mắt',
        '  Cảnh 3: ...golden hair... ← SAI HOÀN TOÀN!',
        '',
        SEP80,
        'PHẦN 6 — QUY TẮC CỨNG TUYỆT ĐỐI (HARD RULES — KHÔNG ĐƯỢC VI PHẠM)',
        SEP80,
        '',
        '━━ RULE #1: KHÔNG CÓ CHỮ VIẾT TRÊN ẢNH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Mọi prompt PHẢI kết thúc bằng:',
        '  NO text, NO watermark, NO letters, NO words, NO Chinese characters, NO Japanese characters,',
        '  NO Korean characters, NO Arabic script, NO numbers, NO subtitles, NO captions,',
        '  NO UI elements, NO interface, NO logo, NO brand name, NO signature',
        '→ Lý do: GPT Image 2 tự thêm chữ Trung khi prompt có Chinese/manhwa/manhua style',
        '',
        '━━ RULE #2: TỶ LỆ KHUNG HÌNH 16:9 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Luôn thêm: horizontal landscape orientation, 16:9 aspect ratio, widescreen format',
        '→ Lý do: Video YouTube chuẩn 1920x1080, ảnh dọc sẽ bị letterbox xấu',
        '',
        '━━ RULE #3: QUALITY TAGS BẮT BUỘC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Luôn thêm: masterpiece, best quality, ultra-detailed, highly detailed, 8K resolution,',
        '  sharp focus, professional illustration, cinematic quality, award-winning artwork',
        '',
        '━━ RULE #4: KHÔNG NSFW / KHÔNG BẠO LỰC CỰC ĐỘ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Thêm khi cần: safe for work, tasteful, no explicit content, no graphic gore',
        '→ Cảnh chiến đấu: dùng dramatic battle scene thay vì mô tả chi tiết vết thương',
        '',
        '━━ RULE #5: TIẾNG ANH HOÀN TOÀN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Toàn bộ prompt phải bằng tiếng Anh, không có tiếng Việt hay ngôn ngữ khác',
        "Tên nhân vật: có thể giữ nguyên 'the warrior named Minh' hoặc 'young male protagonist'",
        '',
        '━━ RULE #6: ĐỘ DÀI PROMPT TỐI THIỂU ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Mỗi prompt tối thiểu 80 words, lý tưởng 120-180 words',
        'Quá ngắn = ảnh generic, thiếu detail → chất lượng thấp, không phù hợp truyện',
        '',
        SEP80,
        'PHẦN 7 — TEMPLATE PROMPT HOÀN CHỈNH ĐỂ COPY',
        SEP80,
        '',
        'TEMPLATE CHUẨN (điền vào [BRACKETS]):',
        '',
        '  [MODEL:gpt-image-1] [SUBJECT: tên/loại nhân vật hoặc cảnh quan],',
        '  [ACTION/POSE: hành động đang làm],',
        '  [APPEARANCE: tóc, mắt, đặc điểm, trang phục chi tiết],',
        '  [SETTING: địa điểm, thời gian, thời tiết],',
        '  [ATMOSPHERE: không khí cảm xúc, ánh sáng, màu sắc],',
        '  [CAMERA: góc máy, framing, depth of field],',
        '  [ART STYLE: phong cách phù hợp thể loại],',
        '  masterpiece, best quality, ultra-detailed, 8K resolution,',
        '  horizontal landscape orientation, 16:9 aspect ratio,',
        '  NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
        '  NO Japanese characters, NO Korean characters, NO subtitles,',
        '  NO UI elements, NO logo, NO signature',
        '',
        SEP80,
        'PHẦN 8 — HƯỚNG DẪN WORKFLOW VỚI GENSPARK AI AGENT',
        SEP80,
        '',
        'SAU KHI VIẾT XONG TẤT CẢ IMAGE PROMPT VÀO FILE TXT:',
        '',
        'BƯỚC 1 — Copy nội dung file TXT đã hoàn chỉnh',
        'BƯỚC 2 — Mở Genspark AI Agent (genspark.ai/agents) — đăng nhập tài khoản Plus',
        'BƯỚC 3 — Paste lệnh sau vào ĐẦU TIÊN (tiếng Anh để Agent hiểu rõ hơn):',
        '',
        '  -------------------------------------------------------',
        '  Read this TXT file carefully.',
        '  For each [IMAGE PROMPT] block found in the text:',
        '  1. Generate an image using GPT Image 2 with that exact prompt',
        '  2. Save the image to AI Drive with the EXACT filename',
        '     from the [FILE: ...] tag on the line right below the prompt',
        '  3. Confirm the file has been saved before processing the next scene',
        '  IMPORTANT: The saved filename MUST match scene_xxxxx.xxxs.jpg exactly.',
        '  Do NOT rename or modify the filename.',
        '  Process ALL scenes in order from top to bottom.',
        '  Here is the TXT content:',
        '  -------------------------------------------------------',
        '',
        'BƯỚC 4 — Paste toàn bộ nội dung file TXT ngay sau lệnh trên',
        'BƯỚC 5 — Chờ Agent tạo và lưu ảnh vào Drive (tự động, không cần làm gì)',
        'BƯỚC 6 — Vào AI Drive → chọn tất cả ảnh → Download → giải nén',
        'BƯỚC 7 — Upload ảnh + MP3 vào app Video Maker → ghép MP4',
        '',
        'LƯU Ý QUAN TRỌNG:',
           .  Dòng thoại [Giọng Nam]: / [Giọng Nữ]: GIỮ NGUYÊN 100%, không chỉnh sửa gì',
        '  • Tài khoản Plus = unlimited image generation (không lo hết lượt)',
        '  • Dùng GPT Image 2 cho chất lượng tốt nhất',
        '  • Nếu Agent hỏi model: chỉ định rõ GPT Image 2',
        '  • KHÔNG dùng nút Export của Genspark — nó đổi tên file ngẫu nhiên',
        '  • Luôn để Agent lưu Drive để giữ đúng tên scene_xxxxx.xxxs.jpg',
        '',
        SEP80,
        'PHẦN 9 — VÍ DỤ ĐẦY ĐỦ INPUT → OUTPUT',
        SEP80,
        '',
        'INPUT (đoạn từ file TXT):',
        '  [Dẫn Truyện]',
        '  startTime: 45.20s',
        '  → 18.30s →',
        '  [IMAGE PROMPT: CHƯA TẠO]',
        '  [FILE: scene_04520.452s.jpg]',
        '  Minh đứng trên đỉnh núi, gió thổi tung vạt áo trắng, nhìn xuống thành trì đang bốc khói.',
        '  Lòng chàng nặng trĩu — nơi đó, sư phụ đang bị giam cầm.',
        '',
        'OUTPUT ĐÚNG:',
        '  [IMAGE PROMPT: [MODEL:gpt-image-1] A young male warrior standing alone atop a jagged mountain peak,',
        '  body slightly turned as fierce wind dramatically billows white hanfu robe and hair,',
        '  medium-length black hair tied with white ribbon now loosened by the wind,',
        '  sharp determined dark brown eyes gazing with heavy sorrow at distant burning fortress below,',
        '  lean athletic build, white hanfu with blue embroidery trim, silver sword sheathed at left hip,',
        '  stone fortress city visible below with rising smoke and orange fire glow,',
        '  late afternoon dramatic storm clouds gathering, crimson and grey sky,',
        '  atmosphere of heavy resolve and painful duty, cold mountain wind,',
        '  wide shot from behind-right, subject in lower-left third, vast panoramic landscape,',
        '  Chinese wuxia manhua art style, ink-wash brush texture, dynamic wind motion,',
        '  masterpiece, best quality, ultra-detailed, 8K resolution,',
        '  horizontal landscape orientation, 16:9 aspect ratio,',
        '  NO text, NO watermark, NO letters, NO words, NO Chinese characters,',
        '  NO Japanese characters, NO Korean characters, NO subtitles,',
        '  NO UI elements, NO logo, NO signature]',
        '  [FILE: scene_04520.452s.jpg]',
        '',
        SEP80,
        'BẮT ĐẦU XỬ LÝ FILE TXT — HÃY ĐỌC TOÀN BỘ FILE TRƯỚC, SAU ĐÓ VIẾT PROMPT',
        SEP80,
        ''
    ];

    // ── BUILD NỘI DUNG 2 FILE ──
    var txtLinesPolina   = headerPolina.slice();
    var txtLinesGenspark = headerGenspark.slice();

    for (var t = 0; t < timestampLog.length; t++) {
        var entry = timestampLog[t];
        
        // Quét chữ Dẫn Truyện (Đã chuẩn hóa)
        var isNarrator = entry.voice.toLowerCase().indexOf('dẫn truyện') >= 0;

        // Dòng thoại chung cho cả 2 file
        var dialogueLine = '[' + entry.voice + ']: ' + entry.text +
                           '\n  → duration: ' + entry.duration.toFixed(3) + 's' +
                           '  → startTime: ' + entry.startTime.toFixed(3) + 's';

        // Tên file ảnh theo timestamp (dùng cho Genspark)
        var timeStr = entry.startTime.toFixed(3);
        var timeParts = timeStr.split('.');
        var secPadded = timeParts[0].padStart(5, '0');
        var fileName  = 'scene_' + secPadded + '.' + (timeParts[1] || '000') + 's.jpg';

        // ── FILE POLLINATIONS ──
        txtLinesPolina.push(dialogueLine);
        if (isNarrator) {
            txtLinesPolina.push('  [IMAGE PROMPT: CHƯA TẠO]');
        }
        txtLinesPolina.push('');

        // ── FILE GENSPARK ──
        txtLinesGenspark.push(dialogueLine);
        if (isNarrator) {
            txtLinesGenspark.push('  [IMAGE PROMPT: CHƯA TẠO]');
            txtLinesGenspark.push('  [FILE: ' + fileName + ']');
        }
        txtLinesGenspark.push('');
    }

    // Footer tổng thời lượng
    var footer = '=== TỔNG THỜI LƯỢNG: ' + runningTime.toFixed(3) + 's ===';
    txtLinesPolina.push(footer);
    txtLinesGenspark.push(footer);

    // Chuẩn hóa tên file tải xuống
    var safeTaskId = (taskId || 'chuong').toString().replace(/[^a-zA-Z0-9_\-]/g, '_');

    // ── DOWNLOAD FILE 1: POLLINATIONS ──
    var blobPolina = new Blob([txtLinesPolina.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    var urlPolina = URL.createObjectURL(blobPolina);
    var linkPolina = document.createElement('a');
    linkPolina.href = urlPolina;
    linkPolina.download = 'Prompt_Pollinations_' + safeTaskId + '.txt';
    document.body.appendChild(linkPolina);
    linkPolina.click();

    // ── DOWNLOAD FILE 2: GENSPARK (delay 1 giây chống chặn) ──
    await new Promise(r => setTimeout(r, 1000));
    var blobGenspark = new Blob([txtLinesGenspark.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    var urlGenspark = URL.createObjectURL(blobGenspark);
    var linkGenspark = document.createElement('a');
    linkGenspark.href = urlGenspark;
    linkGenspark.download = 'Prompt_Genspark_' + safeTaskId + '.txt';
    document.body.appendChild(linkGenspark);
    linkGenspark.click();

    // ── DỌN DẸP ──
    setTimeout(function() {
        document.body.removeChild(linkPolina);
        URL.revokeObjectURL(urlPolina);
        document.body.removeChild(linkGenspark);
        URL.revokeObjectURL(urlGenspark);
    }, 3000);

    console.log('📄 Đã xuất thành công 2 file TXT mẫu.');
}

