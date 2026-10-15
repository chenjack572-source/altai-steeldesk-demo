const ORIGINS = [
  '昆山大庚', '东方特钢', '北港新材', '华新丽华', '泰山钢铁', '鞍钢联众', '太钢天管',
  '西南不锈', '酒钢', '张浦', '宝新', '太钢', '浦项', '宏旺', '联众', '青拓', '东特',
  '德龙', '广青', '甬金', '鼎信', '盛阳', '福欣', '金汇', '诚德', '青山', '戴南',
  '宝钢', '鞍钢', '本钢', '攀钢', '武钢', '柳钢', '首钢', '山西', '江苏', '无锡',
  '上海', '广东', '浙江', '福建', '山东', '河北', '辽宁', '天津'
];

const MATERIAL_WORDS = /(?:20[0-9]|30[0-9]|31[0-9]|32[0-9]|40[0-9]|41[0-9]|42[0-9]|43[0-9]|44[0-9]|2205|2507|904L|不锈钢|复合板|花纹板|彩色板|钛|高镍|耐热|冷轧|热轧|[234]00系)/i;
const GRADE_AT_START = /^(?:SUS\s*)?(201|202|301|304L?|304N|309S?|310S?|316L?|317L?|321|347|409L?|410S?|420J[12]?|420|430L?|430|436L?|439|441|443|444|2205|2507|904L|800H|825)(?=$|[^0-9])/i;
const UNKNOWN_FORM = /^(?:卷\s*\/\s*板|卷板)[（(]?待复核[）)]?$/;
const FORM_OR_BASIS_WORDS = /(?:冷轧|热轧|宽幅?|窄幅?|厚|薄|毛边|切边|卷|板|管|带|棒|2B|BA|NO\.?1|基价|市盘|市场价|含税)/i;

function text(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function repairCommonOcr(value) {
  return text(value)
    .replace(/热[乳礼扎]/g, '热轧')
    .replace(/冷[乳礼扎]/g, '冷轧')
    .replace(/冷轧妆/g, '冷轧卷')
    .replace(/币金/g, '甬金');
}

function uniqueWords(value) {
  const words = text(value).split(' ').filter(Boolean);
  return words.filter((word, index) => index === 0 || word !== words[index - 1]).join(' ');
}

function centerY(row) {
  const ys = (row.sourceBox || []).map(point => Number(point?.[1])).filter(Number.isFinite);
  return ys.length ? ys.reduce((sum, value) => sum + value, 0) / ys.length : Number(row.y || 0);
}

function priceOf(row) {
  const price = Number(row.normalizedPrice ?? row.rawPrice);
  return Number.isFinite(price) ? price : 0;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function cleanMarketMaterial(value) {
  const cleaned = repairCommonOcr(value)
    .replace(/^(?:口|□|○|〇|ON|O|司|尚)\s*/i, '')
    .replace(/\s*(?:口|□|○|〇)$/i, '')
    .trim();
  if (!cleaned || !MATERIAL_WORDS.test(cleaned)) return '';
  return cleaned;
}

export function inferMarketProductForm(...values) {
  const source = values.map(text).join(' ');
  if (/花纹板/.test(source)) return '花纹板';
  if (/复合板/.test(source)) return '复合板';
  if (/彩色板/.test(source)) return '彩色板';
  if (/(?:卷板|钢卷|卷材|宽幅卷|窄幅卷|冷轧卷|热轧卷|卷)/.test(source)) return '卷';
  if (/(?:中厚板|平板|板材|板)/.test(source)) return '板';
  if (/(?:焊管|无缝管|钢管|管材|管)/.test(source)) return '管';
  if (/(?:钢带|带材|带)/.test(source)) return '钢带';
  if (/(?:棒材|圆棒|棒)/.test(source)) return '棒';
  if (/(?:型材|角钢|槽钢)/.test(source)) return '型材';
  return '';
}

function extractOrigin(value) {
  let remaining = repairCommonOcr(uniqueWords(value));
  const origin = ORIGINS.find(name => remaining.includes(name)) || '';
  if (origin) remaining = text(remaining.replaceAll(origin, ' '));
  return { origin, remaining };
}

export function classifyMarketThirdColumn(value, material = '') {
  const raw = repairCommonOcr(value);
  const { origin, remaining } = extractOrigin(raw);
  const productForm = inferMarketProductForm(material, raw);
  const basis = text(remaining || (origin ? '' : raw));
  const pureForm = /^(?:卷|板|管|带|棒|钢带|花纹板|复合板|彩色板)$/.test(raw);
  let kind = 'unknown';
  if (origin && (productForm || basis)) kind = 'mixed';
  else if (origin) kind = 'origin';
  else if (productForm) kind = 'form';
  else if (FORM_OR_BASIS_WORDS.test(raw)) kind = 'basis';
  return {
    raw,
    origin,
    productForm,
    quoteBasis: origin ? (pureForm ? '' : basis) : (FORM_OR_BASIS_WORDS.test(raw) && !pureForm ? raw : ''),
    kind
  };
}

function splitLeadingGrade(value) {
  const remaining = text(value);
  const match = remaining.match(GRADE_AT_START);
  if (!match) return { grade: '', remaining };
  return { grade: match[1].toUpperCase(), remaining: text(remaining.slice(match[0].length)) };
}

function cleanSpecification(value) {
  return uniqueWords(value)
    .replace(/^(?:产地|钢厂|厂家)[:：]?\s*/, '')
    .replace(/(?:卷板|钢卷|卷材|宽幅卷|窄幅卷|冷轧卷|热轧卷|平板|板材|钢带|带材|钢管|管材|棒材|圆棒|卷|板|管|带|棒)$/g, '')
    .replace(/^[·,，;；/\-]+|[·,，;；/\-]+$/g, '')
    .trim();
}

function normalizeOne(row) {
  let material = cleanMarketMaterial(row.material);
  const materialSource = material ? (row.materialSource || 'direct') : 'unresolved';
  const detail = uniqueWords(row.rawDetail || row.specification);
  const originResult = extractOrigin(detail);
  const gradeResult = splitLeadingGrade(originResult.remaining);
  if (gradeResult.grade && (!material || /[234]00系/.test(material))) material = gradeResult.grade;
  const thirdColumn = classifyMarketThirdColumn(row.thirdColumnRaw || row.origin, material);
  const existingForm = UNKNOWN_FORM.test(text(row.productForm)) ? '' : text(row.productForm);
  const productForm = existingForm || thirdColumn.productForm || inferMarketProductForm(material, detail);
  const explicitlyDerivedOrigin = row.thirdColumnRaw && text(row.origin) !== text(row.thirdColumnRaw) ? repairCommonOcr(row.origin) : '';
  return {
    ...row,
    material,
    materialSource: material ? (gradeResult.grade && material === gradeResult.grade ? 'detail-grade' : materialSource) : 'unresolved',
    thirdColumnRaw: thirdColumn.raw,
    thirdColumnKind: thirdColumn.kind,
    origin: explicitlyDerivedOrigin || thirdColumn.origin || originResult.origin,
    quoteBasis: text(row.quoteBasis) || thirdColumn.quoteBasis,
    specification: cleanSpecification(gradeResult.remaining),
    productForm,
    rawDetail: detail,
    semanticVersion: 3
  };
}

function sourceCellRange(row, field) {
  const points = row.sourceCells?.[field] || [];
  const ys = points.map(point => Number(point?.[1])).filter(Number.isFinite);
  return ys.length ? { top: Math.min(...ys), bottom: Math.max(...ys) } : null;
}

function inheritMergedCompanies(rows) {
  const labeled = rows.filter(row => row.company && sourceCellRange(row, 'company'));
  if (!labeled.length) return rows;
  return rows.map(row => {
    if (row.company) return row;
    const y = centerY(row);
    const owner = labeled.find(candidate => {
      const range = sourceCellRange(candidate, 'company');
      return range && range.top <= y && y <= range.bottom;
    });
    return owner ? { ...row, company: owner.company, companySource: 'merged-cell-inheritance' } : row;
  });
}

function refreshSemanticReasons(row) {
  const obsolete = [
    '材质/品种缺失', '公司名称缺失', '产地缺失', '第三列原文缺失', '产品形态缺失',
    '公司名称来自合并单元格映射，请对照原图', '产地由同一原图中的重复字形补全，请重点核对'
  ];
  const reasons = (row.anomalyReasons || []).filter(reason => (
    !obsolete.includes(reason)
    && !reason.startsWith('公司名称来自合并单元格')
    && !reason.startsWith('产地由同一原图中的重复字形补全')
  ));
  if (!row.material) reasons.push('产品型号缺失');
  if (!row.company) reasons.push('公司名称缺失');
  if (!row.thirdColumnRaw) reasons.push('第三列原文缺失');
  if (!row.productForm) reasons.push('产品形态缺失');
  return [...new Set(reasons)];
}

function rowSegments(rows) {
  if (!rows.length) return [];
  const gaps = rows.slice(1).map((row, index) => centerY(row) - centerY(rows[index])).filter(value => value > 0 && value < 100);
  const normalGap = median(gaps) || 18;
  const maxGap = Math.max(54, normalGap * 3.2);
  const segments = [[rows[0]]];
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];
    const yGap = centerY(current) - centerY(previous);
    const low = Math.min(priceOf(previous), priceOf(current));
    const high = Math.max(priceOf(previous), priceOf(current));
    const priceBandChanged = low > 0 && high / low >= 1.48;
    const explicitMaterialChanged = previous.material && current.material && previous.material !== current.material;
    if (yGap > maxGap || priceBandChanged || explicitMaterialChanged) segments.push([current]);
    else segments.at(-1).push(current);
  }
  return segments;
}

function inheritMergedMaterials(segment) {
  const labeled = segment.map((row, index) => ({ row, index })).filter(item => item.row.material);
  if (!labeled.length) return segment;
  return segment.map((row, index) => {
    if (row.material) return row;
    const nearest = labeled.reduce((best, item) => {
      const distance = Math.abs(item.index - index);
      return !best || distance < best.distance ? { ...item, distance } : best;
    }, null);
    if (!nearest || nearest.distance > 14) return row;
    return { ...row, material: nearest.row.material, materialSource: 'merged-cell-inheritance' };
  });
}

export function normalizeMarketOcrRows(rows = []) {
  const normalized = inheritMergedCompanies([...rows]
    .sort((a, b) => centerY(a) - centerY(b))
    .map(normalizeOne));
  return rowSegments(normalized).flatMap(inheritMergedMaterials);
}

export function migrateMarketSemanticRow(row = {}) {
  if (row.reviewStatus === 'verified') return row;
  const recognizerVersion = String(row.recognizerVersion || '').startsWith('structure-') ? 'structure-v4' : (row.recognizerVersion || 'legacy-coordinate');
  const normalized = Number(row.semanticVersion || 0) >= 3 ? { ...row, recognizerVersion } : { ...normalizeOne(row), recognizerVersion };
  return { ...normalized, anomalyReasons: refreshSemanticReasons(normalized) };
}

export function migrateMarketSemanticRows(rows = []) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.snapshotId || '__ungrouped__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.values()].flatMap(group => {
    const repairable = group.filter(row => row.reviewStatus !== 'verified');
    const repaired = new Map(normalizeMarketOcrRows(repairable).map(row => {
      const migrated = migrateMarketSemanticRow(row);
      return [migrated.id, migrated];
    }));
    return group.map(row => repaired.get(row.id) || row);
  });
}
