import idiomRows from "@/data/idioms.json";
import { buildIndex } from "./idioms";
import type { IdiomRow } from "./types";

export const idiomIndex = buildIndex(idiomRows as IdiomRow[]);
