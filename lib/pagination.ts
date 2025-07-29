export function getCenteredPagination(current: number, total: number) {
  if (total <= 3) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 2) {
    return [1, 2, 3]
  }

  if (current >= total - 1) {
    return [total - 2, total - 1, total]
  }

  return [current - 1, current, current + 1]
}
