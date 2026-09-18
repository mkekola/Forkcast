export function parseInstructionSteps(instructions?: string | null): string[] {
  if (!instructions) {
    return [];
  }

  return instructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter((step) => /\p{L}/u.test(step));
}
