export class PromptEngine {
  buildPlan({ category, spaceType, goalId, changeLevelId, styleId, colorId, reference, specialRequests }) {
    return {
      basePrompt: "PLACEHOLDER_NOT_FOR_PRODUCTION",
      category,
      spaceType,
      goalId,
      changeLevelId,
      styleId: styleId || null,
      colorInstruction: colorId || null,
      reference: reference || null,
      specialRequests: specialRequests || null,
      preservationRules: "PLACEHOLDER_GEOMETRY_AND_CAMERA_RULES",
      photorealismRules: "PLACEHOLDER_PHOTOREALISM_RULES",
      negativeConstraints: "PLACEHOLDER_NEGATIVE_CONSTRAINTS"
    };
  }
}
