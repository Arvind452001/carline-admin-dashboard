import PageLayout from '@/layouts/PageLayout'
import InvoiceTable from '../../components/InvoiceTable'
import { mockInvoices } from '@/shared/utils/mockData'

export default function Invoices() {
  return (
    <PageLayout title="Invoices" description="Invoices issued to companies for platform usage.">
      <InvoiceTable invoices={mockInvoices} />
    </PageLayout>
  )
}
