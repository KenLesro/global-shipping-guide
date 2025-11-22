/**
 * Cross-border Logistics Query Engine (Optimized)
 * 集成：最新五国政策数据 + 自动计算逻辑 + UI渲染
 * 更新时间：2025-11
 */

(function () {
  // ==========================================
  // 1. 核心数据库 (The Data Source)
  // ==========================================
  const LOGISTICS_DATA = {
    "Vietnam": {
      "name": "Vietnam (越南)",
      "currency": "VND",
      "exchangeRateUSD": 25450,
      "customs": {
        "thresholdDesc": "0 VND (2025新规)",
        "note": "⚠️ 2025年2月起取消小额免税，全额征收进口税和VAT。",
        "deMinimisUSD": 0
      },
      "taxRules": { "vatRate": 0.10, "dutyRateGeneral": 0.00, "dutyRateSpecial": 0.25 },
      "codProfile": "消费者习惯开箱验货，拒收率 10-15%。建议提供“签收前查看外观”服务。",
      "compliance": "发票须含完整CIF价格；化妆品需备案；通信设备需MIC认证。",
      "prohibited": ["Used Consumer Goods (二手货)", "Cultural Products (敏感内容)", "Firecrackers"],
      "channels": ["Land Freight (中越陆运)", "J&T Express", "VN Post"]
    },
    "Malaysia": {
      "name": "Malaysia (马来西亚)",
      "currency": "MYR",
      "exchangeRateUSD": 4.45,
      "customs": {
        "thresholdDesc": "500 MYR (LVG Taxable)",
        "note": "⚠️ <500 MYR 免关税但收 10% LVG 销售税；>500 MYR 收关税+SST。",
        "deMinimisUSD": 112
      },
      "taxRules": { "vatRate": 0.10, "dutyRateGeneral": 0.00, "dutyRateHigh": 0.15 },
      "codProfile": "东马 (Sabah/Sarawak) 时效长易拒收；西马电子钱包普及率高，COD 比例下降。",
      "compliance": "面单需标注 LVG Registration Number；电子产品需 SIRIM 认证。",
      "prohibited": ["Religious Text on Fabric", "Indecent Printings", "Daggers"],
      "channels": ["J&T Express", "Shopee Xpress", "GDEX"]
    },
    "Indonesia": {
      "name": "Indonesia (印尼)",
      "currency": "IDR",
      "exchangeRateUSD": 15850,
      "customs": {
        "thresholdDesc": "3 USD (极低门槛)",
        "note": "⚠️ >3 USD 即收11% VAT。纺织/箱包/鞋类有 BMTP 保护性高关税。",
        "deMinimisUSD": 3
      },
      "taxRules": { "vatRate": 0.11, "dutyRateGeneral": 0.075, "dutyRateTextile": 0.25 },
      "codProfile": "极高风险。群岛地形致派送慢，买家易“遗忘”。必须 WhatsApp 确认订单。",
      "compliance": "必备 NPWP (税号) 或 NIK (身份证)；手机需注册 IMEI；化妆品需 BPOM。",
      "prohibited": ["Used Clothing (严禁)", "Batik Fabric", "Chinese Medicines"],
      "channels": ["DDP Special Line (强烈建议)", "J&T Express", "SiCepat"]
    },
    "Saudi_Arabia": {
      "name": "Saudi Arabia (沙特)",
      "currency": "SAR",
      "exchangeRateUSD": 3.75,
      "customs": {
        "thresholdDesc": "1000 SAR",
        "note": "⚠️ 15% VAT 无免征额。>1000 SAR 加收关税。",
        "deMinimisUSD": 266
      },
      "taxRules": { "vatRate": 0.15, "dutyRateGeneral": 0.05, "dutyRateHigh": 0.20 },
      "codProfile": "高风险。家庭地址不清 (需 National Address)，女性收货不便，极其依赖电话联系。",
      "compliance": "SABER 认证 (电子/玩具)；Made in China 必须物理刻印/强力贴。",
      "prohibited": ["Alcohol & Pork", "Non-Islamic Religious Items", "Laser Pointers"],
      "channels": ["Aramex", "SMSA", "iMile"]
    },
    "UAE": {
      "name": "UAE (阿联酋)",
      "currency": "AED",
      "exchangeRateUSD": 3.67,
      "customs": {
        "thresholdDesc": "300 AED",
        "note": "5% VAT 普遍征收。门槛相对较高，物流较成熟。",
        "deMinimisUSD": 81
      },
      "taxRules": { "vatRate": 0.05, "dutyRateGeneral": 0.05, "dutyRateHigh": 0.05 },
      "codProfile": "中风险。外籍人口流动性大，地址变更频繁。",
      "compliance": "HS Code 需精确到8位；电子产品需 ESMA 认证。",
      "prohibited": ["Poppy Seeds (严禁)", "Gambling Tools", "Boycotted Goods"],
      "channels": ["iMile", "Aramex", "Emirates Post"]
    }
  };

  // 定义商品类别 (用于逻辑判断)
  const CATEGORIES = ["General Goods (普货)", "Textile/Fashion (纺织鞋包)", "Electronics (电子)", "Cosmetics (化妆品)"];

  // ==========================================
  // 2. 工具引擎 (Calculation Engine)
  // ==========================================
  const METRIC = {
    formatMoney(amount, currency) {
      try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
      } catch {
        return `${amount} ${currency}`;
      }
    },
    // 简易落地成本计算
    calculateSampleCost(countryCode, category) {
      const data = LOGISTICS_DATA[countryCode];
      if (!data) return null;
      
      const sampleValueUSD = 100; // 默认演示金额 100 USD
      const localRate = data.exchangeRateUSD;
      const rules = data.taxRules;
      
      let duty = 0;
      let note = "";
      const isTextile = category.includes("Textile");

      // 简单逻辑映射
      if (countryCode === "Vietnam") duty = sampleValueUSD * rules.dutyRateGeneral;
      else if (countryCode === "Malaysia") duty = (sampleValueUSD * localRate > 500) ? sampleValueUSD * rules.dutyRateHigh : 0;
      else if (countryCode === "Indonesia") duty = sampleValueUSD * (isTextile ? rules.dutyRateTextile : rules.dutyRateGeneral);
      else duty = sampleValueUSD * rules.dutyRateGeneral; // SA & UAE simplified

      const vatBase = sampleValueUSD + duty;
      const vat = vatBase * rules.vatRate;
      const totalTax = duty + vat;

      return {
        sampleUSD: sampleValueUSD,
        estimatedTaxUSD: totalTax.toFixed(2),
        details: isTextile && countryCode === "Indonesia" ? "包含保护性高关税" : "常规税率估算"
      };
    }
  };

  // ==========================================
  // 3. UI 逻辑 (DOM Manipulation)
  // ==========================================
  const els = {
    country: document.getElementById('countrySelect'),
    category: document.getElementById('categorySelect'),
    form: document.getElementById('filterForm'),
    reset: document.getElementById('resetBtn'),
    
    // Output Areas
    threshold: document.getElementById('thresholdBody'),
    prohibited: document.getElementById('prohibitedList'),
    channels: document.getElementById('channelsBody'),
    pitfall: document.getElementById('pitfallBody'),
    resultSection: document.getElementById('resultSection'),
    metaLine: document.getElementById('metaLine')
  };

  // 初始化年份
  const yrEl = document.getElementById('year');
  if(yrEl) yrEl.textContent = new Date().getFullYear();

  // URL & LocalStorage State
  const params = new URLSearchParams(location.search);
  const remembered = JSON.parse(localStorage.getItem('GSG_PREF') || '{}');

  function initSelects() {
    // 填充国家
    const countryKeys = Object.keys(LOGISTICS_DATA);
    els.country.innerHTML = countryKeys
      .map(key => `<option value="${key}">${LOGISTICS_DATA[key].name}</option>`)
      .join('');

    // 填充类别
    els.category.innerHTML = CATEGORIES
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');

    // 恢复状态
    const initCountry = params.get('country') || remembered.country || countryKeys[0];
    const initCategory = params.get('category') || remembered.category || CATEGORIES[0];
    
    // 简单的存在性检查，防止 URL 参数错误
    if(LOGISTICS_DATA[initCountry]) els.country.value = initCountry;
    els.category.value = initCategory;

    if(els.metaLine) els.metaLine.textContent = `Data Updated: 2025-11 · Based on latest Customs Policies`;
  }

  // 渲染：免税门槛
  function renderThreshold(data) {
    const { thresholdDesc, note } = data.customs;
    els.threshold.innerHTML = `
      <div class="text-slate-800">
        <div class="font-medium text-lg text-blue-700">${thresholdDesc}</div>
        <div class="text-sm text-slate-500 mt-1">${note}</div>
      </div>
    `;
  }

  // 渲染：违禁品 (合并 Prohibited + Compliance Sensitive)
  function renderProhibited(data, currentCategory) {
    let list = [...data.prohibited];
    
    // 如果是特定类别，强调合规性
    if (currentCategory.includes("Electronics") && data.compliance.includes("SABER")) {
      list.unshift("⚠️ 必须 SABER 认证 (Strict)");
    }
    if (currentCategory.includes("Textile") && data.name.includes("Indonesia")) {
      list.unshift("⚠️ 极高关税预警 (Safeguard Duty)");
    }

    els.prohibited.innerHTML = list.length
      ? list.map(item => `<li class="mb-1">${item}</li>`).join('')
      : `<li class="text-slate-400">无特殊违禁标注</li>`;
  }

  // 渲染：物流渠道
  function renderChannels(data) {
    els.channels.innerHTML = data.channels
      ? data.channels.map(c => `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">${c}</span>`).join('')
      : `<span class="text-slate-400">暂无推荐</span>`;
  }

  // 渲染：避坑 & 成本模拟 (Pitfall + Calculator)
  function renderPitfall(key, data, currentCategory) {
    // 组合 COD 痛点 和 合规要求
    const riskHtml = `
      <div class="mb-2"><strong>COD/风控：</strong> ${data.codProfile}</div>
      <div class="mb-2"><strong>合规要求：</strong> ${data.compliance}</div>
    `;

    // 动态计算示例
    const calc = METRIC.calculateSampleCost(key, currentCategory);
    const calcHtml = calc ? `
      <div class="mt-3 pt-3 border-t border-slate-200 text-sm">
        <span class="badge bg-green-100 text-green-700 px-1 rounded">成本模拟</span>
        申报 $${calc.sampleUSD} 商品，预计产生税费: <strong>$${calc.estimatedTaxUSD}</strong>
        <div class="text-xs text-slate-400 mt-1">(${calc.details})</div>
      </div>
    ` : '';

    els.pitfall.innerHTML = riskHtml + calcHtml;
  }

  function persistAndSyncURL(countryKey, cat) {
    localStorage.setItem('GSG_PREF', JSON.stringify({ country: countryKey, category: cat }));
    const sp = new URLSearchParams(location.search);
    sp.set('country', countryKey);
    sp.set('category', cat);
    history.replaceState(null, '', `${location.pathname}?${sp.toString()}`);
  }

  function renderAll() {
    els.resultSection.style.opacity = '0.5'; // Simple visual feedback
    
    const key = els.country.value;
    const cat = els.category.value;
    const data = LOGISTICS_DATA[key];

    if (data) {
      renderThreshold(data);
      renderProhibited(data, cat);
      renderChannels(data);
      renderPitfall(key, data, cat);
      persistAndSyncURL(key, cat);
    }

    setTimeout(() => { els.resultSection.style.opacity = '1'; }, 150);
  }

  // Event Listeners
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    renderAll();
  });

  // 如果没有 Submit 按钮，监听 Select 变化实现即时渲染 (用户体验更好)
  els.country.addEventListener('change', renderAll);
  els.category.addEventListener('change', renderAll);

  els.reset.addEventListener('click', () => {
    // Reset logic if needed, or just default to first
    const keys = Object.keys(LOGISTICS_DATA);
    els.country.value = keys[0];
    els.category.selectedIndex = 0;
    renderAll();
  });

  // Init
  initSelects();
  renderAll();

  // Expose for debugging if needed
  window.GSG_CORE = { LOGISTICS_DATA, METRIC };

})();
