export interface OcrItem {
  name: string
  price: number
  quantity: number
}

export interface OcrResult {
  storeName: string
  date: string
  items: OcrItem[]
  total: number
}

export async function processReceipt(_imageBase64: string): Promise<OcrResult> {
  // Mock OCR result - real implementation would use Naver Clova OCR or Google Vision
  return {
    storeName: '이마트 성수점',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: '유기농 우유 1L', price: 3200, quantity: 1 },
      { name: '신선한 계란 15구', price: 5900, quantity: 1 },
      { name: '양파 망 1.5kg', price: 2980, quantity: 1 },
      { name: '삼겹살 500g', price: 12900, quantity: 1 },
      { name: '두부 1모', price: 1500, quantity: 1 },
    ],
    total: 26480,
  }
}
