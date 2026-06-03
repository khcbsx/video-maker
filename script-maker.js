// ==============================================================================
// TRỢ LÝ KỊCH BẢN AI - SCRIPT MAKER ENGINE (Giai đoạn 1 & 2: Phân vai & Đọc Word)
// ==============================================================================

'use strict';

// ── CẤU HÌNH GIỌNG ĐỌC MẶC ĐỊNH CHO TAB KỊCH BẢN ──────────────────────────────
const SCRIPT_TAB_VOICES = [
  { n: 'Người Dẫn Truyện (Edge)', g: 'male',   isEdge: true, edgeName: 'vi-VN-NamMinhNeural', defaultRate: 0.82 },
  { n: 'Nam Minh (Edge)',          g: 'male',   isEdge: true, edgeName: 'vi-VN-NamMinhNeural', defaultRate: 1.00 },
  { n: 'Hoài My (Edge)',           g: 'female', isEdge: true, edgeName: 'vi-VN-HoaiMyNeural',  defaultRate: 1.00 }
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

// Hàm đọc file .docx và tách danh sách chương truyện (ĐÃ TỐI ƯU SIÊU TỐC)
function handleWordUploadScript(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    window.mammoth.extractRawText({ arrayBuffer: e.target.result })
      .then(function(result) {
        // Tách chương theo biểu thức chính quy chuẩn xác của bạn
        var chapters = result.value.split(/\n(?=Chương\s+\d+)/i).filter(function(c) { return c.trim().length > 100; });
        if (chapters.length === 0) {
          showToast('error', 'Không tìm thấy chương nào đúng định dạng "Chương [số]". Vui lòng kiểm tra lại file Word.');
          return;
        }
        
        globalScriptChapters = chapters;
        var fromSel = document.getElementById('chapFromScript');
        var toSel = document.getElementById('chapToScript');
        if (!fromSel || !toSel) return;
        
        // ==========================================
        // TỐI ƯU HÓA: Gộp chuỗi HTML thay vì vẽ lại nhiều lần
        // ==========================================
        var optionsHTML = '';
        chapters.forEach(function(ch, idx) {
          var label = ch.substring(0, 40).trim() + '...';
          optionsHTML += '<option value="' + idx + '">[' + (idx + 1) + '] ' + label + '</option>';
        });
        
        // Dán 1 lần duy nhất vào DOM (Chống đơ trình duyệt)
        fromSel.innerHTML = optionsHTML;
        toSel.innerHTML = optionsHTML;
        // ==========================================
        
        toSel.selectedIndex = chapters.length - 1;
        fromSel.disabled = false;
        toSel.disabled = false;
        
        // ========================================================
        // Bật và gán giá trị ô nhập số
        // ========================================================
        var inFrom = document.getElementById('inputChapFrom');
        var inTo = document.getElementById('inputChapTo');
        if (inFrom && inTo) {
            inFrom.disabled = false;
            inTo.disabled = false;
            inFrom.max = chapters.length;
            inTo.max = chapters.length;
            
            inFrom.value = 1; // Mặc định gõ sẵn số 1 (Chương 1)
            inTo.value = chapters.length; // Mặc định gõ sẵn số chương cuối cùng
        }
        // ========================================================
        
        var btnAdd = document.getElementById('btnAddScriptQueue');
        if (btnAdd) {
          btnAdd.disabled = false;
          btnAdd.style.opacity = '1';
        }
        showToast('success', 'Đã nạp thành công ' + chapters.length + ' chương từ file Word!');
      })
      .catch(function(err) {
        showToast('error', 'Lỗi giải nén tài liệu Word: ' + err.message);
      });
  };
  reader.readAsArrayBuffer(file);
}

// ==============================================================================
// BỘ MÁY DÒ TÌM GIỚI TÍNH CỤC BỘ (CORE ENGINE) - NÂNG CẤP ĐỘ ƯU TIÊN
// ==============================================================================
function detectGenderLocal(dialogText, proseContext) {
    var text = (dialogText || '').toLowerCase();
    var prose = (proseContext || '').toLowerCase();
    
    function hasWord(src, wordList) {
        if (!wordList) return false;
        for (var i = 0; i < wordList.length; i++) {
            var w = wordList[i].toLowerCase();
            var regex = new RegExp('(^|[\\s,\\.!?;:\\-"\'`\\[\\](){}])' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '($|[\\s,\\.!?;:\\-"\'`\]{}())', 'i');
            if (regex.test(src)) return true;
        }
        return false;
    }

    // 1. Kiểm tra Lời dẫn (Prose) - Độ tin cậy: SURE
    if (prose.length > 0) {
        // Kiểm tra xem từ nào xuất hiện cuối cùng (gần câu thoại nhất)
        var lastMaleIdx = prose.lastIndexOf(GENDER_DICT.proseMALE.find(w => prose.includes(w))); // Logic đơn giản hóa
        // Tuy nhiên, dùng logic ưu tiên từ điển của bạn:
        if (hasWord(prose, GENDER_DICT.proseMALE)) return { gender: 'male', confidence: 'sure' };
        if (hasWord(prose, GENDER_DICT.proseFEMALE)) return { gender: 'female', confidence: 'sure' };
    }

    // 2. Kiểm tra Trong lời thoại (Dialog) - Độ tin cậy: LIKELY
    if (hasWord(text, GENDER_DICT.dialogFEMALE)) return { gender: 'female', confidence: 'likely' };
    if (hasWord(text, GENDER_DICT.dialogMALE)) return { gender: 'male', confidence: 'likely' };

    // 3. Mặc định - Độ tin cậy: UNCERTAIN -> Gán giọng Nam Minh (Mặc định của bạn)
    return { gender: 'male', confidence: 'uncertain' };
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

// Hàm cốt lõi vận hành luồng phân vai cục bộ bằng từ điển (Tra cứu không tốn token)
async function runScriptAutomation(rawText, taskId) {
  var vNarEl = document.getElementById('voiceNarrator');
  var vMalEl = document.getElementById('voiceMale');
  var vFemEl = document.getElementById('voiceFemale');
  
  var voiceNarrator = vNarEl ? vNarEl.value.trim() : 'Người Dẫn Truyện (Edge)';
  var voiceMale     = vMalEl ? vMalEl.value.trim() : 'Nam Minh (Edge)';
  var voiceFemale   = vFemEl ? vFemEl.value.trim() : 'Hoài My (Edge)';
  
  var lines = rawText.split('\n');
  var taggedLines = [];
  var contextWindow = ''; // Cửa sổ tích lũy ngữ cảnh 300 ký tự

  for (var i = 0; i < lines.length; i++) {
    if (isStopRequested) throw new Error('⛔ Tiến trình đã bị dừng theo lệnh người dùng.');
    var line = lines[i];

    if (line.trim() === '') {
      taggedLines.push('');
      continue;
    }

    var parts = splitLineToParts(line);

    for (var k = 0; k < parts.length; k++) {
      var part = parts[k];

      if (part.type === 'prose') {
        taggedLines.push('[' + voiceNarrator + ']: ' + part.text);
        // Lưu trữ ngữ cảnh động để phục vụ phân tích lời thoại tiếp theo
        contextWindow = (contextWindow + ' ' + part.text).slice(-300);
      } else {
        // Gom toàn bộ văn xuôi liền kề trước và sau câu thoại để làm sạch dữ liệu đầu vào
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

// Hiển thị danh sách hàng đợi ra bảng
function renderScriptQueue() {
    var tbody = document.getElementById('scriptQueueBody');
    tbody.innerHTML = '';
    
    if (scriptQueue.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Chưa có mẻ nào. Tải Word và thêm vào hàng đợi.</td></tr>';
        document.getElementById('btnStartScript').style.display = 'none';
        return;
    }
    
    scriptQueue.forEach(function(b, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Mẻ ${index + 1}</td>
            <td>Chương ${b.from + 1} đến Chương ${b.to + 1}</td>
            <td id="status-script-${b.id}" style="color: #eab308; font-weight: 600;">${b.status}</td>
            <td>--</td>
            <td style="text-align:center;">
                <span class="material-icons" style="color:#ef4444; cursor:pointer;" onclick="removeScriptBatch(${b.id})">delete</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Xóa một mẻ khỏi hàng đợi
window.removeScriptBatch = function(id) {
    scriptQueue = scriptQueue.filter(function(b) { return b.id !== id; });
    renderScriptQueue();
}

// Nút "CHẠY DỰNG KỊCH BẢN" (Đã nâng cấp xuất file .docx)
document.getElementById('btnStartScript').addEventListener('click', async function() {
    this.disabled = true;
    this.innerHTML = '<span class="material-icons">hourglass_top</span> ĐANG XỬ LÝ...';
    
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
            combinedScript += processedText + '\n\n'; // Cách nhau 1 dòng giữa các chương
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
