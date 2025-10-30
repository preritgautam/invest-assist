/**
 * Sources and Uses Table Component
 * Reusable table for displaying sources or uses line items
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { History, Edit3 } from "lucide-react"
import type { LineItem } from "./types"
import { EditableCell } from "./editable-cell"
import { calculatePercentage } from "./utils"
import type React from "react"

interface SourcesUsesTableProps {
  title: string
  icon: React.ReactNode
  items: LineItem[]
  showPerUnit?: boolean
  onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void
}

export function SourcesUsesTable({ title, icon, items, showPerUnit = false, onUpdateItem }: SourcesUsesTableProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <CardTitle className="text-sm font-bold text-gray-900">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            <History className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Line Item</TableHead>
                <TableHead className="text-xs font-semibold text-right">$ Amount</TableHead>
                {showPerUnit && <TableHead className="text-xs font-semibold text-right">$/Unit</TableHead>}
                <TableHead className="text-xs font-semibold text-right">% Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium">
                    <EditableCell
                      value={item.item}
                      cellId={`${title}-${item.id}-item`}
                      onUpdate={(value) => onUpdateItem(item.id, "item", value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditableCell
                        value={item.amount}
                        type="currency"
                        cellId={`${title}-${item.id}-amount`}
                        onUpdate={(value) => onUpdateItem(item.id, "amount", Number(value))}
                      />
                      {item.isEdited && <Edit3 className="w-3 h-3 text-blue-500" />}
                    </div>
                  </TableCell>
                  {showPerUnit && (
                    <TableCell className="text-right">
                      {item.perUnit ? (
                        <EditableCell
                          value={item.perUnit}
                          type="currency"
                          cellId={`${title}-${item.id}-perunit`}
                          onUpdate={(value) => onUpdateItem(item.id, "perUnit", Number(value))}
                        />
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-xs text-right">{calculatePercentage(item.amount, total)}%</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-gray-200 font-bold">
                <TableCell className="text-xs font-bold">{title}</TableCell>
                <TableCell className="text-xs font-bold text-right">${total.toLocaleString()}</TableCell>
                {showPerUnit && <TableCell className="text-xs font-bold text-right">-</TableCell>}
                <TableCell className="text-xs font-bold text-right">100.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
