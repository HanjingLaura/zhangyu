export type SceneLine = {
  name: string;
  text: string;
  quote?: string;
  image?: boolean;
};

export const OFFICE_SCENE: SceneLine[] = [
  {
    name: "Cora.(孔维佳)",
    text: "一鸣惊人 / 人山人海 / 海阔天空 / 空前绝后 / 后来居上 / 上下一心 / 心胸开阔",
  },
  { name: "Cora.(孔维佳)", text: "看呐这文化底蕴" },
  { name: "Cora.(孔维佳)", text: "成语接龙" },
  { name: "可能是77 (Jilly)", text: "看吓着", image: true },
  { name: "Cora.(孔维佳)", text: "这是我一年级的时候背的" },
  { name: "Cora.(孔维佳)", text: "我们小学当时让背100成语接龙" },
  { name: "Lauraura", text: "？" },
  { name: "Amberter", text: "现在能不能玩一下" },
  { name: "Amberter", text: "成语接龙" },
  { name: "Amberter", text: "从龙开始" },
  { name: "Cora.(孔维佳)", text: "龙年大吉" },
  { name: "Amberter", text: "？" },
  { name: "可能是77 (Jilly)", text: "？" },
  { name: "Lauraura", text: "我服了" },
  { name: "Amberter", text: "这也叫成语" },
  { name: "Cora.(孔维佳)", text: "对呀" },
  { name: "可能是77 (Jilly)", text: "鸡年大吉", quote: "Cora：龙年大吉" },
  { name: "Lauraura", text: "咱们能四个人玩吗" },
  { name: "Cora.(孔维佳)", text: "龙飞凤舞" },
  { name: "Cora.(孔维佳)", text: "开始啊" },
  { name: "Amberter", text: "查了吧", quote: "Cora：龙飞凤舞" },
  { name: "Lauraura", text: "舞动青春", quote: "Cora：龙飞凤舞" },
  { name: "Cora.(孔维佳)", text: "这是广播体操" },
  { name: "Cora.(孔维佳)", text: "少骗人" },
  { name: "Cora.(孔维佳)", text: "春天来了" },
  { name: "Amberter", text: "???", quote: "Cora：春天来了" },
  { name: "可能是77 (Jilly)", text: "大姐们" },
  { name: "可能是77 (Jilly)", text: "有点文化行吗" },
  { name: "Cora.(孔维佳)", text: "接不上就输吧" },
  { name: "可能是77 (Jilly)", text: "了如指掌" },
  { name: "Cora.(孔维佳)", text: "掌上明珠" },
  { name: "可能是77 (Jilly)", text: "猪年大吉", quote: "Cora：掌上明珠" },
  { name: "Amberter", text: "很难想象周年的时候" },
  { name: "Cora.(孔维佳)", text: "吉祥三宝" },
  { name: "Cora.(孔维佳)", text: "一鸣惊人 人山人海 海阔天空 空前绝后 后来居上 上下一心" },
  { name: "Lauraura", text: "我都不敢看聊天记录了" },
];

export const DEFAULT_NAMES = [
  "Cora",
  "Amberter",
  "Jilly",
  "Lauraura",
];
