// Reaksiya növü: 👍 up, 👎 down, ❤️ heart, 👏 clap, 🙏 pray; hər usta/rəhbər bir paylaşıma bir reaksiya verir
export type Reaction = "up" | "down" | "heart" | "clap" | "pray";
// Paylaşımdakı reaksiya sayları (olmayan növ = 0)
export type ReactionCounts = Partial<Record<Reaction, number>>;
