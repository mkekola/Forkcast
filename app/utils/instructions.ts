const STEP_LABEL_PATTERN = /^step\s*\d*$/i;

export function parseInstructionSteps(instructions?: string | null): string[] {
  if (!instructions) {
    return [];
  }

  return instructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter((step) => /\p{L}/u.test(step) && !STEP_LABEL_PATTERN.test(step));
}
