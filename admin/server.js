import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import admin from 'firebase-admin'

const localCredentialCandidates = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  path.resolve(process.cwd(), 'service-account.json'),
  path.resolve(process.cwd(), 'firebase-service-account.json'),
].filter(Boolean)

const credentialPath = localCredentialCandidates.find((candidate) =>
  fs.existsSync(candidate),
)

if (!credentialPath) {
  throw new Error(
    'Firebase admin credential file not found. Put your downloaded service-account JSON in admin/service-account.json, or set GOOGLE_APPLICATION_CREDENTIALS to its full path.',
  )
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()
const app = express()
const port = Number(process.env.ADMIN_API_PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/api/visit', async (request, response) => {
  try {
    const body = request.body || {}
    const forwardedFor = request.headers['x-forwarded-for']
    const requestIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.ip

    await db.collection('portfolio_visits').add({
      ipAddress: body.ipAddress || requestIp || 'unknown',
      locationId: body.locationId || 'location unavailable',
      locationStatus: body.locationStatus || 'unavailable',
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      pagePath: body.pagePath || '/',
      referrer: body.referrer || 'direct',
      userAgent: body.userAgent || request.get('user-agent') || 'unknown',
      screenSize: body.screenSize || 'unknown',
      source: 'portfolio',
      visitedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    response.json({ ok: true })
  } catch (error) {
    console.error('Failed to store visit:', error)
    response.status(500).json({
      ok: false,
      error: error?.message || 'Failed to store visit',
    })
  }
})

app.get('/api/visits', async (_request, response) => {
  try {
    const snapshot = await db
      .collection('portfolio_visits')
      .orderBy('visitedAt', 'desc')
      .limit(200)
      .get()

    response.json({
      visits: snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      })),
    })
  } catch (error) {
    console.error('Failed to read visits:', error)
    response.status(500).json({
      ok: false,
      error: error?.message || 'Failed to read visits',
    })
  }
})

app.listen(port, () => {
  console.log(`Visitor API listening on http://localhost:${port}`)
})