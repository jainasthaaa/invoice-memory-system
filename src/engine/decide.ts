export function decide(confidence: number): boolean {
  return confidence < 0.75;
}
