import { dialog, pageHeader } from '../ui/components.js';
import { escapeHtml, formatNumber } from '../core/format.js';
import { assignSeriesAxes, verifiedMarketRows } from '../services/market-review.js';

const colors = ['#8fcf2f', '#58a6ff', '#ffb14a', '#c98cff', '#36c2b4', '#ff748b', '#8cb4d8', '#b7c85a', '#e38d68', '#73b986'];

function timeLabel(value) {
  if (!value) return '尚未同步';
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function options(rows, key, selected, allLabel) {
  const values = [...new Set(rows.map(item => item[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'zh-CN'));
  return `<option value="">${escapeHtml(allLabel)}</option>${values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}`;
}

function marketSessionLabel(row = {}) {
  return row.sessionLabel || ({ morning: '上午', afternoon: '下午' }[row.session]) || row.session || '整日';
}

function axisRangeLabel(values = [], unit = '') {
  const finite = values.map(Number).filter(Number.isFinite);
  if (!finite.length) return `暂无 · ${unit}`;
  return `${formatNumber(Math.min(...finite), 0)}–${formatNumber(Math.max(...finite), 0)} ${unit}`;
}

function chartSeriesInspector(item) {
  if (!item) return `<aside class="market-series-inspector is-empty" id="market-series-detail" aria-live="polite"><span class="market-series-inspector__index">SELECT / SERIES</span><div><strong>点击任意折线</strong><p>锁定后显示材质、产地、规格与价格变化；点击图表空白处即可返回全部曲线。</p></div></aside>`;
  const first = item.items[0];
  const latest = item.items.at(-1);
  const firstPrice = Number(first.normalizedPrice ?? first.rawPrice);
  const latestPrice = Number(latest.normalizedPrice ?? latest.rawPrice);
  const values = item.items.map(row => Number(row.normalizedPrice ?? row.rawPrice)).filter(Number.isFinite);
  const delta = latestPrice - firstPrice;
  const deltaPercent = firstPrice ? delta / firstPrice * 100 : 0;
  const deltaTone = delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : 'is-flat';
  const sign = delta > 0 ? '+' : '';
  return `<aside class="market-series-inspector" id="market-series-detail" aria-live="polite" style="--series-color:${item.color}">
    <header><span class="market-series-inspector__index">${item.axis === 'left' ? 'L' : 'R'} / SELECTED SERIES</span><i aria-hidden="true"></i></header>
    <h3>${escapeHtml(first.material || '未命名材质')}</h3>
    <p class="market-series-inspector__identity">${escapeHtml([first.origin || first.company, first.productForm, first.specification].filter(Boolean).join(' · ') || '口径信息待补充')}</p>
    <strong class="market-series-inspector__price">${escapeHtml(formatNumber(latestPrice, 0))}<small>${escapeHtml(item.unit)}</small></strong>
    <span class="market-series-inspector__change ${deltaTone}">${sign}${escapeHtml(formatNumber(delta, 0))} · ${sign}${deltaPercent.toFixed(2)}%</span>
    <dl>
      <div><dt>盘次</dt><dd>${escapeHtml(marketSessionLabel(latest))}</dd></div>
      <div><dt>价格范围</dt><dd>${escapeHtml(`${formatNumber(Math.min(...values), 0)}–${formatNumber(Math.max(...values), 0)}`)}</dd></div>
      <div><dt>日期范围</dt><dd>${escapeHtml(`${first.marketDate} → ${latest.marketDate}`)}</dd></div>
      <div><dt>数据点</dt><dd>${item.items.length} 个</dd></div>
      <div><dt>来源</dt><dd>${escapeHtml(latest.source || '—')}</dd></div>
      <div><dt>纵轴</dt><dd>${item.axis === 'left' ? '左轴 · 常规价带' : '右轴 · 高价带'}</dd></div>
    </dl>
    ${latest.sourceUrl ? `<a href="${escapeHtml(latest.sourceUrl)}" target="_blank" rel="noreferrer">查看最近一期来源 ↗</a>` : ''}
  </aside>`;
}

function chartAxisNavigator(series, axis, selectedKey) {
  const items = series.filter(item => item.axis === axis);
  if (!items.length) return '';
  const values = items.flatMap(item => item.items.map(row => Number(row.normalizedPrice ?? row.rawPrice)));
  return `<section class="market-axis-group market-axis-group--${axis}" aria-label="${axis === 'left' ? '左轴常规价带' : '右轴高价带'}">
    <header><span>${axis === 'left' ? 'L' : 'R'}</span><div><strong>${axis === 'left' ? '左轴 · 常规价带' : '右轴 · 高价带'}</strong><small>${escapeHtml(axisRangeLabel(values, items[0]?.unit || ''))}</small></div></header>
    <div>${items.map(item => {
      const latest = item.items.at(-1);
      const selected = item.key === selectedKey;
      return `<button type="button" data-action="select-market-series" data-series-key="${escapeHtml(item.key)}" aria-pressed="${selected}" class="market-series-button ${selected ? 'is-selected' : ''}" style="--series-color:${item.color}"><i aria-hidden="true"></i><span><strong>${escapeHtml(item.items[0]?.material || '未命名材质')}</strong><small>${escapeHtml([item.items[0]?.origin || item.items[0]?.company, item.items[0]?.specification, marketSessionLabel(latest)].filter(Boolean).join(' · '))}</small></span><em>${escapeHtml(formatNumber(latest?.normalizedPrice ?? latest?.rawPrice, 0))}</em></button>`;
    }).join('')}</div>
  </section>`;
}

function chartSvg(rows, selectedSeriesKey = '') {
  const series = assignSeriesAxes(rows).map((item, index) => ({ ...item, color: colors[index % colors.length] }));
  if (!series.length) return `<div class="market-chart-empty"><strong>还没有已确认的价格点</strong><p>新的结构化价格请在“Mysteel 报价”目录逐行核对；小程序原图只作日期档案。待复核数据不会进入正式曲线。</p></div>`;
  const selectedItem = series.find(item => item.key === selectedSeriesKey);
  const activeKey = selectedItem?.key || '';
  const dates = [...new Set(rows.map(item => item.marketDate))].sort();
  const chartWidth = Math.max(820, 148 + dates.length * 56);
  const plot = { left: 74, right: chartWidth - 74, top: 36, bottom: 270 };
  const x = date => dates.length <= 1 ? (plot.left + plot.right) / 2 : plot.left + (dates.indexOf(date) / (dates.length - 1)) * (plot.right - plot.left);
  const axisValues = axis => series.filter(item => item.axis === axis).flatMap(item => item.items.map(row => Number(row.normalizedPrice ?? row.rawPrice))).filter(Number.isFinite);
  const extent = values => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.12, Math.abs(max || 1) * 0.015);
    return [min - pad, max + pad];
  };
  const leftExtent = extent(axisValues('left'));
  const rightValues = axisValues('right');
  const rightExtent = rightValues.length ? extent(rightValues) : leftExtent;
  const y = (value, axis) => {
    const [min, max] = axis === 'right' ? rightExtent : leftExtent;
    return plot.bottom - ((Number(value) - min) / Math.max(max - min, 1)) * (plot.bottom - plot.top);
  };
  const grid = [0, .25, .5, .75, 1].map(ratio => {
    const py = plot.bottom - ratio * (plot.bottom - plot.top);
    const leftValue = leftExtent[0] + ratio * (leftExtent[1] - leftExtent[0]);
    const rightValue = rightExtent[0] + ratio * (rightExtent[1] - rightExtent[0]);
    return `<line x1="${plot.left}" y1="${py}" x2="${plot.right}" y2="${py}" class="chart-grid"/><line x1="${plot.left - 5}" y1="${py}" x2="${plot.left}" y2="${py}" class="chart-axis-tick chart-axis-tick--left"/><text class="chart-axis-value chart-axis-value--left" x="${plot.left - 10}" y="${py + 4}" text-anchor="end">${escapeHtml(formatNumber(leftValue, 0))}</text>${rightValues.length ? `<line x1="${plot.right}" y1="${py}" x2="${plot.right + 5}" y2="${py}" class="chart-axis-tick chart-axis-tick--right"/><text class="chart-axis-value chart-axis-value--right" x="${plot.right + 10}" y="${py + 4}" text-anchor="start">${escapeHtml(formatNumber(rightValue, 0))}</text>` : ''}`;
  }).join('');
  const lines = series.map((item, index) => {
    const points = item.items.map(row => `${x(row.marketDate).toFixed(1)},${y(row.normalizedPrice ?? row.rawPrice, item.axis).toFixed(1)}`).join(' ');
    const markers = item.items.map(row => `<circle class="${Number(row.anomalyScore || 0) > 0 ? 'is-anomaly' : ''}" cx="${x(row.marketDate)}" cy="${y(row.normalizedPrice ?? row.rawPrice, item.axis)}" r="${Number(row.anomalyScore || 0) > 0 ? '5' : '3'}"><title>${escapeHtml(`${item.label} · ${row.marketDate} · ${formatNumber(row.normalizedPrice ?? row.rawPrice, 2)} ${row.unit}${row.anomalyReasons?.length ? ` · 复核提示：${row.anomalyReasons.join('；')}` : ''}`)}</title></circle>`).join('');
    const selected = item.key === activeKey;
    return `<g class="chart-series ${selected ? 'is-selected' : ''} ${activeKey && !selected ? 'is-muted' : ''}" style="--series-color:${item.color}" data-axis="${item.axis}" data-action="select-market-series" data-series-key="${escapeHtml(item.key)}" role="button" tabindex="0" aria-pressed="${selected}" aria-label="查看 ${escapeHtml(item.label)} ${escapeHtml(marketSessionLabel(item.items.at(-1)))} 曲线详情"><polyline class="chart-hit-line" points="${points}"/><polyline class="chart-line" points="${points}"/>${markers}</g>`;
  }).join('');
  const dateLabels = dates.filter(Boolean)
    .map(date => `<line x1="${x(date)}" y1="${plot.bottom}" x2="${x(date)}" y2="${plot.bottom + 6}" class="chart-date-tick"/><text class="chart-date-label" x="${x(date)}" y="${plot.bottom + 25}" text-anchor="middle">${escapeHtml(date.slice(5))}</text>`).join('');
  const unit = series[0]?.unit || '';
  return `<figure class="market-chart-console" aria-labelledby="market-chart-title" data-has-selection="${Boolean(activeKey)}" data-action="clear-market-series">
    <div class="market-chart-console__head"><div><span>PRICE SIGNAL / VERIFIED</span><strong id="market-chart-title">不锈钢价格轨迹</strong></div><p>${activeKey ? '已聚焦单条曲线 · 点击任意空白处返回全部' : '点击折线或下方系列定位详情'}${rows.some(row => Number(row.anomalyScore || 0) > 0) ? ' · 琥珀色圆点：异常波动 · 需再次核对来源' : ''}</p></div>
    <div class="market-chart-stage">
      <div class="market-chart-wrap"><svg class="market-chart" viewBox="0 0 ${chartWidth} 330"${chartWidth > 820 ? ` style="min-inline-size:${chartWidth}px"` : ''} role="group" aria-labelledby="market-chart-title market-chart-desc"><desc id="market-chart-desc">横轴展示全部已确认行情日期，左轴展示常规价格带，右轴展示高价格带。可点击或使用键盘选择折线查看材质、产地、规格与价格详情。</desc><rect class="chart-plot-bg" x="${plot.left}" y="${plot.top}" width="${plot.right - plot.left}" height="${plot.bottom - plot.top}"/>${grid}<line x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.bottom}" class="chart-axis chart-axis--left"/><line x1="${plot.right}" y1="${plot.top}" x2="${plot.right}" y2="${plot.bottom}" class="chart-axis chart-axis--right"/><line x1="${plot.left}" y1="${plot.bottom}" x2="${plot.right}" y2="${plot.bottom}" class="chart-axis chart-axis--x"/>${lines}${dateLabels}<text x="${plot.left}" y="17" class="chart-axis-title chart-axis-title--left">L / 常规价带 / ${escapeHtml(unit)}</text>${rightValues.length ? `<text x="${plot.right - 8}" y="17" text-anchor="end" class="chart-axis-title chart-axis-title--right">R / 高价带 / ${escapeHtml(unit)}</text>` : ''}<text x="${(plot.left + plot.right) / 2}" y="320" text-anchor="middle" class="chart-x-axis-title">日期 / DATE</text></svg></div>
      ${chartSeriesInspector(selectedItem)}
    </div>
    <div class="market-axis-navigator">${chartAxisNavigator(series, 'left', activeKey)}${chartAxisNavigator(series, 'right', activeKey)}</div>
  </figure>`;
}

function chartTable(rows) {
  if (!rows.length) return '';
  return `<details class="market-data-table"><summary>查看曲线对应的已确认数据（${rows.length} 条）</summary><div class="table-scroll"><table><thead><tr><th>日期/盘次</th><th>材质</th><th>形态</th><th>产地/钢厂</th><th>规格</th><th>价格</th><th>单位</th><th>来源</th><th>异常提示</th></tr></thead><tbody>${rows.map(row => `<tr><td>${escapeHtml(row.marketDate)} · ${escapeHtml(row.sessionLabel || row.session)}</td><td>${escapeHtml(row.material)}</td><td>${escapeHtml(row.productForm || '—')}</td><td>${escapeHtml(row.origin || '—')}</td><td>${escapeHtml(row.specification || '—')}</td><td>${escapeHtml(formatNumber(row.normalizedPrice ?? row.rawPrice, 2))}</td><td>${escapeHtml(row.unit)}</td><td>${escapeHtml(row.source)}</td><td>${escapeHtml(row.anomalyReasons?.join('；') || '—')}</td></tr>`).join('')}</tbody></table></div></details>`;
}

function reviewDialog(snapshot, rows) {
  if (!snapshot) return '';
  const structuredSource = snapshot.sourceType === 'structured-table';
  const rowCards = rows.map((row, index) => {
    const warnings = row.anomalyReasons || [];
    const inheritedHint = ['merged-cell-inheritance', 'merged-cell-geometry'].includes(row.materialSource)
      ? '<small class="field-hint">由第一列合并单元格映射，请对照原图确认</small>'
      : '';
    const companyHint = ['merged-cell-geometry', 'merged-cell-inheritance'].includes(row.companySource)
      ? `<small class="field-hint field-hint--resolved">已从第二列合并单元格自动继承：${escapeHtml(row.company || '待识别')}</small>`
      : '';
    const thirdColumnKinds = { origin: '产地/钢厂', form: '形态/口径', mixed: '产地与形态混合', basis: '报价口径', unknown: '待判断' };
    const thirdColumnKind = thirdColumnKinds[row.thirdColumnKind] || '待判断';
    const disagreementLabels = { material: '产品型号', company: '公司名称', origin: '第三列原文', price: '报价', 'missing-second-pass': '第二遍未识别', 'missing-color-pass': '第一遍未识别' };
    const disagreementText = (row.disagreementFields || []).map(field => disagreementLabels[field] || field).join('、');
    const reviewLabel = structuredSource
      ? `网页表格已解析${row.change && row.change !== '-' ? ` · 涨跌 ${escapeHtml(row.change)}` : ''}`
      : disagreementText ? `需核对：${escapeHtml(disagreementText)}` : `双遍一致 · OCR ${(Number(row.confidence || 0) * 100).toFixed(0)}%`;
    return `<article class="review-price-row ${row.disagreement || (!structuredSource && Number(row.confidence) < .9) || warnings.length ? 'has-warning' : ''}" data-price-row data-price-id="${escapeHtml(row.id)}">
      <header><label><input type="checkbox" data-field="include" ${row.reviewStatus !== 'rejected' ? 'checked' : ''}/> 第 ${index + 1} 条报价</label><span>${reviewLabel}</span></header>
      <div class="review-price-grid">
        <label>${structuredSource ? '品种 / 材质' : '第一列 · 产品型号'}<input data-field="material" value="${escapeHtml(row.material || '')}" placeholder="例如 430/2B" required />${inheritedHint}</label>
        <label>${structuredSource ? '钢厂 / 产地' : '第二列 · 公司名称'}<input data-field="company" value="${escapeHtml(row.company || '')}" placeholder="例如 太钢" required />${companyHint}</label>
        <label>${structuredSource ? '来源中的产地原文' : '第三列原文 · 产地/形态混合'} <small>${structuredSource ? '保留原表值' : `判断：${escapeHtml(thirdColumnKind)}`}</small><input data-field="thirdColumnRaw" value="${escapeHtml(row.thirdColumnRaw || row.origin || '')}" placeholder="例如 太钢" required /></label>
        <label>${structuredSource ? '公开表格价格' : '第四列 · 当日报价'}<input data-field="normalizedPrice" type="number" min="0.01" step="0.01" value="${escapeHtml(row.normalizedPrice ?? row.rawPrice ?? '')}" required /></label>
        <label>识别出的产地/钢厂 <small>“卷、板、宽冷轧”等不会填到这里</small><input data-field="origin" value="${escapeHtml(row.origin || '')}" placeholder="例如 张浦；没有则留空" /></label>
        <label>产品形态 <small>由产品型号和第三列共同判断</small><input data-field="productForm" value="${escapeHtml(row.productForm || '')}" placeholder="卷 / 板 / 管 / 带" required /></label>
        <label>报价口径 <small>第三列中的宽度、表面或基价说明</small><input data-field="quoteBasis" value="${escapeHtml(row.quoteBasis || '')}" placeholder="例如 宽冷轧1500卷" /></label>
        <label>规格 <small>这张原表没有规格列，可留空</small><input data-field="specification" value="${escapeHtml(row.specification || '')}" placeholder="例如 0.6×1219" /></label>
        <label>单位<select data-field="unit"><option value="CNY/MT" ${row.unit === 'CNY/MT' ? 'selected' : ''}>人民币 / 吨</option><option value="CNY/kg" ${row.unit === 'CNY/kg' ? 'selected' : ''}>人民币 / 千克</option><option value="CNY/sheet" ${row.unit === 'CNY/sheet' ? 'selected' : ''}>人民币 / 张</option></select></label>
      </div>
      ${warnings.length ? `<ul class="review-warnings">${warnings.map(reason => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>` : ''}
      <details><summary>${structuredSource ? '查看公开表格原始字段' : '查看两次 OCR 原文、字段置信度与单元格坐标'}</summary><pre>${escapeHtml(JSON.stringify(structuredSource ? row.rawSource : { passes: row.ocrPasses, fieldConfidence: row.fieldConfidence, cells: row.sourceCells }, null, 2))}</pre></details>
    </article>`;
  }).join('');
  const sourcePane = structuredSource
    ? `<div class="market-review__article"><p class="eyebrow">PUBLIC STRUCTURED SOURCE</p><h3>${escapeHtml(snapshot.title)}</h3><dl><div><dt>发布来源</dt><dd>Mysteel 公开卷板汇总</dd></div><div><dt>发布时间</dt><dd>${escapeHtml(snapshot.publishedAt || snapshot.marketDate)}</dd></div><div><dt>已解析</dt><dd>${rows.length} 条待复核价格</dd></div></dl><a class="button button--primary" href="${escapeHtml(snapshot.sourceUrl)}" target="_blank" rel="noreferrer">打开原文逐行核对 ↗</a><p>SteelDesk 只保存用于本机复核的字段与来源链接，不绕过登录、会员或版权限制。</p></div>`
    : `<div class="market-review__image"><img src="${escapeHtml(snapshot.imageUrl)}" alt="${escapeHtml(snapshot.imageLabel || snapshot.title)}" referrerpolicy="no-referrer" /></div>`;
  const body = `<form id="market-review-form" class="market-review" data-snapshot-id="${escapeHtml(snapshot.id)}"><section class="market-review__source"><div class="review-callout"><strong>${structuredSource ? '原网页表格是事实来源' : '原图是唯一事实来源'}</strong><p>${structuredSource ? '系统读取公开表格字段并保留原文；必须打开原文逐行核对后，记录才能进入正式行情。' : '系统恢复“产品型号 / 公司名称 / 第三列原文 / 当日报价”四列，并展开前两列的合并单元格。第三列原文会再拆分为产地/钢厂、产品形态和报价口径；未确认记录不会进入价格曲线。'}</p></div>${sourcePane}</section><section class="market-review__editor"><div class="review-editor-head"><div><p class="eyebrow">${escapeHtml(snapshot.marketDate)} / ${escapeHtml(snapshot.sessionLabel)}</p><h3>${structuredSource ? '网页表格解析结果' : '结构识别结果'} · ${rows.length} 条</h3></div><span>逐条可修改</span></div><div class="review-row-list">${rowCards || '<div class="market-chart-empty"><strong>没有提取出可靠的价格行</strong><p>来源页面可能换版或内容不完整，请返回查看原始来源。</p></div>'}</div><label class="review-confirm"><input id="market-review-confirm" name="confirmSource" type="checkbox" /><span><strong>${structuredSource ? '我已逐行对照 Mysteel 原文' : '我已逐项对照原图'}</strong><small>已确认产品型号、公司名称、来源原文、语义拆分、单位、小数点和价格；勾选后才能标记为“已确认”。</small></span></label></section></form>`;
  const footer = `<button class="button button--ghost" value="cancel">关闭</button><button class="button button--ghost" type="submit" form="market-review-form" formnovalidate name="reviewAction" value="draft">保存待复核</button><button class="button button--primary" type="submit" form="market-review-form" name="reviewAction" value="verify">确认并加入行情</button>`;
  return dialog('market-review-dialog', '复核报价识别结果', body, footer);
}

function sortSnapshotsNewestFirst(items = []) {
  const sessionRank = { afternoon: 2, morning: 1 };
  return [...items].sort((left, right) => {
    const dateOrder = String(right.marketDate || '').localeCompare(String(left.marketDate || ''));
    if (dateOrder) return dateOrder;
    const sessionOrder = (sessionRank[right.session] || 0) - (sessionRank[left.session] || 0);
    if (sessionOrder) return sessionOrder;
    return String(right.publishedAt || right.syncedAt || '').localeCompare(String(left.publishedAt || left.syncedAt || ''));
  });
}

function marketSourceEntry(item, prices, isLatest = false) {
  const rows = prices.filter(row => row.snapshotId === item.id);
  const verifiedCount = rows.filter(row => row.reviewStatus === 'verified').length;
  const pendingCount = rows.filter(row => row.reviewStatus === 'needs_review').length;
  const structuredSource = item.sourceType === 'structured-table';
  const recognizable = /^https:\/\/wuxibuxiugang\.oss-cn-hangzhou\.aliyuncs\.com\/.+\.(?:png|jpe?g)$/i.test(item.imageUrl || '');
  const statusLabel = structuredSource
    ? pendingCount ? `待复核 ${pendingCount}` : verifiedCount ? `已确认 ${verifiedCount}` : '等待数据'
    : recognizable ? '原图已归档' : '等待原图';
  const statusTone = structuredSource && pendingCount ? 'is-warning' : recognizable || verifiedCount ? 'is-ready' : 'is-muted';
  const preview = structuredSource
    ? `<div class="market-sheet__structured"><table><caption>Mysteel 公开表格解析预览</caption><thead><tr><th>品种</th><th>钢厂</th><th>规格</th><th>价格</th></tr></thead><tbody>${rows.slice(0, 8).map(row => `<tr><td>${escapeHtml(row.material)}</td><td>${escapeHtml(row.origin || row.company)}</td><td>${escapeHtml(row.specification || '—')}</td><td>${escapeHtml(formatNumber(row.normalizedPrice, 0))}</td></tr>`).join('')}</tbody></table><p>${rows.length > 8 ? `另有 ${rows.length - 8} 条，进入复核可查看全部。` : rows.length ? '全部记录均需打开原文逐行核对。' : '这篇来源暂未提取出可复核价格。'}</p></div>`
    : recognizable
      ? `<a class="market-sheet__image" href="${escapeHtml(item.imageUrl)}" target="_blank" rel="noreferrer" aria-label="在新窗口查看 ${escapeHtml(item.marketDate)} ${escapeHtml(item.sessionLabel || '')} 报价原图"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageLabel || item.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></a>`
      : '<div class="market-source-entry__empty"><strong>这条记录还没有可用原图</strong><p>已保留发布日期与文章入口，后续同步会继续检查。</p></div>';
  const primaryAction = structuredSource
    ? pendingCount
      ? `<button class="button button--primary" data-action="open-market-review" data-id="${escapeHtml(item.id)}">复核这份表格</button>`
      : verifiedCount ? '<span class="badge badge--success">人工确认结果已锁定</span>' : '<span class="badge badge--warning">没有可复核价格</span>'
    : recognizable ? `<a class="button button--primary" href="${escapeHtml(item.imageUrl)}" target="_blank" rel="noreferrer">打开报价原图 ↗</a>` : '<span class="badge badge--warning">原图尚未上传</span>';
  return `<details class="market-source-entry ${isLatest ? 'is-latest' : ''}">
    <summary>
      <time datetime="${escapeHtml(item.marketDate)}"><strong>${escapeHtml(item.marketDate)}</strong><span>${escapeHtml(item.sessionLabel || '整日')}</span></time>
      <span class="market-source-entry__title"><strong>${escapeHtml(item.title)}</strong><small>${structuredSource ? '公开表格 · 可逐行复核' : '小程序原始图片 · 不做自动识别'}</small></span>
      <span class="market-source-entry__status ${statusTone}">${escapeHtml(statusLabel)}</span>
      <span class="market-source-entry__toggle" aria-hidden="true"></span>
    </summary>
    <div class="market-source-entry__content">${preview}<footer><span>${structuredSource ? 'Mysteel 公开表格' : '小程序报价原图'}${isLatest ? ' · 当前最新' : ''}</span><div class="market-sheet__actions"><a class="text-button" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">查看来源文章 ↗</a>${primaryAction}</div></footer></div>
  </details>`;
}

function marketSourceFolder({ key, code, title, description, snapshots, prices, open = false }) {
  const ordered = sortSnapshotsNewestFirst(snapshots);
  const dateCount = new Set(ordered.map(item => item.marketDate).filter(Boolean)).size;
  return `<details class="market-source-folder" data-market-source-folder="${escapeHtml(key)}" ${open ? 'open' : ''}>
    <summary>
      <span class="market-source-folder__mark" aria-hidden="true">${escapeHtml(code)}</span>
      <span class="market-source-folder__identity"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small></span>
      <span class="market-source-folder__count"><strong>${ordered.length}</strong><small>${dateCount} 个日期</small></span>
      <span class="market-source-folder__toggle" aria-hidden="true"></span>
    </summary>
    <div class="market-source-folder__body">${ordered.length
      ? ordered.map((item, index) => marketSourceEntry(item, prices, index === 0)).join('')
      : '<div class="market-source-folder__empty"><strong>目录暂时为空</strong><p>点击页面上方“立即同步”后再检查。</p></div>'}</div>
  </details>`;
}

export function renderMarket(state, selectedSnapshotId = '', filters = {}, openFolders = new Set(), selectedSeriesKey = '') {
  const snapshots = sortSnapshotsNewestFirst(state.marketSnapshots || []);
  const prices = state.marketPrices || [];
  const latestSync = snapshots.map(item => item.syncedAt).filter(Boolean).sort().at(-1);
  const latestDate = snapshots[0]?.marketDate || '待同步';
  const latestDayCount = snapshots.filter(item => item.marketDate === snapshots[0]?.marketDate).length;
  const needsReview = prices.filter(item => item.reviewStatus === 'needs_review' && (item.sourceType === 'structured-table' || item.sourceKey === 'mysteel' || item.source === 'Mysteel')).length;
  const verified = prices.filter(item => item.reviewStatus === 'verified');
  const effectiveUnit = filters.unit || verified[0]?.unit || 'CNY/MT';
  const chartRows = verifiedMarketRows(prices, { ...filters, unit: effectiveUnit });
  const unitRows = verifiedMarketRows(prices, { unit: effectiveUnit });
  const chartDateCount = new Set(chartRows.map(item => item.marketDate).filter(Boolean)).size;
  const verifiedDateCount = new Set(unitRows.map(item => item.marketDate).filter(Boolean)).size;
  const pendingDateCount = new Set(prices.filter(item => item.reviewStatus === 'needs_review' && item.unit === effectiveUnit).map(item => item.marketDate).filter(Boolean)).size;
  const activeFilterCount = ['material', 'origin', 'specification', 'source', 'session'].filter(key => filters[key]).length;
  const selectedSnapshot = snapshots.find(item => item.id === selectedSnapshotId);
  const reviewRows = prices.filter(item => item.snapshotId === selectedSnapshotId && item.reviewStatus !== 'verified');
  const miniProgramSnapshots = snapshots.filter(item => item.sourceType !== 'structured-table');
  const mysteelSnapshots = snapshots.filter(item => item.sourceType === 'structured-table');
  const sourceArchive = snapshots.length
    ? `<section class="market-source-library" aria-label="按来源分类的报价档案">
        ${marketSourceFolder({ key: 'mini-program', code: '小', title: '小程序报价', description: '只归档小程序发布的原始报价图片', snapshots: miniProgramSnapshots, prices, open: openFolders.has('mini-program') })}
        ${marketSourceFolder({ key: 'mysteel', code: 'M', title: 'Mysteel 报价', description: '公开表格解析后逐行人工复核', snapshots: mysteelSnapshots, prices, open: openFolders.has('mysteel') })}
      </section>`
    : '<article class="panel empty-market"><p class="eyebrow">WAITING FOR FIRST SYNC</p><h2>还没有行情来源</h2><p>点击“立即同步”后，工作台会分别建立“小程序报价”和“Mysteel 报价”目录。</p></article>';
  return `${pageHeader({ eyebrow: 'MARKET DATA / SOURCE ARCHIVE', title: '无锡不锈钢每日报价', description: '小程序报价只保存原始图片；Mysteel 报价保存公开表格解析结果。两个目录都按日期从近到远排列，展开单条记录后再查看来源。', actions: '<button class="button button--primary" data-action="refresh-market">立即同步</button>' })}
    <section class="metric-grid market-metrics" aria-label="行情同步概况"><article class="metric"><span>最新行情日</span><strong>${escapeHtml(latestDate)}</strong><small>${latestDayCount ? `${latestDayCount} 份来源记录` : '等待首次同步'}</small></article><article class="metric"><span>已确认价格</span><strong>${verified.length}</strong><small>可进入曲线与分析</small></article><article class="metric ${needsReview ? 'metric--warning' : ''}"><span>待人工复核</span><strong>${needsReview}</strong><small>仅 Mysteel 表格需逐行确认</small></article><article class="metric"><span>最后检查</span><strong>${escapeHtml(timeLabel(latestSync))}</strong><small>打开工作台后每 2 小时检查</small></article></section>
    <section class="panel market-trend"><header class="panel__header"><div><p class="eyebrow">VERIFIED PRICE HISTORY</p><h2>每日价格波动 · 双纵轴</h2></div><span>已显示 ${chartDateCount}/${verifiedDateCount} 个已确认日期 · 待复核 ${pendingDateCount} 个日期 · 无日期上限 · ${chartRows.length} 条${activeFilterCount ? ` · ${activeFilterCount} 个筛选` : ''}</span></header><form class="market-filters" id="market-filter-form"><label>材质<select name="material">${options(verified, 'material', filters.material, '全部材质')}</select></label><label>产地/钢厂<select name="origin">${options(verified, 'origin', filters.origin, '全部产地')}</select></label><label>规格<select name="specification">${options(verified, 'specification', filters.specification, '全部规格')}</select></label><label>盘次<select name="session">${options(verified, 'session', filters.session, '上午+下午')}</select></label><label>单位<select name="unit">${options(verified, 'unit', effectiveUnit, '选择单位')}</select></label><label>来源<select name="source">${options(verified, 'source', filters.source, '全部来源')}</select></label>${activeFilterCount ? '<button class="button button--secondary market-filters__reset" type="button" data-action="reset-market-filters">清除筛选 · 显示全部日期</button>' : ''}</form><div class="market-trend__body">${chartSvg(chartRows, selectedSeriesKey)}${chartTable(chartRows)}<p class="chart-note">图表不限制日期数量，并为全部已确认日期保留横轴刻度；日期增加后可横向查看。左轴与右轴只分配同一单位下的低/高价格带，不同单位绝不混放。待复核价格仍需对照 Mysteel 原文确认后才进入正式曲线。</p></div></section>
    <div class="section-heading"><div><p class="eyebrow">SOURCE LIBRARY / NEWEST FIRST</p><h2>报价档案目录</h2></div><span>${snapshots.length} 份记录 · ${new Set(snapshots.map(item => item.marketDate)).size} 个日期</span></div>
    ${sourceArchive}${reviewDialog(selectedSnapshot, reviewRows)}`;
}
