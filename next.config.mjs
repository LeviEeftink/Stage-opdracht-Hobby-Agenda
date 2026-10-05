import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload({
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || '.next',
})
