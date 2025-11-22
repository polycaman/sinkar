function generateCss(config: any, themeId: string): string {
  const Themes = (window as any).SinkarGenerators.Themes;
  const theme = Themes[themeId] || Themes['writer'];
  return theme.generateCss(config);
}

(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.generateCss = generateCss;
