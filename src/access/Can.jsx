import { useHasPermission } from './useHasPermission'

// <Can I="pricing.manage"><EditPricingButton /></Can>
export default function Can({ I, children, fallback = null }) {
  const allowed = useHasPermission(I)
  return allowed ? children : fallback
}
