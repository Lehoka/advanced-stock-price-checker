export interface GetFinnhubQuoteResponse {
  c: number; // current price
  d: number | null; // change in price
  dp: number | null; // change in percentage
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp of the quote
}
