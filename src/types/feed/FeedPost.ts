import type { FeedFile } from "./FeedFile";
import type { Reaction, ReactionCounts } from "./Reaction";

// Bir iş qeydinin paylaşımı: usta, yer, yazı, faylları (bir kartda), reaksiyalar, şərh sayı, birlikdə işləyən ustalar
export type FeedPost = {
  logId: number;
  employeeId: number; // müəllif (öz paylaşımına reaksiya vermək olmur)
  at: string; // ən son fayl yüklənmə anı (ISO)
  name: string;
  photo: string | null;
  place: string;
  company: string | null;
  description: string;
  files: FeedFile[];
  reactions: ReactionCounts;
  mine: Reaction | null; // mənim reaksiyam
  comments: number;
  partners: string[]; // eyni tapşırıq qrupundakı digər ustalar (ad və soyad)
};
