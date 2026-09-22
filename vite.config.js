import { generateQrCodes } from './scripts/generate-qr-codes.js'

export default {
  plugins: [
    {
      name: 'generate-repository-qr-codes',
      async buildStart() {
        await generateQrCodes()
      },
    },
  ],
}
