export const formatAiTextToMarkdown = (input: string): string => {
  let formatted = input.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => `[${url}](${url})`
  );

  formatted = formatted.replace(/^\s*\*\s+/gm, "- ");

  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  return formatted.trim();
};
