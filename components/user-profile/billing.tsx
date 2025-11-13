// components/billing.tsx
"use client"

import React from "react"
import { CreditCard, Calendar, Download } from "lucide-react"

type BillingData = {
  plan: string
  status: string
  nextBilling: string
  amount: string
  paymentMethod?: string
  cardType?: string
}

type Invoice = {
  id: number | string
  date: string
  amount: string
  status: string
}

type Props = {
  billingData: BillingData
  invoices: Invoice[]
}

export default function BillingCard({ billingData, invoices }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Billing</h2>
            <p className="text-xs text-slate-600">Manage your subscription</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{billingData.plan}</h3>
              <p className="text-xs text-slate-600 mt-1">Full access to all features</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              {billingData.status}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <p className="text-xs text-slate-600">Next Billing</p>
              <p className="text-sm font-semibold text-slate-900">{billingData.nextBilling}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Amount</p>
              <p className="text-sm font-semibold text-slate-900">{billingData.amount}/month</p>
            </div>
          </div>

          <button className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 text-sm transition-colors">
            Change Plan
          </button>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900">Payment Method</h4>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Update</button>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="w-10 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{billingData.cardType} ••42</p>
              <p className="text-xs text-slate-600">Expires 12/2026</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Invoices</h4>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">{invoice.date}</p>
                    <p className="text-xs text-slate-600">{invoice.amount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">{invoice.status}</span>
                  <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
