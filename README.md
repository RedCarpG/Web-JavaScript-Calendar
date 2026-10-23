# 时契 ChroniQ

中国传统历法与命理排盘工具：万年历、八字排盘，之后计划加入紫微斗数等。

在线访问：<https://redcarpg.github.io/web-paipan-ChroniQ/>

一个纯前端的中国传统历法应用：

- **日历**：月视图显示公历、农历、节气、节日和法定节假日（休/班）。点击任意一天可以查看干支、建除、值神、星宿、宜忌、吉神凶煞。
- **八字排盘**：输入出生时间和性别后，显示四柱（主星、藏干、纳音、星运、自坐、空亡）、五行统计、胎元/胎息/命宫/身宫、起运时间、十步大运，以及每步大运内的流年和小运。支持两种晚子时日柱流派。
  - **神煞**：天乙、太极、文昌、国印、天德/月德（及合）、禄神、羊刃、红艳、金舆、天医、将星、驿马、桃花、华盖、劫煞、亡神、灾煞、孤辰寡宿、红鸾天喜、丧门吊客、魁罡、阴差阳错、十恶大败、孤鸾、十灵、金神、天赦。
  - **刑冲合会**：天干五合/相冲；地支六合、三合、半合、三会、六冲、相刑、自刑、六害、相破。会显示原局内部的关系，也会显示所选大运、流年与原局之间的作用。
  - **流派设置**：晚子时、起运算法、天乙贵人、阴干羊刃、神煞查法、午未合化都可以切换。受流派影响的结果会标一个「!」，说明和出处见 [docs/schools.md](docs/schools.md)。
  - **真太阳时**：选择出生城市或者手动输入经度，按经度差加均时差修正出生时间。

## 技术栈

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- 历法和命理计算：[tyme4ts](https://github.com/6tail/tyme4ts)（MIT）

## 开发

```bash
npm install
npm run dev       # 本地开发
npm run build     # 类型检查并构建到 dist/
npm run preview   # 预览构建结果
npm test          # 单元测试（vitest）
```

`dist/` 是纯静态文件。推送到 `main` 后，`.github/workflows/pages.yml` 会自动测试、构建并部署到 GitHub Pages；PR 只跑测试和构建，不部署。

## 目录

```
src/
  lib/calendar.ts        月历网格和每日黄历数据
  lib/bazi.ts            八字排盘、大运、流年
  lib/shensha.ts         神煞规则表
  lib/relations.ts       刑冲合会
  lib/solarTime.ts       真太阳时与城市经度
  components/            CalendarView / BaziView
legacy/                  旧版 Express + EJS 实现（仅作参考，lunar.js 已更新为 lunar-javascript 1.7.7）
```

> 命理内容仅供文化参考。
