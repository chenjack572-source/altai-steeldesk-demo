export const COUNTRY_OPTIONS = Object.freeze([
  { value: 'Vietnam', label: '越南 / Vietnam', keywords: 'vn 越南 胡志明 河内' },
  { value: 'Thailand', label: '泰国 / Thailand', keywords: 'th 泰国 曼谷' },
  { value: 'Malaysia', label: '马来西亚 / Malaysia', keywords: 'my 马来西亚 吉隆坡' },
  { value: 'Indonesia', label: '印度尼西亚 / Indonesia', keywords: 'id 印尼 雅加达' },
  { value: 'Philippines', label: '菲律宾 / Philippines', keywords: 'ph 马尼拉' },
  { value: 'Singapore', label: '新加坡 / Singapore', keywords: 'sg' },
  { value: 'Cambodia', label: '柬埔寨 / Cambodia', keywords: 'kh 金边' },
  { value: 'Myanmar', label: '缅甸 / Myanmar', keywords: 'mm Burma' },
  { value: 'Laos', label: '老挝 / Laos', keywords: 'la' },
  { value: 'Brunei', label: '文莱 / Brunei', keywords: 'bn' },
  { value: 'India', label: '印度 / India', keywords: 'in 孟买 德里' },
  { value: 'Pakistan', label: '巴基斯坦 / Pakistan', keywords: 'pk' },
  { value: 'Bangladesh', label: '孟加拉国 / Bangladesh', keywords: 'bd' },
  { value: 'Sri Lanka', label: '斯里兰卡 / Sri Lanka', keywords: 'lk' },
  { value: 'United Arab Emirates', label: '阿联酋 / United Arab Emirates', keywords: 'uae ae 迪拜 阿布扎比' },
  { value: 'Saudi Arabia', label: '沙特阿拉伯 / Saudi Arabia', keywords: 'sa 沙特 利雅得' },
  { value: 'Qatar', label: '卡塔尔 / Qatar', keywords: 'qa 多哈' },
  { value: 'Oman', label: '阿曼 / Oman', keywords: 'om' },
  { value: 'Kuwait', label: '科威特 / Kuwait', keywords: 'kw' },
  { value: 'Bahrain', label: '巴林 / Bahrain', keywords: 'bh' },
  { value: 'Turkey', label: '土耳其 / Turkey', keywords: 'tr Türkiye' },
  { value: 'Israel', label: '以色列 / Israel', keywords: 'il' },
  { value: 'Jordan', label: '约旦 / Jordan', keywords: 'jo' },
  { value: 'Iraq', label: '伊拉克 / Iraq', keywords: 'iq' },
  { value: 'Egypt', label: '埃及 / Egypt', keywords: 'eg 开罗' },
  { value: 'Japan', label: '日本 / Japan', keywords: 'jp 东京 大阪' },
  { value: 'South Korea', label: '韩国 / South Korea', keywords: 'kr Korea 首尔' },
  { value: 'Taiwan, China', label: '中国台湾 / Taiwan, China', keywords: 'tw 台湾' },
  { value: 'Hong Kong, China', label: '中国香港 / Hong Kong, China', keywords: 'hk 香港' },
  { value: 'Australia', label: '澳大利亚 / Australia', keywords: 'au 澳洲' },
  { value: 'New Zealand', label: '新西兰 / New Zealand', keywords: 'nz' },
  { value: 'United States', label: '美国 / United States', keywords: 'us usa 美国' },
  { value: 'Canada', label: '加拿大 / Canada', keywords: 'ca' },
  { value: 'Mexico', label: '墨西哥 / Mexico', keywords: 'mx' },
  { value: 'Brazil', label: '巴西 / Brazil', keywords: 'br' },
  { value: 'Germany', label: '德国 / Germany', keywords: 'de 德国' },
  { value: 'Italy', label: '意大利 / Italy', keywords: 'it' },
  { value: 'Poland', label: '波兰 / Poland', keywords: 'pl' },
  { value: 'Spain', label: '西班牙 / Spain', keywords: 'es' },
  { value: 'United Kingdom', label: '英国 / United Kingdom', keywords: 'uk gb Britain 英国' },
  { value: 'France', label: '法国 / France', keywords: 'fr' },
  { value: 'Netherlands', label: '荷兰 / Netherlands', keywords: 'nl Holland' },
  { value: 'South Africa', label: '南非 / South Africa', keywords: 'za' },
  { value: 'Nigeria', label: '尼日利亚 / Nigeria', keywords: 'ng' },
  { value: 'Kenya', label: '肯尼亚 / Kenya', keywords: 'ke' }
]);

export const INDUSTRY_OPTIONS = Object.freeze([
  '不锈钢进口商 / 经销商', '钢材服务中心', '金属加工 / 钣金', '商用厨房设备', '家电制造', '厨具 / 餐具',
  '水槽 / 卫浴', '汽车排气系统', '汽车零部件', 'HVAC / 通风', '换热器', '热水器 / 锅炉', '制管',
  '电梯制造', '建筑装饰', '食品加工设备', '化工设备', '能源设备', '轨道交通', '集装箱 / 运输设备',
  '工业炉 / 高温部件', '紧固件 / 五金', '工程承包 / 项目采购', '其他 OEM / 制造业'
]);

export const GRADE_OPTIONS = Object.freeze([
  '201', '202', '301', '304', '304L', '316', '316L', '321', '409', '409L', '410', '410S', '420J1', '420J2',
  '430', '430L', '430J1L', '430Ti', '434', '436L', '439', '441', '443', '444', '445J2', '446M', '1.4003',
  '2205', '2507', 'NM400', 'NM450', 'NM500'
]);

export const PRODUCT_FORM_OPTIONS = Object.freeze([
  '冷轧卷 / Cold rolled coil', '热轧卷 / Hot rolled coil', '板材 / Sheet & plate', '分条 / Slit coil',
  '钢带 / Strip', '焊管 / Welded tube', '无缝管 / Seamless tube', '棒材 / Bar', '定尺开平 / Cut-to-length',
  '冲压件 / Processed component'
]);

export const STANDARD_OPTIONS = Object.freeze([
  'ASTM A240', 'ASTM A480', 'ASTM A554', 'ASTM A268', 'EN 10088', 'EN 10028', 'JIS G4304', 'JIS G4305',
  'JIS G4312', 'GB/T 4237', 'GB/T 3280', 'GB/T 24511', 'DIN', 'KS', '客户图纸 / Customer drawing'
]);

export const FINISH_OPTIONS = Object.freeze(['No.1', '2D', '2B', 'BA', 'No.3', 'No.4', 'HL / Hairline', 'SB / Scotch Brite', '8K / Mirror', 'Embossed', 'Etched', 'PVC / PE film']);
export const INCOTERM_OPTIONS = Object.freeze(['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']);
export const SUPPLIER_TYPE_OPTIONS = Object.freeze(['钢厂', '服务中心', '加工厂', '贸易合作方', '物流 / 仓储', '检测机构']);
export const REGION_OPTIONS = Object.freeze(['华东', '华北', '华南', '华中', '东北', '西南', '西北', '江苏无锡', '江苏张家港', '浙江宁波', '广东佛山', '山东淄博', '上海', '海外']);

export function searchChoiceMatch(query, searchableText) {
  const normalize = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[\s\-_/，,()（）.]+/g, '');
  const needle = normalize(query);
  const rawText = String(searchableText || '').toLowerCase().normalize('NFKD');
  if (!needle) return true;
  const tokens = rawText.split(/[\s\-_/，,()（）.]+/).map(normalize).filter(Boolean);
  if (tokens.some(token => token.includes(needle))) return true;
  return tokens.some(token => {
    let index = 0;
    for (const character of token) {
      if (character === needle[index]) index += 1;
      if (index === needle.length) return true;
    }
    return false;
  });
}
