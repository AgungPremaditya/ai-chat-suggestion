import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds the 5 MB size limit` },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${timestamp}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('inquiry-attachments')
      .upload(path, file)

    if (uploadError) {
      return NextResponse.json(
        { error: `Failed to upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from('inquiry-attachments')
      .getPublicUrl(path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
