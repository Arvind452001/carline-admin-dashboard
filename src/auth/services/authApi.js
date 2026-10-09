import { ROLES } from '@/access/roles'
import { normalizeRole, toBackendRole, unsupportedRoleMessage } from '@/access/roleMap'
import { apiClient } from '@/shared/services/apiClient'
import * as superAdminApi from '@/roles/super-admin/services/superAdminApi'

const TOKEN_KEYS = ['token', 'accessToken', 'access_token', 'jwt']

function pickToken(source) {
  for (const key of TOKEN_KEYS) {
    const value = source?.[key]
    if (typeof value === 'string' && value) return value
  }
  return null
}

// Builds the session the app stores from a live login response. The account's
// real role wins over the portal the user picked, so nobody is ever sent to a
// panel their role cannot open.
export function toPanelSession({ user, role, token }) {
  const slug = normalizeRole(role)
  if (!slug) throw new Error(unsupportedRoleMessage(role))

  return {
    user: { ...user, id: user?.id || user?._id || '', role: slug },
    role: slug,
    token: token ?? null,
  }
}

// POST /super-admin/login — Super Admin only. The token sits inside userData.
async function superAdminLogin({ email, password }) {
  if (!email || !password) throw new Error('Enter an email and password to continue.')

  const { token, user } = await superAdminApi.login({ email, password })

  const slug = normalizeRole(user?.role) || ROLES.SUPER_ADMIN
  const name =
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    user: {
      ...(user || {}),
      id: user?.id || user?._id || email,
      name,
      email: user?.email || email,
      role: slug,
    },
    role: slug,
    token,
  }
}

// POST /auth/login — every role except Super Admin. A company owner signs in
// here with the temporary password the system emails when a Super Admin
// registers their company. The Auth endpoint returns the user object directly
// in `data`, with the JWT alongside it: { _id, name, email, role, token }.
async function roleLogin({ email, password, slug }) {
  if (!email || !password) throw new Error('Enter an email and password to continue.')

  const backendRole = toBackendRole(slug)
  const data = await apiClient.post('/auth/login', {
    email,
    password,
    ...(backendRole ? { role: backendRole } : {}),
  })

  const user = data && typeof data === 'object' ? { ...data } : {}
  const token = pickToken(user)
  delete user.token

  if (!token) {
    const fields = Object.keys(user).join(', ') || '(none)'
    throw new Error(`Signed in but no token was returned. User fields: ${fields}`)
  }

  // The account role comes back from the API, not from the picked portal pill.
  return toPanelSession({ user, role: data?.role || data?.roles, token })
}

export async function loginRequest({ email, password, role }) {
  const slug = normalizeRole(role)
  if (!slug) throw new Error(unsupportedRoleMessage(role))

  if (slug === ROLES.SUPER_ADMIN) return superAdminLogin({ email, password })

  return roleLogin({ email, password, slug })
}

// --- Password reset ------------------------------------------------------
//
// A company owner is emailed a temporary password when a Super Admin registers
// their company. They replace it with this three-call flow:
//
//   1. POST  /user/forgot-password  -> emails a 6-digit OTP
//   2. POST  /auth/verify-otp       -> proves the OTP before the reset is allowed
//   3. PATCH /user/reset-password   -> stores the new password
//
// The server marks the account verified in step 2 and expects that mark to
// still be set in step 3, so the calls must run in this order.

// The OTP purpose. `VerifyOtpDto.type` accepts `verify` (account confirmation)
// or `password` (this reset flow); anything else is rejected by the API's
// validation pipe with an empty 400. The code emailed by /user/forgot-password
// is issued for `password`, so it has to be verified with the same value.
const OTP_TYPE = 'password'

export function requestPasswordOtp(email) {
  return apiClient.post('/user/forgot-password', { email })
}

export function verifyPasswordOtp({ email, otp }) {
  return apiClient.post('/auth/verify-otp', { email, otp, type: OTP_TYPE })
}

export function resendPasswordOtp(email) {
  return apiClient.post('/auth/resend-otp', { email })
}

export function resetPassword({ email, password, confirmPassword }) {
  return apiClient.patch('/user/reset-password', { email, password, confirmPassword })
}
