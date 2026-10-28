import type { DepotBoardState } from "./DepotBoardState";
import type { DepotView } from "./DepotView";

export type BoardHomeProps = { b: DepotBoardState; onTab: (t: DepotView) => void; onShopping: () => void; onJournal: () => void };
