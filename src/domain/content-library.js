const now = '2026-10-11T00:00:00+08:00';

export const contentProductionPack = [
  {
    id: 'content_430',
    title: '商用厨房设备采购：哪些部件适合 430，哪些情况应考虑 304',
    pillar: '应用案例', campaign: '商用厨房采购决策', objective: '帮助采购方按部件和使用环境完成材料选型',
    audience: '商用厨房、家电、水槽及一般制造业采购与工程人员',
    buyerDecision: '根据零件用途、清洗环境、成形和焊接要求确定 430 或 304 候选方案', buyerIntentVersion: 1,
    channels: ['LinkedIn', 'Facebook', 'TikTok'], language: '中/英', status: 'pending_approval',
    body: '430 与 304 不是简单的低配和高配关系。430 属于铁素体不锈钢，通常具有磁性且不依赖镍；304 属于奥氏体不锈钢，通常在耐蚀性、深冲和焊接适应性方面覆盖更广。正确选材应同时确认腐蚀介质、成形深度、焊接方式、表面要求和目标成本。最终牌号与性能必须按适用标准、钢厂资料和具体工况确认。',
    proofPoints: ['腐蚀介质与清洗方式', '深冲和折弯程度', '焊接与后处理', '表面与磁性要求', '成本稳定性与供货'],
    factNote: '技术表述为牌号家族的一般比较；发布前仍需结合具体标准、钢厂数据与最终用途复核。',
    scheduledAt: '2026-10-12T09:00:00+08:00', createdAt: now,
    variants: [
      {
        id: 'variant_430_linkedin', platform: 'LinkedIn', format: 'Carousel + text post', language: 'English',
        spec: '1080 × 1350 px · 6 slides · 4:5', status: 'ready',
        hook: 'Buying stainless steel for commercial-kitchen equipment? Start with the component and cleaning environment—not a 430 vs 304 price ladder.',
        caption: `A backsplash, an inner appliance panel and a deeply formed sink do not face the same service or fabrication conditions. That is why a purchasing team should not choose 430 or 304 from price alone.\n\nBefore requesting a quotation, identify the actual component and confirm five buying conditions:\n1. Contact with salt, chemicals, humidity and cleaning agents\n2. Drawing depth, bends and forming route\n3. Welding method and finishing requirements\n4. Surface appearance and magnetic-response requirements\n5. Target volume, dimensions and destination\n\n430 can be a practical candidate for suitable appliance, kitchen and decorative components. 304 generally provides a broader operating window for demanding corrosion, deep drawing and welding conditions. The final grade still depends on the drawing, applicable standard and real service environment.\n\nSend the component, dimensions, surface, annual demand and destination for a quotation-ready grade shortlist.`,
        hashtags: '#StainlessSteel #FerriticStainless #Grade430 #Grade304 #MaterialSelection #MetalFabrication',
        cta: 'Send your application, dimensions, surface, annual volume and destination for a grade shortlist.',
        visualPlan: [
          { index: '01', shot: 'Cover', overlay: 'WHICH KITCHEN PART ARE YOU BUYING?', detail: 'Show three actual component silhouettes before mentioning a grade.' },
          { index: '02', shot: 'Myth', overlay: 'PRICE IS NOT THE SPECIFICATION', detail: 'Show crossed-out “good / bad” ladder.' },
          { index: '03', shot: '430 profile', overlay: 'FERRITIC · TYPICALLY MAGNETIC · NO NICKEL DEPENDENCE', detail: 'Use three compact engineering labels.' },
          { index: '04', shot: '304 profile', overlay: 'AUSTENITIC · BROADER CORROSION WINDOW · FORMING FLEXIBILITY', detail: 'Mirror slide 03 for comparison.' },
          { index: '05', shot: 'Decision grid', overlay: 'CHECK 5 THINGS BEFORE YOU BUY', detail: 'Environment / forming / welding / surface / cost.' },
          { index: '06', shot: 'CTA', overlay: 'SPECIFY THE JOB. THEN SPECIFY THE GRADE.', detail: 'Altai contact prompt and RFQ field list.' }
        ]
      },
      {
        id: 'variant_430_facebook', platform: 'Facebook', format: 'Single image + post', language: 'English',
        spec: '1200 × 1500 px · 4:5', status: 'ready',
        hook: 'Buying material for a kitchen-equipment part? Start with the part and cleaning environment, not the price list.',
        caption: `430 and 304 are not “basic” and “premium” versions of the same material. They belong to different stainless steel families and behave differently in service and fabrication.\n\n430 can be a strong fit for many appliance, kitchen and decorative applications when the corrosion environment and forming route are understood. 304 offers a wider operating window for demanding corrosion, deep drawing and welding conditions.\n\nTo recommend a grade, we need five facts: application, dimensions, surface, manufacturing process and operating environment. Add annual volume and destination, and we can prepare a more useful quotation.`,
        hashtags: '#StainlessSteel #430Stainless #304Stainless #MetalSourcing',
        cta: 'Message us with your application and specification.',
        visualPlan: [
          { index: '01', shot: 'Comparison poster', overlay: '430 OR 304?', detail: 'Two-column decision matrix with five buying questions and Altai footer.' }
        ]
      },
      {
        id: 'variant_430_tiktok', platform: 'TikTok', format: 'Vertical expert video', language: 'English',
        spec: '1080 × 1920 px · 9:16 · 38 sec', duration: '38 sec', status: 'ready',
        hook: 'Buying stainless for kitchen equipment? Do not choose 430 or 304 by price alone.',
        caption: `The right starting point is the component: where it sits, how it is cleaned, how deeply it is formed and whether it is welded. Send the part, dimensions, surface, annual quantity and destination for a practical grade shortlist.`,
        hashtags: '#CommercialKitchen #EquipmentManufacturing #IndustrialProcurement #StainlessSteelBuying',
        cta: 'Comment “GRADE” or send the application, size, surface and quantity.',
        visualPlan: [
          { time: '0–3s', shot: 'Three commercial-kitchen components beside an RFQ sheet', overlay: 'WHICH PART ARE YOU BUYING?', detail: 'Open with the buyer task, not a grade debate.' },
          { time: '3–9s', shot: 'Cleaning spray, humidity and salt icons over a component', overlay: 'CHECK THE SERVICE ENVIRONMENT', detail: 'Say: start with cleaning chemicals, moisture and salt exposure.' },
          { time: '9–17s', shot: 'Kitchen panel and appliance B-roll', overlay: '430: A CANDIDATE FOR SUITABLE PARTS', detail: 'Mention typical appliance and kitchen uses, subject to environment and fabrication.' },
          { time: '17–25s', shot: 'Deep-drawn and welded parts', overlay: '304: BROADER PROCESS WINDOW', detail: 'Mention corrosion, deep drawing and welding flexibility.' },
          { time: '25–33s', shot: 'Five-field checklist animates in', overlay: 'ENVIRONMENT · FORMING · WELDING · SURFACE · COST', detail: 'Point to each field.' },
          { time: '33–38s', shot: 'Presenter holds RFQ sheet', overlay: 'SPECIFY THE JOB FIRST', detail: 'CTA: send application, size, surface and quantity.' }
        ]
      }
    ]
  },
  {
    id: 'content_409',
    title: '汽车排气系统采购：询价 409L 前必须确认的 6 个参数',
    pillar: '采购指南', campaign: '汽车排气用钢', objective: '提高 RFQ 完整度并减少无效询价',
    audience: '汽车排气系统厂、制管厂、冲压厂及 Tier 2/3 采购',
    buyerDecision: '判断当前 409L RFQ 是否足以获得可执行、可比较的报价', buyerIntentVersion: 1,
    channels: ['LinkedIn', '官网'], language: '英文', status: 'draft',
    body: '409L 报价不能只写牌号、厚度和吨位。标准体系、精确尺寸、表面状态、交付形态、性能/钢厂准入要求及年度用量与交付计划都会影响钢厂选择和价格。',
    proofPoints: ['标准与等效牌号', '厚度宽度及公差', '表面与边部', '卷重和内径', '性能与钢厂准入', '年用量和交付计划'],
    factNote: '不同客户和钢厂的 409L 技术条件并不完全相同，等效牌号需要按项目标准确认。',
    scheduledAt: '2026-10-15T09:00:00+08:00', createdAt: now,
    variants: [
      {
        id: 'variant_409_linkedin', platform: 'LinkedIn', format: 'Document carousel', language: 'English',
        spec: '1080 × 1350 px · 7 slides · 4:5', status: 'ready',
        hook: 'A 409L RFQ with only grade, thickness and tonnage is not quotation-ready.',
        caption: `A useful 409L quotation starts with a useful specification.\n\nFor exhaust-system material, confirm these six groups before asking mills for price:\n1. Standard and exact grade designation\n2. Thickness, width and tolerance\n3. Surface, edge and delivery form\n4. Coil weight, inner diameter and packing\n5. Mechanical properties, weld requirements and approved-mill list\n6. Annual volume, trial quantity, destination and delivery schedule\n\nMissing information does not make the quote faster. It usually creates assumptions, revisions and price risk.\n\nUse the final slide as an RFQ checklist, or send us your drawing and current specification for review.`,
        hashtags: '#409L #AutomotiveExhaust #StainlessSteel #RFQ #SteelSourcing #SupplyChain',
        cta: 'Send the drawing and current material specification for an RFQ completeness check.',
        visualPlan: [
          { index: '01', shot: 'Cover', overlay: '409L RFQ: 6 INPUTS BEFORE PRICE', detail: 'Exhaust-pipe silhouette with technical dimension marks.' },
          { index: '02', shot: 'Standard', overlay: '01 · STANDARD + EXACT GRADE', detail: 'Show standard families, no unverified equivalence claim.' },
          { index: '03', shot: 'Dimensions', overlay: '02 · SIZE + TOLERANCE', detail: 'Thickness, width, tolerance and slit-edge callouts.' },
          { index: '04', shot: 'Surface and coil', overlay: '03–04 · SURFACE + DELIVERY FORM', detail: 'Coil ID, coil weight, surface, edge and packing.' },
          { index: '05', shot: 'Performance', overlay: '05 · PERFORMANCE + MILL APPROVAL', detail: 'Mechanical, welding and approved-source fields.' },
          { index: '06', shot: 'Commercial', overlay: '06 · VOLUME + DESTINATION + SCHEDULE', detail: 'Trial order and annual demand timeline.' },
          { index: '07', shot: 'Checklist', overlay: 'COMPLETE INPUTS. COMPARABLE QUOTES.', detail: 'RFQ checklist and CTA.' }
        ]
      },
      {
        id: 'variant_409_website', platform: '官网', format: 'Technical article', language: 'English',
        spec: '900–1,100 words · SEO article', status: 'draft',
        hook: '409L Stainless Steel RFQ Checklist for Exhaust-System Buyers',
        caption: `When a 409L inquiry contains only grade, thickness and tonnage, suppliers must fill the gaps with assumptions. Those assumptions affect mill selection, processing route, packing and price. A quotation-ready RFQ should state the applicable standard and grade, dimensional tolerances, surface and edge, coil parameters, technical approval requirements, and the expected delivery program.\n\nThis checklist is designed for exhaust-system manufacturers, tube mills, stampers and sourcing teams comparing offers from different mills. It does not replace the customer's drawing or material standard; it makes those requirements easier to communicate and compare.`,
        hashtags: 'SEO: 409L stainless steel supplier; exhaust stainless steel RFQ; 409L coil specification',
        cta: 'Upload or email the drawing, specification and annual demand for a completeness review.',
        visualPlan: [
          { index: 'H1', shot: 'Article hero', overlay: '409L RFQ CHECKLIST', detail: 'Wide crop of exhaust tube / coil with six-field index.' },
          { index: 'BODY', shot: 'Inline checklist', overlay: '6 REQUIRED INPUT GROUPS', detail: 'Accessible HTML checklist, not an image-only table.' }
        ]
      }
    ]
  },
  {
    id: 'content_factory',
    title: '采购加工不锈钢卷：如何确认炉号、分条批次与 MTC 能对应',
    pillar: '质量证明', campaign: '可追溯供应链', objective: '展示代理模式下的质量控制能力',
    audience: '海外采购、质量工程师及需要 MTC 的工业客户',
    buyerDecision: '确认订单、卷标或加工批次与 MTC 是否能够对应', buyerIntentVersion: 1,
    channels: ['TikTok', 'LinkedIn'], language: '英文', status: 'idea',
    body: '从钢厂报价、合同、炉号标签、分条/开平记录、装箱单到 MTC 建立关联。内容重点不是声称绝对可追溯，而是展示每个节点应保留哪些证据。',
    proofPoints: ['合同牌号与标准', '炉号/卷号标签', '加工批次记录', '装箱单关联', 'MTC 与出货文件'],
    factNote: '展示前应遮盖客户名称、价格、银行信息和不应公开的证书编号。',
    scheduledAt: '2026-10-18T09:00:00+08:00', createdAt: now,
    variants: [
      {
        id: 'variant_trace_tiktok', platform: 'TikTok', format: 'Vertical process video', language: 'English',
        spec: '1080 × 1920 px · 9:16 · 42 sec', duration: '42 sec', status: 'ready',
        hook: 'Can a mill-agent order still be traceable? Yes — if every handoff keeps the right ID.',
        caption: `Traceability is a chain of matching records: contract, coil or heat label, processing batch, packing list and MTC. Before filming, customer names, prices and sensitive certificate numbers must be covered.`,
        hashtags: '#MTC #SteelTraceability #StainlessSteel #QualityControl #SteelServiceCenter',
        cta: 'Ask for the document checklist before placing a processed-coil order.',
        visualPlan: [
          { time: '0–4s', shot: 'Fast cuts: contract → coil tag → MTC', overlay: 'CAN AN AGENT ORDER BE TRACEABLE?', detail: 'Blur all sensitive data.' },
          { time: '4–10s', shot: 'Point to contract material line', overlay: '1 · CONTRACT SPEC', detail: 'Show grade, standard and dimensions only.' },
          { time: '10–18s', shot: 'Coil/heat label close-up', overlay: '2 · HEAT / COIL ID', detail: 'Keep ID readable only on a staged sample.' },
          { time: '18–27s', shot: 'Slitting or cut-to-length record', overlay: '3 · PROCESSING BATCH', detail: 'Show the handoff between source coil and finished packs.' },
          { time: '27–35s', shot: 'Packing list and marks', overlay: '4 · PACKING LINK', detail: 'Match package mark to shipping document.' },
          { time: '35–42s', shot: 'MTC beside shipment file', overlay: '5 · MTC + SHIPPING FILE', detail: 'Finish with privacy reminder and CTA.' }
        ]
      },
      {
        id: 'variant_trace_linkedin', platform: 'LinkedIn', format: 'Process diagram + post', language: 'English',
        spec: '1200 × 1500 px · 4:5', status: 'ready',
        hook: 'Traceability is not a PDF at the end. It is an ID chain maintained at every handoff.',
        caption: `For a mill-agent order, traceability should connect five records: the commercial specification, heat or coil label, processing batch, packing list and MTC.\n\nIf material is slit, cut to length or repacked, the source identity must be carried into the new batch and package marks. The final certificate is useful only when the shipment can be linked back to it.\n\nBefore sharing any traceability example publicly, remove customer names, prices, bank details and sensitive certificate numbers.`,
        hashtags: '#Traceability #MTC #StainlessSteel #QualityAssurance #SteelSupplyChain',
        cta: 'Request our document checklist for processed stainless-steel orders.',
        visualPlan: [
          { index: '01', shot: 'Five-step process map', overlay: 'SPEC → HEAT ID → PROCESSING → PACKING → MTC', detail: 'Use one continuous line with evidence retained at each node.' }
        ]
      }
    ]
  }
];
