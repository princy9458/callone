export type OptionDefinitionInput = {
  key: string;
  label: string;
  values: string[];
  useForVariants?: boolean;
};

export type VariantCombination = {
  title: string;
  optionValues: Record<string, string>;
};

export function generateVariantCombinations(options: OptionDefinitionInput[]) {
  const variantOptions = options
    .filter((option) => option.useForVariants !== false && option.values.length > 0)
    .map((option) => ({
      ...option,
      values: option.values.filter(Boolean),
    }))
    .filter((option) => option.values.length > 0);

  if (variantOptions.length === 0) {
    return [] as VariantCombination[];
  }

  const combinations = variantOptions.reduce<VariantCombination[]>(
    (accumulator, option) => {
      if (accumulator.length === 0) {
        return option.values.map((value) => ({
          title: value,
          optionValues: {[option.key]: value},
        }));
      }

      return accumulator.flatMap((existing) =>
        option.values.map((value) => {
          const optionValues = {...existing.optionValues, [option.key]: value};
          return {
            title: Object.values(optionValues).join(" / "),
            optionValues,
          };
        })
      );
    },
    []
  );

  return combinations;
}
