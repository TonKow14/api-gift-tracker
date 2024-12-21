export function handleFormatBit(
  value: Buffer | number | boolean | undefined | null,
): 0 | 1 | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    // สำหรับ Buffer ที่มาจาก bit(1)
    return value[0] === 1 ? 1 : 0;
  }

  if (typeof value === 'number') {
    return value !== 0 ? 1 : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  // ในกรณีที่ไม่ตรงกับเงื่อนไขใดๆ ข้างต้น ให้ถือว่าเป็น false
  return 0;
}
