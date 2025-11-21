const customsData = [
  {
    country: "美国 (USA)",
    threshold: "800 USD (约 5,800 CNY)",
    forbidden_items: "肉类制品（包括含肉调料包）、Kinder出奇蛋、含锂电池产品（需UN38.3认证，极易扣关）、处方药、任何侵权/仿牌产品。",
    recommendation: "首选 FedEx 或 UPS。DHL在美国偏远地区投递能力稍弱。美国海关目前正在严查 'Section 321' 免税申报，勿存侥幸心理。",
    warning: "⚠️ 绝对不要低报货值！2025年CBP对'小额豁免'滥用的打击是毁灭性的，一旦被查，发货人会被列入黑名单。"
  },
  {
    country: "日本 (Japan)",
    threshold: "10,000 JPY (约 65 USD)",
    forbidden_items: "所有肉类（无论生熟/真空，包括含肉方便面）、假冒品牌（海关会直接没收并罚款）、色情制品（打码需符合日本标准）、精神类药物（如含安非他命的感冒药）。",
    recommendation: "首选 DHL 或 OCS（佐川急便）。日本海关极度严谨，EMS虽然查验率相对低，但一旦卡关处理极慢。商业件务必走DHL。",
    warning: "⚠️ 别寄火腿肠或牛肉干！日本农林水产省对肉类零容忍，这是最常见的退运原因。"
  },
  {
    country: "泰国 (Thailand)",
    threshold: "1,500 THB (约 43 USD)",
    forbidden_items: "电子烟及配件（最高级违禁品，携带或进口均违法）、成人玩具（性用品）、部分含有佛像的工艺品（需文化部批文）。",
    recommendation: "小件普货建议走 EMS 或 专线。DHL/FedEx 在泰国属于'主动报关'，几乎 100% 会被征税（且税率极高）。",
    warning: "⚠️ 千万别发电子烟！在泰国这属于严厉打击的犯罪行为，不仅是没收，收件人可能面临牢狱之灾。"
  },
  {
    country: "英国 (UK)",
    threshold: "135 GBP (约 170 USD) - 注意：此为关税起征点，VAT无起征点",
    forbidden_items: "攻击性武器（如僵尸刀、指虎）、所有肉奶制品（脱欧后严查）、含有特定成分的植物种子。",
    recommendation: "首选 DHL 或 Royal Mail (EMS)。英国脱欧后，所有商品入关即需缴纳 20% VAT（增值税），建议卖家注册 IOSS 预缴税，否则客户拒收率极高。",
    warning: "⚠️ 必须预缴 VAT！不要以为货值低就没事，现在 £0.01 起征增值税，未完税包裹会被直接退回或向客户收取高额手续费。"
  },
  {
    country: "德国 (Germany)",
    threshold: "150 EUR (约 158 USD) - 注意：此为关税起征点，VAT无起征点",
    forbidden_items: "褪黑素（及多种膳食补充剂，被视为药物）、仿牌（德国海关最严）、月饼（含蛋黄/肉）、非欧盟合规的电子产品（无CE标）。",
    recommendation: "强烈推荐 DHL Express。**千万别用 EMS/邮政**，因为德国海关（Zoll）不负责清关邮政包裹，会要求收件人亲自去海关排队开箱，体验极差。",
    warning: "⚠️ 别寄保健品和药！德国海关对个人进口药物（包括维生素、褪黑素）查得严到变态，退运率高达 90%。"
  }
];

export default customsData;
