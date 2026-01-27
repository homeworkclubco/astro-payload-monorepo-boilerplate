// 1. Define your base steps (The "Fixed" values)
export type SpaceStep =
  | "4xs"
  | "3xs"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

// 2. Define the "Fluid" ranges automatically
// This uses TS Template Literals to create every combination like "sm-lg", "xl-3xl"
export type SpacePair = `${SpaceStep}-${SpaceStep}`;

// 3. The final prop type you use in components
// It accepts a fixed step OR a fluid pair
export type SpaceToken = SpaceStep | SpacePair;
