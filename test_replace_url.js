let testCases = [
  'http://example.com/api/test',
  'https://example.com/mjapi/data',
  'http://example.com/uploads/image.jpg',
  '/api/users',
  '/mjapi/products',
  '/uploads/photos/photo.jpg',
  '/openapi/docs',
  'https://example.com/api/v1/data',
  'https://example.com/mjapi/v2/info',
  'https://example.com/v2/info',
  '/v2/info',
]

testCases.forEach((url) => {
  const replacedUrl = url.replace(/^(https?:\/\/[^/]+)?\/(api|mjapi|uploads|openapi)(\/.*)?/, 'http://localhost:8080$3')
  console.log(`Original URL: ${url}`)
  console.log(`Replaced URL: ${replacedUrl}`)
  console.log('-------------------------')
})
testCases = [
  'http://example.com/api/test',
  'https://example.com/mjapi/data',
  'http://example.com/uploads/image.jpg',
  '/api/users',
  '/mjapi/products',
  '/uploads/photos/photo.jpg',
  '/openapi/docs',
  'https://example.com/api/v1/data',
  'https://example.com/mjapi/v2/info',
  'https://example.com/mj/info',
  '/mj/info',
]
testCases.forEach((url) => {
  const replacedUrl = url.replace(/^(https?:\/\/[^/]+)?\/(mj)(\/.*)?/, 'https://sqdftauejboz.sealoshzh.site$3')
  console.log(`Original mj URL: ${url}`)
  console.log(`Replaced mj URL: ${replacedUrl}`)
  console.log('-------------------------')
})
