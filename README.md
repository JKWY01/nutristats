# NutriStats · USDA 营养数据库

**7,793 种食品 × 26 项营养素**(USDA FoodData Central SR Legacy,2021-10-28 定版,公共领域),每食品一页:每 100g 全量表 + 常见份量换算 + 类目内链;25 个类目页 + 6 个营养素排行页。约 7,800 个静态页,数据随仓库分发。

三个不掺假的事,与 WageStats / AnswerToday 同一套纪律:

- 所有数值来自 USDA 原表(per 100g);USDA 未发布的显示 "—",绝不估算。
- 份量数值是官方每 100g 数字的等比乘法(份量克重 × 每 100g ÷ 100),页面明确标注算法。
- SR Legacy 是 USDA 标准参考库的最终版(数据本体定格 2021-10-28),月频同步只做数据完整性金丝雀,日常靠每日线上体检。

## 站点结构

| 路径 | 内容 | SEO 角色 |
|---|---|---|
| `/food/[slug]` | 食品页 ×7,793:热量/宏量/维生素/矿物质全表 + 份量换算 | 长尾主力:"calories in a banana" |
| `/category/[slug]` | 类目页 ×25:按热量排序的全食品表 | "vegetables calorie chart" |
| `/rankings/[nutrient]` | 排行页 ×6:蛋白/纤维/钾/铁/VC/钙 Top 100 | "high protein foods" |
| `/api/food` | JSON(CORS 全开,?slug= 全量 / ?q= 搜索) | agent/MCP 数据口 |
| `/llms.txt` · `/sitemap.xml` · `/robots.txt` | AI 说明书 + ~7,830 URL + AI 爬虫白名单 | 分发层 |

## 数据流

```
fdc.nal.usda.gov 免鉴权全量包(12.6MB zip;直连可达,Wayback id_ 兜底)
  └─ scripts/sync-fdc.mjs(GitHub Actions 每月 + 手动)
       └─ data/fdc-sr.json(~4.4MB,随仓库提交)
            └─ 站点只读仓库内 JSON,渲染路径零外呼
```

## 本地跑起来

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_SITE_URL 部署时填
npm run dev
```

## 部署

1. GitHub 建仓推送(Vercel 导入,零配置);~7.8k 静态页,构建 1 分钟级。
2. Actions secrets:`SITE_URL`(体检用)。
3. 广告:AdSense 过审后配 `NEXT_PUBLIC_ADSENSE_CLIENT`,6 个广告位即刻激活。

## 已知限制,如实说

- SR Legacy 定格于 2021-10-28:品牌包装食品(营养标签随厂商改版)不在此库,USDA 的 Foundation Foods / Branded Foods 需 API key,暂不接。
- 部分食品 USDA 未给份量信息,份量表只在该食品有数据时出现。
- 排行榜按每 100g,浓缩/干制食品天然靠前(页面已注明)。
