/**
 * Web App API — يقرأ من Google Sheets (v7.1)
 * ============================================
 * - قراءة التسجيلات + التفعيلات
 * - يدعم JSONP callback
 */

var SPREADSHEET_ID = '1RTGsjKDJHk3V4HDLpJphPec93Nab1CH1jRS4-aDlmj0';

function getSS() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  var callback = (e && e.parameter && e.parameter.callback) || '';
  var action = (e && e.parameter && e.parameter.action) || 'all';

  try {
    var data = {};
    if (action === 'registrations' || action === 'all') {
      data.registrations = getRegistrationData();
    }
    if (action === 'activations' || action === 'all') {
      data.activations = getActivationData();
    }

    var json = JSON.stringify(data);
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + json + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    var errJson = JSON.stringify({error: err.message});
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + errJson + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(errJson)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== التسجيلات ======
// الأعمدة: المتطوع, _id, المحافظة, تاريخ النشاط, الإدارة, بند الإدارة,
//          المشروع, الحالة, مكان النشاط, الجامعة, وقت التقديم,
//          الاعتماد, معتمد بواسطة, وقت الاعتماد
function getRegistrationData() {
  var sheet = getSS().getSheetByName('التسجيلات');
  if (!sheet) return [];

  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];

  var rows = [];
  for (var i = 1; i < vals.length; i++) {
    var r = vals[i];
    rows.push({
      id: String(r[1] || i),
      name: r[0] || '',
      gov: r[2] || '',
      date: r[3] || '',
      mgt: r[4] || '',
      item: r[5] || '',
      proj: r[6] || '',
      status: r[7] || 'بدون تقييم',
      place: r[8] || '',
      univ: r[9] || '',
      time: r[10] || '',
      ver: r[11] || '',
      verBy: r[12] || '',
      verAt: r[13] || ''
    });
  }
  return rows;
}

// ====== التفعيلات ======
// الأعمدة: المتطوع, _id, المحافظة, التاريخ, الإدارة, بند الإدارة,
//          المكان, المركز, الجامعة, الساعات, المشروع,
//          التقييم1, التقييم2, التقييم3, حقق هدف, مشكلات,
//          الاعتماد, معتمد بواسطة, وقت الاعتماد
var ACT_SIMPLE = {
  'جذب واستقبال المتطوعين': 'جذب',
  'اجتماعات دورية': 'اجتماعات',
  'تدريبات': 'تدريبات',
  'أبحاث ومقابلات': 'أبحاث',
  'تنفيذ تدخلات': 'تدخلات',
  'معارض الملابس': 'ملابس',
  'قوافل طبية': 'قوافل',
  'الفعاليات (أنشطة - زيارات - مهرجان الاضاحي - تبرع بالدم - إفطارات - حفلات)': 'الفعاليات',
  'محو الأمية': 'محو أمية',
  'تعليم الأطفال': 'تعليم أطفال',
  'توعية': 'توعية',
  'رفع التسويات': 'تسويات',
  'متابعة وتقييم': 'متابعة',
  'التمويل': 'تمويل',
  'تواصل ودعم': 'تواصل',
  'اصطفاف': 'اصطفاف',
  'Technical Support': 'دعم فني',
  'الإشراف والمتابعات الدورية': 'إشراف',
  'إطعام': 'إطعام',
  'أنشطة لوجيستية': 'لوجستية',
  'تفعيل المتطوعين': 'تفعيل'
};

function getActivationData() {
  var sheet = getSS().getSheetByName('التفعيلات');
  if (!sheet) return [];

  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];

  var rows = [];
  for (var i = 1; i < vals.length; i++) {
    var r = vals[i];
    var mgt = r[4] || '';
    var h = parseFloat(r[9]) || 0;
    rows.push({
      v: r[0] || '',
      id: String(r[1] || i),
      gov: r[2] || '',
      d: r[3] || '',
      a: mgt,
      ad: r[5] || '',
      l: r[6] || '',
      c: r[7] || '',
      univ: r[8] || '',
      h: h,
      p: r[10] || '',
      s1: r[11] || '',
      s2: r[12] || '',
      s3: r[13] || '',
      g: r[14] || '',
      pb: r[15] || '',
      sa: ACT_SIMPLE[mgt] || mgt,
      ver: r[16] || '',
      verBy: r[17] || '',
      verAt: r[18] || ''
    });
  }
  return rows;
}
