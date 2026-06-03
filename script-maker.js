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

// ── KHỐI TỪ ĐIỂN NHÂN XƯNG KHỔNG LỒ (GENDER_DICT) ─────────────────────────────
const GENDER_DICT = {
  proseMALE: [
    'hắn','lão','y','chàng','ông','anh ta','hắn ta','gã','gã ta','vị này','vị kia','người này','người kia',
    'lão già','lão nhân','đạo nhân','lão giả','lão tiên','tiên sinh','cư sĩ','đạo sĩ','hòa thượng','thiền sư',
    'chưởng môn','môn chủ','tông chủ','các chủ','điện chủ','cung chủ','thành chủ','đảo chủ','sơn chủ','trang chủ',
    'lão phu','lão đạo','bần đạo','bần tăng','tiểu tăng','đại sư','sư phụ','sư tổ','sư bá','sư thúc','sư huynh',
    'sư đệ','vị huynh','huynh đài','các hạ','túc hạ','phụ thân','cha','bố','ba','ông nội','ông ngoại','anh','anh cả',
    'anh hai','huynh trưởng','anh ấy','bạn trai','chồng','ông xã','người yêu','sếp nam','nam chính','nam phụ',
    'thiếu gia','thiếu chủ','tổng tài','giám đốc','chủ tịch','bác sĩ nam','vương gia','hoàng thượng','hoàng đế',
    'thánh thượng','thái tử','hoàng tử','vương tử','quận vương','thân vương','tướng quân','nguyên soái','đại nhân',
    'đại học sĩ','thừa tướng','tể tướng','quốc sư','pháp sư nam','công tử','lang quân','hầu gia','bá gia',
    'ông ta','ông ấy','cậu ta','cậu ấy','anh chàng','chàng trai','cậu trai','cậu bé','thằng bé','thằng nhóc',
    'thằng con trai','con trai','trai trẻ','nam sinh','nam học sinh','nam nhân','nam tử','đàn ông','người đàn ông',
    'gã đàn ông','người nam','phái nam','đấng nam nhi','trang nam tử','thiếu niên','thanh niên','trung niên nam tử',
    'ông chú','ông lão','lão đầu','lão đầu tử','lão bá','lão trượng','lão đại','đại ca','nhị ca','tam ca','tiểu ca',
    'hán tử','đại hán','tráng hán','nam tử hán','nam nhi','lang tử','lãng tử','kiếm khách','đao khách','hiệp khách',
    'du hiệp','hiệp sĩ','võ giả nam','tu sĩ nam','nam tu','đạo trưởng','chân nhân','thượng nhân','tán nhân',
    'lão tổ','lão tổ tông','lão quái','lão ma','ma đầu nam','ma quân','ma tôn','yêu vương','quỷ vương','long vương',
    'đế quân','tiên quân','thần quân','minh quân','thánh quân','quân thượng','tôn thượng','chí tôn','đại trưởng lão',
    'trưởng lão nam','hộ pháp nam','đường chủ','phân đà chủ','bang chủ','minh chủ','gia chủ','tộc trưởng','tộc chủ',
    'viện chủ','phủ chủ','thân phụ','gia phụ','nghiêm phụ','cha già','cha ruột','cha nuôi','dưỡng phụ','nghĩa phụ',
    'phụ hoàng','hoàng phụ','bố già','ba già','tía','thầy','cậu ruột','chú ruột','bác trai','dượng','dượng phụ',
    'ông bác','ông cậu','anh trai','em trai','đệ đệ','bào huynh','bào đệ','trưởng nam','thứ nam','đích tử','con trưởng',
    'con thứ','quý tử','ái tử','hiền tế','con rể','chàng rể','anh rể','em rể','cháu trai','tôn tử','ngoại tôn',
    'người chồng','chồng cô','chồng nàng','chồng bà','vị hôn phu','hôn phu','phu quân','tướng công','quan nhân',
    'lang tế','lang quân của nàng','người đàn ông của cô','bạn trai cũ','bạn trai mới','người yêu cũ của cô',
    'người yêu nam','ông chồng','đức lang quân','sếp tổng','ông chủ','nam sếp','sếp của cô','sếp của nàng',
    'tổng giám đốc','phó tổng','ceo nam','chủ tịch nam','đại thiếu gia','nhị thiếu gia','tam thiếu gia','cậu chủ',
    'ông chủ trẻ','phú nhị đại','công tử nhà giàu','nam minh tinh','nam diễn viên','nam ca sĩ','nam idol','ảnh đế',
    'nam thần','soái ca','hot boy','hotboy','nam giáo viên','thầy giáo','nam bác sĩ','nam y tá','nam cảnh sát',
    'nam luật sư','nam thư ký','nam trợ lý','nam phóng viên','nam sát thủ','nam vệ sĩ','nam quân nhân','binh sĩ nam',
    'đội trưởng nam','cảnh vệ nam','đức vua','quân vương','vua','thiên tử','hoàng thái tử','đông cung thái tử',
    'thế tử','tiểu vương gia','hoàng thúc','hoàng bá','hoàng huynh','hoàng đệ','thái thượng hoàng','nhiếp chính vương',
    'phò mã','quốc công','công gia','hầu tước','bá tước','nam tước','huyện lệnh','tri phủ','tri huyện','thượng thư',
    'đô đốc','đề đốc','thống lĩnh','đại thống lĩnh','đại tướng','võ tướng','văn thần','quan văn','quan võ','ngự sử',
    'thái phó','thái sư','thiếu sư','thiếu phó','trạng nguyên','thám hoa','bảng nhãn','cử nhân','tú tài','quốc vương',
    'hoàng đế bệ hạ','hoàng tử điện hạ','vương tử điện hạ','công tước nam','hầu tước nam','bá tước nam','tử tước nam',
    'nam tước nam','kỵ sĩ nam','phù thủy nam','ma pháp sư nam','thợ săn nam','chiến binh nam','dũng sĩ nam','vua rồng',
    'vua sói','lang vương','huyết hoàng','ma vương','quỷ đế','ổng','ảnh','anh ba','anh tư','anh năm','anh sáu','anh bảy',
    'anh tám','anh chín','anh mười','cậu nhỏ','cậu cả','cậu hai','cậu ba','cậu tư','cậu năm','cậu sáu','cậu bảy','cậu út',
    'thằng ấy','thằng đó','thằng kia','thằng nọ','thằng cha','thằng chả','thằng quỷ','thằng ranh','thằng oắt','thằng cu',
    'cu cậu','cu tí','cu bin','cu lớn','cu nhỏ','bé trai','con trai nhỏ','người con trai','người nam nhân',
    'người đàn ông ấy','người đàn ông kia','gã trai','gã thanh niên','gã trung niên','gã áo đen','gã áo trắng',
    'gã áo xanh','gã cao lớn','chàng thanh niên','chàng thiếu niên','chàng thư sinh','chàng công tử','chàng kiếm khách',
    'chàng hiệp khách','chàng trai trẻ','chàng trai ấy','chàng trai kia','nam thanh niên','nam thiếu niên',
    'nam tử trẻ tuổi','nam tử trung niên','nam tử áo đen','nam tử áo trắng','nam tử áo xanh','nam tử tuấn mỹ',
    'nam tử cao lớn','nam tử xa lạ','nam tử thần bí','nam tử lạnh lùng','mỹ nam','mỹ nam tử','tuấn nam',
    'nam tử tuấn tú','nam tử khôi ngô','nam tử anh tuấn','nam tử phong lưu','nam tử nho nhã','nam tử ôn nhu',
    'nam tử tà mị','nam nhân áo đen','nam nhân áo trắng','nam nhân trung niên','nam nhân trẻ tuổi','nam nhân xa lạ',
    'nam nhân thần bí','ông nội nó','ông ngoại nó','ông cụ','ông cụ ấy','cụ ông','cụ thân sinh','cụ thân sinh ra hắn',
    'người cha','người bố','người ba','người tía','cha hắn','cha nàng','cha cô','cha anh','cha cậu','bố hắn','bố nàng',
    'bố cô','bố anh','bố cậu','ba hắn','ba nàng','ba cô','ba anh','ba cậu','tía hắn','tía nàng','tía cô','tía anh',
    'tía cậu','người anh','người anh trai','anh trai cô','anh trai nàng','anh trai hắn','em trai cô','em trai nàng',
    'em trai hắn','đứa em trai','cậu em trai','ông anh','ông em',' chú ấy','chú ta','bác ấy','bác trai ấy','dượng ấy',
    'dượng ta','cậu ruột ấy','cậu họ','chú họ','bác họ','anh họ','em họ nam','ông chồng ấy','anh chồng','em chồng nam',
    'bố chồng','cha chồng','ba chồng','tía chồng','bố vợ','cha vợ','ba vợ','tía vợ','ông thông gia','cha dượng',
    'bố dượng','ba dượng','nam sinh ấy','nam sinh kia','cậu học sinh','học sinh nam','sinh viên nam','nam sinh viên',
    'lớp trưởng nam','lớp phó nam','hotboy trường','nam thần học đường','đàn anh','tiền bối nam','học trưởng','học đệ',
    'nam học trưởng','nam học đệ','cậu bạn cùng bàn','bạn nam cùng lớp','bạn trai cùng lớp','nam giáo sư','thầy chủ nhiệm',
    'thầy hiệu trưởng','nam hiệu trưởng','thầy giám thị','ông giám đốc','anh giám đốc','ông tổng giám đốc',
    'anh tổng giám đốc','ông chủ tịch','anh chủ tịch','ông phó tổng','anh phó tổng','ông trưởng phòng','anh trưởng phòng',
    'nam trưởng phòng','nam quản lý','nam đồng nghiệp','đồng nghiệp nam','nam nhân viên','nhân viên nam','nam khách hàng',
    'khách hàng nam','nam tài xế','tài xế nam','nam shipper','shipper nam','nam đầu bếp','đầu bếp nam','nam phục vụ',
    'phục vụ nam','nam bảo vệ','bảo vệ nam','nam quản gia','quản gia nam','nam thư ký riêng','trợ lý nam riêng',
    'nam bác sĩ phẫu thuật','nam bác sĩ tâm lý','nam nghiên cứu viên','nam khoa học gia','nam kỹ sư','kỹ sư nam',
    'nam lập trình viên','lập trình viên nam','nam hacker','hacker nam','nam cảnh sát hình sự','nam thanh tra',
    'nam điều tra viên','nam đặc vụ','đặc vụ nam','nam điệp viên','điệp viên nam','nam pháp y','pháp y nam',
    'nam thẩm phán','thẩm phán nam','nam kiểm sát viên','nam công tố viên','nam luật sư biện hộ','nam doanh nhân',
    'doanh nhân nam','ông trùm','trùm xã hội đen','đại ca giang hồ','ông chủ bang phái','nam mafia','mafia nam',
    'nam nghệ sĩ','nghệ sĩ nam','nam người mẫu','người mẫu nam','nam streamer','streamer nam','nam youtuber',
    'youtuber nam','nam vũ công','vũ công nam','nam rapper','rapper nam','nam idol quốc dân','nam thần tượng',
    'thần tượng nam','nam diễn viên chính','nam diễn viên phụ','nam ca sĩ chính','nam ca sĩ phụ','ảnh đế quốc dân',
    'nam minh tinh hàng đầu','nam binh','binh lính nam','người lính nam','anh lính','ông lính','chàng lính','nam chiến sĩ',
    'chiến sĩ nam','nam sĩ quan','sĩ quan nam','nam chỉ huy','chỉ huy nam','nam đội trưởng đặc nhiệm','đặc nhiệm nam',
    'nam lính đánh thuê','lính đánh thuê nam','nam xạ thủ','xạ thủ nam','nam tay súng','tay súng nam',
    'nam sát thủ chuyên nghiệp','sát thủ nam chuyên nghiệp','nam kiếm sĩ','kiếm sĩ nam','nam võ sĩ','võ sĩ nam',
    'nam quyền thủ','quyền thủ nam','đức ông','ông hoàng','ông hoàng tử','vị vua ấy','vị hoàng đế ấy','vị quân vương ấy',
    'vị vương gia ấy','vị thái tử ấy','vị hoàng tử ấy','vị tướng quân ấy','vị đại nhân ấy','hoàng nam','hoàng trưởng tử',
    'hoàng thứ tử','đại hoàng tử','nhị hoàng tử','tam hoàng tử','tứ hoàng tử','ngũ hoàng tử','lục hoàng tử','thất hoàng tử',
    'bát hoàng tử','cửu hoàng tử','thập hoàng tử','thập tam hoàng tử','thập tứ hoàng tử','a ca','đại a ca','nhị a ca',
    'tam a ca','tứ a ca','ngũ a ca','lục a ca','thất a ca','bát a ca','cửu a ca','thập a ca','thế tử gia','tiểu thế tử',
    'vương thế tử','quận mã','ngạch phò','phò mã gia','lão vương gia','lão hầu gia','lão quốc công','tiểu hầu gia',
    'tiểu quốc công','hầu gia trẻ tuổi','bá gia trẻ tuổi','thư sinh','nho sinh','hàn sĩ','sĩ tử','văn nhân','mưu sĩ',
    'quân sư','môn khách nam','thái y nam','ngự y nam','y quan nam','cẩm y vệ nam','thị vệ nam','ám vệ nam',
    'ngự tiền thị vệ','nam thị vệ','nam cận vệ','đại lão gia','nhị lão gia','tam lão gia','lão thái gia','thái lão gia',
    'hầu phủ thế tử','công phủ thế tử','đích trưởng tử','con trai trưởng','con trai thứ','thứ tử','con trai dòng chính',
    'con trai dòng thứ','trưởng công tử','nhị công tử','tam công tử','tứ công tử','ngũ công tử','công tử bột',
    'công tử phong lưu','công tử áo trắng','hoàng a mã','phụ hoàng đại nhân','hoàng gia gia','hoàng tổ phụ',
    'thái tử ca ca','hoàng huynh ấy','hoàng đệ ấy','vương thúc','hoàng thúc ấy','quốc cữu','cữu cữu','cậu của hoàng hậu',
    'nam tu sĩ kia','vị nam tu','nam tiên nhân','tiên nhân nam','nam chân quân','chân quân nam','nam đạo quân',
    'đạo quân nam','nam thánh nhân','thánh nhân nam','nam thần vương','thần vương nam','nam thần đế','thần đế nam',
    'nam tiên đế','tiên đế nam','nam ma đế','ma đế nam','nam yêu đế','yêu đế nam','nam quỷ đế','quỷ đế nam',
    'nam đan sư','đan sư nam','nam khí sư','khí sư nam','nam phù tu','phù tu nam','nam trận tu','trận tu nam',
    'nam kiếm tiên','kiếm tiên nam','nam đao tu','đao tu nam','nam ma tu','ma tu nam','nam yêu tu','yêu tu nam',
    'nam quỷ tu','quỷ tu nam','nam hồn sư','hồn sư nam','nam ngự thú sư','nam triệu hồi sư','nam trưởng lão ấy',
    'vị trưởng lão nam','nam hộ pháp ấy','vị hộ pháp nam','nam phong chủ','phong chủ nam','nam đường chủ','nam đàn chủ',
    'nam giáo chủ','giáo chủ nam','nam ma giáo chủ','ma giáo chủ nam','thiếu tông chủ nam','thiếu cốc chủ nam',
    'thiếu cung chủ nam','thiếu đảo chủ nam','thiếu thành chủ nam','thiếu trang chủ nam','nam ma cà rồng',
    'ma cà rồng nam','nam vampire','vampire nam','nam người sói','người sói nam','nam elf','elf nam','nam tinh linh',
    'tinh linh nam','nam bán thần','bán thần nam','nam á thần','á thần nam','nam thiên sứ','thiên sứ nam','nam ác ma',
    'ác ma nam','nam quỷ hút máu','nam phù thủy hắc ám','phù thủy hắc ám nam','nam necromancer','necromancer nam',
    'nam pháp sư vong linh','pháp sư vong linh nam','ngài công tước','ngài hầu tước','ngài bá tước','ngài tử tước',
    'ngài nam tước','ngài bá tước trẻ','quý ông','vị quý ông','vị lãnh chúa','lãnh chúa nam','đức vua cha','vua cha',
    'hoàng tử cả','hoàng tử thứ','tiểu vương tử','vị thân vương','vương công'
  ],
  proseFEMALE: [
    'nàng','cô','thị','chị','bà','mẹ','cô ta','nàng ta','bà ta','chị ta','vị nữ','cô gái','thiếu nữ',
    'cô nương','tiểu thư','phu nhân','nữ hiệp','nữ nhân','nữ đệ tử','nữ đồ đệ','sư tỷ','sư muội','nữ tông chủ',
    'nữ cung chủ','nữ chưởng môn','nữ đại sư','tiên tử','tiên nữ','nữ thần','nữ ma đầu','yêu nữ','hồ ly','ma nữ',
    'nữ cường giả','nữ tu sĩ','nữ pháp sư','mẫu thân','má','bà nội','bà ngoại','chị cả','chị hai','tỷ trưởng',
    'cô ấy','bạn gái','vợ','bà xã','người yêu nữ','nữ chính','nữ phụ','tiểu hoa đán','nữ bác sĩ','nữ giám đốc',
    'nữ tổng tài','cô chủ','tiểu cô nương','công chúa','quận chúa','vương phi','hoàng hậu','thái hậu','quý phi',
    'phi tử','mỹ nhân','giai nhân','tuyệt sắc','nữ quan','nữ tướng','pháp sư nữ','thuật sĩ nữ','kiếm khách nữ',
    'bà ấy','chị ấy','em ấy','cô nàng','nàng ấy','ả','ả ta','mụ','mụ ta','mụ già','bà lão','lão bà','lão phụ',
    'lão phu nhân','bà cụ','cô bé','bé gái','con bé','nhỏ ấy','nhỏ đó','cô gái trẻ','thiếu nữ trẻ','nữ sinh',
    'nữ học sinh','nữ tử','nữ lang','nữ nhân ấy','đàn bà','người đàn bà','người phụ nữ','phụ nữ','phái nữ',
    'hồng nhan','mỹ nữ','giai nữ','ngọc nữ','thục nữ','liệt nữ','thiếu phụ','phụ nhân','quý bà','bà chủ',
    'nữ chủ nhân','bạch y nữ tử','hồng y nữ tử','hắc y nữ tử','lam y nữ tử','cô gái áo trắng','nữ tu','nữ tu tiên',
    'tiên cô','tiên nga','tiên cơ','thánh nữ','vu nữ','nữ vu','nữ đạo sĩ','đạo cô','nữ kiếm tu','nữ kiếm khách',
    'nữ đao khách','nữ hiệp khách','nữ võ giả','nữ luyện đan sư','nữ trận pháp sư','nữ phù sư','nữ yêu',
    'yêu nữ áo đỏ','xà nữ','long nữ','hồ nữ','miêu nữ','lang nữ','nữ ma quân','nữ ma tôn','nữ yêu vương',
    'nữ quỷ vương','nữ đế','nữ hoàng','nữ vương','nữ quân vương','nữ thần quan','nữ tế ti','thánh mẫu','ma hậu',
    'yêu hậu','quỷ hậu','long hậu','thân mẫu','gia mẫu','từ mẫu','mẹ ruột','mẹ nuôi','dưỡng mẫu','nghĩa mẫu',
    'mẫu hậu','hoàng mẫu','mẫu phi','mợ','dì','dì ruột','cô ruột','thím','bác gái','bà dì','bà thím','bà mợ',
    'chị gái','em gái','muội muội','tỷ tỷ','bào tỷ','bào muội','trưởng nữ','thứ nữ','đích nữ','con gái','ái nữ',
    'quý nữ','khuê nữ','nữ nhi','cháu gái','tôn nữ','ngoại tôn nữ','chị dâu','em dâu','con dâu','nàng dâu',
    'mẹ chồng','mẹ vợ','người vợ','vợ anh','vợ hắn','vợ chàng','vợ ông','thê tử','nương tử','hiền thê','ái thê',
    'chính thê','vợ cả','vợ lẽ','thiếp thất','tiểu thiếp','vị hôn thê','hôn thê','bạn gái cũ','bạn gái mới',
    'người yêu cũ của anh','cô vợ','bà vợ','nàng vợ','nữ sếp','sếp nữ','bà chủ trẻ','cô chủ nhỏ','nữ ceo','ceo nữ',
    'nữ chủ tịch','nữ phó tổng','nữ thư ký','nữ trợ lý','nữ luật sư','nữ giáo viên','cô giáo','nữ y tá','y tá nữ',
    'nữ cảnh sát','nữ quân nhân','nữ vệ sĩ','nữ sát thủ','nữ phóng viên','nữ diễn viên','nữ ca sĩ','nữ idol',
    'nữ minh tinh','ảnh hậu','thiên hậu','tiểu hoa','hoa đán','hot girl','hotgirl','nữ thần quốc dân',
    'hoàng thái hậu','thái hoàng thái hậu','hoàng quý phi','thục phi','hiền phi','đức phi','lệ phi','phi tần',
    'tần phi','chiêu nghi','tiệp dư','quý nhân','thường tại','đáp ứng','mỹ nhân cung đình','tài nhân','cung phi',
    'cung tần','nương nương','hoàng hậu nương nương','quý phi nương nương','vương phi nương nương','thái tử phi',
    'thế tử phi','trắc phi','chính phi','thứ phi','quận vương phi','công nương','tiểu quận chúa','trưởng công chúa',
    'đại công chúa','nhị công chúa','tam công chúa','nữ quan cung đình','cung nữ','nha hoàn','thị nữ',
    'tỳ nữ thân cận','nữ tỳ','ma ma','dung ma ma','nhũ mẫu','bà vú','tú nữ','quan nữ','nữ sử','nữ công tước',
    'nữ hầu tước','nữ bá tước','nữ tử tước','nữ nam tước','công chúa điện hạ','nữ hoàng bệ hạ','hoàng hậu bệ hạ',
    'vương hậu','công nương điện hạ','nữ kỵ sĩ','phù thủy nữ','nữ phù thủy','ma nữ phương tây','nữ chiến binh',
    'nữ dũng sĩ','nữ thợ săn','bả','cổ','chỉ','em gái ấy','chị ba','chị tư','chị năm','chị sáu','chị bảy','chị tám',
    'chị chín','chị mười','cô hai','cô ba','cô tư','cô năm','cô sáu','cô bảy','cô tám','cô chín','cô út','dì hai',
    'dì ba','dì tư','dì năm','dì sáu','dì bảy','dì tám','dì chín','dì út','con nhỏ ấy','con nhỏ đó','con nhỏ kia',
    'nhỏ ấy','nhỏ kia','nhỏ này','nhỏ đó','con bé ấy','con bé kia','bé gái ấy','bé gái kia','cô bé ấy','cô bé kia',
    'người con gái','người nữ nhân','người phụ nữ ấy','người phụ nữ kia','người đàn bà ấy','người đàn bà kia',
    'cô gái ấy','cô gái kia','cô gái nhỏ','cô gái trẻ tuổi','cô gái xinh đẹp','cô gái xa lạ','cô gái thần bí',
    'cô gái áo đỏ','cô gái áo xanh','cô gái áo đen','nữ tử ấy','nữ tử kia','nữ tử trẻ tuổi','nữ tử trung niên',
    'nữ tử áo đỏ','nữ tử áo xanh','nữ tử áo đen','nữ tử áo trắng','nữ tử xinh đẹp','nữ tử tuyệt mỹ','nữ tử xa lạ',
    'nữ tử thần bí','nữ tử lạnh lùng','nữ tử ôn nhu','nữ tử quyến rũ','nữ tử yêu kiều','nữ tử thanh lệ',
    'nữ tử thanh tú','nữ nhân áo đỏ','nữ nhân áo xanh','nữ nhân áo đen','nữ nhân áo trắng','nữ nhân trẻ tuổi',
    'nữ nhân trung niên','nữ nhân xinh đẹp','nữ nhân thần bí','mỹ phụ','mỹ phụ nhân','mỹ thiếu phụ','đại mỹ nhân',
    'tuyệt thế mỹ nhân','hồng y mỹ nhân','bạch y mỹ nhân','hắc y mỹ nhân','lam y mỹ nhân','giai nhân áo trắng',
    'giai nhân áo đỏ','thiếu nữ áo trắng','thiếu nữ áo đỏ','thiếu nữ áo xanh','thiếu nữ áo đen','thiếu nữ thanh xuân',
    'tiểu mỹ nhân','tiểu yêu nữ','tiểu nha đầu','nha đầu ấy','nha đầu kia','nha đầu nhỏ','tiểu nha hoàn',
    'nha hoàn nhỏ','người mẹ','người má','người mạ','người u','mẹ hắn','mẹ nàng','mẹ cô','mẹ anh','mẹ cậu','má hắn',
    'má nàng','má cô','má anh','má cậu','mạ hắn','mạ nàng','mạ cô','mạ anh','mạ cậu','u hắn','u nàng','u cô','u anh',
    'u cậu','bu hắn','bu nàng','bu cô','bu anh','bu cậu','người chị','người chị gái','chị gái cô','chị gái nàng',
    'chị gái hắn','em gái cô','em gái nàng','em gái hắn','đứa em gái','cô em gái','bà chị','bà em','dì ấy','dì ta',
    'mợ ấy','mợ ta','cô ruột ấy','cô họ','dì họ','mợ họ','chị họ','em họ nữ','bác gái ấy','thím ấy','thím ta',
    'bà vợ ấy','chị vợ','em vợ nữ','mẹ chồng ấy','má chồng','mạ chồng','mẹ vợ ấy','má vợ','mạ vợ','bà thông gia',
    'mẹ kế','má kế','mẹ ghẻ','bà mẹ kế','bà mẹ chồng','bà mẹ vợ','nữ sinh ấy','nữ sinh kia','cô học sinh','học sinh nữ',
    'sinh viên nữ','nữ sinh viên','lớp trưởng nữ','lớp phó nữ','hotgirl trường','hoa khôi trường','hoa khôi lớp',
    'nữ thần học đường','đàn chị','tiền bối nữ','học tỷ','học muội','nữ học tỷ','nữ học muội','cô bạn cùng bàn',
    'bạn nữ cùng lớp','bạn gái cùng lớp','cô chủ nhiệm','nữ chủ nhiệm','cô hiệu trưởng','nữ hiệu trưởng',
    'cô giám thị','nữ giám thị','bà giám đốc','cô giám đốc','bà tổng giám đốc','cô tổng giám đốc','bà chủ tịch',
    'cô chủ tịch','bà phó tổng','cô phó tổng','bà trưởng phòng','cô trưởng phòng','nữ trưởng phòng','nữ quản lý',
    'nữ đồng nghiệp','đồng nghiệp nữ','nữ nhân viên','nhân viên nữ','nữ khách hàng','khách hàng nữ','nữ tài xế',
    'tài xế nữ','nữ shipper','shipper nữ','nữ đầu bếp','đầu bếp nữ','nữ phục vụ','phục vụ nữ','nữ bảo vệ','bảo vệ nữ',
    'nữ quản gia','quản gia nữ','nữ thư ký riêng','trợ lý nữ riêng','nữ bác sĩ phẫu thuật','nữ bác sĩ tâm lý',
    'nữ giáo sư','nữ nghiên cứu viên','nữ khoa học gia','nữ kỹ sư','kỹ sư nữ','nữ lập trình viên',
    'lập trình viên nữ','nữ hacker','hacker nữ','nữ cảnh sát hình sự','nữ thanh tra','nữ điều tra viên','nữ đặc vụ',
    'đặc vụ nữ','nữ điệp viên','điệp viên nữ','nữ pháp y','pháp y nữ','nữ thẩm phán','thẩm phán nữ',
    'nữ kiểm sát viên','nữ công tố viên','nữ luật sư biện hộ','nữ doanh nhân','doanh nhân nữ','bà trùm','trùm nữ',
    'nữ trùm xã hội đen','đại tỷ giang hồ','chị đại','nữ mafia','mafia nữ','nữ nghệ sĩ','nghệ sĩ nữ','nữ người mẫu',
    'người mẫu nữ','nữ streamer','streamer nữ','nữ youtuber','youtuber nữ','nữ vũ công','vũ công nữ','nữ rapper',
    'rapper nữ','nữ idol quốc dân','nữ thần tượng','thần tượng nữ','nữ diễn viên chính','nữ diễn viên phụ',
    'nữ ca sĩ chính','nữ ca sĩ phụ','ảnh hậu quốc dân','nữ minh tinh hàng đầu','tiểu hoa lưu lượng','đại hoa đán',
    'nữ hoàng giải trí','nữ binh','binh lính nữ','người lính nữ','cô lính','nữ chiến sĩ','chiến sĩ nữ','nữ sĩ quan',
    'sĩ quan nữ','nữ chỉ huy','chỉ huy nữ','nữ đội trưởng đặc nhiệm','đặc nhiệm nữ','nữ lính đánh thuê',
    'lính đánh thuê nữ','nữ xạ thủ','xạ thủ nữ','nữ tay súng','tay súng nữ','nữ sát thủ chuyên nghiệp',
    'sát thủ nữ chuyên nghiệp','nữ kiếm sĩ','kiếm sĩ nữ','nữ võ sĩ','võ sĩ nữ','nữ quyền thủ','quyền thủ nữ',
    'vị công chúa ấy','vị quận chúa ấy','vị vương phi ấy','vị hoàng hậu ấy','vị thái hậu ấy','vị quý phi ấy',
    'vị phi tử ấy','vị nương nương ấy','hoàng nữ','hoàng trưởng nữ','hoàng thứ nữ','tứ công chúa','ngũ công chúa',
    'lục công chúa','thất công chúa','bát công chúa','cửu công chúa','thập công chúa','tiểu công chúa','cách cách',
    'đại cách cách','nhị cách cách','tam cách cách','tứ cách cách','ngũ cách cách','lục cách cách','thất cách cách',
    'bát cách cách','cửu cách cách','tiểu cách cách','công chúa nhỏ','công chúa út','trưởng công chúa điện hạ',
    'đại trưởng công chúa','hoàng cô','hoàng tỷ','hoàng muội','hoàng tẩu','hoàng thẩm','thái tử phi ấy',
    'thế tử phi ấy','vương phi trẻ','trắc vương phi','chính vương phi','hầu phu nhân','quốc công phu nhân',
    'bá phu nhân','tướng quân phu nhân','thừa tướng phu nhân','tri phủ phu nhân','phu nhân nhà quan',
    'mệnh phụ phu nhân','cáo mệnh phu nhân','lão phu nhân','lão thái thái','đại phu nhân','nhị phu nhân',
    'tam phu nhân','tứ phu nhân','ngũ phu nhân','thiếu phu nhân','tiểu phu nhân','đại tiểu thư','nhị tiểu thư',
    'tam tiểu thư','tứ tiểu thư','ngũ tiểu thư','lục tiểu thư','thất tiểu thư','bát tiểu thư','cửu tiểu thư',
    'thập tiểu thư','đích trưởng nữ','con gái trưởng','con gái thứ','thứ nữ','con gái dòng chính','con gái dòng thứ',
    'khuê tú','danh môn khuê tú','tiểu thư khuê các','thư nữ','đích nữ hầu phủ','đích nữ tướng phủ','thứ nữ hầu phủ',
    'thứ nữ tướng phủ','thái hậu nương nương','thái hoàng thái hậu nương nương','hoàng quý phi nương nương',
    'thục phi nương nương','hiền phi nương nương','đức phi nương nương','lệ phi nương nương','phi nương nương',
    'tần nương nương','quý tần','thục tần','hiền tần','đức tần','lệ tần','chiêu dung','chiêu viên','tu nghi',
    'tu dung','tu viên','sung nghi','sung dung','sung viên','tiệp dư nương nương','quý nhân nương nương',
    'thường tại nương nương','đáp ứng nương nương','tài nhân nương nương','mỹ nhân nương nương','lương nhân',
    'lương đệ','nhũ nương','giáo dưỡng ma ma','quản sự ma ma','chưởng sự cô cô','cung nữ thân cận','đại cung nữ',
    'tiểu cung nữ','nữ quan thân cận','nữ tu sĩ kia','vị nữ tu','nữ tiên nhân','tiên nhân nữ','nữ chân quân',
    'chân quân nữ','nữ đạo quân','đạo quân nữ','nữ thánh nhân','thánh nhân nữ','nữ thần vương','thần vương nữ',
    'nữ thần đế','thần đế nữ','nữ tiên đế','tiên đế nữ','nữ ma đế','ma đế nữ','nữ yêu đế','yêu đế nữ','nữ quỷ đế',
    'quỷ đế nữ','nữ đan sư','đan sư nữ','nữ khí sư','khí sư nữ','nữ phù tu','phù tu nữ','nữ trận tu','trận tu nữ',
    'nữ kiếm tiên','kiếm tiên nữ','nữ đao tu','đao tu nữ','nữ ma tu','ma tu nữ','nữ yêu tu','yêu tu nữ',
    'nữ quỷ tu','quỷ tu nam','nữ hồn sư','hồn sư nữ','nữ ngự thú sư','nữ triệu hồi sư','nữ trưởng lão ấy',
    'vị trưởng lão nữ','nữ hộ pháp ấy','vị hộ pháp nữ','nữ phong chủ','phong chủ nữ','nữ đường chủ','nữ đàn chủ',
    'nữ giáo chủ','giáo chủ nữ','nữ ma giáo chủ','ma giáo chủ nữ','thiếu tông chủ nữ','thiếu cốc chủ nữ',
    'thiếu cung chủ nữ','thiếu đảo chủ nữ','thiếu thành chủ nữ','thiếu trang chủ nữ','nữ oa','tiểu nữ oa',
    'nữ hài','tiểu nữ hài','nữ ma cà rồng','ma cà rồng nữ','nữ vampire','vampire nữ','nữ người sói','người sói nữ',
    'nữ elf','elf nữ','nữ tinh linh','tinh linh nữ','nữ bán thần','bán thần nữ','nữ á thần','á thần nam',
    'nữ thiên sứ','thiên sứ nữ','nữ ác ma','ác ma nữ','nữ quỷ hút máu','nữ phù thủy hắc ám','phù thủy hắc ám nữ',
    'nữ necromancer','necromancer nữ','nữ pháp sư vong linh','pháp sư vong linh nữ','mrs','miss','ms','madam',
    'madame','lady','mademoiselle','maam','ma’am','bà smith','cô mary','cô anna','cô elizabeth','quý cô',
    'vị quý cô','quý bà','vị quý bà','phu nhân công tước','phu nhân hầu tước','phu nhân bá tước','phu nhân tử tước',
    'phu nhân nam tước','nữ lãnh chúa','lãnh chúa nữ','đức mẹ','mẫu hậu phương tây','nữ vương điện hạ','công chúa cả',
    'công chúa thứ','tiểu công nương','tiểu thư quý tộc'
  ],
  dialogMALE: [
    'huynh','đệ','bổn tọa','tiểu đệ','tại hạ','tiểu nhân','lão tử','ta đây','bổn vương','bổn tôn','bổn thiếu gia',
    'bổn công tử','bổn tướng quân','hiền muội','tiểu muội','muội muội','nàng ơi','phu nhân của ta','vợ ta','nàng ta',
    'anh nói','anh nghĩ','anh muốn','anh cần','tôi là đàn ông','mình là con trai','ta là nam nhân','ta là đàn ông',
    'ta là con trai','ta là nam tử','ta là nam nhi','ta là chồng nàng','ta là phu quân của nàng',
    'ta là tướng công của nàng','anh là đàn ông','anh là con trai','anh là chồng em','anh là bạn trai em',
    'anh là người yêu của em','chồng em đây','phu quân của nàng đây','tướng công của nàng đây','vi phu','vi phu đây',
    'lão gia ta','ông đây','bố mày','cha mày','anh đây','ca đây','đại ca đây','tiểu gia ta','bổn thiếu','bổn thiếu đây',
    'bổn thế tử','bổn điện hạ','bổn thái tử','bổn hầu','bổn quốc công','bổn vương đây','cô vương','quả nhân','trẫm đây',
    'trẫm nói','trẫm muốn','trẫm không','bản vương','bản công tử','bản thiếu gia','bản tướng','bản tọa','bản tôn',
    'bản quân','lão phu đây','lão đạo đây','bần tăng đây','bần đạo đây','tại hạ là nam nhân','nương tử',
    'nương tử à','nương tử của ta','ái thê','ái thê của ta','hiền thê','hiền thê của ta','phu nhân à',
    'phu nhân của bổn vương','nàng à','nàng nghe ta nói','nàng đừng khóc','nàng đừng sợ','nàng yên tâm','nàng tin ta',
    'nàng là của ta','muội à','muội nghe huynh nói','tiểu muội à','hiền muội à','em yêu','em nghe anh nói',
    'em đừng khóc','em đừng sợ','em là của anh','vợ à','vợ yêu','bà xã à','anh sẽ','anh biết','anh không','anh đã',
    'anh chưa','anh xin lỗi','anh thương em','anh yêu em','anh nhớ em','anh bảo rồi','anh đã nói','anh hỏi em',
    'anh đưa em','anh chở em','anh đợi em','anh cưới em','anh chịu trách nhiệm','anh nuôi em','chú nói',
    'chú biết','chú sẽ','chú không','bác trai nói','ba nói','bố nói','cha nói','tía nói','ông xã nói','chồng nói',
    'anh đây mà','anh ở đây','anh về rồi','anh tới rồi','anh đến rồi','anh đi đây','anh đi trước','anh qua đón em',
    'anh đưa em về','anh đưa em đi','anh gọi cho em','anh nhắn cho em','anh nhớ em lắm','anh yêu em nhiều',
    'anh thích em','anh muốn gặp em','anh muốn cưới em','anh muốn bảo vệ em','anh sẽ bảo vệ em','anh không bỏ em đâu',
    'anh không rời xa em','anh là của em','anh thuộc về em','anh chịu thua em rồi','anh sai rồi','anh xin lỗi em',
    'anh thương em mà','anh lo cho em','anh ghen đấy','anh ghen rồi','anh là bạn trai của em','anh là chồng của em',
    'anh là vị hôn phu của em','anh là ba của con','anh là bố của con','ba là đàn ông','bố là đàn ông','chú đây',
    'chú tới rồi','chú về rồi','chú biết rồi','chú hiểu rồi','chú xin lỗi','chú giúp cháu','bác trai đây','bác tới rồi',
    'bác biết rồi','ông đây mà','ông biết rồi','ông nói thật','ông không lừa cháu','ba đây','bố đây','cha đây',
    'tía đây','thầy đây','ba về rồi','bố về rồi','cha về rồi','tía về rồi','ba thương con','bố thương con',
    'cha thương con','tía thương con','ba xin lỗi con','bố xin lỗi con','cha xin lỗi con','bổn vương đã nói',
    'bổn vương không cho phép','bổn vương muốn nàng','bổn vương sẽ bảo vệ nàng','bản vương đã nói',
    'bản vương không cho phép','bản vương muốn nàng','bản vương sẽ bảo vệ nàng','bản thái tử','bổn điện hạ đã nói',
    'bản điện hạ đã nói','cô gia đã nói','quả nhân đã nói','trẫm đã nói','trẫm không cho phép','trẫm muốn nàng',
    'trẫm muốn khanh','trẫm phong nàng','trẫm tha tội cho nàng','trẫm không trách nàng','bổn công tử đã nói',
    'bản công tử đã nói','bổn thiếu gia đã nói','bản thiếu gia đã nói','bổn hầu đã nói','bổn quốc công đã nói',
    'bản tướng quân','bổn tướng quân đã nói','bản tướng đã nói','bổn soái đã nói','vi thần là nam nhân',
    'thần là nam nhân','mạt tướng đã rõ','mạt tướng tuân lệnh','mạt tướng lĩnh mệnh','mạt tướng không dám',
    'tại hạ xin hỏi','tại hạ cáo từ','tại hạ bái kiến','tiểu sinh xin hỏi','tiểu sinh bái kiến','ngu huynh',
    'vi huynh','vi huynh biết','vi huynh sai rồi','huynh sai rồi','huynh biết rồi','huynh sẽ bảo vệ muội',
    'huynh không bỏ muội','huynh thích muội','huynh yêu muội','lão phu biết rồi','lão phu không tin',
    'lão phu đã nói','lão phu cáo từ','lão đạo biết rồi','bần đạo xin hỏi','bần đạo cáo từ','bần tăng xin hỏi',
    'bần tăng cáo từ','lão nạp biết rồi','lão nạp xin hỏi','lão nạp cáo từ','bổn tọa đã nói','bản tọa đã nói',
    'bổn tôn đã nói','bản tôn đã nói','bổn quân đã nói','bản quân đã nói','bổn đế đã nói','bản đế đã nói',
    'bổn ma quân','bản ma quân','bổn ma tôn','bản ma tôn','bổn tiên quân','bản tiên quân','bổn thần quân',
    'bản thần quân','nương tử nghe ta nói','nương tử đừng giận','nương tử đừng khóc','nương tử yên tâm',
    'nương tử tin ta','nương tử là của ta','phu nhân nghe ta nói','phu nhân đừng giận','phu nhân đừng khóc',
    'phu nhân yên tâm','ái phi nghe trẫm nói','ái phi đừng sợ','ái phi bình thân','hoàng hậu nghe trẫm nói',
    'mẫu hậu yên tâm','mẫu phi yên tâm','muội muội nghe huynh nói','tiểu sư muội','sư muội nghe huynh nói',
    'sư tỷ nghe đệ nói','cô nương xin dừng bước','cô nương đừng sợ','tiểu thư xin dừng bước','tiểu thư đừng sợ',
    'em gái à','bé ngoan của anh','cô bé ngốc','vợ yêu nghe anh nói','bà xã nghe anh nói','anh yêu em, bảo bối',
    'ông xã của em đây','lão công của em đây','chồng của em đây','anh là lão công của em','anh là công của em',
    'ta là phu quân của ngươi','ta là đạo lữ của ngươi','vi phu sẽ bảo vệ em','vi phu sẽ bảo vệ ngươi',
    'ca thương đệ','huynh thương đệ','sư huynh thương đệ','đệ là của huynh'
  ],
  dialogFEMALE: [
    'thiếp','tiện thiếp','tiểu nữ','nô tỳ','tỳ nữ','muội','tỷ tỷ','tiểu tỷ','bổn cô nương','bổn công chúa',
    'bổn tiểu thư','tiểu muội đây','ta là nữ','ca ca ơi','huynh ơi','lang quân','phu quân','chàng ơi','anh ơi',
    'tướng quân ơi','vương gia ơi','em nói','em nghĩ','em muốn','em cần','tôi là phụ nữ','mình là con gái',
    'chị nói','chị nghĩ','ta là nữ nhân','ta là phụ nữ','ta là con gái','ta là nữ tử','ta là nữ nhi',
    'ta là vợ chàng','ta là thê tử của chàng','ta là nương tử của chàng','em là con gái','em là phụ nữ',
    'em là vợ anh','em là bạn gái anh','em là người yêu của anh','vợ anh đây','nương tử của chàng đây',
    'thiếp thân','thiếp thân đây','thần thiếp','thần thiếp biết tội','thần nữ','dân nữ','nô gia','nô gia đây',
    'nô tỳ biết tội','nô tỳ không dám','tỳ thiếp','tiện nữ','bổn cung','bản cung','bổn cung đây','ai gia',
    'ai gia đây','bổn phi','bản phi','bổn hậu','bản hậu','bổn công chúa đây','bổn quận chúa','bản quận chúa',
    'bổn tiểu thư đây','bổn cô nương đây','tiểu nữ không dám','tiểu nữ xin phép','muội đây','tỷ đây','chị đây',
    'em đây','bà đây','mẹ đây','má đây','phu quân à','phu quân ơi','tướng công à','tướng công ơi','quan nhân à',
    'quan nhân ơi','lang quân à','lang quân ơi','chàng à','chàng ơi','chàng nghe thiếp nói','chàng đừng đi',
    'chàng đừng giận','chàng tin thiếp','chàng có yêu thiếp không','huynh à','huynh nghe muội nói','ca ca à',
    'ca ca đừng đi','vương gia à','vương gia tha mạng','điện hạ tha mạng','tướng quân tha mạng','anh à',
    'anh nghe em nói','anh đừng đi','anh đừng giận','anh tin em','anh yêu em không','chồng à','chồng yêu',
    'ông xã à','em sẽ','em biết','em không','em đã','em chưa','em xin lỗi','em thương anh','em yêu anh',
    'em nhớ anh','em bảo rồi','em đã nói','em hỏi anh','em đợi anh','em muốn anh','em cần anh','em cưới anh',
    'chị sẽ','chị biết','chị không','chị đã','chị chưa','chị xin lỗi','chị thương em','chị bảo rồi','chị đã nói',
    'chị hỏi em','mẹ nói','má nói','u nói','bu nói','mợ nói','dì nói','cô nói','thím nói','bà xã nói','vợ nói',
    'em đây mà','em ở đây','em về rồi','em tới rồi','em đến rồi','em đi đây','em đi trước','em chờ anh','em đợi anh',
    'em gọi cho anh','em nhắn cho anh','em nhớ anh lắm','em yêu anh nhiều','em thích anh','em muốn gặp anh',
    'em muốn cưới anh','em muốn ở bên anh','em không bỏ anh đâu','em không rời xa anh','em thuộc về anh',
    'em chịu thua anh rồi','em sai rồi','em xin lỗi anh','em thương anh mà','em lo cho anh','em ghen đấy',
    'em ghen rồi','em là bạn gái của anh','em là vợ của anh','em là vị hôn thê của anh','em là mẹ của con',
    'em là má của con','mẹ là phụ nữ','má là phụ nữ','chị tới rồi','chị về rồi','chị biết rồi','chị hiểu rồi',
    'chị xin lỗi','chị giúp em','cô đây','cô tới rồi','cô biết rồi','dì đây','dì tới rồi','dì biết rồi',
    'mợ đây','mợ tới rồi','mợ biết rồi','thím đây','thím tới rồi','thím biết rồi','bác gái đây','bác biết rồi',
    'bà đây mà','bà biết rồi','bà nói thật','bà không lừa cháu','mạ đây','u đây','bu đây','mẹ về rồi','má về rồi',
    'mạ về rồi','u về rồi','mẹ thương con','má thương con','mạ thương con','u thương con','mẹ xin lỗi con',
    'má xin lỗi con','mạ xin lỗi con','thiếp biết rồi','thiếp hiểu rồi','thiếp không dám','thiếp sai rồi',
    'thiếp xin lỗi chàng','thiếp nhớ chàng','thiếp yêu chàng','thiếp thương chàng','thiếp là thê tử của chàng',
    'thiếp là nương tử của chàng','thần thiếp đã biết','thần thiếp không dám','thần thiếp biết tội','thần thiếp cáo lui',
    'thần thiếp tham kiến hoàng thượng','thần thiếp tham kiến bệ hạ','thần thiếp tham kiến thái hậu',
    'thần thiếp oan uổng','thần thiếp không có','bổn cung đã nói','bản cung đã nói','bổn cung không cho phép',
    'bản cung không cho phép','bổn cung mệt rồi','bản cung mệt rồi','bổn cung tha cho ngươi',
    'bản cung tha cho ngươi','ai gia đã nói','ai gia mệt rồi','ai gia không cho phép','ai gia tha cho ngươi',
    'bổn hậu đã nói','bản hậu đã nói','bổn phi đã nói','bản phi đã nói','bổn công chúa đã nói','bản công chúa đã nói',
    'bổn quận chúa đã nói','bản quận chúa đã nói','bổn tiểu thư đã nói','bản tiểu thư đã nói','bổn cô nương đã nói',
    'bản cô nương đã nói','dân nữ không dám','dân nữ biết tội','dân nữ cáo lui','tiểu nữ biết tội','tiểu nữ không hiểu',
    'tiểu nữ xin cáo lui','nô tỳ biết sai','nô tỳ đáng chết','nô tỳ cáo lui','nô tỳ tuân mệnh','nô tỳ không biết',
    'nô tỳ oan uổng','nô gia biết rồi','nô gia không dám','nô gia xin hỏi','nô gia cáo lui','tiểu muội xin hỏi',
    'tiểu muội cáo từ','ngu muội xin hỏi','ngu muội cáo từ','muội biết rồi','muội sai rồi','muội xin lỗi',
    'muội nhớ huynh','muội thích huynh','muội yêu huynh','muội sẽ chờ huynh','muội không bỏ huynh','tỷ biết rồi',
    'tỷ sai rồi','tỷ xin lỗi','tỷ sẽ bảo vệ muội','tỷ sẽ bảo vệ đệ','sư muội biết rồi','sư muội xin lỗi',
    'sư tỷ biết rồi','sư tỷ xin lỗi','bổn tiên tử đã nói','bản tiên tử đã nói','bổn nữ vương đã nói',
    'bản nữ vương đã nói','bổn nữ đế đã nói','bản nữ đế đã nói','bổn thánh nữ đã nói','bản thánh nữ đã nói',
    'bổn ma nữ đã nói','bản ma nữ đã nói','bổn yêu nữ đã nói','bản yêu nữ đã nói','phu quân nghe thiếp nói',
    'phu quân đừng giận','phu quân đừng đi','phu quân tin thiếp','tướng công nghe thiếp nói','tướng công đừng giận',
    'tướng công đừng đi','tướng công tin thiếp','chàng đừng bỏ thiếp','chàng đừng rời xa thiếp',
    'chàng là phu quân của thiếp','chàng là tướng công của thiếp','vương gia nghe thiếp nói','vương gia tha cho thiếp',
    'vương gia đừng giận','vương gia tin thiếp','hoàng thượng tha tội','bệ hạ tha tội','bệ hạ nghe thần thiếp nói',
    'điện hạ nghe thiếp nói','điện hạ tha tội','ca ca nghe muội nói','huynh nghe muội nói','sư huynh nghe muội nói',
    'sư đệ nghe tỷ nói','anh đừng bỏ em','anh đừng rời xa em','anh là người đàn ông của em','chồng nghe em nói',
    'ông xã nghe em nói','lão công nghe em nói','chị yêu em','em yêu chị','tỷ yêu muội','muội yêu tỷ','ta là của nàng',
    'em là bạn gái của chị','chị là bạn gái của em','em là vợ của chị','chị là vợ của em','nữ vương của em',
    'chị đại của em','tỷ tỷ của muội','muội muội của tỷ'
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

// Hàm đọc file .docx và tách danh sách chương truyện
// Hàm đọc file .docx và tách danh sách chương truyện
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
          alert('Không tìm thấy chương nào đúng định dạng "Chương [số]". Vui lòng kiểm tra lại file Word.');
          return;
        }
        
        globalScriptChapters = chapters;
        var fromSel = document.getElementById('chapFromScript');
        var toSel = document.getElementById('chapToScript');
        if (!fromSel || !toSel) return;
        
        fromSel.innerHTML = '';
        toSel.innerHTML = '';
        
        chapters.forEach(function(ch, idx) {
          var label = ch.substring(0, 40).trim() + '...';
          var optHtml = '<option value="' + idx + '">[' + (idx + 1) + '] ' + label + '</option>';
          fromSel.innerHTML += optHtml;
          toSel.innerHTML += optHtml;
        });
        
        toSel.selectedIndex = chapters.length - 1;
        fromSel.disabled = false;
        toSel.disabled = false;
        
        // ========================================================
        // ĐOẠN CODE MỚI CHÈN VÀO ĐÂY: Bật và gán giá trị ô nhập số
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
        alert('Đã nạp thành công ' + chapters.length + ' chương từ file Word! Hãy thiết lập mẻ chờ.');
      })
      .catch(function(err) {
        alert('Lỗi giải nén tài liệu Word: ' + err.message);
      });
  };
  reader.readAsArrayBuffer(file);
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
    alert('Vui lòng điền hoặc dán văn bản truyện vào ô Văn bản gốc trước!');
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
      alert('AI đã quét từ điển nhân xưng và hoàn tất phân vai hội thoại cục bộ!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
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
        alert("Lỗi: Chương bắt đầu phải nhỏ hơn hoặc bằng chương kết thúc!");
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

// Nút "CHẠY DỰNG KỊCH BẢN"
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
            combinedScript += processedText + '\n\n';
        }

        // Tự động tải file .txt xuống máy
        var fileName = 'KichBan_Tu_Chuong_' + (batch.from + 1) + '_Den_' + (batch.to + 1) + '.txt';
        downloadTextFile(fileName, combinedScript);
        
        batch.status = 'Đã xong ✅';
        document.getElementById('status-script-' + batch.id).innerText = batch.status;
        document.getElementById('status-script-' + batch.id).style.color = '#10b981';
    }
    
    this.disabled = false;
    this.innerHTML = '<span class="material-icons">play_circle</span> CHẠY DỰNG KỊCH BẢN';
    alert("Tuyệt vời! Đã phân vai xong toàn bộ hàng đợi và tải file .txt về máy.");
});

// Hàm hỗ trợ tải file TXT
function downloadTextFile(filename, text) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var link = document.createElement("a");
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
