/**
 * KOBO IMPORTER v7.1 — كل المحافظات + تتبع الاعتماد
 * ==================================================
 * - Arabic maps hardcoded (الكمال)
 * - Incremental by _id (للجديد)
 * - Full sync كل 48 ساعة (لتحديث الاعتماد)
 * - Pagination 6000/batch write
 * - 3 sheets: التسجيلات | التفعيلات | ملخص
 */

var SPREADSHEET_ID = '10-kfVFDZwfMUzigxim5hnoZgLGpoRtUKIX-FyirRsrg';
var ASSET_UID      = 'a7PGdw9HKAPSbQnRDqcaBY';
var API_TOKEN      = 'c11e9a852cbac05d330706a8c57a767cef69d39b';
var KOBO_BASE      = 'https://eu.kobotoolbox.org';
var PAGE_SIZE      = 6000;
var LAST_ID_KEY    = 'KOBO_LAST_ID_V7';
var LAST_FULL_SYNC = 'KOBO_FULL_SYNC_TIME';

// =============================================================
// خرائط الترجمة العربية (هارده كود)
// =============================================================

var GOVS = {
  EGY01: 'القاهره', EGY02: 'الاسكندريه', EGY03: 'بورسعيد',
  EGY04: 'السويس', EGY11: 'دمياط', EGY12: 'الدقهليه',
  EGY13: 'الشرقيه', EGY14: 'القليوبيه', EGY15: 'كفر الشيخ',
  EGY16: 'الغربيه', EGY17: 'المنوفيه', EGY18: 'البحيره',
  EGY19: 'الاسماعيليه', EGY21: 'الجيزه', EGY22: 'بنى سويف',
  EGY23: 'الفيوم', EGY24: 'المنيا', EGY25: 'اسيوط',
  EGY26: 'سوهاج', EGY27: 'قنا', EGY28: 'اسوان',
  EGY29: 'الاقصر', EGY31: 'البحر الاحمر', EGY32: 'الوادي الجديد',
  EGY33: 'مطروح', EGY34: 'شمال سيناء', EGY35: 'جنوب سيناء'
};

var PLACE_MAP = {
  Main: 'فاعلية مركزية', Office: 'داخل مقر المكتب / الجمعية',
  City: 'أحد مراكز المحافظة', Village: 'أحد قرى المحافظة',
  Online: 'Online', central_office: 'المقر المركزي للمؤسسة'
};

var ACT_MAP = {
  Attracting_receiving: 'جذب واستقبال المتطوعين',
  Regular_meetings: 'اجتماعات دورية', training: 'تدريبات',
  Research_interviews: 'أبحاث ومقابلات', Implementing_interventions: 'تنفيذ تدخلات',
  Clothing_exhibitions: 'معارض الملابس', Medical_convoys: 'قوافل طبية',
  Events: 'الفعاليات (أنشطة - زيارات - مهرجان الاضاحي - تبرع بالدم - إفطارات - حفلات)',
  Literacy: 'محو الأمية', Teaching_children: 'تعليم الأطفال',
  Awareness: 'توعية', Raising_settlements: 'رفع التسويات',
  Follow_evaluation: 'متابعة وتقييم', fundraising: 'التمويل',
  Communicate_support: 'تواصل ودعم', Line_up: 'اصطفاف',
  Technical_Support: 'Technical Support (IT, Social Media, Data Entry, Data Anaysis, Photography)', leadership_tasks: 'الإشراف والمتابعات الدورية',
  feeding: 'إطعام', Logistics_activities: 'أنشطة لوجيستية', Activate_volunteers: 'تفعيل المتطوعين'
};

var ITEM_MAP = {
  item_1: 'عضو مجلس إدارة المتطوعين', item_2: 'معاون مجلس إدارة المتطوعين',
  item_3: 'الفريق المركزي', item_4: 'منسق محافظة', item_5: 'مكالمات',
  item_6: 'جذب المتطوعين', item_7: 'استقبال المتطوعين', item_8: 'تسكين المتطوعين على الانشطة',
  item_9: 'اجتماع بورد المحافظة', item_10: 'اجتماع الهيكل التنفيذي', item_11: 'زيارات المراكز',
  item_12: 'اجتماع فريق', item_13: 'تنظيم', item_14: 'مدرب', item_15: 'متدرب',
  item_16: 'Initial Form', item_17: 'Intake Form', item_18: 'Campaign Form',
  item_19: 'اتفاقات', item_20: 'رفع قرية', item_21: 'Intake فلسطين',
  item_22: 'أستمارة إعادة الدمج', item_23: 'EU Childrens', item_24: 'EU Adults',
  item_25: 'استمارة اللاجئين', item_26: 'أسقف', item_27: 'اطعام', item_28: 'اعانة مالية',
  item_29: 'أغطية', item_30: 'تجهيز عروسة', item_31: 'ترميم منزل', item_32: 'جهاز تعويضي',
  item_33: 'جهاز كهربائي', item_34: 'دفع ايجار', item_35: 'سداد دين', item_36: 'سلة غذائية',
  item_37: 'شنط مدرسية', item_38: 'عملية جراحية', item_39: 'كرتونة غذائية', item_40: 'كسوة',
  item_41: 'كفالة تعليمية', item_42: 'كفالة صحية', item_43: 'زيارة مع مريض', item_44: 'صرف روشتات',
  item_45: 'كفالة يتيم', item_46: 'لحوم أضاحي', item_47: 'مستلزمات مسكن', item_48: 'مشروع صغير',
  item_49: 'مفروشات', item_50: 'زكاة فطر', item_51: 'وصلة مياه',
  item_52: 'تدخلات الحماية SGBV', item_53: 'الدعم النفسي', item_54: 'الدعم القانوني',
  item_55: 'خدمات تعليمية', item_56: 'تدريبات مهنية', item_57: 'تحصيل الملابس',
  item_58: 'فرز الملابس', item_59: 'تنفيذ معرض ملابس', item_60: 'توريد عائد المعارض',
  item_61: 'صيدلية', item_63: 'كشف', item_64: 'أنشطة دمج أحسن صاحب',
  item_65: 'زيارة دار أيتام', item_66: 'زيارة دار مسنين', item_67: 'زيارة مستشفي',
  item_68: 'تبرع بالدم', item_69: 'دوبامين', item_70: 'أنشطة الأطفال',
  item_71: 'إفطارات صناع الحياة', item_72: 'حفلات المحافظات', item_73: 'مهرجان الأضاحي',
  item_74: 'أنشطة ترفيهية وتحفيزية', item_75: 'نشاط الأطفال', item_76: 'جذب الاميين',
  item_77: 'تدريب الميسرين', item_78: 'فتح الفصول', item_79: 'إستكتاب', item_80: 'إمتحانات فورية',
  item_81: 'توفير فرص وظيفية', item_82: 'توعية صحية', item_83: 'توعية بيئية', item_84: 'توعية عامة',
  item_85: 'تسويات', item_86: 'زيارات ميدانية', item_87: 'تبرعات مالية', item_88: 'تبرعات عينية',
  item_89: 'الحملات الميدانية', item_90: 'اتفاقات وشراكات', item_91: 'حل مشاكل',
  item_92: 'رسائل شكر', item_93: 'رسائل عامة', item_94: 'رسائل تهنئة',
  item_95: 'زدني (تعليم اساسيات الدين)', item_96: 'تنمية مهارات', item_97: 'تعديل سلوك',
  item_98: 'تكميلي', item_99: 'IT', item_100: 'Graphic Design', item_101: 'Video Editing',
  item_102: 'Digital Marketing', item_103: 'Data Entry', item_104: 'Data Analysis',
  item_105: 'Photography', item_106: 'Content writing', item_107: 'Moderation',
  item_108: 'Voice over', item_109: 'مراجعة أبحاث', item_110: 'survey',
  item_111: 'Documentation', item_112: 'Quality control', item_113: 'استلام وجبات',
  item_114: 'توزيع وجبات', item_115: 'تجهيز لوجستيك', item_116: 'استلام لوجستيك',
  item_117: 'توزيع لوجستيك', item_118: 'مطبخ خيري', item_119: 'متابعة التسجيلات',
  item_120: 'تأكيد التسجيلات', item_121: 'تبادل الخبرات'
};

var PROJ_MAP = {
  Project_1: 'أحسن صاحب', Project_2: 'التنمية الشاملة طما', Project_3: 'التنمية الشاملة قفط',
  Project_4: 'Plan', Project_5: 'الطوارئ', Project_6: 'المساعدات الانسانية',
  Project_7: 'الاحتياجات الاساسية', Project_8: 'فلسطين', Project_9: 'رزق حلال',
  Project_10: 'دار وسلامة', Project_11: 'نور حياتهم', Project_12: 'عيش وملح',
  Project_13: 'Duke', Project_14: 'قدوة', Project_15: 'أتجنن', Project_16: 'إنسان',
  Project_17: 'تنمية المتطوعين', Project_18: 'نشاط داخلي خاص بالمكتب / الجمعية',
  Project_19: 'التمويل المركزي', Project_20: 'مجلس ادارة المتطوعين',
  Project_21: 'رابطة اسر الجامعات المصرية', Project_22: 'جذب واستقبال المتطوعين',
  Project_23: 'إدارة الحالة', Project_24: 'sawa - سوا', Project_25: 'UNCHR',
  Project_26: 'Frontex', Project_27: 'قوافل داخلية خاصة بالمكتب / الجمعية',
  Project_28: 'قوافل التحالف', Project_29: 'قوافل التضامن', Project_30: 'قوافل تحيا مصر',
  Project_31: 'دشنا', Project_32: 'الجمعية', Project_33: 'متابعة وتقييم مركزي',
  Project_34: 'النخيل', Project_35: 'الغسيل الكلوي', Project_36: 'السنتر التعليمي',
  Project_37: 'قوافل غزة', Project_38: 'NRC', Project_39: 'حصاد المستقبل',
  Project_40: 'step forword - خطوات للأمام', Project_41: 'قوافل تساهيل الطبية',
  Project_42: 'جرين جين', Project_43: 'مراكز تنمية الأسرة والطفل'
};

var CAMP_MAP = {
  Campaign_1: 'حملة الشتاء', Campaign_2: 'حملة رمضان',
  Campaign_3: 'حملة الأضاحي', Campaign_4: 'حملة المدارس'
};

var UNIV_MAP = {
  University_0: 'فريق اللجان المركزية', University_1: 'جامعة القاهرة',
  University_2: 'جامعة بنها', University_3: 'جامعة MTI', University_4: 'جامعة الأزهر',
  University_5: 'جامعة بني سويف', University_6: 'جامعة المنيا', University_7: 'جامعة جنوب الوادي',
  University_8: 'جامعة سوهاج', University_9: 'جامعة أسوان', University_10: 'جامعة قناة السويس',
  University_11: 'جامعة السويس', University_12: 'جامعة معهد العاشر من رمضان',
  University_13: 'جامعة طنطا', University_14: 'جامعة معهد العاشر بمطروح',
  University_15: 'جامعة المنصوره', University_16: 'جامعة المنوفية', University_17: 'جامعة السادات',
  University_18: 'جامعة الريادة', University_19: 'جامعة اسكندرية', University_20: 'جامعة أسيوط',
  University_21: 'جامعة eelu', University_22: 'جامعة سفنكس', University_23: 'جامعة الأزهر بالأقصر',
  University_24: 'جامعة الأزهر بتفهنا الأشراف', University_25: 'جامعة مطروح',
  University_26: 'جامعة الوادي الجديد', University_27: 'جامعة الأقصر الحكومية',
  University_28: 'جامعة الأقصر الأهلية', University_29: 'جامعة سيناء', University_30: 'جامعة العريش',
  University_31: 'جامعة EST', University_32: 'جامعة طيبة التكنولوجية',
  University_33: 'معهد القاهرة العالى الجديد', University_34: 'جامعة اللوتس',
  University_35: 'المعهد التكنولوچى العالى للعلوم التطبيقية',
  University_36: 'المعهد العالى للخدمة الإجتماعية باسوان', University_37: 'جامعة الأهرام الكندية',
  University_38: 'المعهد العالي للهندسة بالأقصر', University_39: 'جامعة المنوفية الأهلية',
  University_40: 'جامعة المنصورة الاهلية', University_41: 'جامعة الزقازيق',
  University_42: 'جامعة Merit', University_43: 'جامعة عين شمس',
  University_44: 'معهد الخدمة الاجتماعية بقنا', University_45: 'جامعة قنا',
  University_46: 'جامعة الأزهر فرع أسيوط'
};

var TEAM_MAP = {
  Team1: 'بداية', Team2: 'الطرح', Team3: 'العامرية', Team4: 'البصرة',
  Team5: 'جود', Team6: 'ومن أحياها', Team7: 'مجددون', Team8: 'قادمون',
  Team9: 'فرصة تغيير', Team10: 'كلنا', Team11: 'العجمي', Team12: 'أثر باق',
  Team13: 'فاتبعوني', Team14: 'واحد'
};

var UNIT_MAP = {
  unit1: 'وحدة المتابعة والتقييم', unit2: 'وحدة مجتمع صناع الحياة',
  unit3: 'وحدة التفعيل', unit4: 'وحدة التنمية', unit5: 'وحدة الجذب والإستقبال',
  unit6: 'وحدة الإبتكار والتطوير', unit7: 'وحدة أسر صناع الحياة بالجامعات',
  unit8: 'وحدة المنسقين', unit9: 'وحدة داعم', unit10: 'الميديا المركزي'
};

var CITY_MAP = {
  EGY0101: 'مدينه القاهره الجديدة', EGY0102: 'مدينه نصر',
  EGY0103: 'حى التبين', EGY0104: 'مدينه حلوان',
  EGY0105: 'حى المعصره', EGY0106: 'مدينه 15 مايو',
  EGY0107: 'حى طره', EGY0108: 'حى المعادى',
  EGY0109: 'حى البساتين', EGY0110: 'حى دار السلام',
  EGY0111: 'حى مصر القديمه', EGY0112: 'حى السيده زينب',
  EGY0113: 'حى الخليفه', EGY0114: 'حى المقطم',
  EGY0115: 'حى منشاه ناصر', EGY0116: 'حى الدرب الاحمر',
  EGY0117: 'حى الموسكى', EGY0118: 'حى عابدين',
  EGY0119: 'حى قصر النيل', EGY0120: 'حى الزمالك',
  EGY0121: 'حى بولاق', EGY0122: 'حى الازبكيه',
  EGY0123: 'حى باب الشعريه', EGY0124: 'حى الجماليه',
  EGY0125: 'حى الظاهر', EGY0126: 'حى الوايلى',
  EGY0127: 'حى حدائق القبه', EGY0128: 'حى الشرابيه',
  EGY0129: 'حى شبرا', EGY0130: 'حى روض الفرج',
  EGY0131: 'حى الساحل', EGY0132: 'حى الزاويه الحمراء',
  EGY0133: 'حى الاميريه', EGY0134: 'حى الزيتون',
  EGY0135: 'حى المطريه', EGY0136: 'مدينه عين شمس',
  EGY0137: 'حى المرج', EGY0138: 'مدينه السلام',
  EGY0139: 'حى النزهه', EGY0140: 'حى مصر الجديده',
  EGY0141: 'مدينه الشروق', EGY0142: 'مدينه بدر',
  EGY0201: 'حى المنتزه', EGY0202: 'حى الرمل',
  EGY0203: 'حى سيدى جابر', EGY0204: 'حى باب شرقي',
  EGY0205: 'حى العطارين', EGY0206: 'حى محرم بك',
  EGY0207: 'حى كرموز', EGY0208: 'حى اللبان',
  EGY0209: 'حى المنشيه', EGY0210: 'حى الجمرك',
  EGY0211: 'حى مينا البصل', EGY0212: 'حى الدخيله',
  EGY0213: 'حى العامريه', EGY0214: 'مدينه برج العرب',
  EGY0215: 'مدينه الساحل الشمالى',
  EGY0301: 'مدينه بورفؤاد', EGY0302: 'حي مبارك',
  EGY0303: 'حى الشرق', EGY0304: 'حى العرب',
  EGY0305: 'حى المناخ', EGY0306: 'حى الضواحى',
  EGY0307: 'حى الزهور', EGY0308: 'حى المناصره',
  EGY0309: 'حى الجنوب',
  EGY0401: 'مدينه السويس', EGY0402: 'مدينه الاربعين',
  EGY0403: 'مدينه عتاقه', EGY0404: 'مدينه فيصل',
  EGY0405: 'مدينه الجناين',
  EGY1101: 'مدينه دمياط', EGY1102: 'مدينه دمياط الجديده',
  EGY1103: 'مركز دمياط', EGY1104: 'مركز فارسكور',
  EGY1105: 'مركز الزرقا', EGY1106: 'مركز كفر سعد',
  EGY1107: 'مركز كفر البطيخ', EGY1108: 'مدينه راس البر',
  EGY1201: 'مدينه المنصوره', EGY1202: 'مركز المنصوره',
  EGY1203: 'مركز اجا', EGY1204: 'مركز ميت غمر',
  EGY1205: 'مركز السنبلاوين', EGY1206: 'مركز تمى الامديد',
  EGY1207: 'مركز بنى عبيد', EGY1208: 'مركز محله دمنه',
  EGY1209: 'مركز دكرنس', EGY1210: 'مركز منيه النصر',
  EGY1211: 'مدينه الكردى', EGY1212: 'مركز ميت سلسيل',
  EGY1213: 'مركز الجماليه', EGY1214: 'مركز المنزله',
  EGY1215: 'مركز المطريه', EGY1216: 'مركز شربين',
  EGY1217: 'مدينه جمصه', EGY1218: 'مركز طلخا',
  EGY1219: 'مركز نبروه', EGY1220: 'مركز بلقاس',
  EGY1301: 'مدينه الزقازيق', EGY1302: 'مركز الزقازيق',
  EGY1303: 'مدينه القنايات', EGY1304: 'مركزمنيا القمح',
  EGY1305: 'مركز مشتول السوق', EGY1306: 'مركز بلبيس',
  EGY1307: 'مدينه العاشر من رمضان', EGY1308: 'مركز ابو حماد',
  EGY1309: 'مركزههيا', EGY1310: 'مركز ديرب نجم',
  EGY1311: 'مركز الابراهيميه', EGY1312: 'مركز ابو كبير',
  EGY1313: 'مركز كفر صقر', EGY1314: 'مركز اولاد صقر',
  EGY1315: 'مركز صان الحجر', EGY1316: 'مركز منشاه ابوعمر',
  EGY1317: 'مركز الحسينيه', EGY1318: 'مركز فاقوس',
  EGY1319: 'مدينه القرين', EGY1320: 'مدينه الصالحيه الجديده',
  EGY1401: 'مدينه بنها', EGY1402: 'مركز بنها',
  EGY1403: 'مركز كفر شكر', EGY1404: 'مركز طوخ',
  EGY1405: 'مدينه قها', EGY1406: 'مركز القناطر الخيريه',
  EGY1407: 'مركز قليوب', EGY1408: 'مدينه شبرا الخيمه',
  EGY1409: 'مدينه الخصوص', EGY1410: 'مركز شبين القناطر',
  EGY1411: 'مركز الخانكه', EGY1412: 'مدينه العبور',
  EGY1501: 'مدينه كفر الشيخ', EGY1502: 'مركز كفر الشيخ',
  EGY1503: 'مركز الرياض', EGY1504: 'مركز الحامول',
  EGY1505: 'مركز بيلا', EGY1506: 'مركز البرلس',
  EGY1507: 'مركز مطوبس', EGY1508: 'مركز فوه',
  EGY1509: 'مركز سيدى سالم', EGY1510: 'مركز دسوق',
  EGY1511: 'مركز قلين',
  EGY1601: 'مدينه طنطا', EGY1602: 'مركز طنطا',
  EGY1603: 'مركز السنطه', EGY1604: 'مركز زفتى',
  EGY1605: 'مركز سمنود', EGY1606: 'مركز المحله الكبرى',
  EGY1607: 'مركز بسيون', EGY1608: 'مركز قطور',
  EGY1609: 'مركز كفر الزيات',
  EGY1702: 'مركز شبين الكوم', EGY1703: 'مركز الشهداء',
  EGY1704: 'مركز تلا', EGY1705: 'مركز بركه السبع',
  EGY1706: 'مركز قويسنا', EGY1707: 'مركز الباجور',
  EGY1708: 'مركز اشمون', EGY1709: 'مدينه سرس الليان',
  EGY1710: 'مركز منوف', EGY1711: 'مركز السادات',
  EGY1801: 'مدينه دمنهور', EGY1802: 'مركز دمنهور',
  EGY1803: 'مركز حوش عيسى', EGY1804: 'مركز ابو المطامير',
  EGY1805: 'مركز كفر الدوار', EGY1806: 'مركز ادكــــو',
  EGY1807: 'مركز رشيد', EGY1808: 'مركز ابو حمص',
  EGY1809: 'مركز المحموديه', EGY1810: 'مركز الرحمانيه',
  EGY1811: 'مركز شبرا خيت', EGY1812: 'مركز ايتاى البارود',
  EGY1813: 'مركز كوم حماده', EGY1814: 'مركز بدر',
  EGY1815: 'مركز الدلنجات', EGY1816: 'مركز وادى النطرون',
  EGY1817: 'مدينه غرب النوباريه',
  EGY1901: 'مدينه الاسماعيليه', EGY1902: 'مركز الاسماعيليه',
  EGY1903: 'مركز القنطره غرب', EGY1904: 'مركز القنطره شرق',
  EGY1905: 'مركز فايد', EGY1906: 'مركز ابو صوير',
  EGY1907: 'مركز التل الكبير', EGY1908: 'مركز القصاصين الجديده',
  EGY2101: 'حى امبابه', EGY2102: 'حى العجوزه',
  EGY2103: 'حى الدقى', EGY2104: 'مدينه الجيزه',
  EGY2105: 'حى بولاق الدكرور', EGY2106: 'حى الطالبيه',
  EGY2107: 'حى الاهرام', EGY2108: 'مركز ابو النمرس',
  EGY2109: 'مدينه الحوامديه', EGY2110: 'مركز البدرشين',
  EGY2111: 'مركز العياط', EGY2112: 'مركز الصف',
  EGY2113: 'مركز اطفيح', EGY2114: 'مركز كرداسه',
  EGY2115: 'مركز اوسيم', EGY2116: 'حى الوراق',
  EGY2117: 'مركز منشاه القناطر', EGY2118: 'مدينه الشيخ زايد',
  EGY2119: 'مدينه 6 اكتوبر', EGY2120: 'مدينه الواحات البحريه',
  EGY2121: 'حى العمرانيه',
  EGY2201: 'مدينه بنى سويف', EGY2202: 'مدينه بنى سويف الجديده',
  EGY2203: 'مركز بنى سويف', EGY2204: 'مركز اهناسيا',
  EGY2205: 'مركز ببا', EGY2206: 'مركز سمسطا',
  EGY2207: 'مركز الفشن', EGY2208: 'مركز الواسطى',
  EGY2209: 'مركز ناصر',
  EGY2301: 'مدينه الفيوم', EGY2302: 'مركز الفيوم',
  EGY2303: 'مركز طاميه', EGY2304: 'مركز سنورس',
  EGY2305: 'مركز ابشواى', EGY2306: 'مركز اطسا',
  EGY2307: 'مركز يوسف الصديق', EGY2308: 'مدينه الفيوم الجديده',
  EGY2401: 'مدينه المنيا', EGY2402: 'مدينه المنيا الجديده',
  EGY2403: 'مركز المنيا', EGY2404: 'مركز ابو قرقاص',
  EGY2405: 'مركز ملوى', EGY2406: 'مركز دير مواس',
  EGY2407: 'مركز سمالوط شرق', EGY2408: 'مركز سمالوط غرب',
  EGY2409: 'مركز مطاى', EGY2410: 'مركز بنى مزار',
  EGY2411: 'مركز مغاغه', EGY2412: 'مركز العدوه',
  EGY2501: 'مدينه اسيوط', EGY2502: 'مركز اسيوط',
  EGY2503: 'مركز ابوتيج', EGY2504: 'مركز الغنايم',
  EGY2505: 'مركز صدفا', EGY2506: 'مركز منفلوط',
  EGY2507: 'مركز القوصيه', EGY2508: 'مركز ديروط',
  EGY2509: 'مركز ابنوب', EGY2510: 'مركز الفتح',
  EGY2511: 'مركز ساحل سليم', EGY2512: 'مركز البدارى',
  EGY2513: 'مدينه اسيوط الجديده',
  EGY2601: 'مدينه سوهاج', EGY2602: 'مدينه سوهاج الجديده',
  EGY2603: 'مركز سوهاج', EGY2604: 'مركز المراغه',
  EGY2605: 'مركز جهينه الغربيه', EGY2606: 'مركز طهطا',
  EGY2607: 'مركز طما', EGY2608: 'مركز المنشاه',
  EGY2609: 'مركز العسيرات', EGY2610: 'مركز جرجا',
  EGY2611: 'مركز البلينا', EGY2612: 'مركز دار السلام',
  EGY2613: 'مركز اخميم', EGY2614: 'مركز ساقلته',
  EGY2615: 'حى الكوثر',
  EGY2701: 'مدينه قنا', EGY2702: 'مدينه قنا الجديده',
  EGY2703: 'مركز قنا', EGY2704: 'مركز دشنا',
  EGY2705: 'مركز الوقف', EGY2706: 'مركز نجع حمادى',
  EGY2707: 'مركز فرشوط', EGY2708: 'مركز ابوتشت',
  EGY2709: 'مركز قفط', EGY2710: 'مركز قوص',
  EGY2711: 'مركز نقاده',
  EGY2801: 'مدينه اسوان', EGY2802: 'مركز اسوان',
  EGY2803: 'مدينه اسوان الجديده', EGY2804: 'مركز ادفو',
  EGY2805: 'مركز كوم امبو', EGY2806: 'مركز نصر',
  EGY2807: 'مركز دراو', EGY2808: 'مركز ابو سمبل',
  EGY2809: 'مدينه توشكا الجديده',
  EGY2901: 'مدينه الاقصر', EGY2902: 'مركز الطود',
  EGY2903: 'مركز الزينيه', EGY2904: 'مركز القرنه',
  EGY2905: 'مركز ارمنت', EGY2906: 'مركز اسنا',
  EGY2907: 'مركز البياضيه',
  EGY3101: 'مدينه الغردقه', EGY3102: 'مدينه راس غارب',
  EGY3103: 'مدينه سفاجا', EGY3104: 'مدينه القصير',
  EGY3105: 'مدينه مرسى علم', EGY3106: 'مدينه الشلاتين',
  EGY3107: 'مدينه حلايب',
  EGY3201: 'مدينه الخارجه', EGY3202: 'مركز باريس',
  EGY3203: 'مركز بلاط', EGY3204: 'مركز الداخله',
  EGY3205: 'مركز الفرافره', EGY3206: 'مدينه شرق العوينات',
  EGY3301: 'مدينه مرسى مطروح', EGY3302: 'مدينه النجيله',
  EGY3303: 'مدينه سيدى برانى', EGY3304: 'مدينه السلوم',
  EGY3305: 'مدينه الضبعه', EGY3306: 'مدينه العلمين',
  EGY3307: 'مدينه الحمام', EGY3308: 'مدينه سيوه',
  EGY3309: 'مدينه الساحل الشمالى',
  EGY3401: 'مدينه العريش', EGY3402: 'مدينه بئر العبد',
  EGY3403: 'مدينه رمانه', EGY3404: 'مدينه الحسنه',
  EGY3405: 'مدينه نخل', EGY3406: 'مدينه القسيمه',
  EGY3407: 'مدينه الشيخ زويد', EGY3408: 'مدينه رفح',
  EGY3501: 'مدينه الطور', EGY3502: 'مدينه ابو رديس',
  EGY3503: 'مدينه راس سدر', EGY3504: 'مدينه سانت كاترين',
  EGY3505: 'مدينه نويبع', EGY3506: 'مدينه طابا',
  EGY3507: 'مدينه دهب', EGY3508: 'مدينه شرم الشيخ'
};

var RAT_MAP = {
  R11: '1', R12: '2', R13: '3', R14: '4', R15: '5'
};

var VALID_STATUS_MAP = {
  validation_status_approved: 'معتمد',
  validation_status_not_approved: 'غير معتمد',
  validation_status_on_hold: 'معلق'
};

var STATUS_MAP = {
  validation_status_approved: 'مقبول',
  validation_status_not_approved: 'مرفوض',
  validation_status_on_hold: 'هولد'
};

function ar(map, val) { return (val && map[val]) || val || ''; }

function translateKoboField(field, val) {
  if (!val) return '';
  // خرائط حسب اسم الحقل
  var map = {
    Specialized_management: ACT_MAP,
    Office_administration_items: ITEM_MAP,
    Project: PROJ_MAP,
    Place_Activity: PLACE_MAP,
    City: CITY_MAP,
    Campaigns: CAMP_MAP,
    University: UNIV_MAP,
    Team: TEAM_MAP,
    volunteer_units: UNIT_MAP
  }[field];
  if (map && map[val]) return map[val];
  if (field === 'City' && CITY_MAP[val]) return CITY_MAP[val];
  if (field === 'Place_Activity' && CITY_MAP[val]) return CITY_MAP[val];
  return val;
}

function getValidationInfo(r) {
  var vs = r._validation_status;
  if (!vs) return { status: 'بدون اعتماد', by: '', at: '' };
  return {
    status: ar(VALID_STATUS_MAP, vs.uid) || vs.uid || 'بدون اعتماد',
    by: vs.by_whom || '',
    at: vs.timestamp || ''
  };
}

function getRegStatus(r) {
  var vs = r._validation_status;
  if (!vs) return 'بدون تقييم';
  return ar(STATUS_MAP, vs.uid) || vs.uid;
}

function getHours(r) {
  if (!r.StartTime || !r.EndTime) return 0;
  try {
    var sh = parseInt(r.StartTime.split(':')[0]) || 0;
    var sm = parseInt(r.StartTime.split(':')[1]) || 0;
    var eh = parseInt(r.EndTime.split(':')[0]) || 0;
    var em = parseInt(r.EndTime.split(':')[1]) || 0;
    return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
  } catch(e) { return 0; }
}

// =============================================================
// جلب الداتا من كوبو
// =============================================================

function fetchAllFromKobo() {
  var all = [], offset = 0, total = null;
  var headers = { Authorization: 'Token ' + API_TOKEN, Accept: 'application/json' };
  do {
    var url = KOBO_BASE + '/api/v2/assets/' + ASSET_UID + '/data.json'
      + '?format=json&limit=' + PAGE_SIZE + '&start=' + offset;
    var resp = UrlFetchApp.fetch(url, { method: 'get', headers: headers, muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) throw new Error('HTTP ' + resp.getResponseCode());
    var parsed = JSON.parse(resp.getContentText());
    var results = parsed.results || [];
    if (total === null) { total = parsed.count || 0; Logger.log('إجمالي كوبو: ' + total); }
    all = all.concat(results);
    offset += results.length;
    if (offset < total) Utilities.sleep(250);
  } while (offset < total);
  return all;
}

// =============================================================
// التحديث الأساسي (جديد + قديم للاعتماد)
// =============================================================

function importKoboIncremental() {
  var t0 = Date.now();
  var props = PropertiesService.getScriptProperties();
  var lastId = Number(props.getProperty(LAST_ID_KEY) || '0');
  var lastSync = Number(props.getProperty(LAST_FULL_SYNC) || '0');
  var now = Date.now();
  var needFullSync = (now - lastSync) > 172800000; // 48 ساعة

  var records;
  if (needFullSync) {
    Logger.log('🔄 جلب كل الداتا (Full Sync للاعتماد)');
    records = fetchAllFromKobo();
    props.setProperty(LAST_FULL_SYNC, String(now));
  } else {
    Logger.log('📡 جلب الجديد فقط (_id > ' + lastId + ')');
    records = fetchAllFromKobo().filter(function(r) { return Number(r._id) > lastId; });
  }

  if (!records.length) { Logger.log('لا توجد سجلات جديدة'); return; }

  var nReg = writeRegistrations(records, needFullSync);
  var nAct = writeActivations(records, needFullSync);
  updateSummary();

  // حفظ آخر _id
  var maxId = records.reduce(function(m, r) { return Math.max(m, Number(r._id) || 0); }, lastId);
  props.setProperty(LAST_ID_KEY, String(maxId));

  var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  Logger.log('انتهى | +' + nReg.new + ' تسجيل, +' + nAct.new + ' تفعيل | ' + elapsed + 's');
  if (needFullSync) Logger.log('🔄 تم تحديث الاعتماد لكل السجلات');
}

// =============================================================
// التسجيلات — كل المحافظات (12 عمود)
// =============================================================

var REG_HEADERS = [
  'المتطوع', '_id', 'المحافظة', 'تاريخ النشاط', 'الإدارة التخصصية',
  'بند الإدارة', 'المشروع', 'الحالة', 'مكان النشاط',
  'وقت التقديم', 'الاعتماد', 'معتمد بواسطة', 'وقت الاعتماد'
];

function writeRegistrations(records, fullSync) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('التسجيلات');
  var isNew = !sheet;
  if (isNew) { sheet = ss.insertSheet('التسجيلات'); sheet.setFrozenRows(1); }

  // لو full sync: ابني map بالـ _id الموجود في الشيت
  var existingIds = {};
  if (fullSync || !isNew) {
    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      existingIds[String(data[r][1])] = r + 1; // +1 عشان sheet row (1-indexed)
    }
  }

  var newRows = [], updateRows = [], updateRange = [];
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    if (!r._id) continue;
    var row = [
      r.Volunteer_name || '',
      Number(r._id) || 0,
      ar(GOVS, r.Governorate) || r.Governorate || '',
      r.Activity_Date || '',
      ar(ACT_MAP, r.Specialized_management),
      ar(ITEM_MAP, r.Office_administration_items),
      ar(PROJ_MAP, r.Project),
      getRegStatus(r),
      translateKoboField('Place_Activity', r.Place_Activity) || translateKoboField('City', r.Place_Activity) || r.Place_Activity || '',
      r._submission_time || '',
      getValidationInfo(r).status,
      getValidationInfo(r).by,
      getValidationInfo(r).at
    ];

    var eId = String(r._id);
    if (existingIds[eId]) {
      // موجود: حدث الاعتماد بس (الأعمدة 11,12,13)
      updateRows.push([row[10], row[11], row[12]]);
      updateRange.push(existingIds[eId]);
    } else {
      // جديد: أضف الصف كامل
      newRows.push(row);
    }
  }

  // إضافة الجديد
  if (newRows.length) {
    if (isNew) {
      var allData = [REG_HEADERS].concat(newRows);
      sheet.getRange(1, 1, allData.length, REG_HEADERS.length).setValues(allData);
      sheet.getRange(1, 1, 1, REG_HEADERS.length)
        .setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
      sheet.autoResizeColumns(1, REG_HEADERS.length);
    } else {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, newRows.length, REG_HEADERS.length).setValues(newRows);
    }
  }

  // تحديث الاعتماد للموجود
  if (updateRows.length && !isNew) {
    for (var u = 0; u < updateRows.length; u++) {
      sheet.getRange(updateRange[u], 11, 1, 3).setValues([updateRows[u]]);
    }
  }

  return { new: newRows.length, updated: updateRows.length };
}

// =============================================================
// التفعيلات — كل المحافظات (16 عمود + _id للربط)
// =============================================================

var ACT_HEADERS = [
  'المتطوع', '_id', 'المحافظة', 'التاريخ', 'الإدارة', 'بند الإدارة',
  'المكان', 'المركز', 'الساعات', 'المشروع',
  'التقييم1', 'التقييم2', 'التقييم3', 'حقق هدف', 'مشكلات',
  'الاعتماد', 'معتمد بواسطة', 'وقت الاعتماد'
];

function writeActivations(records, fullSync) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('التفعيلات');
  var isNew = !sheet;
  if (isNew) { sheet = ss.insertSheet('التفعيلات'); sheet.setFrozenRows(1); }

  var existingIds = {};
  if (fullSync || !isNew) {
    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      existingIds[String(data[r][1])] = r + 1;
    }
  }

  var newRows = [], updateRows = [], updateRange = [];
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    if (!r.Specialized_management) continue;
    if (!r._id) continue; // مش تفعيلة

    var vi = getValidationInfo(r);
    var row = [
      r.Volunteer_name || '',
      Number(r._id) || 0,
      ar(GOVS, r.Governorate) || r.Governorate || '',
      r.Activity_Date || '',
      ar(ACT_MAP, r.Specialized_management),
      ar(ITEM_MAP, r.Office_administration_items),
      translateKoboField('Place_Activity', r.Place_Activity) || translateKoboField('City', r.Place_Activity) || r.Place_Activity || '',
      translateKoboField('City', r.City) || r.City || '',
      getHours(r),
      ar(PROJ_MAP, r.Project),
      r['ReviewQ/Review1'] || '',
      r['ReviewQ/Review'] || '',
      r['ReviewQ/Review3'] || '',
      r['ReviewQ/Review4'] || '',
      r['ReviewQ/Review2'] || '',
      vi.status, vi.by, vi.at
    ];

    var eId = String(r._id);
    if (existingIds[eId]) {
      updateRows.push([row[15], row[16], row[17]]);
      updateRange.push(existingIds[eId]);
    } else {
      newRows.push(row);
    }
  }

  if (newRows.length) {
    if (isNew) {
      var allData = [ACT_HEADERS].concat(newRows);
      sheet.getRange(1, 1, allData.length, ACT_HEADERS.length).setValues(allData);
      sheet.getRange(1, 1, 1, ACT_HEADERS.length)
        .setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
      sheet.autoResizeColumns(1, ACT_HEADERS.length);
    } else {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, newRows.length, ACT_HEADERS.length).setValues(newRows);
    }
  }

  if (updateRows.length && !isNew) {
    for (var u = 0; u < updateRows.length; u++) {
      sheet.getRange(updateRange[u], 16, 1, 3).setValues([updateRows[u]]);
    }
  }

  return { new: newRows.length, updated: updateRows.length };
}

// =============================================================
// الملخص
// =============================================================

function updateSummary() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ملخص');
  if (!sheet) { sheet = ss.insertSheet('ملخص'); sheet.setFrozenRows(1); }
  sheet.clear();

  var hdrs = ['المؤشر', 'القيمة'];
  sheet.appendRow(hdrs);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');

  var regSheet = ss.getSheetByName('التسجيلات');
  var total = 0, approved = 0, rejected = 0, hold = 0, none = 0;
  if (regSheet) {
    var vals = regSheet.getDataRange().getValues();
    if (vals.length > 1) {
      for (var r = 1; r < vals.length; r++) {
        total++; var s = vals[r][7] || '';
        if (s === 'مقبول') approved++;
        else if (s === 'مرفوض') rejected++;
        else if (s === 'هولد') hold++;
        else none++;
      }
    }
  }
  sheet.appendRow(['إجمالي التسجيلات', total]);
  sheet.appendRow(['مقبول', approved]); sheet.appendRow(['مرفوض', rejected]);
  sheet.appendRow(['هولد', hold]); sheet.appendRow(['بدون تقييم', none]);

  sheet.appendRow(['']); sheet.appendRow(['حسب المحافظة']);
  var row = sheet.getLastRow();
  sheet.getRange(row, 1, 1, 2).setFontWeight('bold');

  var govKeys = Object.keys(GOVS);
  var govCounts = {};
  for (var g = 0; g < govKeys.length; g++) govCounts[govKeys[g]] = 0;
  if (regSheet) {
    var rv = regSheet.getDataRange().getValues();
    if (rv.length > 1) {
      for (var r = 1; r < rv.length; r++) {
        var gov = rv[r][2] || '';
        for (var g = 0; g < govKeys.length; g++) {
          if (GOVS[govKeys[g]] === gov) { govCounts[govKeys[g]]++; break; }
        }
      }
    }
  }
  sheet.appendRow(['المحافظة', 'العدد']);
  for (var g = 0; g < govKeys.length; g++) sheet.appendRow([GOVS[govKeys[g]], govCounts[govKeys[g]]]);
  sheet.autoResizeColumns(1, 2);
}

// =============================================================
// دوال عامة
// =============================================================

function updateAll() { importKoboIncremental(); }

function resetKoboCheckpoint() {
  PropertiesService.getScriptProperties().deleteProperty(LAST_ID_KEY);
  PropertiesService.getScriptProperties().deleteProperty(LAST_FULL_SYNC);
  Logger.log('تم مسح checkpoint — المرة الجاية هتتحمل كل الداتا');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔄 كوبو')
    .addItem('تحديث كل البيانات', 'updateAll')
    .addItem('إعادة تعيين (تحميل كامل)', 'resetKoboCheckpoint')
    .addToUi();
}
