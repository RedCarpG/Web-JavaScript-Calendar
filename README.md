# 万年历 · 八字排盘

一个纯前端的中国传统历法应用：

- **日历**：月视图显示公历、农历、节气、节日和法定节假日（休/班）。点击任意一天可以查看干支、建除、值神、星宿、宜忌、吉神凶煞。
- **八字排盘**：输入出生时间和性别后，显示四柱（主星、藏干、纳音、星运、自坐、空亡）、五行统计、胎元/胎息/命宫/身宫、起运时间、十步大运，以及每步大运内的流年和小运。支持两种晚子时日柱流派。

## 技术栈

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- 历法和命理计算：[tyme4ts](https://github.com/6tail/tyme4ts)（MIT）

## 开发

```bash
npm install
npm run dev       # 本地开发
npm run build     # 类型检查并构建到 dist/
npm run preview   # 预览构建结果
```

`dist/` 是纯静态文件，可以直接部署到 GitHub Pages、Vercel 等平台。

## 目录

```
src/
  lib/calendar.ts        月历网格和每日黄历数据
  lib/bazi.ts            八字排盘、大运、流年
  components/            CalendarView / BaziView
legacy/                  旧版 Express + EJS 实现（仅作参考）
```

> 命理内容仅供文化参考。
