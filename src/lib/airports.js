// قاعدة بيانات مطارات عالمية مختارة (كود IATA + المدينة عربي/إنجليزي + الدولة عربي/إنجليزي).
// تغطي المطارات السعودية والخليجية والشرق الأوسط ووجهات رئيسية في آسيا وأوروبا وأفريقيا والأمريكتين وأوقيانوسيا.
// [iata, cityAr, cityEn, countryAr, countryEn]
const RAW = [
  // السعودية
  ["RUH", "الرياض", "Riyadh", "السعودية", "Saudi Arabia"],
  ["JED", "جدة", "Jeddah", "السعودية", "Saudi Arabia"],
  ["DMM", "الدمام", "Dammam", "السعودية", "Saudi Arabia"],
  ["MED", "المدينة المنورة", "Medina", "السعودية", "Saudi Arabia"],
  ["AHB", "أبها", "Abha", "السعودية", "Saudi Arabia"],
  ["TUU", "تبوك", "Tabuk", "السعودية", "Saudi Arabia"],
  ["TIF", "الطائف", "Taif", "السعودية", "Saudi Arabia"],
  ["HAS", "حائل", "Hail", "السعودية", "Saudi Arabia"],
  ["ELQ", "القصيم", "Gassim", "السعودية", "Saudi Arabia"],
  ["EAM", "نجران", "Najran", "السعودية", "Saudi Arabia"],
  ["YNB", "ينبع", "Yanbu", "السعودية", "Saudi Arabia"],
  ["ABT", "الباحة", "Al Baha", "السعودية", "Saudi Arabia"],
  ["HBT", "حفر الباطن", "Hafr Albatin", "السعودية", "Saudi Arabia"],
  ["RAE", "عرعر", "Arar", "السعودية", "Saudi Arabia"],
  ["GIZ", "جازان", "Jazan", "السعودية", "Saudi Arabia"],
  ["AJF", "الجوف", "Al Jouf", "السعودية", "Saudi Arabia"],
  // الخليج
  ["DXB", "دبي", "Dubai", "الإمارات", "UAE"],
  ["AUH", "أبوظبي", "Abu Dhabi", "الإمارات", "UAE"],
  ["SHJ", "الشارقة", "Sharjah", "الإمارات", "UAE"],
  ["FJR", "الفجيرة", "Fujairah", "الإمارات", "UAE"],
  ["RKT", "رأس الخيمة", "Ras Al Khaimah", "الإمارات", "UAE"],
  ["KWI", "الكويت", "Kuwait", "الكويت", "Kuwait"],
  ["BAH", "المنامة", "Manama", "البحرين", "Bahrain"],
  ["DOH", "الدوحة", "Doha", "قطر", "Qatar"],
  ["MCT", "مسقط", "Muscat", "عُمان", "Oman"],
  ["SLL", "صلالة", "Salalah", "عُمان", "Oman"],
  // الشرق الأوسط
  ["CAI", "القاهرة", "Cairo", "مصر", "Egypt"],
  ["HBE", "الإسكندرية", "Alexandria", "مصر", "Egypt"],
  ["LXR", "الأقصر", "Luxor", "مصر", "Egypt"],
  ["ASW", "أسوان", "Aswan", "مصر", "Egypt"],
  ["SSH", "شرم الشيخ", "Sharm El Sheikh", "مصر", "Egypt"],
  ["HRG", "الغردقة", "Hurghada", "مصر", "Egypt"],
  ["BEY", "بيروت", "Beirut", "لبنان", "Lebanon"],
  ["AMM", "عمان", "Amman", "الأردن", "Jordan"],
  ["AQJ", "العقبة", "Aqaba", "الأردن", "Jordan"],
  ["DAM", "دمشق", "Damascus", "سوريا", "Syria"],
  ["BGW", "بغداد", "Baghdad", "العراق", "Iraq"],
  ["EBL", "أربيل", "Erbil", "العراق", "Iraq"],
  ["BSR", "البصرة", "Basra", "العراق", "Iraq"],
  // اليمن
  ["SAH", "صنعاء", "Sanaa", "اليمن", "Yemen"],
  ["ADE", "عدن", "Aden", "اليمن", "Yemen"],
  ["HOD", "الحديدة", "Hodeidah", "اليمن", "Yemen"],
  ["RIY", "المكلا", "Mukalla", "اليمن", "Yemen"],
  ["IST", "إسطنبول", "Istanbul", "تركيا", "Turkey"],
  ["SAW", "إسطنبول (ساو)", "Istanbul SAW", "تركيا", "Turkey"],
  ["AYT", "أنطاليا", "Antalya", "تركيا", "Turkey"],
  ["ESB", "أنقرة", "Ankara", "تركيا", "Turkey"],
  ["ADA", "أضنة", "Adana", "تركيا", "Turkey"],
  // آسيا
  ["BKK", "بانكوك", "Bangkok", "تايلاند", "Thailand"],
  ["HKT", "بوكيت", "Phuket", "تايلاند", "Thailand"],
  ["SIN", "سنغافورة", "Singapore", "سنغافورة", "Singapore"],
  ["KUL", "كوالالمبور", "Kuala Lumpur", "ماليزيا", "Malaysia"],
  ["PEN", "بينانج", "Penang", "ماليزيا", "Malaysia"],
  ["MNL", "مانيلا", "Manila", "الفلبين", "Philippines"],
  ["CEB", "سيبو", "Cebu", "الفلبين", "Philippines"],
  ["CGK", "جاكرتا", "Jakarta", "إندونيسيا", "Indonesia"],
  ["DPS", "بالي", "Bali", "إندونيسيا", "Indonesia"],
  ["DEL", "نيودلهي", "Delhi", "الهند", "India"],
  ["BOM", "مومباي", "Mumbai", "الهند", "India"],
  ["MAA", "تشيناي", "Chennai", "الهند", "India"],
  ["HYD", "حيدر أباد", "Hyderabad", "الهند", "India"],
  ["CCJ", "كاليكوت", "Calicut", "الهند", "India"],
  ["BLR", "بنغالور", "Bengaluru", "الهند", "India"],
  ["COK", "كوتشين", "Kochi", "الهند", "India"],
  ["TRV", "تريفاندرم", "Trivandrum", "الهند", "India"],
  ["AMD", "أحمد آباد", "Ahmedabad", "الهند", "India"],
  ["CCU", "كلكتا", "Kolkata", "الهند", "India"],
  ["GOI", "غوا", "Goa", "الهند", "India"],
  ["LKO", "لكنؤ", "Lucknow", "الهند", "India"],
  ["JAI", "جايبور", "Jaipur", "الهند", "India"],
  ["NAG", "ناغبور", "Nagpur", "الهند", "India"],
  ["CJB", "كويمباتور", "Coimbatore", "الهند", "India"],
  ["ATQ", "أمرتسار", "Amritsar", "الهند", "India"],
  ["PAT", "بتنا", "Patna", "الهند", "India"],
  ["VNS", "واراناسي", "Varanasi", "الهند", "India"],
  ["GAU", "غواهاتي", "Guwahati", "الهند", "India"],
  ["IXC", "شانديغار", "Chandigarh", "الهند", "India"],
  ["IXM", "مادوراي", "Madurai", "الهند", "India"],
  ["DAC", "دكا", "Dhaka", "بنغلاديش", "Bangladesh"],
  ["CMB", "كولومبو", "Colombo", "سريلانكا", "Sri Lanka"],
  ["KTM", "كاتماندو", "Kathmandu", "نيبال", "Nepal"],
  ["ISB", "إسلام آباد", "Islamabad", "باكستان", "Pakistan"],
  ["KHI", "كراتشي", "Karachi", "باكستان", "Pakistan"],
  ["LHE", "لاهور", "Lahore", "باكستان", "Pakistan"],
  ["PEK", "بكين", "Beijing", "الصين", "China"],
  ["PVG", "شنغهاي", "Shanghai", "الصين", "China"],
  ["CAN", "قوانغتشو", "Guangzhou", "الصين", "China"],
  ["HKG", "هونغ كونغ", "Hong Kong", "هونغ كونغ", "Hong Kong"],
  ["TPE", "تايبيه", "Taipei", "تايوان", "Taiwan"],
  ["ICN", "سيول", "Seoul", "كوريا الجنوبية", "South Korea"],
  ["NRT", "طوكيو", "Tokyo", "اليابان", "Japan"],
  ["KIX", "أوساكا", "Osaka", "اليابان", "Japan"],
  // أوروبا
  ["LHR", "لندن", "London", "المملكة المتحدة", "United Kingdom"],
  ["LGW", "لندن (غاتويك)", "London Gatwick", "المملكة المتحدة", "United Kingdom"],
  ["MAN", "مانشستر", "Manchester", "المملكة المتحدة", "United Kingdom"],
  ["CDG", "باريس", "Paris", "فرنسا", "France"],
  ["ORY", "باريس (أورلي)", "Paris Orly", "فرنسا", "France"],
  ["FRA", "فرانكفورت", "Frankfurt", "ألمانيا", "Germany"],
  ["MUC", "ميونخ", "Munich", "ألمانيا", "Germany"],
  ["AMS", "أمستردام", "Amsterdam", "هولندا", "Netherlands"],
  ["FCO", "روما", "Rome", "إيطاليا", "Italy"],
  ["MXP", "ميلان", "Milan", "إيطاليا", "Italy"],
  ["MAD", "مدريد", "Madrid", "إسبانيا", "Spain"],
  ["BCN", "برشلونة", "Barcelona", "إسبانيا", "Spain"],
  ["ZRH", "زيورخ", "Zurich", "سويسرا", "Switzerland"],
  ["GVA", "جنيف", "Geneva", "سويسرا", "Switzerland"],
  ["VIE", "فيينا", "Vienna", "النمسا", "Austria"],
  ["PRG", "براغ", "Prague", "التشيك", "Czech Republic"],
  ["BUD", "بودابست", "Budapest", "المجر", "Hungary"],
  ["WAW", "وارسو", "Warsaw", "بولندا", "Poland"],
  ["SJJ", "سراييفو", "Sarajevo", "البوسنة", "Bosnia"],
  ["ATH", "أثينا", "Athens", "اليونان", "Greece"],
  ["SOF", "صوفيا", "Sofia", "بلغاريا", "Bulgaria"],
  ["CPH", "كوبنهاغن", "Copenhagen", "الدانمرك", "Denmark"],
  ["ARN", "ستوكهولم", "Stockholm", "السويد", "Sweden"],
  ["OSL", "أوسلو", "Oslo", "النرويج", "Norway"],
  ["HEL", "هلسنكي", "Helsinki", "فنلندا", "Finland"],
  ["DUB", "دبلن", "Dublin", "أيرلندا", "Ireland"],
  ["SVO", "موسكو", "Moscow", "روسيا", "Russia"],
  // أفريقيا
  ["ADD", "أديس أبابا", "Addis Ababa", "إثيوبيا", "Ethiopia"],
  ["NBO", "نيروبي", "Nairobi", "كينيا", "Kenya"],
  ["CPT", "كيب تاون", "Cape Town", "جنوب أفريقيا", "South Africa"],
  ["JNB", "جوهانسبرغ", "Johannesburg", "جنوب أفريقيا", "South Africa"],
  ["CMN", "الدار البيضاء", "Casablanca", "المغرب", "Morocco"],
  ["RAK", "مراكش", "Marrakech", "المغرب", "Morocco"],
  ["ALG", "الجزائر", "Algiers", "الجزائر", "Algeria"],
  ["TUN", "تونس", "Tunis", "تونس", "Tunisia"],
  ["KRT", "الخرطوم", "Khartoum", "السودان", "Sudan"],
  ["LOS", "لاغوس", "Lagos", "نيجيريا", "Nigeria"],
  ["ACC", "أكرا", "Accra", "غانا", "Ghana"],
  // الأمريكتان
  ["JFK", "نيويورك", "New York", "الولايات المتحدة", "USA"],
  ["LAX", "لوس أنجلوس", "Los Angeles", "الولايات المتحدة", "USA"],
  ["ORD", "شيكاغو", "Chicago", "الولايات المتحدة", "USA"],
  ["MIA", "ميامي", "Miami", "الولايات المتحدة", "USA"],
  ["SFO", "سان فرانسيسكو", "San Francisco", "الولايات المتحدة", "USA"],
  ["IAH", "هيوستن", "Houston", "الولايات المتحدة", "USA"],
  ["YYZ", "تورونتو", "Toronto", "كندا", "Canada"],
  ["YVR", "فانكوفر", "Vancouver", "كندا", "Canada"],
  ["MEX", "مكسيكو سيتي", "Mexico City", "المكسيك", "Mexico"],
  ["CUN", "كانكون", "Cancun", "المكسيك", "Mexico"],
  ["GRU", "ساو باولو", "Sao Paulo", "البرازيل", "Brazil"],
  ["EZE", "بوينس آيرس", "Buenos Aires", "الأرجنتين", "Argentina"],
  ["BOG", "بوغوتا", "Bogota", "كولومبيا", "Colombia"],
  ["LIM", "ليما", "Lima", "بيرو", "Peru"],
  // أوقيانوسيا
  ["SYD", "سيدني", "Sydney", "أستراليا", "Australia"],
  ["MEL", "ميلبورن", "Melbourne", "أستراليا", "Australia"],
  ["AKL", "أوكلاند", "Auckland", "نيوزيلندا", "New Zealand"],
];

export const AIRPORTS = RAW.map(([iata, cityAr, cityEn, countryAr, countryEn]) => ({
  iata,
  cityAr,
  cityEn,
  countryAr,
  countryEn,
}));

export function airportLabel(a, lang = "ar") {
  if (!a) return "";
  return lang === "ar"
    ? `${a.cityAr} (${a.iata}) — ${a.countryAr}`
    : `${a.cityEn} (${a.iata}) — ${a.countryEn}`;
}

export function findAirport(iata) {
  return AIRPORTS.find((a) => a.iata === iata) || null;
}

export function searchAirports(query, lang = "ar", limit = 12) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return AIRPORTS.slice(0, limit);
  return AIRPORTS.filter((a) => {
    const hay = `${a.iata} ${a.cityAr} ${a.cityEn} ${a.countryAr} ${a.countryEn}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}