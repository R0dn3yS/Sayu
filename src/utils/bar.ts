export function progressBar(value: number, maxValue: number, size: number) {
  const percentage = value / maxValue;
  const progress = Math.round((size * percentage));
  const emptyProgress = size - progress;

  const progressText = '▇'.repeat(progress);
  const emptyProgressText = '—'.repeat(emptyProgress);

  const bar = `[${progressText}${emptyProgressText}]`

  return bar;
}