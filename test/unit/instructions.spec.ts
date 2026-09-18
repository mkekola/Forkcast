import { describe, expect, it } from "vitest";
import { parseInstructionSteps } from "../../app/utils/instructions";

describe("parseInstructionSteps", () => {
  it("splits multi-line instructions into trimmed steps", () => {
    expect(parseInstructionSteps("Whisk the flour.\nBake for 20 minutes.")).toEqual([
      "Whisk the flour.",
      "Bake for 20 minutes.",
    ]);
  });

  it("drops stray lines that contain no letters, such as leftover step numbers", () => {
    expect(
      parseInstructionSteps("1. Whisk the flour.\n2\n3. Bake for 20 minutes.\n4"),
    ).toEqual(["1. Whisk the flour.", "3. Bake for 20 minutes."]);
  });

  it("drops lines made only of symbols, such as stray checkbox markers", () => {
    expect(parseInstructionSteps("Prepare the figs.\n☐\n•\nCut them in half.")).toEqual([
      "Prepare the figs.",
      "Cut them in half.",
    ]);
  });

  it("drops standalone 'step N' label lines left over from the source formatting", () => {
    expect(
      parseInstructionSteps(
        "step 1\r\nHeat the oven to 190C.\r\n\r\nstep 2\r\nRoast for 20 mins.",
      ),
    ).toEqual(["Heat the oven to 190C.", "Roast for 20 mins."]);
  });

  it("keeps real steps that merely start with the word 'step'", () => {
    expect(parseInstructionSteps("Step back and let the dough rest for 5 minutes.")).toEqual([
      "Step back and let the dough rest for 5 minutes.",
    ]);
  });

  it("drops empty and whitespace-only lines", () => {
    expect(parseInstructionSteps("Whisk the flour.\n\n   \nBake for 20 minutes.")).toEqual([
      "Whisk the flour.",
      "Bake for 20 minutes.",
    ]);
  });

  it("returns an empty array when there are no instructions", () => {
    expect(parseInstructionSteps(null)).toEqual([]);
    expect(parseInstructionSteps(undefined)).toEqual([]);
    expect(parseInstructionSteps("")).toEqual([]);
  });
});
