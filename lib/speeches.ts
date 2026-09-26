import type { ChatMessage } from "./types";

export function lastSpeeches(messages: ChatMessage[] = []) {
  const players = new Map<string, string>();
  let octopus = "";
  for (const message of messages) {
    if (message.kind === "player" && message.playerId) {
      players.set(message.playerId, message.text);
    }
    if (message.kind === "octopus") {
      octopus = message.text.replace(/^开局：/, "");
    }
  }
  return { players, octopus };
}
