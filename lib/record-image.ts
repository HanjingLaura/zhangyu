import { buildRecordPoster, wrapChain, type RecordPoster } from "./record";
import type { RoomSnapshot } from "./types";

const CSS_W = 750;
const DPR = 2;
const PAD = 40;
const INNER = CSS_W - PAD * 2;
const CREAM = "#f7f1de";
const INK = "#16343c";
const GOLD = "#e8d48a";
const FOAM = "#f4f7f2";
const CORAL = "#e0603a";
const PANEL = "#0c4a5c";
const MUTED = "rgba(244,247,242,0.58)";
const SANS = '"Noto Sans SC", "WenQuanYi Micro Hei", "PingFang SC", sans-serif';
const DISPLAY = '"ZCOOL XiaoWei", "Songti SC", serif';

function round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  round(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (line && ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function sectionHeight(poster: RecordPoster, ctx: CanvasRenderingContext2D) {
  ctx.font = `24px ${SANS}`;
  const chainRows = wrapChain(poster.chain.length ? poster.chain : ["还没接上"], INNER - 48, 24, (word) =>
    ctx.measureText(word).width,
  );
  const chainH = 58 + chainRows.length * 62 + 20;
  ctx.font = `22px ${SANS}`;
  const danmakuItems = poster.danmaku.length ? poster.danmaku : [{ name: "", text: "这局没人发弹幕" }];
  const danmakuH =
    58 +
    16 +
    danmakuItems.reduce((sum, item) => {
      const label = item.name ? `${item.name}：${item.text}` : item.text;
      return sum + wrapText(ctx, label, INNER - 64).length * 34 + 22;
    }, 0);
  const scoreH = 58 + poster.scores.length * 44 + 18;
  return { chainH, danmakuH, scoreH, chainRows };
}

export function renderRecordImage(room: RoomSnapshot) {
  const poster = buildRecordPoster(room);
  if (!poster) throw new Error("还没开始。");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("导出失败");

  ctx.font = `22px ${SANS}`;
  const { chainH, danmakuH, scoreH, chainRows } = sectionHeight(poster, ctx);
  const titleH = poster.titles ? 132 : 0;
  const height = 168 + titleH + 16 + chainH + 16 + danmakuH + 16 + scoreH + 72;

  canvas.width = CSS_W * DPR;
  canvas.height = height * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#0d6a82");
  bg.addColorStop(0.42, "#063044");
  bg.addColorStop(1, "#041e28");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CSS_W, height);

  ctx.fillStyle = "rgba(232,212,138,0.12)";
  ctx.beginPath();
  ctx.arc(80, 40, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CSS_W - 40, height - 40, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = GOLD;
  ctx.font = `28px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.fillText("章鱼哥接龙", CSS_W / 2, 62);
  ctx.fillStyle = FOAM;
  ctx.font = `22px ${DISPLAY}`;
  ctx.fillText("结算长图", CSS_W / 2, 96);
  ctx.fillStyle = MUTED;
  ctx.font = `18px ${SANS}`;
  ctx.fillText(`房间 ${poster.code}  ·  ${poster.mode}  ·  共 ${poster.rounds} 轮`, CSS_W / 2, 128);

  let y = 156;
  if (poster.titles) {
    const cardW = (INNER - 16) / 2;
    drawTitleCard(ctx, PAD, y, cardW, 116, "最丈育", poster.titles.zhangyu, poster.titles.zhangyuNote, CORAL);
    drawTitleCard(
      ctx,
      PAD + cardW + 16,
      y,
      cardW,
      116,
      "最有文化",
      poster.titles.culture,
      poster.titles.cultureNote,
      GOLD,
    );
    y += 132;
  }

  y = drawChain(ctx, y, chainH, chainRows);
  y = drawDanmaku(ctx, y, danmakuH, poster);
  y = drawScores(ctx, y, scoreH, poster);

  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = `16px ${SANS}`;
  ctx.fillText("章鱼哥接龙 · 接龙和弹幕", CSS_W / 2, height - 28);

  return canvas;
}

function drawTitleCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  name: string,
  note: string,
  accent: string,
) {
  fillRound(ctx, x, y, w, h, 22, PANEL);
  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = `16px ${SANS}`;
  ctx.fillText(label, x + w / 2, y + 32);
  ctx.fillStyle = FOAM;
  ctx.font = `32px ${DISPLAY}`;
  ctx.fillText(truncate(ctx, name, w - 28), x + w / 2, y + 74);
  if (note) {
    ctx.fillStyle = MUTED;
    ctx.font = `14px ${SANS}`;
    ctx.fillText(truncate(ctx, note, w - 28), x + w / 2, y + 98);
  }
}

function drawChain(ctx: CanvasRenderingContext2D, y: number, h: number, rows: string[][]) {
  fillRound(ctx, PAD, y, INNER, h, 24, CREAM);
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `20px ${SANS}`;
  ctx.fillText("接龙", PAD + 24, y + 38);

  let rowY = y + 58;
  for (const row of rows) {
    let x = PAD + 24;
    row.forEach((word, index) => {
      ctx.font = `24px ${SANS}`;
      const chipW = ctx.measureText(word).width + 28;
      fillRound(ctx, x, rowY, chipW, 46, 14, "#fff");
      ctx.strokeStyle = "rgba(22,52,60,0.1)";
      ctx.lineWidth = 1;
      round(ctx, x, rowY, chipW, 46, 14);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.textAlign = "center";
      ctx.fillText(word, x + chipW / 2, rowY + 31);
      x += chipW;
      if (index < row.length - 1) {
        ctx.fillStyle = "rgba(22,52,60,0.4)";
        ctx.font = `22px ${SANS}`;
        ctx.fillText("→", x + 14, rowY + 31);
        x += 28;
      }
    });
    rowY += 62;
  }
  return y + h + 16;
}

function drawDanmaku(ctx: CanvasRenderingContext2D, y: number, h: number, poster: RecordPoster) {
  fillRound(ctx, PAD, y, INNER, h, 24, PANEL);
  ctx.textAlign = "left";
  ctx.fillStyle = GOLD;
  ctx.font = `20px ${SANS}`;
  ctx.fillText("弹幕", PAD + 24, y + 38);

  let lineY = y + 58;
  const items = poster.danmaku.length ? poster.danmaku : [{ name: "", text: "这局没人发弹幕" }];
  for (const item of items) {
    const label = item.name ? `${item.name}：${item.text}` : item.text;
    ctx.font = `22px ${SANS}`;
    const lines = wrapText(ctx, label, INNER - 64);
    fillRound(ctx, PAD + 16, lineY, INNER - 32, lines.length * 34 + 12, 14, "rgba(0,0,0,0.18)");
    lines.forEach((line, index) => {
      ctx.fillStyle = item.name ? FOAM : MUTED;
      ctx.textAlign = "left";
      ctx.fillText(line, PAD + 28, lineY + 30 + index * 34);
    });
    lineY += lines.length * 34 + 22;
  }
  return y + h + 16;
}

function drawScores(ctx: CanvasRenderingContext2D, y: number, h: number, poster: RecordPoster) {
  fillRound(ctx, PAD, y, INNER, h, 24, "rgba(247,241,222,0.12)");
  ctx.textAlign = "left";
  ctx.fillStyle = GOLD;
  ctx.font = `20px ${SANS}`;
  ctx.fillText("分数", PAD + 24, y + 38);

  poster.scores.forEach((player, index) => {
    const rowY = y + 58 + index * 44;
    ctx.fillStyle = FOAM;
    ctx.font = `22px ${SANS}`;
    ctx.textAlign = "left";
    ctx.fillText(`${player.rank}. ${player.name}`, PAD + 24, rowY + 28);
    ctx.textAlign = "right";
    ctx.fillStyle = GOLD;
    ctx.font = `22px ${DISPLAY}`;
    ctx.fillText(`+${player.shells}`, PAD + INNER - 24, rowY + 28);
  });
  return y + h + 16;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadRecordImage(room: RoomSnapshot) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
  const canvas = renderRecordImage(room);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (blob) {
    saveBlob(blob, `zhangyu-${room.code}.png`);
    return;
  }
  const href = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = href;
  link.download = `zhangyu-${room.code}.png`;
  link.click();
}
