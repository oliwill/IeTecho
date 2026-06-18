云白纸张底的家庭健康小程序系统，以青绿主色承载平稳与行动，湖蓝/苔藓绿辅助自然疗愈感，暖土橙和柔和橙红只用于提醒与异常。

```css
:root {
  --bg: oklch(97.4% 0.014 91.1);
  --surface: oklch(100% 0 0);
  --fg: oklch(30.1% 0.023 221.2);
  --muted: oklch(51.3% 0.035 208.4);
  --border: oklch(91.7% 0.014 202.1);
  --accent: oklch(67.9% 0.108 184.2);

  --font-display: 'Iowan Old Style', 'Songti SC', 'Noto Serif SC', Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --font-mono: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
}
```

## Layout posture

- 375 x 812 px mobile-first canvas, top safe area 88 px and bottom safe area 34 px respected.
- Main cards use 22 px radius, light shadow, and 16-20 px internal padding; secondary cards use 18 px radius.
- The strongest visual memory point is the family member health card, not a marketing hero.
- Accent budget stays small: primary teal for action/normal state, warm orange for reminders, soft coral only for clear abnormal/overdue states.
- Texture should feel like clean matte paper: fine grain, no dirty grey cast, no heavy watercolor or glossy 3D treatment.
