import type { DepotBoardState } from "./DepotBoardState";
import type { DepotTab } from "./DepotTab";
import type { DepotView } from "./DepotView";

export type BoardHeaderProps = { b: DepotBoardState; tab: DepotTab; onTab: (t: DepotView) => void };
