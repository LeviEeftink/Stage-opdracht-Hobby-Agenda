export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await response.json()
  if (!response.ok) {
    const message =
      data.errors?.[0]?.data?.errors?.[0]?.message || data.errors?.[0]?.message
    throw new Error(
      typeof message === 'string'
        ? message
        : 'De wijziging kon niet worden opgeslagen. Probeer opnieuw.',
    )
  }
  return data as T
}
