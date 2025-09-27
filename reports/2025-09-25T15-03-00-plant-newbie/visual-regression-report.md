# Visual Regression Report

**Run ID:** plant-newbie  
**Date:** 2025-09-25T15:03:52.136Z  
**Total Screenshots:** 6

## Summary

- ✅ **Passed:** 0
- ❌ **Failed:** 3  
- 📸 **New:** 3

## Detailed Results

| Screenshot | Status | Diff % | Baseline | Current | Diff |
|------------|--------|--------|----------|---------|------|
| 01-01-navigate.png | ⚠️ | 100.00% | [Baseline](01-01-navigate.png) | [Current](01-01-navigate.png) | N/A |
| 02-02-page-loaded.png | ⚠️ | 100.00% | [Baseline](02-02-page-loaded.png) | [Current](02-02-page-loaded.png) | N/A |
| 03-03-page-analysis.png | ⚠️ | 100.00% | [Baseline](03-03-page-analysis.png) | [Current](03-03-page-analysis.png) | N/A |
| 04-04-authentication.png | 📸 | N/A | [Baseline](04-04-authentication.png) | [Current](04-04-authentication.png) | N/A |
| 05-05-task-execution.png | 📸 | N/A | [Baseline](05-05-task-execution.png) | [Current](05-05-task-execution.png) | N/A |
| 06-06-final-state.png | 📸 | N/A | [Baseline](06-06-final-state.png) | [Current](06-06-final-state.png) | N/A |

## Recommendations

⚠️ **3 screenshots have visual differences.** Please review the diff images to determine if changes are intentional or represent UI regressions.

📸 **3 new screenshots added to baseline.** These will be used as the new reference for future comparisons.

## Next Steps

1. **Review Failed Comparisons**: Check diff images for unintended UI changes
2. **Update Baselines**: If changes are intentional, they will automatically become new baselines
3. **Investigate Failures**: Look for patterns in failed comparisons (e.g., timing issues, dynamic content)
4. **Optimize Thresholds**: Adjust diff thresholds if needed for better accuracy

## Technical Details

- **Diff Threshold**: 5% (configurable)
- **Baseline Directory**: `/Users/karthiknaig/houseplant/baselines`
- **Diff Directory**: `/Users/karthiknaig/houseplant/reports/2025-09-25T15-03-00-plant-newbie/diffs`
- **Image Format**: PNG
- **Comparison Algorithm**: Pixelmatch with alpha channel support
