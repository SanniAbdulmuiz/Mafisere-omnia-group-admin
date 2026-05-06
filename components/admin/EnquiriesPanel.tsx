'use client'

import type { Enquiry } from '@/lib/admin/queries'

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function EnquiriesPanel({ enquiries }: { enquiries: Enquiry[] }) {
  return (
    <div>
      <div className="sec-hdr">
        <span className="sec-title">Customer Enquiries</span>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{enquiries.length} total</span>
      </div>
      <div className="card">
        {enquiries.length === 0 ? (
          <div style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>
            No customer enquiries are connected yet.
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div key={enquiry.id} className="enq-item">
              <div className="enq-top">
                <span className="enq-name">{enquiry.name}</span>
                <span className="enq-time">{timeLabel(enquiry.created_at)}</span>
              </div>
              {enquiry.product_name && <div className="enq-prod">Re: {enquiry.product_name}</div>}
              <div className="enq-msg">{enquiry.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
