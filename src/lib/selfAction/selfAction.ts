// Bu brauzerdə edilən əməliyyatın Realtime əks-sədası üçün: öz verdiyin alət üçün ikinci (canlı) tost çıxmasın.
let last = 0;
export const markSelfAction = () => { last = Date.now(); };
export const isSelfAction = () => Date.now() - last < 5000;
