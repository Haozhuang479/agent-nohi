import fs from 'fs'
import path from 'path'
import os from 'os'

interface Skill {
  name: string
  description: string
  trigger: string
  content: string
}

function parseSkillFile(raw: string): Skill | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null
  const frontmatter = match[1]
  const content = match[2].trim()
  const get = (key: string) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return m ? m[1].trim() : ''
  }
  return { name: get('name'), description: get('description'), trigger: get('trigger'), content }
}

const BUILTIN_SKILLS: Skill[] = [
  {
    name: 'flash-sale',
    description: '限时促销活动助手 — 帮助规划折扣深度、目标客群和邮件文案',
    trigger: 'flash sale|promotion|discount|campaign|coupon|限时|促销|折扣|优惠|活动',
    content: `You are helping the merchant plan and execute a flash sale or promotional campaign.
Best practices:
- Suggest discount depth based on product margin (typical: 15-30% for healthy margin, up to 50% for clearance)
- Identify the best target customer segments: recent buyers, lapsed (60-90 days), high-LTV VIPs
- Draft urgency messaging: countdown timers, limited stock labels, "X left" copy
- Recommend channels: email, SMS, social push notifications
- Propose a simple pre/during/post-sale email sequence (teaser → live → last-chance)
- Flag any inventory constraints that may limit the campaign scope
Output: concise campaign brief with timeline, offer details, and copy suggestions.`,
  },
  {
    name: 'inventory',
    description: '库存监控与预警 — 识别低库存 SKU 并建议补货策略',
    trigger: 'inventory|stock|reorder|restock|sku|warehouse|供应|库存|补货|缺货|积压|滞销',
    content: `You are helping the merchant manage and optimize inventory.
Best practices:
- Identify SKUs at risk: units on hand < 2× average daily sales (typically last 30 days)
- Flag overstock: inventory > 90-day sell-through at current velocity
- Suggest reorder quantities using a simple EOQ or days-of-stock target (e.g. 45-day buffer)
- Highlight seasonal demand spikes when relevant (holidays, promotions)
- Recommend bundling slow-movers with fast-sellers to reduce dead stock
- For critical items, suggest safety stock = average lead time demand + buffer
Output: prioritized list of SKUs to reorder or liquidate with recommended action.`,
  },
  {
    name: 'customer-winback',
    description: '客户召回策略 — 识别流失风险客户并起草个性化唤回内容',
    trigger: 'winback|win back|inactive|churn|lapsed|retention|re-engage|客户|召回|流失|复购|唤回',
    content: `You are helping the merchant re-engage inactive or at-risk customers.
Best practices:
- Segment by recency: warm (31-60 days since last order), cold (61-120 days), dormant (120+ days)
- Personalize subject lines with last product category or purchase history
- Use a 3-step sequence: curiosity email → value/offer email → last-chance email (7-10 day cadence)
- Offer a win-back incentive: 10-15% discount, free shipping, or exclusive early access
- Include social proof: new arrivals, top-sellers since their last visit
- Set clear sunset criteria: unsubscribe or suppress after 3 unread win-back emails
Output: segmented win-back brief with email copy for each step and success metrics to track.`,
  },
  {
    name: 'product-listing',
    description: '商品详情页优化 — 改写标题、描述和关键词以提升转化',
    trigger: 'listing|product page|title|description|seo|keyword|copywriting|商品|标题|详情页|关键词|文案|转化',
    content: `You are helping the merchant optimize product listings for conversion and SEO.
Best practices:
- Title formula: [Brand] + [Key Feature] + [Product Type] + [Size/Color/Variant] — keep under 70 chars for SEO
- Lead with the top customer benefit in the first sentence of the description
- Use bullet points for key specs: material, dimensions, compatibility, certifications
- Incorporate primary keyword naturally 2-3× in title + description; add 5-8 long-tail keywords
- Include social proof signals: "#1 bestseller", "10,000+ sold", review snippets
- Write for the buyer persona: tone should match the category (professional, playful, premium)
- Add urgency/scarcity hooks if inventory allows: "Only 12 left in stock"
Output: rewritten title, bullet-point description, and suggested keyword list ready to copy-paste.`,
  },
]

export function loadSkills(message: string, customDir?: string, enabledSkills?: string[]): string {
  const allSkills = [...BUILTIN_SKILLS]

  const dirs = [
    path.join(os.homedir(), '.nohi', 'skills'),
    ...(customDir ? [customDir] : []),
  ]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const skill = parseSkillFile(raw)
      if (skill) allSkills.push(skill)
    }
  }

  // Filter by enabledSkills list (empty = all enabled)
  const skillPool = (enabledSkills && enabledSkills.length > 0)
    ? allSkills.filter((s) => enabledSkills.includes(s.name))
    : allSkills

  const msg = message.toLowerCase()
  const matched = skillPool.filter((s) => {
    if (!s.trigger) return false
    return s.trigger.split('|').some((t) => msg.includes(t.trim()))
  })

  if (matched.length === 0) return ''
  return '\n\n---\n' + matched.map((s) => `[Skill: ${s.name}]\n${s.content}`).join('\n\n')
}
