function generateJs(config: any, themeId: string, preloadedArticles: any[] = null): string {
  const Themes = (window as any).SinkarGenerators.Themes;
  const theme = Themes[themeId] || Themes['writer'];
  return theme.generateJs(config, preloadedArticles);
}

(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.generateJs = generateJs;
