import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'data', 'places.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const places = JSON.parse(fileContent)
    res.status(200).json(places)
  } else {
    res.status(200).json([])
  }
}
