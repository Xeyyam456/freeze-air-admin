// useData açarları (lent): brauzer komponentləri və canlı kanal eyni açarlardan istifadə edir
export const FEED_KEY = "feed";
export const COMMENTS_KEY = "feed-comments";
export const LIKERS_KEY = "feed-likers";
export const FEED_KEYS = [FEED_KEY, COMMENTS_KEY, LIKERS_KEY, "feed-unread", "nav-badges"] as const;
// Oxunmamış say (lent tabları) və menyu nişanı: lent hadisəsindən sonra yenilənir
export const UNREAD_KEY = "feed-unread";
