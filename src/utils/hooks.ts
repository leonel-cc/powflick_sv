export async function deleteIfNoRelations<T extends { [key: string]: any }>(
  instance: T,
  relationKey: string,
): Promise<void> {
  const count = await instance.$count(relationKey);
  if (count === 0) {
    await instance.destroy();
  }
}
