// craco.config.js
function visitRules(rules, mutate) {
  if (!Array.isArray(rules)) return;
  for (const rule of rules) {
    mutate(rule);
    // Handle nested rules (e.g., rule.oneOf or rule.rules)
    if (Array.isArray(rule.oneOf)) visitRules(rule.oneOf, mutate);
    if (Array.isArray(rule.rules)) visitRules(rule.rules, mutate);
  }
}

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      visitRules(webpackConfig.module.rules, (rule) => {
        const loader = rule && (rule.loader || (rule.use && rule.use.loader));
        if (loader && String(loader).includes("source-map-loader")) {
          // Add an exclude for html5-qrcode
          const exclude = rule.exclude
            ? Array.isArray(rule.exclude)
              ? rule.exclude
              : [rule.exclude]
            : [];
          exclude.push(/node_modules[\\/]+html5-qrcode[\\/]/);
          rule.exclude = exclude;
        }
      });
      return webpackConfig;skeletonEvent
    },
  },
};
